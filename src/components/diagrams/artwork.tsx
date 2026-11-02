import { interactionRulesArtwork } from "./InteractionRules";
import { temporalBuildArtwork } from "./TemporalBuildProgression";
import { economyInformationArtwork } from "./EconomyInformation";
import { expandedRulesArtwork } from "./ExpandedRules";
export const mechanicArtwork = {
  ...interactionRulesArtwork,
  ...temporalBuildArtwork,
  ...economyInformationArtwork,
  ...expandedRulesArtwork,
};
