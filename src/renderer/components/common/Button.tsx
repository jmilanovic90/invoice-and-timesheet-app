import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: 'primary' | 'secondary';
}

export function Button({
  variant = 'primary',
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  const variantClass = variant === 'primary' ? 'button button--primary' : 'button button--secondary';
  const composedClassName = className ? `${variantClass} ${className}` : variantClass;

  return (
    <button type={type} className={composedClassName} {...props}>
      {children}
    </button>
  );
}
