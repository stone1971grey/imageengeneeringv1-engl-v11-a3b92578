import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header to verify the caller is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[admin-delete-user] No authorization header')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract the JWT token from the header
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      console.error('[admin-delete-user] No token in authorization header')
      return new Response(
        JSON.stringify({ error: 'No token provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the JWT token and get the user
    const { data: { user: callerUser }, error: userError } = await adminClient.auth.getUser(token)
    
    if (userError || !callerUser) {
      console.error('[admin-delete-user] Failed to verify token:', userError)
      return new Response(
        JSON.stringify({ error: 'Ungültiges Token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[admin-delete-user] Caller verified:', callerUser.email)

    // Verify caller is an admin
    const { data: callerRoles, error: rolesError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUser.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (rolesError || !callerRoles) {
      console.error('[admin-delete-user] Caller is not an admin:', rolesError)
      return new Response(
        JSON.stringify({ error: 'Only admins can delete users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { userId } = await req.json()

    if (!userId) {
      console.error('[admin-delete-user] No userId provided')
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[admin-delete-user] Attempting to delete user:', userId)

    // Prevent deleting self
    if (userId === callerUser.id) {
      console.error('[admin-delete-user] Cannot delete self')
      return new Response(
        JSON.stringify({ error: 'Sie können sich nicht selbst löschen' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user to delete is the last admin
    const { data: admins } = await adminClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')

    const isTargetAdmin = admins?.some(a => a.user_id === userId)
    if (isTargetAdmin && admins && admins.length <= 1) {
      console.error('[admin-delete-user] Cannot delete last admin')
      return new Response(
        JSON.stringify({ error: 'Der letzte Admin kann nicht gelöscht werden' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Delete user roles
    const { error: rolesDeleteError } = await adminClient
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    if (rolesDeleteError) {
      console.error('[admin-delete-user] Error deleting roles:', rolesDeleteError)
      // Continue anyway, the auth user delete should cascade
    }

    // Delete editor page access
    const { error: accessDeleteError } = await adminClient
      .from('editor_page_access')
      .delete()
      .eq('user_id', userId)

    if (accessDeleteError) {
      console.error('[admin-delete-user] Error deleting editor access:', accessDeleteError)
      // Continue anyway
    }

    // Delete profile (this might fail due to foreign key constraints, but auth.users cascade should handle it)
    const { error: profileDeleteError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileDeleteError) {
      console.error('[admin-delete-user] Error deleting profile:', profileDeleteError)
      // Continue anyway - the auth user delete is the main goal
    }

    // Delete the auth user using admin API
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId)

    if (authDeleteError) {
      console.error('[admin-delete-user] Error deleting auth user:', authDeleteError)
      return new Response(
        JSON.stringify({ error: 'Fehler beim Löschen des Auth-Benutzers: ' + authDeleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[admin-delete-user] Successfully deleted user:', userId)

    return new Response(
      JSON.stringify({ success: true, message: 'Benutzer erfolgreich gelöscht' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[admin-delete-user] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Interner Serverfehler: ' + (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})