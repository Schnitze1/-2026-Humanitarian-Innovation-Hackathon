const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export const ACCEPTED_EXTENSIONS = [".txt", ".csv", ".md"];
export const ACCEPTED_ACCEPT_ATTR = ".txt,.csv,.md,text/plain,text/csv,text/markdown";
export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function parseError(response) {
  let message = `Request failed (${response.status})`;
  let details;

  try {
    const body = await response.json();
    if (typeof body?.detail === "string") {
      message = body.detail;
    } else if (body?.detail) {
      message = "Validation error";
      details = body.detail;
    }
    if (body?.errors) {
      details = body.errors;
    }
  } catch {
    // Non-JSON error body — keep status message
  }

  return new ApiError(message, { status: response.status, details });
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new ApiError(
      "Unable to reach the Aiga API. Is the backend running on port 8000?"
    );
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/** GET /health */
export function checkHealth() {
  return request("/health");
}

/** POST /api/clients — { name, custom_guidelines, ngo_profiles, dataset_topics } */
export function createClient({ name, customGuidelines, ngoProfiles, datasetTopics }) {
  return request("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      custom_guidelines: customGuidelines || null,
      ngo_profiles: ngoProfiles,
      dataset_topics: datasetTopics,
    }),
  });
}

/** GET /api/clients — list all clients (requires Postgres) */
export function listClients() {
  return request("/api/clients");
}

/** GET /api/clients/{client_id} */
export function getClient(clientId) {
  return request(`/api/clients/${encodeURIComponent(clientId)}`);
}

/**
 * POST /api/ingest
 * Multipart file + optional query params matching FastAPI signature.
 */
export function ingestFile(file, { programName, clientId, datasetTopic } = {}) {
  const params = new URLSearchParams();
  if (programName) params.set("program_name", programName);
  if (clientId) params.set("client_id", clientId);
  if (datasetTopic) params.set("dataset_topic", datasetTopic);

  const query = params.toString();
  const path = query ? `/api/ingest?${query}` : "/api/ingest";

  const formData = new FormData();
  formData.append("file", file);

  return request(path, {
    method: "POST",
    body: formData,
  });
}

/**
 * POST /api/draft/{source_id}
 * Body: { report_type, audience, primary_profile? }
 */
export function generateDraft(sourceId, { reportType, audience, primaryProfile }) {
  const body = {
    report_type: reportType,
    audience,
  };
  if (primaryProfile) {
    body.primary_profile = primaryProfile;
  }

  return request(`/api/draft/${encodeURIComponent(sourceId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** GET /api/provenance/{report_id} */
export function getProvenance(reportId) {
  return request(`/api/provenance/${encodeURIComponent(reportId)}`);
}

/** POST /api/consistency-check/{report_id} */
export function checkConsistency(reportId) {
  return request(`/api/consistency-check/${encodeURIComponent(reportId)}`, {
    method: "POST",
  });
}

/** GET /api/disclosure/{report_id} */
export function getDisclosure(reportId) {
  return request(`/api/disclosure/${encodeURIComponent(reportId)}`);
}

export function isAcceptedUpload(file) {
  if (!file?.name) return false;
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export { API_BASE_URL };
