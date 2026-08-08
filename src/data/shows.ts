import { DEFAULT_TICKET_OPTIONS } from "./ticket-options";
import type { TicketOption } from "./ticket-options";

export type ShowRating = {
  label: string;
  rating: number;
  maxRating: number;
};

export type { TicketOption } from "./ticket-options";

export type ShowData = {
  id: string;
  city: string;
  eventName: string;
  card: {
    date: string;
    month: string;
    year: string;
    weekDay: string;
    hour: string;
  };
  bannerImage: string;
  bannerImageAlt: string;
  aboutTitle: string;
  aboutDescription: string;
  stadium: string;
  stadiumRatingLabel: string;
  stadiumRating: number;
  fanReportHref: string;
  address: string;
  googleMapsHref: string;
  tickets: TicketOption[];
  ratings: ShowRating[];
};

const eventName = "XUXA - O ÚLTIMO VOO DA NAVE";
export const aboutTitle = "Xuxa Tour 2026 – Um Show Mágico para os Baixinhos";
export const aboutDescription =
  "Prepare-se para viver um momento inesquecível! A Xuxa Tour 2026 chegou para encantar toda a família com um espetáculo lúdico e cheio de alegria, especialmente pensado para o público infantil.\n\nEm um cenário colorido e interativo, a eterna Rainha dos Baixinhos apresenta um show repleto de músicas que marcaram gerações, coreografias animadas e uma mensagem positiva de amizade e respeito.\n\nÉ a oportunidade perfeita para os pequenos (e também para os adultos que ainda guardam a criança no coração) cantarem juntos, reviverem grandes sucessos e criarem memórias afetivas que durarão para sempre.";

function createTickets() {
  return DEFAULT_TICKET_OPTIONS.map((ticket) => ({ ...ticket }));
}

function createGoogleMapsHref(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
}

export const shows: ShowData[] = [
  {
    id: "curitiba",
    city: "Curitiba",
    eventName,
    card: {
      date: "26",
      month: "set.",
      year: "2026",
      weekDay: "sáb",
      hour: "20:00",
    },
    bannerImage: "/locations-shows/location-arena-da-baixada.jpg",
    bannerImageAlt: "Arena da Baixada, local do show em Curitiba",
    aboutTitle,
    aboutDescription,
    stadium: "Arena da Baixada",
    stadiumRatingLabel: "Geral (1)",
    stadiumRating: 5,
    fanReportHref: "#",
    address: "Rua Buenos Aires, 1260 - Água Verde, Curitiba - PR, 80250-070",
    googleMapsHref: createGoogleMapsHref(
      "Rua Buenos Aires, 1260 - Água Verde, Curitiba - PR, 80250-070"
    ),
    tickets: createTickets(),
    ratings: [
      { label: "Atmosfera", rating: 5, maxRating: 5 },
      { label: "Banheiros", rating: 3, maxRating: 5 },
      { label: "Serviços no local", rating: 4, maxRating: 5 },
      { label: "Acústica e campo de visão", rating: 4, maxRating: 5 },
      { label: "Estacionamento", rating: 5, maxRating: 5 },
    ],
  },
  {
    id: "belo-horizonte",
    city: "Belo Horizonte",
    eventName,
    card: {
      date: "14",
      month: "nov.",
      year: "2026",
      weekDay: "sáb",
      hour: "20:00",
    },
    bannerImage: "/locations-shows/location-arena-mrv.jpg",
    bannerImageAlt: "Arena MRV, local do show em Belo Horizonte",
    aboutTitle,
    aboutDescription,
    stadium: "Arena MRV",
    stadiumRatingLabel: "Geral (1)",
    stadiumRating: 5,
    fanReportHref: "#",
    address:
      "Rua Cristina Maria de Assis, 202 - Califórnia, Belo Horizonte - MG, 30535-370",
    googleMapsHref: createGoogleMapsHref(
      "Rua Cristina Maria de Assis, 202 - Califórnia, Belo Horizonte - MG, 30535-370"
    ),
    tickets: createTickets(),
    ratings: [
      { label: "Atmosfera", rating: 5, maxRating: 5 },
      { label: "Banheiros", rating: 3, maxRating: 5 },
      { label: "Serviços no local", rating: 4, maxRating: 5 },
      { label: "Acústica e campo de visão", rating: 4, maxRating: 5 },
      { label: "Estacionamento", rating: 5, maxRating: 5 },
    ],
  },
  {
    id: "rio-de-janeiro",
    city: "Rio de Janeiro",
    eventName,
    card: {
      date: "20",
      month: "dez.",
      year: "2026",
      weekDay: "dom",
      hour: "19:00",
    },
    bannerImage: "/locations-shows/location-maracana.jpg",
    bannerImageAlt: "Estádio Maracanã, local do show no Rio de Janeiro",
    aboutTitle,
    aboutDescription,
    stadium: "Estádio Maracanã",
    stadiumRatingLabel: "Geral (1)",
    stadiumRating: 5,
    fanReportHref: "#",
    address: "Av. Pres. Castelo Branco, s/n, 20271-130 Rio de Janeiro",
    googleMapsHref: createGoogleMapsHref(
      "Av. Pres. Castelo Branco, s/n, 20271-130 Rio de Janeiro"
    ),
    tickets: createTickets(),
    ratings: [
      { label: "Atmosfera", rating: 5, maxRating: 5 },
      { label: "Banheiros", rating: 3, maxRating: 5 },
      { label: "Serviços no local", rating: 4, maxRating: 5 },
      { label: "Acústica e campo de visão", rating: 4, maxRating: 5 },
      { label: "Estacionamento", rating: 5, maxRating: 5 },
    ],
  },
];

export function getShowById(id: string) {
  return shows.find((show) => show.id === id);
}
