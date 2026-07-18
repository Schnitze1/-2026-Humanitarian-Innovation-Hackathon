import { useLocation } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import WorkflowSteps from "../components/layout/WorkflowSteps";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";

function Review() {
  const { pathname } = useLocation();

  return (
    <>
      <WorkflowSteps currentPath={pathname} />
      <PageHeader
        eyebrow="Step 4"
        title="Review"
        description="Placeholder for claims, provenance, and consistency flags."
      />
      <Card>
        <div className="component-preview-row">
          <StatusBadge status="verified" />
          <StatusBadge status="warning" />
          <StatusBadge status="review" />
        </div>
        <p style={{ margin: "1rem 0 0" }}>
          Full review experience connects to provenance and consistency endpoints
          later.
        </p>
      </Card>
    </>
  );
}

export default Review;
