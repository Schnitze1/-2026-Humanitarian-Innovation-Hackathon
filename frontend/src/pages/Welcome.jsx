import { Link } from "react-router-dom";
import DevMockBanner from "../components/ui/DevMockBanner";
import StatusBadge from "../components/ui/StatusBadge";
import { useReport } from "../context/ReportContext";
import { MOCK_RECENT_REPORTS } from "../mocks/recentReports";
import "../styles/welcome.css";

const WORKFLOW_STAGES = [
  {
    step: 1,
    title: "Set up the report",
    body: "Define the program, audience, and what the analysis should answer.",
  },
  {
    step: 2,
    title: "Upload source files",
    body: "Bring in the evidence — text, CSV, or markdown — that the draft must stay grounded in.",
  },
  {
    step: 3,
    title: "Generate and review",
    body: "Draft a source-linked report, then inspect provenance and consistency flags claim by claim.",
  },
  {
    step: 4,
    title: "Preview disclosure",
    body: "See donor, community, and internal views that make AI use and sources transparent.",
  },
];

function Welcome() {
  const { resetWorkflow, hasSource, hasReport, setup } = useReport();

  const handleStartNew = () => {
    resetWorkflow();
  };

  return (
    <div className="welcome">
      <section className="welcome-hero">
        <p className="eyebrow">AI reporting for NGOs</p>
        <h1 className="welcome-hero__brand">Aiga</h1>
        <p className="welcome-hero__lede">
          Help your team draft donor and community reports that stay grounded in
          your sources — with clear provenance, consistency checks, and
          transparent disclosure.
        </p>
        <div className="welcome-hero__actions">
          <Link
            to="/setup"
            className="btn btn--accent"
            onClick={handleStartNew}
          >
            Start new report
          </Link>
          {(hasSource || hasReport) && (
            <Link to={hasReport ? "/review" : "/upload"} className="btn btn--secondary">
              Continue current session
              {setup.programName ? ` · ${setup.programName}` : ""}
            </Link>
          )}
        </div>
      </section>

      <section className="welcome-section" aria-labelledby="workflow-heading">
        <h2 id="workflow-heading" className="welcome-section__title">
          How it works
        </h2>
        <p className="welcome-section__intro">
          A calm four-stage path from source evidence to accountable disclosure.
        </p>
        <ol className="welcome-stages">
          {WORKFLOW_STAGES.map((stage) => (
            <li key={stage.step} className="welcome-stages__item">
              <span className="welcome-stages__number" aria-hidden="true">
                {stage.step}
              </span>
              <div>
                <h3 className="welcome-stages__title">{stage.title}</h3>
                <p className="welcome-stages__body">{stage.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="welcome-section" aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="welcome-section__title">
          Recent reports
        </h2>
        <p className="welcome-section__intro">
          Sample history for the demo. The backend does not yet provide a report
          list API.
        </p>
        <DevMockBanner message="Recent reports below are mock data for demonstration only" />
        <ul className="welcome-recent">
          {MOCK_RECENT_REPORTS.map((report) => (
            <li key={report.id} className="welcome-recent__item">
              <div className="welcome-recent__main">
                <p className="welcome-recent__name">{report.programName}</p>
                <p className="welcome-recent__meta">
                  {report.audience} · {report.updatedLabel}
                </p>
              </div>
              <StatusBadge status={report.status} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Welcome;
