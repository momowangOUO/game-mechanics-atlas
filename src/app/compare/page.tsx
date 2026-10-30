import Compare from "@/components/Compare";
import { games, getGame } from "@/lib/knowledge";

export const metadata = { title: "游戏对比 · 机制研究室" };

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const leftId = typeof query.left === "string" ? query.left : undefined;
  const rightId = typeof query.right === "string" ? query.right : undefined;
  const left = getGame(leftId ?? "") ?? getGame("balatro") ?? games[0];
  const requestedRight = getGame(rightId ?? "") ?? getGame("slay-the-spire");
  const right =
    requestedRight && requestedRight.id !== left.id
      ? requestedRight
      : [getGame("slay-the-spire"), getGame("balatro"), ...games].find(
          (game) => game && game.id !== left.id,
        )!;
  return (
    <Compare
      key={`${left.id}:${right.id}`}
      initialLeft={left.id}
      initialRight={right.id}
    />
  );
}
