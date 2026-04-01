import { cn, getTechLogos } from "@/lib/utils";

type TechIconProps = {
  techStack?: string[];
};

function normalizeTechStackInput(techStack?: string[]) {
  const arr = Array.isArray(techStack) ? techStack : [];

  const flattened = arr.flatMap((item) => {
    const s = String(item ?? "").trim();
    if (!s) return [];

    const hasStrongSeparators = /,|\/|\n|\band\b|&/i.test(s);

    return s
      .split(hasStrongSeparators ? /,|\/|\n|\band\b|&/gi : /\s+/g)
      .map((x) => x.trim())
      .filter(Boolean);
  });

  return Array.from(new Set(flattened)).slice(0, 12);
}

const DisplayTechIcons = async ({ techStack }: TechIconProps) => {
  const normalizedTechStack = normalizeTechStackInput(techStack);
  const techIcons = await getTechLogos(normalizedTechStack);

  if (!techIcons?.length) return null;

  return (
    <div className="flex flex-row">
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div
          key={`${tech}-${index}`}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex flex-center",
            index >= 1 && "-ml-3"
          )}
          title={tech}
        >
          <span className="tech-tooltip">{tech}</span>
          <img
            src={url}
            alt={tech}
            width={20}
            height={20}
            className="size-5"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;