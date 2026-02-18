/**
 * ZIP Code to Latitude/Longitude Mapping
 * Approximate coordinates for common ZIP codes used in doctor locations
 * Used for radius-based search calculations
 */

export const zipCoordinates: Record<string, { lat: number; lng: number }> = {
  // Illinois ZIPs
  '60601': { lat: 41.8825, lng: -87.6441 }, // Chicago Loop
  '60615': { lat: 41.8006, lng: -87.6004 }, // Chicago Hyde Park
  '60625': { lat: 41.9706, lng: -87.7017 }, // Chicago Lincoln Square
  '60540': { lat: 41.7500, lng: -87.9333 }, // Naperville
  '60563': { lat: 41.8500, lng: -87.6500 }, // Oak Park
  '60502': { lat: 41.8000, lng: -87.7000 }, // Aurora
  '60504': { lat: 41.7500, lng: -87.7000 }, // Aurora
  '60435': { lat: 41.5500, lng: -87.8500 }, // Joliet
  '60120': { lat: 42.0333, lng: -87.8833 }, // Elk Grove Village
  '60123': { lat: 42.0333, lng: -87.9500 }, // Schaumburg
  '60187': { lat: 42.0500, lng: -88.0333 }, // Wheaton
  '60085': { lat: 42.0333, lng: -87.7333 }, // Waukegan
  '61601': { lat: 40.6936, lng: -89.5890 }, // Peoria
  '61614': { lat: 40.7464, lng: -89.6167 }, // Peoria Heights
  '61101': { lat: 42.2634, lng: -89.0628 }, // Rockford
  '61108': { lat: 42.2833, lng: -89.0167 }, // Rockford
  '62701': { lat: 39.7817, lng: -89.6501 }, // Springfield
  '62703': { lat: 39.8000, lng: -89.6500 }, // Springfield

  // Missouri ZIPs
  '63101': { lat: 38.6270, lng: -90.1994 }, // St. Louis Downtown
  '63131': { lat: 38.6333, lng: -90.4333 }, // St. Louis (Clayton area)
  '63141': { lat: 38.6667, lng: -90.4167 }, // St. Louis (Creve Coeur)
  '63017': { lat: 38.6333, lng: -90.3833 }, // Chesterfield

  // Tennessee ZIPs
  '37201': { lat: 36.1627, lng: -86.7816 }, // Nashville Downtown
  '37203': { lat: 36.1500, lng: -86.8000 }, // Nashville
  '37205': { lat: 36.1333, lng: -86.8167 }, // Nashville
  '38101': { lat: 35.1495, lng: -90.0490 }, // Memphis Downtown
  '38103': { lat: 35.1333, lng: -90.0500 }, // Memphis
  '38117': { lat: 35.1000, lng: -89.9000 }, // Memphis
  '38134': { lat: 35.1167, lng: -89.8667 }, // Memphis
  '37901': { lat: 35.9606, lng: -83.9207 }, // Knoxville Downtown
  '37917': { lat: 35.9833, lng: -83.9167 }, // Knoxville
  '37919': { lat: 35.9333, lng: -83.8833 }, // Knoxville
  '37601': { lat: 36.3134, lng: -82.3535 }, // Johnson City
  '37604': { lat: 36.3333, lng: -82.3667 }, // Johnson City
  '37401': { lat: 35.0456, lng: -85.3097 }, // Chattanooga Downtown
  '37402': { lat: 35.0500, lng: -85.3000 }, // Chattanooga
  '37405': { lat: 35.0667, lng: -85.2833 }, // Chattanooga

  // Other States
  '38301': { lat: 35.6120, lng: -88.8139 }, // Jackson, TN
  '37040': { lat: 36.1627, lng: -86.7816 }, // Franklin, TN
  '37042': { lat: 36.2000, lng: -86.7833 }, // Franklin, TN
  '37064': { lat: 36.1667, lng: -86.7000 }, // Goodlettsville, TN
  '37067': { lat: 36.1833, lng: -86.7500 }, // Hendersonville, TN
  '37127': { lat: 36.0333, lng: -86.5167 }, // Smyrna, TN
  '37130': { lat: 36.0167, lng: -86.5000 }, // Smyrna, TN
};

/**
 * Get coordinates for a ZIP code
 * Returns approximate coordinates or null if not found
 */
export function getZIPCoordinates(zip: string): { lat: number; lng: number } | null {
  const cleanZip = zip.trim();
  if (!cleanZip) return null;
  
  // Try exact match first
  if (zipCoordinates[cleanZip]) {
    return zipCoordinates[cleanZip];
  }
  
  // Try 5-digit ZIP if provided as 9-digit
  if (cleanZip.length > 5) {
    const fiveDigit = cleanZip.substring(0, 5);
    if (zipCoordinates[fiveDigit]) {
      return zipCoordinates[fiveDigit];
    }
  }
  
  // Fallback: Generate approximate coordinates based on ZIP prefix
  // This is a rough approximation for US ZIP codes
  if (cleanZip.length >= 3) {
    const prefix = cleanZip.substring(0, 3);
    // Very rough approximation - would need full ZIP database for accuracy
    // For now, return null if not found
    return null;
  }
  
  return null;
}

/**
 * Get approximate coordinates for a city/state combination
 * Used as fallback when ZIP is not available
 */
export function getCityStateCoordinates(city: string, state: string): { lat: number; lng: number } | null {
  const cityStateMap: Record<string, { lat: number; lng: number }> = {
    'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
    'St. Louis, MO': { lat: 38.6270, lng: -90.1994 },
    'Nashville, TN': { lat: 36.1627, lng: -86.7816 },
    'Memphis, TN': { lat: 35.1495, lng: -90.0490 },
    'Knoxville, TN': { lat: 35.9606, lng: -83.9207 },
    'Chattanooga, TN': { lat: 35.0456, lng: -85.3097 },
    'Peoria, IL': { lat: 40.6936, lng: -89.5890 },
    'Rockford, IL': { lat: 42.2634, lng: -89.0628 },
    'Springfield, IL': { lat: 39.7817, lng: -89.6501 },
    'Johnson City, TN': { lat: 36.3134, lng: -82.3535 },
    'Aurora, IL': { lat: 41.7606, lng: -88.3201 },
    'Naperville, IL': { lat: 41.7508, lng: -88.1535 },
    'Oak Park, IL': { lat: 41.8850, lng: -87.7845 },
    'Joliet, IL': { lat: 41.5250, lng: -88.0817 },
  };
  
  const key = `${city}, ${state}`;
  return cityStateMap[key] || null;
}
