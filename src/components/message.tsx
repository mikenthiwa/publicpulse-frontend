type MessageProps = {
  title?: string;
  children: React.ReactNode;
  tone?: "neutral" | "error" | "success";
};

const toneClassNames = {
  neutral: "border-[#d6ded3] bg-white text-[#405246]",
  error: "border-[#e1b2a8] bg-[#fff7f5] text-[#7b2d1f]",
  success: "border-[#abd0b6] bg-[#f4fbf5] text-[#23583a]",
};

export function Message({ title, children, tone = "neutral" }: MessageProps) {
  return (
    <div className={`rounded-md border p-4 text-sm ${toneClassNames[tone]}`}>
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}
