import { Insurance } from './index';

/**
 * Practice location within a practice
 */
export interface PracticeLocation {
  id: string; // Required unique ID (e.g., "loc_practice-1")
  name?: string; // Optional location name (e.g., "Main Office", "West Clinic")
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number; // Required coordinates
  lng: number; // Required coordinates
  phone?: string;
  hours?: string;
  directionsUrl?: string;
}

/**
 * Practice entity - Primary directory entity in V2
 */
export interface Practice {
  id: string; // "practice-1"
  slug: string; // URL-friendly unique
  name: string;
  description: string;
  phone: string; // primary public contact
  email?: string;
  website?: string;

  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string; // "IL"
    zip: string; // "60601"
    country: string; // "USA"
  };

  locations: PracticeLocation[]; // Required array of practice locations

  specialties: string[]; // derived from doctors in practice
  doctorIds: string[]; // doctors in this practice

  services?: string[]; // practice-level services tags
  insurance?: Insurance[];

  logo?: string;
  images?: string[];

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/**
 * Practice override for localStorage - excludes id and slug
 */
export type PracticeOverride = Partial<Omit<Practice, 'id' | 'slug'>>;
