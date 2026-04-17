interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
}

export function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  type = 'text'
}: InputFieldProps) {
  return (
    <label className="input-field">
      <span className="input-field__label">{label}</span>
      <input
        className={error ? 'input-field__control input-field__control--error' : 'input-field__control'}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(name, event.target.value)}
      />
      {error ? <span className="input-field__error">{error}</span> : null}
    </label>
  );
}
