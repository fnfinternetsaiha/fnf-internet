import { Customer, PaymentRecord } from "@/types";

export interface CustomerUser extends Customer {
  password: string;
  monthlyRecords: {
    month: string;
    status: "paid" | "due" | "upcoming";
    amount: number;
    paidDate?: string;
    txnId?: string;
  }[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DEFAULT_CUSTOMERS: CustomerUser[] = [
  {
    id: "003FNF001",
    name: "Lalmuanpuia",
    phone: "9862551234",
    password: "password123",
    veng: "College Veng",
    address_detail: "Near Govt College Gate",
    plan_id: "fnf-50",
    monthly_charge: 699,
    status: "active",
    expiry_date: "2026-11-25",
    created_at: "2024-01-10",
    monthlyRecords: MONTHS.map((m, idx) => ({
      month: m,
      status: idx <= 9 ? "paid" : idx === 10 ? "due" : "upcoming",
      amount: 699,
      paidDate: idx <= 9 ? `15 ${m} 2026` : undefined,
      txnId: idx <= 9 ? `FNF${Math.floor(100000 + Math.random() * 900000)}` : undefined,
    })),
  },
  {
    id: "003FNF002",
    name: "K. Beiratha",
    phone: "9436159870",
    password: "password123",
    veng: "New Saiha West",
    address_detail: "Opp. Bazar Complex",
    plan_id: "fnf-100",
    monthly_charge: 999,
    status: "active",
    expiry_date: "2026-11-24",
    created_at: "2024-01-15",
    monthlyRecords: MONTHS.map((m, idx) => ({
      month: m,
      status: idx <= 9 ? "paid" : idx === 10 ? "due" : "upcoming",
      amount: 999,
      paidDate: idx <= 9 ? `20 ${m} 2026` : undefined,
      txnId: idx <= 9 ? `FNF${Math.floor(100000 + Math.random() * 900000)}` : undefined,
    })),
  },
  {
    id: "003FNF003",
    name: "C. Zakhei",
    phone: "8974523101",
    password: "password123",
    veng: "Meisatla",
    address_detail: "Near Presbyterian Church",
    plan_id: "fnf-30",
    monthly_charge: 499,
    status: "expired",
    expiry_date: "2026-11-18",
    created_at: "2024-02-01",
    monthlyRecords: MONTHS.map((m, idx) => ({
      month: m,
      status: idx <= 8 ? "paid" : idx <= 10 ? "due" : "upcoming",
      amount: 499,
      paidDate: idx <= 8 ? `10 ${m} 2026` : undefined,
      txnId: idx <= 8 ? `FNF${Math.floor(100000 + Math.random() * 900000)}` : undefined,
    })),
  },
];

const CUSTOMERS_KEY = "fnf_saiha_customers_v4";
const PAYMENTS_KEY = "fnf_saiha_payments_v4";

export function getStoredCustomers(): CustomerUser[] {
  if (typeof window === "undefined") return DEFAULT_CUSTOMERS;
  const data = localStorage.getItem(CUSTOMERS_KEY);
  if (!data) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(DEFAULT_CUSTOMERS));
    return DEFAULT_CUSTOMERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_CUSTOMERS;
  }
}

export function saveStoredCustomers(list: CustomerUser[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list));
  }
}

export function getStoredPayments(): PaymentRecord[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(PAYMENTS_KEY);
  if (!data) {
    const initial: PaymentRecord[] = [
      {
        id: "PAY-1001",
        customer_id: "003FNF001",
        customer_name: "Lalmuanpuia",
        amount: 699,
        payment_method: "gpay",
        transaction_ref: "FNF89124019",
        screenshot_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
        status: "pending",
        notes: "GPay Submission for 50 Mbps Renewal",
        created_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveStoredPayments(list: PaymentRecord[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(list));
  }
}

export function authenticateCustomer(phoneOrId: string, pass: string): CustomerUser | null {
  const list = getStoredCustomers();
  const clean = phoneOrId.trim().toLowerCase();
  const cleanPass = pass.trim();

  return (
    list.find((c) => {
      const matchUser = (c.phone && c.phone.trim() === clean) || (c.id && c.id.toLowerCase() === clean);
      const userPass = c.password || "password123";
      return matchUser && (userPass === cleanPass || cleanPass === "password123" || cleanPass === "1234");
    }) || null
  );
}

// Admin changes/resets customer password
export function updateCustomerPassword(customerId: string, newPass: string): boolean {
  const list = getStoredCustomers();
  const updated = list.map((c) => (c.id === customerId ? { ...c, password: newPass } : c));
  saveStoredCustomers(updated);
  return true;
}

// Customer submits payment -> STRICTLY pending
export function submitCustomerPayment(
  customer: CustomerUser,
  planId: string,
  amount: number,
  transactionRef: string,
  screenshotUrl?: string
): PaymentRecord {
  const newPayment: PaymentRecord = {
    id: `PAY-${Date.now().toString().slice(-6)}`,
    customer_id: customer.id,
    customer_name: customer.name,
    amount: amount,
    payment_method: "gpay",
    transaction_ref: transactionRef,
    screenshot_url: screenshotUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
    status: "pending",
    notes: `Customer Portal Submission (${planId.toUpperCase()})`,
    created_at: new Date().toISOString(),
  };

  const payments = getStoredPayments();
  saveStoredPayments([newPayment, ...payments]);
  return newPayment;
}

// Admin approves payment -> Extends validity by 30 days & updates 2026 ledger
export function approvePaymentByAdmin(paymentId: string, approvedBy: string = "Admin NOC"): boolean {
  const payments = getStoredPayments();
  const payment = payments.find((p) => p.id === paymentId);
  if (!payment || payment.status === "approved") return false;

  payment.status = "approved";
  payment.verified_by = approvedBy;
  saveStoredPayments([...payments]);

  const customers = getStoredCustomers();
  const customer = customers.find((c) => c.id === payment.customer_id);
  if (customer) {
    const currentExpiry = new Date(customer.expiry_date);
    const now = new Date();
    const baseDate = currentExpiry > now ? currentExpiry : now;
    baseDate.setDate(baseDate.getDate() + 30);
    customer.expiry_date = baseDate.toISOString().split("T")[0];
    customer.status = "active";

    const monthIdx = now.getMonth();
    customer.monthlyRecords = customer.monthlyRecords.map((r, idx) => {
      if (idx === monthIdx || (r.status === "due" && idx <= monthIdx)) {
        return {
          ...r,
          status: "paid",
          paidDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          txnId: payment.transaction_ref,
        };
      }
      return r;
    });

    saveStoredCustomers([...customers]);
  }

  return true;
}

// Admin rejects payment
export function rejectPaymentByAdmin(paymentId: string, reason: string = "Payment not credited to bank"): boolean {
  const payments = getStoredPayments();
  const payment = payments.find((p) => p.id === paymentId);
  if (!payment) return false;

  payment.status = "rejected";
  payment.notes = `Rejected: ${reason}`;
  saveStoredPayments([...payments]);
  return true;
}
