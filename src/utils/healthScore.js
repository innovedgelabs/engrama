/**
 * Health score utility
 *
 * Calculates a weighted compliance health score based on
 * regulatory affairs, not individual renewals.
 *
 * Each affair contributes once to the score using:
 *  - Priority weighting (business impact)
 *  - Compliance weighting (current risk state)
 *
 * Formula:
 *   Σ(priorityWeight × complianceWeight) / Σ(priorityWeight) × 100
 *
 * Notes:
 *  - Permanent affairs are excluded from the calculation
 *  - Falls back to medium/low defaults when data is missing
 */

import { COMPLIANCE_STATUS, PRIORITY_LEVEL } from './status';

const PRIORITY_WEIGHTS = {
  [PRIORITY_LEVEL.CRITICAL]: 3,
  [PRIORITY_LEVEL.HIGH]: 2,
  [PRIORITY_LEVEL.MEDIUM]: 1.5,
  [PRIORITY_LEVEL.LOW]: 1,
};

// Compliance weight is expressed as a ratio (0–1)
const COMPLIANCE_WEIGHTS = {
  [COMPLIANCE_STATUS.CURRENT]: 1, // 100%
  [COMPLIANCE_STATUS.EXPIRING]: 0.5, // 50%
  [COMPLIANCE_STATUS.EXPIRED]: 0, // 0%
  // PERMANENT is intentionally excluded
};

/**
 * Calculate health score from regulatory affairs.
 *
 * @param {Array} affairs - Array of affairs or affair summaries.
 *   Each item should have:
 *     - complianceStatus: one of COMPLIANCE_STATUS
 *     - priorityLevel or priority: one of PRIORITY_LEVEL
 *
 * @returns {{ score: number, hasData: boolean, considered: number }}
 *   score      - 0–100 integer
 *   hasData    - false when nothing could be scored (falls back to 100)
 *   considered - number of affairs that participated in the calculation
 */
export const calculateHealthScore = (affairs = []) => {
  if (!Array.isArray(affairs) || affairs.length === 0) {
    return { score: 100, hasData: false, considered: 0 };
  }

  let weightedSum = 0;
  let weightTotal = 0;
  let considered = 0;

  affairs.forEach((item) => {
    if (!item) return;

    // Support both raw affairs and enriched "summary" objects
    const complianceStatus =
      item.complianceStatus ||
      item.affair?.complianceStatus ||
      null;

    // Skip permanent or missing compliance status
    if (
      !complianceStatus ||
      complianceStatus === COMPLIANCE_STATUS.PERMANENT ||
      !(complianceStatus in COMPLIANCE_WEIGHTS)
    ) {
      return;
    }

    const priorityLevel =
      item.priorityLevel ||
      item.priority ||
      item.affair?.priorityLevel ||
      item.affair?.priority ||
      PRIORITY_LEVEL.MEDIUM;

    const priorityWeight =
      PRIORITY_WEIGHTS[priorityLevel] ??
      PRIORITY_WEIGHTS[PRIORITY_LEVEL.MEDIUM];

    const complianceWeight = COMPLIANCE_WEIGHTS[complianceStatus];

    const contribution = priorityWeight * complianceWeight;

    weightedSum += contribution;
    weightTotal += priorityWeight;
    considered += 1;
  });

  if (weightTotal === 0 || considered === 0) {
    return { score: 100, hasData: false, considered: 0 };
  }

  const raw = (weightedSum / weightTotal) * 100;
  const clamped = Math.max(0, Math.min(100, raw));

  return {
    score: Math.round(clamped),
    hasData: true,
    considered,
  };
};

/**
 * Map a numeric health score into a qualitative zone.
 *
 * Zones:
 *  - 'good'     → 80–100
 *  - 'warning'  → 60–79
 *  - 'critical' → < 60
 *
 * @param {number} score - 0–100
 * @returns {'good' | 'warning' | 'critical'}
 */
export const getHealthZone = (score) => {
  if (score >= 80) return 'good';
  if (score >= 60) return 'warning';
  return 'critical';
};


