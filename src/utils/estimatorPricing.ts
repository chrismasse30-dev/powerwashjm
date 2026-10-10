export interface PricingData {
  solarPanelCleaning: {
    pricePerPanel: number;
  };
  fenceWash: {
    pricePerPanel: number;
    pricePerLinearFoot: number;
  };
  houseWash: {
    pricePerSqFt: number;
    storyMultiplier: {
      '1': number;
      '2': number;
      '3': number;
    };
    soilLevelMultiplier: {
      light: number;
      moderate: number;
      heavy: number;
    };
  };
  roofCleaning: {
    pricePerSqFt: number;
    storyMultiplier: {
      '1': number;
      '2': number;
      '3': number;
      '4': number;
    };
    soilLevelMultiplier: {
      light: number;
      moderate: number;
      heavy: number;
    };
  };
  deckWash: {
    pricePerSqFt: number;
    soilLevelMultiplier: {
      light: number;
      moderate: number;
      heavy: number;
    };
  };
  patioWash: {
    pricePerSqFt: number;
    materialMultiplier: {
      concrete: number;
      pavers: number;
      brick: number;
      wood: number;
      composite: number;
      asphalt: number;
    };
    dirtinessMultiplier: {
      light: number;
      moderate: number;
      heavy: number;
    };
  };
  drivewayWash: {
    pricePerSqFt: number;
    soilLevelMultiplier: {
      light: number;
      moderate: number;
      heavy: number;
    };
  };
  gutterCleaning: {
    pricePerLinearFoot: number;
    storyMultiplier: {
      '1': number;
      '2': number;
      '3': number;
      '4': number;
    };
    soilLevelMultiplier: {
      light: number;
      moderate: number;
      heavy: number;
    };
  };
  houseWashAddOns: {
    walkout: number;
  };
}

export const defaultPricing: PricingData = {
  solarPanelCleaning: { pricePerPanel: 20 },
  fenceWash: { pricePerPanel: 25, pricePerLinearFoot: 4 },
  houseWash: {
    pricePerSqFt: 0.30,
    storyMultiplier: { '1': 1.0, '2': 1.8, '3': 2.5 },
    soilLevelMultiplier: { light: 1.0, moderate: 1.25, heavy: 1.6 }
  },
  roofCleaning: {
    pricePerSqFt: 0.75,
    storyMultiplier: { '1': 1.0, '2': 1.2, '3': 1.5, '4': 1.8 },
    soilLevelMultiplier: { light: 1.0, moderate: 1.25, heavy: 1.6 }
  },
  deckWash: {
    pricePerSqFt: 0.25,
    soilLevelMultiplier: { light: 1.0, moderate: 1.25, heavy: 1.6 }
  },
  patioWash: {
    pricePerSqFt: 0.40,
    materialMultiplier: { concrete: 1, pavers: 1.2, brick: 1.15, wood: 1.5, composite: 1.3, asphalt: 1.0 },
    dirtinessMultiplier: { light: 1, moderate: 1.25, heavy: 1.6 }
  },
  drivewayWash: {
    pricePerSqFt: 0.30,
    soilLevelMultiplier: { light: 1.0, moderate: 1.25, heavy: 1.6 }
  },
  gutterCleaning: {
    pricePerLinearFoot: 1.00,
    storyMultiplier: { '1': 1.0, '2': 1.2, '3': 1.5, '4': 1.8 },
    soilLevelMultiplier: { light: 1.0, moderate: 1.25, heavy: 1.6 }
  },
  houseWashAddOns: { walkout: 75 }
};

const PRICING_STORAGE_KEY = 'powerwashPricing';

export function getPricing(): PricingData {
  try {
    const stored = localStorage.getItem(PRICING_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Migration: Handle old pricing structure without deckWash
      if (!parsed.deckWash) {
        parsed.deckWash = defaultPricing.deckWash;
      }

      // Migration: Handle old pricing structure without drivewayWash
      if (!parsed.drivewayWash) {
        parsed.drivewayWash = defaultPricing.drivewayWash;
      }

      // Migration: Add asphalt to patioWash materialMultiplier if missing
      if (parsed.patioWash && !parsed.patioWash.materialMultiplier.asphalt) {
        parsed.patioWash.materialMultiplier.asphalt = defaultPricing.patioWash.materialMultiplier.asphalt;
      }

      // Migration: Add soil level multipliers to services if missing
      if (parsed.houseWash && !parsed.houseWash.soilLevelMultiplier) {
        parsed.houseWash.soilLevelMultiplier = defaultPricing.houseWash.soilLevelMultiplier;
      }
      if (parsed.roofCleaning && !parsed.roofCleaning.soilLevelMultiplier) {
        parsed.roofCleaning.soilLevelMultiplier = defaultPricing.roofCleaning.soilLevelMultiplier;
      }
      if (parsed.deckWash && !parsed.deckWash.soilLevelMultiplier) {
        parsed.deckWash.soilLevelMultiplier = defaultPricing.deckWash.soilLevelMultiplier;
      }
      if (parsed.drivewayWash && !parsed.drivewayWash.soilLevelMultiplier) {
        parsed.drivewayWash.soilLevelMultiplier = defaultPricing.drivewayWash.soilLevelMultiplier;
      }

      // Migration: Add gutterCleaning if missing
      if (!parsed.gutterCleaning) {
        parsed.gutterCleaning = defaultPricing.gutterCleaning;
      }

      // Migration: Remove old flat-rate deck service if it exists
      if (parsed.services?.deck !== undefined) {
        delete parsed.services;
      }

      // Save migrated data
      localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(parsed));

      return parsed;
    }
  } catch (error) {
    console.error('Error loading pricing from storage:', error);
  }
  return defaultPricing;
}

export function savePricing(pricing: PricingData): void {
  try {
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(pricing));
  } catch (error) {
    console.error('Error saving pricing to storage:', error);
  }
}
