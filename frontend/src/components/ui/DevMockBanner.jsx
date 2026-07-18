/**
 * Visible only when a page intentionally uses isolated mock data
 * (e.g. recent reports on the welcome screen). Never used for API failures.
 */
function DevMockBanner({ message = "Showing mock data for demonstration" }) {
  return (
    <div className="dev-mock-banner" role="status">
      <strong>Development mode</strong>
      <span>{message}</span>
    </div>
  );
}

export default DevMockBanner;
