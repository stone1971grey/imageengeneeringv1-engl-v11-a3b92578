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
  pageSlug?: string; // NEW: For automatic folder structure creation
}

/**
 * Creates folder hierarchy in media_folders table based on page slug
 * Returns the deepest folder's ID and full storage path
 */
async function ensureFolderHierarchy(
  supabase: any,
  pageSlug: string,
  userId: string
): Promise<{ folderId: string; storagePath: string }> {
  console.log('[ensureFolderHierarchy] Creating folder structure for:', pageSlug);
  
  // Parse page slug into folder segments
  // Example: "styleguide/segments/product-page" -> ["styleguide", "segments", "product-page"]
  const segments = pageSlug.split('/').filter(s => s.trim().length > 0);
  
  let currentParentId: string | null = null;
  let currentPath = '';
  
  // Iterate through each segment and ensure folder exists
  for (let i = 0; i < segments.length; i++) {
    const folderName = segments[i];
    currentPath = segments.slice(0, i + 1).join('/');
    
    console.log(`[ensureFolderHierarchy] Processing: ${folderName}, path: ${currentPath}, parent: ${currentParentId}`);
    
    // Check if folder already exists
    const queryResult = await supabase
      .from('media_folders')
      .select('id, storage_path')
      .eq('storage_path', currentPath)
      .maybeSingle();
    
    if (queryResult.error) {
      console.error('[ensureFolderHierarchy] Query error:', queryResult.error);
      throw new Error(`Failed to query folder: ${queryResult.error.message}`);
    }
    
    if (queryResult.data) {
      console.log(`[ensureFolderHierarchy] Folder exists: ${queryResult.data.id}`);
      currentParentId = queryResult.data.id;
      continue;
    }
    
    // Folder doesn't exist, create it
    console.log(`[ensureFolderHierarchy] Creating folder: ${folderName}`);
    
    const insertResult: any = await supabase
      .from('media_folders')
      .insert({
        name: folderName,
        storage_path: currentPath,
        parent_id: currentParentId,
        created_by: userId
      })
      .select()
      .single();
    
    if (insertResult.error) {
      console.error('[ensureFolderHierarchy] Insert error:', insertResult.error);
      throw new Error(`Failed to create folder: ${insertResult.error.message}`);
    }
    
    const createdFolder: any = insertResult.data;
    if (!createdFolder) {
      throw new Error('Failed to create folder: No data returned');
    }
    
    console.log(`[ensureFolderHierarchy] Created folder: ${createdFolder.id}`);
    currentParentId = createdFolder.id;
  }
  
  return {
    folderId: currentParentId!,
    storagePath: currentPath
  };
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
    const authResult = await supabase.auth.getUser(token);
    
    if (authResult.error || !authResult.data.user) {
      console.error('[upload-image] Auth error:', authResult.error);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = authResult.data.user;
    console.log('[upload-image] User authenticated:', user.email);

    // Check if user has admin or editor role
    const rolesResult = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'editor']);

    if (rolesResult.error || !rolesResult.data || rolesResult.data.length === 0) {
      console.error('[upload-image] Role check failed:', rolesResult.error);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Requires admin or editor role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[upload-image] User has role:', rolesResult.data[0].role);

    // Parse request body
    const body: UploadRequest = await req.json();
    const { fileName, fileData, bucket, folder, segmentId, pageSlug } = body;

    console.log('[upload-image] Upload params:', { fileName, bucket, folder, segmentId, pageSlug });

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

    // Determine upload path based on pageSlug
    let uploadPath: string;
    let folderInfo: { folderId: string; storagePath: string } | null = null;
    
    if (pageSlug) {
      // Create folder hierarchy in media_folders and get storage path
      try {
        folderInfo = await ensureFolderHierarchy(supabase, pageSlug, user.id);
        console.log('[upload-image] Folder hierarchy created:', folderInfo);
        
        // Use the folder structure for storage path
        const timestamp = Date.now();
        const fileExt = fileName.split('.').pop();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        uploadPath = `${folderInfo.storagePath}/${timestamp}-${sanitizedFileName}`;
      } catch (hierarchyError) {
        console.error('[upload-image] Failed to create folder hierarchy:', hierarchyError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create folder structure', 
            details: hierarchyError instanceof Error ? hierarchyError.message : 'Unknown error'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Fallback to old logic if no pageSlug provided
      const timestamp = Date.now();
      const fileExt = fileName.split('.').pop();
      uploadPath = segmentId 
        ? `${folder || 'uploads'}/segment-${segmentId}-${timestamp}.${fileExt}`
        : `${folder || 'uploads'}/${timestamp}-${fileName}`;
    }

    console.log('[upload-image] Uploading to path:', uploadPath);

    // Upload to storage using service role (bypasses RLS)
    const uploadResult = await supabase.storage
      .from(bucket)
      .upload(uploadPath, fileBytes, {
        contentType: `image/${fileName.split('.').pop()}`,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadResult.error) {
      console.error('[upload-image] Upload error:', uploadResult.error);
      return new Response(
        JSON.stringify({ 
          error: 'Upload failed', 
          details: uploadResult.error.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[upload-image] Upload successful:', uploadResult.data);

    // Get public URL
    const urlResult = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadPath);

    console.log('[upload-image] Public URL:', urlResult.data.publicUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        url: urlResult.data.publicUrl,
        path: uploadPath,
        folderId: folderInfo?.folderId || null,
        folderPath: folderInfo?.storagePath || null
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
