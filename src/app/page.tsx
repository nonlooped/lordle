import HomeClient from "@/components/home";
import { getRandomWord } from "@/server/words";

export default async function Home() {
  return <HomeClient solution={await getRandomWord()} />;
}
