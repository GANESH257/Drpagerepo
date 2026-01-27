import * as React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Maps department slugs to Lucide React icons
 */
export function getDepartmentIcon(slug: string): React.ComponentType<{ className?: string }> {
  const iconMap: Record<string, keyof typeof LucideIcons> = {
    'internal-medicine': 'Heart',
    'rheumatology': 'Activity',
    'podiatry': 'Footprints',
    'sports-medicine': 'Dumbbell',
    'endocrinology': 'Beaker',
    'family-practice': 'Users',
    'psychiatry': 'Brain',
    'plastic-reconstructive-surgery': 'Scissors',
    'dermatology': 'Sparkles',
    'gastroenterology': 'Activity',
    'nephrology': 'Droplet',
    'nurse-practitioners': 'UserCircle',
    'bariatric-general-surgery': 'Scissors',
    'otolaryngology-ent': 'Headphones',
    'vascular-surgery': 'HeartPulse',
  };

  const iconName = iconMap[slug] || 'Stethoscope';
  return (LucideIcons[iconName] as React.ComponentType<{ className?: string }>) || LucideIcons.Stethoscope;
}
