import { SectionTitle } from "@/components/SectionTitle";

export function HomeFooter() {
    return (
        <footer className="mx-auto w-full max-w-3xl px-4 pb-12 pt-14 sm:px-6 lg:px-0 sm:pb-16">
            <SectionTitle title="Sobre o Evento" />

            <div className="mx-auto mt-8 max-w-2xl text-center sm:mt-10">
                <p className="text-[0.96rem] font-semibold leading-7 tracking-[-0.02em] text-slate-600 sm:text-[1.05rem]">
                    Xuxa anuncia “O Último Voo da Nave” em Curitiba e Belo Horizonte
                </p>
                <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] italic leading-7 tracking-[-0.015em] text-slate-500 sm:text-[1.02rem]">
                    Em uma realização da 30e e apresentadas pelo Itaú Live, as performances
                    terão pré-venda exclusiva para clientes do banco a partir de 10 de abril,
                    às 12h; a venda geral começa no dia 13 de abril, às 14h, ambas pelo site
                    da Eventim
                </p>
            </div>
        </footer>
    );
}
