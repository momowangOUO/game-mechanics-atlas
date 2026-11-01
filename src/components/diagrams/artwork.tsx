import { interactionRulesArtwork } from "./InteractionRules";
import { temporalBuildArtwork } from "./TemporalBuildProgression";
import { economyInformationArtwork } from "./EconomyInformation";
export const mechanicArtwork = {
  ...interactionRulesArtwork,
  ...temporalBuildArtwork,
  ...economyInformationArtwork,
};
