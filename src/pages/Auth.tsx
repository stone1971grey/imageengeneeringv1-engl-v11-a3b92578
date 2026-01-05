import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Session } from "@supabase/supabase-js";
import { Eye, EyeOff } from "lucide-react";
import logoIE from "@/assets/logo-ie-new-v7.png";
import spadeCmsLogo from "@/assets/spade-cms-logo.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginIdentifier, setLoginIdentifier] = useState(""); // Can be username or email
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Redirect to admin dashboard Welcome page (no page parameter = Welcome screen)
          setTimeout(() => {
            // Clear any saved page selection so user lands on Welcome page
            sessionStorage.removeItem("admin_selected_page");
            navigate("/en/admin-dashboard");
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Also clear sessionStorage here for existing sessions
        sessionStorage.removeItem("admin_selected_page");
        navigate("/en/admin-dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!signupEmail || !password) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const redirectUrl = `${window.location.origin}/admin-dashboard`;

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created successfully! Redirecting...");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!loginIdentifier || !password) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    let emailToUse = loginIdentifier;

    // Check if input is a username (no @ symbol) - need to look up the email
    if (!loginIdentifier.includes('@')) {
      const { data: profile, error: lookupError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', loginIdentifier)
        .maybeSingle();

      if (lookupError) {
        console.error('Username lookup error:', lookupError);
        toast.error("Fehler bei der Benutzersuche");
        setLoading(false);
        return;
      }

      if (!profile) {
        toast.error("Benutzername nicht gefunden");
        setLoading(false);
        return;
      }

      emailToUse = profile.email;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully! Redirecting...");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-white rounded-xl px-6 py-3 shadow-lg flex items-center justify-between gap-4 w-full max-w-sm">
              <img 
                src={spadeCmsLogo} 
                alt="SpadeCMS" 
                className="h-12 w-auto"
              />
              <Badge variant="outline" className="bg-[#4B7BF5] text-white border-[#4B7BF5] text-xs font-semibold">
                v1.0.7
              </Badge>
            </div>
          </div>
          <div className="border-t border-zinc-700 my-4" />
          <div className="flex justify-center">
            <img 
              src={logoIE} 
              alt="Image Engineering" 
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl text-center text-white">
            Login
          </CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginIdentifier" className="text-zinc-300">
                Benutzername oder E-Mail
              </Label>
              <Input
                id="loginIdentifier"
                type="text"
                placeholder="Benutzername oder email@example.com"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                disabled={loading}
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
