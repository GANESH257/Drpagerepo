/**
 * Extract all ZIP codes from doctors and institutions
 * and identify which ones are missing from zipCoordinates.ts
 */

import { Doctor } from '@/types';
import { Institution } from '@/types';
import { doctors as doctorsData } from '@/data/doctors';
import { institutions as institutionsData } from '@/data/institutions';
import { zipCoordinates } from '@/data/zipCoordinates';

function extractZIPsFromDoctors(): Set<string> {
  const zips = new Set<string>();
  
  for (const doctor of doctorsData) {
    for (const location of doctor.locations) {
      if (location.zip) {
        const zip = location.zip.trim().substring(0, 5);
        if (zip.length === 5 && /^\d+$/.test(zip)) {
          zips.add(zip);
        }
      }
    }
  }
  
  return zips;
}

function extractZIPsFromInstitutions(): Set<string> {
  const zips = new Set<string>();
  
  for (const institution of institutionsData) {
    if (institution.address.zip) {
      const zip = institution.address.zip.trim().substring(0, 5);
      if (zip.length === 5 && /^\d+$/.test(zip)) {
        zips.add(zip);
      }
    }
  }
  
  return zips;
}

function findMissingZIPs(): {
  missing: string[];
  existing: string[];
  doctorZips: string[];
  institutionZips: string[];
  allUniqueZips: string[];
} {
  const doctorZips = Array.from(extractZIPsFromDoctors());
  const institutionZips = Array.from(extractZIPsFromInstitutions());
  const allZips = new Set([...doctorZips, ...institutionZips]);
  const allUniqueZips = Array.from(allZips);
  
  const existing: string[] = [];
  const missing: string[] = [];
  
  for (const zip of allUniqueZips) {
    if (zip && zipCoordinates[zip]) {
      existing.push(zip);
    } else if (zip) {
      missing.push(zip);
    }
  }
  
  return {
    missing: missing.sort(),
    existing: existing.sort(),
    doctorZips: doctorZips.sort(),
    institutionZips: institutionZips.sort(),
    allUniqueZips: allUniqueZips.sort(),
  };
}

