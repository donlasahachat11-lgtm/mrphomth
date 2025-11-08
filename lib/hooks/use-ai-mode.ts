"use client"

import { useState, useEffect } from 'react'
import { AIMode, getAIModeConfig, getAgentForMode } from '@/lib/types/ai-mode'
import { AgentType } from '@/lib/ai/model-config'

interface UseAIModeReturn {
  mode: AIMode
  setMode: (mode: AIMode) => void
  agent: AgentType
  config: ReturnType<typeof getAIModeConfig>
  showWorkspace: boolean
  placeholder: string
  systemPrompt: string
}

export function useAIMode(initialMode: AIMode = 'web-builder'): UseAIModeReturn {
  const [mode, setMode] = useState<AIMode>(initialMode)
  const [agent, setAgent] = useState<AgentType>(getAgentForMode(initialMode))
  
  const config = getAIModeConfig(mode)

  useEffect(() => {
    setAgent(getAgentForMode(mode))
  }, [mode])

  return {
    mode,
    setMode,
    agent,
    config,
    showWorkspace: config.showWorkspace,
    placeholder: config.placeholder,
    systemPrompt: config.systemPrompt
  }
}
