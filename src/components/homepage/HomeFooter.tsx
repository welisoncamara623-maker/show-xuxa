import { SectionTitle } from "@/components/SectionTitle";
import { aboutDescription, aboutTitle } from "@/data/shows";

export function HomeFooter() {
    return (
        <footer className="mx-auto w-full max-w-3xl px-4 pb-12 pt-14 sm:px-6 lg:px-0 sm:pb-16">
            <SectionTitle title="Sobre o Evento" />

            <div className="mx-auto mt-8 max-w-2xl text-center sm:mt-10">
                <p className="text-[0.96rem] font-semibold leading-7 tracking-[-0.02em] text-slate-600 sm:text-[1.05rem]">
                    {aboutTitle}
                </p>
                <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line text-[0.95rem] italic leading-7 tracking-[-0.015em] text-slate-500 sm:text-[1.02rem]">
                    {aboutDescription}
                </p>
            </div>
        </footer>
    );
}
