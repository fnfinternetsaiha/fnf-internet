export type UserRole = 'super_admin' | 'desk_manager' | 'technician' | 'accountant';

export interface StaffUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  assigned_veng?: string[];
  created_at: string;
}

export interface Customer {
  id: string; // e.g. 003FNF001
  name: string;
  phone: string;
  veng: string;
  address_detail: string;
  plan_id: string;
  monthly_charge: number;
  onu_mac?: string;
  photo_url?: string;
  aadhar_url?: string;
  status: 'active' | 'suspended' | 'expired';
  expiry_date: string;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  customer_id: string;
  customer_name?: string;
  amount: number;
  payment_method: 'gpay' | 'phonepe' | 'paytm' | 'cash' | 'bank_transfer';
  screenshot_url?: string;
  transaction_ref?: string;
  status: 'pending' | 'approved' | 'rejected';
  verified_by?: string;
  notes?: string;
  created_at: string;
}

export interface RechargeQueueItem {
  id: string;
  customer_id: string;
  payment_id: string;
  plan_id: string;
  amount: number;
  status: 'pending_recharge' | 'recharged' | 'failed';
  recharged_by?: string;
  recharged_at?: string;
  created_at: string;
}

export interface ComplaintTicket {
  id: string; // e.g. FNF-TICK-1001
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  veng: string;
  issue_type: 'los_red_light' | 'fiber_cut' | 'slow_speed' | 'router_issue' | 'other';
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  assigned_to?: string;
  resolution_note?: string;
  created_at: string;
  resolved_at?: string;
}

export interface CashbookEntry {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  reference_id?: string;
  created_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  created_at: string;
}
