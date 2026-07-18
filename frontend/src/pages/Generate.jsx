import { useLocation } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import WorkflowSteps from "../components/layout/WorkflowSteps";
import Card from "../components/ui/Card";
import LoadingState from "../components/ui/LoadingState";

function Generate() {
  const { pathname } = useLocation();

  return (
    <>
      <WorkflowSteps currentPath={pathname} />
      <PageHeader
        eyebrow="Step 3"
        title="Draft generation"
        description="Placeholder for report generation and draft preview."
      />
      <Card>
        <LoadingState
          label="Generation UI preview"
          steps={[
            "Retrieve source chunks",
            "Draft report content",
            "Attach provenance spans",
          ]}
        />
      </Card>
    </>
  );
}

export default Generate;
