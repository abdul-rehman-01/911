import React, { useState, useEffect } from 'react';
import { RoutePath, Dealer } from '../../types';
import { adminService } from '../../services/adminService';
import { useApp } from '../../stores';
import { Modal } from '../../components/common/Modal';

export interface AdminDealersPageProps {
  onNavigate: (route: RoutePath, params?: { dealerId?: string }) => void;
}

export const AdminDealersPage: React.FC<AdminDealersPageProps> = ({ onNavigate }) => {
  const { showToast, setSelectedDealerId } = useApp();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [deletingDealer, setDeletingDealer] = useState<Dealer | null>(null);

  // Form
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('United States');
  const [phone, setPhone] = useState('+1 (310) 555-0199');
  const [email, setEmail] = useState('concierge@car911.com');
  const [hours, setHours] = useState('Mon-Sat: 9:00 AM - 7:00 PM PST');
  const [isFlagship, setIsFlagship] = useState(false);

  const loadDealers = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchDealers();
      setDealers(data);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to load atelier showrooms.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDealers();
  }, []);

  const filtered = dealers.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setName('');
    setAddress('9021 Wilshire Blvd');
    setCity('Beverly Hills');
    setState('CA');
    setCountry('United States');
    setPhone('+1 (310) 555-0199');
    setEmail('beverlyhills@car911.com');
    setHours('Mon-Sat: 9:00 AM - 7:00 PM PST');
    setIsFlagship(false);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (d: Dealer) => {
    setEditingDealer(d);
    setName(d.name);
    setAddress(d.address);
    setCity(d.city);
    setState(d.state);
    setCountry(d.country);
    setPhone(d.phone);
    setEmail(d.email);
    setHours(d.hours);
    setIsFlagship(d.isFlagship);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) return;

    try {
      const created = await adminService.createDealer({
        name,
        address,
        city,
        state,
        country,
        phone,
        email,
        hours,
        isFlagship,
        allocatedInventoryCount: 6,
      });

      setDealers((prev) => [...prev, created]);
      setCreateModalOpen(false);
      showToast({
        type: 'success',
        title: 'Showroom Registered',
        message: `${created.name} registered into atelier network.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to create atelier location.' });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDealer) return;

    try {
      const updated = await adminService.updateDealer(editingDealer.id, {
        name,
        address,
        city,
        state,
        country,
        phone,
        email,
        hours,
        isFlagship,
      });

      setDealers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setEditingDealer(null);
      showToast({
        type: 'success',
        title: 'Atelier Updated',
        message: `${updated.name} updated successfully.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update dealer.' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDealer) return;
    try {
      await adminService.deleteDealer(deletingDealer.id);
      setDealers((prev) => prev.filter((d) => d.id !== deletingDealer.id));
      showToast({
        type: 'info',
        title: 'Showroom Decommissioned',
        message: `${deletingDealer.name} removed from showroom network.`,
      });
      setDeletingDealer(null);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete dealer.' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Control Bar */}
      <div className="p-4 rounded-sm bg-[#0e1014] border border-white/8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#869ab8]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search showroom, city or country..."
            className="w-full pl-9 pr-3 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-xs text-white placeholder-[#869ab8] focus:outline-hidden focus:border-[#e11d48]"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-sm bg-[#e11d48] hover:bg-[#be123c] text-white font-headline text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_14px_rgba(225,29,72,0.35)] transition-all cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Register New Atelier</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0e1014] border border-white/8 rounded-sm overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/8 bg-[#121418] font-mono text-[10px] uppercase tracking-[0.14em] text-[#869ab8]">
              <th className="py-3 px-4">Showroom &amp; Atelier</th>
              <th className="py-3 px-4">City / Region</th>
              <th className="py-3 px-4">Direct Contact</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Inventory Allocation</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-body">
            {filtered.length > 0 ? (
              filtered.map((d) => (
                <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold text-white text-xs">{d.name}</span>
                      <span className="font-mono text-[10px] text-[#869ab8]">{d.address}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#b9c8de]">
                    <div>{d.city}{d.state ? `, ${d.state}` : ''}</div>
                    <div className="text-[10px] text-[#869ab8]">{d.country}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#b9c8de]">
                    <div>{d.phone}</div>
                    <div className="text-[10px] text-[#869ab8]">{d.email}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    {d.isFlagship ? (
                      <span className="text-[#e11d48] font-mono text-[10px] font-bold uppercase tracking-wider">
                        ★ Flagship Atelier
                      </span>
                    ) : (
                      <span className="text-[#869ab8] font-mono text-[10px]">Certified Node</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-white">
                    {d.allocatedInventoryCount || 5} chassis
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDealerId(d.id);
                          onNavigate('dealers');
                        }}
                        className="p-1 rounded-sm text-[#b9c8de] hover:text-white hover:bg-white/5 cursor-pointer"
                        title="View Dealer Directory"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(d)}
                        className="p-1 rounded-sm text-[#38bdf8] hover:text-white hover:bg-[#38bdf8]/10 cursor-pointer"
                        title="Edit Atelier"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingDealer(d)}
                        className="p-1 rounded-sm text-[#ffb4ab] hover:text-white hover:bg-red-500/10 cursor-pointer"
                        title="Delete Atelier"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs font-mono text-[#869ab8]">
                  {loading ? 'Interrogating atelier network...' : 'No showrooms registered.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register Atelier Showroom"
        subtitle="Network Facilities Desk"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCreate} className="flex flex-col gap-4 text-xs font-body">
          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Showroom / Atelier Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Car 911 Tokyo Ginza Atelier"
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">State / Prefecture</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Country</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Direct Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Email Terminal</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="flagshipToggle"
              checked={isFlagship}
              onChange={(e) => setIsFlagship(e.target.checked)}
              className="rounded-xs text-[#e11d48]"
            />
            <label htmlFor="flagshipToggle" className="font-mono text-xs text-white cursor-pointer">
              Designate as International Flagship Atelier
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-sm bg-[#16181d] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-sm bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-headline font-semibold uppercase tracking-wider cursor-pointer"
            >
              Register Atelier
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={Boolean(editingDealer)}
        onClose={() => setEditingDealer(null)}
        title="Edit Atelier Node"
        subtitle={`ID: ${editingDealer?.id}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-xs font-body">
          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Atelier Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Country</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="editFlagshipToggle"
              checked={isFlagship}
              onChange={(e) => setIsFlagship(e.target.checked)}
              className="rounded-xs text-[#e11d48]"
            />
            <label htmlFor="editFlagshipToggle" className="font-mono text-xs text-white cursor-pointer">
              Designate as International Flagship Atelier
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
            <button
              type="button"
              onClick={() => setEditingDealer(null)}
              className="px-4 py-2 rounded-sm bg-[#16181d] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-sm bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-headline font-semibold uppercase tracking-wider cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={Boolean(deletingDealer)}
        onClose={() => setDeletingDealer(null)}
        title="Confirm Showroom Decommission"
        subtitle="Network Facilities Desk"
        maxWidth="md"
      >
        <div className="flex flex-col gap-4 text-xs font-body">
          <p className="text-[#b9c8de]">
            Are you sure you want to remove <span className="text-white font-bold">{deletingDealer?.name}</span> ({deletingDealer?.city}) from the certified atelier network?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingDealer(null)}
              className="px-4 py-2 rounded-sm bg-[#16181d] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-headline font-semibold uppercase tracking-wider cursor-pointer"
            >
              Decommission Atelier
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
