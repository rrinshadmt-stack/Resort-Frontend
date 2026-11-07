import React, { ReactNode } from "react";
import { MapPin, Tag } from "lucide-react";
import { THEME_TEXT_SIZES, THEME_COLORS } from "@/theme/theme";
import { formatCurrency } from "@/lib/utils";

// ============================================================================
// 1. THEME HEADING COMPONENT
// ============================================================================
export interface ThemeHeadingProps {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "span";
  size?: keyof typeof THEME_TEXT_SIZES.heading;
  color?: "primary" | "accent" | "default" | "white";
  children: ReactNode;
  className?: string;
}

export function ThemeHeading({
  as: Component = "h3",
  size = "md",
  color = "default",
  children,
  className = "",
}: ThemeHeadingProps) {
  const sizeClasses = THEME_TEXT_SIZES.heading[size] || THEME_TEXT_SIZES.heading.md;

  const colorClasses = {
    primary: "text-[#0a2560]",
    accent: "text-[#f97316]",
    default: "text-slate-900",
    white: "text-white",
  }[color];

  return (
    <Component
      className={`tracking-tight transition-colors ${sizeClasses} ${colorClasses} ${className}`}
    >
      {children}
    </Component>
  );
}

// ============================================================================
// 2. THEME ADDRESS & LOCATION COMPONENT
// ============================================================================
export interface ThemeAddressProps {
  size?: keyof typeof THEME_TEXT_SIZES.address;
  showIcon?: boolean;
  destination?: string;
  country?: string;
  children?: ReactNode;
  className?: string;
  iconClassName?: string;
}

export function ThemeAddress({
  size = "sm",
  showIcon = true,
  destination,
  country,
  children,
  className = "",
  iconClassName = "",
}: ThemeAddressProps) {
  const sizeClasses = THEME_TEXT_SIZES.address[size] || THEME_TEXT_SIZES.address.sm;

  const content = children || (destination && country ? `${destination}, ${country}` : destination || "");

  return (
    <div className={`inline-flex items-center gap-1.5 text-slate-600 ${sizeClasses} ${className}`}>
      {showIcon && (
        <MapPin
          className={`w-3.5 h-3.5 text-[#f97316] shrink-0 ${iconClassName}`}
        />
      )}
      <span className="truncate">{content}</span>
    </div>
  );
}

// ============================================================================
// 3. THEME PRICE COMPONENT
// ============================================================================
export interface ThemePriceProps {
  amount: number;
  currency?: string;
  originalPrice?: number;
  discountText?: string;
  period?: string;
  size?: keyof typeof THEME_TEXT_SIZES.price;
  subtext?: string;
  className?: string;
  color?: "primary" | "accent" | "white";
}

export function ThemePrice({
  amount,
  currency = "$",
  originalPrice,
  discountText,
  period = "/ night",
  size = "md",
  subtext,
  className = "",
  color = "primary",
}: ThemePriceProps) {
  const sizeClasses = THEME_TEXT_SIZES.price[size] || THEME_TEXT_SIZES.price.md;

  const colorClasses = {
    primary: "text-[#0a2560]",
    accent: "text-[#f97316]",
    white: "text-white",
  }[color];

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Strikethrough & Discount pill */}
      {(originalPrice || discountText) && (
        <div className="flex items-center gap-2 mb-1">
          {originalPrice && (
            <span className="text-xs sm:text-sm font-medium text-slate-400 line-through">
              {formatCurrency(originalPrice, currency)}
            </span>
          )}
          {discountText && (
            <span className="text-[10px] sm:text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              {discountText}
            </span>
          )}
        </div>
      )}

      {/* Main Nightly Rate */}
      <div className="flex items-baseline gap-1">
        <span className={`${sizeClasses} ${colorClasses} tracking-tight`}>
          {formatCurrency(amount, currency)}
        </span>
        {period && (
          <span className="text-xs sm:text-sm font-semibold text-slate-500">
            {period}
          </span>
        )}
      </div>

      {/* Optional subtext */}
      {subtext && (
        <span className="text-[11px] font-medium text-slate-500 mt-0.5">
          {subtext}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// 4. THEME DESCRIPTION COMPONENT
// ============================================================================
export interface ThemeDescriptionProps {
  size?: keyof typeof THEME_TEXT_SIZES.description;
  lines?: number;
  color?: "default" | "muted" | "white";
  children: ReactNode;
  className?: string;
}

export function ThemeDescription({
  size = "md",
  lines,
  color = "default",
  children,
  className = "",
}: ThemeDescriptionProps) {
  const sizeClasses = THEME_TEXT_SIZES.description[size] || THEME_TEXT_SIZES.description.md;

  const colorClasses = {
    default: "text-slate-600",
    muted: "text-slate-500",
    white: "text-slate-200",
  }[color];

  const lineClampClass = lines === 1 ? "line-clamp-1" : lines === 2 ? "line-clamp-2" : lines === 3 ? "line-clamp-3" : "";

  return (
    <p className={`${sizeClasses} ${colorClasses} ${lineClampClass} ${className}`}>
      {children}
    </p>
  );
}

// ============================================================================
// 5. THEME BADGE COMPONENT
// ============================================================================
export interface ThemeBadgeProps {
  variant?: "primary" | "accent" | "secondary" | "success" | "neutral";
  size?: keyof typeof THEME_TEXT_SIZES.badge;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ThemeBadge({
  variant = "neutral",
  size = "sm",
  icon,
  children,
  className = "",
}: ThemeBadgeProps) {
  const sizeClasses = THEME_TEXT_SIZES.badge[size] || THEME_TEXT_SIZES.badge.sm;

  const variantClasses = {
    primary: "bg-[#0a2560] text-white",
    accent: "bg-[#f97316] text-white",
    secondary: "bg-[#0ea5e9] text-white",
    success: "bg-emerald-100 text-emerald-800",
    neutral: "bg-slate-100 text-slate-700",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold transition-all shadow-2xs ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}
