/*import { redirect } from "next/dist/server/api-utils";
import { getInterviewById } from "@/lib/actions/general.action";

const page = async({ params }: RouteParams) => {
    const { id } = params;
    const interview = await getInterviewById(id);

    if(!interview) redirect("/");
  return (
    <div>
      
    </div>
  )
}

export default page*/


import { getInterviewById } from "@/lib/actions/general.action";
import { notFound } from "next/navigation";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;

  if (!id) notFound();

  const interview = await getInterviewById(id);

  if (!interview) notFound();

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Interview</h1>

      <h2 className="text-lg font-medium mt-6">Questions</h2>
      <ul className="list-disc ml-6 mt-2">
        {(interview.questions ?? []).map((q: string, idx: number) => (
          <li key={idx}>{q}</li>
        ))}
      </ul>
    </main>
  );
}