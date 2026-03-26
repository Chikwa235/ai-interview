import Agent from "@/app/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewById } from "@/lib/actions/general.action";
import { notFound, redirect } from "next/navigation";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  const user = await getCurrentUser();
  if (!user?.id) redirect("/sign-in");

  const interview = await getInterviewById(id);
  if (!interview) notFound();

  return (
    <>
      <h3>{interview.role ?? "Interview"}</h3>

      <Agent
        userName={user.name ?? ""}
        userId={user.id}
        profileImage={user.profileURL}
        interviewId={id}
        type="interview" // IMPORTANT: not "generate"
        questions={interview.questions ?? []}
      />
    </>
  );
}