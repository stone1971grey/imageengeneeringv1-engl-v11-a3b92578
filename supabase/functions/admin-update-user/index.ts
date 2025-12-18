import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Nicht autorisiert' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Nicht autorisiert' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if requesting user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('Role check failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Nur Administratoren können Benutzer aktualisieren' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, password, email } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Benutzer-ID ist erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Updating user ${userId}, password: ${password ? 'yes' : 'no'}, email: ${email ? 'yes' : 'no'}`);

    // Build update object
    const updateData: { password?: string; email?: string } = {};
    
    if (password && password.length >= 6) {
      updateData.password = password;
    }
    
    if (email) {
      updateData.email = email;
    }

    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Keine Änderungen erforderlich' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the user in auth.users
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      updateData
    );

    if (updateError) {
      console.error('Error updating user:', updateError);
      return new Response(
        JSON.stringify({ error: `Fehler beim Aktualisieren: ${updateError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Benutzer erfolgreich aktualisiert'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return new Response(
      JSON.stringify({ error: `Unerwarteter Fehler: ${errorMessage}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
