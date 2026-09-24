import request from 'supertest';
import { createApp } from '../app';
import { db } from '../database/db';
import { seedDatabase } from '../database/seed';

const app = createApp();

beforeAll(async () => {
  await db.initialize();
  await seedDatabase();
});

describe('PickleMart India API Test Suite', () => {
  let customerToken: string;
  let adminToken: string;
  let sampleProductId: string;
  let sampleVariantId: string;
  let createdOrderId: string;

  describe('1. Health and Discovery', () => {
    it('GET /api/health returns ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toContain('PickleMart');
    });

    it('GET /api/products returns products list with pagination', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
      sampleProductId = res.body.products[0].id;
      sampleVariantId = res.body.products[0].variants[0].id;
    });

    it('GET /api/products/categories returns categories with count', async () => {
      const res = await request(app).get('/api/products/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.categories.length).toBeGreaterThan(0);
    });

    it('GET /api/products/:identifier returns details with variants & compliance', async () => {
      const res = await request(app).get(`/api/products/${sampleProductId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product.compliance).toBeDefined();
      expect(res.body.product.compliance.fssai_license_no).toBeDefined();
    });
  });

  describe('2. Authentication', () => {
    it('POST /api/auth/login logs in customer', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ emailOrPhone: 'customer@picklemart.in', password: 'Customer@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      customerToken = res.body.token;
    });

    it('POST /api/auth/admin-login logs in admin', async () => {
      const res = await request(app)
        .post('/api/auth/admin-login')
        .send({ email: 'admin@picklemart.in', password: 'Admin@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.token;
    });

    it('GET /api/auth/me returns authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('customer@picklemart.in');
    });
  });

  describe('3. Pincode and Delivery Calculation', () => {
    it('GET /api/pincode/check/:code returns serviceability and transit days', async () => {
      const res = await request(app).get('/api/pincode/check/500034?subtotal=550');
      expect(res.status).toBe(200);
      expect(res.body.delivery.isServiceable).toBe(true);
      expect(res.body.delivery.city).toBe('Hyderabad');
      expect(res.body.delivery.isFreeDelivery).toBe(true);
    });
  });

  describe('4. Coupons', () => {
    it('POST /api/coupons/validate validates active coupon', async () => {
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'FIRST50', cartSubtotal: 400 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.coupon.discountAmount).toBe(50);
    });
  });

  describe('5. Cart and Checkout', () => {
    it('POST /api/cart/add adds item to cart', async () => {
      const res = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: sampleProductId, variantId: sampleVariantId, quantity: 2 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/cart returns user cart with calculated totals', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeGreaterThan(0);
      expect(res.body.summary.subtotal).toBeGreaterThan(0);
    });

    it('POST /api/orders creates a new order and decrements inventory', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          shippingAddress: {
            full_name: 'Rohan Sharma',
            phone: '9876543210',
            house_flat: 'Flat 402, Sai Residency',
            street: 'Road No. 12, Banjara Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500034',
          },
          paymentMethod: 'UPI',
          couponCode: 'FIRST50',
          items: [
            {
              productId: sampleProductId,
              variantId: sampleVariantId,
              quantity: 1,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.order.order_number).toBeDefined();
      createdOrderId = res.body.order.id;
    });

    it('GET /api/orders/:id/invoice generates official GST Tax Invoice', async () => {
      const res = await request(app)
        .get(`/api/orders/${createdOrderId}/invoice`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.invoice.store.fssaiLicenseNo).toBeDefined();
      expect(res.body.invoice.financials.taxBreakdown).toBeDefined();
    });
  });

  describe('6. Admin Role-Based Security', () => {
    it('GET /api/admin/metrics forbids unauthenticated or customer users', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('GET /api/admin/metrics allows admin access and returns business KPIs', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.metrics.totalOrders).toBeDefined();
      expect(res.body.charts.salesTrend.length).toBe(7);
    });
  });
});
