"use client";

import * as React from "react";
import {
  AlertTriangle,
  Wrench,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  Plus,
  Search,
  WifiOff,
  UserCheck,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SAIHA_VENGS } from "@/lib/constants/vêng";
import { formatDateTime } from "@/lib/utils/format";
import { generateTicketId } from "@/lib/utils/id-generator";
import { ComplaintTicket } from "@/types";

const INITIAL_TICKETS: ComplaintTicket[] = [
  {
    id: "FNF-TICK-1021",
    customer_id: "003FNF001",
    customer_name: "Lalmuanpuia",
    customer_phone: "9862551234",
    veng: "College Veng",
    issue_type: "los_red_light",
    description: "ONU red light blinking since 8:00 AM after heavy rain",
    status: "in_progress",
    assigned_to: "Tech Beiratha",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "FNF-TICK-1020",
    customer_id: "003FNF002",
    customer_name: "K. Beiratha",
    customer_phone: "9436159870",
    veng: "New Saiha West",
    issue_type: "fiber_cut",
    description: "Main drop fiber snapped near transformer pole",
    status: "open",
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: "FNF-TICK-1019",
    customer_id: "003FNF003",
    customer_name: "C. Zakhei",
    customer_phone: "8974523101",
    veng: "Meisatla",
    issue_type: "router_issue",
    description: "ONU adaptor dead, needs replacement",
    status: "resolved",
    assigned_to: "Tech Muanpuia",
    resolution_note: "Replaced 12V 1.5A adaptor, ONU internet restored.",
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    resolved_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

const TECHNICIANS = ["Tech Beiratha", "Tech Muanpuia", "Tech V.L. Hruaia", "Tech K. Chozah"];

export default function ComplaintsPage() {
  const [tickets, setTickets] = React.useState<ComplaintTicket[]>(INITIAL_TICKETS);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [vengFilter, setVengFilter] = React.useState("all");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [resolvingTicket, setResolvingTicket] = React.useState<ComplaintTicket | null>(null);
  const [resolutionNote, setResolutionNote] = React.useState("");

  // New Ticket Form state
  const [custName, setCustName] = React.useState("");
  const [custId, setCustId] = React.useState("");
  const [custPhone, setCustPhone] = React.useState("");
  const [veng, setVeng] = React.useState(SAIHA_VENGS[0]);
  const [issueType, setIssueType] = React.useState<ComplaintTicket["issue_type"]>("los_red_light");
  const [desc, setDesc] = React.useState("");

  const handleAssignTech = (ticketId: string, techName: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, assigned_to: techName, status: "in_progress" }
          : t
      )
    );
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === resolvingTicket.id
          ? {
              ...t,
              status: "resolved",
              resolution_note: resolutionNote,
              resolved_at: new Date().toISOString(),
            }
          : t
      )
    );

    setResolvingTicket(null);
    setResolutionNote("");
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = generateTicketId(1021 + tickets.length);

    const newTicket: ComplaintTicket = {
      id: newId,
      customer_id: custId.trim() || "003FNF001",
      customer_name: custName,
      customer_phone: custPhone,
      veng,
      issue_type: issueType,
      description: desc,
      status: "open",
      created_at: new Date().toISOString(),
    };

    setTickets([newTicket, ...tickets]);
    setCustName("");
    setCustId("");
    setCustPhone("");
    setDesc("");
    setIsAddModalOpen(false);
  };

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      t.customer_phone.includes(search) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchVeng = vengFilter === "all" || t.veng === vengFilter;
    return matchSearch && matchStatus && matchVeng;
  });

  const getIssueLabel = (type: ComplaintTicket["issue_type"]) => {
    switch (type) {
      case "los_red_light":
        return { label: "LOS Red Light", variant: "danger" as const };
      case "fiber_cut":
        return { label: "Fiber Cut", variant: "danger" as const };
      case "slow_speed":
        return { label: "Slow Speed", variant: "warning" as const };
      case "router_issue":
        return { label: "Router / Power", variant: "info" as const };
      default:
        return { label: "General Fault", variant: "default" as const };
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Faults &amp; Technician Dispatch
            </h1>
            <p className="text-sm text-gray-500">
              Manage Saiha broadband optical faults, LOS alerts, and field technician dispatch.
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-sm bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4" /> Report New Fault / LOS
          </Button>
        </div>

        {/* Ticket Status KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">
                Open Tickets
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{openCount}</div>
              <p className="text-xs text-red-500 font-medium mt-1">Needs technician assignment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">
                In Progress (Dispatched)
              </CardTitle>
              <Wrench className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{inProgressCount}</div>
              <p className="text-xs text-gray-400 mt-1">Technicians on field</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-gray-500 uppercase">
                Resolved Today
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{resolvedCount}</div>
              <p className="text-xs text-emerald-600 font-medium mt-1">Fiber connections restored</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search ticket, customer, phone, or issue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={vengFilter}
                onChange={(e) => setVengFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200"
              >
                <option value="all">All Vêngs (Saiha)</option>
                {SAIHA_VENGS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200"
              >
                <option value="all">All Status</option>
                <option value="open">Open Faults</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Grid / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const issueBadge = getIssueLabel(item.issue_type);

            return (
              <Card
                key={item.id}
                className={
                  item.status === "open"
                    ? "border-l-4 border-l-red-500"
                    : item.status === "in_progress"
                    ? "border-l-4 border-l-amber-500"
                    : "border-l-4 border-l-emerald-500"
                }
              >
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-gray-400 block">{item.id}</span>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white mt-0.5">
                      {item.customer_name}
                    </h3>
                  </div>
                  <Badge variant={issueBadge.variant}>{issueBadge.label}</Badge>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-1 text-xs text-gray-600 dark:text-zinc-400">
                    <p className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-zinc-200">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {item.veng}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      {item.customer_phone}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-800/60 text-xs text-gray-700 dark:text-zinc-300">
                    <p className="font-medium text-gray-500 text-[10px] uppercase">Problem Description:</p>
                    <p className="mt-0.5">{item.description}</p>
                  </div>

                  {item.resolution_note && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                      <p className="font-medium text-[10px] uppercase">Resolution Note:</p>
                      <p className="mt-0.5">{item.resolution_note}</p>
                    </div>
                  )}

                  {/* Technician Assignment and Action Bar */}
                  <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Assigned Tech:</span>
                      <select
                        value={item.assigned_to || ""}
                        onChange={(e) => handleAssignTech(item.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200"
                      >
                        <option value="">-- Assign Tech --</option>
                        {TECHNICIANS.map((tech) => (
                          <option key={tech} value={tech}>
                            {tech}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-gray-400">
                        {formatDateTime(item.created_at)}
                      </span>

                      {item.status !== "resolved" ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setResolvingTicket(item)}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Resolved
                        </Button>
                      ) : (
                        <Badge variant="success">Fixed &amp; Closed</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            Complaint ticket engmah hmuh a ni lo.
          </div>
        )}

        {/* Mark Resolved Modal */}
        <Modal
          isOpen={!!resolvingTicket}
          onClose={() => setResolvingTicket(null)}
          title={`Resolve Fault Ticket: ${resolvingTicket?.id}`}
        >
          <form onSubmit={handleResolve} className="space-y-4">
            <p className="text-xs text-gray-500">
              Customer: <span className="font-semibold text-gray-800 dark:text-zinc-200">{resolvingTicket?.customer_name}</span> ({resolvingTicket?.veng})
            </p>
            <Input
              label="Technician Resolution Note"
              placeholder="e.g. Spliced loose drop cable at pole #14, optical power -18.5 dBm verified."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              required
            />
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setResolvingTicket(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-700">
                Confirm &amp; Close Ticket
              </Button>
            </div>
          </form>
        </Modal>

        {/* Report New Fault Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Report Broadband Fault / Fiber Cut"
        >
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <Input
              label="Customer Full Name"
              placeholder="e.g. Lalmuanpuia"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              required
            />
            <Input
              label="Customer ID (Optional)"
              placeholder="e.g. 003FNF001"
              value={custId}
              onChange={(e) => setCustId(e.target.value)}
            />
            <Input
              label="Customer Phone Number"
              placeholder="10-digit mobile number"
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                Saiha Vêng (Locality)
              </label>
              <select
                value={veng}
                onChange={(e) => setVeng(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm"
              >
                {SAIHA_VENGS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
                Fault / Issue Type
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as ComplaintTicket["issue_type"])}
                className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3.5 py-2 text-sm"
              >
                <option value="los_red_light">LOS Red Light Blinking (Optical Loss)</option>
                <option value="fiber_cut">Main / Drop Optical Fiber Cut</option>
                <option value="slow_speed">Slow Speed / High Latency</option>
                <option value="router_issue">Router / ONU Adaptor Failure</option>
                <option value="other">Other Issue</option>
              </select>
            </div>
            <Input
              label="Description / Pole Landmark"
              placeholder="e.g. Light went red after tree branch fell near transformer"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger">
                Dispatch Fault Ticket
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
