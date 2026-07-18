import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useReport } from "../../context/ReportContext";
import logo from "../../assets/logo.svg";

const NAV_STEPS = [
  { step: 1, to: "/setup", label: "Setup" },
  { step: 2, to: "/upload", label: "Upload" },
  { step: 3, to: "/generate", label: "Generate" },
  { step: 4, to: "/review", label: "Review" },
  { step: 5, to: "/disclosure", label: "Disclosure" },
];

function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setup, sourceId, reportId } = useReport();
  const setupReady = Boolean(setup.programName && setup.clientId && setup.datasetTopic);

  let maxStep = 1;
  if (setupReady) maxStep = 2;
  if (sourceId) maxStep = 3;
  if (reportId) maxStep = 5;

  const currentNav = NAV_STEPS.find((n) => pathname.startsWith(n.to));
  const currentStep = currentNav ? currentNav.step : 0;

  useEffect(() => {
    document.title = currentNav ? `Aiga | ${currentNav.label}` : "Aiga | Home";
  }, [currentNav]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="app-brand" style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <img src={logo} alt="Aiga Logo" className="app-logo" style={{ height: "32px", width: "auto" }} />
          Aiga
        </NavLink>
        <nav className="app-nav progress-bar" aria-label="Workflow progress">
          {NAV_STEPS.map((navItem) => {
            const isAccessible = navItem.step <= maxStep;
            const isActive = currentStep === navItem.step;
            const isCompleted = currentStep > navItem.step;

            return (
              <div
                key={navItem.to}
                className={`progress-bar__step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""} ${!isAccessible ? "locked" : ""}`}
                onClick={() => {
                  if (isAccessible) navigate(navItem.to);
                }}
                style={{ cursor: isAccessible ? "pointer" : "not-allowed" }}
              >
                <div className="progress-bar__indicator">
                  <span className="progress-bar__number">{navItem.step}</span>
                </div>
                <span className="progress-bar__label">{navItem.label}</span>
              </div>
            );
          })}
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
