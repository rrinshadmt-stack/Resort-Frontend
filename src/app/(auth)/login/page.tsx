"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Building2,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateOtp,
  getPasswordStrength,
  FieldErrors,
} from "@/lib/auth-service";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, verifyOtp, resendOtp, loginDemoUser } = useAuth();

  // Tabs: 'login' | 'signup' | 'verify_otp'
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState<"login" | "signup" | "verify_otp">(initialTab);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "OWNER">("CUSTOMER");
  const [otp, setOtp] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP Resend Countdown
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Real-time Field Validation Handler
  const validateField = (fieldName: string, value: string): string | null => {
    switch (fieldName) {
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value, tab === "signup");
      case "confirmPassword":
        if (tab === "signup" && value !== password) {
          return "Passwords do not match";
        }
        return null;
      case "name":
        return tab === "signup" ? validateName(value) : null;
      case "phone":
        return tab === "signup" ? validatePhone(value) : null;
      case "otp":
        return tab === "verify_otp" ? validateOtp(value) : null;
      default:
        return null;
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    let val = "";
    if (fieldName === "email") val = email;
    if (fieldName === "password") val = password;
    if (fieldName === "confirmPassword") val = confirmPassword;
    if (fieldName === "name") val = name;
    if (fieldName === "phone") val = phone;
    if (fieldName === "otp") val = otp;

    const error = validateField(fieldName, val);
    setErrors((prev) => ({ ...prev, [fieldName]: error || undefined }));
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(val) || undefined }));
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (touched.password) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(val, tab === "signup") || undefined,
      }));
    }
    if (touched.confirmPassword && confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: val !== confirmPassword ? "Passwords do not match" : undefined,
      }));
    }
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (touched.confirmPassword || val) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: val !== password ? "Passwords do not match" : undefined,
      }));
    }
  };

  // Instant Demo User Login (Frontend Bypass for instant preview)
  const handleDemoLogin = () => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage("Authenticated as Demo User!");
    loginDemoUser();
    setTimeout(() => {
      router.push("/profile");
    }, 700);
  };

  // Submission for Sign In, Registration, and OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    // Run Full Form Validation
    const newErrors: FieldErrors = {};

    if (tab === "login") {
      const emailErr = validateEmail(email);
      const passErr = validatePassword(password, false);
      if (emailErr) newErrors.email = emailErr;
      if (passErr) newErrors.password = passErr;
    } else if (tab === "signup") {
      const nameErr = validateName(name);
      const emailErr = validateEmail(email);
      const passErr = validatePassword(password, true);
      const phoneErr = validatePhone(phone);
      if (nameErr) newErrors.name = nameErr;
      if (emailErr) newErrors.email = emailErr;
      if (passErr) newErrors.password = passErr;
      if (phoneErr) newErrors.phone = phoneErr;
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else if (tab === "verify_otp") {
      const otpErr = validateOtp(otp);
      if (otpErr) newErrors.otp = otpErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        email: true,
        password: true,
        confirmPassword: true,
        name: true,
        phone: true,
        otp: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (tab === "login") {
        const user = await login({ email, password });
        setSuccessMessage(`Welcome back, ${user.name}! Redirecting...`);
        setTimeout(() => {
          router.push(user.role === "owner" ? "/profile" : "/bookings");
        }, 800);
      } else if (tab === "signup") {
        const result = await register({
          name,
          email,
          password,
          phone: phone.trim() || undefined,
          role,
        });

        setSuccessMessage(
          result.message || "Account created! Please enter the 6-digit OTP code sent to your email."
        );
        setTab("verify_otp");
        setResendCooldown(60);
      } else if (tab === "verify_otp") {
        const user = await verifyOtp({ email, otp });
        setSuccessMessage(`Email verified! Welcome, ${user.name}.`);
        setTimeout(() => {
          router.push("/profile");
        }, 900);
      }
    } catch (err: any) {
      // If user requires OTP verification before logging in
      if (err.requiresVerification) {
        setServerError(err.message || "Account requires verification. Enter OTP below.");
        setTab("verify_otp");
        setResendCooldown(60);
      } else {
        setServerError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setServerError(null);
    setSuccessMessage(null);
    try {
      const msg = await resendOtp(email);
      setSuccessMessage(msg);
      setResendCooldown(60);
    } catch (err: any) {
      setServerError(err.message || "Could not resend OTP code.");
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-fade-in transition-all">
      {/* Top Header Card Featuring StayUp Logo */}
      <div className="bg-gradient-to-r from-[#0a2560] via-[#093278] to-[#1444a8] p-6 text-white text-center relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#0ea5e9]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#f97316]/20 rounded-full blur-xl pointer-events-none" />

        {/* Brand Logo Presentation */}
        <div className="flex items-center justify-center mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo/stayup_logo.png"
            alt="StayUp Resorts"
            className="h-16 w-auto object-contain brightness-110 drop-shadow-lg hover:scale-105 transition-transform"
          />
        </div>

        <h1 className="text-xl font-black tracking-tight text-white">
          {tab === "verify_otp"
            ? "Verify Your Email"
            : tab === "signup"
            ? "Create Your Account"
            : "Sign In to StayUp"}
        </h1>
        <p className="text-xs text-sky-100/90 mt-1 max-w-xs mx-auto">
          {tab === "verify_otp"
            ? `Enter the 6-digit code sent to ${email || "your email"}`
            : tab === "signup"
            ? "Unlock exclusive resort discounts & member privileges"
            : "Access your luxury bookings, itineraries & perks"}
        </p>
      </div>

      <div className="p-6 sm:p-7 space-y-5">
        {/* Server Success Banner */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{successMessage}</div>
          </div>
        )}

        {/* Server Error Banner */}
        {serverError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{serverError}</div>
          </div>
        )}

        {/* Instant Fast Preview (Demo Login) */}
        {tab !== "verify_otp" && (
          <div className="bg-sky-50/70 rounded-2xl p-3.5 border border-sky-100 text-center">
            <span className="text-[10px] font-extrabold text-sky-800 uppercase tracking-widest block mb-2">
              Instant Development Preview
            </span>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0a2560] hover:bg-[#1444a8] text-white font-black text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Zap className="w-4 h-4 text-[#f97316]" />
              <span>Instant Demo Login (Demo User)</span>
            </button>
            <span className="text-[10px] text-slate-500 mt-1.5 block">
              Test full customer profile & reservations without backend
            </span>
          </div>
        )}

        {/* Tab Switcher (Login vs Sign Up) */}
        {tab !== "verify_otp" && (
          <>
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Or Use Credentials
              </span>
            </div>

            <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setErrors({});
                  setServerError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  tab === "login"
                    ? "bg-white text-[#0a2560] shadow-sm font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("signup");
                  setErrors({});
                  setServerError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  tab === "signup"
                    ? "bg-white text-[#0a2560] shadow-sm font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Register
              </button>
            </div>
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* OTP VERIFICATION VIEW */}
        {/* ------------------------------------------------------------- */}
        {tab === "verify_otp" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-sky-50/80 border border-sky-100 rounded-2xl text-center space-y-1">
              <KeyRound className="w-8 h-8 text-[#0a2560] mx-auto mb-1" />
              <p className="text-xs font-black text-[#0a2560] uppercase tracking-wider">
                Gmail OTP Verification
              </p>
              <p className="text-xs text-slate-600">
                A 6-digit confirmation code was sent via Nodemailer to:
              </p>
              <p className="text-sm font-black text-slate-900 bg-white py-1 px-3 rounded-lg border border-slate-200 inline-block mt-0.5">
                {email}
              </p>
              <p className="text-[11px] text-slate-500 pt-0.5">
                Check your Gmail inbox or spam folder, then enter the code below.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtp(val);
                  if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
                }}
                onBlur={() => handleBlur("otp")}
                className={`w-full py-3 text-center tracking-[10px] text-2xl font-black rounded-2xl bg-slate-50 border transition-all focus:bg-white focus:outline-hidden ${
                  errors.otp
                    ? "border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500"
                    : "border-slate-200 text-slate-900 focus:border-[#0a2560]"
                }`}
              />
              {errors.otp && (
                <p className="text-xs text-rose-600 font-semibold mt-1 text-center flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.otp}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#e52823] hover:bg-[#cc201b] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm tracking-wide shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? "Verifying Code..." : "Verify & Sign In"}</span>
            </button>

            {/* Resend & Back Controls */}
            <div className="flex items-center justify-between text-xs font-bold pt-2">
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setErrors({});
                  setServerError(null);
                }}
                className="text-slate-500 hover:text-[#0a2560] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className={`flex items-center gap-1 ${
                  resendCooldown > 0
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-[#0ea5e9] hover:underline cursor-pointer"
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                <span>
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
                </span>
              </button>
            </div>
          </form>
        ) : (
          /* ------------------------------------------------------------- */
          /* SIGN IN / REGISTER FORM */
          /* ------------------------------------------------------------- */
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* FULL NAME (Signup Only) */}
            {tab === "signup" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-[#e52823]">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (touched.name) {
                        setErrors((prev) => ({
                          ...prev,
                          name: validateName(e.target.value) || undefined,
                        }));
                      }
                    }}
                    onBlur={() => handleBlur("name")}
                    className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:bg-white transition-all ${
                      errors.name
                        ? "border-rose-400 bg-rose-50/30 focus:border-rose-500"
                        : "border-slate-200 focus:border-[#0a2560]"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>
            )}

            {/* EMAIL ADDRESS */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address <span className="text-[#e52823]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:bg-white transition-all ${
                    errors.email
                      ? "border-rose-400 bg-rose-50/30 focus:border-rose-500"
                      : "border-slate-200 focus:border-[#0a2560]"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* PHONE NUMBER (Optional on Signup) */}
            {tab === "signup" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Optional</span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (touched.phone) {
                        setErrors((prev) => ({
                          ...prev,
                          phone: validatePhone(e.target.value) || undefined,
                        }));
                      }
                    }}
                    onBlur={() => handleBlur("phone")}
                    className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:bg-white transition-all ${
                      errors.phone
                        ? "border-rose-400 bg-rose-50/30 focus:border-rose-500"
                        : "border-slate-200 focus:border-[#0a2560]"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>
            )}

            {/* PASSWORD */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password <span className="text-[#e52823]">*</span>
                </label>
                {tab === "login" && (
                  <button
                    type="button"
                    onClick={() =>
                      setSuccessMessage(
                        "If you need to reset your password, contact support at 0124-6201611."
                      )
                    }
                    className="text-[11px] font-bold text-[#f97316] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={tab === "signup" ? "At least 6 characters" : "••••••••••••"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:bg-white transition-all ${
                    errors.password
                      ? "border-rose-400 bg-rose-50/30 focus:border-rose-500"
                      : "border-slate-200 focus:border-[#0a2560]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator (Signup) */}
              {tab === "signup" && password && (
                <div className="mt-1.5 space-y-1 animate-fade-in">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Strength:</span>
                    <span
                      className={
                        passwordStrength.score >= 3
                          ? "text-emerald-600"
                          : passwordStrength.score === 2
                          ? "text-yellow-600"
                          : "text-rose-600"
                      }
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.colorClass}`}
                      style={{ width: `${passwordStrength.widthPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD (Signup Only) */}
            {tab === "signup" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-[#e52823]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:bg-white transition-all ${
                      errors.confirmPassword
                        ? "border-rose-400 bg-rose-50/30 focus:border-rose-500"
                        : "border-slate-200 focus:border-[#0a2560]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>
            )}

            {/* ROLE PICKER (Signup Only: Traveler vs Resort Owner) */}
            {tab === "signup" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole("CUSTOMER")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      role === "CUSTOMER"
                        ? "border-[#0ea5e9] bg-sky-50/70 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs text-[#0a2560]">
                      <UserIcon className="w-4 h-4 text-[#0ea5e9]" />
                      <span>Guest Traveler</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Book resorts & earn perks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("OWNER")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      role === "OWNER"
                        ? "border-[#f97316] bg-orange-50/70 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs text-slate-900">
                      <Building2 className="w-4 h-4 text-[#f97316]" />
                      <span>Resort Owner</span>
                    </div>
                    <span className="text-[10px] text-slate-500">List and manage properties</span>
                  </button>
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-[#e52823] hover:bg-[#cc201b] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm tracking-wide shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>
                {isSubmitting
                  ? "Processing..."
                  : tab === "login"
                  ? "Sign In to StayUp"
                  : "Create Account & Send OTP to Gmail"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <p className="text-[11px] text-center text-slate-400 leading-relaxed">
          By continuing, you agree to StayUp&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-2xl p-8 border border-slate-200/90 text-center animate-pulse">
          <div className="h-16 w-32 bg-slate-200 rounded-xl mx-auto mb-4" />
          <div className="h-6 w-48 bg-slate-200 rounded-lg mx-auto mb-2" />
          <div className="h-4 w-64 bg-slate-100 rounded-lg mx-auto" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
