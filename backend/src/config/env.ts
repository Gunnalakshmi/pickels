import dotenv from 'dotenv';
import path from 'path';

// Load root or local .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'picklemart_secret_jwt_key_2026_super_secure',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  paymentMode: process.env.PAYMENT_MODE || 'TEST',
  paymentApiKey: process.env.PAYMENT_API_KEY || 'rzp_test_picklemart',
  paymentSecret: process.env.PAYMENT_SECRET || 'rzp_secret_dummy',
  store: {
    name: process.env.STORE_NAME || 'PickleMart India',
    email: process.env.STORE_EMAIL || 'support@picklemart.in',
    phone: process.env.STORE_PHONE || '+91 98765 43210',
    fssaiNumber: process.env.STORE_FSSAI_NUMBER || '10021042000889',
    gstin: process.env.STORE_GSTIN || '36AAACP1234M1Z5',
    defaultGstRate: parseFloat(process.env.DEFAULT_GST_RATE || '5'),
    freeDeliveryThreshold: parseFloat(process.env.FREE_DELIVERY_THRESHOLD || '499'),
    standardDeliveryFee: parseFloat(process.env.STANDARD_DELIVERY_FEE || '50'),
  },
};
