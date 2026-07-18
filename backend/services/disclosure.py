import os
import json
import config
from services.provenance import get_provenance_log


def generate_disclosure_views(report_id: str) -> dict:
    """
    :param report_id: ID of the generated report to compile views for.
    :return: A dict containing donor, public, and internal HTML pages.
    """
    report_file = config.reports_dir / f"{report_id}.json"
    if not os.path.exists(report_file):
        raise FileNotFoundError(f"Report ID {report_id} does not exist")

    with open(report_file, "r", encoding="utf-8") as f:
        report_data = json.load(f)

    spans = report_data.get("spans", [])
    content = report_data.get("content", "")

    # styling
    base_style = """
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #1e293b;
            background-color: #f8fafc;
            line-height: 1.6;
            margin: 0;
            padding: 24px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            padding: 32px;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
            border: 1px solid #e2e8f0;
        }
        h1 {
            color: #0f172a;
            font-size: 24px;
            margin-bottom: 24px;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 12px;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 16px;
        }
        .badge-public { background-color: #dcfce7; color: #15803d; }
        .badge-donor { background-color: #dbeafe; color: #1d4ed8; }
        .badge-internal { background-color: #f1f5f9; color: #475569; }
        .report-content {
            font-size: 16px;
            color: #334155;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #cbd5e1;
            margin-bottom: 24px;
        }
        .span-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }
        .span-table th, .span-table td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
        }
        .span-table th {
            background-color: #f8fafc;
            color: #64748b;
            font-weight: 600;
        }
    </style>
    """

    # public view
    public_view = f"""
    <!DOCTYPE html>
    <html>
    <head>
        {base_style}
    </head>
    <body>
        <div class="container">
            <span class="badge badge-public">Public Transparency Record</span>
            <h1>Aiga Verification Report</h1>
            <p>This report has been reviewed for factual correctness. Every claim is traced directly to its primary source.</p>
            <div class="report-content">{content}</div>
            <p>Verified source citations tracked: <strong>{len(spans)} statements</strong>.</p>
        </div>
    </body>
    </html>
    """

    # donor view
    table_rows = ""
    for s in spans:
        table_rows += f"""
        <tr>
            <td><strong>{s['span_id']}</strong></td>
            <td>{s['text']}</td>
            <td><code>{s['source_chunk']}</code></td>
        </tr>
        """

    donor_view = f"""
    <!DOCTYPE html>
    <html>
    <head>
        {base_style}
    </head>
    <body>
        <div class="container">
            <span class="badge badge-donor">Donor Verification Report</span>
            <h1>Aiga Audited Draft</h1>
            <div class="report-content">{content}</div>
            <h2>Provenance Matrix</h2>
            <table class="span-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Verified Claim</th>
                        <th>Source Reference</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    """

    # internal view
    internal_view = f"""
    <!DOCTYPE html>
    <html>
    <head>
        {base_style}
    </head>
    <body>
        <div class="container">
            <span class="badge badge-internal">Internal Audit Log</span>
            <h1>System Configuration & Parameters</h1>
            <table class="span-table">
                <tr><th>Report ID</th><td>{report_id}</td></tr>
                <tr><th>Embedding Model</th><td>{config.embed_model_name}</td></tr>
                <tr><th>Offline LLM</th><td>{config.offline_llm_name}</td></tr>
                <tr><th>Consistency Threshold</th><td>{config.consistency_threshold}</td></tr>
            </table>
            <h2>Original Draft & Spans</h2>
            <div class="report-content">{content}</div>
            <table class="span-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Text Span</th>
                        <th>Source Reference</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    """

    return {
        "report_id": report_id,
        "donor_view": donor_view.strip(),
        "public_view": public_view.strip(),
        "internal_view": internal_view.strip(),
    }
