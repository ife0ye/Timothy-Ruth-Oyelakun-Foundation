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

export interface NavItem {
  id: string;
  label: string;
  /** Set for links to another page; otherwise the link is to a section of the home page. */
  path?: string;
}

export const NAV: NavItem[] = [
  { id: 'story', label: 'Their story' },
  { id: 'mission', label: 'Mission' },
  { id: 'programs', label: 'Programs' },
  { id: 'scholarship', label: 'Scholarship', path: '/scholarship' },
  { id: 'contact', label: 'Contact', path: '/contact' },
];

export const DONATE_LINK: NavItem = { id: 'donate', label: 'Donate', path: '/donate' };

/** Which page is showing. Section links on other pages point back to the home page. */
export type Page = 'home' | 'scholarship' | 'donate' | 'contact';

export function navHref(item: NavItem, page: Page): string {
  return item.path ?? (page === 'home' ? `#${item.id}` : `/#${item.id}`);
}

export interface Program {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: 'teal' | 'paper' | 'oxblood' | 'sand' | 'ochre';
  link?: { href: string; label: string };
}

export const PROGRAMS: Program[] = [
  {
    title: 'Educational Advancement',
    description:
      'Scholarships, learning materials and steady support so that students can finish what they started and reach their academic goals.',
    icon: GraduationCap,
    tone: 'teal',
    link: { href: '/scholarship', label: 'Apply for a scholarship' },
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

/** The scholarship page (/scholarship). The application form's questions live in shared/scholarship.ts. */
export const SCHOLARSHIP = {
  /** e.g. 'Friday, 30 January 2027'. Leave as null to hide the deadline. */
  deadline: null as string | null,
  /** The printable form, in public/forms/. Replace the file to update it. */
  pdfPath: '/forms/trof-scholarship-application-form.pdf',
  intro:
    'The Timothy & Ruth Oyelakun Foundation offers scholarships to indigent Nigerian students at public universities and polytechnics who show academic excellence and a commitment to making a positive impact in their communities.',
  /** Where paper applications are delivered or emailed. */
  paperAddressLines: [
    'No. 1, Ile Oyelakun, Pa Timothy Oyelakun Close',
    'Off Old Ogbomoso–Ilorin Road, Oke Ado, General Area',
    'Ogbomoso, Oyo State',
  ],
  paperEmail: ORG.email,
};
