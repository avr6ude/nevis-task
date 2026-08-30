export interface IconProps {
  className?: string;
}

export function ChevronRight({ className }: IconProps) {
  return (
    <svg
      className={className}
      width={10}
      height={10}
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
