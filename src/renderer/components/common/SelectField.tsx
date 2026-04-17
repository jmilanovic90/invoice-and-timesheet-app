interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: SelectOption[];
  error?: string;
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error
}: SelectFieldProps) {
  return (
    <label className="input-field">
      <span className="input-field__label">{label}</span>
      <select
        className={error ? 'input-field__control input-field__control--error' : 'input-field__control'}
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="input-field__error">{error}</span> : null}
    </label>
  );
}
