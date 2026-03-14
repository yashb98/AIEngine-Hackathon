import type { ComplianceMap } from './types';

export const DEMO_PROFILE = {
  businessName: 'The Brewed Awakening',
  ownerName: 'Sarah',
  businessType: 'cafe_restaurant' as const,
  companyType: 'limited' as const,
  councilArea: 'edinburgh' as const,
  postcode: 'EH1 2QL',
  vatRegistered: true,
  vatQuarterEnd: 'march' as const,
  turnoverBand: '85k_250k' as const,
  employeeCount: 4,
  servesAlcohol: true,
  hasOutdoorSeating: true,
  handlesPersonalData: true,
  incorporationDate: '2022-06-15',
  licenceGrantDate: '2022-08-01',
  // Real FYE: Limited company incorporated June 15, 2022 → FYE is 30 June each year
  financialYearEnd: '2026-06-30',
  onboardingComplete: true,
};

// Helper to calculate real dates relative to now
function getFallbackDeadlines() {
  const now = new Date();
  const year = now.getFullYear();

  // VAT Q1 (Jan-Mar) due 7 May, Q2 (Apr-Jun) due 7 Aug, Q3 (Jul-Sep) due 7 Nov, Q4 (Oct-Dec) due 7 Feb next year
  const vatQuarters = [
    { label: 'Q1', period: 'Jan–Mar', due: `${year}-05-07` },
    { label: 'Q2', period: 'Apr–Jun', due: `${year}-08-07` },
    { label: 'Q3', period: 'Jul–Sep', due: `${year}-11-07` },
    { label: 'Q4', period: 'Oct–Dec', due: `${year + 1}-02-07` },
  ];
  const nextVat = vatQuarters.find(q => new Date(q.due) > now) ?? vatQuarters[0];

  // PAYE: 5th of next month
  const payeMonth = now.getMonth() + 1; // 0-indexed + 1
  const payeYear = payeMonth >= 12 ? year + 1 : year;
  const payeDate = `${payeYear}-${String((payeMonth % 12) + 1).padStart(2, '0')}-05`;

  // Corporation Tax payment: 9 months + 1 day after FYE (30 June) = 1 April next year
  // Corporation Tax return: 12 months after FYE = 30 June next year
  const corpTaxPayment = `${year + 1}-04-01`;
  const corpTaxReturn = `${year + 1}-06-30`;

  // Annual Accounts: 9 months after FYE (30 June) = 31 March next year
  const annualAccounts = `${year + 1}-03-31`;

  // Confirmation Statement: Incorporation 15 June 2022 → anniversary 15 June each year, due +14 days = 29 June
  const confirmationDue = new Date(`${year}-06-29`) > now ? `${year}-06-29` : `${year + 1}-06-29`;

  // Premises Licence: Granted 1 Aug 2022 → annual fee due 1 August
  const licenceDue = new Date(`${year}-08-01`) > now ? `${year}-08-01` : `${year + 1}-08-01`;

  // ICO: Annual, assume June renewal
  const icoDue = new Date(`${year}-06-15`) > now ? `${year}-06-15` : `${year + 1}-06-15`;

  function severity(dateStr: string): 'overdue' | 'urgent' | 'warning' | 'safe' {
    const days = Math.ceil((new Date(dateStr).getTime() - now.getTime()) / 86400000);
    if (days < 0) return 'overdue';
    if (days <= 7) return 'urgent';
    if (days <= 30) return 'warning';
    return 'safe';
  }

  return [
    {
      id: 'dl-vat-next',
      title: `VAT Return — ${nextVat.label} ${year} (${nextVat.period})`,
      category: 'hmrc' as const,
      dueDate: nextVat.due,
      description: `Submit VAT return and payment for ${nextVat.period} ${year} quarter`,
      penalty: '2% surcharge on VAT owed, escalating to 15%',
      action: 'File via HMRC online services at gov.uk/vat-returns',
      severity: severity(nextVat.due),
    },
    {
      id: 'dl-paye-next',
      title: 'PAYE RTI — Monthly Submission',
      category: 'hmrc' as const,
      dueDate: payeDate,
      description: 'Report payroll to HMRC on or before each payday',
      penalty: '£100–£400/month late filing penalty',
      action: 'Submit via payroll software or HMRC Basic PAYE Tools',
      severity: severity(payeDate),
    },
    {
      id: 'dl-ch-confirmation',
      title: 'Companies House Confirmation Statement',
      category: 'companies_house' as const,
      dueDate: confirmationDue,
      description: 'Annual confirmation that company details are up to date (due 14 days after incorporation anniversary)',
      penalty: '£150 initial penalty, escalating to £1,500',
      action: 'File via Companies House WebFiling',
      severity: severity(confirmationDue),
    },
    {
      id: 'dl-accounts',
      title: 'Annual Accounts Filing',
      category: 'companies_house' as const,
      dueDate: annualAccounts,
      description: `File annual accounts for year ending 30 June ${year} (due 9 months after FYE)`,
      penalty: '£150 escalating to £1,500',
      action: 'File via Companies House WebFiling',
      severity: severity(annualAccounts),
    },
    {
      id: 'dl-corp-tax-payment',
      title: 'Corporation Tax Payment',
      category: 'hmrc' as const,
      dueDate: corpTaxPayment,
      description: `Corporation Tax for year ending 30 June ${year} (due 9 months + 1 day after FYE)`,
      penalty: 'Interest + £100 penalty, then £200 after 3 months',
      action: 'Pay via HMRC online',
      severity: severity(corpTaxPayment),
    },
    {
      id: 'dl-licence-fee',
      title: 'Premises Licence Annual Fee',
      category: 'scottish' as const,
      dueDate: licenceDue,
      description: 'Annual fee to Edinburgh Licensing Board under the Licensing (Scotland) Act 2005',
      penalty: 'Licence suspension or revocation',
      action: 'Pay annual fee to City of Edinburgh Council Licensing',
      severity: severity(licenceDue),
    },
    {
      id: 'dl-ico',
      title: 'ICO Data Protection Fee',
      category: 'data' as const,
      dueDate: icoDue,
      description: 'Annual ICO registration fee (£40 for micro/small businesses)',
      penalty: 'Criminal offence — up to £4,350 fine',
      action: 'Pay £40 via ico.org.uk',
      severity: severity(icoDue),
    },
    {
      id: 'dl-food-hygiene',
      title: 'Food Hygiene — Maintain Compliance',
      category: 'food_safety' as const,
      dueDate: null,
      description: 'Maintain food hygiene standards. Inspection can happen any time.',
      penalty: 'Closure notice, prosecution, or improvement notice',
      action: "Ensure Safer Food Better Business records are up to date. Allergen info displayed (Natasha's Law).",
      severity: 'warning' as const,
    },
  ];
}

