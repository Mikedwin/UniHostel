const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Payment configuration
export const PAYMENT_PROVIDER = process.env.REACT_APP_PAYMENT_PROVIDER || 'flutterwave';
export const PAYSTACK_PUBLIC_KEY = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_live_22c9fc410243940e1484e561a2ff84d1e9196675';
export const FLUTTERWAVE_PUBLIC_KEY = process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-SANDBOXSTART-';

export default API_URL;
