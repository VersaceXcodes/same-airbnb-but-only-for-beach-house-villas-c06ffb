-- ===================
-- TABLE CREATION
-- ===================

CREATE TABLE users (
    user_uid              VARCHAR(64) PRIMARY KEY,
    email                 VARCHAR(255) UNIQUE NOT NULL,
    password_hash         VARCHAR(255),
    user_type             VARCHAR(32) NOT NULL, -- 'guest', 'host', 'admin'
    is_email_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at            BIGINT NOT NULL,
    updated_at            BIGINT NOT NULL,
    is_deleted            BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE user_profiles (
    user_profile_uid      VARCHAR(64) PRIMARY KEY,
    user_uid              VARCHAR(64) UNIQUE NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    first_name            VARCHAR(64),
    last_name             VARCHAR(64),
    avatar_url            VARCHAR(512),
    phone_number          VARCHAR(32),
    address_line1         VARCHAR(128),
    address_line2         VARCHAR(128),
    city                  VARCHAR(64),
    state                 VARCHAR(64),
    country               VARCHAR(64),
    bio                   TEXT,
    payout_info_json      TEXT,
    created_at            BIGINT NOT NULL,
    updated_at            BIGINT NOT NULL
);

CREATE TABLE auth_providers (
    auth_provider_uid     VARCHAR(64) PRIMARY KEY,
    user_uid              VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    provider              VARCHAR(32) NOT NULL, -- 'email', 'google', 'facebook'
    provider_id           VARCHAR(128) NOT NULL,
    created_at            BIGINT NOT NULL
);

CREATE TABLE villas (
    villa_uid             VARCHAR(64) PRIMARY KEY,
    host_uid              VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    status                VARCHAR(32) NOT NULL, -- 'draft', 'pending', 'live', etc.
    name                  VARCHAR(255) NOT NULL,
    description           TEXT NOT NULL,
    street_address        VARCHAR(255) NOT NULL,
    city                  VARCHAR(64) NOT NULL,
    state                 VARCHAR(64) NOT NULL,
    country               VARCHAR(64) NOT NULL,
    latitude              DOUBLE PRECISION NOT NULL,
    longitude             DOUBLE PRECISION NOT NULL,
    beach_access_type     VARCHAR(64) NOT NULL,
    min_stay_nights       INT NOT NULL,
    max_stay_nights       INT NOT NULL,
    guest_count           INT NOT NULL,
    bedrooms              INT NOT NULL,
    bathrooms             INT NOT NULL,
    nightly_rate          REAL NOT NULL,
    cleaning_fee          REAL NOT NULL,
    instant_book          BOOLEAN NOT NULL DEFAULT FALSE,
    house_rules           TEXT,
    amenities             TEXT,
    policies_json         TEXT,
    approval_comment      TEXT,
    created_at            BIGINT NOT NULL,
    updated_at            BIGINT NOT NULL,
    is_deleted            BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE villa_amenities (
    amenity_uid           VARCHAR(64) PRIMARY KEY,
    name                  VARCHAR(64) UNIQUE NOT NULL,
    icon_url              VARCHAR(512),
    sort_order            INT
);

CREATE TABLE villa_amenity_map (
    villa_amenity_map_uid VARCHAR(64) PRIMARY KEY,
    villa_uid             VARCHAR(64) NOT NULL REFERENCES villas(villa_uid) ON DELETE CASCADE,
    amenity_uid           VARCHAR(64) NOT NULL REFERENCES villa_amenities(amenity_uid) ON DELETE CASCADE
);

CREATE TABLE villa_photos (
    villa_photo_uid       VARCHAR(64) PRIMARY KEY,
    villa_uid             VARCHAR(64) NOT NULL REFERENCES villas(villa_uid) ON DELETE CASCADE,
    url                   VARCHAR(512) NOT NULL,
    is_cover              BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order            INT NOT NULL,
    uploaded_at           BIGINT NOT NULL
);

CREATE TABLE villa_pricing_rules (
    villa_pricing_rule_uid VARCHAR(64) PRIMARY KEY,
    villa_uid              VARCHAR(64) NOT NULL REFERENCES villas(villa_uid) ON DELETE CASCADE,
    start_date             BIGINT NOT NULL,
    end_date               BIGINT NOT NULL,
    nightly_rate           REAL NOT NULL,
    notes                  TEXT
);

CREATE TABLE villa_calendars (
    villa_calendar_uid     VARCHAR(64) PRIMARY KEY,
    villa_uid              VARCHAR(64) NOT NULL REFERENCES villas(villa_uid) ON DELETE CASCADE,
    date                   BIGINT NOT NULL,
    is_available           BOOLEAN NOT NULL DEFAULT TRUE,
    source                 VARCHAR(32) NOT NULL,
    created_at             BIGINT NOT NULL,
    updated_at             BIGINT NOT NULL
);

CREATE TABLE villa_ical_syncs (
    villa_ical_sync_uid    VARCHAR(64) PRIMARY KEY,
    villa_uid              VARCHAR(64) NOT NULL REFERENCES villas(villa_uid) ON DELETE CASCADE,
    ical_url               VARCHAR(512) NOT NULL,
    last_sync_at           BIGINT
);

CREATE TABLE bookings (
    booking_uid            VARCHAR(64) PRIMARY KEY,
    villa_uid              VARCHAR(64) NOT NULL REFERENCES villas(villa_uid) ON DELETE CASCADE,
    guest_uid              VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    host_uid               VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    check_in               BIGINT NOT NULL,
    check_out              BIGINT NOT NULL,
    guest_count            INT NOT NULL,
    status                 VARCHAR(32) NOT NULL,
    instant_book           BOOLEAN NOT NULL,
    price_nightly          REAL NOT NULL,
    cleaning_fee           REAL NOT NULL,
    service_fee            REAL NOT NULL,
    tax_fee                REAL NOT NULL,
    payout_amount          REAL NOT NULL,
    currency               VARCHAR(16) NOT NULL,
    created_at             BIGINT NOT NULL,
    updated_at             BIGINT NOT NULL,
    cancelled_at           BIGINT,
    cancellation_reason    TEXT,
    review_prompted        BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE booking_payments (
    booking_payment_uid    VARCHAR(64) PRIMARY KEY,
    booking_uid            VARCHAR(64) NOT NULL REFERENCES bookings(booking_uid) ON DELETE CASCADE,
    payment_method         VARCHAR(32) NOT NULL,
    payment_status         VARCHAR(32) NOT NULL,
    total_amount           REAL NOT NULL,
    transaction_id         VARCHAR(128),
    paid_at                BIGINT,
    refunded_at            BIGINT
);

CREATE TABLE booking_guests (
    booking_guest_uid      VARCHAR(64) PRIMARY KEY,
    booking_uid            VARCHAR(64) NOT NULL REFERENCES bookings(booking_uid) ON DELETE CASCADE,
    user_uid               VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    is_primary             BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE villa_reviews (
    villa_review_uid       VARCHAR(64) PRIMARY KEY,
    villa_uid              VARCHAR(64) NOT NULL REFERENCES villas(villa_uid) ON DELETE CASCADE,
    booking_uid            VARCHAR(64) NOT NULL REFERENCES bookings(booking_uid) ON DELETE CASCADE,
    guest_uid              VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    host_uid               VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    rating                 INT NOT NULL CHECK(rating BETWEEN 1 AND 5),
    text                   TEXT,
    photo_url              VARCHAR(512),
    created_at             BIGINT NOT NULL,
    is_deleted             BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE host_reviews (
    host_review_uid        VARCHAR(64) PRIMARY KEY,
    booking_uid            VARCHAR(64) NOT NULL REFERENCES bookings(booking_uid) ON DELETE CASCADE,
    host_uid               VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    guest_uid              VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    rating                 INT NOT NULL CHECK(rating BETWEEN 1 AND 5),
    text                   TEXT,
    created_at             BIGINT NOT NULL,
    is_deleted             BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE messages (
    message_uid            VARCHAR(64) PRIMARY KEY,
    booking_uid            VARCHAR(64) REFERENCES bookings(booking_uid) ON DELETE SET NULL,
    villa_uid              VARCHAR(64) REFERENCES villas(villa_uid) ON DELETE SET NULL,
    sender_uid             VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    receiver_uid           VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    body                   TEXT NOT NULL,
    sent_at                BIGINT NOT NULL,
    is_read                BOOLEAN NOT NULL DEFAULT FALSE,
    thread_uid             VARCHAR(64)
);

CREATE TABLE payouts (
    payout_uid             VARCHAR(64) PRIMARY KEY,
    host_uid               VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    booking_uid            VARCHAR(64) NOT NULL REFERENCES bookings(booking_uid) ON DELETE CASCADE,
    amount                 REAL NOT NULL,
    payout_status          VARCHAR(32) NOT NULL,
    transfer_method        VARCHAR(32) NOT NULL,
    transfer_reference     VARCHAR(128),
    transfer_date          BIGINT
);

CREATE TABLE admin_listing_reviews (
    admin_listing_review_uid VARCHAR(64) PRIMARY KEY,
    villa_uid                VARCHAR(64) NOT NULL REFERENCES villas(villa_uid) ON DELETE CASCADE,
    admin_uid                VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    action                   VARCHAR(32) NOT NULL, -- 'approved', 'rejected'
    comment                  TEXT,
    reviewed_at              BIGINT NOT NULL
);

CREATE TABLE reports (
    report_uid             VARCHAR(64) PRIMARY KEY,
    reporter_uid           VARCHAR(64) NOT NULL REFERENCES users(user_uid) ON DELETE CASCADE,
    reported_type          VARCHAR(32) NOT NULL, -- 'user', 'villa', 'review'
    reported_uid           VARCHAR(64) NOT NULL,
    reason                 TEXT NOT NULL,
    created_at             BIGINT NOT NULL,
    resolved_at            BIGINT,
    resolved_comment       TEXT
);

CREATE TABLE app_configs (
    app_config_uid         VARCHAR(64) PRIMARY KEY,
    config_type            VARCHAR(32) NOT NULL,
    key                    VARCHAR(128) NOT NULL,
    value_json             TEXT NOT NULL
);

-- ===================
-- SEED DATA
-- ===================
-- Users (3: guest, host, admin)
INSERT INTO users (user_uid, email, password_hash, user_type, is_email_verified, created_at, updated_at, is_deleted) VALUES
('usr_guest1', 'alice@example.com', 'hashed_pw1', 'guest', TRUE, 1718390400, 1718390400, FALSE),
('usr_host1',  'bob@example.com',   'hashed_pw2', 'host', TRUE, 1718390400, 1718390400, FALSE),
('usr_admin1', 'admin@example.com', 'hashed_pw3', 'admin', TRUE, 1718390400, 1718390400, FALSE);

INSERT INTO user_profiles (user_profile_uid, user_uid, first_name, last_name, avatar_url, phone_number, address_line1, address_line2, city, state, country, bio, payout_info_json, created_at, updated_at) VALUES
('profile_guest1', 'usr_guest1', 'Alice', 'Wonderland', 'https://picsum.photos/seed/alice/128/128', '111-222-3333', '123 Ocean Ave', NULL, 'Malibu', 'CA', 'US', NULL, NULL, 1718390400, 1718390400),
('profile_host1', 'usr_host1', 'Bob', 'Smith', 'https://picsum.photos/seed/bob/128/128', '222-333-4444', '789 Beachfront Dr', NULL, 'Miami', 'FL', 'US', 'Lifelong host. Love surfing.', '{"stripe_account":"host_stripe_123"}', 1718390400, 1718390400),
('profile_admin1', 'usr_admin1', 'Adelaide', 'Martin', 'https://picsum.photos/seed/admin/128/128', '333-444-5555', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1718390400, 1718390400);

INSERT INTO auth_providers (auth_provider_uid, user_uid, provider, provider_id, created_at) VALUES
('auth_guest1_email', 'usr_guest1', 'email', 'alice@example.com', 1718390400),
('auth_host1_email', 'usr_host1', 'email', 'bob@example.com', 1718390400),
('auth_admin1_email', 'usr_admin1', 'email', 'admin@example.com', 1718390400);

-- Villa amenities
INSERT INTO villa_amenities (amenity_uid, name, icon_url, sort_order) VALUES
('amen_wifi', 'WiFi', 'https://picsum.photos/seed/wifi/64/64', 1),
('amen_pool', 'Pool', 'https://picsum.photos/seed/pool/64/64', 2),
('amen_aircon', 'Air Conditioning', 'https://picsum.photos/seed/aircon/64/64', 3),
('amen_kitchen', 'Full Kitchen', 'https://picsum.photos/seed/kitchen/64/64', 4),
('amen_parking', 'Private Parking', 'https://picsum.photos/seed/parking/64/64', 5);

-- Villas (2)
INSERT INTO villas (villa_uid, host_uid, status, name, description, street_address, city, state, country, latitude, longitude, beach_access_type, min_stay_nights, max_stay_nights, guest_count, bedrooms, bathrooms, nightly_rate, cleaning_fee, instant_book, house_rules, amenities, policies_json, approval_comment, created_at, updated_at, is_deleted)
VALUES
('villa_beach1', 'usr_host1', 'live', 'Sunset Beach Escape', 'A beautiful villa right on the sands with amazing sunsets.', '123 Ocean Ave', 'Malibu', 'CA', 'US', 34.0259, -118.7798, 'direct', 2, 10, 6, 3, 2, 850.00, 120.00, TRUE, 'No parties. Pets on approval.', NULL, '{"cancellation":"flexible"}', NULL, 1718390400, 1718390400, FALSE),
('villa_beach2', 'usr_host1', 'live', 'Seashell Serenity', 'Private villa steps from the beach, with tranquil views.', '789 Beachfront Dr', 'Miami', 'FL', 'US', 25.7907, -80.1300, 'immediate private', 3, 14, 8, 4, 3, 1100.00, 180.00, FALSE, 'No smoking. Respect quiet hours (10pm-8am).', NULL, '{"cancellation":"moderate"}', NULL, 1718390400, 1718390400, FALSE);

-- Villa main photos and gallery
INSERT INTO villa_photos (villa_photo_uid, villa_uid, url, is_cover, sort_order, uploaded_at) VALUES
('photo_villa1_cover', 'villa_beach1', 'https://picsum.photos/seed/villa1cover/800/600', TRUE, 1, 1718390401),
('photo_villa1_2', 'villa_beach1', 'https://picsum.photos/seed/villa1b/800/600', FALSE, 2, 1718390402),
('photo_villa1_3', 'villa_beach1', 'https://picsum.photos/seed/villa1c/800/600', FALSE, 3, 1718390403),
('photo_villa2_cover', 'villa_beach2', 'https://picsum.photos/seed/villa2cover/800/600', TRUE, 1, 1718390404),
('photo_villa2_2', 'villa_beach2', 'https://picsum.photos/seed/villa2a/800/600', FALSE, 2, 1718390405);

-- Villa amenities mapping
INSERT INTO villa_amenity_map (villa_amenity_map_uid, villa_uid, amenity_uid) VALUES
('vamap_1', 'villa_beach1', 'amen_wifi'),
('vamap_2', 'villa_beach1', 'amen_pool'),
('vamap_3', 'villa_beach1', 'amen_kitchen'),
('vamap_4', 'villa_beach2', 'amen_wifi'),
('vamap_5', 'villa_beach2', 'amen_pool'),
('vamap_6', 'villa_beach2', 'amen_aircon'),
('vamap_7', 'villa_beach2', 'amen_parking');

-- Villa pricing rules
INSERT INTO villa_pricing_rules (villa_pricing_rule_uid, villa_uid, start_date, end_date, nightly_rate, notes) VALUES
('vpr_1', 'villa_beach1', 1720000000, 1720518400, 950.00, 'Peak summer rate'),
('vpr_2', 'villa_beach2', 1720600000, 1721200000, 1200.00, 'Holiday week rate');

-- Villa calendars (few days blocked & open for villa1, villa2)
INSERT INTO villa_calendars (villa_calendar_uid, villa_uid, date, is_available, source, created_at, updated_at) VALUES
('calendar_1', 'villa_beach1', 1720051200, TRUE, 'manual', 1718390500, 1718390500),    -- Available
('calendar_2', 'villa_beach1', 1720137600, FALSE, 'manual', 1718390501, 1718390501),   -- Blocked
('calendar_3', 'villa_beach2', 1720051200, TRUE, 'manual', 1718390502, 1718390502),
('calendar_4', 'villa_beach2', 1720137600, TRUE, 'ical-sync', 1718390503, 1718390503);

-- Villa iCal syncs
INSERT INTO villa_ical_syncs (villa_ical_sync_uid, villa_uid, ical_url, last_sync_at) VALUES
('ical_villa1', 'villa_beach1', 'https://calendar.airbnb.com/villa1.ics', 1718390600),
('ical_villa2', 'villa_beach2', 'https://calendar.homeaway.com/villa2.ics', 1718390601);

-- Bookings (1 confirmed, 1 cancelled)
INSERT INTO bookings (booking_uid, villa_uid, guest_uid, host_uid, check_in, check_out, guest_count, status, instant_book, price_nightly, cleaning_fee, service_fee, tax_fee, payout_amount, currency, created_at, updated_at, cancelled_at, cancellation_reason, review_prompted)
VALUES
('bkng_1', 'villa_beach1', 'usr_guest1', 'usr_host1', 1720051200, 1720214000, 4, 'confirmed', TRUE, 950.00, 120.00, 100.00, 70.00, 850.00, 'USD', 1718390700, 1718390701, NULL, NULL, FALSE),
('bkng_2', 'villa_beach2', 'usr_guest1', 'usr_host1', 1720137600, 1720214000, 3, 'cancelled', FALSE, 1100.00, 180.00, 120.00, 85.00, 1000.00, 'USD', 1718390710, 1718390720, 1718390750, 'Personal reasons', FALSE);

-- Booking payments
INSERT INTO booking_payments (booking_payment_uid, booking_uid, payment_method, payment_status, total_amount, transaction_id, paid_at, refunded_at) VALUES
('pay_1', 'bkng_1', 'stripe', 'paid', 1240.00, 'stripe_tx_9001', 1718390730, NULL),
('pay_2', 'bkng_2', 'paypal', 'refunded', 1385.00, 'paypal_tx_1209', 1718390740, 1718390760);

-- Booking guests (primary + secondary guests for one booking)
INSERT INTO booking_guests (booking_guest_uid, booking_uid, user_uid, is_primary) VALUES
('bg_1', 'bkng_1', 'usr_guest1', TRUE);

-- Villa reviews (guest leaves review for host/villa)
INSERT INTO villa_reviews (villa_review_uid, villa_uid, booking_uid, guest_uid, host_uid, rating, text, photo_url, created_at, is_deleted) VALUES
('vrev_1', 'villa_beach1', 'bkng_1', 'usr_guest1', 'usr_host1', 5, 'Incredible stay—super clean, on the beach and perfect for our family.', 'https://picsum.photos/seed/vrev1/400/300', 1718390800, FALSE);

-- Host reviews (host leaves review for guest)
INSERT INTO host_reviews (host_review_uid, booking_uid, host_uid, guest_uid, rating, text, created_at, is_deleted) VALUES
('hostrev_1', 'bkng_1', 'usr_host1', 'usr_guest1', 5, 'Alice was a great guest, communicative and respectful.', 1718390900, FALSE);

-- Messages (inquiry and booking thread)
INSERT INTO messages (message_uid, booking_uid, villa_uid, sender_uid, receiver_uid, body, sent_at, is_read, thread_uid) VALUES
('msg_1', NULL, 'villa_beach1', 'usr_guest1', 'usr_host1', 'Is the villa available in early July?', 1718391000, FALSE, 'thread1'),
('msg_2', 'bkng_1', NULL, 'usr_guest1', 'usr_host1', 'Hi! Excited for our trip. Any beach restaurants nearby?', 1718391010, FALSE, 'thread2'),
('msg_3', 'bkng_1', NULL, 'usr_host1', 'usr_guest1', 'Yes, many great options within 5 min walk. Details in our welcome book.', 1718391020, FALSE, 'thread2');

-- Payouts
INSERT INTO payouts (payout_uid, host_uid, booking_uid, amount, payout_status, transfer_method, transfer_reference, transfer_date) VALUES
('payout_1', 'usr_host1', 'bkng_1', 850.00, 'paid', 'stripe', 'stripe_payout_1002', 1718391030),
('payout_2', 'usr_host1', 'bkng_2', 0.00, 'failed', 'paypal', 'paypal_payout_2001', NULL);

-- Admin listing reviews
INSERT INTO admin_listing_reviews (admin_listing_review_uid, villa_uid, admin_uid, action, comment, reviewed_at) VALUES
('admrev_1', 'villa_beach1', 'usr_admin1', 'approved', 'Meets all requirements and documentation verified.', 1718391040),
('admrev_2', 'villa_beach2', 'usr_admin1', 'approved', 'Great photos, access check verified.', 1718391050);

-- Reports (user, villa, review complaints)
INSERT INTO reports (report_uid, reporter_uid, reported_type, reported_uid, reason, created_at, resolved_at, resolved_comment) VALUES
('rpt_1', 'usr_guest1', 'villa', 'villa_beach2', 'Listing missing pool as advertised.', 1718391060, NULL, NULL),
('rpt_2', 'usr_host1', 'user', 'usr_guest1', 'Guest broke the noise rules once.', 1718391070, NULL, NULL);

-- App configs (sample amenities and a cancellation policy config)
INSERT INTO app_configs (app_config_uid, config_type, key, value_json) VALUES
('cfg_amen_wifi', 'amenity', 'wifi', '{"display":"WiFi", "icon":"https://picsum.photos/seed/cfgwifi/64/64"}'),
('cfg_amen_pool', 'amenity', 'pool', '{"display":"Pool", "icon":"https://picsum.photos/seed/cfgpool/64/64"}'),
('cfg_cxl_flex', 'policy', 'cancellation_flexible', '{"display":"Flexible", "desc":"Full refund 1 day prior to arrival, except fees."}');

-- All done.