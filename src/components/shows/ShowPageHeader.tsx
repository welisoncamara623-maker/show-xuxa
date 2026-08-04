"use client";

"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type ShowPageHeaderProps = {
  city: string;
  eventName: string;
};

export function ShowPageHeader({ city, eventName }: ShowPageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <header className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2 rounded-full px-0 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Voltar</span>
      </button>

      <div className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#1e9bf0] sm:text-base">
          {city}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-[2.6rem]">
          {eventName}
        </h1>
      </div>
    </header>
  );
}
