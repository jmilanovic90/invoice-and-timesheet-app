interface TextareaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
}

export function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder
}: TextareaFieldProps) {
  return (
    <label className="input-field input-field--full">
      <span className="input-field__label">{label}</span>
      <textarea
        className="input-field__control input-field__control--textarea"
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </label>
  );
}
