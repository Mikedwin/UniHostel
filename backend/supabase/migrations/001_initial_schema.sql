-- UniHostel Database Schema for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'manager', 'admin')),
  phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT false,
  account_status VARCHAR(50) DEFAULT 'active',
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP,
  last_login TIMESTAMP,
  tos_accepted BOOLEAN DEFAULT false,
  tos_accepted_at TIMESTAMP,
  privacy_policy_accepted BOOLEAN DEFAULT false,
  privacy_policy_accepted_at TIMESTAMP,
  paystack_subaccount_code VARCHAR(100),
  payout_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Hostels table
CREATE TABLE hostels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  hostel_view_image TEXT,
  facilities TEXT[],
  is_available BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Room types
CREATE TABLE room_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total_capacity INTEGER NOT NULL,
  occupied_capacity INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  room_image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  room_type VARCHAR(100) NOT NULL,
  semester VARCHAR(50) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  hostel_fee DECIMAL(10, 2),
  admin_commission DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  payment_reference VARCHAR(255),
  access_code VARCHAR(50),
  access_code_issued_at TIMESTAMP,
  final_approved_at TIMESTAMP,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_hostels_manager ON hostels(manager_id);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_hostel ON applications(hostel_id);
