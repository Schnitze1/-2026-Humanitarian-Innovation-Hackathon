import { useLocation } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import WorkflowSteps from "../components/layout/WorkflowSteps";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";

function Upload() {
  const { pathname } = useLocation();

  return (
    <>
      <WorkflowSteps currentPath={pathname} />
      <PageHeader
        eyebrow="Step 2"
        title="Source upload"
        description="Placeholder for drag-and-drop source file upload."
      />
      <Card>
        <EmptyState
          title="No file selected"
          description="Upload UI will connect to /api/ingest in a later commit."
        />
      </Card>
    </>
  );
}

export default Upload;
