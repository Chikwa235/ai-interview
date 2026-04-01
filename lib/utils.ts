import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const raw = String(tech ?? "").trim().toLowerCase();

  // remove common suffixes + spaces + punctuation
  const key = raw
    .replace(/\.js$/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, ""); // ✅ handles next.js, node.js, etc.

  // ✅ fallback to key itself if mappings doesn't have it
  return (mappings as any)[key] || key;
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray?: string[]) => {
  const safeArray = Array.isArray(techArray) ? techArray : [];

  const logoURLs = safeArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};