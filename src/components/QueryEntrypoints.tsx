"use client";

import { useSearchParams } from "next/navigation";
import { MechanicCatalog } from "./Catalogs";
import AtlasGraph from "./AtlasGraph";
import HeatObservatory from "./HeatObservatory";
import HybridLab from "./HybridLab";
import Compare from "./Compare";
import { games, getGame, getMechanic, recipes } from "@/lib/knowledge";
import type { HybridInput } from "@/lib/hybrid";
import { normalizedQueryKey, singleQueryValue } from "@/lib/route-query";

function useQuery() {
  const query = useSearchParams();
  return {
    query,
    key: normalizedQueryKey(query),
    one: (name: string) => singleQueryValue(query, name),
  };
}

export function MechanicsQuery() {
  const { key, one } = useQuery();
  return (
    <MechanicCatalog
      key={key}
      initialDimension={one("dimension") ?? ""}
      initialGenre={one("genre") ?? ""}
      initialQuery={one("q") ?? ""}
      initialCore={one("core") ?? ""}
    />
  );
}

export function GraphQuery() {
  const { key, one } = useQuery();
  return (
    <AtlasGraph
      key={key}
      initialFocus={one("focus") ?? ""}
      initialGame={one("game") ?? ""}
    />
  );
}

export function HeatQuery() {
  const { key, one } = useQuery();
  return (
    <HeatObservatory
      key={key}
      initialTopic={one("topic") ?? ""}
      initialView={one("view") ?? ""}
    />
  );
}

export function LabQuery() {
  const { query, key, one } = useQuery();
  const notes: string[] = [];
  const recipe = recipes.find((item) => item.id === one("recipe"));
  if (query.has("recipe") && !recipe)
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
  if (query.has("add")) {
    const add = getMechanic(one("add") ?? "");
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
      key={key}
      initialInput={initialInput}
      initialRecipeId={recipe?.id ?? ""}
      initialNote={notes.join(" ")}
    />
  );
}

export function CompareQuery() {
  const { key, one } = useQuery();
  const left = getGame(one("left") ?? "") ?? getGame("balatro") ?? games[0];
  const requestedRight =
    getGame(one("right") ?? "") ?? getGame("slay-the-spire");
  const right =
    requestedRight && requestedRight.id !== left.id
      ? requestedRight
      : [getGame("slay-the-spire"), getGame("balatro"), ...games].find(
          (game) => game && game.id !== left.id,
        )!;
  return <Compare key={key} initialLeft={left.id} initialRight={right.id} />;
}
