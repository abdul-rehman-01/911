import React, { useState, useEffect } from 'react';
import { RoutePath, Brand } from '../../types';
import { adminService } from '../../services/adminService';
import { useApp } from '../../stores';
import { Modal } from '../../components/common/Modal';

export interface AdminBrandsPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const AdminBrandsPage: React.FC<AdminBrandsPageProps> = () => {
  const { showToast } = useApp();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);

  // Form
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Germany');
  const [logoUrl, setLogoUrl] = useState('');

  const loadBrands = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchBrands();
      setBrands(data);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to load marque directory.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.country && b.country.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenCreate = () => {
    setName('');
    setCountry('Germany');
    setLogoUrl('');
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setCountry(b.country || 'Global');
    setLogoUrl(b.logoUrl || '');
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const created = await adminService.createBrand({ name, country, logoUrl });
      setBrands((prev) => [...prev, created]);
      setCreateModalOpen(false);
      showToast({
        type: 'success',
        title: 'Brand Registered',
        message: `${created.name} registered into automotive directory.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to register brand.' });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;

    try {
      const updated = await adminService.updateBrand(editingBrand.id, { name, country, logoUrl });
      setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setEditingBrand(null);
      showToast({
        type: 'success',
        title: 'Brand Updated',
        message: `${updated.name} specifications updated.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update brand.' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBrand) return;
    try {
      await adminService.deleteBrand(deletingBrand.id);
      setBrands((prev) => prev.filter((b) => b.id !== deletingBrand.id));
      showToast({
        type: 'info',
        title: 'Brand Removed',
        message: `${deletingBrand.name} removed from marque registry.`,
      });
      setDeletingBrand(null);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete brand.' });
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
            placeholder="Filter marque or country..."
            className="w-full pl-9 pr-3 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-xs text-white placeholder-[#869ab8] focus:outline-hidden focus:border-[#e11d48]"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-sm bg-[#e11d48] hover:bg-[#be123c] text-white font-headline text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_14px_rgba(225,29,72,0.35)] transition-all cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Register New Brand</span>
        </button>
      </div>

      {/* Brands Table */}
      <div className="bg-[#0e1014] border border-white/8 rounded-sm overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/8 bg-[#121418] font-mono text-[10px] uppercase tracking-[0.14em] text-[#869ab8]">
              <th className="py-3 px-4">Marque / Brand</th>
              <th className="py-3 px-4">Country of Origin</th>
              <th className="py-3 px-4">Identifier / Slug</th>
              <th className="py-3 px-4">Allocated Units</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-body">
            {filteredBrands.length > 0 ? (
              filteredBrands.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {b.logoUrl ? (
                        <img
                          src={b.logoUrl}
                          alt={b.name}
                          className="w-8 h-8 rounded-xs object-cover border border-white/10 bg-[#16181d]"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-xs bg-[#16181d] border border-white/10 flex items-center justify-center text-white font-headline font-bold text-xs">
                          {b.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-headline font-semibold text-white text-xs">
                        {b.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#b9c8de]">
                    {b.country || 'Global'}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#869ab8]">
                    {b.id}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-white">
                    {b.vehicleCount || 1} models
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(b)}
                        className="p-1 rounded-sm text-[#38bdf8] hover:text-white hover:bg-[#38bdf8]/10 cursor-pointer"
                        title="Edit Brand"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingBrand(b)}
                        className="p-1 rounded-sm text-[#ffb4ab] hover:text-white hover:bg-red-500/10 cursor-pointer"
                        title="Delete Brand"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-xs font-mono text-[#869ab8]">
                  {loading ? 'Retrieving marques...' : 'No brands registered.'}
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
        title="Register Marque / Manufacturer"
        subtitle="Catalog Classification"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCreate} className="flex flex-col gap-4 text-xs font-body">
          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Brand Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bugatti"
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. France"
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Logo URL (Optional)</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
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
              Register Marque
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={Boolean(editingBrand)}
        onClose={() => setEditingBrand(null)}
        title="Edit Marque"
        subtitle={`Marque ID: ${editingBrand?.id}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-xs font-body">
          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Brand Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Logo URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
            <button
              type="button"
              onClick={() => setEditingBrand(null)}
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
        isOpen={Boolean(deletingBrand)}
        onClose={() => setDeletingBrand(null)}
        title="Confirm Marque Removal"
        subtitle="Catalog Elimination"
        maxWidth="md"
      >
        <div className="flex flex-col gap-4 text-xs font-body">
          <p className="text-[#b9c8de]">
            Are you sure you want to remove <span className="text-white font-bold">{deletingBrand?.name}</span> from the platform directory?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingBrand(null)}
              className="px-4 py-2 rounded-sm bg-[#16181d] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-headline font-semibold uppercase tracking-wider cursor-pointer"
            >
              Delete Brand
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
