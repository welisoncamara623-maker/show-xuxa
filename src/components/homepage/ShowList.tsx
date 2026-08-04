import { shows } from "@/data/shows";
import { ShowCard } from "../shows/ShowCard";

export function ShowsList() {
    return (
        <section
            aria-label="Lista de shows"
            className="mx-auto mt-8 w-full max-w-3xl px-4 sm:mt-10 sm:px-6 lg:px-0"
        >
            <div className="space-y-3.5 sm:space-y-4">
                {shows.map((show) => (
                    <ShowCard
                        key={show.id}
                        id={show.id}
                        city={show.city.toUpperCase()}
                        eventName={show.eventName}
                        venue={show.stadium.toUpperCase()}
                        date={show.card.date}
                        month={show.card.month}
                        year={show.card.year}
                        weekDay={show.card.weekDay}
                        hour={show.card.hour}
                        available
                        href={`/shows/${show.id}`}
                    />
                ))}
            </div>
        </section>
    );
}
