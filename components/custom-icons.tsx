import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function TerminalIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M6 8l4 4-4 4"/>
      <line x1="12" y1="16" x2="18" y2="16"/>
    </svg>
  );
}

export function ControlIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 12h8"/>
      <path d="M12 8v8"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

export function CodeIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M16 18l6-6-6-6"/>
      <path d="M8 6l-6 6 6 6"/>
      <line x1="14" y1="2" x2="10" y2="22"/>
    </svg>
  );
}

export function AutoFixIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      <circle cx="18" cy="6" r="2"/>
      <circle cx="6" cy="18" r="2"/>
    </svg>
  );
}

export function VisibilityIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 9v6"/>
      <path d="M9 12h6"/>
    </svg>
  );
}

export function WorkflowIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="6" cy="6" r="3"/>
      <circle cx="18" cy="6" r="3"/>
      <circle cx="18" cy="18" r="3"/>
      <circle cx="6" cy="18" r="3"/>
      <path d="M9 6h6"/>
      <path d="M18 9v6"/>
      <path d="M15 18H9"/>
      <path d="M6 15V9"/>
    </svg>
  );
}

export function SparklesIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 3v3"/>
      <path d="M12 18v3"/>
      <path d="M3 12h3"/>
      <path d="M18 12h3"/>
      <path d="m5.6 5.6 2.1 2.1"/>
      <path d="m16.3 16.3 2.1 2.1"/>
      <path d="m5.6 18.4 2.1-2.1"/>
      <path d="m16.3 7.7 2.1-2.1"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
