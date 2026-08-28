export interface IconProps {
  className?: string;
  size?: number;
}

export function ChevronRight({ className, size = 10 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.5 1.5 L7 5 L3.5 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
