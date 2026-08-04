import { Check } from "lucide-react";

type ProtectionBenefitsProps = {
  items: string[];
};

export function ProtectionBenefits({ items }: ProtectionBenefitsProps) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-slate-600">
          <Check
            className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#1e9bf0]"
            aria-hidden="true"
          />
          <span className="text-[0.88rem] leading-6 tracking-[-0.01em] sm:text-[0.92rem]">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
