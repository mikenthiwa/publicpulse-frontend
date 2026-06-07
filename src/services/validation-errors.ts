export function splitValidationErrors(
  validationErrors: Record<string, string[]>,
  fieldNames: readonly string[],
) {
  const knownFields = new Set(fieldNames);
  const fieldErrors = Object.fromEntries(
    fieldNames.map((fieldName) => [fieldName, validationErrors[fieldName] ?? []]),
  );
  const unmatchedErrors = Object.entries(validationErrors)
    .filter(([fieldName]) => !knownFields.has(fieldName))
    .flatMap(([, errors]) => errors);

  return { fieldErrors, unmatchedErrors };
}
