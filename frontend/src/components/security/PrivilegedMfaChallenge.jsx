import React from 'react';

const PrivilegedMfaChallenge = ({
  code,
  loading,
  maskedEmail,
  onBack,
  onCodeChange,
  onResend,
  onSubmit,
  resendLoading
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="text-xl font-bold text-gray-900">Enter Security Code</h3>
      <p className="mt-2 text-sm text-gray-600">
        We sent a 6-digit code to <span className="font-medium text-gray-900">{maskedEmail}</span>.
      </p>
    </div>

    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Security Code
        </label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          className="w-full px-4 py-3 text-center tracking-[0.5em] text-lg border border-gray-300 rounded-lg focus:outline-none transition-colors"
          placeholder="000000"
          value={code}
          onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onFocus={(e) => e.target.style.borderColor = '#23817A'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
      </div>

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="w-full text-white py-3 px-4 rounded-lg font-semibold focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        style={{ backgroundColor: '#23817A' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a6159'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#23817A'}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Verifying...
          </>
        ) : (
          'Verify Code'
        )}
      </button>
    </form>

    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        disabled={loading || resendLoading}
        className="flex-1 px-4 py-3 rounded-lg border font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ borderColor: '#23817A', color: '#23817A' }}
        onClick={onResend}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f5f4'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
      >
        {resendLoading ? 'Sending...' : 'Resend Code'}
      </button>

      <button
        type="button"
        disabled={loading || resendLoading}
        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        onClick={onBack}
      >
        Use Different Account
      </button>
    </div>
  </div>
);

export default PrivilegedMfaChallenge;
