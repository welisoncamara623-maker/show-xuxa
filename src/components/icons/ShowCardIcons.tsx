type IconProps = {
  className?: string;
};

export function ShowCardArrowIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M9 6.5L14.5 12L9 17.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShowCardAvailabilityIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M2.4 6.2 6.2 2.4h5.1c.4 0 .8.2 1.1.5l.7.7c.3.3.5.7.5 1.1v5.1l-3.8 3.8c-.4.4-1.1.4-1.5 0L2.4 7.7c-.4-.4-.4-1.1 0-1.5Z"
        fill="currentColor"
      />
      <circle cx="10.9" cy="5.3" r="0.95" fill="#ffffff" />
    </svg>
  );
}
