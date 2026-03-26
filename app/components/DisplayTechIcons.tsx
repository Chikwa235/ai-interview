import Image from "next/image";
import { cn } from "@/lib/utils";
import { mappings } from "@/constants";

type TechIconProps = {
  techStack?: string[];
};

function normalizeTech(input: string) {
  const key = String(input || "").trim().toLowerCase();
  return (mappings as any)[key] || key;
}

/**
 * Map normalized tech -> filename in /public/covers
 * IMPORTANT: Update filenames here to match what you actually have.
 */
const techToCoverFile: Record<string, string> = {
  react: "react.png",
  nextjs: "nextjs.png",
  vue: "vue.png",
  vuejs: "vue.png",
  angular: "angular.png",

  node: "node.png",
  nodejs: "node.png",
  express: "express.png",

  typescript: "typescript.png",
  javascript: "javascript.png",

  tailwind: "tailwind.png",
  tailwindcss: "tailwind.png",

  mongodb: "mongodb.png",
  mysql: "mysql.png",
  postgresql: "postgresql.png",
  postgres: "postgresql.png",

  firebase: "firebase.png",
  prisma: "prisma.png",

  docker: "docker.png",
  kubernetes: "kubernetes.png",

  aws: "aws.png",
  azure: "azure.png",
  gcp: "gcp.png",
  googlecloud: "gcp.png",

  graphql: "graphql.png",
};

function getCoverUrl(tech: string) {
  const normalized = normalizeTech(tech).replace(/\s+/g, "");
  const file = techToCoverFile[normalized];
  if (!file) return null;
  return `/covers/${file}`;
}

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
  const list = (techStack ?? []).filter(Boolean);

  const items = list
    .map((t) => ({ tech: t, url: getCoverUrl(t) }))
    .filter((x): x is { tech: string; url: string } => Boolean(x.url))
    .slice(0, 3);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-row">
      {items.map(({ tech, url }, index) => (
        <div
          key={`${tech}-${index}`}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex flex-center",
            index >= 1 && "-ml-3"
          )}
          title={tech}
        >
          <span className="tech-tooltip">{tech}</span>
          <Image src={url} alt={tech} width={20} height={20} className="size-5" />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;