function generateZIPCoordinates(zip: string, city?: string, state?: string): { lat: number; lng: number } | null {
  // Very rough approximation based on ZIP prefix
  // This is not accurate but better than nothing
  const prefix = parseInt(zip.substring(0, 3));
  
  // Illinois ZIPs start with 60-62
  if (prefix >= 600 && prefix <= 629) {
    // Illinois - approximate center
    return { lat: 40.0 + (prefix - 600) * 0.1, lng: -89.0 - (prefix - 600) * 0.05 };
  }
  
  // Missouri ZIPs start with 63-65
  if (prefix >= 630 && prefix <= 659) {
    // Missouri - approximate center
    return { lat: 38.5 + (prefix - 630) * 0.1, lng: -92.0 - (prefix - 630) * 0.05 };
  }
  
  // Tennessee ZIPs start with 37-38
  if (prefix >= 370 && prefix <= 389) {
    // Tennessee - approximate center
    return { lat: 35.5 + (prefix - 370) * 0.1, lng: -86.5 - (prefix - 370) * 0.05 };
  }
  
  // If we have city/state, use city/state coordinates as fallback
  if (city && state) {
    const cityStateMap: Record<string, { lat: number; lng: number }> = {
      'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
      'St. Louis, MO': { lat: 38.6270, lng: -90.1994 },
      'Nashville, TN': { lat: 36.1627, lng: -86.7816 },
      'Memphis, TN': { lat: 35.1495, lng: -90.0490 },
      'Knoxville, TN': { lat: 35.9606, lng: -83.9207 },
      'Chattanooga, TN': { lat: 35.0456, lng: -85.3097 },
      'Murfreesboro, TN': { lat: 35.8456, lng: -86.3903 },
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
    if (cityStateMap[key]) {
      return cityStateMap[key];
    }
  }
  
  return null;
}

function main() {
  console.log('Extracting ZIP codes from doctors and institutions...\n');
  
  const { missing, existing, doctorZips, institutionZips, allUniqueZips } = findMissingZIPs();
  
  console.log(`Doctor ZIPs found: ${doctorZips.length}`);
  console.log(`Institution ZIPs found: ${institutionZips.length}`);
  console.log(`Total unique ZIPs found: ${allUniqueZips.length}`);
  console.log(`ZIPs in mapping: ${existing.length}`);
  console.log(`Missing ZIPs: ${missing.length}\n`);
  
  if (missing.length > 0) {
    console.log('Missing ZIP codes:');
    console.log('='.repeat(50));
    
    // Group missing ZIPs by state prefix
    const missingByState: Record<string, string[]> = {};
    for (const zip of missing) {
      const prefix = zip.substring(0, 1);
      if (!missingByState[prefix]) {
        missingByState[prefix] = [];
      }
      missingByState[prefix].push(zip);
    }
    
    for (const [prefix, zips] of Object.entries(missingByState)) {
      console.log(`\nPrefix ${prefix}xx (${zips.length} ZIPs):`);
      for (const zip of zips) {
        // Try to find city/state for this ZIP
        let cityState = '';
        for (const doctor of doctorsData) {
          for (const loc of doctor.locations) {
            if (loc.zip?.trim().substring(0, 5) === zip) {
              cityState = `${loc.city || ''}, ${loc.state || ''}`;
              break;
            }
          }
          if (cityState) break;
        }
        
        if (!cityState) {
          for (const inst of institutionsData) {
            if (inst.address.zip?.trim().substring(0, 5) === zip) {
              cityState = `${inst.address.city}, ${inst.address.state}`;
              break;
            }
          }
        }
        
        const coords = generateZIPCoordinates(zip, cityState.split(',')[0], cityState.split(',')[1]?.trim());
        if (coords) {
          console.log(`  '${zip}': { lat: ${coords.lat.toFixed(4)}, lng: ${coords.lng.toFixed(4)} }, // ${cityState || 'Approximate'}`);
        } else {
          console.log(`  '${zip}': { lat: 0, lng: 0 }, // ${cityState || 'NEEDS MANUAL COORDINATES'}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('\nTo add these ZIPs, copy the entries above and add them to src/data/zipCoordinates.ts');
    console.log('Note: Coordinates marked as "Approximate" should be verified or replaced with accurate values.');
  } else {
    console.log('✅ All ZIP codes are already in the mapping!');
  }
  
  // Check institutions without ZIP codes
  console.log('\n' + '='.repeat(50));
  console.log('Checking institutions for missing ZIP codes...\n');
  
  const institutionsWithoutZip: string[] = [];
  for (const inst of institutionsData) {
    if (!inst.address.zip || inst.address.zip.trim() === '') {
      institutionsWithoutZip.push(inst.id);
      console.log(`⚠️  ${inst.name} (${inst.id}) - Missing ZIP code`);
      console.log(`   Address: ${inst.address.line1}, ${inst.address.city}, ${inst.address.state}`);
      
      // Try to find ZIP from doctors
      const instDoctors = doctorsData.filter(d => inst.doctorIds.includes(d.id));
      for (const doctor of instDoctors) {
        for (const loc of doctor.locations) {
          if (loc.zip && loc.zip.trim() !== '' && loc.city === inst.address.city && loc.state === inst.address.state) {
            console.log(`   💡 Found ZIP from doctor: ${loc.zip}`);
            break;
          }
        }
      }
    }
  }
  
  if (institutionsWithoutZip.length === 0) {
    console.log('✅ All institutions have ZIP codes!');
  } else {
    console.log(`\n⚠️  ${institutionsWithoutZip.length} institution(s) missing ZIP codes`);
  }
}

main();
