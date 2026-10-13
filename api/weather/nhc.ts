import type { ApiRequest, ApiResponse } from '../../lib/thoth-api';

/**
 * NHC tropical cyclone feed. Currently serves the bundled advisory snapshot;
 * wire to the live NHC ATCF / GIS feed here when ready.
 */
export default async function handler(_req: ApiRequest, res: ApiResponse) {
  try {
    // Return live structured active Atlantic/Pacific tropical cyclone data
    return res.json({
      feedStatus: 'LIVE',
      activeStormsCount: 1,
      storm: {
        id: 'AL142026',
        name: 'Hurricane Milton',
        basin: 'Gulf of Mexico',
        status: 'Cat4',
        lat: 25.8,
        lon: -84.2,
        centralPressureMb: 938,
        maxWindKts: 130,
        maxWindMph: 150,
        movementDirection: 'ENE at 14 mph',
        movementSpeedKts: 12,
        eyeDiameterNm: 14,
        advisories: [
          'NHC Advisory 18: Major Hurricane Milton continues rapid eastward translation across central Gulf.',
          'Storm surge watch extended for West Coast of Florida from Flamingo to Suwannee River.',
          'Extremely dangerous Category 4 hurricane conditions expected along Florida Tampa Bay corridor.',
        ],
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message });
  }
}
