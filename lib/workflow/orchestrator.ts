/**
 * Workflow Orchestrator
 * Manages the complete flow from prompt to deployed project
 */

import { executeAgent1 } from '../agents/agent1'
import { executeAgent2 } from '../agents/agent2'
import { agent3GenerateBackend } from '../agents/agent3-code-generator'
import { agent4GenerateFrontend } from '../agents/agent4-frontend-generator'
import { agent5TestingQA } from '../agents/agent5-testing-qa'
import { agent6Deploy } from '../agents/agent6-deployment'
import { agent7Monitor } from '../agents/agent7-monitoring'
import { createClient } from '@supabase/supabase-js'
import { workflowEvents } from './events'
import { ProjectManager } from '../file-manager/project-manager'
import { trackWorkflow, captureException, addBreadcrumb } from '../monitoring/sentry'

export interface WorkflowRequest {
  userId: string
  projectName: string
  prompt: string
  options?: {
    skipTesting?: boolean
    skipDeployment?: boolean
    autoGitHub?: boolean
  }
}

export interface WorkflowState {
  id: string
  userId: string
  projectName: string
  projectPath: string
  status: 'pending' | 'analyzing' | 'expanding' | 'generating-backend' | 'generating-frontend' | 'testing' | 'deploying' | 'monitoring' | 'completed' | 'failed'
  currentStep: number
  totalSteps: number
  progress: number
  results: {
    analysis?: any
    expansion?: any
    backend?: any
    frontend?: any
    testing?: any
    deployment?: any
    monitoring?: any
    package?: {
      zipPath: string
      downloadUrl: string
      size: number
      fileCount: number
    }
  }
  errors: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Main workflow orchestrator
 */
export class WorkflowOrchestrator {
  private state: WorkflowState
  private supabase: ReturnType<typeof createClient>
  private projectManager: ProjectManager
  
