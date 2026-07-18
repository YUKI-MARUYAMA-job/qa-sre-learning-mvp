export function shuffleQuestions<T>(
  questions: readonly T[],
  random: () => number = Math.random
): T[] {
  const shuffled = [...questions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));

    const currentItem = shuffled[index]!;
    const randomItem = shuffled[randomIndex]!;

    shuffled[index] = randomItem;
    shuffled[randomIndex] = currentItem;
  }

  return shuffled;
}
