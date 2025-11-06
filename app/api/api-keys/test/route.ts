import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { decryptSecret } from '@/utils/security';

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key_id } = await request.json();

    if (!key_id) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    // Fetch the encrypted key
    const { data: apiKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, provider, encrypted_key')
      .eq('id', key_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Decrypt the key
    const decryptedKey = decryptSecret(apiKey.encrypted_key);

    // Test the connection with Streamlake
    try {
      const testResponse = await fetch('https://api.streamlake.ai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${decryptedKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (testResponse.ok) {
        // Update last_used timestamp
        await supabase
          .from('api_keys')
          .update({ last_used: new Date().toISOString() })
          .eq('id', key_id)
          .eq('user_id', user.id);

        return NextResponse.json({
          success: true,
          message: 'Connection test successful!'
        });
      } else {
        const errorData = await testResponse.text();
        return NextResponse.json({
          success: false,
          message: `Streamlake API error: ${errorData || 'Unknown error'}`
        }, { status: testResponse.status });
      }
    } catch (testError) {
      return NextResponse.json({
        success: false,
        message: `Connection test failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error testing API key:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to test API key' },
      { status: 500 }
    );
  }
}