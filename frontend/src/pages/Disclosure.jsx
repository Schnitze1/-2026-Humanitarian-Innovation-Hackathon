import { useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PageHeader from "../components/layout/PageHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useReport } from "../context/ReportContext";
import { getDisclosure } from "../api/client";

function Disclosure() {
  const { pathname } = useLocation();
  const { reportId } = useReport();
  const [views, setViews] = useState(null);
  const [activeTab, setActiveTab] = useState("donor_view");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reportId) return;

    const fetchDisclosure = async () => {
      try {
        const data = await getDisclosure(reportId);
        setViews(data);
      } catch (err) {
        setError(err.details || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDisclosure();
  }, [reportId]);

  if (!reportId) {
    return <Navigate to="/" replace />;
  }

  const handleExport = () => {
    if (!views) return;

    const extractBody = (html) => {
      const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      return match ? match[1] : html;
    };

    const styleMatch = views.donor_view.match(/<style[^>]*>([\s\S]*)<\/style>/i);
    const style = styleMatch ? styleMatch[0] : "";

    const combinedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Aiga - Exported Views</title>
        ${style}
        <style>
          @media print {
            .page-break { page-break-after: always; }
            body { background-color: #fff; }
            .container { box-shadow: none; border: none; padding: 0; margin: 0; }
          }
        </style>
      </head>
      <body>
        ${extractBody(views.donor_view)}
        <div class="page-break"></div>
        ${extractBody(views.public_view)}
        <div class="page-break"></div>
        ${extractBody(views.internal_view)}
      </body>
      </html>
    `;

    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'absolute';
    printIframe.style.width = '0px';
    printIframe.style.height = '0px';
    printIframe.style.border = 'none';
    document.body.appendChild(printIframe);

    printIframe.contentDocument.open();
    printIframe.contentDocument.write(combinedHtml);
    printIframe.contentDocument.close();

    printIframe.onload = () => {
      printIframe.contentWindow.focus();
      printIframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(printIframe), 1000);
    };
  };

  const handleStartNew = () => {
    window.location.href = "/";
  };

  return (
    <>

      <PageHeader
        eyebrow="Step 5"
        title="Disclosure & Export"
        description="Preview how the verified report will appear to different stakeholders before final export."
        actions={
          <div style={{ display: "flex", gap: "1rem" }}>
            <Button variant="secondary" onClick={handleStartNew}>
              Start New Application
            </Button>
            <Button variant="primary" disabled={loading || !!error} onClick={handleExport}>
              Export All Views (PDF)
            </Button>
          </div>
        }
      />

      <Card>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
            Generating disclosure templates...
          </div>
        ) : error ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-review)" }}>
            Error: {error}
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
              <button
                onClick={() => setActiveTab("donor_view")}
                style={{
                  background: "none", border: "none", padding: "0.5rem 0", cursor: "pointer", fontSize: "0.95rem",
                  fontWeight: activeTab === "donor_view" ? "600" : "400",
                  borderBottom: activeTab === "donor_view" ? "2px solid var(--color-navy)" : "2px solid transparent",
                  color: activeTab === "donor_view" ? "var(--color-navy)" : "var(--color-text-muted)",
                  marginBottom: "-9px"
                }}
              >
                Donor Verification Report
              </button>
              <button
                onClick={() => setActiveTab("public_view")}
                style={{
                  background: "none", border: "none", padding: "0.5rem 0", cursor: "pointer", fontSize: "0.95rem",
                  fontWeight: activeTab === "public_view" ? "600" : "400",
                  borderBottom: activeTab === "public_view" ? "2px solid var(--color-navy)" : "2px solid transparent",
                  color: activeTab === "public_view" ? "var(--color-navy)" : "var(--color-text-muted)",
                  marginBottom: "-9px"
                }}
              >
                Public Transparency Record
              </button>
              <button
                onClick={() => setActiveTab("internal_view")}
                style={{
                  background: "none", border: "none", padding: "0.5rem 0", cursor: "pointer", fontSize: "0.95rem",
                  fontWeight: activeTab === "internal_view" ? "600" : "400",
                  borderBottom: activeTab === "internal_view" ? "2px solid var(--color-navy)" : "2px solid transparent",
                  color: activeTab === "internal_view" ? "var(--color-navy)" : "var(--color-text-muted)",
                  marginBottom: "-9px"
                }}
              >
                Internal Audit Log
              </button>
            </div>

            <div style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              height: "65vh",
              minHeight: "500px",
              backgroundColor: "#f8fafc"
            }}>
              {views && views[activeTab] && (
                <iframe
                  srcDoc={views[activeTab]}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title={`${activeTab} iframe`}
                />
              )}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}

export default Disclosure;
