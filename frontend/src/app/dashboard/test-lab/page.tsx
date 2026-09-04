import { TestLab } from "@/components/dashboard/test-lab";
import { PageHeader } from "@/components/ui/page-header";

export default function TestLabPage() {
  return (
    <>
      <PageHeader
        eyebrow="Demonstration data"
        title="Test Lab"
        description="Exercise representative scenarios without implying live model inference or measured performance."
      />
      <TestLab />
    </>
  );
}
