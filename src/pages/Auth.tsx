import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Loader2, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { loginSchema, emailSchema } from "@/lib/validation";
import { z } from "zod";

type Mode = "signin" | "signup" | "forgot";

export default function Auth() {
  const navigate = useNavigate();
  const { user, isAdmin, signIn, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user && isAdmin) navigate("/admin");
  }, [user, isAdmin, navigate]);

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    try {
      loginSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) return setError(err.errors[0].message);
    }
    setLoading(true);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) setError("Invalid email or password");
        else if (signInError.message.includes("Email not confirmed")) setError("Please verify your email address");
        else setError(signInError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    try {
      loginSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) return setError(err.errors[0].message);
    }
    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (signUpError) {
        if (signUpError.message.includes("already registered")) setError("This email is already registered. Please sign in.");
        else setError(signUpError.message);
        return;
      }
      setSuccess("Account created. The first registered user automatically receives admin access. Signing you in...");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) return setError(err.errors[0].message);
    }
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSuccess("Password reset email sent. Check your inbox (and spam folder).");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block mb-6">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Access</h1>
          <p className="text-muted-foreground">Secure access to the administration panel</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-primary/40">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); resetMessages(); }}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="forgot">Forgot</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <EmailField email={email} setEmail={setEmail} disabled={loading} />
                  <PasswordField password={password} setPassword={setPassword} disabled={loading} />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : <><Shield className="w-4 h-4 mr-2" />Sign In</>}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); resetMessages(); }}
                    className="text-xs text-primary hover:underline w-full text-center"
                  >
                    Forgot password?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <EmailField email={email} setEmail={setEmail} disabled={loading} />
                  <PasswordField password={password} setPassword={setPassword} disabled={loading} />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Account"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    The first registered user automatically receives admin privileges.
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="forgot">
                <form onSubmit={handleForgot} className="space-y-4 mt-4">
                  <EmailField email={email} setEmail={setEmail} disabled={loading} />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : "Send reset email"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    We'll email you a secure link to set a new password.
                  </p>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Unauthorized access attempts are logged.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function EmailField({ email, setEmail, disabled }: { email: string; setEmail: (v: string) => void; disabled: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" disabled={disabled} autoComplete="email" />
      </div>
    </div>
  );
}

function PasswordField({ password, setPassword, disabled }: { password: string; setPassword: (v: string) => void; disabled: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" disabled={disabled} autoComplete="current-password" />
      </div>
    </div>
  );
}
