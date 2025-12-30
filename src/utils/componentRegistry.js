import InfoTab from '../components/detail/InfoTab';
import RegulatoryAffairsTab from '../components/domain/regulatory_affairs/RegulatoryAffairsTab';
import RenewalsTab from '../components/domain/regulatory_affairs/RenewalsTab';
import AttachmentsTab from '../components/domain/regulatory_affairs/AttachmentsTab';
import RelatedTab from '../components/domain/regulatory_affairs/RelatedTab';
import SecuritiesTab from '../components/domain/pension_fund/SecuritiesTab';
import HoldingsTab from '../components/domain/pension_fund/HoldingsTab';
import ComplianceTab from '../components/domain/pension_fund/ComplianceTab';
import RequestsTab from '../components/domain/pension_fund/RequestsTab';
import BoardSeatsTab from '../components/domain/pension_fund/BoardSeatsTab';

export const componentRegistry = {
  info: InfoTab,
  regulatory: RegulatoryAffairsTab,
  dossier: AttachmentsTab,
  relations: RelatedTab,
  renewals: RenewalsTab,
  attachments: AttachmentsTab,
  securities: SecuritiesTab,
  holdings: HoldingsTab,
  compliance: ComplianceTab,
  requests: RequestsTab,
  board_seats: BoardSeatsTab,
};

export const getTabComponent = (tabKey) => {
  const component = componentRegistry[tabKey];
  if (!component) {
    throw new Error(`Tab component for key "${tabKey}" not found in registry.`);
  }
  return component;
};

export default componentRegistry;
