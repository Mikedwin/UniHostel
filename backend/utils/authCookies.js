const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'unihostel_auth';
const AUTH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const getSameSiteValue = () => {
  const configuredValue = (process.env.AUTH_COOKIE_SAME_SITE || '').toLowerCase();

  if (['lax', 'strict', 'none'].includes(configuredValue)) {
    return configuredValue;
  }

  return process.env.NODE_ENV === 'production' ? 'none' : 'lax';
};

const getAuthCookieBaseOptions = () => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: getSameSiteValue(),
    path: '/'
  };

  if (process.env.AUTH_COOKIE_DOMAIN) {
    options.domain = process.env.AUTH_COOKIE_DOMAIN;
  }

  return options;
};

const getAuthCookieOptions = () => ({
  ...getAuthCookieBaseOptions(),
  maxAge: AUTH_COOKIE_MAX_AGE_MS
});

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieBaseOptions());
};

module.exports = {
  AUTH_COOKIE_NAME,
  getAuthCookieBaseOptions,
  getAuthCookieOptions,
  setAuthCookie,
  clearAuthCookie
};
