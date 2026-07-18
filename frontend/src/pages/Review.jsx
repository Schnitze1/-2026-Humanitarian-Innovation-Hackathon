import { useLocation, useNavigate, Navigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import { useReport } from "../context/ReportContext";

function Review() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { draftContent, spans, reportId, uploadedFileName } = useReport();

  if (!reportId || !draftContent) {
    return <Navigate to="/generate" replace />;
  }

  const generateHighlightedMarkdown = () => {
    if (!draftContent) return "";
    let markdown = draftContent;
    const sortedSpans = [...(spans || [])].sort((a, b) => b.text.length - a.text.length);

    sortedSpans.forEach(span => {
      if (span.text && markdown.includes(span.text)) {
        const cleanVisualText = span.text.replace(/\s*\[src_[a-fA-F0-9\-]+#c\d+\]/g, "");
        const chunkId = span.source_chunk || span.source_chunk_id || "Unknown";

        markdown = markdown.split(span.text).join(
          `[${cleanVisualText}](#verified:${chunkId} "File: ${uploadedFileName || 'Source Data'} | Ref: ${chunkId}")`
        );
      }
    });

    return markdown;
  };

  const highlightedContent = generateHighlightedMarkdown();

  return (
    <>

      <PageHeader
        eyebrow="Step 4"
        title="Review & Verify"
        description="Review the AI-generated draft against your raw sources and verify the citation spans."
      />
      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "1fr" }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem" }}>
            <h3 style={{ margin: 0 }}>Generated Draft</h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <StatusBadge status="verified" />
              <StatusBadge status={spans?.length > 0 ? "review" : "warning"} />
            </div>
          </div>

          <div className="markdown-body" style={{ lineHeight: "1.8", color: "var(--color-text)", fontSize: "1.05rem" }}>
            <ReactMarkdown
              components={{
                a: ({ href, title, children }) => {
                  if (href?.startsWith("#verified:")) {
                    const chunkRef = decodeURIComponent(href.split(":")[1]);
                    const tooltipData = title ? title.split(" | ") : ["File: Unknown", `Ref: ${chunkRef}`];
                    const docInfo = tooltipData[0].replace("File: ", "");
                    const spanObj = spans?.find(s => s.source_chunk === chunkRef || s.source_chunk_id === chunkRef);
                    const accuracy = spanObj?.accuracy !== undefined ? spanObj.accuracy : "N/A";
                    const isWarning = accuracy !== "N/A" && accuracy < 80;
                    const markBg = isWarning ? "var(--color-warning-bg)" : "var(--color-verified-bg)";
                    const markColor = isWarning ? "var(--color-warning)" : "var(--color-verified)";
                    const tooltipClass = isWarning ? "custom-tooltip-content warning-tooltip" : "custom-tooltip-content verified-tooltip";

                    return (
                      <span className="custom-tooltip-container">
                        <mark
                          style={{ backgroundColor: markBg, color: markColor, padding: "0.1rem 0.25rem", borderRadius: "4px", margin: "0 0.1rem" }}
                        >
                          {children}
                        </mark>
                        <span className={tooltipClass} style={{ minWidth: "220px", maxWidth: "300px" }}>
                          <strong>Document:</strong> {docInfo}<br />
                          <strong style={{ display: "block", marginTop: "0.5rem" }}>Source Alignment Score:</strong>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.3rem" }}>
                            <div style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.2)", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                              {accuracy !== "N/A" && (
                                <div style={{ width: `${accuracy}%`, height: "100%", backgroundColor: isWarning ? "#f59e0b" : "#4ade80" }} />
                              )}
                            </div>
                            <span style={{ fontWeight: 600, color: "#fff" }}>{accuracy}%</span>
                          </div>
                        </span>
                      </span>
                    );
                  }
                  return <a href={href} title={title}>{children}</a>;
                }
              }}
            >
              {highlightedContent}
            </ReactMarkdown>
          </div>

          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <Button variant="secondary" onClick={() => navigate("/generate")}>Regenerate Draft</Button>
            <Button variant="primary" onClick={() => navigate("/disclosure")}>Approve & Continue</Button>
          </div>
        </Card>
      </div>
    </>
  );
}

export default Review;
