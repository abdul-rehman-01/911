import React, { useState } from 'react';
import { useApp } from '../stores';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';

export const LoginPage: React.FC = () => {
  const { session, loginAs, loginWithCredentials, navigateTo, showToast } = useApp();

  const [email, setEmail] = useState('driver@car911.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage('Please provide a valid client terminal email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please provide your security passkey.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const success = loginWithCredentials(email, password);
      if (success) {
        navigateTo('dashboard');
      } else {
        setErrorMessage('Unrecognized client credentials. Try demo presets above or verify your email.');
      }
    }, 350);
  };

  const handlePersonaSelect = (role: 'member' | 'admin' | 'guest') => {
    loginAs(role);
    if (role === 'guest') {
      navigateTo('home');
    } else {
      navigateTo('dashboard');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotModalOpen(false);
    showToast({
      type: 'info',
      title: 'Demo Password Reset',
      message: `A simulated security recovery token was issued for ${forgotEmail || email}.`,
    });
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] pb-20">
      {/* Sub-Header Breadcrumb */}
      <section className="w-full bg-[#111317] border-b border-white/8 py-3.5">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#b9c8de]">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-white/20">/</span>
            <span className="text-[#e11d48] font-semibold">Client Terminal Access</span>
          </nav>

          <span className="bg-[#1e2024] px-2.5 py-0.5 rounded-sm font-mono text-[11px] text-[#ffb3b6] border border-white/5">
            Demonstration Auth Portal
          </span>
        </div>
      </section>

      {/* Main Authentication Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-[#1a1c20] p-6 sm:p-8 rounded-xl border border-white/8 shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e11d48] to-transparent" />

          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-sm bg-[#e11d48] flex items-center justify-center text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] mb-1">
              <span className="material-symbols-outlined text-[26px]">speed</span>
            </div>
            <h1 className="font-headline font-bold text-2xl text-white uppercase tracking-tight">
              Client Terminal Access
            </h1>
            <p className="font-body text-xs text-[#b9c8de] leading-relaxed">
              Authenticate your identity to access your private garage watchlist, telemetry matrix, and concierge reservations.
            </p>
          </div>

          {/* Quick Persona Access Presets */}
          <div className="flex flex-col gap-2 mb-6 bg-[#0c0e12] p-3 rounded-lg border border-white/5">
            <span className="font-mono text-[10px] text-[#b9c8de]/70 uppercase tracking-widest text-center">
              Quick Demonstration Personas:
            </span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => handlePersonaSelect('member')}
                className="p-2 bg-[#1e2024] hover:bg-[#282a2e] text-left rounded-sm border border-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-headline font-semibold text-xs text-white group-hover:text-[#ffb3b6]">
                    VIP Member
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                </div>
                <span className="font-mono text-[10px] text-[#b9c8de]/60 block truncate">
                  driver@car911.com
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePersonaSelect('admin')}
                className="p-2 bg-[#1e2024] hover:bg-[#282a2e] text-left rounded-sm border border-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-headline font-semibold text-xs text-white group-hover:text-[#ffb3b6]">
                    Director Admin
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
                </div>
                <span className="font-mono text-[10px] text-[#b9c8de]/60 block truncate">
                  admin@car911.com
                </span>
              </button>
            </div>
          </div>

          {/* Error Feedback Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-[#e11d48]/15 border border-[#e11d48]/40 rounded-sm text-xs font-mono text-[#ffb4ab] flex items-center gap-2 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[18px] text-[#e11d48] shrink-0">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Standard Credentials Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Client Email Terminal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. driver@car911.com"
              leftIcon={<span className="material-symbols-outlined text-[18px]">mail</span>}
              required
            />

            <div>
              <div className="relative">
                <Input
                  label="Security Passkey"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  leftIcon={<span className="material-symbols-outlined text-[18px]">lock</span>}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#b9c8de] hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  }
                  required
                />
              </div>

              <div className="flex items-center justify-between mt-2 font-mono text-[11px]">
                <label className="flex items-center gap-1.5 text-[#b9c8de] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-xs bg-[#0c0e12] border-white/20 text-[#e11d48] focus:ring-0"
                  />
                  <span>Remember Terminal</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotModalOpen(true);
                  }}
                  className="text-[#ffb3b6] hover:underline cursor-pointer"
                >
                  Forgot Passkey?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              leftIcon={<span className="material-symbols-outlined text-[18px]">login</span>}
              className="mt-2"
            >
              Authenticate Session
            </Button>
          </form>

          {/* Registration Navigation & Guest mode */}
          <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-white/8 text-center text-xs">
            <p className="text-[#b9c8de]">
              Don&apos;t have private access accreditation?{' '}
              <button
                type="button"
                onClick={() => navigateTo('register')}
                className="text-[#e11d48] hover:text-[#ffb3b6] font-semibold hover:underline cursor-pointer ml-1"
              >
                Apply for Membership
              </button>
            </p>

            <button
              type="button"
              onClick={() => handlePersonaSelect('guest')}
              className="text-[#b9c8de]/70 hover:text-white font-mono text-[11px] underline cursor-pointer"
            >
              Continue in Guest Mode (Public Explorer)
            </button>
          </div>

          {/* Current Auth Status indicator */}
          {session.isAuthenticated && (
            <div className="mt-4 p-2.5 bg-[#0c0e12] rounded-sm border border-[#4ade80]/20 flex items-center justify-between text-xs font-mono">
              <span className="text-[#4ade80] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                Logged in as: {session.user?.fullName}
              </span>
              <button
                type="button"
                onClick={() => navigateTo('dashboard')}
                className="text-white hover:underline text-[11px]"
              >
                Open Dashboard →
              </button>
            </div>
          )}
        </div>

        {/* Demo Platform Security Notice */}
        <div className="mt-6 text-center max-w-md">
          <p className="font-mono text-[10px] text-[#b9c8de]/60 leading-relaxed">
            NOTICE: Car 911 is an interactive demonstration and telemetry intelligence application. Authentication sessions are managed locally. Do not submit sensitive corporate credentials.
          </p>
        </div>
      </div>

      {/* Forgot Passkey Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Passkey Recovery Protocol"
        subtitle="Simulated Key Dispatch"
        maxWidth="md"
      >
        <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4 text-xs font-body text-[#b9c8de]">
          <p>
            Please confirm your registered client terminal email. In this demonstration application, a simulated recovery link will be acknowledged via platform notification.
          </p>
          <Input
            label="Registered Email"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            placeholder="driver@car911.com"
            required
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <Button variant="secondary" size="sm" onClick={() => setForgotModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Transmit Reset Key
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
