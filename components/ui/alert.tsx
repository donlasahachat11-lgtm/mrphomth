import React from 'react';
import { clsx } from 'clsx';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  className?: string;
}

export function Alert({ children, variant = 'default', className }: AlertProps) {
  return (
    <div
      className={clsx(
        'relative w-full rounded-lg border p-4',
        {
          'bg-background text-foreground': variant === 'default',
          'border-red-500/50 text-red-600 dark:border-red-500 [&>svg]:text-red-600': variant === 'destructive',
          'border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600': variant === 'success',
          'border-yellow-500/50 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-600': variant === 'warning',
        },
        className
      )}
    >
      {children}
    </div>
  );
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDescription({ children, className }: AlertDescriptionProps) {
  return (
    <div className={clsx('text-sm [&_p]:leading-relaxed', className)}>
      {children}
    </div>
  );
}

interface AlertTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertTitle({ children, className }: AlertTitleProps) {
  return (
    <h5 className={clsx('mb-1 font-medium leading-none tracking-tight', className)}>
      {children}
    </h5>
  );
}
