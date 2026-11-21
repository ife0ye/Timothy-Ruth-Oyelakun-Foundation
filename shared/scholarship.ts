// Single source of truth for the scholarship application. Imported by both the site and the
// API, so the form can never accept something the server will reject (and vice versa).

import { EMAIL_PATTERN } from './donation.js';

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
  'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
  'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
] as const;

export const GENDERS = ['Female', 'Male'] as const;

export const ADMISSION_TYPES = {
  utme: 'Newly admitted through UTME',
  'direct-entry': 'Newly admitted through Direct Entry',
  continuing: 'Completed at least one academic session',
} as const;
export type AdmissionType = keyof typeof ADMISSION_TYPES;

export const INSTITUTION_TYPES = { university: 'University', polytechnic: 'Polytechnic' } as const;
export type InstitutionType = keyof typeof INSTITUTION_TYPES;

export const LEVELS: Record<InstitutionType, string[]> = {
  university: ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', '600 Level'],
  polytechnic: ['ND 1', 'ND 2', 'HND 1', 'HND 2'],
};

/**
 * Minimum CGPA by grading scale. 3.50 on a 5-point scale is Second Class Upper. On the 4-point
 * scale (polytechnics, and universities under the NUC's newer system) the equivalent grade,
 * Upper Credit / Second Class Upper, starts at 3.00.
 */
export const CGPA_SCALES = {
  '5': { label: 'out of 5.0', max: 5, min: 3.5 },
  '4': { label: 'out of 4.0', max: 4, min: 3.0 },
} as const;
export type CgpaScale = keyof typeof CGPA_SCALES;

export const SCHOLARSHIP_LIMITS = {
  short: 120,
  address: 400,
  phone: 30,
  email: 200,
  cgpa: 5,
} as const;

/** Every text answer on the form. Files and declarations are handled separately. */
export interface ScholarshipAnswers {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  lga: string;
  stateOfOrigin: string;
  phone: string;
  email: string;

  admission: string;
  institutionType: string;
  institution: string;
  course: string;
  level: string;
  cgpa: string;
  cgpaScale: string;

  parentName: string;
  parentTitle: string;
  parentEducation: string;
  parentOccupation: string;
  parentAddress: string;
  parentLga: string;
  parentState: string;
  parentPhone: string;
  parentEmail: string;

  refereeName: string;
  refereeTitle: string;
  refereeAddress: string;
  refereeLga: string;
  refereeState: string;
  refereePhone: string;
  refereeEmail: string;
}

export type AnswerKey = keyof ScholarshipAnswers;

export const EMPTY_ANSWERS: ScholarshipAnswers = {
  fullName: '', dateOfBirth: '', gender: '', address: '', lga: '', stateOfOrigin: '', phone: '', email: '',
  admission: '', institutionType: '', institution: '', course: '', level: '', cgpa: '', cgpaScale: '5',
  parentName: '', parentTitle: '', parentEducation: '', parentOccupation: '', parentAddress: '', parentLga: '',
  parentState: '', parentPhone: '', parentEmail: '',
  refereeName: '', refereeTitle: '', refereeAddress: '', refereeLga: '', refereeState: '', refereePhone: '',
  refereeEmail: '',
};

export const ANSWER_KEYS = Object.keys(EMPTY_ANSWERS) as AnswerKey[];

export const ADDRESS_KEYS: AnswerKey[] = ['address', 'parentAddress', 'refereeAddress'];

export const DECLARATIONS = {
  truthful: 'The information I have given is true and complete, and I understand that the foundation may verify it.',
  noLoan:
    'I have not secured the Federal Government student loan (NELFUND), and I understand the scholarship will be withdrawn if I do.',
  consent:
    'I agree that the foundation may keep this application and its documents to assess it, and may contact my parent or guardian and my referee.',
} as const;
export type DeclarationKey = keyof typeof DECLARATIONS;

// ---------- Supporting documents ----------

