import React, { useState, useEffect } from 'react';
import { RoutePath, Service } from '../../types';
import { adminService } from '../../services/adminService';
import { useApp } from '../../stores';
import { Modal } from '../../components/common/Modal';

export interface AdminServicesPageProps {
  onNavigate: (route: RoutePath, params?: { serviceId?: string }) => void;
}

export const AdminServicesPage: React.FC<AdminServicesPageProps> = ({ onNavigate }) => {
  const { showToast, setSelectedServiceId } = useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  // Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Concierge Engineering');
  const [priceEstimate, setPriceEstimate] = useState('$1,200');
  const [turnaroundTime, setTurnaroundTime] = useState('24-48 Hours');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [featuresStr, setFeaturesStr] = useState('ECU Diagnostics, Dynamometer Interrogation, Suspension Alignment');

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchServices();
      setServices(data);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to load concierge programs.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setName('');
    setCategory('Concierge Engineering');
    setPriceEstimate('$1,500');
    setTurnaroundTime('24-48 Hours');
    setShortDescription('Comprehensive trackside inspection and telemetry benchmarking.');
    setFullDescription('White-glove technician dispatched with mobile dynamometer unit for complete system diagnostics.');
    setFeaturesStr('ECU Audit, Spectrum Audio Analysis, Laser Alignment');
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (s: Service) => {
    setEditingService(s);
    setName(s.name);
    setCategory(s.category);
    setPriceEstimate(s.priceEstimate);
    setTurnaroundTime(s.turnaroundTime);
    setShortDescription(s.shortDescription);
    setFullDescription(s.fullDescription);
    setFeaturesStr(s.features.join(', '));
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const features = featuresStr.split(',').map((f) => f.trim()).filter(Boolean);
      const created = await adminService.createService({
        name,
        category,
        priceEstimate,
        turnaroundTime,
        shortDescription,
        fullDescription,
        features,
        icon: 'engineering',
      });

      setServices((prev) => [...prev, created]);
      setCreateModalOpen(false);
      showToast({
        type: 'success',
        title: 'Service Program Catalogued',
        message: `${created.name} added to concierge services.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to create service.' });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      const features = featuresStr.split(',').map((f) => f.trim()).filter(Boolean);
      const updated = await adminService.updateService(editingService.id, {
        name,
        category,
        priceEstimate,
        turnaroundTime,
        shortDescription,
        fullDescription,
        features,
      });

      setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingService(null);
      showToast({
        type: 'success',
        title: 'Service Updated',
        message: `${updated.name} updated successfully.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update service.' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingService) return;
    try {
      await adminService.deleteService(deletingService.id);
      setServices((prev) => prev.filter((s) => s.id !== deletingService.id));
      showToast({
        type: 'info',
        title: 'Service Decommissioned',
        message: `${deletingService.name} removed from catalog.`,
      });
      setDeletingService(null);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete service.' });
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
            placeholder="Search service program or category..."
            className="w-full pl-9 pr-3 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-xs text-white placeholder-[#869ab8] focus:outline-hidden focus:border-[#e11d48]"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-sm bg-[#e11d48] hover:bg-[#be123c] text-white font-headline text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_14px_rgba(225,29,72,0.35)] transition-all cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Catalog New Program</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0e1014] border border-white/8 rounded-sm overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/8 bg-[#121418] font-mono text-[10px] uppercase tracking-[0.14em] text-[#869ab8]">
              <th className="py-3 px-4">Concierge Program</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Price Estimate</th>
              <th className="py-3 px-4">Turnaround Duration</th>
              <th className="py-3 px-4">Features</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-body">
            {filtered.length > 0 ? (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-headline font-semibold text-white text-xs">{s.name}</span>
                      <span className="font-body text-[11px] text-[#869ab8] line-clamp-1 max-w-xs">{s.shortDescription}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#38bdf8]">
                    {s.category}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-white">
                    {s.priceEstimate}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#b9c8de]">
                    {s.turnaroundTime}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[10px] text-[#869ab8] max-w-xs truncate">
                    {s.features.slice(0, 2).join(' · ')}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedServiceId(s.id);
                          onNavigate('service-details', { serviceId: s.id });
                        }}
                        className="p-1 rounded-sm text-[#b9c8de] hover:text-white hover:bg-white/5 cursor-pointer"
                        title="View Public Page"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(s)}
                        className="p-1 rounded-sm text-[#38bdf8] hover:text-white hover:bg-[#38bdf8]/10 cursor-pointer"
                        title="Edit Program"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingService(s)}
                        className="p-1 rounded-sm text-[#ffb4ab] hover:text-white hover:bg-red-500/10 cursor-pointer"
                        title="Delete Program"
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
                  {loading ? 'Interrogating concierge catalog...' : 'No services catalogued.'}
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
        title="Catalog Concierge Service Program"
        subtitle="Operations Desk"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCreate} className="flex flex-col gap-4 text-xs font-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Service Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aero Wind-Tunnel Simulation"
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Aerodynamics"
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Starting Price Estimate</label>
              <input
                type="text"
                value={priceEstimate}
                onChange={(e) => setPriceEstimate(e.target.value)}
                placeholder="e.g. $1,500"
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Estimated Turnaround Duration</label>
              <input
                type="text"
                value={turnaroundTime}
                onChange={(e) => setTurnaroundTime(e.target.value)}
                placeholder="e.g. 24-48 Hours"
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Short Description</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Full Technical Description</label>
            <textarea
              rows={3}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Features (Comma-separated)</label>
            <input
              type="text"
              value={featuresStr}
              onChange={(e) => setFeaturesStr(e.target.value)}
              placeholder="Feature 1, Feature 2, Feature 3"
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
            />
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
              Catalog Program
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={Boolean(editingService)}
        onClose={() => setEditingService(null)}
        title="Edit Program Specifications"
        subtitle={`ID: ${editingService?.id}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-xs font-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Price</label>
              <input
                type="text"
                value={priceEstimate}
                onChange={(e) => setPriceEstimate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Turnaround Duration</label>
              <input
                type="text"
                value={turnaroundTime}
                onChange={(e) => setTurnaroundTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Features (Comma-separated)</label>
            <input
              type="text"
              value={featuresStr}
              onChange={(e) => setFeaturesStr(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
            <button
              type="button"
              onClick={() => setEditingService(null)}
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
        isOpen={Boolean(deletingService)}
        onClose={() => setDeletingService(null)}
        title="Confirm Service Decommission"
        subtitle="Catalog Removal"
        maxWidth="md"
      >
        <div className="flex flex-col gap-4 text-xs font-body">
          <p className="text-[#b9c8de]">
            Are you sure you want to remove <span className="text-white font-bold">{deletingService?.name}</span> from the concierge maintenance catalog?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingService(null)}
              className="px-4 py-2 rounded-sm bg-[#16181d] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-headline font-semibold uppercase tracking-wider cursor-pointer"
            >
              Decommission Service
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
