import { getBucketName } from "@/actions/supabase";
import { AssessmentFolder } from "@/components/ui/assessmentFolder";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const bucket = await getBucketName();
  const supabase = await createClient();
  const { data: assessments, error } = await supabase.storage
    .from(process.env.ASSESSMENT_BUCKET_NAME!)
    .list();

  return (
    <>
      <div className="flex flex-col gap-6 w-11/12">
        <h2 className="font-medium text-xl mb-4">
          {bucket && `${bucket[0].toUpperCase()}${bucket.substring(1)}`}
        </h2>

        {assessments &&
          assessments.map((i) => <AssessmentFolder key={i.name} item={i} />)}
      </div>
    </>
  );
}
