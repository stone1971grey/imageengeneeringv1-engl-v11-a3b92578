import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UploadRequest {
  fileName: string;
  fileData: string; // base64 encoded
  bucket: string;
  folder?: string;
  segmentId?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[upload-image] Request received');

    // Create Supabase client with service role for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is authenticated and has admin/editor role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[upload-image] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No auth header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user role using the auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[upload-image] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[upload-image] User authenticated:', user.email);

    // Check if user has admin or editor role
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'editor']);

    if (roleError || !roles || roles.length === 0) {
      console.error('[upload-image] Role check failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Requires admin or editor role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[upload-image] User has role:', roles[0].role);

    // Parse request body
    const body: UploadRequest = await req.json();
    const { fileName, fileData, bucket, folder, segmentId } = body;

    console.log('[upload-image] Upload params:', { fileName, bucket, folder, segmentId });

    if (!fileName || !fileData || !bucket) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fileName, fileData, bucket' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode base64 file data
    const base64Data = fileData.split(',')[1] || fileData;
    const fileBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    console.log('[upload-image] File size:', fileBytes.length, 'bytes');

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = segmentId 
      ? `${folder || 'uploads'}/segment-${segmentId}-${timestamp}.${fileExt}`
      : `${folder || 'uploads'}/${timestamp}-${fileName}`;

    console.log('[upload-image] Uploading to path:', uniqueFileName);

    // Upload to storage using service role (bypasses RLS)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, fileBytes, {
        contentType: `image/${fileExt}`,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('[upload-image] Upload error:', uploadError);
      return new Response(
        JSON.stringify({ 
          error: 'Upload failed', 
          details: uploadError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[upload-image] Upload successful:', uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniqueFileName);

    console.log('[upload-image] Public URL:', publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        url: publicUrl,
        path: uniqueFileName
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[upload-image] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
