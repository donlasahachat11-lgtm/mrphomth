'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function GeneratePage() {
  const router = useRouter()
  const [projectName, setProjectName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectName,
          prompt,
          options: {
            skipTesting: false,
            skipDeployment: false
          }
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start workflow')
      }
      
      // Redirect to workflow status page
      router.push(`/generate/${data.workflowId}`)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🚀 Generate Your Project
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Describe your project in natural language, and our AI will generate complete code for you
            </p>
          </div>
          
          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="my-awesome-project"
                  required
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Use lowercase letters, numbers, and hyphens only
                </p>
              </div>
              
              {/* Prompt */}
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Description
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Example: Create a blog platform with user authentication, CRUD operations for posts, comments, and a responsive dashboard with analytics"
                  required
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Be specific about features, technologies, and requirements
                </p>
              </div>
              
              {/* Examples */}
              <Alert variant="info">
                <AlertDescription>
                  <h3 className="font-medium mb-2">
                    💡 Example Prompts:
                  </h3>
                  <ul className="space-y-1">
                    <li>• "Create a task management app with drag-and-drop, user auth, and real-time updates"</li>
                    <li>• "Build an e-commerce store with product catalog, shopping cart, and Stripe payment"</li>
                    <li>• "Make a social media dashboard with posts, likes, comments, and user profiles"</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              {/* Error */}
              {error && (
                <Alert variant="error">
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Submit Button */}
              <Button
                type="submit"
                isLoading={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Starting Generation...' : '🚀 Generate Project'}
              </Button>
            </form>
          </div>
          
          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Fast Generation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete project in 10-15 minutes
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Production Ready
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Clean code with tests and deployment
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                AI Powered
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                7 specialized agents working together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
