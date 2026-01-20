import { TriageCategory, ServicePoint } from '../types';
import { SERVICE_POINTS } from './mockData';
import { getDistanceInKilometers } from '../utils/geolocation';

/**
 * Find the nearest service point based on category and location
 * @returns Service point with distance in kilometers, or null if none found
 */
export const findNearestServicePoint = (
  lat: number,
  lng: number,
  category: TriageCategory
): { point: ServicePoint; distance: number } | null => {
  const filtered = SERVICE_POINTS.filter((p) => p.type === category);

  if (filtered.length === 0) return null;

  // Find the nearest point using reduce for better performance
  const result = filtered.reduce<{ point: ServicePoint; distance: number } | null>(
    (nearest, current) => {
      const distance = getDistanceInKilometers(lat, lng, current.lat, current.lng);

      if (!nearest || distance < nearest.distance) {
        return { point: current, distance };
      }

      return nearest;
    },
    null
  );

  return result;
};

/**
 * Find all service points within a given radius
 * @param radiusKm - Search radius in kilometers
 * @returns Array of service points with distances
 */
export const findServicePointsInRadius = (
  lat: number,
  lng: number,
  category: TriageCategory,
  radiusKm: number
): Array<{ point: ServicePoint; distance: number }> => {
  const filtered = SERVICE_POINTS.filter((p) => p.type === category);

  const results = filtered
    .map((point) => ({
      point,
      distance: getDistanceInKilometers(lat, lng, point.lat, point.lng),
    }))
    .filter((result) => result.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);

  return results;
};
