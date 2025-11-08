'use client'

import { useState } from 'react'
import { Check, ChevronDown, Sparkles } from 'lucide-react'
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

interface AIModeSelectorV2Props {
  value: AIMode
  onChange: (mode: AIMode) => void
  className?: string
}

export function AIModeSelectorV2({ value, onChange, className }: AIModeSelectorV2Props) {
  const [open, setOpen] = useState(false)
  const currentMode = getAIModeConfig(value)
  const allModes = getAllAIModes()

  const handleSelect = (mode: AIMode) => {
    onChange(mode)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "group relative overflow-hidden border-2 transition-all duration-300",
            "hover:border-sky-400 hover:shadow-lg hover:shadow-sky-200/50",
            "focus:ring-2 focus:ring-sky-400 focus:ring-offset-2",
            "min-w-[220px] h-12 px-4",
            className
          )}
        >
          {/* Gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-sky-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Content */}
          <div className="relative flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-purple-600 text-white shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-lg">{currentMode.icon}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-900">
                  {currentMode.name}
                </span>
                <span className="text-xs text-gray-500">
                  AI Mode
                </span>
              </div>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-500 transition-transform duration-200",
              open && "rotate-180"
            )} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="start" 
        className="w-[380px] p-2 bg-white/95 backdrop-blur-xl border-2 shadow-2xl"
        sideOffset={8}
      >
        <DropdownMenuLabel className="px-3 py-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky-500" />
          <span className="text-sm font-semibold text-gray-700">
            เลือก AI Mode
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        
        <div className="space-y-1">
          {allModes.map((modeConfig) => {
            const config = modeConfig
            const isSelected = value === modeConfig.id
            
            return (
              <DropdownMenuItem
                key={modeConfig.id}
                onClick={() => handleSelect(modeConfig.id)}
                className={cn(
                  "group relative cursor-pointer rounded-lg px-3 py-3 transition-all duration-200",
                  "hover:bg-gradient-to-r hover:from-sky-50 hover:to-purple-50",
                  "focus:bg-gradient-to-r focus:from-sky-50 focus:to-purple-50",
                  isSelected && "bg-gradient-to-r from-sky-100 to-purple-100"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                    isSelected 
                      ? "bg-gradient-to-br from-sky-500 to-purple-600 shadow-md" 
                      : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-sky-400 group-hover:to-purple-500"
                  )}>
                    <span className={cn(
                      "text-xl transition-colors",
                      isSelected ? "text-white" : "grayscale group-hover:grayscale-0"
                    )}>
                      {config.icon}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-sm font-semibold",
                        isSelected ? "text-sky-700" : "text-gray-900"
                      )}>
                        {config.name}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-sky-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {config.description}
                    </p>
                  </div>
                </div>
                
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-sky-500 to-purple-600 rounded-r-full" />
                )}
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
