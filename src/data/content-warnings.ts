import { ContentWarning } from "@prisma/client";

export const contentWarnings: Record<ContentWarning, string> = {
  [ContentWarning.VIOLENCE]: "Contains scenes of violence",
  [ContentWarning.SEXUAL_CONTENT]: "Includes sexual content",
  [ContentWarning.STRONG_LANGUAGE]: "Contains strong language",
  [ContentWarning.DRUG_ABUSE]: "Depicts drug abuse",
  [ContentWarning.ALCOHOL_ABUSE]: "Includes scenes of alcohol abuse",
  [ContentWarning.SELF_HARM]: "Contains depictions of self-harm",
  [ContentWarning.SUICIDAL_CONTENT]: "Includes suicidal themes",
  [ContentWarning.NUDITY]: "Contains nudity",
  [ContentWarning.DISCRIMINATION]: "Includes discriminatory content",
  [ContentWarning.GRAPHIC_IMAGES]: "Contains graphic images",
  [ContentWarning.SENSITIVE_TOPIC]: "Touches on sensitive topics",
  [ContentWarning.DEATH]: "Includes themes of death",
  [ContentWarning.ABUSE]: "Contains scenes of abuse",
  [ContentWarning.MENTAL_HEALTH]: "Depicts mental health issues",
  [ContentWarning.MEDICAL_PROCEDURES]:
    "Includes depictions of medical procedures",
  [ContentWarning.FLASHING_LIGHTS]: "May have flashing lights",
};
