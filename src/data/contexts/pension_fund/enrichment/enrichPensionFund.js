import { getDynamicRequests } from '../../../../services/requestStorage.js';
import { calculateDueDate, isOverdue, getEntityLei, getEntityIdentifier } from '../../../../utils/requestUtils.js';

const isExpiringSoon = (expirationDate) => {
  if (!expirationDate) {
    return false;
  }

  const now = new Date();
  const expires = new Date(expirationDate);
  const diffDays = Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 90;
};

export const enrichPensionFundData = (data, _params = {}) => {
  const investmentEntities = data.investment_entities || data.assets || [];
  const holdings = data.holdings || [];
  const obligations = data.compliance_obligations || [];
  const securities = data.securities || [];
  const hardcodedRequests = data.requests || [];
  const dynamicRequests = getDynamicRequests();
  const requests = [...hardcodedRequests, ...dynamicRequests];
  const boardSeats = data.board_seats || [];

  const withDefaults = (items = [], category, nameResolver) =>
    items.map((item) => {
      const name =
        item.name ||
        (nameResolver ? nameResolver(item) : null) ||
        item.id;
      const lifecycle =
        item.lifecycle_status ||
        item.status ||
        'active';
      return {
        ...item,
        category: item.category || category,
        name,
        lifecycle_status: lifecycle,
        status: lifecycle,
      };
    });

  const obligationsByEntity = obligations.reduce((acc, obligation) => {
    if (!obligation?.entity_id) {
      return acc;
    }
    const list = acc.get(obligation.entity_id) || [];
    list.push(obligation);
    acc.set(obligation.entity_id, list);
    return acc;
  }, new Map());

  const holdingsByEntity = holdings.reduce((acc, holding) => {
    if (!holding?.entity_id) {
      return acc;
    }
    const list = acc.get(holding.entity_id) || [];
    list.push(holding);
    acc.set(holding.entity_id, list);
    return acc;
  }, new Map());

  const enrichedEntities = investmentEntities.map((entity) => {
    const entityHoldings = holdingsByEntity.get(entity.id) || [];
    const entityObligations = obligationsByEntity.get(entity.id) || [];

    const totalExposure = entityHoldings.reduce(
      (sum, holding) => sum + (holding.market_value || 0),
      0
    );

    const uniquePrograms = Array.from(
      new Set(entityHoldings.map((holding) => holding.investment_program).filter(Boolean))
    );

    const hasCriticalObligation = entityObligations.some(
      (obligation) => obligation.compliance_status === 'critical'
    );

    const hasWarningObligation = entityObligations.some(
      (obligation) => obligation.compliance_status === 'warning'
    );

    const hasExpiringObligation = entityObligations.some((obligation) =>
      isExpiringSoon(obligation.expiration_date)
    );

    const multiProgramExposure = uniquePrograms.length > 1;

    let complianceStatus =
      entity.compliance_status ||
      (uniquePrograms.length === 0 && entityObligations.length === 0 ? 'n/a' : 'compliant');

    if (hasCriticalObligation) {
      complianceStatus = 'critical';
    } else if (multiProgramExposure || hasWarningObligation || hasExpiringObligation) {
      complianceStatus = 'warning';
    }

    return {
      ...entity,
      investment_programs: uniquePrograms,
      total_exposure: totalExposure,
      compliance_status: complianceStatus,
      complianceStatus,
      status: entity.lifecycle_status || entity.status || 'active',
      category: entity.category || 'investment_entity',
    };
  });

  const enrichedSecurities = withDefaults(
    securities,
    'security',
    (sec) => sec.security_name || sec.ticker || sec.cusip
  );

  const enrichedHoldings = withDefaults(
    holdings,
    'holding',
    (holding) => holding.security_name || holding.investment_program
  );

  const enrichedObligations = withDefaults(
    obligations,
    'compliance_obligation',
    (ob) => ob.obligation_type || ob.id
  );

  // Enrich requests with entity LEI, identifier, due date, and overdue flag
  const enrichedRequests = requests.map((req) => {
    const baseRequest = withDefaults([req], 'request', (r) => r.request_type || r.id)[0];

    // Lookup entity LEI (for backward compatibility)
    const entityLei = getEntityLei(req.counterparty_id, investmentEntities);

    // Get best entity identifier (ISIN > LEI > Ticker > ID)
    const { identifier: entityIdentifier, type: entityIdentifierType } = getEntityIdentifier(
      req.counterparty_id,
      investmentEntities,
      securities
    );

    // Calculate due date
    const dueDate = calculateDueDate(req.submitted_at, req.urgency);

    // Check if overdue
    const overdue = dueDate ? isOverdue(dueDate) : false;

    return {
      ...baseRequest,
      entity_lei: entityLei,
      entity_identifier: entityIdentifier,
      entity_identifier_type: entityIdentifierType,
      due_date: dueDate,
      is_overdue: overdue,
    };
  });

  const enrichedBoardSeats = withDefaults(
    boardSeats,
    'board_seat',
    (seat) => seat.representative_name || seat.id
  );

  return {
    ...data,
    investment_entities: enrichedEntities,
    assets: [
      ...enrichedEntities,
      ...enrichedSecurities,
      ...enrichedHoldings,
      ...enrichedObligations,
      ...enrichedRequests,
      ...enrichedBoardSeats,
    ],
    securities: enrichedSecurities,
    holdings: enrichedHoldings,
    compliance_obligations: enrichedObligations,
    requests: enrichedRequests,
    board_seats: enrichedBoardSeats,
  };
};

export default enrichPensionFundData;