export const DOCUMENTS = {
  olevel: { label: 'O-level results', hint: 'WAEC, NECO or NABTEB. Include both sittings if you used two.' },
  transcript: { label: 'Academic transcript', hint: 'Or your statement of result for the sessions you have completed.' },
  admission: { label: 'Proof of admission or enrolment', hint: 'Admission letter, acceptance receipt or school ID card.' },
  reference: { label: 'Letter of recommendation', hint: 'Signed by your referee.' },
} as const;
export type DocumentKey = keyof typeof DOCUMENTS;
export const DOCUMENT_KEYS = Object.keys(DOCUMENTS) as DocumentKey[];

/** Transcripts only exist once a student has finished a session. */
export function documentRequired(key: DocumentKey, admission: string): boolean {
  return key !== 'transcript' || admission === 'continuing';
}

export const FILE_RULES = {
  perDocument: 3,
  /** Vercel rejects request bodies above 4.5 MB, so the whole upload has to fit under that. */
  totalBytes: 4_200_000,
  types: {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  } as Record<string, string>,
} as const;

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------- Validation ----------

export const STEPS = [
  { id: 'personal', title: 'About you', keys: ['fullName', 'dateOfBirth', 'gender', 'address', 'lga', 'stateOfOrigin', 'phone', 'email'] },
  { id: 'academic', title: 'Your studies', keys: ['admission', 'institutionType', 'institution', 'course', 'level', 'cgpa', 'cgpaScale'] },
  {
    id: 'parent',
    title: 'Parent or guardian',
    keys: ['parentName', 'parentTitle', 'parentEducation', 'parentOccupation', 'parentAddress', 'parentLga', 'parentState', 'parentPhone', 'parentEmail'],
  },
  { id: 'referee', title: 'Referee', keys: ['refereeName', 'refereeTitle', 'refereeAddress', 'refereeLga', 'refereeState', 'refereePhone', 'refereeEmail'] },
  { id: 'documents', title: 'Documents', keys: [] },
  { id: 'review', title: 'Review & submit', keys: [] },
] as const satisfies readonly { id: string; title: string; keys: readonly AnswerKey[] }[];

const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;
const isPhone = (v: string) => PHONE_PATTERN.test(v) && v.replace(/\D/g, '').length >= 7;
const oneOf = (list: readonly string[], v: string) => list.includes(v);

function ageOn(dob: string, today: Date): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  let age = today.getUTCFullYear() - y;
  if (today.getUTCMonth() < m - 1 || (today.getUTCMonth() === m - 1 && today.getUTCDate() < d)) age--;
  return age;
}

