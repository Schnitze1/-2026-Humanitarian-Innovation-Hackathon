import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import WorkflowSteps from "../components/layout/WorkflowSteps";
import ClaimCard, { claimStatus } from "../components/review/ClaimCard";
import ProvenancePanel from "../components/review/ProvenancePanel";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { ApiError, checkConsistency, getProvenance } from "../api/client";
import { useReport } from "../context/ReportContext";
import "../styles/review.css";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "verified", label: "Verified" },
  { id: "needs_review", label: "Needs review" },
];

function Review() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { reportId } = useReport();

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);
  const [spans, setSpans] = useState([]);
  const [flags, setFlags] = useState([]);
  const [consistent, setConsistent] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedSpanId, setSelectedSpanId] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!reportId) return;

    let cancelled = false;
    setStatus("loading");
    setErrorMessage(null);

    Promise.all([getProvenance(reportId), checkConsistency(reportId)])
      .then(([provenance, consistency]) => {
        if (cancelled) return;
        const nextSpans = Array.isArray(provenance.spans) ? provenance.spans : [];
        const nextFlags = Array.isArray(consistency.flags) ? consistency.flags : [];
        setSpans(nextSpans);
        setFlags(nextFlags);
        setConsistent(Boolean(consistency.consistent));
        setSelectedSpanId(nextSpans[0]?.span_id ?? null);
        setStatus("idle");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(
          err instanceof ApiError
            ? err.message
            : "Could not load provenance or consistency results."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [reportId, reloadToken]);

  const flagsBySpan = flags.reduce((acc, flag) => {
    acc[flag.span_id] = flag;
    return acc;
  }, {});

  const flaggedCount = spans.filter((span) => flagsBySpan[span.span_id]).length;

  const filteredSpans = spans.filter((span) => {
    const statusKey = claimStatus(flagsBySpan[span.span_id]);
    if (filter === "verified") return statusKey === "verified";
    if (filter === "needs_review") return statusKey !== "verified";
    return true;
  });

  const selectedSpan =
    spans.find((span) => span.span_id === selectedSpanId) || null;
  const selectedFlag = selectedSpan
    ? flagsBySpan[selectedSpan.span_id] || null
    : null;

  if (!reportId) {
    return (
      <>
        <WorkflowSteps currentPath={pathname} />
        <PageHeader
          eyebrow="Step 4"
          title="Review"
          description="Inspect claims, provenance spans, and consistency flags from the backend."
        />
        <Card>
          <ErrorState
            title="Report required"
            message="Generate a draft first so a report_id exists for provenance and consistency endpoints."
          />
          <div className="review-actions">
            <Link to="/generate" className="btn btn--accent">
              Go to generate
            </Link>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <WorkflowSteps currentPath={pathname} />
      <PageHeader
        eyebrow="Step 4"
        title="Review"
        description="Claims come from provenance spans. Status is derived from consistency flags (numeric_mismatch, unsupported_claim)."
      />

      <Card>
        {status === "loading" ? (
          <LoadingState
            label="Loading review data…"
            steps={[
              "GET /api/provenance/{report_id}",
              "POST /api/consistency-check/{report_id}",
              "Merge spans with flags",
            ]}
          />
        ) : null}

        {status === "error" ? (
          <ErrorState
            title="Review data unavailable"
            message={errorMessage}
            onRetry={() => setReloadToken((n) => n + 1)}
          />
        ) : null}

        {status === "idle" ? (
          <>
            <div className="review-toolbar">
              <ul className="review-counts">
                <li>
                  Total claims: <strong>{spans.length}</strong>
                </li>
                <li>
                  Flagged claims: <strong>{flaggedCount}</strong>
                </li>
                <li>
                  consistent:{" "}
                  <strong>{consistent == null ? "—" : String(consistent)}</strong>
                </li>
              </ul>
              <div className="review-filters" role="group" aria-label="Claim filters">
                {FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`review-filters__btn${
                      filter === item.id ? " is-active" : ""
                    }`}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredSpans.length === 0 ? (
              <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
                No claims match this filter.
              </p>
            ) : (
              <div className="review-layout">
                <ul className="claim-list">
                  {filteredSpans.map((span) => (
                    <li key={span.span_id}>
                      <ClaimCard
                        span={span}
                        flag={flagsBySpan[span.span_id]}
                        selected={span.span_id === selectedSpanId}
                        onSelect={setSelectedSpanId}
                      />
                    </li>
                  ))}
                </ul>
                <ProvenancePanel span={selectedSpan} flag={selectedFlag} />
              </div>
            )}

            <div className="review-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setReloadToken((n) => n + 1)}
              >
                Refresh review
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => navigate("/disclosure")}
              >
                Continue to disclosure
              </Button>
            </div>
          </>
        ) : null}
      </Card>
    </>
  );
}

export default Review;
