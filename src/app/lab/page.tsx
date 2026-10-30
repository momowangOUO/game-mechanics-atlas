import HybridLab from "@/components/HybridLab";
import { getMechanic, recipes } from "@/lib/knowledge";
import type { HybridInput } from "@/lib/hybrid";

export const metadata = { title: "混合实验室 · 机制研究室" };

export default async function LabPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const notes: string[] = [];
  const requestedRecipe =
    typeof query.recipe === "string" ? query.recipe : undefined;
  const recipe = recipes.find((item) => item.id === requestedRecipe);
  if (query.recipe !== undefined && !recipe)
    notes.push("链接中的配方未收录，已恢复默认组合。你可以重新选择配方。");
  const ids = recipe?.mechanicIds ?? [
    "aimed-launch",
    "rule-modifier",
    "random-upgrade-offer",
    "run-reset",
    "resource-scarcity",
  ];
  const core =
    ids.find((id) => getMechanic(id)?.dimension === "interaction") ?? ids[0];
  const structureDimensions = new Set([
    "temporal",
    "progression",
    "participants",
  ]);
  const initialInput: HybridInput = {
    core,
    mechanics: [],
    structures: [],
    goals: ["accessible", "replayable"],
  };
  for (const id of ids.filter((id) => id !== core)) {
    (structureDimensions.has(getMechanic(id)!.dimension)
      ? initialInput.structures
      : initialInput.mechanics
    ).push(id);
  }
  if (query.add !== undefined) {
    const add =
      typeof query.add === "string" ? getMechanic(query.add) : undefined;
    if (!add)
      notes.push("链接中的附加机制未收录，已忽略该项。其余选择仍可继续使用。");
    else if (
      ![core, ...initialInput.mechanics, ...initialInput.structures].includes(
        add.id,
      )
    ) {
      (structureDimensions.has(add.dimension)
        ? initialInput.structures
        : initialInput.mechanics
      ).push(add.id);
    } else notes.push("链接中的附加机制已在当前组合中，无需重复添加。");
  }
  return (
    <HybridLab
      key={JSON.stringify(query)}
      initialInput={initialInput}
      initialRecipeId={recipe?.id ?? ""}
      initialNote={notes.join(" ")}
    />
  );
}
