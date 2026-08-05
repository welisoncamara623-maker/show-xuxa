import { PageBackButton } from "@/components/navigation/PageBackButton";

type ShowPageHeaderProps = {
  city: string;
  eventName: string;
};

export function ShowPageHeader({ city, eventName }: ShowPageHeaderProps) {
  return (
    <header className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-0">
      <div className="flex flex-col items-start gap-4">
        <PageBackButton fallbackHref="/" />

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
