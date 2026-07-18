import StatusBadge from "../ui/StatusBadge";

const ISSUE_LABELS = {
  numeric_mismatch: "Numeric mismatch",
  unsupported_claim: "Unsupported claim",
};

function claimStatus(flag) {
  if (!flag) return "verified";
  if (flag.issue === "numeric_mismatch") return "warning";
  return "review";
}

function ClaimCard({ span, flag, selected, onSelect }) {
  const status = claimStatus(flag);

  return (
    <button
      type="button"
      className={`claim-card claim-card--${status}${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(span.span_id)}
      aria-pressed={selected}
    >
      <div className="claim-card__header">
        <span className="claim-card__id">{span.span_id}</span>
        <StatusBadge status={status} />
      </div>
      <p className="claim-card__text">{span.text}</p>
      {flag ? (
        <p className="claim-card__issue">
          {ISSUE_LABELS[flag.issue] || flag.issue}
        </p>
      ) : null}
    </button>
  );
}

export default ClaimCard;
export { claimStatus, ISSUE_LABELS };