  constructor(request: WorkflowRequest) {
    this.projectManager = new ProjectManager()
    this.state = {
      id: this.generateId(),
      userId: request.userId,
      projectName: request.projectName,
      projectPath: `/tmp/projects/${request.userId}/${this.sanitizeName(request.projectName)}`,
      status: 'pending',
      currentStep: 0,
      totalSteps: 7,
      progress: 0,
      results: {},
      errors: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  
  /**
   * Execute the complete workflow
   */
  async execute(prompt: string, options?: WorkflowRequest['options']): Promise<WorkflowState> {
    const startTime = Date.now()
    
    // Start Sentry transaction for workflow tracking
    const sentryTransaction = trackWorkflow(this.state.id, this.state.userId)
    
    try {
      console.log('[Workflow] Starting workflow:', this.state.id)
      addBreadcrumb('Workflow started', 'workflow', 'info', {
        workflowId: this.state.id,
        projectName: this.state.projectName,
      })
      
      // Save initial state
      await this.saveState()
      
      // Step 1: Analyze prompt
      await this.updateStatus('analyzing', 1)
      const analysis = await this.analyzePrompt(prompt)
      this.state.results.analysis = analysis
      await this.saveState()
      
      // Step 2: Expand prompt
      await this.updateStatus('expanding', 2)
      const expansion = await this.expandPrompt(analysis)
      this.state.results.expansion = expansion
      await this.saveState()
      
      // Step 3: Generate backend
      await this.updateStatus('generating-backend', 3)
      const backend = await this.generateBackend(expansion)
      this.state.results.backend = backend
      await this.saveState()
      
      // Step 4: Generate frontend
      await this.updateStatus('generating-frontend', 4)
      const frontend = await this.generateFrontend(expansion)
      this.state.results.frontend = frontend
      await this.saveState()
      
      // Step 5: Testing (optional)
      if (!options?.skipTesting) {
        await this.updateStatus('testing', 5)
        const testing = await this.runTests()
        this.state.results.testing = testing
        await this.saveState()
      }
      
      // Step 6: Deployment (optional)
      if (!options?.skipDeployment) {
        await this.updateStatus('deploying', 6)
        const deployment = await this.deploy()
        this.state.results.deployment = deployment
        await this.saveState()
      }
      
      // Step 7: Monitoring
      await this.updateStatus('monitoring', 7)
      const monitoring = await this.setupMonitoring()
      this.state.results.monitoring = monitoring
      await this.saveState()
      
      // Step 8: Package project
      console.log('[Workflow] Packaging project...')
      const packageResult = await this.packageProject()
      this.state.results.package = packageResult
      await this.saveState()
      
      // Complete
      await this.updateStatus('completed', 7)
      console.log('[Workflow] ✅ Workflow completed:', this.state.id)
      
      // Emit completion event
      const duration = Date.now() - startTime
      workflowEvents.emitComplete(this.state.id, {
        success: true,
        results: this.state.results,
        duration
      })
      
      // Finish Sentry transaction
      addBreadcrumb('Workflow completed successfully', 'workflow', 'info', {
        workflowId: this.state.id,
        duration,
      })
      sentryTransaction.finish('success')
      
      return this.state
      
    } catch (error) {
      console.error('[Workflow] ❌ Error:', error)
      this.state.status = 'failed'
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.state.errors.push(errorMessage)
      await this.saveState()
      
      // Emit error event
      workflowEvents.emitError(this.state.id, {
        error: errorMessage,
        step: this.state.currentStep,
        recoverable: false
      })
      
      // Emit completion event with failure
      const duration = Date.now() - startTime
      workflowEvents.emitComplete(this.state.id, {
        success: false,
        results: this.state.results,
        duration
      })
      
      // Capture error in Sentry
      captureException(error, {
        tags: {
          workflowId: this.state.id,
          userId: this.state.userId,
          step: String(this.state.currentStep),
        },
        extra: {
          projectName: this.state.projectName,
          prompt: this.state.results.analysis,
          duration,
        },
        level: 'error',
      })
      
      // Finish Sentry transaction with error
      sentryTransaction.finish('error', error instanceof Error ? error : new Error(String(error)))
      
      throw error
    }
  }
  
  /**
   * Step 1: Analyze prompt with Agent 1
   */
  private async analyzePrompt(prompt: string): Promise<any> {
    console.log('[Workflow] 🤖 Agent 1: Analyzing prompt...')
    
    try {
      // Execute Agent 1 to analyze and expand the user prompt
      const agent1Output = await executeAgent1(prompt)
      
      console.log('[Workflow] ✅ Agent 1 completed:', {
        projectType: agent1Output.project_type,
        features: agent1Output.features.length,
        pages: agent1Output.pages.length
      })
      
      // Emit progress event
      workflowEvents.emitProgress(this.state.id, {
        step: 1,
        totalSteps: this.state.totalSteps,
        status: 'analyzing',
        message: 'Prompt analysis completed',
        progress: Math.round((1 / this.state.totalSteps) * 100)
      })
      
      return agent1Output
      
    } catch (error) {
      console.error('[Workflow] ❌ Agent 1 failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Emit error event
      workflowEvents.emitError(this.state.id, {
        error: `Agent 1 failed: ${errorMessage}`,
        step: 1,
        recoverable: false
      })
      
      throw new Error(`Agent 1 (Prompt Analysis) failed: ${errorMessage}`)
    }
  }
  
  /**
   * Step 2: Expand requirements with Agent 2
   */
  private async expandPrompt(analysis: any): Promise<any> {
    console.log('[Workflow] 🤖 Agent 2: Expanding requirements...')
    
    try {
      // Execute Agent 2 to create detailed system architecture
      const agent2Output = await executeAgent2(analysis)
      
      console.log('[Workflow] ✅ Agent 2 completed:', {
        tables: agent2Output.database_schema.tables.length,
        endpoints: agent2Output.api_endpoints.length,
        dependencies: Object.keys(agent2Output.dependencies).length
      })
      
      // Emit progress event
      workflowEvents.emitProgress(this.state.id, {
        step: 2,
        totalSteps: this.state.totalSteps,
        status: 'expanding',
        message: 'Requirements expansion completed',
        progress: Math.round((2 / this.state.totalSteps) * 100)
      })
      
      // Map Agent 2 output to the format expected by subsequent agents
      const mappedOutput = {
        agent1: analysis,
        agent2: agent2Output,
        backend: {
          description: `Create REST API with ${agent2Output.api_endpoints.length} endpoints`,
          endpoints: agent2Output.api_endpoints,
          database: {
            tables: agent2Output.database_schema.tables.map(t => t.name),
            schema: agent2Output.database_schema
          },
          authentication: true,
          rateLimit: true
        },
        frontend: {
          description: `Create ${analysis.design_style} web application`,
          pages: analysis.pages,
          components: agent2Output.folder_structure.components,
          styling: analysis.tech_stack.styling,
          responsive: true
        }
      }
      
      return mappedOutput
      
    } catch (error) {
      console.error('[Workflow] ❌ Agent 2 failed:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Emit error event
      workflowEvents.emitError(this.state.id, {
        error: `Agent 2 failed: ${errorMessage}`,
        step: 2,
        recoverable: false
      })
      
      throw new Error(`Agent 2 (Requirements Expansion) failed: ${errorMessage}`)
    }
  }
  
  /**
   * Step 3: Generate backend with Agent 3
   */
  private async generateBackend(expansion: any): Promise<any> {
    console.log('[Workflow] 🤖 Agent 3: Generating backend...')
    
    const results = []
    
    // Generate API routes
    if (expansion.backend?.endpoints) {
      const apiResult = await agent3GenerateBackend({
        projectId: this.state.id,
        projectPath: this.state.projectPath,
        task: {
          type: 'api',
          description: expansion.backend.description,
          specifications: {
            endpoints: expansion.backend.endpoints,
            authentication: expansion.backend.authentication,
            rateLimit: expansion.backend.rateLimit
          }
        }
      })
      results.push(apiResult)
    }
    
    // Generate database migration
    if (expansion.backend?.database) {
      const migrationResult = await agent3GenerateBackend({
        projectId: this.state.id,
        projectPath: this.state.projectPath,
        task: {
          type: 'migration',
          description: 'Database schema',
          specifications: {
            database: expansion.backend.database
          }
        }
      })
      results.push(migrationResult)
    }
    
    const backendResult = {
      success: results.every(r => r.success),
      filesGenerated: results.flatMap(r => r.filesGenerated || []),
      dependencies: [...new Set(results.flatMap(r => r.dependencies || []))],
      nextSteps: results.flatMap(r => r.nextSteps || [])
    }
    
    console.log('[Workflow] ✅ Agent 3 completed:', {
      filesGenerated: backendResult.filesGenerated.length,
      dependencies: backendResult.dependencies.length
    })
    
    // Emit progress event
    workflowEvents.emitProgress(this.state.id, {
      step: 3,
      totalSteps: this.state.totalSteps,
      status: 'generating-backend',
      message: 'Backend generation completed',
      progress: Math.round((3 / this.state.totalSteps) * 100)
    })
    
    return backendResult
  }
  
  /**
   * Step 4: Generate frontend with Agent 4
   */
  private async generateFrontend(expansion: any): Promise<any> {
    console.log('[Workflow] 🤖 Agent 4: Generating frontend...')
    
    const results = []
    
    // Generate pages
    if (expansion.frontend?.pages) {
      for (const page of expansion.frontend.pages) {
        const pageResult = await agent4GenerateFrontend({
          projectId: this.state.id,
          projectPath: this.state.projectPath,
          task: {
            type: 'page',
            description: `${page} page`,
            specifications: {
              route: page,
              responsive: expansion.frontend.responsive,
              styling: expansion.frontend.styling
            }
          }
        })
        results.push(pageResult)
      }
    }
    
    const frontendResult = {
      success: results.every(r => r.success),
      filesGenerated: results.flatMap(r => r.filesGenerated || []),
      dependencies: [...new Set(results.flatMap(r => r.dependencies || []))],
      nextSteps: results.flatMap(r => r.nextSteps || [])
    }
    
    console.log('[Workflow] ✅ Agent 4 completed:', {
      filesGenerated: frontendResult.filesGenerated.length,
      dependencies: frontendResult.dependencies.length
    })
    
    // Emit progress event
    workflowEvents.emitProgress(this.state.id, {
      step: 4,
      totalSteps: this.state.totalSteps,
      status: 'generating-frontend',
      message: 'Frontend generation completed',
      progress: Math.round((4 / this.state.totalSteps) * 100)
    })
    
    return frontendResult
  }
  
  /**
   * Step 5: Run tests with Agent 5
   */
  private async runTests(): Promise<any> {
    console.log('[Workflow] 🤖 Agent 5: Running tests...')
    
    const allFiles = [
      ...(this.state.results.backend?.filesGenerated || []),
      ...(this.state.results.frontend?.filesGenerated || [])
    ]
    
    const targetFiles = allFiles
      .filter(f => !f.path.includes('test'))
      .map(f => f.path)
    
    if (targetFiles.length === 0) {
      console.log('[Workflow] ⚠️ No files to test, skipping...')
      return { success: true, message: 'No files to test' }
    }
    
    const testResult = await agent5TestingQA({
      projectId: this.state.id,
      projectPath: this.state.projectPath,
      task: {
        type: 'generate-tests',
        targetFiles: targetFiles.slice(0, 5), // Limit to 5 files for now
        testFramework: 'jest'
      }
    })
    
    console.log('[Workflow] ✅ Agent 5 completed:', testResult)
    
    // Emit progress event
    workflowEvents.emitProgress(this.state.id, {
      step: 5,
      totalSteps: this.state.totalSteps,
      status: 'testing',
      message: 'Testing completed',
      progress: Math.round((5 / this.state.totalSteps) * 100)
    })
    
    return testResult
  }
  
  /**
   * Step 6: Deploy with Agent 6
   */
  private async deploy(): Promise<any> {
    console.log('[Workflow] 🤖 Agent 6: Deploying...')
    
    const deployResult = await agent6Deploy({
      projectId: this.state.id,
      projectPath: this.state.projectPath,
      task: {
        type: 'deploy',
        platform: 'vercel',
        environment: 'production'
      }
    })
    
    console.log('[Workflow] ✅ Agent 6 completed:', deployResult)
    
    // Emit progress event
    workflowEvents.emitProgress(this.state.id, {
      step: 6,
      totalSteps: this.state.totalSteps,
      status: 'deploying',
      message: 'Deployment completed',
      progress: Math.round((6 / this.state.totalSteps) * 100)
    })
    
    return deployResult
  }
  
  /**
   * Step 7: Setup monitoring with Agent 7
   */
  private async setupMonitoring(): Promise<any> {
    console.log('[Workflow] 🤖 Agent 7: Setting up monitoring...')
    
    const monitorResult = await agent7Monitor({
      projectId: this.state.id,
      task: {
        type: 'health-check'
      }
    })
    
    console.log('[Workflow] ✅ Agent 7 completed:', monitorResult)
    
    // Emit progress event
    workflowEvents.emitProgress(this.state.id, {
      step: 7,
      totalSteps: this.state.totalSteps,
      status: 'monitoring',
      message: 'Monitoring setup completed',
      progress: Math.round((7 / this.state.totalSteps) * 100)
    })
    
    return monitorResult
  }
  
  /**
   * Package project files
   */
  private async packageProject(): Promise<any> {
    console.log('[Workflow] Packaging project files...')
    
    // Collect all generated files
    const allFiles = [
      ...(this.state.results.backend?.filesGenerated || []),
      ...(this.state.results.frontend?.filesGenerated || []),
      ...(this.state.results.testing?.testsGenerated || [])
    ]
    
    // Create project structure
    const projectPath = await this.projectManager.createProjectStructure({
      projectId: this.state.id,
      projectName: this.state.projectName,
      userId: this.state.userId,
      files: allFiles,
      dependencies: [
        ...(this.state.results.backend?.dependencies || []),
        ...(this.state.results.frontend?.dependencies || [])
      ]
    })
    
    // Package as ZIP
    const pkg = await this.projectManager.packageProject(projectPath, this.state.id)
    
    // Upload to Supabase Storage
    const downloadUrl = await this.projectManager.uploadToStorage(pkg, this.state.userId)
    
    console.log('[Workflow] ✅ Project packaged and uploaded')
    
    return {
      zipPath: pkg.zipPath,
      downloadUrl,
      size: pkg.size,
      fileCount: pkg.fileCount
    }
  }
  
  /**
   * Update workflow status
   */
  private async updateStatus(status: WorkflowState['status'], step: number): Promise<void> {
    this.state.status = status
    this.state.currentStep = step
    this.state.progress = Math.round((step / this.state.totalSteps) * 100)
    this.state.updatedAt = new Date().toISOString()
    
    console.log(`[Workflow] ${status} (${this.state.progress}%)`)
    
    // Emit progress event for real-time updates
    workflowEvents.emitProgress(this.state.id, {
      step,
      totalSteps: this.state.totalSteps,
      status,
      message: `Step ${step}/${this.state.totalSteps}: ${status}`,
      progress: this.state.progress
    })
    
    // Emit status event
    workflowEvents.emitStatus(this.state.id, {
      status,
      message: `Workflow is ${status}`
    })
  }
  
  /**
   * Save state to database
   */
  private async saveState(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('workflows')
        .upsert({
          id: this.state.id,
          user_id: this.state.userId,
          project_name: this.state.projectName,
          status: this.state.status,
          current_step: this.state.currentStep,
          total_steps: this.state.totalSteps,
          progress: this.state.progress,
          results: this.state.results as any,
          errors: this.state.errors,
          created_at: this.state.createdAt,
          updated_at: this.state.updatedAt
        } as any)
      
      if (error) {
        console.error('[Workflow] Error saving state:', error)
      }
    } catch (error) {
      console.error('[Workflow] Error saving state:', error)
    }
  }
  
  /**
   * Get current state
   */
  getState(): WorkflowState {
    return { ...this.state }
  }
  
  /**
   * Helper: Generate unique ID
   */
  private generateId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Helper: Sanitize project name
   */
  private sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
  
  /**
   * Helper: Detect project type
   */
  private detectProjectType(prompt: string): string {
    const lower = prompt.toLowerCase()
    
    if (lower.includes('blog')) return 'blog'
    if (lower.includes('ecommerce') || lower.includes('shop')) return 'ecommerce'
    if (lower.includes('dashboard') || lower.includes('admin')) return 'dashboard'
    if (lower.includes('api')) return 'api'
    
    return 'web-app'
  }
  
  /**
   * Helper: Extract features
   */
  private extractFeatures(prompt: string): string[] {
    const features = []
    const lower = prompt.toLowerCase()
    
    if (lower.includes('auth') || lower.includes('login')) features.push('authentication')
    if (lower.includes('crud')) features.push('crud')
    if (lower.includes('search')) features.push('search')
    if (lower.includes('upload')) features.push('file-upload')
    if (lower.includes('payment')) features.push('payment')
    if (lower.includes('chat')) features.push('chat')
    
    return features
  }
  
  /**
   * Helper: Estimate complexity
   */
  private estimateComplexity(prompt: string): 'simple' | 'medium' | 'complex' {
    const features = this.extractFeatures(prompt)
    
    if (features.length <= 2) return 'simple'
    if (features.length <= 5) return 'medium'
    return 'complex'
  }
}

/**
 * Get workflow status
 */
export async function getWorkflowStatus(workflowId: string): Promise<WorkflowState | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return {
    id: data.id,
    userId: data.user_id,
    projectName: data.project_name,
    projectPath: `/tmp/projects/${data.user_id}/${data.project_name}`,
    status: data.status,
    currentStep: data.current_step,
    totalSteps: data.total_steps,
    progress: data.progress,
    results: data.results || {},
    errors: data.errors || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

/**
 * Cancel workflow
 */
export async function cancelWorkflow(workflowId: string): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { error } = await supabase
    .from('workflows')
    .update({
      status: 'failed',
      errors: ['Cancelled by user'],
      updated_at: new Date().toISOString()
    })
    .eq('id', workflowId)
  
  return !error
}
