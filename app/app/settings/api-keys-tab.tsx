'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Key, Check, X, Loader2, RefreshCw } from 'lucide-react';

interface APIKey {
  id: string;
  provider: string;
  key_hash: string;
  masked_key: string;
  last_used: string | null;
  created_at: string;
}

export function APIKeysTab() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newApiKey, setNewApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      setError('Failed to fetch API keys');
      console.error('Error fetching API keys:', error);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKey.trim()) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'streamlake',
          key: newApiKey.trim(),
          user_id: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save API key');
      }

      setSuccess('API key saved successfully!');
      setNewApiKey('');
      fetchAPIKeys();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (keyId: string) => {
    setIsTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const response = await fetch('/api/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key_id: keyId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to test connection');
      }

      setTestResult({ success: true, message: result.message });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    setIsDeleting(keyId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      setSuccess('API key deleted successfully!');
      fetchAPIKeys();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete API key');
    } finally {
      setIsDeleting(null);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    setTestResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">API Keys</h2>
        <p className="text-muted-foreground">
          Manage your Streamlake API keys for use with Mr.Prompt
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="max-w-md bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"} className="max-w-md">
          <AlertDescription>
            {testResult.success ? (
              <span className="text-green-800 flex items-center gap-2">
                <Check className="h-4 w-4" />
                {testResult.message}
              </span>
            ) : (
              <span className="text-red-800 flex items-center gap-2">
                <X className="h-4 w-4" />
                {testResult.message}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Add New API Key Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Add New API Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddKey} className="space-y-4">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-foreground mb-2">
                Streamlake API Key
              </label>
              <Input
                id="api-key"
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="Enter your Streamlake API key"
                disabled={isSaving}
                className="max-w-md"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Your API key will be encrypted and securely stored
              </p>
            </div>
            <Button type="submit" disabled={isSaving || !newApiKey.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Key'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Saved API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No API keys saved yet. Add your first key above.
            </p>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{key.provider}</span>
                      <span className="text-sm text-muted-foreground">
                        Created: {new Date(key.created_at).toLocaleDateString()}
                      </span>
                      {key.last_used && (
                        <span className="text-sm text-muted-foreground">
                          Last used: {new Date(key.last_used).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block">
                      {key.masked_key}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(key.id)}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteKey(key.id)}
                      disabled={isDeleting === key.id}
                    >
                      {isDeleting === key.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}