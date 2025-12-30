import React from 'react';
import DashboardRegAffairs from '../components/domain/regulatory_affairs/DashboardRegAffairs';
import PlaceholderDashboard from '../components/dashboard/PlaceholderDashboard';

const dashboardRegistry = {
  regulatory_affairs: DashboardRegAffairs,
  // pension_fund: DashboardPensionFund, // add when available
};

export const getDashboardComponent = (domainId, domainConfig) => {
  const Comp = dashboardRegistry[domainId];
  if (Comp) return Comp;
  const name = domainConfig?.name?.en || domainConfig?.name?.es || domainId;
  return (props) => React.createElement(PlaceholderDashboard, { domainName: name, ...props });
};

export default dashboardRegistry;
