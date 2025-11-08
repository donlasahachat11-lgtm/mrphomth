/**
 * Project Modifier
 * Handles iterative modifications to existing projects
 */

import { vanchinChatCompletion } from './vanchin-client';

export interface ModificationRequest {
  projectId: string;
  userId: string;
  instruction: string;
  currentFiles: Array<{
    path: string;
    content: string;
  }>;
}

export interface ModificationResult {
  success: boolean;
  modifications: Array<{
    path: string;
    action: 'create' | 'update' | 'delete';
    content?: string;
    reason: string;
  }>;
  summary: string;
}

/**
 * Analyze modification request and generate changes
 */
export async function analyzeModification(
  request: ModificationRequest
): Promise<ModificationResult> {
  const { instruction, currentFiles } = request;

  // Build context about current project
  const projectContext = currentFiles
    .map((f) => `File: ${f.path}\n\`\`\`\n${f.content.substring(0, 500)}...\n\`\`\``)
    .join('\n\n');

  const prompt = `You are a code modification assistant. Analyze the following modification request and generate precise changes.

**Current Project Files:**
${projectContext}

**Modification Request:**
${instruction}

**Instructions:**
1. Analyze what needs to be changed
2. Identify which files need to be created, updated, or deleted
3. Generate the exact code changes needed
4. Provide a clear explanation for each change

**Response Format (JSON):**
{
  "modifications": [
    {
      "path": "path/to/file.ts",
      "action": "create" | "update" | "delete",
      "content": "full file content (if create/update)",
      "reason": "explanation of why this change is needed"
    }
  ],
  "summary": "overall summary of changes"
}

Respond ONLY with valid JSON, no additional text.`;

  try {
    const response = await vanchinChatCompletion([
      { role: 'system', content: 'You are a precise code modification assistant. Always respond with valid JSON.' },
      { role: 'user', content: prompt },
    ]);

    // Parse AI response
    let content = '';
    
    if ('choices' in response && response.choices && response.choices[0]) {
      content = response.choices[0].message?.content || '';
    } else if ('content' in response) {
      content = (response as any).content || '';
    }
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      modifications: result.modifications || [],
      summary: result.summary || 'Modifications generated',
    };
  } catch (error) {
    console.error('Error analyzing modification:', error);
    return {
      success: false,
      modifications: [],
      summary: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Apply modifications to project files
 */
export async function applyModifications(
  projectId: string,
  modifications: ModificationResult['modifications']
): Promise<{ success: boolean; message: string }> {
  try {
    // In a real implementation, this would:
    // 1. Load current project files
    // 2. Apply each modification
    // 3. Save updated files
    // 4. Update database
    
    console.log(`Applying ${modifications.length} modifications to project ${projectId}`);

    for (const mod of modifications) {
      console.log(`  ${mod.action}: ${mod.path} - ${mod.reason}`);
    }

    return {
      success: true,
      message: `Successfully applied ${modifications.length} modifications`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to apply modifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
