type FieldErrorsProps = {
  errors?: string[];
  id: string;
};

export function FieldErrors({ errors = [], id }: FieldErrorsProps) {
  if (errors.length === 0) return null;

  return (
    <ul className="grid gap-1 text-sm font-normal text-[#8d3324]" id={id}>
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}
