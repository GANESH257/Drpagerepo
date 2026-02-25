/**
 * Fallback Board of Directors data (used when API is unavailable or returns empty).
 * Matches aip-backend/migrations/008_board_of_directors.sql and bylaws.
 */

export interface BoardDirectorFallback {
  fullName: string;
  role: string;
  /** Optional: photo path for display (from public/ or Dr_images) */
  photo?: string;
}

export const boardOfDirectorsFallback = {
  introText:
    'The Board of Directors shall be self-perpetuating and shall consist of licensed medical doctors. The first Board of Directors shall consist of the following Directors:',
  bylawsUrl: '/policies/governance-bylaws.pdf',
  directors: [
    { fullName: 'Robert Hacker, M.D.', role: 'President', photo: '/Dr_images/physician-robert-hacker-md.jpg' },
    { fullName: 'George Mansour, M.D.', role: 'Treasurer' },
    { fullName: 'Hashim Raza, M.D.', role: 'Secretary', photo: '/Dr_images/provider-Hashim-Raza.jpg' },
    { fullName: 'Scott Hardeman, M.D.', role: 'Member-at-Large', photo: '/Dr_images/Doctor-Scott-Hardeman-MD-Gateway-ENT-St-Louis-Missouri.avif' },
    { fullName: 'Amit Bhandarkar, M.D.', role: 'Member-at-Large', photo: '/Dr_images/Amit.png' },
  ] as BoardDirectorFallback[],
};
