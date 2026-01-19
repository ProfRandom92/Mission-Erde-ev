
import { TriageCategory, ServicePoint } from "../types";
import { SERVICE_POINTS } from "./mockData";

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const findNearestServicePoint = (
  lat: number,
  lng: number,
  category: TriageCategory
): { point: ServicePoint; distance: number } | null => {
  const filtered = SERVICE_POINTS.filter((p) => p.type === category);
  if (filtered.length === 0) return null;

  let nearest = filtered[0];
  let minDistance = getDistance(lat, lng, nearest.lat, nearest.lng);

  for (let i = 1; i < filtered.length; i++) {
    const d = getDistance(lat, lng, filtered[i].lat, filtered[i].lng);
    if (d < minDistance) {
      minDistance = d;
      nearest = filtered[i];
    }
  }

  return { point: nearest, distance: minDistance };
};
