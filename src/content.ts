// Everything a non-developer might want to update lives here.
import { Briefcase, Building2, GraduationCap, HandHeart, Stethoscope, type LucideIcon } from 'lucide-react';

export const ORG = {
  name: 'Timothy & Ruth Oyelakun Foundation',
  email: 'info@trofng.org',
  phoneDisplay: '+234 802 335 8676',
  phoneHref: 'tel:+2348023358676',
  addressLines: ['No. 1 Ile Oyelakun, Pa Timothy Oyelakun Close', 'Off Oyo–Ilorin Expressway', 'Ogbomoso, Oyo State, Nigeria'],
  timeZone: 'Africa/Lagos',
};

export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  'Pa Timothy Oyelakun Close, Oyo-Ilorin Expressway, Ogbomoso, Oyo State, Nigeria',
)}`;

/** Office hours in Lagos time. Day 0 is Sunday. Hours are 24h, null means closed. */
export const OFFICE_HOURS: { label: string; days: number[]; open: number | null; close: number | null }[] = [
  { label: 'Monday – Friday', days: [1, 2, 3, 4, 5], open: 9, close: 17 },
  { label: 'Saturday', days: [6], open: 10, close: 14 },
  { label: 'Sunday', days: [0], open: null, close: null },
];

export const NAV = [
  { id: 'story', label: 'Their story' },
  { id: 'mission', label: 'Mission' },
  { id: 'programs', label: 'Programs' },
  { id: 'contact', label: 'Contact' },
] as const;

export interface Program {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: 'teal' | 'paper' | 'oxblood' | 'sand' | 'ochre';
}

export const PROGRAMS: Program[] = [
  {
    title: 'Educational Advancement',
    description:
      'Scholarships, learning materials and steady support so that students can finish what they started and reach their academic goals.',
    icon: GraduationCap,
    tone: 'teal',
  },
  {
    title: 'Healthcare Support',
    description:
      'Help with medical treatment and hospital bills for less privileged and indigent people, so that no one goes without care because of cost.',
    icon: Stethoscope,
    tone: 'sand',
  },
  {
    title: 'Business Empowerment',
    description:
      'Start-up capital, entrepreneurship training and practical skills for people building a livelihood that lasts.',
    icon: Briefcase,
    tone: 'oxblood',
  },
  {
    title: 'Community Development',
    description:
      'Basic infrastructure and essential services that lift a whole community, not just one household.',
    icon: Building2,
    tone: 'paper',
  },
  {
    title: 'General Aid & Charity',
    description:
      'Direct help for people in urgent need, making sure no one is left behind in their hardest season.',
    icon: HandHeart,
    tone: 'ochre',
  },
];

export const GUIDING = [
  {
    label: 'Mission',
    text: 'To assist humanity and indigent people through health-related support, business empowerment grants, educational advancement, scientific research and community infrastructure development.',
  },
  {
    label: 'Vision',
    text: 'A world where less privileged people have access to quality healthcare, education, business opportunity and essential infrastructure, and the means to build a sustainable future.',
  },
  {
    label: 'Values',
    text: 'Compassion, integrity and service guide everything we do. We treat every person with dignity and respect, and we work tirelessly for change that lasts.',
  },
];
