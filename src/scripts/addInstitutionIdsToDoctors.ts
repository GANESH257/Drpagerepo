/**
 * Script to add institutionId to doctors.ts
 * 
 * This script reads doctors.ts, adds institutionId based on the mapping from institutions,
 * and writes it back.
 * 
 * Run with: npx tsx src/scripts/addInstitutionIdsToDoctors.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { institutions } from '../data/institutions';
import { doctors } from '../data/doctors';

function addInstitutionIds() {
  console.log('Adding institutionId to doctors...');
  
  // Create a map of doctor ID to institution ID from institutions
  const doctorToInstitutionMap = new Map<string, string>();
  
  for (const institution of institutions) {
    for (const doctorId of institution.doctorIds) {
      doctorToInstitutionMap.set(doctorId, institution.id);
    }
  }
  
  console.log(`Found ${doctorToInstitutionMap.size} doctor-institution mappings`);
  
  // Read doctors.ts file
  const doctorsPath = path.join(process.cwd(), 'src/data/doctors.ts');
  let doctorsContent = fs.readFileSync(doctorsPath, 'utf-8');
  
  let updatedCount = 0;
  let alreadyHasCount = 0;
  
  // For each doctor, add institutionId if it doesn't already exist
  for (const doctor of doctors) {
    const institutionId = doctorToInstitutionMap.get(doctor.id);
    if (!institutionId) {
      console.warn(`No institution found for doctor: ${doctor.fullName} (${doctor.id})`);
      continue;
    }
    
    // Check if doctor already has institutionId
    const doctorPattern = new RegExp(
      `(id:\\s*['"]${doctor.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"],[^}]*?)(institutionId:\\s*['"][^'"]*['"],)?`,
      's'
    );
    
    if (doctorPattern.test(doctorsContent)) {
      // Check if it already has institutionId
      const hasInstitutionId = doctorsContent.includes(`id: '${doctor.id}'`) && 
                                 doctorsContent.includes(`institutionId:`) &&
                                 doctorsContent.indexOf(`id: '${doctor.id}'`) < doctorsContent.indexOf(`institutionId:`, doctorsContent.indexOf(`id: '${doctor.id}'`));
      
      if (hasInstitutionId) {
        // Update existing institutionId
        const updatePattern = new RegExp(
          `(id:\\s*['"]${doctor.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"],\\s*[^}]*?institutionId:\\s*['"])[^'"]*(['"])`,
          's'
        );
        if (updatePattern.test(doctorsContent)) {
          doctorsContent = doctorsContent.replace(updatePattern, `$1${institutionId}$2`);
          updatedCount++;
        } else {
          alreadyHasCount++;
        }
      } else {
        // Add institutionId after id field
        const addPattern = new RegExp(
          `(id:\\s*['"]${doctor.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"],\\s*)`,
          's'
        );
        if (addPattern.test(doctorsContent)) {
          doctorsContent = doctorsContent.replace(addPattern, `$1institutionId: '${institutionId}',\n    `);
          updatedCount++;
        }
      }
    } else {
      // Try a simpler pattern - find the doctor object and add institutionId after slug
      const simplePattern = new RegExp(
        `(slug:\\s*['"]${doctor.slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"],\\s*)`,
        's'
      );
      if (simplePattern.test(doctorsContent)) {
        doctorsContent = doctorsContent.replace(simplePattern, `$1institutionId: '${institutionId}',\n    `);
        updatedCount++;
      } else {
        console.warn(`Could not find pattern for doctor: ${doctor.fullName} (${doctor.id})`);
      }
    }
  }
  
  // Write updated content back
  fs.writeFileSync(doctorsPath, doctorsContent, 'utf-8');
  
  console.log(`\n✓ Updated ${updatedCount} doctors with institutionId`);
  if (alreadyHasCount > 0) {
    console.log(`  ${alreadyHasCount} doctors already had institutionId`);
  }
  console.log(`✓ Written ${doctorsPath}`);
}

// Run if executed directly
if (require.main === module) {
  addInstitutionIds();
}

export { addInstitutionIds };
