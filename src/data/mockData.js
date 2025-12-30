export const DEFAULT_COMPANY_USER_ID = 'user-ra-admin';
export const DEFAULT_PENSION_FUND_USER_ID = 'user-admin';

export const DEMO_BUSINESSES = [
  {
    id: 'acme-empresa-alimenticia',
    name: 'ACME Empresa Alimenticia',
    logo: '/businesses/food_manufacturing/main_logo.svg',
    domainId: 'regulatory_affairs',
    defaultUserId: DEFAULT_COMPANY_USER_ID,
  },
  {
    id: 'pension_fund',
    name: 'Pension Fund',
    logo: '/businesses/pension_fund/main_logo.svg',
    domainId: 'pension_fund',
    defaultUserId: DEFAULT_PENSION_FUND_USER_ID,
  },
];

export const DEFAULT_BUSINESS_ID = DEMO_BUSINESSES[0].id;

export const getBusinessById = (businessId) =>
  DEMO_BUSINESSES.find((business) => business.id === businessId) ?? DEMO_BUSINESSES[0];

export const getBusinessData = (businessId) => {
  const business = getBusinessById(businessId ?? DEFAULT_BUSINESS_ID);

  return {
    business,
    assets: [],
    regulatory_affairs: [],
    renewals: [],
    attachments: [],
    users: [],
    historical_compliance: [],
  };
};
