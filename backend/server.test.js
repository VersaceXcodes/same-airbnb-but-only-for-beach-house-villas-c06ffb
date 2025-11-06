// server.test.ts
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, pool } from './server.ts';

// Some helpers for test JWT
const SECRET = process.env.JWT_SECRET || 'testsecret';

function makeJWT(payload, expiresIn = '1h') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

const guestToken = makeJWT({ user_uid: 'usr_guest1', user_type: 'guest' });
const hostToken = makeJWT({ user_uid: 'usr_host1', user_type: 'host' });
const adminToken = makeJWT({ user_uid: 'usr_admin1', user_type: 'admin' });

// Reset DB to initial state between runs using transactions
beforeAll(async () => {
  // Consider using a separate test DB in CI
  await pool.query('BEGIN;');
});
afterAll(async () => {
  await pool.query('ROLLBACK;');
  await pool.end();
});

describe('Validation: Zod Schemas', () => {
  const { createUserInputSchema, createVillaInputSchema } = require('./zodschemas.ts');

  it('should validate a correct user input', () => {
    expect(
      createUserInputSchema.parse({
        email: 'test@example.com',
        password_hash: 'test123',
        user_type: 'guest',
      })
    ).toBeDefined();
  });

  it('should reject invalid emails', () => {
    expect(() =>
      createUserInputSchema.parse({
        email: 'bademail',
        password_hash: 'pw',
        user_type: 'host',
      })
    ).toThrow();
  });

  it('should reject villa with empty name/description', () => {
    expect(() =>
      createVillaInputSchema.parse({
        host_uid: 'usr_host1',
        status: 'draft',
        name: '',
        description: '',
        street_address: '1 Fake Beach',
        city: 'Nice',
        state: 'CA',
        country: 'US',
        latitude: 0,
        longitude: 0,
        beach_access_type: 'direct',
        min_stay_nights: 1,
        max_stay_nights: 3,
        guest_count: 2,
        bedrooms: 1,
        bathrooms: 1,
        nightly_rate: 0,
        cleaning_fee: 0,
      })
    ).toThrow();
  });
});

