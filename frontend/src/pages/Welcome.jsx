import { Link } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";

function Welcome() {
  return (
    <>
      <PageHeader
        eyebrow="Welcome"
        title="Aiga"
        description="Placeholder dashboard. Full welcome content lands in a later commit."
        actions={
          <Link to="/setup" className="btn btn--accent">
            Start new report
          </Link>
        }
      />
      <Card>
        <p style={{ marginBottom: "0.75rem" }}>
          Shared UI components are ready for the rest of the workflow:
        </p>
        <div className="component-preview-row">
          <StatusBadge status="verified" />
          <StatusBadge status="warning" />
          <StatusBadge status="review" />
        </div>
      </Card>
    </>
  );
}

export default Welcome;
