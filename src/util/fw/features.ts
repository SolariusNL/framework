export enum FeatureIdentifier {
  Domains = "domains",
  APIKeys = "apiKeys",
  OAuth2 = "oauth2",
  DevProfiles = "devProfiles",
  Bits = "bits",
  Redis = "redis",
}
const enabledFeatures = new Set<FeatureIdentifier>(
  Object.values(FeatureIdentifier) as FeatureIdentifier[]
);

export const Feature = {
  enable(featureName: FeatureIdentifier) {
    enabledFeatures.add(featureName);
  },
  disable(featureName: FeatureIdentifier) {
    enabledFeatures.delete(featureName);
  },
  enabled(featureName: FeatureIdentifier) {
    return enabledFeatures.has(featureName);
  },
  features: enabledFeatures,
};
