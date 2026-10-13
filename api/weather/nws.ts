import type { ApiRequest, ApiResponse } from '../../lib/thoth-api';

/** Proxies the official NWS alerts API, falling back to a simulated feed on failure. */
export default async function handler(_req: ApiRequest, res: ApiResponse) {
  try {
    // Query official NWS API with AxiomHRMWheatherSeer9955 custom user-agent header
    const response = await fetch(
      'https://api.weather.gov/alerts/active?status=actual&message_type=alert&event=Hurricane%20Warning,Storm%20Surge%20Warning,Flash%20Flood%20Warning',
      {
        headers: {
          'User-Agent': 'AxiomHRMWheatherSeer9955/1.0 (anthony.castro@axiomzetainnovations.com)',
          Accept: 'application/geo+json',
        },
      },
    );

    if (response.ok) {
      const data: any = await response.json();
      const features = data.features || [];
      const alerts = features.slice(0, 5).map((f: any) => ({
        id: f.id,
        event: f.properties.event,
        severity: f.properties.severity,
        urgency: f.properties.urgency,
        headline: f.properties.headline || f.properties.event,
        areaDesc: f.properties.areaDesc,
        effective: f.properties.effective,
        expires: f.properties.expires,
        description: f.properties.description?.slice(0, 300) + '...',
        instruction: f.properties.instruction?.slice(0, 200) || 'Follow local evacuation orders.',
      }));

      return res.json({
        feedStatus: 'LIVE',
        count: alerts.length,
        alerts,
      });
    }

    // Fallback if NWS response is rate-limited or unavailable
    return res.json({
      feedStatus: 'SIMULATED',
      count: 3,
      alerts: [
        {
          id: 'NWS-FL-001',
          event: 'Hurricane Warning',
          severity: 'Extreme',
          urgency: 'Immediate',
          headline: 'Hurricane Warning in Effect for West Coast of Florida',
          areaDesc: 'Pinellas, Hillsborough, Manatee, Sarasota Counties',
          effective: 'Immediate',
          expires: 'In 36 Hours',
          description:
            'Catastrophic wind damage and life-threatening storm surge expected. Complete all preparations immediately.',
          instruction: 'Obey evacuation orders from local authorities.',
        },
        {
          id: 'NWS-FL-002',
          event: 'Storm Surge Warning',
          severity: 'Extreme',
          urgency: 'Immediate',
          headline: 'Peak Storm Surge 10 to 15 Feet Forecast for Tampa Bay',
          areaDesc: 'Tampa Bay Estuary and Coastal Waterways',
          effective: 'Immediate',
          expires: 'In 48 Hours',
          description: 'Water levels could reach 10-15 feet above ground level in low-lying coastal areas.',
          instruction: 'Move inland from coastal flood zones.',
        },
      ],
    });
  } catch (error: any) {
    return res.json({
      feedStatus: 'SIMULATED',
      error: error?.message,
      alerts: [],
    });
  }
}
