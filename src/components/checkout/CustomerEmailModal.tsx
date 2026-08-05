"use client";

import { useEffect, useId, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RefObject } from "react";

const customerEmailSchema = z
  .object({
    email: z.string().trim().email("Digite um e-mail válido."),
    emailConfirmation: z.string().trim().email("Confirme com um e-mail válido."),
  })
  .refine(
    (data) => data.email.toLowerCase() === data.emailConfirmation.toLowerCase(),
    {
      path: ["emailConfirmation"],
      message: "Os e-mails informados não são iguais.",
    }
  );

type CustomerEmailFormValues = z.infer<typeof customerEmailSchema>;

type CustomerEmailModalProps = {
  open: boolean;
  defaultEmail?: string;
  submitting?: boolean;
  submitError?: string | null;
  returnFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  onConfirm: (email: string) => Promise<boolean> | boolean;
};

export function CustomerEmailModal({
  open,
  defaultEmail,
  submitting = false,
  submitError,
  returnFocusRef,
  onClose,
  onConfirm,
}: CustomerEmailModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CustomerEmailFormValues>({
    resolver: zodResolver(customerEmailSchema),
    mode: "onChange",
    defaultValues: {
      email: defaultEmail ?? "",
      emailConfirmation: defaultEmail ?? "",
    },
  });

  useEffect(() => {
    reset({
      email: defaultEmail ?? "",
      emailConfirmation: defaultEmail ?? "",
    });
  }, [defaultEmail, open, reset]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      return;
    }

    returnFocusRef?.current?.focus();
  }, [open, returnFocusRef]);

  const handleClose = () => {
    if (submitting) {
      return;
    }

    onClose();
  };

  const handleConfirm = async (values: CustomerEmailFormValues) => {
    if (submitting) {
      return;
    }

    const email = values.email.trim().toLowerCase();
    const confirmed = await onConfirm(email);

    if (confirmed) {
      onClose();
      returnFocusRef?.current?.focus();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-modal="true"
      role="dialog"
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
      className="m-0 w-[calc(100%-1.5rem)] max-w-md rounded-[28px] border border-slate-200 bg-white p-0 text-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.22)] backdrop:bg-slate-950/55"
    >
      <div className="max-h-[calc(100vh-1.5rem)] overflow-y-auto px-5 py-6 sm:px-6 sm:py-7">
        <div className="space-y-5">
          <div className="space-y-2">
            <h2 id={titleId} className="text-[1.35rem] font-semibold tracking-[-0.04em] text-slate-950">
              Para onde enviamos seus ingressos?
            </h2>
            <p id={descriptionId} className="text-[0.95rem] leading-6 text-slate-600">
              Informe um e-mail válido. Após a confirmação do pagamento, seus
              ingressos serão enviados para esse endereço.
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              void handleSubmit(handleConfirm)(event);
            }}
          >
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-[0.9rem] font-medium text-slate-700">
                  E-mail
                </span>
                <input
                  type="email"
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={submitting}
                  {...register("email")}
                  className="h-12 w-full rounded-[16px] border border-slate-300 bg-white px-4 text-[0.95rem] text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
                {errors.email ? (
                  <span className="text-[0.84rem] text-rose-600">
                    {errors.email.message}
                  </span>
                ) : null}
              </label>

              <label className="block space-y-2">
                <span className="text-[0.9rem] font-medium text-slate-700">
                  Confirmar e-mail
                </span>
                <input
                  type="email"
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={submitting}
                  {...register("emailConfirmation")}
                  className="h-12 w-full rounded-[16px] border border-slate-300 bg-white px-4 text-[0.95rem] text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
                {errors.emailConfirmation ? (
                  <span className="text-[0.84rem] text-rose-600">
                    {errors.emailConfirmation.message}
                  </span>
                ) : null}
              </label>
            </div>

            <p className="text-[0.85rem] leading-5 text-slate-500">
              Confira o endereço antes de continuar.
            </p>

            {submitError ? (
              <p
                role="alert"
                className="rounded-[16px] bg-rose-50 px-4 py-3 text-[0.88rem] leading-6 text-rose-700"
              >
                {submitError}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center rounded-[16px] border border-slate-300 bg-white px-5 text-[0.95rem] font-medium text-slate-700 transition-all hover:border-slate-400 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting || !isValid}
                className="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#1e9bf0] px-5 text-[0.95rem] font-medium text-white shadow-[0_10px_24px_rgba(30,155,240,0.28)] transition-all hover:bg-[#1787da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sky-400/70"
              >
                {submitting ? "Confirmando..." : "Confirmar e continuar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
}
