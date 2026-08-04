import { HomeHeader } from "@/components/homepage/HomeHeader";
import { ShowsList } from "@/components/homepage/ShowList";
import { HomeFooter } from "@/components/homepage/HomeFooter";

export default function Home() {
  return (
    <main className="flex-1">
      <HomeHeader />
      <ShowsList />
      <HomeFooter />
    </main>
  );
}
