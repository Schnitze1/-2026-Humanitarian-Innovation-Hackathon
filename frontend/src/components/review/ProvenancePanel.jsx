import { ISSUE_LABELS } from "./ClaimCard";

function ProvenancePanel({ span, flag }) {
  if (!span) {
    return (
      <div className="provenance-panel provenance-panel--empty">
        <p>Select a claim to inspect its provenance.</p>
      </div>
    );
  }

  return (
    <aside className="provenance-panel" aria-label="Provenance detail">
      <h2 className="provenance-panel__title">Provenance</h2>
      <dl className="provenance-panel__dl">
        <div>
          <dt>span_id</dt>
          <dd>
            <code>{span.span_id}</code>
          </dd>
        </div>
        <div>
          <dt>Claim text</dt>
          <dd>{span.text}</dd>
        </div>
        <div>
          <dt>source_chunk</dt>
          <dd>
            <code>{span.source_chunk}</code>
          </dd>
        </div>
      </dl>

      {flag ? (
        <div className="provenance-panel__flag">
          <h3>Consistency flag</h3>
          <dl className="provenance-panel__dl">
            <div>
              <dt>issue</dt>
              <dd>{ISSUE_LABELS[flag.issue] || flag.issue}</dd>
            </div>
            <div>
              <dt>claim</dt>
              <dd>{flag.claim}</dd>
            </div>
            {flag.source_value != null && flag.source_value !== "" ? (
              <div>
                <dt>source_value</dt>
                <dd>{flag.source_value}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : (
        <p className="provenance-panel__ok">
          No consistency flag for this span — treated as verified.
        </p>
      )}
    </aside>
  );
}

export default ProvenancePanel;
