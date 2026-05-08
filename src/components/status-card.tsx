type StatusCardProps = {
  label: string;
  value: string;
};

export function StatusCard({ label, value }: StatusCardProps) {
  return (
    <div className="rounded-md border border-[#e1e7de] bg-[#fbfcf8] p-5">
      <p className="text-sm font-medium text-[#647266]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#172019]">{value}</p>
    </div>
  );
}
