type SectionTitleProps = {
  title: string;
  className?: string;
};

export function SectionTitle({ title, className }: SectionTitleProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`.trim()}>
      <h2 className="text-lg font-semibold tracking-[-0.04em] text-slate-950 sm:text-[1.35rem]">
        {title}
      </h2>
      <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
    </div>
  );
}
