import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { notFound, redirect } from "next/navigation";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id: interviewId } = await params;
  if (!interviewId) notFound();

  const user = await getCurrentUser();
  if (!user?.id) redirect("/sign-in");

  const feedback = await getFeedbackByInterviewId({
    interviewId,
    userId: user.id,
  });

  if (!feedback) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Feedback not found</h1>
        <p className="mt-2">
          No feedback exists yet for interview: <span className="font-mono">{interviewId}</span>
        </p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Interview Feedback</h1>

      <div className="mt-4">
        <p className="text-sm opacity-70">Total Score</p>
        <p className="text-2xl font-bold">{feedback.totalScore}/100</p>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium">Category Scores</h2>
        <pre className="mt-2 p-3 rounded bg-black/5 overflow-auto">
          {JSON.stringify(feedback.categoryScores, null, 2)}
        </pre>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium">Strengths</h2>
        <ul className="list-disc ml-6 mt-2">
          {(feedback.strengths ?? []).map((s: string, idx: number) => (
            <li key={idx}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium">Areas for Improvement</h2>
        <ul className="list-disc ml-6 mt-2">
          {(feedback.areasForImprovement ?? []).map((a: string, idx: number) => (
            <li key={idx}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium">Final Assessment</h2>
        <p className="mt-2">{feedback.finalAssessment}</p>
      </div>
    </main>
  );
}