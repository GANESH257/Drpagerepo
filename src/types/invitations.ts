/**
 * Practice invitation - Practice Admin invites doctors to join
 */
export interface PracticeInvitation {
  id: string; // "inv-..."
  practiceId: string;
  email: string;
  invitedAt: string;
  invitedByDoctorId: string;
  status: 'sent' | 'accepted' | 'expired' | 'revoked';
}
