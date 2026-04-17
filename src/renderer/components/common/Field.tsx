interface FieldProps {
  label: string;
  value: string;
}

export function Field({ label, value }: FieldProps) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <span className="field__value">{value || '-'}</span>
    </div>
  );
}
