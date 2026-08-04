import { Check } from "lucide-react";

type CheckoutStepsProps = {
  activeStep: 1 | 2 | 3;
};

const steps = [
  {
    number: 1,
    title: "Ingressos",
    description: "Seleção",
  },
  {
    number: 2,
    title: "Proteção",
    description: "Confirmação",
  },
  {
    number: 3,
    title: "Checkout",
    description: "Pix",
  },
] as const;

export function CheckoutSteps({ activeStep }: CheckoutStepsProps) {
  return (
    <nav aria-label="Etapas do checkout" className="mx-auto w-full max-w-3xl">
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((step) => {
          const isCompleted = step.number < activeStep;
          const isActive = step.number === activeStep;

          return (
            <li
              key={step.number}
              className="rounded-[18px] border border-slate-200 bg-white px-3 py-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.04)] sm:px-4 sm:py-3"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[0.8rem] font-semibold transition-all sm:h-9 sm:w-9 sm:text-sm ${
                    isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : isActive
                        ? "border-[#1e9bf0] bg-[#1e9bf0] text-white"
                        : "border-slate-300 bg-slate-50 text-slate-500"
                  }`}
                  aria-hidden="true"
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.number}
                </div>

                <div className="min-w-0">
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-[0.84rem] sm:tracking-[0.18em]">
                    Etapa {step.number}
                  </p>
                  <p className="text-[0.9rem] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[0.95rem]">
                    {step.title}
                  </p>
                  <p className="text-[0.76rem] leading-4 text-slate-500 sm:text-[0.82rem] sm:leading-5">
                    {step.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
