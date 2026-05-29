import { Icon, type IconName } from "@/components/icons";

type MessageProps = {
  title?: string;
  children: React.ReactNode;
  tone?: "neutral" | "error" | "success";
};

const toneClassNames = {
  neutral: "border-[#d8ded2] bg-white text-[#39483f]",
  error: "border-[#e0b0a4] bg-[#fff1ed] text-[#8d3324]",
  success: "border-[#a9cfb5] bg-[#eef8f1] text-[#22613f]",
};

const toneIconNames: Record<NonNullable<MessageProps["tone"]>, IconName> = {
  neutral: "info",
  error: "alert",
  success: "check-circle",
};

export function Message({ title, children, tone = "neutral" }: MessageProps) {
  const role = tone === "error" ? "alert" : "status";

  return (
    <div
      className={`flex gap-3 rounded-lg border px-4 py-3 text-sm shadow-[0_1px_2px_rgb(21_29_25/0.04)] ${toneClassNames[tone]}`}
      role={role}
    >
      <Icon className="mt-0.5" name={toneIconNames[tone]} size={18} />
      <div>
        {title ? <p className="font-bold text-[#151d19]">{title}</p> : null}
        <div className={title ? "mt-1 leading-6" : "leading-6"}>{children}</div>
      </div>
    </div>
  );
}
