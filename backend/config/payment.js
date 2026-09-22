const DEFAULT_ADMIN_COMMISSION_PERCENT = 5;

const getAdminCommissionPercent = () => {
  const commissionPercent = Number(process.env.ADMIN_COMMISSION_PERCENT);

  return Number.isFinite(commissionPercent)
    && commissionPercent > 0
    && commissionPercent < 100
    ? commissionPercent
    : DEFAULT_ADMIN_COMMISSION_PERCENT;
};

module.exports = {
  DEFAULT_ADMIN_COMMISSION_PERCENT,
  getAdminCommissionPercent
};