describe('Authentication Flows', () => {
  it('should reject unauthenticated access to GET /users/me', async () => {
    const res = await request(app).get('/users/me');
    expect(res.status).toBe(401);
  });

  it('should return guest user profile for valid JWT', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${guestToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user_uid).toBe('usr_guest1');
    expect(res.body.email).toEqual('alice@example.com');
  });

  it('should fail login with invalid credentials', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'alice@example.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should login with correct credentials', async () => {
    // Assuming passwords aren't actually hashed in test DB, or mock logic
    const res = await request(app).post('/auth/login').send({
      email: 'alice@example.com',
      password: 'hashed_pw1', // Use cleartext 'hashed_pw1' to match seed
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.profile).toBeDefined();
  });

  it('should sign up a new guest', async () => {
    const res = await request(app).post('/auth/signup').send({
      email: 'bobguest2@example.com',
      password: 'mypass12',
      user_type: 'guest',
      first_name: 'Bob',
      last_name: 'Guest2',
    });
    expect(res.status).toBe(201);
    expect(res.body.user_uid).toBeDefined();
    expect(res.body.user_type).toBe('guest');
    expect(res.body.token).toBeDefined();
  });

  it('should require email verification before booking', async () => {
    // Simulate a user who is not verified
    const tempToken = makeJWT({
      user_uid: 'usr_unverified',
      user_type: 'guest',
      is_email_verified: false,
    });
    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${tempToken}`)
      .send({
        villa_uid: 'villa_beach1',
        check_in: 1720051200,
        check_out: 1720214000,
        guest_count: 2,
      });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Email verification required/i);
  });
});

describe('Villa Listing Flows', () => {
  it('should list live villas with public fields', async () => {
    const res = await request(app).get('/villas?status=live');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('villa_uid');
    expect(res.body[0]).not.toHaveProperty('is_deleted', true);
  });

  it('should search by city and amenities', async () => {
    const res = await request(app).get(
      '/villas?city=Miami&amenities=WiFi,Air%20Conditioning'
    );
    expect(res.status).toBe(200);
    expect(res.body.find((v) => v.city === 'Miami')).toBeTruthy();
  });

  it('should fetch villa details including amenities and photos', async () => {
    const res = await request(app).get('/villas/villa_beach1');
    expect(res.status).toBe(200);
    expect(res.body.villa_uid).toBe('villa_beach1');
    expect(res.body).toHaveProperty('amenities');
    expect(res.body.photos.length).toBeGreaterThan(0);
    expect(res.body.host).toBeDefined();
  });

  it('should reject host trying to update another\'s villa', async () => {
    // Attempt to update as a different host
    const notHostToken = makeJWT({ user_uid: 'usr_guest1', user_type: 'guest' });
    const res = await request(app)
      .patch('/villas/villa_beach1')
      .set('Authorization', `Bearer ${notHostToken}`)
      .send({ name: 'Not My Villa' });
    expect(res.status).toBe(403);
  });

  it('should allow host to update their own draft villa', async () => {
    // Create draft first as host
    const res1 = await request(app)
      .post('/villas')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        host_uid: 'usr_host1',
        status: 'draft',
        name: 'Test Draft',
        description: 'Under the palm trees.',
        street_address: '1 Palm Tree Lane',
        city: 'Key West',
        state: 'FL',
        country: 'US',
        latitude: 25.0,
        longitude: -80.0,
        beach_access_type: 'direct',
        min_stay_nights: 1,
        max_stay_nights: 10,
        guest_count: 3,
        bedrooms: 1,
        bathrooms: 1,
        nightly_rate: 300,
        cleaning_fee: 50,
      });
    expect(res1.status).toBe(201);
    const newVillaUid = res1.body.villa_uid;
    const res2 = await request(app)
      .patch(`/villas/${newVillaUid}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        description: 'Just steps to the sand!',
      });
    expect(res2.status).toBe(200);
    expect(res2.body.description).toMatch(/steps to the sand/i);
  });

  it('should soft delete villa', async () => {
    const draftRes = await request(app)
      .post('/villas')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        host_uid: 'usr_host1',
        status: 'draft',
        name: 'To Be Deleted',
        description: 'Temp',
        street_address: '2 Gone Lane',
        city: 'Nowhere',
        state: 'FL',
        country: 'US',
        latitude: 20.0,
        longitude: -79.0,
        beach_access_type: 'none',
        min_stay_nights: 1,
        max_stay_nights: 3,
        guest_count: 2,
        bedrooms: 1,
        bathrooms: 1,
        nightly_rate: 0,
        cleaning_fee: 0,
      });
    expect(draftRes.status).toBe(201);
    const villaUid = draftRes.body.villa_uid;
    const delRes = await request(app)
      .delete(`/villas/${villaUid}`)
      .set('Authorization', `Bearer ${hostToken}`);
    expect(delRes.status).toBe(204);
    // Try fetch
    const getRes = await request(app).get(`/villas/${villaUid}`);
    expect(getRes.status).toBe(404);
  });

  it('should restrict villa creation to hosts only', async () => {
    const res = await request(app)
      .post('/villas')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        host_uid: 'usr_guest1',
        status: 'draft',
        name: 'Guest Should Fail',
        description: 'Not allowed',
        street_address: '3 Some St',
        city: 'Malibu',
        state: 'CA',
        country: 'US',
        latitude: 30.0,
        longitude: -119.0,
        beach_access_type: 'direct',
        min_stay_nights: 1,
        max_stay_nights: 3,
        guest_count: 2,
        bedrooms: 1,
        bathrooms: 1,
        nightly_rate: 0,
        cleaning_fee: 0,
      });
    expect(res.status).toBe(403);
  });
});

