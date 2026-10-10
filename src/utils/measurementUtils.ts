export interface Point {
  x: number;
  y: number;
}

export interface CalibrationData {
  pixelDistance: number;
  realWorldDistance: number;
  pixelsPerUnit: number;
  referencePoints: [Point, Point];
}

export interface Measurement {
  id: string;
  type: 'length' | 'area' | 'tree';
  points: Point[];
  value: number;
  perimeter?: number;
  metadata?: {
    width?: number;
    height?: number;
    spacing?: number;
    circumference?: number;
    wraps?: number;
    widthPoints?: [Point, Point];
    heightPoints?: [Point, Point];
    photoId?: string;
    lineColor?: string;
    isPowerCord?: boolean;
  };
}

export function calculateDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function calculateRealWorldDistance(
  pixelDistance: number,
  calibration: CalibrationData
): number {
  return pixelDistance / calibration.pixelsPerUnit;
}

export function calculatePolygonArea(points: Point[]): number {
  if (points.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
}

export function calculatePolygonPerimeter(points: Point[]): number {
  if (points.length < 2) return 0;

  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    perimeter += calculateDistance(points[i], points[j]);
  }
  return perimeter;
}

function applyPerspectiveCorrection(
  point: Point,
  imageWidth: number,
  imageHeight: number
): Point {
  const centerX = imageWidth / 2;
  const centerY = imageHeight / 2;

  const dx = point.x - centerX;
  const dy = point.y - centerY;

  const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
  const distanceRatio = distanceFromCenter / maxDistance;

  const correctionFactor = 1 + (distanceRatio * 0.15);

  return {
    x: centerX + dx * correctionFactor,
    y: centerY + dy * correctionFactor
  };
}

export function convertToFeetInches(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);

  if (feet === 0) {
    return `${remainingInches}"`;
  } else if (remainingInches === 0) {
    return `${feet}'`;
  } else {
    return `${feet}' ${remainingInches}"`;
  }
}

export function convertToMeters(inches: number): string {
  const meters = inches * 0.0254;
  return `${meters.toFixed(2)} m`;
}

export function convertToSquareFeet(squareInches: number): string {
  const sqft = squareInches / 144;
  return `${sqft.toFixed(2)} sq ft`;
}

export function convertToSquareMeters(squareInches: number): string {
  const sqm = squareInches * 0.00064516;
  return `${sqm.toFixed(2)} sq m`;
}
