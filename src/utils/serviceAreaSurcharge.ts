import { supabase } from '../lib/supabase';

interface SurchargeRule {
  id: string;
  base_zip_code: string;
  distance_from: number;
  distance_to: number;
  surcharge_amount: number;
  active: boolean;
}

interface SurchargeCalculation {
  surcharge: number;
  distance: number;
  ruleId: string | null;
  baseZipCode: string;
}

const ZIP_CODE_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  '02919': { lat: 41.8240, lng: -71.4128 },
  '02904': { lat: 41.8522, lng: -71.4462 },
  '02905': { lat: 41.7954, lng: -71.4162 },
  '02906': { lat: 41.8386, lng: -71.3989 },
  '02907': { lat: 41.8149, lng: -71.4287 },
  '02908': { lat: 41.8522, lng: -71.4080 },
  '02909': { lat: 41.8204, lng: -71.4481 },
  '02910': { lat: 41.8677, lng: -71.4745 },
  '02911': { lat: 41.8230, lng: -71.4690 },
  '02914': { lat: 41.8444, lng: -71.4231 },
  '02920': { lat: 41.7954, lng: -71.4745 },
  '02921': { lat: 41.5954, lng: -71.4745 },
  '02828': { lat: 41.5954, lng: -71.5745 },
};

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getZipCodeCoordinates(zipCode: string): Promise<{ lat: number; lng: number } | null> {
  if (ZIP_CODE_COORDINATES[zipCode]) {
    return ZIP_CODE_COORDINATES[zipCode];
  }

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.places && data.places.length > 0) {
      return {
        lat: parseFloat(data.places[0].latitude),
        lng: parseFloat(data.places[0].longitude),
      };
    }
  } catch (error) {
    console.error('Error fetching zip code coordinates:', error);
  }

  return null;
}

export async function calculateDistanceBetweenZips(
  zip1: string,
  zip2: string
): Promise<number | null> {
  try {
    const cleanZip1 = zip1.replace(/\D/g, '').slice(0, 5);
    const cleanZip2 = zip2.replace(/\D/g, '').slice(0, 5);

    if (cleanZip1.length !== 5 || cleanZip2.length !== 5) {
      return null;
    }

    const coords1 = await getZipCodeCoordinates(cleanZip1);
    const coords2 = await getZipCodeCoordinates(cleanZip2);

    if (!coords1 || !coords2) {
      return null;
    }

    const distance = calculateHaversineDistance(
      coords1.lat,
      coords1.lng,
      coords2.lat,
      coords2.lng
    );

    return Math.round(distance * 10) / 10;
  } catch (error) {
    console.error('Error calculating distance:', error);
    return null;
  }
}

async function getSurchargeRules(): Promise<SurchargeRule[]> {
  try {
    const { data, error } = await supabase
      .from('service_area_surcharges')
      .select('*')
      .eq('active', true)
      .order('distance_from', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching surcharge rules:', error);
    return [];
  }
}

function findMatchingSurchargeRule(
  distance: number,
  rules: SurchargeRule[]
): SurchargeRule | null {
  for (const rule of rules) {
    if (distance >= rule.distance_from && distance < rule.distance_to) {
      return rule;
    }
  }
  return null;
}

export async function calculateServiceAreaSurcharge(
  customerZipCode: string
): Promise<SurchargeCalculation> {
  const defaultResult: SurchargeCalculation = {
    surcharge: 0,
    distance: 0,
    ruleId: null,
    baseZipCode: '02919',
  };

  try {
    const rules = await getSurchargeRules();
    if (rules.length === 0) {
      return defaultResult;
    }

    const baseZipCode = rules[0].base_zip_code || '02919';
    const distance = await calculateDistanceBetweenZips(baseZipCode, customerZipCode);

    if (distance === null) {
      return { ...defaultResult, baseZipCode };
    }

    const matchingRule = findMatchingSurchargeRule(distance, rules);

    if (matchingRule) {
      return {
        surcharge: Number(matchingRule.surcharge_amount),
        distance,
        ruleId: matchingRule.id,
        baseZipCode,
      };
    }

    return { ...defaultResult, distance, baseZipCode };
  } catch (error) {
    console.error('Error calculating service area surcharge:', error);
    return defaultResult;
  }
}

export async function logSurchargeApplication(
  quoteSubmissionId: string | null,
  customerZipCode: string,
  calculation: SurchargeCalculation
): Promise<void> {
  try {
    if (calculation.surcharge === 0) {
      return;
    }

    await supabase.from('quote_surcharge_audit').insert({
      quote_submission_id: quoteSubmissionId,
      customer_zip_code: customerZipCode,
      base_zip_code: calculation.baseZipCode,
      calculated_distance: calculation.distance,
      surcharge_applied: calculation.surcharge,
      surcharge_rule_id: calculation.ruleId,
    });
  } catch (error) {
    console.error('Error logging surcharge application:', error);
  }
}
