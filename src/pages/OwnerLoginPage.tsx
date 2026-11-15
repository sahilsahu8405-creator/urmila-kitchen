import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../components/common/BrandLogo';
import { useOwnerAuth } from '../context/OwnerAuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';

export const OwnerLoginPage: React.FC = () => {
  const { isOwner, signIn, signInWithPin } = useOwnerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [authMode, setAuthMode] = useState<'pin' | 'password'>('pin');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to destination or /owner
  useEffect(() => {
    if (isOwner) {
      const destination = (location.state as any)?.from?.pathname || '/owner';
      navigate(destination, { replace: true });
    }
  }, [isOwner, navigate, location]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!pin || pin.length < 4) {
      setErrorMessage('Please enter your complete Kitchen PIN.');
      return;
    }

    setIsLoading(true);
    const res = await signInWithPin(pin);
    if (!res.success) {
      setErrorMessage(res.error || 'Incorrect Kitchen PIN.');
    } else {
      navigate('/owner', { replace: true });
    }
    setIsLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage('Please enter both owner email and password.');
      return;
    }

    setIsLoading(true);
    const res = await signIn(email, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid owner credentials.');
    } else {
      navigate('/owner', { replace: true });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-3">
          <BrandLogo size="lg" />
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-forest" />
          <span>Restricted Portal</span>
        </div>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-forest">
          Kitchen Owner Sign In
        </h2>
        <p className="mt-1 text-xs text-charcoal/70">
          Authorized owner access only. Unauthenticated access is strictly blocked.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-cream-light py-8 px-6 sm:px-10 rounded-3xl border border-borderLight shadow-card space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-cream rounded-2xl border border-borderLight">
            <button
              type="button"
              onClick={() => {
                setAuthMode('pin');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                authMode === 'pin'
                  ? 'bg-forest text-cream shadow-sm'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Kitchen PIN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                authMode === 'password'
                  ? 'bg-forest text-cream shadow-sm'
                  : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {authMode === 'pin' ? (
            <form onSubmit={handlePinSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-charcoal/80 mb-1.5">
                  Owner Security PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="current-password"
                    maxLength={10}
                    required
                    autoFocus
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 6-digit PIN"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream border border-borderLight text-base tracking-widest font-mono text-charcoal placeholder:tracking-normal placeholder:font-sans placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                  <KeyRound className="w-4 h-4 text-charcoal/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-1.5 text-[11px] text-charcoal/60 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-forest/70 shrink-0" />
                  <span>Authorized kitchen access only</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full bg-forest text-cream font-bold text-sm hover:bg-forest-light transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying PIN...' : 'Unlock Owner Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal/80 mb-1">
                  Owner Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter registered email"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                  <Mail className="w-4 h-4 text-charcoal/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/80 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-cream border border-borderLight text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                  <Lock className="w-4 h-4 text-charcoal/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full bg-forest text-cream font-bold text-sm hover:bg-forest-light transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In with Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-borderLight text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal/60">
              <ShieldCheck className="w-3.5 h-3.5 text-olive" />
              <span>Strict Route Protection Active</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs font-semibold text-forest hover:underline">
            ← Return to Customer Website
          </Link>
        </div>
      </div>
    </div>
  );
};
