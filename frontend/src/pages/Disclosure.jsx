import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import WorkflowSteps from "../components/layout/WorkflowSteps";
import DisclosureTabs from "../components/disclosure/DisclosureTabs";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { ApiError, getDisclosure } from "../api/client";
import { useReport } from "../context/ReportContext";
import "../styles/disclosure.css";

function Disclosure() {
  const { pathname } = useLocation();
  const { reportId, sourceId, setup } = useReport();

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("donor_view");
  const [reloadToken, setReloadToken] = useState(0);
  const [views, setViews] = useState({
    donor_view: "",
    public_view: "",
    internal_view: "",
  });

  useEffect(() => {
    if (!reportId) return;

    let cancelled = false;
    setStatus("loading");
    setErrorMessage(null);

    getDisclosure(reportId)
      .then((data) => {
        if (cancelled) return;
        setViews({
          donor_view: data.donor_view || "",
          public_view: data.public_view || "",
          internal_view: data.internal_view || "",
        });
        setStatus("idle");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(
          err instanceof ApiError
            ? err.message
            : "Could not load disclosure views."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [reportId, reloadToken]);

  if (!reportId) {
    return (
      <>
        <WorkflowSteps currentPath={pathname} />
        <PageHeader
          eyebrow="Step 5"
          title="Disclosure"
          description="Preview donor, community (public), and internal HTML views from the API."
          actions={
            <Button variant="secondary" disabled>
              Export unavailable
            </Button>
          }
        />
        <Card>
          <ErrorState
            title="Report required"
            message="Generate a draft first so a report_id exists for GET /api/disclosure/{report_id}."
          />
          <div className="disclosure-actions">
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
        eyebrow="Step 5"
        title="Disclosure"
        description="Backend returns donor_view, public_view (community-facing), and internal_view as HTML strings. There is no export endpoint yet."
        actions={
          <Button
            variant="secondary"
            disabled
            title="No export API on the backend"
          >
            Export unavailable
          </Button>
        }
      />

      <Card>
        <p className="disclosure-meta">
          <strong>report_id:</strong> <code>{reportId}</code>
          {sourceId ? (
            <>
              {" "}
              · <strong>source_id:</strong> <code>{sourceId}</code>
            </>
          ) : null}
        </p>

        {status === "loading" ? (
          <LoadingState
            label="Loading disclosure views…"
            steps={["GET /api/disclosure/{report_id}", "Render HTML previews"]}
          />
        ) : null}

        {status === "error" ? (
          <ErrorState
            title="Disclosure unavailable"
            message={errorMessage}
            onRetry={() => setReloadToken((n) => n + 1)}
          />
        ) : null}

        {status === "idle" ? (
          <>
            <DisclosureTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              views={views}
            />

            <section
              className="disclosure-transparency"
              aria-labelledby="transparency-heading"
            >
              <h2 id="transparency-heading">AI use &amp; source transparency</h2>
              <p>
                This disclosure was produced with Aiga using retrieval-augmented
                drafting over your uploaded sources. Claims are linked to
                provenance spans (<code>source_chunk</code>) where available.
              </p>
              <p>
                Program: <strong>{setup.programName || "—"}</strong>
                {" · "}
                Audience: <strong>{setup.audience || "—"}</strong>
                {" · "}
                Profile: <strong>{setup.primaryProfile || "—"}</strong>
                {" · "}
                Topic: <strong>{setup.datasetTopic || "—"}</strong>
              </p>
              <p>
                Donor view includes fuller citation detail; the community
                (public) view is a plainer summary; internal view exposes draft
                configuration context. Export to downloadable files is not
                supported by the API yet.
              </p>
            </section>

            <div className="disclosure-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setReloadToken((n) => n + 1)}
              >
                Refresh disclosure
              </Button>
              <Link to="/review" className="btn btn--ghost">
                Back to review
              </Link>
            </div>
          </>
        ) : null}
      </Card>
    </>
  );
}

export default Disclosure;
