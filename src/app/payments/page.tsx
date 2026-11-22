"use client";

import * as React from "react";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Check,
  X,
  Smartphone,
  ShieldCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatINR, formatDateTime } from "@/lib/utils/format";
import { PaymentRecord } from "@/types";
import {
  getStoredPayments,
  approvePaymentByAdmin,
  rejectPaymentByAdmin,
} from "@/lib/services/customer-store";

export default function PaymentsPage() {
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [selectedProof, setSelectedProof] = React.useState<PaymentRecord | null>(null);
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  const loadData = () => {
    setPayments(getStoredPayments());
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (paymentId: string, customerName: string) => {
    const success = approvePaymentByAdmin(paymentId, "Desk Manager");
    if (success) {
      loadData();
      setActionNotice(`Approved! ${customerName}'s internet validity extended by 30 days & ledger updated to PAID.`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleReject = (paymentId: string) => {
    const reason = prompt("Khawngaihin reject chhan ziak rawh (e.g. Bank-ah pawisa a lut lo):", "Bank-ah a lut lo");
    if (reason) {
      rejectPaymentByAdmin(paymentId, reason);
      loadData();
    }
  };

  const filtered = payments.filter((p) => {
    const matchesSearch =
      p.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.customer_id.toLowerCase().includes(search.toLowerCase()) ||
      p.transaction_ref?.includes(search);
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = payments.filter((p) => p.status === "pending").length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Payments &amp; Portal Submissions
            </h1>
            <p className="text-sm text-gray-500">
              Verify customer UPI submissions and approve validity recharge.
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 animate-spin" /> {pendingCount} Pending Payment(s) Needing Approval
            </div>
          )}
        </div>

        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Filter */}
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Customer ID, Name, or UTR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200"
              >
                <option value="all">All Payments ({payments.length})</option>
                <option value="pending">Pending Approval ({pendingCount})</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-900 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Customer &amp; ID</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Method &amp; UTR</th>
                <th className="px-5 py-3.5">Time Submitted</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/50">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-bold text-blue-600 block">{item.customer_id}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{item.customer_name}</span>
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-600">
                    {formatINR(item.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-xs uppercase font-semibold text-gray-800 dark:text-zinc-200">
                      <Smartphone className="h-3 w-3 text-blue-500" /> {item.payment_method}
                    </span>
                    <span className="font-mono text-xs text-gray-400 block">{item.transaction_ref}</span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">
                    {formatDateTime(item.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    {item.status === "pending" ? (
                      <Badge variant="warning">Pending Approval</Badge>
                    ) : item.status === "approved" ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <Badge variant="danger">Rejected</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedProof(item)}
                        className="text-xs h-8"
                      >
                        <Eye className="h-3.5 w-3.5" /> Proof
                      </Button>

                      {item.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApprove(item.id, item.customer_name || "")}
                            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <Check className="h-3.5 w-3.5" /> Approve &amp; Recharge
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(item.id)}
                            className="text-xs h-8 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Proof Preview Modal */}
        <Modal
          isOpen={!!selectedProof}
          onClose={() => setSelectedProof(null)}
          title={`Payment Proof: ${selectedProof?.customer_name}`}
        >
          {selectedProof && (
            <div className="space-y-4">
              <img
                src={selectedProof.screenshot_url}
                alt="Receipt Proof"
                className="max-h-72 w-full object-cover rounded-xl border border-gray-200 dark:border-zinc-800"
              />
              <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl text-xs space-y-1">
                <p><strong>Customer:</strong> {selectedProof.customer_name} ({selectedProof.customer_id})</p>
                <p><strong>UTR Ref:</strong> <span className="font-mono text-blue-600 font-bold">{selectedProof.transaction_ref}</span></p>
                <p><strong>Amount:</strong> <span className="font-bold text-emerald-600">{formatINR(selectedProof.amount)}</span></p>
                <p><strong>Notes:</strong> {selectedProof.notes}</p>
                <p><strong>Status:</strong> <span className="uppercase font-bold">{selectedProof.status}</span></p>
              </div>

              {selectedProof.status === "pending" && (
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-zinc-800">
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleApprove(selectedProof.id, selectedProof.customer_name || "");
                      setSelectedProof(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  >
                    <Check className="h-4 w-4" /> Approve &amp; Extend Validity
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardShell>
  );
}
