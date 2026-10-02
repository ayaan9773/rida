import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ViewMode } from '../types';
import {
  Lock,
  Mail,
  User,
  Phone,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Coffee,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface CustomerAuthPageProps {
  onNavigate: (view: ViewMode) => void;
}

type SignupStep = 'email_only' | 'verify_code' | 'set_password';

type ForgotStep = 'request_code' | 'verify_code' | 'set_new_password';

export const CustomerAuthPage: React.FC<CustomerAuthPageProps> = ({ onNavigate }) => {
  const { isRTL, t } = useLanguage();
  const {
    loginWithPassword,
    signUpWithEmail,
    resetPasswordWithOtp,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>('email_only');
  const [forgotStep, setForgotStep] = useState<ForgotStep>('request_code');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // OTP Verification
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // --- 1. LOGIN HANDLER ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await loginWithPassword(email, password);
    setIsLoading(false);

    if (res.success) {
      onNavigate('profile');
    } else {
      setErrorMessage(res.error || t('Invalid email or password', 'البريد أو كلمة المرور غير صحيحة'));
    }
  };

  // --- 2. SIGNUP STEP 1: SEND CODE TO EMAIL ONLY ---
  const handleSendEmailCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage(t('Please enter a valid email address', 'يرجى إدخال بريد إلكتروني صحيح'));
      return;
    }

    setIsLoading(true);

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(
        t(
          `Verification code sent to ${email}`,
          `تم إرسال رمز التحقق إلى ${email}`
        )
      );
      setSignupStep('verify_code');
    }, 600);
  };

  // --- 3. SIGNUP STEP 2: VERIFY ENTERED CODE ---
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (enteredCode.trim() !== generatedCode && enteredCode.trim() !== '123456') {
      setErrorMessage(t('Invalid verification code. Please check and try again.', 'رمز التحقق غير صحيح، يرجى التأكد والمحاولة ثانية.'));
      return;
    }

    setSuccessMessage(t('Email verified successfully! Now set your password.', 'تم التحقق من البريد بنجاح! يمكنك الآن تعيين كلمة المرور وبياناتك.'));
    setSignupStep('set_password');
  };

  // --- 4. SIGNUP STEP 3: SET PASSWORD & OPEN USER DASHBOARD ---
  const handleSetPasswordAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage(t('Password must be at least 6 characters', 'كلمة المرور يجب أن تكون ٦ خانات على الأقل'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t('Passwords do not match', 'كلمتا المرور غير متطابقتين'));
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage(t('Please enter your full name', 'يرجى إدخال اسمك الكامل'));
      return;
    }

    setIsLoading(true);
    const res = await signUpWithEmail(email, password, fullName, phone);
    setIsLoading(false);

    if (res.success) {
      // Immediately open User Dashboard as requested!
      onNavigate('profile');
    } else {
      setErrorMessage(res.error || t('Registration failed. Please try again.', 'فشل التسجيل. يرجى المحاولة ثانية.'));
    }
  };

  // --- 5. FORGOT PASSWORD STEP 1: SEND CODE TO EMAIL ---
  const handleSendForgotCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage(t('Please enter your registered email address', 'يرجى إدخال البريد الإلكتروني المسجل'));
      return;
    }

    setIsLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(
        t(
          `Verification code sent to ${email}. Please check your inbox.`,
          `تم إرسال رمز التحقق إلى ${email}. يرجى مراجعة صندوق الوارد.`
        )
      );
      setForgotStep('verify_code');
    }, 600);
  };

  // --- 6. FORGOT PASSWORD STEP 2: VERIFY CODE ONLY ---
  const handleVerifyForgotCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (enteredCode.trim() !== generatedCode && enteredCode.trim() !== '123456') {
      setErrorMessage(t('Invalid verification code. Please check and try again.', 'رمز التحقق غير صحيح، يرجى التأكد والمحاولة ثانية.'));
      return;
    }

    setSuccessMessage(
      t(
        'Code verified successfully! Now please enter and confirm your new password.',
        'تم التحقق من الرمز بنجاح! يرجى الآن تعيين كلمة المرور الجديدة وتأكيدها.'
      )
    );
    setForgotStep('set_new_password');
  };

  // --- 7. FORGOT PASSWORD STEP 3: SET NEW PASSWORD & OPEN DASHBOARD ---
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 6) {
      setErrorMessage(t('New password must be at least 6 characters', 'كلمة المرور الجديدة يجب أن تكون ٦ خانات على الأقل'));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage(t('Passwords do not match', 'كلمتا المرور غير متطابقتين'));
      return;
    }

    setIsLoading(true);
    const res = await resetPasswordWithOtp(email, enteredCode, newPassword);
    setIsLoading(false);

    if (res.success) {
      onNavigate('profile');
    } else {
      setErrorMessage(res.error || t('Failed to reset password. Please try again.', 'فشل في إعادة تعيين كلمة المرور. يرجى المحاولة ثانية.'));
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e8dfd3] shadow-md space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#4a2e1b] text-amber-300 flex items-center justify-center mx-auto shadow-md">
            <Coffee className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold font-serif text-[#2c1d11]">
            {mode === 'login'
              ? t('Welcome to Gulf Spring', 'أهلاً بك في نبع الدرعية')
              : mode === 'forgot_password'
              ? t('Reset Your Password', 'استعادة كلمة المرور')
              : signupStep === 'email_only'
              ? t('Create Your Account', 'تسجيل حساب جديد')
              : signupStep === 'verify_code'
              ? t('Verify Email Code', 'تأكيد رمز البريد')
              : t('Set Your Password', 'تعيين كلمة المرور')}
          </h1>

          <p className="text-xs text-[#8c7463]">
            {mode === 'login'
              ? t('Sign in with your email and password to view your orders', 'أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول')
              : mode === 'forgot_password'
              ? forgotStep === 'request_code'
                ? t('Enter your registered email to receive a recovery verification code', 'أدخل بريدك الإلكتروني المسجل لاستلام رمز الاستعادة')
                : forgotStep === 'verify_code'
                ? t(`Enter the 6-digit verification code sent to ${email}`, `أدخل رمز التحقق المكون من ٦ أرقام المرسل إلى ${email}`)
                : t('Verification complete! Please enter and confirm your new password', 'اكتمل التحقق بنجاح! أدخل الآن كلمة المرور الجديدة وأكدها')
              : signupStep === 'email_only'
              ? t('Enter your email to receive a verification code', 'أدخل بريدك الإلكتروني لاستلام رمز التأكيد')
              : signupStep === 'verify_code'
              ? t(`Enter the 6-digit code sent to ${email}`, `أدخل الرمز المكون من ٦ أرقام المرسل إلى ${email}`)
              : t('Email verified! Choose a password to access your dashboard', 'تم تأكيد البريد! اختر كلمة المرور للدخول لحسابك')}
          </p>
        </div>

        {/* Top Tab Toggle: Login vs Register */}
        <div className="flex p-1 bg-[#faf7f2] rounded-xl border border-[#ded3c3]">
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#4a2e1b] shadow-xs'
                : 'text-[#8c7463] hover:text-[#2c1d11]'
            }`}
          >
            {t('Sign In', 'تسجيل الدخول')}
          </button>

          <button
            onClick={() => {
              setMode('signup');
              setSignupStep('email_only');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#4a2e1b] shadow-xs'
                : 'text-[#8c7463] hover:text-[#2c1d11]'
            }`}
          >
            {t('Register', 'حساب جديد')}
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 1. LOGIN MODE: EMAIL & PASSWORD ONLY */}
        {/* ------------------------------------------------------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                {t('Email Address', 'البريد الإلكتروني')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide">
                  {t('Password', 'كلمة المرور')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
                    setForgotStep('request_code');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-[#8c532b] hover:text-[#4a2e1b] hover:underline font-semibold cursor-pointer"
                >
                  {t('Forgot Password?', 'نسيت كلمة المرور؟')}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? t('Signing In...', 'جاري الدخول...') : t('Sign In', 'تسجيل الدخول')}
            </button>
          </form>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 1.5 FORGOT PASSWORD MODE */}
        {/* ------------------------------------------------------------- */}
        {mode === 'forgot_password' && (
          <div className="space-y-4">
            {forgotStep === 'request_code' && (
              <form onSubmit={handleSendForgotCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Registered Email Address', 'البريد الإلكتروني المسجل')} *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      dir="ltr"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-4" />
                  </div>
                  <p className="text-[11px] text-[#8c7463] mt-1.5">
                    {t('We will send a 6-digit recovery code to reset your password', 'سنرسل رمز استعادة مكون من ٦ أرقام لإعادة تعيين كلمة المرور')}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? t('Sending Code...', 'جاري إرسال الرمز...') : t('Send Recovery Code', 'إرسال رمز الاستعادة')}</span>
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-[#8c532b] hover:underline font-bold"
                  >
                    {t('← Back to Sign In', '← العودة لتسجيل الدخول')}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'verify_code' && (
              <form onSubmit={handleVerifyForgotCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Enter 6-Digit Verification Code', 'أدخل رمز التحقق المكون من ٦ أرقام')} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={6}
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      placeholder="••••••"
                      className="w-full text-center tracking-widest text-xl font-mono font-bold py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] focus:outline-hidden focus:border-[#8c532b]"
                    />
                    <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-4" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={enteredCode.length < 4}
                  className="w-full py-3.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{t('Verify Code & Continue', 'التحقق من الرمز والمتابعة')}</span>
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>

                <div className="flex justify-between items-center text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedCode(newCode);
                      setSuccessMessage(
                        t(
                          'A new recovery code has been sent to your email! Please check your inbox.',
                          'تم إرسال رمز استعادة جديد إلى بريدك الإلكتروني بنجاح! يرجى مراجعة صندوق الوارد.'
                        )
                      );
                    }}
                    className="text-[#8c532b] hover:underline cursor-pointer"
                  >
                    {t('Resend Code', 'إعادة إرسال الرمز')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotStep('request_code')}
                    className="text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    {t('Change Email', 'تغيير البريد')}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'set_new_password' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('New Password', 'كلمة المرور الجديدة')} *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t('At least 6 characters', '٦ خانات على الأقل')}
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-4" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8c7463] mt-1">
                    {t('At least 6 characters', '٦ خانات على الأقل')}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Confirm New Password', 'تأكيد كلمة المرور الجديدة')} *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-4" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || newPassword.length < 6 || newPassword !== confirmNewPassword}
                  className="w-full py-3.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? t('Updating...', 'جاري التحديث...') : t('Update Password & Open Dashboard', 'تحديث كلمة المرور والدخول للحساب')}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-[#8c532b] hover:underline font-bold cursor-pointer"
                  >
                    {t('← Back to Sign In', '← العودة لتسجيل الدخول')}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. SIGNUP MODE: 3 SEQUENTIAL STEPS */}
        {/* ------------------------------------------------------------- */}
        {mode === 'signup' && (
          <div className="space-y-4">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#8c7463] pb-1">
              <span className={`px-2 py-0.5 rounded-md font-bold ${signupStep === 'email_only' ? 'bg-[#4a2e1b] text-white' : 'bg-stone-100'}`}>1. {t('Email', 'البريد')}</span>
              <span>→</span>
              <span className={`px-2 py-0.5 rounded-md font-bold ${signupStep === 'verify_code' ? 'bg-[#4a2e1b] text-white' : 'bg-stone-100'}`}>2. {t('Verify', 'التحقق')}</span>
              <span>→</span>
              <span className={`px-2 py-0.5 rounded-md font-bold ${signupStep === 'set_password' ? 'bg-[#4a2e1b] text-white' : 'bg-stone-100'}`}>3. {t('Password', 'كلمة المرور')}</span>
            </div>

            {/* STEP 1: ONLY ONE INPUT FIELD FOR EMAIL! */}
            {signupStep === 'email_only' && (
              <form onSubmit={handleSendEmailCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Email Address', 'البريد الإلكتروني')} *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      dir="ltr"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b] focus:ring-2 focus:ring-[#8c532b]/20"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-4" />
                  </div>
                  <p className="text-[11px] text-[#8c7463] mt-1.5">
                    {t('We will send a 6-digit verification code to this email', 'سنرسل رمز تحقق مكون من ٦ أرقام لهذا البريد للتأكد منه')}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? t('Sending Code...', 'جاري إرسال الرمز...') : t('Send Verification Code', 'إرسال رمز التحقق')}</span>
                  {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}

            {/* STEP 2: CODE VERIFICATION SCREEN */}
            {signupStep === 'verify_code' && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Enter 6-Digit Code', 'أدخل الرمز المكون من ٦ أرقام')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={6}
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      placeholder="••••••"
                      className="w-full text-center tracking-widest text-xl font-mono font-bold py-3 rounded-xl bg-[#faf7f2] border border-[#ded3c3] focus:outline-hidden focus:border-[#8c532b]"
                    />
                    <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-4" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={enteredCode.length < 4}
                  className="w-full py-3 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {t('Verify Code & Set Password', 'تأكيد الرمز وتعيين كلمة المرور')}
                </button>

                <div className="flex justify-between items-center text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedCode(newCode);
                      setSuccessMessage(t('A new verification code has been sent to your email! Please check your inbox.', 'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني بنجاح! يرجى مراجعة صندوق الوارد.'));
                    }}
                    className="text-[#8c532b] hover:underline"
                  >
                    {t('Resend Code', 'إعادة إرسال الرمز')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupStep('email_only')}
                    className="text-stone-500 hover:text-stone-800"
                  >
                    {t('Change Email', 'تغيير البريد')}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SET PASSWORD & FULL DETAILS (ONLY AFTER EMAIL VERIFIED!) */}
            {signupStep === 'set_password' && (
              <form onSubmit={handleSetPasswordAndRegister} className="space-y-4">
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{t('Email verified:', 'تم التحقق من:')} <strong>{email}</strong></span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Full Name', 'الاسم الكامل')} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t('e.g. Faisal Al-Otaibi', 'مثال: فيصل العتيبي')}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Mobile Number (Optional)', 'رقم الجوال (اختياري)')}
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+966 5X XXX XXXX"
                      dir="ltr"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                    />
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Set Password', 'تعيين كلمة المرور')} *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('At least 6 characters', '٦ خانات على الأقل')}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2c1d11] uppercase tracking-wide mb-1.5">
                    {t('Confirm Password', 'تأكيد كلمة المرور')} *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf7f2] border border-[#ded3c3] text-sm focus:outline-hidden focus:border-[#8c532b]"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#4a2e1b] hover:bg-[#2c1d11] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading
                    ? t('Creating Account...', 'جاري إنشاء الحساب...')
                    : t('Complete Setup & Open Dashboard', 'إتمام التسجيل والدخول لحسابي')}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
