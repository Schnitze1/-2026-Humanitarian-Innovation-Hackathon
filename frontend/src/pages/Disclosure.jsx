import { useLocation } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import WorkflowSteps from "../components/layout/WorkflowSteps";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

function Disclosure() {
  const { pathname } = useLocation();

  return (
    <>
      <WorkflowSteps currentPath={pathname} />
      <PageHeader
        eyebrow="Step 5"
        title="Disclosure"
        description="Placeholder for donor, public, and internal disclosure previews."
        actions={
          <Button variant="secondary" disabled>
            Export unavailable
          </Button>
        }
      />
      <Card>
        <p style={{ margin: 0 }}>
          Disclosure tabs will render HTML from /api/disclosure in a later commit.
        </p>
      </Card>
    </>
  );
}

export default Disclosure;
