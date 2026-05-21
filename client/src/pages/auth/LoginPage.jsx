import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Loader2, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, signUpWithEmail, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setError('');
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(getFriendlyError(err.code || err.message));
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoggingIn(true);
      setError('');
      if (mode === 'signup') {
        await signUpWithEmail(form.email, form.password, form.name);
      } else {
        await loginWithEmail(form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(getFriendlyError(err.code || err.message));
      setIsLoggingIn(false);
    }
  };

  const getFriendlyError = (codeOrMessage) => {
    if (!codeOrMessage) return '';
    
    // Parse code from parentheses if it's a full Firebase error message string
    const codeMatch = String(codeOrMessage).match(/\((auth\/[^)]+)\)/);
    const code = codeMatch ? codeMatch[1] : codeOrMessage;

    const map = {
      'auth/invalid-email': 'Invalid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Incorrect email or password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/configuration-not-found': 'Auth not configured. Enable it in Firebase Console.',
      'auth/unauthorized-domain': 'This domain is not authorized in your Firebase Console. Add it to Authentication > Settings > Authorized domains.',
    };
    return map[code] || String(codeOrMessage);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#09090B] text-foreground p-6 selection:bg-white/10 relative overflow-hidden">
      
      {/* Abstract Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-sm z-10 animate-fade-up" style={{ animationDelay: '100ms' }}>
        
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-display font-bold text-black text-2xl mx-auto mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            S
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white mb-3">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="font-body text-zinc-400 font-light">
            {mode === 'login' ? 'Sign in to continue to Safarnama.' : 'Start planning your next trip.'}
          </p>
        </div>

        {/* Card */}
        <div className="p-1.5 rounded-[2rem] bg-white/[0.03] ring-1 ring-white/10 shadow-2xl backdrop-blur-3xl">
          <div className="rounded-[calc(2rem-6px)] bg-[#121214] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            
            {/* Error Toast */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body animate-fade-up">
                {error}
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4 mb-6">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-400 text-xs font-body">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-zinc-600 font-body focus:ring-white/20 focus:border-white/20"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-400 text-xs font-body">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-zinc-600 font-body focus:ring-white/20 focus:border-white/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-400 text-xs font-body">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-zinc-600 font-body pr-12 focus:ring-white/20 focus:border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-12 rounded-xl bg-white text-black hover:bg-zinc-200 font-body font-semibold text-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#121214] px-3 text-zinc-600 font-body">or</span>
              </div>
            </div>

            {/* Google Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              variant="outline"
              className="w-full h-12 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 font-body font-medium text-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            {/* Toggle Mode */}
            <p className="mt-6 text-center text-sm text-zinc-500 font-body">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                className="text-white hover:underline underline-offset-4 font-medium transition-colors"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>

            <p className="mt-4 text-xs text-zinc-600 font-body leading-relaxed font-light text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
