/**
 * AI Mode to Vanchin Model Mapper
 * 
 * This module maps AI Modes to appropriate Vanchin AI models
 * through the Agent system.
 */

import type { AIMode } from '@/lib/types/ai-mode'
import type { AgentType } from '@/lib/ai/model-config'
import { getAIModeConfig } from '@/lib/types/ai-mode'
import { getPrimaryModel, getRandomAgentModel } from '@/lib/ai/model-config'
import { createVanchinClient, getModelEndpoint, VANCHIN_MODELS } from '@/lib/ai/vanchin-client'
import type { OpenAI } from 'openai'

/**
 * Get the agent type for a specific AI mode
 */
export function getAgentForMode(mode: AIMode): AgentType {
  const config = getAIModeConfig(mode)
  return config.agent
}

/**
 * Get the primary Vanchin model for an AI mode
 */
export function getModelForMode(mode: AIMode): string {
  const agent = getAgentForMode(mode)
  return getPrimaryModel(agent)
}

/**
 * Get a random Vanchin model for an AI mode (for load balancing)
 */
export function getRandomModelForMode(mode: AIMode): string {
  const agent = getAgentForMode(mode)
  return getRandomAgentModel(agent)
}

/**
 * Create a Vanchin AI client configured for a specific AI mode
 */
export function createClientForMode(mode: AIMode): { client: OpenAI; endpoint: string; modelKey: string } {
  const modelKey = getModelForMode(mode)
  const client = createVanchinClient(modelKey as keyof typeof VANCHIN_MODELS)
  const endpoint = getModelEndpoint(modelKey as keyof typeof VANCHIN_MODELS)
  
  return {
    client,
    endpoint,
    modelKey
  }
}

/**
 * Create a Vanchin AI client with random model for load balancing
 */
export function createRandomClientForMode(mode: AIMode): { client: OpenAI; endpoint: string; modelKey: string } {
  const modelKey = getRandomModelForMode(mode)
  const client = createVanchinClient(modelKey as keyof typeof VANCHIN_MODELS)
  const endpoint = getModelEndpoint(modelKey as keyof typeof VANCHIN_MODELS)
  
  return {
    client,
    endpoint,
    modelKey
  }
}

/**
 * Get system prompt for an AI mode
 */
export function getSystemPromptForMode(mode: AIMode): string {
  const config = getAIModeConfig(mode)
  return config.systemPrompt
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { createClientForMode, getSystemPromptForMode } from '@/lib/ai/mode-to-model'
 * 
 * // Get client for specific AI mode
 * const { client, endpoint } = createClientForMode('web-builder')
 * const systemPrompt = getSystemPromptForMode('web-builder')
 * 
 * // Make API call
 * const completion = await client.chat.completions.create({
 *   model: endpoint,
 *   messages: [
 *     { role: 'system', content: systemPrompt },
 *     { role: 'user', content: 'Create a coffee shop website' }
 *   ]
 * })
 * ```
 */
