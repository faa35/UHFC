"use client";

import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  AtSign,
  Twitch,
} from "lucide-react";
import Link from "next/link";

export default function FooterSocial() {
  return (
    <footer className="mt-32 border-t border-black/10">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {/* ICON ROW */}
        <div className="flex flex-wrap justify-center gap-6 text-black">
          <Icon href="https://facebook.com">
            <Facebook />
          </Icon>

          <Icon href="https://instagram.com">
            <Instagram />
          </Icon>

          <Icon href="https://twitter.com">
            <Twitter />
          </Icon>

          <Icon href="https://youtube.com">
            <Youtube />
          </Icon>




          <Icon href="mailto:info@uhfc.com">
            <AtSign />
          </Icon>

          <Icon href="https://twitch.tv">
            <Twitch />
          </Icon>
        </div>

        {/* BRAND LINE */}
        <div className="mt-16 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} UHFC Sports Complex
        </div>
      </div>
    </footer>
  );
}

/* Reusable icon wrapper */
function Icon({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      className="transition-transform hover:scale-110 hover:text-black"
    >
      <div className="h-8 w-8">{children}</div>
    </Link>
  );
}
