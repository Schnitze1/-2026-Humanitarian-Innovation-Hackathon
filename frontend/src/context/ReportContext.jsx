import { createContext, useContext, useState } from "react";

const INITIAL_SETUP = {
  programName: "",
  ngoSector: "",
  datasetTopic: "",
  analysisObjective: "",
  reportType: "",
  audience: "",
  geographicContext: "",
  primaryProfile: "",
  clientId: "",
  clientName: "",
};

const ReportContext = createContext(null);

export function ReportProvider({ children }) {
  const [setup, setSetup] = useState(INITIAL_SETUP);
  const [sourceId, setSourceId] = useState(null);
  const [chunksIndexed, setChunksIndexed] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [draftContent, setDraftContent] = useState(null);
  const [spans, setSpans] = useState([]);

  const updateSetup = (partial) => {
    setSetup((prev) => ({ ...prev, ...partial }));
  };

  const setIngestResult = ({ source_id, chunks_indexed, fileName }) => {
    setSourceId(source_id);
    setChunksIndexed(chunks_indexed);
    setUploadedFileName(fileName ?? null);
    // New source invalidates any previous draft/report
    setReportId(null);
    setDraftContent(null);
    setSpans([]);
  };

  const setDraftResult = ({ report_id, content, spans: nextSpans }) => {
    setReportId(report_id);
    setDraftContent(content);
    setSpans(Array.isArray(nextSpans) ? nextSpans : []);
  };

  const resetWorkflow = () => {
    setSetup(INITIAL_SETUP);
    setSourceId(null);
    setChunksIndexed(null);
    setUploadedFileName(null);
    setReportId(null);
    setDraftContent(null);
    setSpans([]);
  };

  const value = {
    setup,
    updateSetup,
    sourceId,
    chunksIndexed,
    uploadedFileName,
    reportId,
    draftContent,
    spans,
    setIngestResult,
    setDraftResult,
    resetWorkflow,
    hasSource: Boolean(sourceId),
    hasReport: Boolean(reportId),
  };

  return (
    <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
  );
}

export function useReport() {
  const ctx = useContext(ReportContext);
  if (!ctx) {
    throw new Error("useReport must be used within a ReportProvider");
  }
  return ctx;
}
