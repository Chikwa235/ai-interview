"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import {
  createFeedback,
  createInterviewWithQuestions,
} from "@/lib/actions/general.action";
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const ASSISTANT_ID = "730f08f4-2641-4967-be8d-23d3c79d0eb3";

function extractQuestionsFromTranscript(messages: SavedMessage[]) {
  const assistantMsgs = messages
    .filter((m) => m.role === "assistant")
    .map((m) => (m.content || "").trim())
    .filter(Boolean);

  const startIndex = assistantMsgs.findIndex((t) => {
    const s = t.toLowerCase();
    return (
      s === "here are your interview questions:" ||
      s === "here are your interview questions." ||
      s.startsWith("here are your interview questions")
    );
  });

  if (startIndex < 0) return [];

  const relevant = assistantMsgs.slice(startIndex + 1);

  const questions: string[] = [];
  let current = "";

  const isNumberToken = (t: string) => /^\d+[\)\,]$/.test(t);
  const startsNumberedLine = (t: string) => /^\d+[\)\,]\s+/.test(t);

  for (const raw of relevant) {
    const t = raw.trim();
    const lower = t.toLowerCase();

    if (lower.includes("mock answer")) break;

    if (isNumberToken(t)) {
      if (current && /\?\s*$/.test(current)) questions.push(current.trim());
      current = "";
      continue;
    }

    if (startsNumberedLine(t)) {
      if (current && /\?\s*$/.test(current)) questions.push(current.trim());
      current = t.replace(/^\d+[\)\,]\s*/, "").trim();
      if (/\?\s*$/.test(current)) {
        questions.push(current.trim());
        current = "";
      }
      continue;
    }

    if (!current) current = t;
    else current = `${current} ${t}`.replace(/\s+/g, " ").trim();

    if (/\?\s*$/.test(current)) {
      questions.push(current.trim());
      current = "";
    }
  }

  const cleaned = questions
    .map((q) => q.replace(/^\d+[\)\,]\s*/, "").trim())
    .filter((q) => q.length > 10)
    .filter((q) => /\?\s*$/.test(q));

  return Array.from(new Set(cleaned)).slice(0, 20);
}

/**
 * Extract role + interviewType from the transcript.
 * We find the assistant's prompts and the user's answers right after them.
 */
function extractRoleAndType(messages: SavedMessage[]) {
  const msgs = messages
    .map((m) => ({ ...m, content: (m.content ?? "").trim() }))
    .filter((m) => m.content.length > 0);

  const findUserAnswerAfterAssistantPrompt = (promptIncludes: string[]) => {
    for (let i = 0; i < msgs.length - 1; i++) {
      if (msgs[i].role !== "assistant") continue;
      const a = msgs[i].content.toLowerCase();

      if (promptIncludes.some((p) => a.includes(p))) {
        // find next user message
        for (let j = i + 1; j < msgs.length; j++) {
          if (msgs[j].role === "user") return msgs[j].content;
          // stop if assistant speaks again without user answering
          if (msgs[j].role === "assistant") break;
        }
      }
    }
    return "";
  };

  const role = findUserAnswerAfterAssistantPrompt([
    "what role are you interviewing for",
    "what role are you applying for",
    "what role is this interview for",
  ]);

  const interviewTypeRaw = findUserAnswerAfterAssistantPrompt([
    "interview type",
    "technical, behavioral, or mixed",
    "technical or behavioral",
  ]);

  // Normalize type
  const t = interviewTypeRaw.toLowerCase();
  let interviewType = interviewTypeRaw;
  if (t.includes("tech")) interviewType = "technical";
  else if (t.includes("behav")) interviewType = "behavioral";
  else if (t.includes("mix")) interviewType = "mixed";

  return {
    role: role || "Interview",
    interviewType: interviewType || "mixed",
  };
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();

  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: any) => {
      if (message?.type === "transcript" && message?.transcriptType === "final") {
        const newMessage: SavedMessage = {
          role: message.role,
          content: message.transcript,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => {
      console.log("Vapi Error:", error);
      setCallStatus(CallStatus.FINISHED);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) setLastMessage(messages[messages.length - 1].content);

    const runOnFinish = async () => {
      if (callStatus !== CallStatus.FINISHED) return;

      if (type === "generate") {
        if (!userId) {
          router.push("/");
          return;
        }

        const extractedQuestions = extractQuestionsFromTranscript(messages);
        if (extractedQuestions.length === 0) {
          router.push("/");
          return;
        }

        const { role, interviewType } = extractRoleAndType(messages);

        const res = await createInterviewWithQuestions({
          userId,
          role,
          interviewType,
          questions: extractedQuestions,
        });

        if (res.success && res.interviewId) router.push("/");
        else router.push("/");

        return;
      }

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) router.push(`/interview/${interviewId}/feedback`);
      else router.push("/");
    };

    runOnFinish();
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setMessages([]);
    setCallStatus(CallStatus.CONNECTING);

    const formattedQuestions =
      questions?.length ? questions.map((q) => `- ${q}`).join("\n") : "";

    await vapi.start(ASSISTANT_ID, {
      variableValues: {
        userName: userName ?? "",
        userId: userId ?? "",
        interviewId: interviewId ?? "",
        type: type ?? "",
        questions: formattedQuestions,
      },
    });
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.jpeg"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;