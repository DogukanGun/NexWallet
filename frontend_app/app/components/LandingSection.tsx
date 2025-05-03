"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import Image from 'next/image';

interface LandingSectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
  gradient?: "primary" | "secondary" | "neutral";
}

export function LandingSection({ id, className, children, gradient = "neutral" }: LandingSectionProps) {
  const gradientClass = {
    primary: "bg-gradient-to-b from-base-200 via-base-100 to-base-200",
    secondary: "bg-gradient-to-b from-base-100 via-base-200 to-base-100",
    neutral: "bg-gradient-to-b from-base-200 to-base-100",
  }[gradient];

  return (
    <section id={id} className={`py-20 ${gradientClass} ${className}`}>
      <div className="container-styled">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card-styled p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
          <Image
            src={icon}
            alt={title}
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-base-content/80">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface ChainCardProps {
  name: string;
  icon: string;
  active?: boolean;
  comingSoon?: boolean;
}

export function ChainCard({ name, icon, active, comingSoon }: ChainCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`card-styled p-4 flex items-center gap-3 ${comingSoon ? 'opacity-50' : ''}`}
    >
      <Image
        src={icon}
        alt={name}
        width={32}
        height={32}
        className="w-8 h-8"
      />
      <div>
        <p className="font-medium">{name}</p>
        {comingSoon && (
          <span className="text-xs text-primary">Coming Soon</span>
        )}
      </div>
    </motion.div>
  );
}

interface GradientButtonProps {
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "neutral";
  className?: string;
  children: ReactNode;
}

export function GradientButton({ onClick, href, variant = "primary", className, children }: GradientButtonProps) {
  const baseClass = "px-6 py-3 rounded-full font-medium transition-all duration-300";
  const gradientClass = {
    primary: "btn-gradient-primary",
    secondary: "btn-gradient-secondary",
    neutral: "btn-gradient-neutral",
  }[variant];

  const buttonClass = `${baseClass} ${gradientClass} ${className || ''}`;

  if (href) {
    return (
      <motion.a
        href={href}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={buttonClass}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={buttonClass}
    >
      {children}
    </motion.button>
  );
} 