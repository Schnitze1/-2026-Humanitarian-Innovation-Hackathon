import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import WorkflowSteps from "../components/layout/WorkflowSteps";
import FileDropzone from "../components/ingest/FileDropzone";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { ApiError, ingestFile, isAcceptedUpload } from "../api/client";
import { useReport } from "../context/ReportContext";
import "../styles/upload.css";

function Upload() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {
    setup,
    sourceId,
    chunksIndexed,
    uploadedFileName,
    setIngestResult,
  } = useReport();

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | uploading | error
  const [errorMessage, setErrorMessage] = useState(null);

  const setupReady = Boolean(
    setup.programName && setup.clientId && setup.datasetTopic
  );

  const handleUpload = async () => {
    setErrorMessage(null);

    if (!setupReady) {
      setStatus("error");
      setErrorMessage(
        "Complete report setup first so program name, client, and dataset topic can be sent with the upload."
      );
      return;
    }

    if (!file) {
      setStatus("error");
      setErrorMessage("Choose a source file before uploading.");
      return;
    }

    if (!isAcceptedUpload(file)) {
      setStatus("error");
      setErrorMessage("Only .txt, .csv, and .md files are accepted.");
      return;
    }

    setStatus("uploading");
    try {
      const result = await ingestFile(file, {
        programName: setup.programName,
        clientId: setup.clientId,
        datasetTopic: setup.datasetTopic,
      });

      setIngestResult({
        source_id: result.source_id,
        chunks_indexed: result.chunks_indexed,
        fileName: file.name,
      });
      setStatus("idle");
      setFile(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : "Upload failed. Check that the backend is running."
      );
    }
  };

  return (
    <>
      <WorkflowSteps currentPath={pathname} />
      <PageHeader
        eyebrow="Step 2"
        title="Source upload"
        description="Upload evidence the report must stay grounded in. Accepted types match the backend: .txt, .csv, and .md."
      />

      {!setupReady ? (
        <Card>
          <ErrorState
            title="Setup required"
            message="Program name, client, and dataset topic from Setup are needed so ingest can create the Postgres dataset link (client_id + dataset_topic)."
          />
          <div className="upload-actions">
            <Link to="/setup" className="btn btn--accent">
              Go to report setup
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <ul className="upload-context">
            <li>
              <strong>Program:</strong> {setup.programName}
            </li>
            <li>
              <strong>Client:</strong> {setup.clientName || setup.clientId}
            </li>
            <li>
              <strong>Topic:</strong> {setup.datasetTopic}
            </li>
          </ul>

          {sourceId ? (
            <div className="upload-success" role="status">
              <h2 className="upload-success__title">Source indexed</h2>
              <ul className="upload-success__meta">
                <li>
                  <strong>source_id:</strong> <code>{sourceId}</code>
                </li>
                <li>
                  <strong>chunks_indexed:</strong> {chunksIndexed}
                </li>
                {uploadedFileName ? (
                  <li>
                    <strong>file:</strong> {uploadedFileName}
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}

          {status === "uploading" ? (
            <LoadingState
              label="Indexing source file…"
              steps={[
                "Upload file to /api/ingest",
                "Parse and chunk content",
                "Store embeddings and return source_id",
              ]}
            />
          ) : (
            <>
              <FileDropzone
                selectedFile={file}
                onFileSelected={(next) => {
                  setFile(next);
                  setErrorMessage(null);
                  setStatus("idle");
                }}
                disabled={status === "uploading"}
              />

              {status === "error" && errorMessage ? (
                <ErrorState title="Upload failed" message={errorMessage} />
              ) : null}

              <div className="upload-actions">
                <Button
                  type="button"
                  variant="accent"
                  onClick={handleUpload}
                  disabled={!file || status === "uploading"}
                >
                  Upload and index
                </Button>
                {sourceId ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => navigate("/generate")}
                  >
                    Continue to generate
                  </Button>
                ) : null}
                {sourceId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setFile(null);
                      setErrorMessage(null);
                      setStatus("idle");
                    }}
                  >
                    Replace with another file
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

export default Upload;
