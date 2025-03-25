export interface ButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

export interface FormProps {
  onSubmit: () => void;
}
