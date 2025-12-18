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
        JSON.stringify({ error: 'Nur Administratoren können Benutzer erstellen' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, password, fullName, username, role } = await req.json();

    // Validate inputs
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'E-Mail und Passwort sind erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Passwort muss mindestens 6 Zeichen lang sein' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating user with email: ${email}, fullName: ${fullName}, role: ${role}`);

    // Create the user in auth.users
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: fullName || '',
      },
    });

    if (createError) {
      console.error('Error creating user:', createError);
      
      if (createError.message.includes('already been registered')) {
        // User exists in auth.users - check if profile exists
        console.log('User already exists, checking for orphaned profile...');
        
        // Find the existing user by email
        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          console.error('Error listing users:', listError);
          return new Response(
            JSON.stringify({ error: 'Diese E-Mail-Adresse ist bereits registriert' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        
        if (existingUser) {
          // Check if profile exists
          const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('id', existingUser.id)
            .single();
          
          if (profileCheckError && profileCheckError.code === 'PGRST116') {
            // Profile doesn't exist - create it
            console.log('Creating missing profile for existing user:', existingUser.id);
            
            const { error: profileInsertError } = await supabaseAdmin
              .from('profiles')
              .insert({
                id: existingUser.id,
                email: existingUser.email!,
                full_name: fullName || existingUser.user_metadata?.full_name || '',
                username: username || null,
              });
            
            if (profileInsertError) {
              console.error('Error creating profile:', profileInsertError);
              return new Response(
                JSON.stringify({ error: 'Benutzer existiert, aber Profil konnte nicht erstellt werden' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            
            // Assign role if specified
            if (role && role !== 'user') {
              const { error: roleInsertError } = await supabaseAdmin
                .from('user_roles')
                .upsert({
                  user_id: existingUser.id,
                  role: role,
                }, { onConflict: 'user_id,role' });
              
              if (roleInsertError) {
                console.error('Error assigning role:', roleInsertError);
              }
            }
            
            console.log('Profile created successfully for existing user');
            return new Response(
              JSON.stringify({ 
                success: true, 
                user: {
                  id: existingUser.id,
                  email: existingUser.email,
                  fullName: fullName || '',
                },
                message: 'Benutzer existierte bereits, Profil wurde erstellt'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        return new Response(
          JSON.stringify({ error: 'Diese E-Mail-Adresse ist bereits registriert und hat ein Profil' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Fehler beim Erstellen des Benutzers: ${createError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User created successfully:', newUser.user.id);

    // Update the profile with username if provided
    if (username) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ username })
        .eq('id', newUser.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
    }

    // Assign role if specified
    if (role && role !== 'user') {
      const { error: roleInsertError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role: role,
        });

      if (roleInsertError) {
        console.error('Error assigning role:', roleInsertError);
      } else {
        console.log(`Role ${role} assigned to user`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          fullName: fullName || '',
        }
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
