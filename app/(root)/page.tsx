import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

import InterviewCard from "../components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

const Page = async () => {
  const user = await getCurrentUser();
  const userId = user?.id;

  const [userInterviews, latestInterviews] = await Promise.all([
    userId ? getInterviewsByUserId(userId) : Promise.resolve([]),
    userId ? getLatestInterviews({ userId }) : Promise.resolve([]),
  ]);

  const hasPastInterviews = (userInterviews?.length ?? 0) > 0;
  const hasUpcomingInterviews = (latestInterviews?.length ?? 0) > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Generate a custom interview, then take it and get instant feedback.
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Generate an Interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your interviews</h2>

        <div className="interviews-section flex flex-row gap-4">
          {hasPastInterviews ? (
            userInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>

        <div className="interviews-section flex flex-row gap-4">
          {hasUpcomingInterviews ? (
            latestInterviews.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>There are no upcoming interviews scheduled.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Page;