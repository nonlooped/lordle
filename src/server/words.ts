export async function getWordsList(): Promise<string[]> {
  const res = await fetch(
    "https://raw.githubusercontent.com/tabatkins/wordle-list/main/words",
  );
  const text = (await res.text())
    .split("\n")
    .map((w) => w.trim().toLowerCase());
  return text;
}

export async function getRandomWord(): Promise<string> {
  const wordsList = await getWordsList();
  return wordsList[Math.floor(Math.random() * wordsList.length)] ?? "RANDO";
}
