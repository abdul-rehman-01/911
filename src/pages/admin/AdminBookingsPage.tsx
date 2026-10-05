import React, { useState, useEffect } from 'react';
import { RoutePath, Booking } from '../../types';
import { adminService } from '../../services/adminService';
import { useApp } from '../../stores';
import { Modal } from '../../components/common/Modal';

export interface AdminBookingsPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const AdminBookingsPage: React.FC<AdminBookingsPageProps> = () => {
  const { showToast } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');

  // Modals
  const [inspectBooking, setInspectBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchBookings();
      setBookings(data);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to load service bookings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.clientName.toLowerCase().includes(search.toLowerCase()) ||
      b.clientEmail.toLowerCase().includes(search.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      (b.vehicleModel && b.vehicleModel.toLowerCase().includes(search.toLowerCase())) ||
      b.id.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = async (id: string, status: Booking['status']) => {
    try {
      const updated = await adminService.updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b)));
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `Booking ${id} set to ${status}.`,
      });
      if (inspectBooking && inspectBooking.id === id) {
        setInspectBooking({ ...inspectBooking, status });
      }
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update reservation status.' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBooking) return;
    try {
      await adminService.deleteBooking(deletingBooking.id);
      setBookings((prev) => prev.filter((b) => b.id !== deletingBooking.id));
      showToast({
        type: 'info',
        title: 'Booking Cancelled',
        message: `Reservation ${deletingBooking.id} removed from dispatch.`,
      });
      setDeletingBooking(null);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete booking.' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Control Bar: Filter Tabs & Search */}
      <div className="p-4 rounded-sm bg-[#0e1014] border border-white/8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#16181d] rounded-sm border border-white/5 overflow-x-auto">
          {(['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xs font-mono text-xs transition-colors cursor-pointer shrink-0 ${
                statusFilter === s
                  ? 'bg-[#e11d48] text-white font-semibold shadow-xs'
                  : 'text-[#869ab8] hover:text-white hover:bg-white/5'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#869ab8]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, service, vehicle, or ID..."
            className="w-full pl-9 pr-3 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-xs text-white placeholder-[#869ab8] focus:outline-hidden focus:border-[#e11d48]"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#0e1014] border border-white/8 rounded-sm overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/8 bg-[#121418] font-mono text-[10px] uppercase tracking-[0.14em] text-[#869ab8]">
                <th className="py-3 px-4">Reservation ID</th>
                <th className="py-3 px-4">Client Contact</th>
                <th className="py-3 px-4">Service Program</th>
                <th className="py-3 px-4">Vehicle Model</th>
                <th className="py-3 px-4">Preferred Slot</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-body">
              {filtered.length > 0 ? (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#ffb3b6] font-bold">
                      {b.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-headline font-semibold text-white text-xs">{b.clientName}</span>
                        <span className="font-mono text-[10px] text-[#869ab8]">{b.clientEmail} · {b.clientPhone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-body text-xs text-[#b9c8de]">
                      {b.serviceName}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-white">
                      {b.vehicleModel || 'Not Specified'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#b9c8de]">
                      <div>{b.preferredDate}</div>
                      <div className="text-[10px] text-[#869ab8]">{b.preferredTime}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={b.status}
                        onChange={(e) => handleUpdateStatus(b.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-sm text-[11px] font-mono border cursor-pointer ${
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
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectBooking(b)}
                          className="p-1 rounded-sm text-[#38bdf8] hover:text-white hover:bg-[#38bdf8]/10 cursor-pointer"
                          title="Inspect Booking Details"
                        >
                          <span className="material-symbols-outlined text-[16px]">info</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingBooking(b)}
                          className="p-1 rounded-sm text-[#ffb4ab] hover:text-white hover:bg-red-500/10 cursor-pointer"
                          title="Delete Booking"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs font-mono text-[#869ab8]">
                    {loading ? 'Interrogating reservation queue...' : 'No bookings in selected queue.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT DETAILS MODAL */}
      <Modal
        isOpen={Boolean(inspectBooking)}
        onClose={() => setInspectBooking(null)}
        title="Service Reservation Telemetry"
        subtitle={`Booking ID: ${inspectBooking?.id}`}
        maxWidth="md"
      >
        <div className="flex flex-col gap-4 text-xs font-body">
          <div className="p-3 bg-[#121418] border border-white/5 rounded-sm flex flex-col gap-2 font-mono">
            <div className="flex justify-between">
              <span className="text-[#869ab8]">Client:</span>
              <span className="text-white font-bold">{inspectBooking?.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869ab8]">Email:</span>
              <span className="text-white">{inspectBooking?.clientEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869ab8]">Phone:</span>
              <span className="text-white">{inspectBooking?.clientPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869ab8]">Service:</span>
              <span className="text-[#38bdf8] font-bold">{inspectBooking?.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869ab8]">Vehicle Model:</span>
              <span className="text-white">{inspectBooking?.vehicleModel || 'General Inquiry'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869ab8]">Slot:</span>
              <span className="text-white">{inspectBooking?.preferredDate} at {inspectBooking?.preferredTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869ab8]">Status:</span>
              <span className="text-[#ffb3b6] uppercase font-bold">{inspectBooking?.status}</span>
            </div>
          </div>

          <div>
            <span className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Client Special Instructions / Notes:</span>
            <div className="p-3 rounded-sm bg-[#16181d] border border-white/10 text-white font-body text-xs italic">
              {inspectBooking?.notes || 'No special instructions provided by client.'}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-white/8">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#869ab8]">Change status:</span>
              <select
                value={inspectBooking?.status}
                onChange={(e) => inspectBooking && handleUpdateStatus(inspectBooking.id, e.target.value as any)}
                className="px-2 py-1 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono text-xs cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setInspectBooking(null)}
              className="px-4 py-1.5 rounded-sm bg-[#16181d] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={Boolean(deletingBooking)}
        onClose={() => setDeletingBooking(null)}
        title="Confirm Reservation Cancellation"
        subtitle="Workshop Logistics"
        maxWidth="md"
      >
        <div className="flex flex-col gap-4 text-xs font-body">
          <p className="text-[#b9c8de]">
            Are you sure you want to remove reservation <span className="font-mono text-white font-bold">{deletingBooking?.id}</span> for <span className="text-white font-bold">{deletingBooking?.clientName}</span>?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingBooking(null)}
              className="px-4 py-2 rounded-sm bg-[#16181d] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-headline font-semibold uppercase tracking-wider cursor-pointer"
            >
              Delete Reservation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
