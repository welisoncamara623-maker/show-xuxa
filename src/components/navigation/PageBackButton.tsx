"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type PageBackButtonProps = {
  ariaLabel?: string;
  fallbackHref?: string;
  className?: string;
};

export function PageBackButton({
  ariaLabel = "Página anterior",
  fallbackHref,
  className = "",
}: PageBackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    if (fallbackHref) {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={handleClick}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-[#1e9bf0] transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${className}`}
    >
      <ArrowLeft className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}
