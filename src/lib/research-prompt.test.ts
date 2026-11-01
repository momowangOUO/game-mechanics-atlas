import { describe, expect, it } from "vitest";
import {
  buildResearchPrompt,
  collectPromptReferences,
  defaultPromptSections,
  promptTemplates,
} from "./research-prompt";
import { createKnowledgeBase, getInstanceStatus } from "./knowledge";
import { assertion, scopeFixture } from "./fixtures/knowledge-fixture";
import type { HybridInput } from "./hybrid";

const input: HybridInput = {
  core: "aimed-launch",
  mechanics: ["rule-modifier", "random-upgrade-offer"],
  structures: ["run-reset"],
  goals: ["accessible"],
};
describe("research prompt composer", () => {
  it("creates distinct research instructions for all three templates without generating conclusions", () => {
    expect(promptTemplates).toHaveLength(3);
    const prompts = promptTemplates.map(({ id }) =>
      buildResearchPrompt({
        input,
        template: id,
        sections: defaultPromptSections(id),
        context: "只讨论单人原型",
      }),
    );
    expect(new Set(prompts).size).toBe(3);
    for (const prompt of prompts) {
      expect(prompt).toContain("只讨论单人原型");
      expect(prompt).toContain("瞄准发射");
      expect(prompt).toContain("站内编辑定义");
      expect(prompt).toContain("事实、设计推断与待验证假设");
      expect(prompt).toContain("来源");
      expect(prompt).not.toContain("兼容性评分");
    }
    expect(prompts[1]).toContain("逐项对照");
    expect(prompts[2]).toContain("可观察指标");
  });
  it("honors optional output sections and preserves the selection without duplicates", () => {
    const duplicate = {
      ...input,
      mechanics: [input.core, "rule-modifier", "rule-modifier"],
    };
    const before = JSON.stringify(duplicate);
    const prompt = buildResearchPrompt({
      input: duplicate,
      template: "combination",
      sections: ["loop", "demo"],
      context: "",
    });
    expect(prompt).toContain("### 核心循环");
    expect(prompt).toContain("### Demo 验证");
    expect(prompt).not.toContain("### 成本与风险");
    expect(prompt.match(/- 配合机制：规则修饰器/g)).toHaveLength(1);
    expect(JSON.stringify(duplicate)).toBe(before);
  });
  it("rejects unknown mechanics instead of emitting an incomplete request", () => {
    expect(() =>
      buildResearchPrompt({
        input: { ...input, core: "not-real" },
        template: "combination",
        sections: [],
        context: "",
      }),
    ).toThrow(/未收录/);
  });
  it("keeps references in one effective scope and never merges sibling modes", () => {
    const data = scopeFixture();
    data.instances = [
      assertion("alpha", "standard"),
      assertion("beta", "alternate"),
    ];
    const refs = collectPromptReferences(["alpha", "beta"], 4, {
      ...data,
      ...createKnowledgeBase(data),
    });
    expect(refs).toHaveLength(1);
    expect(refs[0].matchedMechanicIds).toHaveLength(1);
    expect(
      refs[0].observations.filter((item) => item.status === "unknown"),
    ).toHaveLength(1);
  });
  it("includes only present matches and retains conditional or missing evidence as separate statuses", () => {
    const refs = collectPromptReferences([
      "spatial-loadout",
      "automatic-resolution",
      "planning-timer",
    ]);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs)
      for (const id of ref.matchedMechanicIds)
        expect(getInstanceStatus(ref.gameId, id, ref.scopeId)).toBe("present");
    const backpack = refs.find((item) => item.gameId === "backpack-battles");
    expect(backpack?.matchedMechanicIds).not.toContain("planning-timer");
    expect(
      backpack?.observations.find(
        (item) => item.mechanicId === "planning-timer",
      )?.status,
    ).not.toBe("present");
    expect(new Set(refs.map((ref) => ref.gameId)).size).toBe(refs.length);
  });
});
