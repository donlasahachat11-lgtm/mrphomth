import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, prefix, suffix, type = "text", ...props }, ref) => {
    return (
      <div className={twMerge("flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2", className)}>
        {prefix ? <span className="text-sm text-muted-foreground">{prefix}</span> : null}
        <input
          ref={ref}
          type={type}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          {...props}
        />
        {suffix ? <span className="text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    );
  }
);

Input.displayName = "Input";
