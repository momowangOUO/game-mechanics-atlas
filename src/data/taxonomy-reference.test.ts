import { describe, expect, it } from "vitest";
import {
  dimensions,
  games,
  instances,
  mechanics,
  scopes,
  sources,
} from "../lib/knowledge";
import {
  classificationLevels,
  getMechanicTaxonomy,
  getTaxonomyGroups,
  mechanicExamples,
  taxonomyDimensions,
  taxonomyGroups,
} from "./taxonomy-reference";

describe("taxonomy navigation integrity", () => {
  it("covers the nine canonical dimensions and every mechanism exactly once without moving its primary dimension", () => {
    expect(taxonomyDimensions.map((row) => row.dimensionId).sort()).toEqual(
      dimensions.map((row) => row.id).sort(),
    );
    expect(new Set(taxonomyGroups.map((row) => row.id)).size).toBe(
      taxonomyGroups.length,
    );
    expect(taxonomyGroups.length).toBeGreaterThanOrEqual(35);
    expect(taxonomyGroups.length).toBeLessThanOrEqual(50);
    const assigned = taxonomyGroups.flatMap((group) => group.mechanicIds);
    expect(assigned.slice().sort()).toEqual(
      mechanics.map((row) => row.id).sort(),
    );
    for (const group of taxonomyGroups) {
      expect(group.mechanicIds.length).toBeGreaterThan(0);
      for (const id of group.mechanicIds) {
        expect(mechanics.find((row) => row.id === id)?.dimension).toBe(
          group.dimensionId,
        );
        expect(getMechanicTaxonomy(id)?.group.id).toBe(group.id);
      }
    }
    for (const dimension of taxonomyDimensions) {
      expect(getTaxonomyGroups(dimension.dimensionId).length).toBeGreaterThan(
        0,
      );
      expect(
        [
          dimension.question,
          dimension.explanation,
          dimension.use,
          dimension.boundary,
        ].every((text) => text.length > 12),
      ).toBe(true);
    }
    expect(getMechanicTaxonomy("not-a-mechanic")).toBeUndefined();
  });

  it("keeps each typical game example tied to an existing observed mechanism and its exact scope and evidence", () => {
    const sourceIds = new Set(sources.map((row) => row.id));
    for (const group of taxonomyGroups) {
      expect(group.examples.length, group.id).toBeGreaterThan(0);
      expect(
        [group.explanation, group.function, group.boundary].every(
          (text) => text.length > 16,
        ),
        group.id,
      ).toBe(true);
      for (const example of group.examples)
        expect(group.mechanicIds).toContain(example.mechanicId);
    }
    for (const example of [
      ...taxonomyGroups.flatMap((group) => group.examples),
      ...Object.values(mechanicExamples).flat(),
    ]) {
      const original = instances.find((row) => row.id === example.instanceId);
      const scope = scopes.find((row) => row.id === example.scopeId);
      expect(original, example.instanceId).toBeDefined();
      expect(games.some((row) => row.id === example.gameId)).toBe(true);
      expect(scope?.gameId).toBe(example.gameId);
      expect(scope?.label).toBe(example.scopeLabel);
      expect(original?.mechanicId).toBe(example.mechanicId);
      expect(original?.scopeId).toBe(example.scopeId);
      expect(original?.status).toBe(example.status);
      expect(["present", "conditional"]).toContain(example.status);
      expect(example.observation).toBe(original?.rationale);
      expect(example.condition).toBe(original?.condition);
      expect(example.scopeNote).toBe(original?.scopeNote);
      expect(example.evidenceKind).toBe(original?.evidenceKind);
      expect(example.sourceIds).toEqual(original?.sourceIds);
      expect(example.sourceIds.length).toBeGreaterThan(0);
      expect(example.sourceIds.every((id) => sourceIds.has(id))).toBe(true);
      if (example.status === "conditional")
        expect(example.condition?.length).toBeGreaterThan(0);
    }
  });

  it("preserves evidence gaps instead of using a genre tag to invent examples", () => {
    expect(Object.keys(mechanicExamples).sort()).toEqual(
      mechanics.map((row) => row.id).sort(),
    );
    for (const mechanic of mechanics) {
      const observations = instances.filter(
        (row) =>
          row.mechanicId === mechanic.id &&
          ["present", "conditional"].includes(row.status),
      );
      expect(mechanicExamples[mechanic.id].length > 0).toBe(
        observations.length > 0,
      );
      expect(
        new Set(mechanicExamples[mechanic.id].map((row) => row.gameId)).size,
      ).toBe(mechanicExamples[mechanic.id].length);
    }
    expect(
      Object.entries(mechanicExamples)
        .filter(([, rows]) => rows.length === 0)
        .map(([id]) => id)
        .sort(),
    ).toEqual([]);
    expect(mechanicExamples["next-piece-preview"][0]).toMatchObject({
      gameId: "tetris",
      scopeId: "tetris:basicfun-09686-marathon",
      evidenceKind: "manual",
      sourceIds: ["tetris-basicfun-09686-manual"],
    });
    expect(mechanicExamples["ability-check"][0]).toMatchObject({
      gameId: "disco-elysium",
      scopeId: "disco-elysium:standard",
      status: "present",
      evidenceKind: "developer_description",
      sourceIds: [
        "disco-elysium-active-checks-devlog",
        "disco-elysium-official-faq",
      ],
    });
    expect(classificationLevels.map((row) => row.id)).toEqual([
      "dimension",
      "group",
      "mechanic",
      "instance",
      "genre",
      "recipe",
      "metadata",
    ]);
  });
});
