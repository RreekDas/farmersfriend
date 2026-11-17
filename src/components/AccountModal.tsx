import React, { useEffect, useState } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { formatINR } from '../data/specimens';
import { OrderInquiry, UserProfile } from '../types/botanical';

interface AccountModalProps {
  isOpen: boolean;
  userProfile: UserProfile | null;
  pendingVerificationEmail: string | null;
  isAdmin: boolean;
  authLoading: boolean;
  authError: string | null;
  userEnquiries: OrderInquiry[];
  onClose: () => void;
  onSignInWithGoogle: () => Promise<void>;
  onSignInWithEmail: (email: string, password: string) => Promise<void>;
  onRegisterWithEmail: (details: {
    displayName: string;
    email: string;
    password: string;
    phone: string;
    neighborhood: string;
  }) => Promise<void>;
  onResendVerification: () => Promise<void>;
  onRefreshVerification: () => Promise<void>;
  onSendPasswordReset: (email: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  onSaveProfile: (displayName: string, phone: string, neighborhood: string) => Promise<void>;
  onOpenConciergeChat: () => void;
  onOpenAdminPanel: () => void;
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-[#FFF4F0] text-[#D97757]',
  confirmed: 'bg-[#E6F4EC] text-[#2E5A44]',
  fulfilled: 'bg-[#F4F3F1] text-[#222222]',
};

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  userProfile,
  pendingVerificationEmail,
  isAdmin,
  authLoading,
  authError,
  userEnquiries,
  onClose,
  onSignInWithGoogle,
  onSignInWithEmail,
  onRegisterWithEmail,
  onResendVerification,
  onRefreshVerification,
  onSendPasswordReset,
  onSignOut,
  onSaveProfile,
  onOpenConciergeChat,
  onOpenAdminPanel,
}) => {
  // Signed-out Auth mode state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLocality, setRegLocality] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [localAuthError, setLocalAuthError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // Signed-in Account state
  const [activeTab, setActiveTab] = useState<'profile' | 'enquiries'>('profile');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhone(userProfile.phone || '');
      setNeighborhood(userProfile.neighborhood || '');
      setSavedNotice(false);
      setFormError(null);
    }
  }, [userProfile, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setLocalAuthError(null);
      setInfoNotice(null);
    }
  }, [isOpen, authMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalAuthError(null);
    setInfoNotice(null);
    if (!loginEmail.trim() || !loginPassword) {
      setLocalAuthError('Please enter both your email address and password.');
      return;
    }
    await onSignInWithEmail(loginEmail.trim(), loginPassword);
  };

  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalAuthError(null);
    setInfoNotice(null);
    if (!regName.trim()) {
      setLocalAuthError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setLocalAuthError('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setLocalAuthError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setLocalAuthError('Passwords do not match. Please re-enter them.');
      return;
    }
    await onRegisterWithEmail({
      displayName: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      phone: regPhone.trim(),
      neighborhood: regLocality.trim(),
    });
  };

  const handleForgotPassword = async () => {
    setLocalAuthError(null);
    setInfoNotice(null);
    if (!loginEmail.trim()) {
      setLocalAuthError('Enter your email address above first so we can send a reset link.');
      return;
    }
    try {
      await onSendPasswordReset(loginEmail.trim());
      setInfoNotice(`Password reset link sent to ${loginEmail.trim()}. Please check your inbox.`);
    } catch {
      // Error surfaced via authError
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setFormError('Display name is required.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await onSaveProfile(displayName.trim(), phone.trim(), neighborhood.trim());
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save profile details.');
    } finally {
      setSaving(false);
    }
  };

  const inputClassName =
    'w-full bg-white border border-[#E8E5DF] rounded-lg px-4 py-2.5 text-[15px] text-[#222222] placeholder:text-[#5A685F]/60 focus:border-[#2E5A44] focus:outline-none focus:ring-2 focus:ring-[#2E5A44]/15 transition-colors';

  const labelClassName =
    'block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F] mb-1.5';

  const initials = (userProfile?.displayName || 'FF')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const displayedAuthError = localAuthError || authError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={
        userProfile
          ? 'Farmers Friend Account'
          : pendingVerificationEmail
            ? 'Verify Email Address'
            : 'Login or Register at Farmers Friend'
      }
    >
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#222222]/35 backdrop-blur-[4px]"
      />

      <div className="relative z-10 w-full max-w-[490px] bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-[#E8E5DF] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2E5A44]">
              Farmers Friend · New Alipore
            </p>
            <h2 className="mt-0.5 font-display text-[22px] sm:text-[24px] font-medium text-[#222222] truncate">
              {userProfile
                ? 'Member Account'
                : pendingVerificationEmail
                  ? 'Verify Your Email'
                  : authMode === 'login'
                    ? 'Member Login'
                    : 'Create Account'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close account modal"
            className="w-9 h-9 rounded-lg border border-[#E8E5DF] flex items-center justify-center text-[#5A685F] hover:text-[#222222] hover:bg-[#F9F8F6] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {pendingVerificationEmail && !userProfile ? (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            <div className="p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-[#E6F4EC] text-[#2E5A44] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-base font-medium text-[#222222]">
                    Confirmation link sent
                  </p>
                  <p className="text-xs text-[#5A685F] truncate">
                    {pendingVerificationEmail}
                  </p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-[#5A685F] pt-1">
                Please open the verification link in your email inbox so we can securely save your enquiries and concierge messages to Firebase.
              </p>
            </div>

            {displayedAuthError && (
              <div className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs font-medium">
                {displayedAuthError}
              </div>
            )}

            {infoNotice && (
              <div className="p-3 rounded-lg bg-[#bdeed0] text-[#002113] text-xs font-medium">
                {infoNotice}
              </div>
            )}

            <div className="space-y-2.5">
              <button
                type="button"
                disabled={authLoading}
                onClick={() => void onRefreshVerification()}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] transition-colors cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className="w-4 h-4" />
                <span>I&apos;ve Verified My Email — Continue</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => {
                    setInfoNotice('Verification email resent. Please check your inbox and spam folder.');
                    void onResendVerification();
                  }}
                  className="flex-1 min-h-[42px] px-4 py-2 rounded-lg border border-[#E8E5DF] bg-white text-xs font-medium text-[#222222] hover:border-[#2E5A44] transition-colors cursor-pointer"
                >
                  Resend Link
                </button>
                <button
                  type="button"
                  onClick={() => void onSignOut()}
                  className="flex-1 min-h-[42px] px-4 py-2 rounded-lg border border-[#E8E5DF] bg-white text-xs font-medium text-[#5A685F] hover:text-[#ba1a1a] hover:border-[#ba1a1a] transition-colors cursor-pointer"
                >
                  Use Another Account
                </button>
              </div>
            </div>
          </div>
        ) : !userProfile ? (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {/* Login / Register Segmented Switcher */}
            <div className="flex items-center gap-1 p-1 bg-[#F4F3F1] rounded-lg">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-[#222222] shadow-xs'
                    : 'text-[#5A685F] hover:text-[#222222]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-[#222222] shadow-xs'
                    : 'text-[#5A685F] hover:text-[#222222]'
                }`}
              >
                Register
              </button>
            </div>

            {displayedAuthError && (
              <div className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs font-medium">
                {displayedAuthError}
              </div>
            )}

            {infoNotice && (
              <div className="p-3 rounded-lg bg-[#bdeed0] text-[#002113] text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{infoNotice}</span>
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleSubmitLogin} className="space-y-3.5">
                <div>
                  <label htmlFor="login-email" className={labelClassName}>
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A685F]"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => void handleForgotPassword()}
                      className="text-[11px] font-medium text-[#2E5A44] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`${inputClassName} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A685F] hover:text-[#222222] cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] transition-colors cursor-pointer disabled:opacity-60"
                >
                  {authLoading ? 'Signing in…' : 'Login to Farmers Friend'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitRegister} className="space-y-3.5">
                <div>
                  <label htmlFor="reg-name" className={labelClassName}>
                    Full Name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder="Ananya Rao"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className={labelClassName}>
                    Email Address
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    maxLength={200}
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reg-password" className={labelClassName}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Min 6 chars"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className={`${inputClassName} pr-9`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((prev) => !prev)}
                        aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A685F] hover:text-[#222222] cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-confirm" className={labelClassName}>
                      Confirm Password
                    </label>
                    <input
                      id="reg-confirm"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reg-phone" className={labelClassName}>
                      Mobile (Optional)
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      maxLength={30}
                      placeholder="+91 98300 00000"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-locality" className={labelClassName}>
                      Locality (Optional)
                    </label>
                    <input
                      id="reg-locality"
                      type="text"
                      maxLength={200}
                      placeholder="New Alipore"
                      value={regLocality}
                      onChange={(e) => setRegLocality(e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] transition-colors cursor-pointer disabled:opacity-60"
                >
                  {authLoading ? 'Creating account…' : 'Register Account'}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative py-1 flex items-center">
              <div className="flex-1 border-t border-[#E8E5DF]" />
              <span className="px-3 text-[11px] font-medium uppercase tracking-[0.1em] text-[#5A685F]">
                or
              </span>
              <div className="flex-1 border-t border-[#E8E5DF]" />
            </div>

            <button
              type="button"
              disabled={authLoading}
              onClick={() => void onSignInWithGoogle()}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-3 px-5 py-2.5 rounded-lg border border-[#E8E5DF] bg-white hover:bg-[#F9F8F6] hover:border-[#2E5A44] text-sm font-medium text-[#222222] transition-colors cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Signed-in Identity Summary */}
            <div className="px-5 sm:px-6 py-4 bg-[#F9F8F6] border-b border-[#E8E5DF] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {userProfile.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border border-[#E8E5DF] shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#2E5A44] text-white font-display text-sm font-medium flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-base font-medium text-[#222222] truncate">
                      {userProfile.displayName}
                    </p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E6F4EC] text-[#2E5A44] text-[10px] font-semibold uppercase tracking-[0.08em] shrink-0">
                        <ShieldCheck className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5A685F] truncate">{userProfile.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void onSignOut()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E5DF] bg-white text-xs font-medium text-[#5A685F] hover:text-[#ba1a1a] hover:border-[#ba1a1a] transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Account Tabs */}
            <div className="px-5 sm:px-6 pt-4">
              <div className="flex items-center gap-1 p-1 bg-[#F4F3F1] rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-white text-[#222222] shadow-xs'
                      : 'text-[#5A685F] hover:text-[#222222]'
                  }`}
                >
                  Saved Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('enquiries')}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer tabular-nums ${
                    activeTab === 'enquiries'
                      ? 'bg-white text-[#222222] shadow-xs'
                      : 'text-[#5A685F] hover:text-[#222222]'
                  }`}
                >
                  My Enquiries ({userEnquiries.length})
                </button>
              </div>
            </div>

            {activeTab === 'profile' ? (
              <form onSubmit={handleSubmitProfile} className="p-5 sm:p-6 space-y-4">
                {formError && (
                  <div className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-xs font-medium">
                    {formError}
                  </div>
                )}
                {savedNotice && (
                  <div className="p-3 rounded-lg bg-[#bdeed0] text-[#002113] text-xs font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Your details have been saved to your account.</span>
                  </div>
                )}

                <div>
                  <label htmlFor="acc-name" className={labelClassName}>
                    Full Name
                  </label>
                  <input
                    id="acc-name"
                    type="text"
                    required
                    maxLength={120}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="acc-phone" className={labelClassName}>
                    Mobile / WhatsApp Number
                  </label>
                  <input
                    id="acc-phone"
                    type="tel"
                    maxLength={30}
                    placeholder="e.g. +91 98300 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="acc-locality" className={labelClassName}>
                    Kolkata Locality &amp; Window Light
                  </label>
                  <input
                    id="acc-locality"
                    type="text"
                    maxLength={200}
                    placeholder="e.g. Ballygunge · South-East Balcony"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#2E5A44] hover:bg-[#4A7C59] transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save Details'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenConciergeChat();
                    }}
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#2E5A44] text-sm font-medium text-[#2E5A44] hover:bg-[#2E5A44] hover:text-white transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Concierge Chat</span>
                  </button>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdminPanel();
                    }}
                    className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#F9F8F6] border border-[#E8E5DF] text-xs font-semibold uppercase tracking-[0.1em] text-[#2E5A44] hover:border-[#2E5A44] transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open Studio Admin Panel</span>
                  </button>
                )}
              </form>
            ) : (
              <div className="p-5 sm:p-6 space-y-3">
                {userEnquiries.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#F9F8F6] border border-[#E8E5DF] text-center space-y-2">
                    <p className="font-display text-base font-medium text-[#222222]">
                      No saved enquiries from Our Collection yet
                    </p>
                    <p className="text-xs text-[#5A685F]">
                      Reservations and showroom enquiries you submit while signed in appear here automatically.
                    </p>
                  </div>
                ) : (
                  userEnquiries.map((inq) => {
                    const statusKey = inq.status || 'pending';
                    return (
                      <div
                        key={inq.id}
                        className="p-3.5 rounded-xl border border-[#E8E5DF] bg-white space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5A685F] tabular-nums">
                            {inq.id} · {inq.createdAt}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] ${
                              STATUS_BADGE[statusKey] || STATUS_BADGE.pending
                            }`}
                          >
                            {statusKey}
                          </span>
                        </div>
                        <p className="font-display text-base font-semibold text-[#222222]">
                          {inq.quantity}× {inq.specimenName}
                        </p>
                        <div className="flex items-center justify-between gap-2 text-xs text-[#5A685F]">
                          <span className="truncate">
                            {inq.planterName} · {inq.deliveryMethod}
                          </span>
                          {inq.totalPrice > 0 && (
                            <span className="font-semibold text-[#2E5A44] tabular-nums shrink-0">
                              {formatINR(inq.totalPrice)}
                            </span>
                          )}
                        </div>
                        {inq.message && (
                          <p className="text-xs text-[#5A685F] pt-1 border-t border-[#E8E5DF]">
                            {inq.message}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