/** Returns a message for every answer that isn't acceptable. An empty object means all is well. */
export function validateAnswers(a: ScholarshipAnswers, today = new Date()): Partial<Record<AnswerKey, string>> {
  const e: Partial<Record<AnswerKey, string>> = {};
  const need = (key: AnswerKey, message: string) => {
    if (!a[key].trim()) e[key] = message;
  };

  // About you
  need('fullName', 'Please enter your full name.');
  const age = ageOn(a.dateOfBirth, today);
  if (!a.dateOfBirth) e.dateOfBirth = 'Please enter your date of birth.';
  else if (age === null || age < 12 || age > 70) e.dateOfBirth = 'Please check your date of birth.';
  if (!oneOf(GENDERS, a.gender)) e.gender = 'Please choose one.';
  need('address', 'Please enter your contact address.');
  need('lga', 'Please enter your local government area.');
  if (!oneOf(NIGERIAN_STATES, a.stateOfOrigin)) e.stateOfOrigin = 'Please choose your state of origin.';
  if (!isPhone(a.phone)) e.phone = 'Please enter a phone number we can reach you on.';
  if (!EMAIL_PATTERN.test(a.email)) e.email = 'Please enter a valid email address.';

  // Your studies
  if (!(a.admission in ADMISSION_TYPES)) e.admission = 'Please choose one.';
  if (!(a.institutionType in INSTITUTION_TYPES)) e.institutionType = 'Please choose one.';
  need('institution', 'Please enter the name of your institution.');
  need('course', 'Please enter your course of study.');
  const levels = LEVELS[a.institutionType as InstitutionType] ?? [];
  if (!levels.includes(a.level)) e.level = 'Please choose your current level.';
  if (a.admission === 'continuing') {
    const scale = CGPA_SCALES[a.cgpaScale as CgpaScale];
    const cgpa = Number(a.cgpa);
    if (!scale) e.cgpaScale = 'Please choose your grading scale.';
    else if (!a.cgpa.trim() || !Number.isFinite(cgpa) || cgpa < 0 || cgpa > scale.max) e.cgpa = `Please enter your CGPA, between 0 and ${scale.max.toFixed(1)}.`;
    else if (cgpa < scale.min)
      e.cgpa = `The scholarship needs a CGPA of at least ${scale.min.toFixed(2)} ${scale.label} (Second Class Upper or its equivalent).`;
  }

  // Parent or guardian
  need('parentName', "Please enter your parent or guardian's name.");
  need('parentTitle', 'Please enter their title, for example Mr, Mrs or Dr.');
  need('parentEducation', 'Please enter their educational background.');
  need('parentOccupation', 'Please enter their occupation.');
  need('parentAddress', 'Please enter their contact address.');
  need('parentLga', 'Please enter their local government area.');
  if (!oneOf(NIGERIAN_STATES, a.parentState)) e.parentState = 'Please choose their state of origin.';
  if (!isPhone(a.parentPhone)) e.parentPhone = 'Please enter a phone number we can reach them on.';
  if (a.parentEmail.trim() && !EMAIL_PATTERN.test(a.parentEmail)) e.parentEmail = 'Please check this email address, or leave it empty.';

  // Referee
  need('refereeName', "Please enter your referee's name.");
  need('refereeTitle', 'Please enter their title or position.');
  need('refereeAddress', 'Please enter their contact address.');
  need('refereeLga', 'Please enter their local government area.');
  if (!oneOf(NIGERIAN_STATES, a.refereeState)) e.refereeState = 'Please choose their state of origin.';
  if (!isPhone(a.refereePhone)) e.refereePhone = 'Please enter a phone number we can reach them on.';
  if (a.refereeEmail.trim() && !EMAIL_PATTERN.test(a.refereeEmail)) e.refereeEmail = 'Please check this email address, or leave it empty.';

  return e;
}

/** The answers as labelled sections, for the review screen and the foundation's email. */
export function describeAnswers(a: ScholarshipAnswers): { title: string; rows: [string, string][] }[] {
  const place = (address: string, lga: string, state: string): [string, string][] => [
    ['Contact address', address],
    ['LGA of origin', lga],
    ['State of origin', state],
  ];
  const optional = (v: string) => v.trim() || 'Not given';
  const scale = CGPA_SCALES[a.cgpaScale as CgpaScale];

  return [
    {
      title: 'About the applicant',
      rows: [
        ['Name', a.fullName],
        ['Date of birth', a.dateOfBirth],
        ['Gender', a.gender],
        ...place(a.address, a.lga, a.stateOfOrigin),
        ['Phone', a.phone],
        ['Email', a.email],
      ],
    },
    {
      title: 'Studies',
      rows: [
        ['Status', ADMISSION_TYPES[a.admission as AdmissionType] ?? a.admission],
        ['Institution', `${a.institution} (${INSTITUTION_TYPES[a.institutionType as InstitutionType] ?? a.institutionType})`],
        ['Course of study', a.course],
        ['Current level', a.level],
        ['CGPA', a.admission === 'continuing' && scale ? `${a.cgpa} ${scale.label}` : 'Not applicable (newly admitted)'],
      ],
    },
    {
      title: 'Parent or guardian',
      rows: [
        ['Name', a.parentName],
        ['Title', a.parentTitle],
        ['Educational background', a.parentEducation],
        ['Occupation', a.parentOccupation],
        ...place(a.parentAddress, a.parentLga, a.parentState),
        ['Phone', a.parentPhone],
        ['Email', optional(a.parentEmail)],
      ],
    },
    {
      title: 'Referee',
      rows: [
        ['Name', a.refereeName],
        ['Title', a.refereeTitle],
        ...place(a.refereeAddress, a.refereeLga, a.refereeState),
        ['Phone', a.refereePhone],
        ['Email', optional(a.refereeEmail)],
      ],
    },
  ];
}

export const SCHOLARSHIP_REF_PATTERN = /^TROF-S-\d{4}-[A-HJ-NP-Z2-9]{5}$/;
