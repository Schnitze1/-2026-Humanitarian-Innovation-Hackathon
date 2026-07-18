import { Link } from "react-router-dom";
import { useReport } from "../context/ReportContext";
import HeroGallery from "../components/layout/HeroGallery";
import "../styles/welcome.css";

const WORKFLOW_STAGES = [
  {
    step: 1,
    title: "Setup & Context",
    desc: "Define your audience, mandate, and region.",
  },
  {
    step: 2,
    title: "Source Ingestion",
    desc: "Upload raw reports. Aiga enforces consistency.",
  },
  {
    step: 3,
    title: "AI Generation",
    desc: "Draft content governed by NGO guidelines.",
  },
  {
    step: 4,
    title: "Review & Export",
    desc: "Check citations and publish the final report.",
  },
];

function Welcome() {
  const { hasSource, hasReport, resetWorkflow } = useReport();

  return (
    <div className="welcome">
      <section className="welcome-hero">
        <div className="welcome-hero__content">
          <p className="eyebrow">AI reporting for NGOs</p>
          <h1 className="welcome-hero__brand">Aiga</h1>
          <p className="welcome-hero__lede">
            Help your team draft donor and community reports that stay grounded in
            your sources — with clear provenance, consistency checks, and
            transparent disclosure.
          </p>
          <div style={{ marginTop: "2rem" }}>
            <h2 className="welcome-section__title" style={{ fontSize: "1.25rem" }}>
              Ready to begin?
            </h2>
            <p className="welcome-section__intro" style={{ marginBottom: "1rem" }}>
              Click "Start new report" to securely connect your local data source and begin drafting with guaranteed authenticity and provenance.
            </p>
            <div className="welcome-hero__actions">
              <Link
                to="/setup"
                className="btn btn--primary"
                onClick={resetWorkflow}
              >
                Start new report
              </Link>
              {(hasSource || hasReport) && (
                <Link to={hasReport ? "/review" : "/upload"} className="btn btn--secondary">
                  Continue current session
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <div className="welcome-hero__image-container">
          <HeroGallery />
        </div>
      </section>

      <section className="welcome-section">
        <ul className="welcome-stages">
          {WORKFLOW_STAGES.map((s) => (
            <li key={s.step} className="welcome-stages__item">
              <span className="welcome-stages__number">{s.step}</span>
              <div>
                <h3 className="welcome-stages__title">{s.title}</h3>
                <p className="welcome-stages__body">{s.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Welcome;
