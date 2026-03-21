const SAFE_USER_FIELDS = [
  '_id',
  'name',
  'email',
  'phone',
  'hostelName',
  'role',
  'isActive',
  'accountStatus',
  'isVerified',
  'suspensionReason',
  'suspensionNote',
  'suspendedBy',
  'suspendedAt',
  'lastLogin',
  'passwordResetRequired',
  'tosAccepted',
  'tosAcceptedAt',
  'privacyPolicyAccepted',
  'privacyPolicyAcceptedAt',
  'momoProvider',
  'momoNumber',
  'momoAccountName',
  'paystackSubaccountCode',
  'paystackSubaccountId',
  'payoutEnabled',
  'isDeleted',
  'deletedAt',
  'deletedBy',
  'createdAt'
];

const toPlainObject = (user) => {
  if (!user) {
    return null;
  }

  if (typeof user.toObject === 'function') {
    return user.toObject();
  }

  return { ...user };
};

const sanitizeAdminUser = (user) => {
  if (!user) {
    return null;
  }

  const plainUser = toPlainObject(user);

  return SAFE_USER_FIELDS.reduce((safeUser, field) => {
    if (plainUser[field] !== undefined) {
      safeUser[field] = plainUser[field];
    }

    return safeUser;
  }, {});
};

const sanitizeAdminUsers = (users = []) => users
  .map((user) => sanitizeAdminUser(user))
  .filter(Boolean);

module.exports = {
  sanitizeAdminUser,
  sanitizeAdminUsers
};
