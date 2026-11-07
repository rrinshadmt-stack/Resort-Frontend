"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  KeyRound,
  RefreshCw,
  ArrowLeft,
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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const router = useRouter();
  const { login, register, verifyOtp, resendOtp, loginDemoUser } = useAuth();
  const [tab, setTab] = useState<"login" | "signup" | "verify_otp">(defaultTab);

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

  if (!isOpen) return null;

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    let err: string | null = null;
    if (fieldName === "email") err = validateEmail(email);
    if (fieldName === "password") err = validatePassword(password, tab === "signup");
    if (fieldName === "name") err = tab === "signup" ? validateName(name) : null;
    if (fieldName === "phone") err = tab === "signup" ? validatePhone(phone) : null;
    if (fieldName === "otp") err = tab === "verify_otp" ? validateOtp(otp) : null;

    setErrors((prev) => ({ ...prev, [fieldName]: err || undefined }));
  };

  // Instant Demo User Login
  const handleQuickLogin = () => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage("Logged in as Demo User!");
    loginDemoUser();
    setTimeout(() => {
      onClose();
      router.push("/profile");
    }, 700);
  };

  // Main Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

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
        setSuccessMessage(`Welcome back, ${user.name}!`);
        setTimeout(() => {
          onClose();
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
          onClose();
          router.push("/profile");
        }, 900);
      }
    } catch (err: any) {
      if (err.requiresVerification) {
        setServerError(err.message || "Account requires verification. Enter OTP below.");
        setTab("verify_otp");
        setResendCooldown(60);
      } else {
        setServerError(err.message || "Authentication failed. Please check your credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Banner with StayUp Logo */}
        <div className="bg-gradient-to-r from-[#0a2560] via-[#093278] to-[#1444a8] p-5 text-white text-center relative shrink-0">
          <div className="flex items-center justify-center mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo/stayup_logo.png"
              alt="StayUp Resorts & Stays"
              className="h-13 w-auto object-contain brightness-110 drop-shadow-md hover:scale-102 transition-transform"
            />
          </div>
          <h2 className="text-lg font-black tracking-tight text-white">
            {tab === "verify_otp"
              ? "Verify Email"
              : tab === "signup"
              ? "Create Member Account"
              : "Welcome to StayUp Stays"}
          </h2>
          <p className="text-xs text-sky-100/90 mt-0.5">
            {tab === "verify_otp"
              ? "Enter your 6-digit code to activate"
              : "Access verified resorts & exclusive member discounts"}
          </p>
        </div>

        {/* Tab Navigation (Login vs Signup) */}
        {tab !== "verify_otp" && (
          <div className="flex border-b border-slate-200 bg-slate-50/70 shrink-0">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setErrors({});
                setServerError(null);
              }}
              className={`flex-1 py-3 text-xs font-black tracking-wider uppercase transition-colors cursor-pointer ${
                tab === "login"
                  ? "text-[#0a2560] border-b-2 border-[#0a2560] bg-white font-extrabold"
                  : "text-slate-400 hover:text-slate-700"
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
              className={`flex-1 py-3 text-xs font-black tracking-wider uppercase transition-colors cursor-pointer ${
                tab === "signup"
                  ? "text-[#0a2560] border-b-2 border-[#0a2560] bg-white font-extrabold"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs font-bold text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {serverError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs font-bold text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Fast Instant Demo User Login */}
          {tab !== "verify_otp" && (
            <div className="bg-sky-50/80 rounded-2xl p-3 border border-sky-100 text-center">
              <button
                type="button"
                onClick={handleQuickLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0a2560] hover:bg-[#1444a8] text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Zap className="w-4 h-4 text-[#f97316]" />
                <span>Instant Demo Login (Demo User)</span>
              </button>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Preview member profile and reservations immediately
              </span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* OTP FORM */}
          {/* ------------------------------------------------------------- */}
          {tab === "verify_otp" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-sky-50/80 border border-sky-100 rounded-2xl text-center space-y-1">
                <KeyRound className="w-7 h-7 text-[#0a2560] mx-auto mb-1" />
                <p className="text-xs font-black text-[#0a2560] uppercase tracking-wider">Gmail Verification</p>
                <p className="text-xs text-slate-600">OTP code sent via Nodemailer to:</p>
                <p className="text-xs font-black text-slate-900 bg-white py-1 px-3 rounded-lg border border-slate-200 inline-block">{email}</p>
                <p className="text-[10px] text-slate-500 pt-0.5">Check your inbox or spam folder</p>
              </div>

              <div>
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
                      ? "border-rose-400 bg-rose-50/40 text-rose-900"
                      : "border-slate-200 text-slate-900 focus:border-[#0a2560]"
                  }`}
                />
                {errors.otp && (
                  <p className="text-xs text-rose-600 font-semibold mt-1 text-center flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.otp}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 6}
                className="w-full py-3.5 rounded-2xl bg-[#e52823] hover:bg-[#cc201b] disabled:bg-slate-300 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? "Verifying..." : "Verify & Sign In"}</span>
              </button>

              <div className="flex items-center justify-between text-xs font-bold pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setErrors({});
                    setServerError(null);
                  }}
                  className="text-slate-500 hover:text-[#0a2560] flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back</span>
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
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* ------------------------------------------------------------- */
            /* LOGIN / SIGNUP FORM */
            /* ------------------------------------------------------------- */
            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              {/* Full Name (Signup Only) */}
              {tab === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name <span className="text-[#e52823]">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => handleBlur("name")}
                      className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:bg-white transition-all ${
                        errors.name
                          ? "border-rose-400 bg-rose-50/30"
                          : "border-slate-200 focus:border-[#0a2560]"
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-[#e52823]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:bg-white transition-all ${
                      errors.email
                        ? "border-rose-400 bg-rose-50/30"
                        : "border-slate-200 focus:border-[#0a2560]"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Mobile Number (Optional on Signup) */}
              {tab === "signup" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <span className="text-[10px] text-slate-400 font-bold">Optional</span>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:bg-white transition-all ${
                        errors.phone
                          ? "border-rose-400 bg-rose-50/30"
                          : "border-slate-200 focus:border-[#0a2560]"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password <span className="text-[#e52823]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={tab === "signup" ? "At least 6 characters" : "••••••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:bg-white transition-all ${
                      errors.password
                        ? "border-rose-400 bg-rose-50/30"
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

                {/* Password Strength Meter (Signup) */}
                {tab === "signup" && password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
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
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password (Signup Only) */}
              {tab === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password <span className="text-[#e52823]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#0a2560] focus:bg-white"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.confirmPassword}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Role Selector (Signup) */}
              {tab === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    I am joining as
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("CUSTOMER")}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        role === "CUSTOMER"
                          ? "border-[#0ea5e9] bg-sky-50 text-[#0a2560] font-black"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs block font-bold">Guest Traveler</span>
                      <span className="text-[10px] text-slate-400 block">Bookings & stays</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("OWNER")}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        role === "OWNER"
                          ? "border-[#f97316] bg-orange-50 text-slate-900 font-black"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs block font-bold">Resort Owner</span>
                      <span className="text-[10px] text-slate-400 block">List properties</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#e52823] hover:bg-[#cc201b] disabled:bg-slate-300 text-white font-black text-sm shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 active:scale-98"
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

          <p className="text-[10px] text-center text-slate-400 pt-1">
            By continuing, you agree to StayUp&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
