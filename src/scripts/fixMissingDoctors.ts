/**
 * Fix missing doctors in institutions
 * Adds real-19 (Amit Bhandarkar) and real-16 (Mathew Lange) to appropriate MO institutions
 */

import * as fs from 'fs';
import * as path from 'path';
import { institutions } from '../data/institutions';

function fixMissingDoctors() {
  console.log('Fixing missing doctors in institutions...');
  
  const institutionsPath = path.join(process.cwd(), 'src/data/institutions.ts');
  let content = fs.readFileSync(institutionsPath, 'utf-8');
  
  // real-19 (Amit Bhandarkar) - Orthopedic Spine, ZIP 63017 (Chesterfield, MO)
  // Find or create a MO institution for Chesterfield
  // real-16 (Mathew Lange) - Bariatric & General Surgery, ZIP 63141 (Creve Coeur, MO)
  // Should go to institution-15 (St. Louis, MO, ZIP 63131) - closest match
  
  // Add real-16 to institution-15 (Missouri Medical Family Medicine)
  const institution15Pattern = /("id": "institution-15"[^}]*"doctorIds": \[)([^\]]+)(\])/s;
  const match15 = content.match(institution15Pattern);
  if (match15) {
    const doctorIds = match15[2].trim();
    if (!doctorIds.includes('real-16')) {
      const newDoctorIds = doctorIds ? `${doctorIds}\n      "real-16"` : '      "real-16"';
      content = content.replace(institution15Pattern, `$1${newDoctorIds}\n    $3`);
      console.log('✓ Added real-16 (Mathew Lange) to institution-15');
    }
  }
  
  // For real-19, find a MO institution that can accommodate Orthopedic Spine
  // Check institution-25 (St. Louis Health Vascular) or create new
  // Let's add to institution-25 since it's in St. Louis area
  const institution25Pattern = /("id": "institution-25"[^}]*"doctorIds": \[)([^\]]+)(\])/s;
  const match25 = content.match(institution25Pattern);
  if (match25) {
    const doctorIds = match25[2].trim();
    if (!doctorIds.includes('real-19')) {
      const newDoctorIds = doctorIds ? `${doctorIds}\n      "real-19"` : '      "real-19"';
      content = content.replace(institution25Pattern, `$1${newDoctorIds}\n    $3`);
      console.log('✓ Added real-19 (Amit Bhandarkar) to institution-25');
    }
  }
  
  // Update specialties for institution-25 to include Orthopedic Spine
  const institution25SpecialtiesPattern = /("id": "institution-25"[^}]*"specialties": \[)([^\]]+)(\])/s;
  const match25Spec = content.match(institution25SpecialtiesPattern);
  if (match25Spec) {
    const specialties = match25Spec[2].trim();
    if (!specialties.includes('Orthopedic Spine')) {
      const newSpecialties = specialties ? `${specialties}\n      "Orthopedic Spine"` : '      "Orthopedic Spine"';
      content = content.replace(institution25SpecialtiesPattern, `$1${newSpecialties}\n    $3`);
      console.log('✓ Added Orthopedic Spine specialty to institution-25');
    }
  }
  
  // Update institution-15 specialties to include Bariatric & General Surgery if not present
  const institution15SpecialtiesPattern = /("id": "institution-15"[^}]*"specialties": \[)([^\]]+)(\])/s;
  const match15Spec = content.match(institution15SpecialtiesPattern);
  if (match15Spec) {
    const specialties = match15Spec[2].trim();
    if (!specialties.includes('Bariatric & General Surgery')) {
      const newSpecialties = specialties ? `${specialties}\n      "Bariatric & General Surgery"` : '      "Bariatric & General Surgery"';
      content = content.replace(institution15SpecialtiesPattern, `$1${newSpecialties}\n    $3`);
      console.log('✓ Added Bariatric & General Surgery specialty to institution-15');
    }
  }
  
  // Update doctor counts in descriptions
  content = content.replace(
    /"id": "institution-15"[^}]*"Our team of (\d+) physicians"/,
    (match, count) => match.replace(`Our team of ${count} physicians`, 'Our team of 5 physicians')
  );
  content = content.replace(
    /"id": "institution-25"[^}]*"Our team of (\d+) physicians"/,
    (match, count) => match.replace(`Our team of ${count} physicians`, 'Our team of 7 physicians')
  );
  
  fs.writeFileSync(institutionsPath, content, 'utf-8');
  console.log('✓ Updated institutions.ts');
  
  // Now update doctors.ts to fix institutionId
  const doctorsPath = path.join(process.cwd(), 'src/data/doctors.ts');
  let doctorsContent = fs.readFileSync(doctorsPath, 'utf-8');
  
  // Update real-16 institutionId to institution-15
  doctorsContent = doctorsContent.replace(
    /(id: 'real-16',\s*)institutionId: '[^']*',/,
    "$1institutionId: 'institution-15',"
  );
  
  // Update real-19 institutionId to institution-25
  doctorsContent = doctorsContent.replace(
    /(id: 'real-19',\s*)institutionId: '[^']*',/,
    "$1institutionId: 'institution-25',"
  );
  
  fs.writeFileSync(doctorsPath, doctorsContent, 'utf-8');
  console.log('✓ Updated doctors.ts');
  console.log('\n✓ All fixes applied!');
}

if (require.main === module) {
  fixMissingDoctors();
}

export { fixMissingDoctors };
