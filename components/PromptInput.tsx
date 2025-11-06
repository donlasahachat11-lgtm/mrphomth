'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

export function PromptInput({ onGenerate, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = prompt.trim();
    if (!trimmed) {
      return;
    }

    onGenerate(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur">
        <label htmlFor="project-prompt" className="block text-sm font-medium text-muted-foreground">
          Describe the experience you want to build
        </label>
        <textarea
          id="project-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="เช่น: สร้างเว็บ e-commerce สำหรับเสื้อผ้าแฟชั่น เพิ่มระบบสมาชิก รีวิวสินค้า และรองรับการชำระเงินกันยายน"
          className={cn(
            'mt-3 w-full resize-none rounded-xl border bg-background px-4 py-3 text-base',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2',
            'min-h-[140px] transition-shadow duration-200 ease-out'
          )}
          disabled={isLoading}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>
            Mr.Promth will orchestrate seven specialist agents to deliver a production-ready implementation.
          </span>
          <Button
            type="submit"
            className="px-6"
            isLoading={isLoading}
            disabled={isLoading || !prompt.trim()}
          >
            Generate Website
          </Button>
        </div>
      </div>
    </form>
  );
}
