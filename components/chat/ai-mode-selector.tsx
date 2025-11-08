"use client"

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AIMode, getAllAIModes, getAIModeConfig } from '@/lib/types/ai-mode'
import { cn } from '@/lib/utils'

interface AIModeSelectorProps {
  value: AIMode
  onChange: (mode: AIMode) => void
  className?: string
}

export function AIModeSelector({ value, onChange, className }: AIModeSelectorProps) {
  const [open, setOpen] = useState(false)
  const currentMode = getAIModeConfig(value)
  const allModes = getAllAIModes()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-between min-w-[200px] font-semibold",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentMode.icon}</span>
            <span>{currentMode.name}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-[320px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          เลือก AI Mode
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {allModes.map((mode) => (
          <DropdownMenuItem
            key={mode.id}
            onClick={() => {
              onChange(mode.id)
              setOpen(false)
            }}
            className="cursor-pointer py-3"
          >
            <div className="flex items-start gap-3 w-full">
              <span className="text-xl flex-shrink-0">{mode.icon}</span>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{mode.name}</span>
                  {value === mode.id && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {mode.description}
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AIModeBadge({ mode }: { mode: AIMode }) {
  const config = getAIModeConfig(mode)
  
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
      <span>{config.icon}</span>
      <span>{config.name}</span>
    </div>
  )
}

export function AIModeInfo({ mode }: { mode: AIMode }) {
  const config = getAIModeConfig(mode)
  
  return (
    <div className="p-4 bg-muted/50 rounded-lg border border-border">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{config.icon}</span>
        <div>
          <h3 className="font-semibold text-base mb-1">{config.name}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">
          Features
        </h4>
        <ul className="grid grid-cols-2 gap-2">
          {config.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-xs">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
