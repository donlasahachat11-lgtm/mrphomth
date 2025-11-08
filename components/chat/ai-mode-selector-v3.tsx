'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AIMode, getAllAIModes, getAIModeConfig } from '@/lib/types/ai-mode'
import { cn } from '@/lib/utils'

interface AIModeSelectorV3Props {
  value: AIMode
  onChange: (mode: AIMode) => void
  className?: string
}

export function AIModeSelectorV3({ value, onChange, className }: AIModeSelectorV3Props) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const currentMode = getAIModeConfig(value)
  const allModes = getAllAIModes()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleSelect = (mode: AIMode) => {
    onChange(mode)
    setOpen(false)
  }

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <Button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "group relative overflow-hidden border-2 transition-all duration-300",
          "hover:border-sky-400 hover:shadow-lg hover:shadow-sky-200/50",
          "focus:ring-2 focus:ring-sky-400 focus:ring-offset-2",
          "min-w-[220px] h-12 px-4 bg-white text-gray-900",
          "hover:bg-gradient-to-r hover:from-sky-50 hover:to-purple-50"
        )}
      >
        <div className="flex items-center justify-between w-full">
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

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute top-full left-0 mt-2 w-[380px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="rounded-xl border-2 border-gray-200 bg-white/95 backdrop-blur-xl shadow-2xl p-2">
            {/* Header */}
            <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100 mb-1">
              <Sparkles className="h-4 w-4 text-sky-500" />
              <span className="text-sm font-semibold text-gray-700">
                เลือก AI Mode
              </span>
            </div>

            {/* Mode List */}
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {allModes.map((modeConfig) => {
                const isSelected = value === modeConfig.id

                return (
                  <button
                    key={modeConfig.id}
                    type="button"
                    onClick={() => handleSelect(modeConfig.id)}
                    className={cn(
                      "w-full group relative cursor-pointer rounded-lg px-3 py-3 transition-all duration-200 text-left",
                      "hover:bg-gradient-to-r hover:from-sky-50 hover:to-purple-50",
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
                          {modeConfig.icon}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-sm font-semibold",
                            isSelected ? "text-sky-700" : "text-gray-900"
                          )}>
                            {modeConfig.name}
                          </span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-sky-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                          {modeConfig.description}
                        </p>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-sky-500 to-purple-600 rounded-r-full" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
