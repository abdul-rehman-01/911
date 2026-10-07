import React, { useState, useEffect, useMemo } from 'react';
import { RoutePath, Vehicle } from '../../types';
import { adminService } from '../../services/adminService';
import { useApp } from '../../stores';
import { Modal } from '../../components/common/Modal';

export interface AdminVehiclesPageProps {
  onNavigate: (route: RoutePath, params?: { vehicleId?: string; serviceId?: string; dealerId?: string }) => void;
}

export const AdminVehiclesPage: React.FC<AdminVehiclesPageProps> = ({ onNavigate }) => {
  const { showToast, setSelectedVehicleId } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterClass, setFilterClass] = useState('all');

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  // Form State
  const initialFormData = {
    make: 'Porsche',
    model: '',
    year: 2024,
    trim: 'GTS',
    chassisCode: '992.2',
    vin: '',
    priceUsd: 180000,
    outputHp: 480,
    torqueLbFt: 420,
    acceleration0to100: 3.2,
    topSpeedMph: 193,
    transmission: '8-Speed Dual-Clutch (PDK)',
    drivetrain: 'AWD',
    fuelType: 'Petrol Twin-Turbo',
    mileageMiles: 1200,
    bodyClass: 'Coupe',
    exteriorColor: 'Guards Red',
    interiorColor: 'Black Leather / Alcantara',
    primaryImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    isCertified: true,
  };
  const [formData, setFormData] = useState(initialFormData);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await adminService.fetchVehicles();
      setVehicles(data);
    } catch {
      showToast({
        type: 'error',
        title: 'Query Error',
        message: 'Could not load vehicle listings.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch =
        search.trim() === '' ||
        v.make.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase()) ||
        v.vin.toLowerCase().includes(search.toLowerCase()) ||
        v.trim.toLowerCase().includes(search.toLowerCase());

      const matchBrand = filterBrand === 'all' || v.make.toLowerCase() === filterBrand.toLowerCase();
      const matchClass = filterClass === 'all' || v.bodyClass.toLowerCase() === filterClass.toLowerCase();

      return matchSearch && matchBrand && matchClass;
    });
  }, [vehicles, search, filterBrand, filterClass]);

  const handleOpenCreate = () => {
    setFormData({
      ...initialFormData,
      vin: `WP0AA2A91RS${Date.now().toString().slice(-6)}`,
    });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({
      make: v.make,
      model: v.model,
      year: v.year,
      trim: v.trim,
      chassisCode: v.chassisCode,
      vin: v.vin,
      priceUsd: v.priceUsd,
      outputHp: v.telemetry.outputHp,
      torqueLbFt: v.telemetry.torqueLbFt,
      acceleration0to100: v.telemetry.acceleration0to100,
      topSpeedMph: v.telemetry.topSpeedMph,
      transmission: v.telemetry.transmission,
      drivetrain: v.telemetry.drivetrain,
      fuelType: v.telemetry.fuelType,
      mileageMiles: v.telemetry.mileageMiles,
      bodyClass: v.bodyClass,
      exteriorColor: v.exteriorColor,
      interiorColor: v.interiorColor,
      primaryImage: v.primaryImage,
      isCertified: v.isCertified,
    });
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.model.trim()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Model name is required.' });
      return;
    }

    try {
      const created = await adminService.createVehicle({
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        trim: formData.trim,
        chassisCode: formData.chassisCode,
        vin: formData.vin,
        priceUsd: Number(formData.priceUsd),
        bodyClass: formData.bodyClass as any,
        exteriorColor: formData.exteriorColor,
        interiorColor: formData.interiorColor,
        primaryImage: formData.primaryImage,
        isCertified: formData.isCertified,
        telemetry: {
          outputHp: Number(formData.outputHp),
          peakRpm: 7500,
          acceleration0to100: Number(formData.acceleration0to100),
          topSpeedKmh: Math.round(Number(formData.topSpeedMph) * 1.609),
          topSpeedMph: Number(formData.topSpeedMph),
          torqueNm: Math.round(Number(formData.torqueLbFt) * 1.355),
          torqueLbFt: Number(formData.torqueLbFt),
          torqueRpm: 2500,
          transmission: formData.transmission,
          drivetrain: formData.drivetrain as any,
          mileageMiles: Number(formData.mileageMiles),
          fuelType: formData.fuelType as any,
          engineDisplacement: '3.0L Twin-Turbo',
        },
      });

      setVehicles((prev) => [created, ...prev]);
      setCreateModalOpen(false);
      showToast({
        type: 'success',
        title: 'Vehicle Added',
        message: `${created.year} ${created.make} ${created.model} added to inventory.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to create vehicle listing.' });
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    try {
      const updated = await adminService.updateVehicle(editingVehicle.id, {
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        trim: formData.trim,
        chassisCode: formData.chassisCode,
        priceUsd: Number(formData.priceUsd),
        bodyClass: formData.bodyClass as any,
        exteriorColor: formData.exteriorColor,
        interiorColor: formData.interiorColor,
        primaryImage: formData.primaryImage,
        isCertified: formData.isCertified,
        telemetry: {
          ...editingVehicle.telemetry,
          outputHp: Number(formData.outputHp),
          torqueLbFt: Number(formData.torqueLbFt),
          acceleration0to100: Number(formData.acceleration0to100),
          topSpeedMph: Number(formData.topSpeedMph),
          mileageMiles: Number(formData.mileageMiles),
        },
      });

      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setEditingVehicle(null);
      showToast({
        type: 'success',
        title: 'Vehicle Updated',
        message: `${updated.make} ${updated.model} telemetry updated successfully.`,
      });
    } catch {
      showToast({ type: 'error', title: 'Update Error', message: 'Failed to update vehicle.' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingVehicle) return;
    try {
      await adminService.deleteVehicle(deletingVehicle.id);
      setVehicles((prev) => prev.filter((v) => v.id !== deletingVehicle.id));
      showToast({
        type: 'info',
        title: 'Vehicle Decommissioned',
        message: `${deletingVehicle.make} ${deletingVehicle.model} removed from catalog.`,
      });
      setDeletingVehicle(null);
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete vehicle.' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Control Bar: Search, Filters & Add Action */}
      <div className="p-4 rounded-sm bg-[#0e1014] border border-white/8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#869ab8]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search make, model, VIN, or chassis..."
              className="w-full pl-9 pr-3 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-xs text-white placeholder-[#869ab8] focus:outline-hidden focus:border-[#e11d48]"
            />
          </div>

          {/* Brand Filter */}
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="px-3 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-xs text-white font-mono cursor-pointer"
          >
            <option value="all">All Brands</option>
            <option value="Porsche">Porsche</option>
            <option value="Ferrari">Ferrari</option>
            <option value="McLaren">McLaren</option>
            <option value="Aston Martin">Aston Martin</option>
            <option value="Audi">Audi</option>
            <option value="Lamborghini">Lamborghini</option>
          </select>

          {/* Body Class Filter */}
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-xs text-white font-mono cursor-pointer"
          >
            <option value="all">All Body Classes</option>
            <option value="Coupe">Coupe</option>
            <option value="Supercars">Supercars</option>
            <option value="Cabriolet">Cabriolet</option>
            <option value="Targa">Targa</option>
            <option value="Luxury Sedan">Luxury Sedan</option>
            <option value="Perf SUV">Perf SUV</option>
            <option value="Electric GT">Electric GT</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-sm bg-[#e11d48] hover:bg-[#be123c] text-white font-headline text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_14px_rgba(225,29,72,0.35)] transition-all cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Vehicles Table / Inventory Grid */}
      <div className="bg-[#0e1014] border border-white/8 rounded-sm overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/8 bg-[#121418] font-mono text-[10px] uppercase tracking-[0.14em] text-[#869ab8]">
                <th className="py-3 px-4">Vehicle Chassis</th>
                <th className="py-3 px-3">VIN / Chassis Code</th>
                <th className="py-3 px-3">Valuation</th>
                <th className="py-3 px-3">Performance (Dyno)</th>
                <th className="py-3 px-3">Class</th>
                <th className="py-3 px-3">Certified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-body">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Thumbnail + Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.primaryImage}
                          alt={v.model}
                          className="w-14 h-10 object-cover rounded-xs border border-white/10 shrink-0 bg-[#16181d]"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-headline font-semibold text-white text-xs truncate">
                            {v.year} {v.make} {v.model}
                          </span>
                          <span className="font-mono text-[10px] text-[#869ab8] truncate">
                            Trim: {v.trim}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* VIN */}
                    <td className="py-3 px-3 font-mono text-[11px] text-[#b9c8de]">
                      <div>{v.vin}</div>
                      <div className="text-[10px] text-[#869ab8]">{v.chassisCode}</div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 font-mono">
                      <div className="font-bold text-white text-xs">${v.priceUsd.toLocaleString()}</div>
                      <div className="text-[10px] text-[#869ab8]">${v.estMonthlyUsd || Math.round(v.priceUsd / 60)}/mo</div>
                    </td>

                    {/* Dyno Telemetry */}
                    <td className="py-3 px-3 font-mono text-[11px] text-[#b9c8de]">
                      <div><span className="text-white font-semibold">{v.telemetry.outputHp} HP</span> · {v.telemetry.acceleration0to100}s</div>
                      <div className="text-[10px] text-[#869ab8]">{v.telemetry.topSpeedMph} mph · {v.telemetry.mileageMiles.toLocaleString()} mi</div>
                    </td>

                    {/* Body Class */}
                    <td className="py-3 px-3 font-mono text-[11px] text-[#b9c8de]">
                      {v.bodyClass}
                    </td>

                    {/* Certified */}
                    <td className="py-3 px-3">
                      {v.isCertified ? (
                        <span className="text-[#4ade80] font-mono text-[10px] font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                          Certified
                        </span>
                      ) : (
                        <span className="text-[#869ab8] font-mono text-[10px]">Standard</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVehicleId(v.id);
                            onNavigate('vehicle-details', { vehicleId: v.id });
                          }}
                          className="p-1 rounded-sm text-[#b9c8de] hover:text-white hover:bg-white/5 cursor-pointer"
                          title="View Showroom Page"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(v)}
                          className="p-1 rounded-sm text-[#38bdf8] hover:text-white hover:bg-[#38bdf8]/10 cursor-pointer"
                          title="Edit Vehicle Telemetry"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingVehicle(v)}
                          className="p-1 rounded-sm text-[#ffb4ab] hover:text-white hover:bg-red-500/10 cursor-pointer"
                          title="Delete Vehicle Listing"
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
                    {loading ? 'Interrogating vehicle telemetry...' : 'No vehicles match current criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE VEHICLE MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register Vehicle into Telemetry Fleet"
        subtitle="Car 911 Inventory Registry"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCreate} className="flex flex-col gap-4 text-xs font-body">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Make</label>
              <select
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              >
                <option value="Porsche">Porsche</option>
                <option value="Ferrari">Ferrari</option>
                <option value="McLaren">McLaren</option>
                <option value="Aston Martin">Aston Martin</option>
                <option value="Audi">Audi</option>
                <option value="Lamborghini">Lamborghini</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Model Name</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. 911 GT3 RS"
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Trim</label>
              <input
                type="text"
                value={formData.trim}
                onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Chassis Code</label>
              <input
                type="text"
                value={formData.chassisCode}
                onChange={(e) => setFormData({ ...formData, chassisCode: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Price USD ($)</label>
              <input
                type="number"
                value={formData.priceUsd}
                onChange={(e) => setFormData({ ...formData, priceUsd: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Output HP</label>
              <input
                type="number"
                value={formData.outputHp}
                onChange={(e) => setFormData({ ...formData, outputHp: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Torque (lb-ft)</label>
              <input
                type="number"
                value={formData.torqueLbFt}
                onChange={(e) => setFormData({ ...formData, torqueLbFt: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">0-60 mph (sec)</label>
              <input
                type="number"
                step="0.1"
                value={formData.acceleration0to100}
                onChange={(e) => setFormData({ ...formData, acceleration0to100: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Top Speed (mph)</label>
              <input
                type="number"
                value={formData.topSpeedMph}
                onChange={(e) => setFormData({ ...formData, topSpeedMph: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Body Class</label>
              <select
                value={formData.bodyClass}
                onChange={(e) => setFormData({ ...formData, bodyClass: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              >
                <option value="Coupe">Coupe</option>
                <option value="Supercars">Supercars</option>
                <option value="Cabriolet">Cabriolet</option>
                <option value="Targa">Targa</option>
                <option value="Luxury Sedan">Luxury Sedan</option>
                <option value="Perf SUV">Perf SUV</option>
                <option value="Electric GT">Electric GT</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">VIN Number</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Mileage (Miles)</label>
              <input
                type="number"
                value={formData.mileageMiles}
                onChange={(e) => setFormData({ ...formData, mileageMiles: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Primary Image URL</label>
            <input
              type="url"
              value={formData.primaryImage}
              onChange={(e) => setFormData({ ...formData, primaryImage: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="createCertified"
              checked={formData.isCertified}
              onChange={(e) => setFormData({ ...formData, isCertified: e.target.checked })}
              className="rounded-xs text-[#e11d48]"
            />
            <label htmlFor="createCertified" className="font-mono text-xs text-white cursor-pointer">
              Mark as Factory Certified Pre-Owned
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/8">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-sm bg-[#16181d] hover:bg-[#20232a] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-sm bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-headline font-semibold uppercase tracking-wider cursor-pointer"
            >
              Add Vehicle
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT VEHICLE MODAL */}
      <Modal
        isOpen={Boolean(editingVehicle)}
        onClose={() => setEditingVehicle(null)}
        title="Modify Vehicle Telemetry"
        subtitle={`Chassis: ${editingVehicle?.vin}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-xs font-body">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Make</label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Price USD ($)</label>
              <input
                type="number"
                value={formData.priceUsd}
                onChange={(e) => setFormData({ ...formData, priceUsd: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Output HP</label>
              <input
                type="number"
                value={formData.outputHp}
                onChange={(e) => setFormData({ ...formData, outputHp: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Torque (lb-ft)</label>
              <input
                type="number"
                value={formData.torqueLbFt}
                onChange={(e) => setFormData({ ...formData, torqueLbFt: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-[#869ab8] mb-1">Top Speed (mph)</label>
              <input
                type="number"
                value={formData.topSpeedMph}
                onChange={(e) => setFormData({ ...formData, topSpeedMph: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-sm bg-[#16181d] border border-white/10 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="editCertified"
              checked={formData.isCertified}
              onChange={(e) => setFormData({ ...formData, isCertified: e.target.checked })}
              className="rounded-xs text-[#e11d48]"
            />
            <label htmlFor="editCertified" className="font-mono text-xs text-white cursor-pointer">
              Mark as Factory Certified Pre-Owned
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/8">
            <button
              type="button"
              onClick={() => setEditingVehicle(null)}
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

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(deletingVehicle)}
        onClose={() => setDeletingVehicle(null)}
        title="Confirm Vehicle Decommission"
        subtitle="Catalog Elimination"
        maxWidth="md"
      >
        <div className="flex flex-col gap-4 text-xs font-body">
          <p className="text-[#b9c8de]">
            Are you sure you want to decommission and permanently eliminate this vehicle listing from the catalog?
          </p>

          <div className="p-3 bg-[#121418] border border-white/10 rounded-sm flex items-center gap-3">
            <img
              src={deletingVehicle?.primaryImage}
              alt=""
              className="w-12 h-10 object-cover rounded-xs border border-white/10"
            />
            <div className="flex flex-col font-mono text-xs">
              <span className="font-bold text-white">
                {deletingVehicle?.year} {deletingVehicle?.make} {deletingVehicle?.model}
              </span>
              <span className="text-[#869ab8]">VIN: {deletingVehicle?.vin}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeletingVehicle(null)}
              className="px-4 py-2 rounded-sm bg-[#16181d] text-[#b9c8de] text-xs font-mono border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-headline font-semibold uppercase tracking-wider cursor-pointer"
            >
              Decommission Vehicle
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
