import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { getRandomInterviewCover } from "@/lib/utils";
import DisplayTechIcons from "./DisplayTechIcons";

const InterviewCard = (props: InterviewCardProps) => {
  const {
    id,
    role,
    createdAt,

    // legacy fields (may exist)
    type,
    techstack,

    // new fields (may exist)
    interviewType,
    techStack,

    // fields written by createFeedback() onto the interview doc (may exist)
    latestScore,
    latestFeedbackId,
    latestFeedbackAt,
    latestFinalAssessment,
  } = props as any;

  const safeRole = (role && String(role).trim()) || "Interview";

  const safeType =
    (interviewType && String(interviewType).trim()) ||
    (type && String(type).trim()) ||
    "mixed";

  const normalizedType = /mix/gi.test(safeType) ? "Mixed" : safeType;

  const hasFeedback =
    Boolean(latestFeedbackId) || typeof latestScore === "number";

  const safeTechStack = (techStack ?? techstack ?? []) as string[];

  const scoreNumber =
    typeof latestScore === "number"
      ? Math.max(0, Math.min(100, Math.round(latestScore)))
      : null;

  const dateToShow = latestFeedbackAt || createdAt || Date.now();
  const formattedDate = dayjs(dateToShow).isValid()
    ? dayjs(dateToShow).format("MMM D, YYYY")
    : dayjs().format("MMM D, YYYY");

  const dateLabel = latestFeedbackAt ? "Latest feedback" : "Created";

  const summaryText =
    (latestFinalAssessment && String(latestFinalAssessment).trim()) ||
    (hasFeedback
      ? "Feedback generated. Open to view detailed results."
      : "You haven't taken this interview yet. Take it now to improve your skills.");

  const href = hasFeedback ? `/interview/${id}/feedback` : `/interview/${id}`;
  const ctaText = hasFeedback ? "Check Feedback" : "View Interview";

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96 flex flex-col">
      <div className="card-interview">
        <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
          <p className="badge-text">{normalizedType}</p>
        </div>

        <Image
          src={getRandomInterviewCover()}
          alt="cover image"
          width={90}
          height={90}
          className="rounded-full object-fit size-[90px]"
        />

        <h3 className="mt-5 capitalize">{safeRole} Interview</h3>

        <div className="flex flex-col gap-5 mt-3">
          <div className="flex flex-row gap-2 items-center flex-wrap">
            <Image src="/calendar.svg" alt="calendar" width={22} height={22} />
            <p>
              {dateLabel}: {formattedDate}
            </p>

            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" alt="star" width={22} height={22} />
              <p>{scoreNumber !== null ? scoreNumber : "---"}/100</p>
            </div>
          </div>

          <p className="line-clamp-2 mt-5">{summaryText}</p>
        </div>

        <div className="flex flex-row justify-between items-center mt-4">
          <DisplayTechIcons techStack={safeTechStack} />

          <Button className="btn-primary" asChild>
            <Link href={href}>{ctaText}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;