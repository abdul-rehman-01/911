import React, { useState, useEffect } from 'react';
import { RoutePath, AdminStats } from '../../types';
import { adminService } from '../../services/adminService';
import { useApp } from '../../stores';

export interface AdminDashboardPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { showToast } = useApp();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchDashboardStats();
      setStats(data);
    } catch {
      showToast({
        type: 'error',
        title: 'Telemetry Sync Warning',
        message: 'Could not fetch live database stats. Showing local state.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateBookingStatus = async (id: string, status: any) => {
    try {
      await adminService.updateBookingStatus(id, status);
      showToast({
        type: 'success',
        title: 'Booking Updated',
        message: `Reservation ${id} updated to ${status}.`,
      });
      loadData();
    } catch {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update booking status.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner Alert / Diagnostic Bar */}
      <div className="p-4 rounded-sm bg-[#121418] border border-white/8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80] animate-pulse" />
          <div className="flex items-center gap-2 text-xs font-mono text-[#b9c8de]">
            <span className="text-white font-bold">DATABASE:</span>
            <span>PostgreSQL 16 (Drizzle ORM)</span>
            <span className="text-white/20">|</span>
            <span className="text-white font-bold">API:</span>
            <span className="text-[#4ade80]">v1 Operational</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-sm bg-[#1a1c20] hover:bg-[#252830] text-[#b9c8de] hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Fleet Valuation */}
        <div className="p-5 rounded-sm bg-[#0e1014] border border-white/8 flex flex-col gap-2 relative overflow-hidden group hover:border-[#e11d48]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#869ab8]">
              Total Fleet Valuation
            </span>
            <span className="material-symbols-outlined text-[#e11d48] text-[20px]">
              monetization_on
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-2xl lg:text-3xl text-white tracking-tight">
              ${stats ? (stats.catalog.totalValuationUsd / 1000000).toFixed(2) : '3.65'}M
            </span>
            <span className="font-mono text-xs text-[#4ade80]">USD</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#869ab8] mt-1 pt-2 border-t border-white/5">
            <span className="text-white font-semibold">{stats?.catalog.totalVehicles || 6} Units</span>
            <span>·</span>
            <span>{stats?.catalog.certifiedCount || 5} Certified</span>
          </div>
        </div>

        {/* Metric 2: Active Bookings */}
        <div className="p-5 rounded-sm bg-[#0e1014] border border-white/8 flex flex-col gap-2 relative overflow-hidden group hover:border-[#e11d48]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#869ab8]">
              Service Reservations
            </span>
            <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">
              calendar_month
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-2xl lg:text-3xl text-white tracking-tight">
              {stats?.operations.totalBookings || 3}
            </span>
            <span className="font-mono text-xs text-[#869ab8]">Active</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#869ab8] mt-1 pt-2 border-t border-white/5">
            <span className="text-[#ffb3b6] font-semibold">{stats?.operations.pendingBookings || 1} Pending</span>
            <span>·</span>
            <span>{stats?.operations.confirmedBookings || 1} Confirmed</span>
          </div>
        </div>

        {/* Metric 3: Client Inquiries */}
        <div className="p-5 rounded-sm bg-[#0e1014] border border-white/8 flex flex-col gap-2 relative overflow-hidden group hover:border-[#e11d48]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#869ab8]">
              Client Inquiries
            </span>
            <span className="material-symbols-outlined text-[#fbbf24] text-[20px]">
              mail
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-2xl lg:text-3xl text-white tracking-tight">
              {stats?.communications.totalInquiries || 3}
            </span>
            <span className="font-mono text-xs text-[#869ab8]">Messages</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#869ab8] mt-1 pt-2 border-t border-white/5">
            <span className="text-[#fbbf24] font-semibold">{stats?.communications.unreadInquiries || 2} Unread</span>
            <span>·</span>
            <span>High Priority</span>
          </div>
        </div>

        {/* Metric 4: Infrastructure & Network */}
        <div className="p-5 rounded-sm bg-[#0e1014] border border-white/8 flex flex-col gap-2 relative overflow-hidden group hover:border-[#e11d48]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#869ab8]">
              Showroom Network
            </span>
            <span className="material-symbols-outlined text-[#4ade80] text-[20px]">
              storefront
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-2xl lg:text-3xl text-white tracking-tight">
              {stats?.operations.dealersCount || 6}
            </span>
            <span className="font-mono text-xs text-[#869ab8]">Ateliers</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#869ab8] mt-1 pt-2 border-t border-white/5">
            <span className="text-white font-semibold">{stats?.operations.servicesCount || 5} Services</span>
            <span>·</span>
            <span>{stats?.catalog.brandsCount || 6} Marques</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="p-4 rounded-sm bg-[#0e1014] border border-white/8 flex flex-col gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#869ab8]">
          Administrative Quick Action Dispatch
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            type="button"
            onClick={() => onNavigate('admin/vehicles')}
            className="p-2.5 rounded-sm bg-[#16181d] hover:bg-[#20232a] border border-white/5 hover:border-[#e11d48]/40 text-left transition-all flex flex-col gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#e11d48] text-[20px]">add_circle</span>
            <span className="font-headline text-xs font-semibold text-white">Add Vehicle</span>
            <span className="font-mono text-[9px] text-[#869ab8]">Catalog Registry</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin/brands')}
            className="p-2.5 rounded-sm bg-[#16181d] hover:bg-[#20232a] border border-white/5 hover:border-[#e11d48]/40 text-left transition-all flex flex-col gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">workspace_premium</span>
            <span className="font-headline text-xs font-semibold text-white">Manage Brands</span>
            <span className="font-mono text-[9px] text-[#869ab8]">Manufacturers</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin/services')}
            className="p-2.5 rounded-sm bg-[#16181d] hover:bg-[#20232a] border border-white/5 hover:border-[#e11d48]/40 text-left transition-all flex flex-col gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#4ade80] text-[20px]">build</span>
            <span className="font-headline text-xs font-semibold text-white">New Service</span>
            <span className="font-mono text-[9px] text-[#869ab8]">Concierge Programs</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin/dealers')}
            className="p-2.5 rounded-sm bg-[#16181d] hover:bg-[#20232a] border border-white/5 hover:border-[#e11d48]/40 text-left transition-all flex flex-col gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#fbbf24] text-[20px]">storefront</span>
            <span className="font-headline text-xs font-semibold text-white">Add Atelier</span>
            <span className="font-mono text-[9px] text-[#869ab8]">Showroom Nodes</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin/bookings')}
            className="p-2.5 rounded-sm bg-[#16181d] hover:bg-[#20232a] border border-white/5 hover:border-[#e11d48]/40 text-left transition-all flex flex-col gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#f43f5e] text-[20px]">checklist</span>
            <span className="font-headline text-xs font-semibold text-white">Review Bookings</span>
            <span className="font-mono text-[9px] text-[#869ab8]">Workshop Queue</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('admin/messages')}
            className="p-2.5 rounded-sm bg-[#16181d] hover:bg-[#20232a] border border-white/5 hover:border-[#e11d48]/40 text-left transition-all flex flex-col gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#a855f7] text-[20px]">mark_chat_unread</span>
            <span className="font-headline text-xs font-semibold text-white">Inquiry Desk</span>
            <span className="font-mono text-[9px] text-[#869ab8]">Transmissions</span>
          </button>
        </div>
      </div>

      {/* Two Column Section: Recent Bookings & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Service Bookings */}
        <div className="p-5 rounded-sm bg-[#0e1014] border border-white/8 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#e11d48] text-[20px]">calendar_month</span>
              <h3 className="font-headline font-semibold text-sm text-white">Live Workshop Bookings</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin/bookings')}
              className="text-xs font-mono text-[#b9c8de] hover:text-[#e11d48] transition-colors cursor-pointer"
            >
              View All ({stats?.operations.totalBookings || 0}) →
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              stats.recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-sm bg-[#14161b] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-semibold text-white truncate">{b.clientName}</span>
                      <span className="text-[10px] font-mono text-[#869ab8]">· {b.preferredDate}</span>
                    </div>
                    <span className="font-body text-[11px] text-[#b9c8de] truncate">{b.serviceName}</span>
                    {b.vehicleModel && (
                      <span className="font-mono text-[10px] text-[#869ab8]">{b.vehicleModel}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={b.status}
                      onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                      className={`px-2 py-1 rounded-sm text-[11px] font-mono border cursor-pointer ${
                        b.status === 'Confirmed'
                          ? 'bg-[#4ade80]/10 border-[#4ade80]/40 text-[#4ade80]'
                          : b.status === 'Pending'
                          ? 'bg-[#fbbf24]/10 border-[#fbbf24]/40 text-[#fbbf24]'
                          : b.status === 'Completed'
                          ? 'bg-[#38bdf8]/10 border-[#38bdf8]/40 text-[#38bdf8]'
                          : 'bg-red-500/10 border-red-500/40 text-red-400'
                      }`}
                    >
                      <option value="Pending" className="bg-[#1a1c20] text-white">Pending</option>
                      <option value="Confirmed" className="bg-[#1a1c20] text-white">Confirmed</option>
                      <option value="Completed" className="bg-[#1a1c20] text-white">Completed</option>
                      <option value="Cancelled" className="bg-[#1a1c20] text-white">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs font-mono text-[#869ab8]">
                No recent reservations logged.
              </div>
            )}
          </div>
        </div>

        {/* Recent Contact Inquiries */}
        <div className="p-5 rounded-sm bg-[#0e1014] border border-white/8 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fbbf24] text-[20px]">inbox</span>
              <h3 className="font-headline font-semibold text-sm text-white">Inbound Inquiries</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin/messages')}
              className="text-xs font-mono text-[#b9c8de] hover:text-[#e11d48] transition-colors cursor-pointer"
            >
              View All ({stats?.communications.totalInquiries || 0}) →
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {stats?.recentInquiries && stats.recentInquiries.length > 0 ? (
              stats.recentInquiries.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-sm bg-[#14161b] border border-white/5 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-headline font-semibold text-white truncate">{m.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-xs uppercase ${
                      m.status === 'unread' ? 'bg-[#fbbf24]/20 text-[#fbbf24] font-bold' : 'text-[#869ab8]'
                    }`}>
                      {m.status || 'read'}
                    </span>
                  </div>
                  <span className="font-body text-xs text-[#b9c8de] font-medium truncate">{m.subject}</span>
                  <p className="font-body text-[11px] text-[#869ab8] line-clamp-1">{m.message}</p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs font-mono text-[#869ab8]">
                No pending inquiries.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
