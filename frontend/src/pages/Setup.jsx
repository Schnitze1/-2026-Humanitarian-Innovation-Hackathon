import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import WorkflowSteps from "../components/layout/WorkflowSteps";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { createClient, listClients, ApiError } from "../api/client";
import {
  AUDIENCES,
  DATASET_TOPICS,
  NGO_PROFILES,
  REPORT_TYPES,
} from "../constants/catalogs";
import { useReport } from "../context/ReportContext";
import "../styles/setup.css";

function Setup() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setup, updateSetup } = useReport();

  const [clientMode, setClientMode] = useState(
    setup.clientId ? "existing" : "new"
  );
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    programName: setup.programName || "",
    clientId: setup.clientId || "",
    clientName: setup.clientName || "",
    primaryProfile: setup.primaryProfile || setup.ngoSector || "",
    datasetTopic: setup.datasetTopic || "",
    analysisObjective: setup.analysisObjective || "",
    reportType: setup.reportType || "",
    audience: setup.audience || "",
    geographicContext: setup.geographicContext || "",
  });

  const loadClients = () => {
    setClientsLoading(true);
    setClientsError(null);
    listClients()
      .then((data) => {
        setClients(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        const message =
          err instanceof ApiError
            ? err.message
            : "Could not load clients from the API.";
        setClientsError(
          `${message} Ensure Docker Postgres is running (docker-compose up -d) and the backend is up.`
        );
      })
      .finally(() => setClientsLoading(false));
  };

  useEffect(() => {
    loadClients();
  }, []);

  const selectedClient = clients.find((c) => c.id === form.clientId);

  const profileOptions =
    clientMode === "existing" && selectedClient?.ngo_profiles?.length
      ? NGO_PROFILES.filter((p) =>
          selectedClient.ngo_profiles.includes(p.value)
        )
      : NGO_PROFILES;

  const topicOptions =
    clientMode === "existing" && selectedClient?.dataset_topics?.length
      ? selectedClient.dataset_topics
      : DATASET_TOPICS;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const errors = {};
    if (!form.programName.trim()) errors.programName = "Program name is required.";
    if (clientMode === "new" && !form.clientName.trim()) {
      errors.clientName = "NGO / client name is required.";
    }
    if (clientMode === "existing" && !form.clientId) {
      errors.clientId = "Select an existing client.";
    }
    if (!form.primaryProfile) {
      errors.primaryProfile = "Select an NGO sector / profile.";
    }
    if (!form.datasetTopic) {
      errors.datasetTopic = "Select a dataset topic.";
    }
    if (!form.reportType) errors.reportType = "Select a report type.";
    if (!form.audience) errors.audience = "Select an audience.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      let clientId = form.clientId;
      let clientName = form.clientName;

      if (clientMode === "new") {
        // Persist client in Postgres so ingest can link client_id + dataset_topic
        const created = await createClient({
          name: form.clientName.trim(),
          ngoProfiles: [form.primaryProfile],
          datasetTopics: [form.datasetTopic],
        });
        clientId = created.id;
        clientName = created.name;
      } else if (selectedClient) {
        clientName = selectedClient.name;
      }

      updateSetup({
        programName: form.programName.trim(),
        clientId,
        clientName,
        primaryProfile: form.primaryProfile,
        ngoSector: form.primaryProfile,
        datasetTopic: form.datasetTopic,
        analysisObjective: form.analysisObjective.trim(),
        reportType: form.reportType,
        audience: form.audience,
        geographicContext: form.geographicContext.trim(),
      });

      navigate("/upload");
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : "Failed to save setup. Check that Postgres and the API are running."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <WorkflowSteps currentPath={pathname} />
      <PageHeader
        eyebrow="Step 1"
        title="Report setup"
        description="Configure the program context. Client and topic details are stored in Postgres so later upload and drafting stay linked."
      />

      {clientsLoading ? (
        <Card>
          <LoadingState label="Loading clients from the API…" />
        </Card>
      ) : clientsError ? (
        <ErrorState
          title="Cannot reach client registry"
          message={clientsError}
          onRetry={loadClients}
        />
      ) : (
        <Card>
          <p className="setup-note">
            Fields marked local stay in the browser only. Analysis objective and
            geographic context are not sent to the API yet.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid form-grid--two">
              <div className="form-field form-field--full">
                <label htmlFor="programName">Program name</label>
                <input
                  id="programName"
                  value={form.programName}
                  onChange={(e) => setField("programName", e.target.value)}
                  placeholder="e.g. Water Access — Rift Valley"
                  autoComplete="off"
                />
                {fieldErrors.programName ? (
                  <p className="field-error">{fieldErrors.programName}</p>
                ) : (
                  <p className="hint">
                    Sent to the API as <code>program_name</code> on upload.
                  </p>
                )}
              </div>

              <div className="form-field form-field--full">
                <span id="client-mode-label">NGO client</span>
                <div
                  className="client-mode"
                  role="group"
                  aria-labelledby="client-mode-label"
                >
                  <label
                    className={`client-mode__option${
                      clientMode === "new" ? " is-active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="clientMode"
                      checked={clientMode === "new"}
                      onChange={() => {
                        setClientMode("new");
                        setField("clientId", "");
                      }}
                    />
                    Create new client
                  </label>
                  <label
                    className={`client-mode__option${
                      clientMode === "existing" ? " is-active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="clientMode"
                      checked={clientMode === "existing"}
                      onChange={() => setClientMode("existing")}
                      disabled={clients.length === 0}
                    />
                    Use existing client
                    {clients.length === 0 ? " (none yet)" : ""}
                  </label>
                </div>
              </div>

              {clientMode === "new" ? (
                <div className="form-field form-field--full">
                  <label htmlFor="clientName">NGO / organisation name</label>
                  <input
                    id="clientName"
                    value={form.clientName}
                    onChange={(e) => setField("clientName", e.target.value)}
                    placeholder="Organisation registered in Postgres"
                  />
                  {fieldErrors.clientName ? (
                    <p className="field-error">{fieldErrors.clientName}</p>
                  ) : (
                    <p className="hint">
                      Creates a row via <code>POST /api/clients</code>.
                    </p>
                  )}
                </div>
              ) : (
                <div className="form-field form-field--full">
                  <label htmlFor="clientId">Select client</label>
                  <select
                    id="clientId"
                    value={form.clientId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const match = clients.find((c) => c.id === id);
                      setForm((prev) => ({
                        ...prev,
                        clientId: id,
                        clientName: match?.name || "",
                        primaryProfile: "",
                        datasetTopic: "",
                      }));
                    }}
                  >
                    <option value="">Choose a client…</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.clientId ? (
                    <p className="field-error">{fieldErrors.clientId}</p>
                  ) : null}
                </div>
              )}

              <div className="form-field">
                <label htmlFor="primaryProfile">NGO sector / profile</label>
                <select
                  id="primaryProfile"
                  value={form.primaryProfile}
                  onChange={(e) => setField("primaryProfile", e.target.value)}
                >
                  <option value="">Select sector…</option>
                  {profileOptions.map((profile) => (
                    <option key={profile.value} value={profile.value}>
                      {profile.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.primaryProfile ? (
                  <p className="field-error">{fieldErrors.primaryProfile}</p>
                ) : (
                  <p className="hint">
                    Stored on the client and sent later as{" "}
                    <code>primary_profile</code> when drafting.
                  </p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="datasetTopic">Dataset topic</label>
                <select
                  id="datasetTopic"
                  value={form.datasetTopic}
                  onChange={(e) => setField("datasetTopic", e.target.value)}
                >
                  <option value="">Select topic…</option>
                  {topicOptions.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
                {fieldErrors.datasetTopic ? (
                  <p className="field-error">{fieldErrors.datasetTopic}</p>
                ) : (
                  <p className="hint">
                    Sent with upload as <code>dataset_topic</code> (with{" "}
                    <code>client_id</code>) to link the dataset row.
                  </p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="reportType">Report type</label>
                <select
                  id="reportType"
                  value={form.reportType}
                  onChange={(e) => setField("reportType", e.target.value)}
                >
                  <option value="">Select type…</option>
                  {REPORT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.reportType ? (
                  <p className="field-error">{fieldErrors.reportType}</p>
                ) : (
                  <p className="hint">
                    Sent as <code>report_type</code> when generating a draft.
                  </p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="audience">Audience</label>
                <select
                  id="audience"
                  value={form.audience}
                  onChange={(e) => setField("audience", e.target.value)}
                >
                  <option value="">Select audience…</option>
                  {AUDIENCES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.audience ? (
                  <p className="field-error">{fieldErrors.audience}</p>
                ) : (
                  <p className="hint">
                    Sent as <code>audience</code> when generating a draft.
                  </p>
                )}
              </div>

              <div className="form-field form-field--full">
                <label htmlFor="analysisObjective">Analysis objective</label>
                <textarea
                  id="analysisObjective"
                  value={form.analysisObjective}
                  onChange={(e) =>
                    setField("analysisObjective", e.target.value)
                  }
                  placeholder="What should this report help the team understand or communicate?"
                />
                <p className="hint hint--local">
                  Local only — not sent to the API yet.
                </p>
              </div>

              <div className="form-field form-field--full">
                <label htmlFor="geographicContext">Geographic context</label>
                <input
                  id="geographicContext"
                  value={form.geographicContext}
                  onChange={(e) =>
                    setField("geographicContext", e.target.value)
                  }
                  placeholder="e.g. Eastern Rift Valley, Kenya"
                />
                <p className="hint hint--local">
                  Local only — not sent to the API yet.
                </p>
              </div>
            </div>

            {formError ? (
              <div style={{ marginTop: "1.25rem" }}>
                <ErrorState title="Could not continue" message={formError} />
              </div>
            ) : null}

            <div className="form-actions">
              <Button type="submit" variant="accent" disabled={submitting}>
                {submitting ? "Saving…" : "Continue to upload"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
}

export default Setup;
