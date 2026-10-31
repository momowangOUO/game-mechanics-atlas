import { z } from 'zod';

const text = z.string().trim().min(1);
const texts = z.array(text);
export const DimensionIdSchema = z.enum(['interaction', 'rules', 'temporal', 'buildcraft', 'progression', 'economy', 'information', 'participants', 'variability']);
export type DimensionId = z.infer<typeof DimensionIdSchema>;
export const MechanicStatusSchema = z.enum(['present', 'absent', 'not_applicable', 'unknown', 'conditional']);
export type MechanicStatus = z.infer<typeof MechanicStatusSchema>;
export const EvidenceKindSchema = z.enum(['official_description', 'manual', 'developer_description', 'community_documentation', 'editorial_analysis', 'unverified']);

export const MechanicSchema = z.object({
  id:text, name:text, dimension:DimensionIdSchema, definition:text,
  inclusionRules:texts, exclusionRules:texts, misconceptions:texts, designValue:texts,
  risks:texts, adaptation:texts, complexity:z.enum(['低','中','高']), implementationNotes:text,
  relatedMechanics:texts, evidenceRefs:texts, epistemicStatus:z.literal('editorial_definition'), corePlayTags:texts,aliases:texts.optional(),
}).strict();
export type Mechanic = z.infer<typeof MechanicSchema>;

export const SourceSchema = z.object({
  id:text, title:text, url:z.url(), publisher:text, checkedAt:z.iso.date(),
  type:z.enum(['official_store', 'official_site', 'manual', 'developer', 'community', 'editorial']), claimScope:text,
  author:text.optional(),publishedAt:z.iso.date().optional(),verificationNote:text.optional(),
}).strict();
export type Source = z.infer<typeof SourceSchema>;
export const ScopeSchema = z.object({
  id:text, gameId:text, kind:z.enum(['game','mode','system','chapter','character','version']),
  label:text, parentScopeId:text.optional(), versionNote:text.optional(),
}).strict();
export type Scope = z.infer<typeof ScopeSchema>;
export const GameModeSchema = z.object({id:text,gameId:text,name:text,description:text,scopeId:text}).strict();
export type GameMode = z.infer<typeof GameModeSchema>;
export const GameSchema = z.object({
  id:text,name:text,studio:text,year:z.number().int().min(1950).max(2100),yearBasis:text,summary:text,
  analysis:text,factNotes:texts,scopeNotes:text,coreLoop:texts,learning:texts,caveats:texts,sourceIds:texts,
  defaultScopeId:text,genreIds:texts,corePlayTags:texts,resourceNotes:texts,progressionNotes:texts,
  metadataNote:text,accent:text.optional(),symbol:text.optional(),aliases:texts.optional(),
}).strict();
export type Game = z.infer<typeof GameSchema>;
export const MechanicInstanceSchema = z.object({
  id:text,mechanicId:text,scopeId:text,status:MechanicStatusSchema,condition:text.optional(),
  sourceIds:texts,evidenceKind:EvidenceKindSchema,rationale:text,scopeNote:text.optional(),
}).strict().superRefine((instance, ctx) => {
  if (instance.status === 'conditional' && !instance.condition?.trim()) {
    ctx.addIssue({code:'custom',path:['condition'],message:'条件状态必须说明成立条件。'});
  }
  if (['official_description','manual','developer_description','community_documentation'].includes(instance.evidenceKind) && instance.sourceIds.length === 0) {
    ctx.addIssue({code:'custom',path:['sourceIds'],message:'官方事实必须引用来源。'});
  }
});
export type MechanicInstance = z.infer<typeof MechanicInstanceSchema>;
export const CompositeGenreSchema = z.object({
  id:text,name:text,definition:text,requiredMechanics:texts,commonMechanics:texts,optionalMechanics:texts,boundaries:texts,
}).strict();
export type CompositeGenre = z.infer<typeof CompositeGenreSchema>;
export const MechanicRelationshipSchema = z.object({
  id:text,from:text,to:text,type:z.enum(['dependency','synergy','alternative','conflict','resource_supply','rule_rewrite','feedback']),
  context:text,rationale:text,evidenceKind:EvidenceKindSchema,sourceIds:texts,
}).strict();
export type MechanicRelationship = z.infer<typeof MechanicRelationshipSchema>;
export const HybridRecipeSchema = z.object({
  id:text,name:text,mechanicIds:texts,roles:z.record(text,text),synergies:texts,tensions:texts,
  demoQuestions:texts,exampleGameIds:texts,evidenceNotes:texts,
}).strict();
export type HybridRecipe = z.infer<typeof HybridRecipeSchema>;
