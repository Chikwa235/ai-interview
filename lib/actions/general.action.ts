"use server";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

/**
 * FEEDBACK (write) - OpenAI version
 * Always writes to top-level `feedback` collection:
 * 1) immediately create doc with status=processing
 * 2) attempt OpenAI structured output
 * 3) update doc with complete/error
 *
 * Also updates the corresponding interview doc with latestScore + latestFeedbackId
 * so homepage cards can display the score.
 */
export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  const feedbackRef = feedbackId
    ? db.collection("feedback").doc(feedbackId)
    : db.collection("feedback").doc();

  // Write immediately so the collection/doc exists even if OpenAI fails
  await feedbackRef.set({
    interviewId,
    userId,
    status: "processing",
    createdAt: new Date().toISOString(),
    transcriptMessageCount: transcript?.length ?? 0,
  });

  try {
    const formattedTranscript = (transcript ?? [])
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    if (!formattedTranscript.trim() || (transcript?.length ?? 0) < 2) {
      await feedbackRef.set(
        {
          status: "error",
          errorMessage: "Transcript was empty/too short to generate feedback.",
          completedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return { success: true, feedbackId: feedbackRef.id };
    }

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: feedbackSchema,
      system:
        "You are a professional interviewer. Return JSON that matches the schema exactly.",
      prompt: `
You are an AI interviewer analyzing a mock interview. Evaluate the candidate strictly.

Transcript:
${formattedTranscript}

Return the result as JSON that matches the schema exactly.
Make sure categoryScores contains the required categories exactly as defined in the schema.
      `,
    });

    await feedbackRef.set(
      {
        status: "complete",
        totalScore: object.totalScore,
        categoryScores: object.categoryScores,
        strengths: object.strengths,
        areasForImprovement: object.areasForImprovement,
        finalAssessment: object.finalAssessment,
        completedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // ✅ NEW: Update interview doc so cards can show the score
    await db
      .collection("interviews")
      .doc(interviewId)
      .set(
        {
          latestScore: object.totalScore,
          latestFeedbackId: feedbackRef.id,
          latestFeedbackAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error: any) {
    await feedbackRef.set(
      {
        status: "error",
        errorMessage: error?.message ?? String(error),
        completedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return { success: true, feedbackId: feedbackRef.id };
  }
}

/**
 * INTERVIEWS (read)
 */
export async function getInterviewById(id: string): Promise<Interview | null> {
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    console.error("getInterviewById called with invalid id:", id);
    return null;
  }

  const docSnap = await db.collection("interviews").doc(id).get();
  if (!docSnap.exists) return null;

  return { id: docSnap.id, ...docSnap.data() } as Interview;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

/**
 * FEEDBACK (read) - NEWEST FIRST
 */
export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc") // ✅ NEW: get newest feedback
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

/**
 * (Optional legacy) INTERVIEWS (write)
 */
export async function saveInterviewQuestions(params: {
  interviewId: string;
  questions: string[];
}) {
  const { interviewId, questions } = params;

  try {
    await db.collection("interviews").doc(interviewId).update({
      questions,
      finalized: true,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving interview questions:", error);
    return { success: false };
  }
}

/**
 * NEW: Each generated set becomes its own Interview document with a unique ID
 */
export async function createInterviewWithQuestions(params: {
  userId: string;
  role: string;
  interviewType: string;
  questions: string[];
}) {
  const { userId, role, interviewType, questions } = params;

  try {
    const interviewRef = db.collection("interviews").doc();

    await interviewRef.set({
      userId,
      role,
      interviewType,
      questions,
      finalized: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { success: true, interviewId: interviewRef.id };
  } catch (error) {
    console.error("Error creating interview with questions:", error);
    return { success: false };
  }
}