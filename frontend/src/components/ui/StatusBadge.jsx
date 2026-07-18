const STATUS_LABELS = {
  verified: "Verified",
  warning: "Warning",
  review: "Review required",
};

function StatusBadge({ status = "verified", children }) {
  const label = children || STATUS_LABELS[status] || status;

  return (
    <span className={`status-badge status-badge--${status}`}>{label}</span>
  );
}

export default StatusBadge;
export { STATUS_LABELS };
