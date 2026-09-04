import { TestLab } from "@/components/dashboard/test-lab";
import { PageHeader } from "@/components/ui/page-header";

export default function TestLabPage() {
  return (
    <>
      <PageHeader
        eyebrow="Authenticated risk analysis"
        title="Transaction Test Lab"
        description="Submit the exact transaction features accepted by FastAPI and review the persisted risk decision."
      />
      <TestLab />
    </>
  );
}
