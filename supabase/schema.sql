-- ============================================================================
-- FNF SAIHA INTERNET SYSTEM - COMPLETE DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STAFF USERS TABLE
CREATE TABLE IF NOT EXISTS public.staff_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'desk_manager', 'technician', 'accountant')),
    is_active BOOLEAN DEFAULT true,
    assigned_veng TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE (Format: 003FNF001)
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY, -- e.g. 003FNF001
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    veng TEXT NOT NULL,
    address_detail TEXT,
    plan_id TEXT NOT NULL,
    monthly_charge NUMERIC NOT NULL,
    onu_mac TEXT,
    photo_url TEXT,
    aadhar_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'expired')) DEFAULT 'active',
    expiry_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PAYMENTS RECORD TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY, -- e.g. PAY-1081
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('gpay', 'phonepe', 'paytm', 'cash', 'bank_transfer')),
    screenshot_url TEXT,
    transaction_ref TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    verified_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RECHARGE QUEUE TABLE
CREATE TABLE IF NOT EXISTS public.recharge_queue (
    id TEXT PRIMARY KEY, -- e.g. RQ-301
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    payment_id TEXT REFERENCES public.payments(id) ON DELETE SET NULL,
    plan_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending_recharge', 'recharged', 'failed')) DEFAULT 'pending_recharge',
    recharged_by TEXT,
    recharged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMPLAINT & LOS TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.complaint_tickets (
    id TEXT PRIMARY KEY, -- e.g. FNF-TICK-1021
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    veng TEXT NOT NULL,
    issue_type TEXT NOT NULL CHECK (issue_type IN ('los_red_light', 'fiber_cut', 'slow_speed', 'router_issue', 'other')),
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved')) DEFAULT 'open',
    assigned_to TEXT,
    resolution_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 6. CASHBOOK ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.cashbook_entries (
    id TEXT PRIMARY KEY, -- e.g. CB-501
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT NOT NULL,
    reference_id TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INITIAL SAIHA SEED DATA
-- ============================================================================

INSERT INTO public.staff_users (id, name, phone, role, is_active, assigned_veng) VALUES
('STF-01', 'K. Lalrammawia', '9862001122', 'super_admin', true, NULL),
('STF-02', 'Beiratha Chozah', '9436159870', 'desk_manager', true, NULL),
('STF-03', 'Lalmuanpuia Hlychho', '8974521190', 'technician', true, ARRAY['College Veng', 'Meisatla', 'Council Veng']),
('STF-04', 'V.L. Hruaia', '9862309112', 'technician', true, ARRAY['New Saiha East', 'New Saiha West', 'Siahatla I']),
('STF-05', 'C. Zairemmawia', '9862998877', 'accountant', true, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.customers (id, name, phone, veng, address_detail, plan_id, monthly_charge, onu_mac, status, expiry_date) VALUES
('003FNF001', 'Lalmuanpuia', '9862551234', 'College Veng', 'Near Govt College Gate', 'fnf-50', 699, '48:57:02:AA:11:01', 'active', '2026-12-15'),
('003FNF002', 'K. Beiratha', '9436159870', 'New Saiha West', 'Opp. Bazar Complex', 'fnf-100', 999, '48:57:02:AA:11:02', 'active', '2026-11-25'),
('003FNF003', 'C. Zakhei', '8974523101', 'Meisatla', 'Near Presbyterian Church', 'fnf-30', 499, '48:57:02:AA:11:03', 'expired', '2026-11-18'),
('003FNF004', 'David Hlychho', '9862309112', 'Siahatla I', 'Section B, H/No 45', 'fnf-100', 999, '48:57:02:AA:11:04', 'active', '2026-12-28')
ON CONFLICT (id) DO NOTHING;
