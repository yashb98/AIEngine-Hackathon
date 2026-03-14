export const FOOD_BUSINESS_TYPES = [
  { value: 'cafe_restaurant', label: 'Cafe / Restaurant' },
  { value: 'pub_bar', label: 'Pub / Bar' },
  { value: 'takeaway', label: 'Takeaway / Food Van' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'catering', label: 'Catering Company' },
] as const;

export const COUNCIL_AREAS = [
  { value: 'edinburgh', label: 'City of Edinburgh' },
  { value: 'glasgow', label: 'Glasgow City' },
  { value: 'aberdeen', label: 'Aberdeen City' },
  { value: 'dundee', label: 'Dundee City' },
  { value: 'fife', label: 'Fife' },
  { value: 'highland', label: 'Highland' },
  { value: 'stirling', label: 'Stirling' },
  { value: 'perth_kinross', label: 'Perth & Kinross' },
  { value: 'other', label: 'Other Council Area' },
] as const;

export const COMPANY_TYPES = [
  { value: 'sole_trader', label: 'Sole Trader' },
  { value: 'limited', label: 'Limited Company (Ltd)' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'Limited Liability Partnership (LLP)' },
] as const;

export const TURNOVER_BANDS = [
  { value: 'under_85k', label: 'Under £85,000 (below VAT threshold)' },
  { value: '85k_250k', label: '£85,000 - £250,000' },
  { value: '250k_1m', label: '£250,000 - £1,000,000' },
  { value: 'over_1m', label: 'Over £1,000,000' },
] as const;
