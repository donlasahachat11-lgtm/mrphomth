"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  href?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({
  href = "/",
  width = 200,
  height = 60,
  className = "",
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to light theme during SSR
  const logoSrc = mounted && resolvedTheme === "dark"
    ? "/logo-thai-dark.png"
    : "/logo-thai-light.png";

  const content = (
    <Image
      src={logoSrc}
      alt="มิสเตอร์พรอมท์"
      width={width}
      height={height}
      priority
      className={`transition-opacity duration-200 ${className}`}
    />
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}

// Icon-only version
export function LogoIcon({
  href = "/",
  size = 40,
  className = "",
}: {
  href?: string;
  size?: number;
  className?: string;
}) {
  const content = (
    <Image
      src="/logo-icon.png"
      alt="มิสเตอร์พรอมท์"
      width={size}
      height={size}
      priority
      className={`transition-opacity duration-200 ${className}`}
    />
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
