CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    phone VARCHAR(32),
    vehicle_brand VARCHAR(80),
    vehicle_model VARCHAR(80),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT users_role_check CHECK (role IN ('USER', 'DRIVER', 'ADMIN'))
);

CREATE TABLE rides (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id),
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    available_seats INTEGER NOT NULL CHECK (available_seats >= 0 AND available_seats <= total_seats),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT rides_status_check CHECK (status IN ('OPEN', 'CANCELLED', 'COMPLETED'))
);
CREATE INDEX rides_search_idx ON rides (status, departure_time, source, destination);
CREATE INDEX rides_owner_idx ON rides (owner_id, created_at DESC);

CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    ride_id UUID NOT NULL REFERENCES rides(id),
    user_id UUID NOT NULL REFERENCES users(id),
    seats INTEGER NOT NULL CHECK (seats > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT bookings_status_check CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    CONSTRAINT bookings_ride_user_unique UNIQUE (ride_id, user_id)
);

CREATE TABLE travel_intents (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT intents_status_check CHECK (status IN ('OPEN', 'MATCHED', 'EXPIRED'))
);
CREATE INDEX intents_match_idx ON travel_intents (status, departure_time, source, destination);
