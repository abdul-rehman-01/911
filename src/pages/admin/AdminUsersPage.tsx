import React, { useState, useEffect } from 'react';
import { RoutePath, UserProfile } from '../../types';
import { adminService } from '../../services/adminService';
import { useApp } from '../../stores';
import { Modal } from '../../components/common/Modal';

export interface AdminUsersPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = () => {
  const { session, showToast } = useApp();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  // Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1 (555) 019-2831');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [membershipTier, setMembershipTier] = useState<'Platinum' | 'Track VIP' | 'Private Collector'>('Platinum');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchUsers();
      setUsers(data);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to load user accounts.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleOpenCreate = () => {
    setFullName('');
    setEmail('');
    setPhone('+1 (555) 019-2831');
    setRole('user');
    setMembershipTier('Platinum');
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (u: UserProfile) => {
    setEditingUser(u);
    setFullName(u.fullName);
    setEmail(u.email);
    setPhone(u.phone || '');
    setRole(u.role);
    setMembershipTier(u.membershipTier);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    try {
      const created = await adminService.createUser({
        fullName,
        email,
        phone,
        role,
        membershipTier,
      });

      setUsers((prev) => [...prev, created]);
      setCreateModalOpen(false);
      showToast({
        type: 'success',
        title: 'User Profile Created',
        message: `${created.fullName} (${created.membershipTier}) registered.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to create user.' });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updatedUser: UserProfile = {
        ...editingUser,
        fullName,
        phone,
        role,
        membershipTier,
      };

      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setEditingUser(null);
      showToast({
        type: 'success',
        title: 'User Updated',
        message: `Accreditation for ${updatedUser.fullName} updated.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update user.' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    if (deletingUser.id === session.user?.id) {
      showToast({
        type: 'error',
        title: 'Operation Refused',
        message: 'You cannot delete the active administrator account currently logged in.',
      });
      setDeletingUser(null);
      return;
    }

    try {
      await adminService.deleteUser(deletingUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      showToast({
        type: 'info',
        title: 'Account Deleted',
        message: `${deletingUser.fullName} removed from registry.`,
      });
      setDeletingUser(null);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete user.' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Control Bar */}
      <div className="p-4 rounded-sm bg-[#0e1014] border border-white/8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#869ab8]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full pl-9 pr-3 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-xs text-white placeholder-[#869ab8] focus:outline-hidden focus:border-[#e11d48]"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-xs text-white font-mono cursor-pointer"
          >
            <option value="all">All Clearance Roles</option>
            <option value="user">VIP Member</option>
            <option value="admin">Platform Director (Admin)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-sm bg-[#e11d48] hover:bg-[#be123c] text-white font-headline text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_14px_rgba(225,29,72,0.35)] transition-all cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Accredit New User</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0e1014] border border-white/8 rounded-sm overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/8 bg-[#121418] font-mono text-[10px] uppercase tracking-[0.14em] text-[#869ab8]">
              <th className="py-3 px-4">Client Identity</th>
              <th className="py-3 px-4">Direct Contact</th>
              <th className="py-3 px-4">Clearance Role</th>
              <th className="py-3 px-4">Membership Tier</th>
              <th className="py-3 px-4">Account ID</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-body">
            {filtered.length > 0 ? (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-sm flex items-center justify-center font-headline font-bold text-xs ${
                        u.role === 'admin' ? 'bg-[#e11d48] text-white' : 'bg-[#1a1c20] text-[#ffb3b6] border border-white/10'
                      }`}>
                        {u.fullName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline font-semibold text-white text-xs">{u.fullName}</span>
                        <span className="font-mono text-[10px] text-[#869ab8]">{u.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#b9c8de]">
                    {u.phone || 'No phone registered'}
                  </td>

                  <td className="py-3.5 px-4">
                    {u.role === 'admin' ? (
                      <span className="px-2 py-0.5 rounded-xs bg-[#e11d48]/20 border border-[#e11d48]/40 text-[#ffb3b6] font-mono text-[10px] font-bold uppercase tracking-wider">
                        Director Admin
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-xs bg-white/5 border border-white/10 text-[#b9c8de] font-mono text-[10px] uppercase">
                        Client Member
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#4ade80] font-semibold">
                    {u.membershipTier}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[10px] text-[#869ab8]">
                    {u.id}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="p-1 rounded-sm text-[#38bdf8] hover:text-white hover:bg-[#38bdf8]/10 cursor-pointer"
                        title="Edit User Accreditation"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>

                      {u.id !== session.user?.id && (
                        <button
                          type="button"
                          onClick={() => setDeletingUser(u)}
                          className="p-1 rounded-sm text-[#ffb4ab] hover:text-white hover:bg-red-500/10 cursor-pointer"
                          title="Delete User"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs font-mono text-[#869ab8]">
                  {loading ? 'Retrieving accredited profiles...' : 'No users found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Accredit User Profile"
        subtitle="Security & Identity Operations"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCreate} className="flex flex-col gap-4 text-xs font-body">
          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sterling Archer"
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="driver@car911.com"
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Phone Line</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Clearance Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              >
                <option value="user">VIP Member</option>
                <option value="admin">Platform Director (Admin)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Membership Tier</label>
            <select
              value={membershipTier}
              onChange={(e) => setMembershipTier(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
            >
              <option value="Platinum">Platinum</option>
              <option value="Track VIP">Track VIP</option>
              <option value="Private Collector">Private Collector</option>
            </select>
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
              Accredit Account
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title="Edit User Accreditation"
        subtitle={`ID: ${editingUser?.id}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-xs font-body">
          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Phone Line</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Clearance Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              >
                <option value="user">VIP Member</option>
                <option value="admin">Platform Director (Admin)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Membership Tier</label>
              <select
                value={membershipTier}
                onChange={(e) => setMembershipTier(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              >
                <option value="Platinum">Platinum</option>
                <option value="Track VIP">Track VIP</option>
                <option value="Private Collector">Private Collector</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
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
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        title="Confirm Account Deletion"
        subtitle="Security Identity Desk"
        maxWidth="md"
      >
        <div className="flex flex-col gap-4 text-xs font-body">
          <p className="text-[#b9c8de]">
            Are you sure you want to revoke credentials and eliminate <span className="text-white font-bold">{deletingUser?.fullName}</span> ({deletingUser?.email}) from the user registry?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingUser(null)}
              className="px-4 py-2 rounded-sm bg-[#16181d] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-headline font-semibold uppercase tracking-wider cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