export const FALLBACK_COMPLIANCE_MAP: ComplianceMap = {
  profile: DEMO_PROFILE,
  summary:
    'The Brewed Awakening has 14 active compliance obligations across HMRC, Companies House, Food Standards Scotland, the Scottish Licensing Act, employment law, and data protection. Deadlines are calculated from real UK regulatory calendars.',
  riskScore: 45,
  obligations: [
    {
      id: 'fss-hygiene',
      title: 'Food Hygiene Registration',
      category: 'food_safety',
      description: 'Must be registered with City of Edinburgh Council environmental health. Maintain Safer Food Better Business records at all times.',
      appliesWhen: 'All food businesses',
      frequency: 'Ongoing',
      penalty: 'Closure notice, prosecution, or food hygiene improvement notice',
      source: 'Food Standards Scotland',
      sourceUrl: 'https://www.foodstandards.gov.scot/business-and-industry/safety-and-regulation/food-hygiene',
    },
    {
      id: 'fss-allergens',
      title: 'Allergen Information Display (Natasha\'s Law)',
      category: 'food_safety',
      description: 'Full allergen labelling required on all pre-packed for direct sale (PPDS) food. 14 major allergens must be declared.',
      appliesWhen: 'All food businesses',
      frequency: 'Ongoing',
      penalty: 'Unlimited fine and/or up to 2 years imprisonment',
      source: 'Food Standards Scotland',
      sourceUrl: 'https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses',
    },
    {
      id: 'fss-haccp',
      title: 'Food Safety Management System (HACCP)',
      category: 'food_safety',
      description: 'Must implement and maintain a documented food safety management system based on HACCP principles.',
      appliesWhen: 'All food businesses',
      frequency: 'Ongoing',
      penalty: 'Improvement notice, prohibition order, or prosecution',
      source: 'Food Standards Scotland',
      sourceUrl: 'https://www.foodstandards.gov.scot/business-and-industry/safety-and-regulation/haccp',
    },
    {
      id: 'hmrc-vat',
      title: 'VAT Returns',
      category: 'hmrc',
      description: 'Submit quarterly VAT return and payment to HMRC.',
      appliesWhen: 'VAT registered (turnover > £85,000)',
      frequency: 'Quarterly',
      penalty: '2% surcharge on VAT owed, escalating to 15%',
      source: 'HMRC',
      sourceUrl: 'https://www.gov.uk/vat-returns',
    },
    {
      id: 'hmrc-paye',
      title: 'PAYE / RTI Submission',
      category: 'hmrc',
      description: 'Report payroll information to HMRC on or before each payday.',
      appliesWhen: 'Has employees (4 employees)',
      frequency: 'Monthly',
      penalty: '£100–£400/month late filing penalty',
      source: 'HMRC',
      sourceUrl: 'https://www.gov.uk/paye-for-employers',
    },
    {
      id: 'hmrc-corp-tax',
      title: 'Corporation Tax',
      category: 'hmrc',
      description: 'Pay Corporation Tax 9 months + 1 day after accounting period end. File return within 12 months.',
      appliesWhen: 'Limited company',
      frequency: 'Annual',
      penalty: '£100 penalty, then £200 after 3 months',
      source: 'HMRC',
      sourceUrl: 'https://www.gov.uk/corporation-tax',
    },
    {
      id: 'ch-confirmation',
      title: 'Companies House Confirmation Statement',
      category: 'companies_house',
      description: 'Annual confirmation that company details are up to date.',
      appliesWhen: 'Limited company',
      frequency: 'Annual',
      penalty: '£150 initial penalty, escalating to £1,500',
      source: 'Companies House',
      sourceUrl: 'https://www.gov.uk/file-your-confirmation-statement-with-companies-house',
    },
    {
      id: 'ch-accounts',
      title: 'Annual Accounts Filing',
      category: 'companies_house',
      description: 'File annual accounts within 9 months of financial year end.',
      appliesWhen: 'Limited company',
      frequency: 'Annual',
      penalty: '£150 escalating to £1,500',
      source: 'Companies House',
      sourceUrl: 'https://www.gov.uk/file-your-company-annual-accounts',
    },
    {
      id: 'licence-premises',
      title: 'Premises Licence Annual Fee',
      category: 'scottish',
      description: 'Annual fee to City of Edinburgh Council licensing board under the Licensing (Scotland) Act 2005.',
      appliesWhen: 'Serves alcohol',
      frequency: 'Annual',
      penalty: 'Licence suspension or revocation',
      source: 'City of Edinburgh Council / Licensing (Scotland) Act 2005',
      sourceUrl: 'https://www.mygov.scot/alcohol-licence',
    },
    {
      id: 'licence-personal',
      title: 'Personal Licence Holder Training',
      category: 'scottish',
      description: 'Scottish Certificate for Personal Licence Holders. Mandatory training refresher every 5 years.',
      appliesWhen: 'Serves alcohol',
      frequency: 'Every 5 years',
      penalty: 'Loss of personal licence',
      source: 'Licensing (Scotland) Act 2005',
      sourceUrl: 'https://www.mygov.scot/personal-licence',
    },
    {
      id: 'council-outdoor',
      title: 'Outdoor Seating Licence',
      category: 'council',
      description: 'Licence required for tables and chairs on public pavement from City of Edinburgh Council.',
      appliesWhen: 'Has outdoor seating',
      frequency: 'Annual',
      penalty: 'Removal of furniture, fine',
      source: 'City of Edinburgh Council',
    },
    {
      id: 'emp-pension',
      title: 'Auto-Enrolment Pensions',
      category: 'employment',
      description: 'Must enrol eligible workers. Minimum contribution: 3% employer, 5% employee. Re-enrolment every 3 years.',
      appliesWhen: 'Has employees (4 employees)',
      frequency: 'Ongoing',
      penalty: 'TPR enforcement: £50–£10,000/day',
      source: 'The Pensions Regulator',
      sourceUrl: 'https://www.thepensionsregulator.gov.uk/en/employers',
    },
    {
      id: 'emp-eli',
      title: "Employer's Liability Insurance",
      category: 'employment',
      description: 'Must hold minimum £5M cover. Display certificate at premises.',
      appliesWhen: 'Has employees',
      frequency: 'Annual renewal',
      penalty: '£2,500 per day without valid insurance',
      source: 'HSE',
      sourceUrl: 'https://www.gov.uk/employers-liability-insurance',
    },
    {
      id: 'ico-registration',
      title: 'ICO Data Protection Fee',
      category: 'data',
      description: 'Annual data protection fee to Information Commissioner.',
      appliesWhen: 'Handles personal data (customer bookings, staff records)',
      frequency: 'Annual',
      penalty: 'Criminal offence — up to £4,350 fine',
      source: 'ICO',
      sourceUrl: 'https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/',
    },
  ],
  deadlines: getFallbackDeadlines(),
  generatedAt: new Date().toISOString(),
};