describe('Booking Flows', () => {
  it('should reject booking for non-live villa', async () => {
    // Create a draft villa as host
    const res1 = await request(app)
      .post('/villas')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        host_uid: 'usr_host1',
        status: 'draft',
        name: 'Not Live Yet',
        description: 'Should not bookable.',
        street_address: 'Nope',
        city: 'None',
        state: 'FL',
        country: 'US',
        latitude: 0,
        longitude: 0,
        beach_access_type: 'none',
        min_stay_nights: 1,
        max_stay_nights: 2,
        guest_count: 1,
        bedrooms: 1,
        bathrooms: 1,
        nightly_rate: 99,
        cleaning_fee: 0,
      });
    const draftVillaUid = res1.body.villa_uid;
    const res2 = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        villa_uid: draftVillaUid,
        check_in: 1730000000,
        check_out: 1730086400,
        guest_count: 2,
      });
    expect(res2.status).toBe(400);
    expect(res2.body.error).toMatch(/Villa is not available/i);
  });

  it('should block booking for unavailable dates', async () => {
    // For villa_beach1, date 1720137600 is blocked in seed data
    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        villa_uid: 'villa_beach1',
        check_in: 1720137600,
        check_out: 1720214000,
        guest_count: 2,
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/unavailable/i);
  });

  it('should create a booking for available dates', async () => {
    // Use villa_beach1 available date 1720051200 (see seed)
    const res = await request(app)
      .post('/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        villa_uid: 'villa_beach1',
        check_in: 1720051200,
        check_out: 1720051200 + 86400,
        guest_count: 2,
      });
    expect([201, 200]).toContain(res.status);
    expect(res.body.booking_uid).toBeDefined();
    expect(res.body.status).toMatch(/pending|confirmed/);
  });

  it('should only allow booking approval by host', async () => {
    // Try as guest (should fail)
    const bookingUid = 'bkng_1'; // from seed
    const res1 = await request(app)
      .post(`/bookings/${bookingUid}/approve`)
      .set('Authorization', `Bearer ${guestToken}`);
    expect(res1.status).toBe(403);

    // Try as host (should succeed or report already confirmed)
    const res2 = await request(app)
      .post(`/bookings/${bookingUid}/approve`)
      .set('Authorization', `Bearer ${hostToken}`);
    expect([200, 400]).toContain(res2.status); // 400 if already confirmed in seed
  });

  it('should process a payment (mocked external API)', async () => {
    // Mock external stripe/paypal call
    jest.spyOn(require('./payments'), 'charge').mockResolvedValue({
      status: 'succeeded',
      id: 'test_txn_123',
    });
    const bookingUid = 'bkng_1'; // from seed, status should be confirmed
    const res = await request(app)
      .post(`/bookings/${bookingUid}/pay`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ payment_method: 'stripe', token: 'fake_token' });
    expect([200, 201]).toContain(res.status);
    expect(res.body.payment_status).toBe('paid');
    expect(res.body.transaction_id).toBe('test_txn_123');
  });

  it('should allow guests to view their bookings', async () => {
    const res = await request(app)
      .get('/bookings?guest_uid=usr_guest1')
      .set('Authorization', `Bearer ${guestToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body[0].guest_uid).toBe('usr_guest1');
  });
});

describe('Permissions, Error Handling, and Edge Cases', () => {
  it('should block another user from updating someone else’s booking', async () => {
    // Try as unrelated host
    const wrongHostToken = makeJWT({
      user_uid: 'usr_admin1',
      user_type: 'admin',
    });
    const res = await request(app)
      .patch('/bookings/bkng_1')
      .set('Authorization', `Bearer ${wrongHostToken}`)
      .send({ status: 'cancelled' });
    expect(res.status).toBe(403);
  });

  it('should reject malformed payloads with 400', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({
        email: 'not-an-email',
        user_type: 'guest',
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid input/i);
  });
});

describe('Messaging and Reviews', () => {
  it('should allow guest to send message to host', async () => {
    const res = await request(app)
      .post('/messages')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        villa_uid: 'villa_beach1',
        sender_uid: 'usr_guest1',
        receiver_uid: 'usr_host1',
        body: 'Test inquiry, is there a BBQ grill?',
        sent_at: Date.now(),
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.body).toMatch(/BBQ grill/);
  });

  it('should reply in a message thread', async () => {
    const threadUid = 'thread2';
    const res = await request(app)
      .post('/messages')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        booking_uid: 'bkng_1',
        sender_uid: 'usr_host1',
        receiver_uid: 'usr_guest1',
        body: 'Yes, the BBQ is new for this season.',
        thread_uid: threadUid,
        sent_at: Date.now(),
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.thread_uid).toBe(threadUid);
  });

  it('should mark messages as read', async () => {
    const unreadRes = await request(app)
      .patch('/messages/msg_1/read')
      .set('Authorization', `Bearer ${hostToken}`);
    expect(unreadRes.status).toBe(200);
  });

  it('should allow guests to leave villa review after stay', async () => {
    const res = await request(app)
      .post('/villa-reviews')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        villa_uid: 'villa_beach1',
        booking_uid: 'bkng_1',
        guest_uid: 'usr_guest1',
        host_uid: 'usr_host1',
        rating: 5,
        text: 'Amazing',
        photo_url: null,
      });
    // Should be rejected if a review already exists for this booking/user
    if (res.status === 400) {
      expect(res.body.error).toMatch(/already left a review/i);
    } else {
      expect(res.status).toBe(201);
      expect(res.body.rating).toBe(5);
    }
  });

  it('should allow host to review guest after checkout', async () => {
    const res = await request(app)
      .post('/host-reviews')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        booking_uid: 'bkng_1',
        host_uid: 'usr_host1',
        guest_uid: 'usr_guest1',
        rating: 5,
        text: 'Great guest',
      });
    // Should be 400 if already reviewed, or 201 if new allowed
    if (res.status === 400) {
      expect(res.body.error).toMatch(/already/i);
    } else {
      expect(res.status).toBe(201);
      expect(res.body.rating).toBe(5);
    }
  });
});

describe('Admin Endpoints', () => {
  it('should allow admin to list pending villas', async () => {
    // Set a villa to pending
    const res1 = await request(app)
      .post('/villas')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        host_uid: 'usr_host1',
        status: 'pending',
        name: 'Needs Admin Review',
        description: 'New sand view',
        street_address: '12 Ocean',
        city: 'Santa Monica',
        state: 'CA',
        country: 'US',
        latitude: 34.01,
        longitude: -118.50,
        beach_access_type: 'direct',
        min_stay_nights: 2,
        max_stay_nights: 7,
        guest_count: 6,
        bedrooms: 3,
        bathrooms: 2,
        nightly_rate: 950,
        cleaning_fee: 140,
      });
    expect(res1.status).toBe(201);
    // Now list for admin
    const res = await request(app)
      .get('/admin/villa-listings?status=pending')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(
      res.body.find(
        (v) => v.status === 'pending' && v.name === 'Needs Admin Review'
      )
    ).toBeTruthy();
  });

  it('should allow admin to approve/reject listing', async () => {
    // Find a pending villa from previous test
    const res = await request(app)
      .get('/admin/villa-listings?status=pending')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const pendingVilla = res.body.find((v) => v.status === 'pending');
    expect(pendingVilla).toBeDefined();
    // Approve it
    const approveRes = await request(app)
      .post(`/admin/villa-listings/${pendingVilla.villa_uid}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'approved', comment: 'Looks beach legit!' });
    expect([200, 201]).toContain(approveRes.status);

    // Try rejecting (should work if requesting on a fresh pending)
    // Skipped here for brevity
  });

  it('should restrict admin endpoints to admins only', async () => {
    const res = await request(app)
      .get('/admin/villa-listings?status=pending')
      .set('Authorization', `Bearer ${hostToken}`); // not admin!
    expect(res.status).toBe(403);
  });

  it('should resolve reports', async () => {
    // Get a report
    const res = await request(app)
      .get('/admin/reports')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const report = res.body[0];
    // Mark as resolved
    const res2 = await request(app)
      .patch(`/admin/reports/${report.report_uid}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ resolved_comment: 'Issue resolved.' });
    expect(res2.status).toBe(200);
  });
});

describe('General API & Configs', () => {
  it('should list global villa amenities', async () => {
    const res = await request(app).get('/villa-amenities');
    expect(res.status).toBe(200);
    expect(res.body.find((amen) => amen.name === 'WiFi')).toBeTruthy();
  });

  it('should fetch app config for amenities', async () => {
    const res = await request(app).get('/app-configs?config_type=amenity');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.some((cfg) => cfg.key === 'wifi')).toBeTruthy();
  });
});