import React, { useState, useEffect } from 'react';
import { RoutePath, ContactMessage } from '../../types';
import { adminService } from '../../services/adminService';
import { useApp } from '../../stores';
import { Modal } from '../../components/common/Modal';

export interface AdminMessagesPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const AdminMessagesPage: React.FC<AdminMessagesPageProps> = () => {
  const { showToast } = useApp();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'unread' | 'read' | 'archived'>('All');

  // Modals
  const [viewingMessage, setViewingMessage] = useState<ContactMessage | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<ContactMessage | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchMessages();
      setMessages(data);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to load client transmissions.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const filtered = messages.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'All' || (m.status || 'read') === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleToggleStatus = async (id: string, newStatus: 'unread' | 'read' | 'archived') => {
    try {
      await adminService.updateMessageStatus(id, newStatus);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
      if (viewingMessage && viewingMessage.id === id) {
        setViewingMessage({ ...viewingMessage, status: newStatus });
      }
      showToast({
        type: 'info',
        title: 'Transmission Updated',
        message: `Message status set to ${newStatus}.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update transmission status.' });
    }
  };

  const handleOpenMessage = (m: ContactMessage) => {
    setViewingMessage(m);
    if (m.status === 'unread') {
      handleToggleStatus(m.id, 'read');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMessage) return;
    try {
      await adminService.deleteMessage(deletingMessage.id);
      setMessages((prev) => prev.filter((m) => m.id !== deletingMessage.id));
      showToast({
        type: 'info',
        title: 'Transmission Purged',
        message: `Message from ${deletingMessage.name} eliminated.`,
      });
      setDeletingMessage(null);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete transmission.' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Control Bar */}
      <div className="p-4 rounded-sm bg-[#0e1014] border border-white/8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#16181d] rounded-sm border border-white/5">
          {(['All', 'unread', 'read', 'archived'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xs font-mono text-xs uppercase transition-colors cursor-pointer ${
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
            placeholder="Search sender, email, or subject..."
            className="w-full pl-9 pr-3 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-xs text-white placeholder-[#869ab8] focus:outline-hidden focus:border-[#e11d48]"
          />
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-[#0e1014] border border-white/8 rounded-sm overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/8 bg-[#121418] font-mono text-[10px] uppercase tracking-[0.14em] text-[#869ab8]">
              <th className="py-3 px-4">Client Sender</th>
              <th className="py-3 px-4">Inquiry Subject</th>
              <th className="py-3 px-4">Inquiry Category</th>
              <th className="py-3 px-4">Logged Timestamp</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-body">
            {filtered.length > 0 ? (
              filtered.map((m) => {
                const isUnread = m.status === 'unread';
                return (
                  <tr
                    key={m.id}
                    onClick={() => handleOpenMessage(m)}
                    className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                      isUnread ? 'bg-[#e11d48]/[0.03] font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {isUnread && <span className="w-2 h-2 rounded-full bg-[#fbbf24] shrink-0" />}
                        <div className="flex flex-col">
                          <span className={`font-headline text-xs ${isUnread ? 'text-white font-bold' : 'text-[#b9c8de]'}`}>
                            {m.name}
                          </span>
                          <span className="font-mono text-[10px] text-[#869ab8]">{m.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-body text-xs text-white max-w-sm truncate">
                      {m.subject}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#38bdf8]">
                      {m.inquiryType || 'General Concierge'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[10px] text-[#869ab8]">
                      {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-xs font-mono text-[10px] uppercase font-semibold ${
                        isUnread
                          ? 'bg-[#fbbf24]/15 border border-[#fbbf24]/30 text-[#fbbf24]'
                          : m.status === 'archived'
                          ? 'bg-white/5 border border-white/10 text-[#869ab8]'
                          : 'bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80]'
                      }`}>
                        {m.status || 'read'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(m.id, isUnread ? 'read' : 'unread')}
                          className="p-1 rounded-sm text-[#869ab8] hover:text-white hover:bg-white/5 cursor-pointer"
                          title={isUnread ? 'Mark as Read' : 'Mark as Unread'}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isUnread ? 'drafts' : 'mark_email_unread'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingMessage(m)}
                          className="p-1 rounded-sm text-[#ffb4ab] hover:text-white hover:bg-red-500/10 cursor-pointer"
                          title="Purge Message"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs font-mono text-[#869ab8]">
                  {loading ? 'Retrieving inbox...' : 'No transmissions in this queue.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW TRANSMISSION MODAL */}
      <Modal
        isOpen={Boolean(viewingMessage)}
        onClose={() => setViewingMessage(null)}
        title={viewingMessage?.subject || 'Client Transmission'}
        subtitle={`From: ${viewingMessage?.name}`}
        maxWidth="lg"
      >
        <div className="flex flex-col gap-4 text-xs font-body">
          <div className="p-3 bg-[#121418] border border-white/5 rounded-sm flex flex-col gap-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[#869ab8]">Sender:</span>
              <span className="text-white font-bold">{viewingMessage?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869ab8]">Email:</span>
              <a href={`mailto:${viewingMessage?.email}`} className="text-[#38bdf8] hover:underline">
                {viewingMessage?.email}
              </a>
            </div>
            {viewingMessage?.phone && (
              <div className="flex justify-between">
                <span className="text-[#869ab8]">Phone:</span>
                <span className="text-white">{viewingMessage?.phone}</span>
              </div>
            )}
            {viewingMessage?.vehicleOfInterest && (
              <div className="flex justify-between">
                <span className="text-[#869ab8]">Vehicle of Interest:</span>
                <span className="text-[#ffb3b6]">{viewingMessage?.vehicleOfInterest}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#869ab8]">Received:</span>
              <span className="text-white">{viewingMessage?.createdAt}</span>
            </div>
          </div>

          <div>
            <span className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Transmission Message:</span>
            <div className="p-4 rounded-sm bg-[#16181d] border border-white/10 text-white font-body text-xs leading-relaxed whitespace-pre-wrap">
              {viewingMessage?.message}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/8">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => viewingMessage && handleToggleStatus(viewingMessage.id, 'archived')}
                className="px-3 py-1.5 rounded-sm bg-[#16181d] hover:bg-[#20232a] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
              >
                Archive
              </button>
              <button
                type="button"
                onClick={() => viewingMessage && handleToggleStatus(viewingMessage.id, viewingMessage.status === 'unread' ? 'read' : 'unread')}
                className="px-3 py-1.5 rounded-sm bg-[#16181d] hover:bg-[#20232a] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
              >
                Toggle Unread
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`mailto:${viewingMessage?.email}?subject=RE: ${encodeURIComponent(viewingMessage?.subject || '')}`}
                className="px-4 py-1.5 rounded-sm bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-headline font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">reply</span>
                <span>Draft Reply</span>
              </a>

              <button
                type="button"
                onClick={() => setViewingMessage(null)}
                className="px-3 py-1.5 rounded-sm bg-[#16181d] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={Boolean(deletingMessage)}
        onClose={() => setDeletingMessage(null)}
        title="Confirm Transmission Deletion"
        subtitle="Inquiry Purge"
        maxWidth="md"
      >
        <div className="flex flex-col gap-4 text-xs font-body">
          <p className="text-[#b9c8de]">
            Are you sure you want to permanently delete this inquiry from <span className="text-white font-bold">{deletingMessage?.name}</span>?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingMessage(null)}
              className="px-4 py-2 rounded-sm bg-[#16181d] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-headline font-semibold uppercase tracking-wider cursor-pointer"
            >
              Delete Transmission
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
