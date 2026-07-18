import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import WorkflowSteps from "../components/layout/WorkflowSteps";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { ApiError, generateDraft } from "../api/client";
import { AUDIENCES, REPORT_TYPES } from "../constants/catalogs";
import { useReport } from "../context/ReportContext";
import "../styles/generate.css";

function labelFor(options, value) {
  return options.find((o) => o.value === value)?.label || value || "—";
}

function Generate() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {
    setup,
    sourceId,
    reportId,
    draftContent,
    spans,
    setDraftResult,
  } = useReport();

  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMessage, setErrorMessage] = useState(null);

  const draftReady = Boolean(
    setup.reportType && setup.audience && sourceId
  );

  const handleGenerate = async () => {
    setErrorMessage(null);

    if (!sourceId) {
      setStatus("error");
      setErrorMessage("Upload and index a source file before generating a draft.");
      return;
    }

    if (!setup.reportType || !setup.audience) {
      setStatus("error");
      setErrorMessage(
        "Report type and audience from Setup are required for /api/draft."
      );
      return;
    }

    setStatus("loading");
    try {
      // Matches DraftRequest: report_type, audience, optional primary_profile
      const result = await generateDraft(sourceId, {
        reportType: setup.reportType,
        audience: setup.audience,
        primaryProfile: setup.primaryProfile || undefined,
      });

      setDraftResult({
        report_id: result.report_id,
        content: result.content,
        spans: result.spans,
      });
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : "Draft generation failed. Check that the backend is running."
      );
    }
  };

  return (
    <>
      <WorkflowSteps currentPath={pathname} />
      <PageHeader
        eyebrow="Step 3"
        title="Draft generation"
        description="Generate a source-grounded report. The backend uses your ingested source plus optional NGO profile and dataset topic from Postgres."
      />

      {!sourceId ? (
        <Card>
          <ErrorState
            title="Source required"
            message="Complete Setup and Upload first so a source_id exists for POST /api/draft/{source_id}."
          />
          <div className="generate-actions">
            <Link to="/upload" className="btn btn--accent">
              Go to upload
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <ul className="generate-context">
            <li>
              <strong>source_id:</strong> <code>{sourceId}</code>
            </li>
            <li>
              <strong>Program:</strong> {setup.programName || "—"}
            </li>
            <li>
              <strong>Report type:</strong>{" "}
              {labelFor(REPORT_TYPES, setup.reportType)}
            </li>
            <li>
              <strong>Audience:</strong> {labelFor(AUDIENCES, setup.audience)}
            </li>
            <li>
              <strong>Primary profile:</strong>{" "}
              {setup.primaryProfile || "general (server default)"}
            </li>
            <li>
              <strong>Dataset topic:</strong>{" "}
              {setup.datasetTopic || "General Context"}
            </li>
          </ul>

          {status === "loading" ? (
            <LoadingState
              label="Generating report…"
              steps={[
                "Retrieve similar source chunks",
                "Draft content for report type and audience",
                "Attach provenance spans (span_id, source_chunk)",
              ]}
            />
          ) : (
            <>
              {status === "error" && errorMessage ? (
                <ErrorState title="Generation failed" message={errorMessage} />
              ) : null}

              {reportId && draftContent != null ? (
                <div className="draft-panel">
                  <h2 className="draft-panel__title">Generated draft</h2>
                  <ul className="draft-meta">
                    <li>
                      <strong>report_id:</strong> <code>{reportId}</code>
                    </li>
                    <li>
                      <strong>spans:</strong> {spans.length}
                    </li>
                  </ul>
                  <pre className="draft-content">{draftContent}</pre>

                  {spans.length > 0 ? (
                    <div className="draft-spans">
                      <h2 className="draft-panel__title">Provenance spans</h2>
                      <ul className="draft-spans__list">
                        {spans.map((span) => (
                          <li key={span.span_id} className="draft-spans__item">
                            <span className="span-id">{span.span_id}</span>
                            <p>{span.text}</p>
                            <p>
                              <strong>source_chunk:</strong>{" "}
                              <code>{span.source_chunk}</code>
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="generate-actions">
                <Button
                  type="button"
                  variant="accent"
                  onClick={handleGenerate}
                  disabled={!draftReady || status === "loading"}
                >
                  {reportId ? "Regenerate draft" : "Generate report"}
                </Button>
                {reportId ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => navigate("/review")}
                  >
                    Continue to review
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
}

export default Generate;
