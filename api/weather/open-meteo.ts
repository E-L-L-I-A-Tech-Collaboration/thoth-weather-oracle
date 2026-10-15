import { queryParam } from '../../lib/http-utils.js';
import type { ApiRequest, ApiResponse } from '../../lib/http-utils.js';

/** Proxies Open-Meteo environmental grid data, falling back to a simulated grid on failure. */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    const lat = queryParam(req, 'lat', '25.8');
    const lon = queryParam(req, 'lon', '-84.2');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=wind_speed_10m,surface_pressure`;

    const response = await fetch(url);
    if (response.ok) {
      const data: any = await response.json();
      return res.json({
        feedStatus: 'LIVE',
        location: { lat: Number(lat), lon: Number(lon) },
        current: data.current,
        units: data.current_units,
      });
    }

    return res.json({
      feedStatus: 'SIMULATED',
      current: {
        temperature_2m: 28.2,
        relative_humidity_2m: 98,
        surface_pressure: 938,
        wind_speed_10m: 130,
        wind_direction_10m: 80,
      },
    });
  } catch (error: any) {
    return res.json({ feedStatus: 'SIMULATED', error: error?.message });
  }
}
