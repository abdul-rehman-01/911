import React, { useState, useEffect } from 'react';
import { RoutePath, Category } from '../../types';
import { adminService } from '../../services/adminService';
import { useApp } from '../../stores';
import { Modal } from '../../components/common/Modal';

export interface AdminCategoriesPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = () => {
  const { showToast } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchCategories();
      setCategories(data);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to load chassis categories.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setDescription(c.description || '');
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const created = await adminService.createCategory({ name, description });
      setCategories((prev) => [...prev, created]);
      setCreateModalOpen(false);
      showToast({
        type: 'success',
        title: 'Category Added',
        message: `${created.name} registered into chassis taxonomy.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to add category.' });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const updated = await adminService.updateCategory(editingCategory.id, { name, description });
      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditingCategory(null);
      showToast({
        type: 'success',
        title: 'Category Updated',
        message: `${updated.name} specifications updated.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update category.' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      await adminService.deleteCategory(deletingCategory.id);
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
      showToast({
        type: 'info',
        title: 'Category Removed',
        message: `${deletingCategory.name} removed from chassis taxonomy.`,
      });
      setDeletingCategory(null);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete category.' });
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
            placeholder="Search category or architecture..."
            className="w-full pl-9 pr-3 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-xs text-white placeholder-[#869ab8] focus:outline-hidden focus:border-[#e11d48]"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-sm bg-[#e11d48] hover:bg-[#be123c] text-white font-headline text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_14px_rgba(225,29,72,0.35)] transition-all cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add New Category</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0e1014] border border-white/8 rounded-sm overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/8 bg-[#121418] font-mono text-[10px] uppercase tracking-[0.14em] text-[#869ab8]">
              <th className="py-3 px-4">Class / Category</th>
              <th className="py-3 px-4">Technical Description</th>
              <th className="py-3 px-4">Identifier Slug</th>
              <th className="py-3 px-4">Allocated Fleet</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-body">
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-headline font-semibold text-white text-xs">
                    {c.name}
                  </td>

                  <td className="py-3.5 px-4 font-body text-xs text-[#b9c8de] max-w-md">
                    {c.description || 'Chassis aerodynamic architecture'}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#869ab8]">
                    {c.id}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-white">
                    {c.vehicleCount || 1} units
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        className="p-1 rounded-sm text-[#38bdf8] hover:text-white hover:bg-[#38bdf8]/10 cursor-pointer"
                        title="Edit Category"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingCategory(c)}
                        className="p-1 rounded-sm text-[#ffb4ab] hover:text-white hover:bg-red-500/10 cursor-pointer"
                        title="Delete Category"
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
                  {loading ? 'Retrieving categories...' : 'No chassis classes registered.'}
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
        title="Register Chassis Category"
        subtitle="Catalog Classification Taxonomy"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCreate} className="flex flex-col gap-4 text-xs font-body">
          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Speedster"
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Technical aerodynamic design description..."
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
              Register Category
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        title="Edit Chassis Category"
        subtitle={`ID: ${editingCategory?.id}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-xs font-body">
          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
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
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        title="Confirm Category Elimination"
        subtitle="Catalog Classification"
        maxWidth="md"
      >
        <div className="flex flex-col gap-4 text-xs font-body">
          <p className="text-[#b9c8de]">
            Are you sure you want to remove <span className="text-white font-bold">{deletingCategory?.name}</span> from the classification taxonomy?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingCategory(null)}
              className="px-4 py-2 rounded-sm bg-[#16181d] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-headline font-semibold uppercase tracking-wider cursor-pointer"
            >
              Delete Category
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
