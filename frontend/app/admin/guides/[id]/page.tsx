import { GuideForm } from "@/components/GuideForm";

type EditGuideProps = {
  params: Promise<{ id: string }>;
};

export default async function EditGuidePage({ params }: EditGuideProps) {
  const { id } = await params;
  const guideId = Number(id);
  if (!Number.isInteger(guideId) || guideId < 1) {
    return <p className="text-sm text-muted">That guide was not found.</p>;
  }

  return <GuideForm guideId={guideId} />;
}
