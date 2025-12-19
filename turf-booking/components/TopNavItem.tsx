"use client";

import Link from "next/link";

type TopNavItemProps = {
  href: string;
  icon: React.ReactNode; // emoji, text, or an icon component
  label: string;
  variant?: "green" | "yellow";
  widthClass?: string; // e.g. "w-[72px]" or "w-[90px]"
};

export default function TopNavItem({
  href,
  icon,
  label,
  variant = "green",
  widthClass = "w-[72px]",
}: TopNavItemProps) {
  const base =
    `${widthClass} flex flex-col items-center justify-center py-2 ` +
    `transition-colors select-none`;

  const styles =
    variant === "yellow"
      ? "bg-[#F2D46C] text-black hover:bg-[#f0cf55]"
      : "bg-white/10 text-white hover:bg-white/15";

  return (
    <Link href={href} className={`${base} ${styles}`}>
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[11px] mt-1 text-center leading-3 px-1">
        {label}
      </span>
    </Link>
  );
}
