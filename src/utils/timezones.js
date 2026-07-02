import { DateTime } from 'luxon';

export const MAJOR_CITIES = [
  { name: 'San Francisco', timezone: 'America/Los_Angeles', lat: 37.77, lng: -122.42 },
  { name: 'New York', timezone: 'America/New_York', lat: 40.71, lng: -74.01 },
  { name: 'London', timezone: 'Europe/London', lat: 51.51, lng: -0.13 },
  { name: 'Paris', timezone: 'Europe/Paris', lat: 48.86, lng: 2.35 },
  { name: 'Berlin', timezone: 'Europe/Berlin', lat: 52.52, lng: 13.41 },
  { name: 'Dubai', timezone: 'Asia/Dubai', lat: 25.20, lng: 55.27 },
  { name: 'Mumbai', timezone: 'Asia/Kolkata', lat: 19.08, lng: 72.88 },
  { name: 'Shanghai', timezone: 'Asia/Shanghai', lat: 31.23, lng: 121.47 },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', lat: 35.68, lng: 139.69 },
  { name: 'Sydney', timezone: 'Australia/Sydney', lat: -33.87, lng: 151.21 },
  { name: 'São Paulo', timezone: 'America/Sao_Paulo', lat: -23.55, lng: -46.63 },
  { name: 'Chicago', timezone: 'America/Chicago', lat: 41.88, lng: -87.63 },
  { name: 'Denver', timezone: 'America/Denver', lat: 39.74, lng: -104.99 },
  { name: 'Toronto', timezone: 'America/Toronto', lat: 43.65, lng: -79.38 },
  { name: 'Singapore', timezone: 'Asia/Singapore', lat: 1.35, lng: 103.82 },
  { name: 'Seoul', timezone: 'Asia/Seoul', lat: 37.57, lng: 126.98 },
  { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', lat: 22.32, lng: 114.17 },
  { name: 'Bangkok', timezone: 'Asia/Bangkok', lat: 13.76, lng: 100.50 },
  { name: 'Moscow', timezone: 'Europe/Moscow', lat: 55.76, lng: 37.62 },
  { name: 'Cairo', timezone: 'Africa/Cairo', lat: 30.04, lng: 31.24 },
];

export function getTimezoneFromCoords(lat, lng) {
  const offsetHours = Math.round(lng / 15);
  const closest = MAJOR_CITIES.reduce((best, city) => {
    const dist = Math.sqrt((city.lat - lat) ** 2 + (city.lng - lng) ** 2);
    return dist < best.dist ? { city, dist } : best;
  }, { city: null, dist: Infinity });

  if (closest.dist < 15) {
    return closest.city;
  }

  return {
    name: `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`,
    timezone: `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`,
    lat,
    lng,
  };
}

export function getHourCategory(hour) {
  if (hour >= 9 && hour < 18) return 'business';
  if ((hour >= 7 && hour < 9) || (hour >= 18 && hour < 21)) return 'marginal';
  return 'sleeping';
}

export function convertTime(hour, fromZone, toZone) {
  const dt = DateTime.now().setZone(fromZone).set({ hour, minute: 0, second: 0 });
  const converted = dt.setZone(toZone);
  return converted.hour + (converted.day !== dt.day ? (converted.day > dt.day ? 24 : -24) : 0);
}

export function findOverlap(zones) {
  const results = [];
  for (let hour = 0; hour < 24; hour++) {
    const allBusiness = zones.every(zone => {
      const localHour = DateTime.now().setZone('UTC').set({ hour, minute: 0 }).setZone(zone.timezone).hour;
      return getHourCategory(localHour) === 'business';
    });
    const allAwake = zones.every(zone => {
      const localHour = DateTime.now().setZone('UTC').set({ hour, minute: 0 }).setZone(zone.timezone).hour;
      return getHourCategory(localHour) !== 'sleeping';
    });
    results.push({ utcHour: hour, allBusiness, allAwake });
  }
  return results;
}
