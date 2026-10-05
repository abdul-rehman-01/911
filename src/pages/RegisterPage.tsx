import React, { useState } from 'react';
import { useApp } from '../stores';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const RegisterPage: React.FC = () => {
  const { registerUser, navigateTo, showToast } = useApp();

  const [fullName, setFullName] = useState('Alexander Sterling');
  const [email, setEmail] = useState('alexander@collector.com');
  const [phone, setPhone] = useState('+1 (555) 911-7788');
  const [membershipTier, setMembershipTier] = useState<'Platinum' | 'Track VIP' | 'Private Collector'>('Platinum');
  const [password, setPassword] = useState('••••••••••••');
  const [confirmPassword, setConfirmPassword] = useState('••••••••••••');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!acceptedTerms) {
      setErrorMessage('Please acknowledge the demonstration platform terms to proceed.');
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setErrorMessage('Full client name and email terminal are required.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Security passkey must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Security passkeys do not match. Please verify your entries.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const success = registerUser({
        fullName,
        email,
        phone,
        password,
        confirmPassword,
        membershipTier,
      });

      if (success) {
        navigateTo('dashboard');
      } else {
        setErrorMessage('Accreditation failed: An account may already exist for this email address.');
      }
    }, 400);
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
            <span className="text-[#e11d48] font-semibold">Client Accreditation Request</span>
          </nav>

          <span className="bg-[#1e2024] px-2.5 py-0.5 rounded-sm font-mono text-[11px] text-[#ffb3b6] border border-white/5">
            Demonstration Onboarding
          </span>
        </div>
      </section>

      {/* Main Registration Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl bg-[#1a1c20] p-6 sm:p-10 rounded-xl border border-white/8 shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e11d48] to-transparent" />

          {/* Header */}
          <div className="flex flex-col items-center text-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-sm bg-[#e11d48] flex items-center justify-center text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] mb-1">
              <span className="material-symbols-outlined text-[26px]">badge</span>
            </div>
            <h1 className="font-headline font-bold text-2xl sm:text-3xl text-white uppercase tracking-tight">
              Request Client Accreditation
            </h1>
            <p className="font-body text-xs text-[#b9c8de] max-w-md leading-relaxed">
              Join the Car 911 telemetry network to curate your private garage portfolio, stage high-performance dyno comparisons, and unlock priority concierge allocation.
            </p>
          </div>

          {/* Error Feedback Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-[#e11d48]/15 border border-[#e11d48]/40 rounded-sm text-xs font-mono text-[#ffb4ab] flex items-center gap-2 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[18px] text-[#e11d48] shrink-0">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Client Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alexander Sterling"
                leftIcon={<span className="material-symbols-outlined text-[18px]">person</span>}
                required
              />

              <Input
                label="Primary Email Terminal"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alexander@collector.com"
                leftIcon={<span className="material-symbols-outlined text-[18px]">mail</span>}
                required
              />
            </div>

            <Input
              label="Contact Phone / Direct Line"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 911-7788"
              leftIcon={<span className="material-symbols-outlined text-[18px]">phone</span>}
            />

            {/* Membership Tier Selection */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase tracking-wider text-[#b9c8de]">
                Selected Membership Tier:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'Platinum',
                    title: 'Platinum',
                    desc: 'Telemetry tracking & curated allocation',
                    color: '#e11d48',
                  },
                  {
                    id: 'Track VIP',
                    title: 'Track VIP',
                    desc: 'Dyno telemetry & trackside rescue dispatch',
                    color: '#38bdf8',
                  },
                  {
                    id: 'Private Collector',
                    title: 'Private Collector',
                    desc: 'Vault allocation & bespoke concierge desk',
                    color: '#fbbf24',
                  },
                ].map((tier) => {
                  const selected = membershipTier === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setMembershipTier(tier.id as typeof membershipTier)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                        selected
                          ? 'bg-[#1e2024] border-[#e11d48] shadow-md ring-1 ring-[#e11d48]'
                          : 'bg-[#0c0e12] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-headline font-bold text-xs text-white">
                          {tier.title}
                        </span>
                        {selected ? (
                          <span className="w-2 h-2 rounded-full bg-[#e11d48]" />
                        ) : (
                          <span className="w-2 h-2 rounded-full border border-white/20" />
                        )}
                      </div>
                      <span className="font-body text-[11px] text-[#b9c8de]/70 leading-snug">
                        {tier.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Security Passkey"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<span className="material-symbols-outlined text-[18px]">lock</span>}
                required
              />

              <Input
                label="Confirm Passkey"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<span className="material-symbols-outlined text-[18px]">lock_reset</span>}
                required
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2.5 p-3 bg-[#0c0e12] rounded-lg border border-white/5">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 rounded-xs bg-[#1a1c20] border-white/20 text-[#e11d48] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="terms" className="font-body text-xs text-[#b9c8de] leading-relaxed cursor-pointer">
                I understand that Car 911 is an advanced demonstration platform. All vehicle inventory listings, dealer coordinates, telemetry metrics, and financing quotes represent simulated prototype data.
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              leftIcon={<span className="material-symbols-outlined text-[18px]">how_to_reg</span>}
              className="mt-2"
            >
              Submit Accreditation &amp; Enter Dashboard
            </Button>
          </form>

          {/* Login Navigation Link */}
          <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-white/8 text-center text-xs text-[#b9c8de]">
            <span>Already have an accredited terminal?</span>
            <button
              type="button"
              onClick={() => navigateTo('login')}
              className="text-[#e11d48] hover:text-[#ffb3b6] font-semibold hover:underline cursor-pointer"
            >
              Authenticate Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
