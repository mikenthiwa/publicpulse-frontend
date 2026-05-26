import { Icon, type IconName } from "@/components/icons";

type StatusCardProps = {
  icon?: IconName;
  label: string;
  value: string;
};

export function StatusCard({ icon = "info", label, value }: StatusCardProps) {
  return (
    <div className="rounded-lg border border-[#d8ded2] bg-[#fbfcf8] p-5">
      <p className="inline-flex items-center gap-2 text-sm font-bold text-[#5c6a61]">
        <Icon name={icon} size={16} />
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-[#151d19]">{value}</p>
    </div>
  );
}
