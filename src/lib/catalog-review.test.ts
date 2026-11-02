import { describe, expect, it } from "vitest";
import { games, genres, mechanics, getGame, getInstances } from "./knowledge";
import { playStyles } from "../data/play-styles";
import admission from "../../docs/research/admission-review-2026.json";
import pending from "../../docs/research/archive/admission-pending-2026.json";
import originalAudit from "../../docs/research/tag-audit-original-2026.json";
import mobileAudit from "../../docs/research/tag-audit-mobile-2026.json";
import classicsAudit from "../../docs/research/tag-audit-classics-2026.json";
import modernAudit from "../../docs/research/tag-audit-modern-2026.json";

describe("catalog classification and admission review", () => {
  it("separates score-chart rhythm play from rhythm action combat", () => {
    const sekai = games.find(game => game.name.includes("Project SEKAI"))!;
    expect(sekai).toBeDefined();
    expect(sekai.genreIds).toContain("rhythm-game");
    expect(sekai.genreIds).not.toContain("action");
    expect(sekai.playStyleIds).toContain("rhythm-play");
    expect(sekai.playStyleIds).not.toContain("action-combat");
    for (const id of ["hi-fi-rush", "crypt-of-the-necrodancer"]) {
      expect(getGame(id)?.playStyleIds).toEqual(expect.arrayContaining(["rhythm-play", "action-combat"]));
    }
  });

  it("does not use tactical command for every game with tactical decisions", () => {
    for (const id of ["slay-the-spire", "league-of-legends", "counter-strike-2", "valorant", "overcooked-2"])
      expect(getGame(id)?.playStyleIds, id).not.toContain("tactical-command");
    expect(getGame("xcom-2")?.playStyleIds).toEqual(expect.arrayContaining(["tactical-command", "turn-based-combat"]));
    expect(getGame("caves-of-qud")?.playStyleIds).toContain("turn-based-combat");
    for (const id of ["mewgenics", "baldurs-gate-3", "age-of-wonders-planetfall", "age-of-wonders-3", "age-of-wonders-4", "troubleshooter-abandoned-children", "wartales", "expeditions-rome", "marvel-puzzle-quest"])
      expect(getGame(id)?.playStyleIds, id).toContain("turn-based-combat");
    for (const id of ["wii-sports", "league-of-legends-wild-rift", "sid-meiers-alpha-centauri"])
      expect(getGame(id)?.playStyleIds, id).not.toContain("turn-based-combat");
    expect(getGame("mario-kart-8-deluxe")?.genreIds).toContain("racing");
    expect(getGame("mario-kart-8-deluxe")?.genreIds).not.toContain("vehicle-sport");
  });

  it("keeps held candidates outside the public catalog without claiming low sales", () => {
    const held = admission.candidates.filter(row => row.decision === "hold").map(row => row.id).sort();
    expect(pending.entries.map(row => row.case.id).sort()).toEqual(held);
    for (const id of held) expect(getGame(id), id).toBeUndefined();
    expect(games.some(game => /万手一体|Out of Hands/i.test(game.name))).toBe(true);
    for (const id of ["liars-bar", "sethian", "epigraph", "the-gostak"]) expect(getGame(id)).toBeUndefined();
  });

  it("registers every direction and genre without inventing mechanic IDs", () => {
    const atomIds = new Set(mechanics.map(row => row.id));
    const genreIds = new Set(genres.map(row => row.id));
    const directionIds = new Set<string>(playStyles.map(row => row.id));
    for (const style of playStyles)
      for (const id of style.mechanicIds) expect(atomIds.has(id), `${style.id}/${id}`).toBe(true);
    for (const game of games) {
      for (const id of game.genreIds) expect(genreIds.has(id), `${game.id}/${id}`).toBe(true);
      for (const id of game.playStyleIds ?? []) expect(directionIds.has(id), `${game.id}/${id}`).toBe(true);
      if (game.referenceOnly) {
        expect(game.coverageNote?.trim().length, game.id).toBeGreaterThan(8);
        expect(getInstances(game.id).length, game.id).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("records individual review of the previous 459-game cohort", () => {
    // Historical review includes candidates subsequently held; the reviewed
    // cohort is deliberately different from the newly published catalog.
    const rows = [...originalAudit, ...mobileAudit, ...classicsAudit, ...modernAudit.records];
    expect(rows).toHaveLength(459);
    expect(new Set(rows.map(row => row.id)).size).toBe(459);
  });
});
