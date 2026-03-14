export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  businessType: FoodBusinessType;
  companyType: CompanyType;

  councilArea: CouncilArea;
  postcode: string;

  vatRegistered: boolean;
  vatNumber?: string;
  vatQuarterEnd?: 'march' | 'june' | 'september' | 'december';
  turnoverBand: TurnoverBand;

  employeeCount: number;

  servesAlcohol: boolean;
  hasOutdoorSeating: boolean;
  handlesPersonalData: boolean;

  incorporationDate?: string;
  licenceGrantDate?: string;
  icoRegistrationDate?: string;
  pensionStagingDate?: string;
  eliRenewalDate?: string;
  financialYearEnd?: string;

  onboardingComplete: boolean;
}

export type FoodBusinessType =
  | 'cafe_restaurant'
  | 'pub_bar'
  | 'takeaway'
  | 'bakery'
  | 'catering';

export type CompanyType = 'sole_trader' | 'limited' | 'partnership' | 'llp';

export type CouncilArea =
  | 'edinburgh'
  | 'glasgow'
  | 'aberdeen'
  | 'dundee'
  | 'fife'
  | 'highland'
  | 'stirling'
  | 'perth_kinross'
  | 'other';

export type TurnoverBand =
  | 'under_85k'
  | '85k_250k'
  | '250k_1m'
  | 'over_1m';

export type RegCategory =
  | 'hmrc'
  | 'companies_house'
  | 'council'
  | 'employment'
  | 'food_safety'
  | 'data'
  | 'scottish';

export type DeadlineSeverity = 'overdue' | 'urgent' | 'warning' | 'safe';

export interface Obligation {
  id: string;
  title: string;
  category: RegCategory;
  description: string;
  appliesWhen: string;
  frequency: string;
  penalty: string;
  source: string;
  sourceUrl?: string;
}

export interface Deadline {
  id: string;
  title: string;
  category: RegCategory;
  dueDate: string | null;
  description: string;
  penalty: string;
  action: string;
  severity: DeadlineSeverity;
}

export interface ComplianceMap {
  profile: BusinessProfile;
  obligations: Obligation[];
  deadlines: Deadline[];
  riskScore: number;
  generatedAt: string;
  summary: string;
}

export interface RegulationChange {
  id: string;
  title: string;
  date: string;
  summary: string;
  impact: string;
  category: RegCategory;
  sourceUrl: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ReminderPreferences {
  email: string;
  enabled: boolean;
  timing: {
    days30: boolean;
    days14: boolean;
    days7: boolean;
    days2: boolean;
  };
  categories: Record<RegCategory, boolean>;
  selectedDeadlines: string[];
  emailConfirmedAt?: string;
}

export interface FormField {
  id: string;
  label: string;
  value: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  section: string;
  helpText?: string;
  required: boolean;
}

export interface AutofillResult {
  filingType: string;
  portalUrl: string;
  fields: FormField[];
  summary: string;
}

export const CATEGORY_CONFIG: Record<RegCategory, { label: string; color: string; icon: string }> = {
  hmrc: { label: 'HMRC', color: 'blue', icon: '🏛️' },
  companies_house: { label: 'Companies House', color: 'green', icon: '📋' },
  council: { label: 'Local Council', color: 'amber', icon: '🏢' },
  employment: { label: 'Employment', color: 'purple', icon: '👥' },
  food_safety: { label: 'Food Safety', color: 'orange', icon: '🍽️' },
  data: { label: 'Data Protection', color: 'cyan', icon: '🔒' },
  scottish: { label: 'Scotland Specific', color: 'teal', icon: '🏴' },
};
