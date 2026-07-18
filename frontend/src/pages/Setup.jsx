import { useLocation } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import WorkflowSteps from "../components/layout/WorkflowSteps";
import Card from "../components/ui/Card";

function Setup() {
  const { pathname } = useLocation();

  return (
    <>
      <WorkflowSteps currentPath={pathname} />
      <PageHeader
        eyebrow="Step 1"
        title="Report setup"
        description="Placeholder for report configuration fields."
      />
      <Card>
        <p style={{ margin: 0 }}>Form fields will be added in a later commit.</p>
      </Card>
    </>
  );
}

export default Setup;
