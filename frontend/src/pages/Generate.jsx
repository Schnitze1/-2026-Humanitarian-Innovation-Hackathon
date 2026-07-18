import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import Button from "../components/ui/Button";
import { useReport } from "../context/ReportContext";
import { generateDraft, ApiError } from "../api/client";

function Generate() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setup, sourceId, setDraftResult } = useReport();

  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);
  const hasTriggered = useRef(false);

  const setupReady = Boolean(
    setup.programName && setup.clientId && setup.datasetTopic
  );

  const startGeneration = async () => {
    if (!sourceId || !setupReady) {
      setStatus("error");
      setErrorMessage("Missing source data or setup context. Please return to the Setup or Upload steps.");
      return;
    }

    setStatus("generating");
    setErrorMessage(null);

    try {
      const result = await generateDraft(sourceId, {
        reportType: setup.reportType,
        audience: setup.audience,
        primaryProfile: setup.primaryProfile,
      });

      setDraftResult({
        report_id: result.report_id,
        content: result.content,
        spans: result.spans,
      });

      navigate("/review");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : "Generation failed. Ensure the LLM pipeline is responding."
      );
    }
  };

  useEffect(() => {
    if (!hasTriggered.current) {
      hasTriggered.current = true;
      startGeneration();
    }
  }, []);

  return (
    <>

      <PageHeader
        eyebrow="Step 3"
        title="Draft generation"
        description="The backend LLM is drafting your report based on the uploaded sources and client guidelines."
      />
      <Card>
        {status === "generating" ? (
          <LoadingState
            label="Generating AI draft"
            steps={[
              "Retrieving indexed source chunks",
              "Drafting content aligned with NGO guidelines",
              "Attaching provenance spans",
            ]}
          />
        ) : status === "error" ? (
          <>
            <ErrorState title="Generation Blocked" message={errorMessage} />
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Button onClick={() => startGeneration()} variant="primary">Retry Generation</Button>
              <Button onClick={() => navigate("/upload")} variant="secondary">Go back</Button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Ready to generate.</p>
            <Button onClick={() => startGeneration()} variant="primary">Start</Button>
          </div>
        )}
      </Card>
    </>
  );
}

export default Generate;
