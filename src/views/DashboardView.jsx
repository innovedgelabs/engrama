import { useMemo } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useDomain } from '../contexts/DomainContext';
import { getDashboardComponent } from '../utils/dashboardRegistry';

const DashboardView = (props) => {
  const { currentDomainId, currentConfig } = useDomain();
  const DomainDashboard = useMemo(
    () => getDashboardComponent(currentDomainId, currentConfig),
    [currentDomainId, currentConfig]
  );

  return (
    <PageLayout showBackButton={false}>
      <DomainDashboard {...props} />
    </PageLayout>
  );
};

export default DashboardView;
