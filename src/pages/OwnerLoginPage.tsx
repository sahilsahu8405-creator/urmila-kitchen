import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../components/common/BrandLogo';
import { useOwnerAuth } from '../context/OwnerAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export const OwnerLoginPage: React.FC = () => {
  const { isOwner, signIn, devBypassLogin } = useOwnerAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOwner) {
      navigate('/owner');
    }
  }, [isOwner, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = await signIn(email, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid owner credentials.');
    } else {
      navigate('/owner');
    }
    setIsLoading(false);
  };

  const handleDevBypass = () => {
    devBypassLogin();
    navigate('/owner');
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-3">
          <BrandLogo size="lg" />
        </Link>
        <span className="text-xs uppercase tracking-widest font-semibold text-olive block">
          Kitchen Management Portal
        </span>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-forest">
          Owner Sign In
        </h2>
        <p className="mt-1 text-xs text-charcoal/70">
          Authorized owner access only. Public administrator registration is strictly disabled.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-cream-light py-8 px-6 sm:px-10 rounded-3xl border border-borderLight shadow-card space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="owner@urmilaskitchen.com"
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
                  placeholder="••••••••••••"
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
              <span>{isLoading ? 'Verifying...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Dev Access for Local Preview */}
          <div className="pt-4 border-t border-borderLight text-center space-y-2">
            <p className="text-[11px] text-charcoal/60">
              Testing locally? Click below to test owner dashboard directly:
            </p>
            <button
              type="button"
              onClick={handleDevBypass}
              className="w-full py-2.5 px-4 rounded-xl border border-forest/30 bg-forest/5 text-forest text-xs font-bold hover:bg-forest/10 flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              <span>Preview Owner Dashboard (Local Demo Mode)</span>
            </button>
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

