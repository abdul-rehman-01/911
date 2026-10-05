import React, { useState } from 'react';
import { useApp } from '../stores';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Vehicle } from '../types';

export const ComparePage: React.FC = () => {
  const {
    comparedVehicles,
    comparedIds,
    removeFromCompare,
    addToCompare,
    clearComparison,
    vehicles,
    navigateTo,
    setSelectedVehicleId,
    showToast,
  } = useApp();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(true);

  // Available vehicles that can be added to comparison
  const availableToAdd = vehicles.filter((v) => !comparedIds.includes(v.id));

  // Helper to determine best in class for numerical specs
  const maxHp = Math.max(...comparedVehicles.map((v) => v.telemetry.outputHp), 0);
  const bestAcceleration = Math.min(
    ...comparedVehicles.map((v) => v.telemetry.acceleration0to100),
    100
  );
  const maxTopSpeed = Math.max(...comparedVehicles.map((v) => v.telemetry.topSpeedKmh), 0);
  const maxTorque = Math.max(...comparedVehicles.map((v) => v.telemetry.torqueNm), 0);

  if (comparedVehicles.length === 0) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-16">
        <EmptyState
          icon="compare_arrows"
          title="Telemetry Comparison Matrix Empty"
          description="You have not staged any performance machines for head-to-head dyno comparison. Browse our inventory and select 'Compare' on up to 4 vehicles."
          actionLabel="Explore Inventory"
          onAction={() => navigateTo('explore-cars')}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Page Header */}
      <section className="w-full bg-[#111317] border-b border-white/8 py-6">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#e11d48] rounded-sm" />
              <h1 className="font-headline font-bold text-2xl sm:text-3xl text-white uppercase tracking-tight">
                Side-by-Side Dyno &amp; Spec Matrix
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-[#e11d48]/20 text-[#ffb3b6] border border-[#e11d48]/30">
                {comparedVehicles.length} of 4 Staged
              </span>
            </div>
            <p className="font-body text-xs text-[#b9c8de]">
              Direct factory output curves, power-to-weight, apex braking, and homologation comparison.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-mono text-[#b9c8de] cursor-pointer">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="w-4 h-4 accent-[#e11d48] rounded-sm"
              />
              <span>Highlight Leaders</span>
            </label>

            {comparedVehicles.length < 4 && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<span className="material-symbols-outlined text-[16px]">add</span>}
                onClick={() => setAddModalOpen(true)}
              >
                Add Vehicle
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={clearComparison}>
              Clear Matrix
            </Button>
          </div>
        </div>
      </section>

      {/* Main Comparison Matrix Board */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 overflow-x-auto">
        <div className="min-w-[800px] flex flex-col gap-8">
          {/* 1. Vehicle Cards Header Row */}
          <div className="grid grid-cols-5 gap-4 items-stretch">
            {/* Label Column */}
            <div className="p-4 bg-[#1a1c20] rounded-xl border border-white/8 flex flex-col justify-end">
              <span className="font-mono text-[10px] text-[#b9c8de] uppercase tracking-wider">
                Telemetry Protocol
              </span>
              <h3 className="font-headline font-bold text-lg text-white">Staged Allocations</h3>
              <span className="font-body text-xs text-[#b9c8de]/70 mt-1">
                Comparing {comparedVehicles.length} of max 4 vehicles.
              </span>
            </div>

            {/* Vehicle Card Columns */}
            {comparedVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-[#1a1c20] rounded-xl overflow-hidden border border-white/8 shadow-md flex flex-col justify-between group"
              >
                <div className="relative w-full h-40 bg-[#0c0e12] overflow-hidden">
                  <img
                    src={vehicle.primaryImage}
                    alt={vehicle.model}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c20] via-transparent to-transparent opacity-80" />
                  <button
                    type="button"
                    onClick={() => removeFromCompare(vehicle.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-sm bg-[#0c0e12]/80 hover:bg-[#e11d48] text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove from comparison"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                  <span className="absolute bottom-2 left-2 bg-[#0c0e12]/85 font-mono text-[10px] text-[#ffb3b6] px-2 py-0.5 rounded-sm">
                    {vehicle.make}
                  </span>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                  <div>
                    <h4 className="font-headline font-semibold text-sm text-white truncate">
                      {vehicle.model}
                    </h4>
                    <span className="font-mono text-xs text-[#b9c8de]">
                      {vehicle.year} • {vehicle.bodyClass}
                    </span>
                    <div className="font-mono text-base font-bold text-white mt-1">
                      ${vehicle.priceUsd.toLocaleString()}
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setSelectedVehicleId(vehicle.id);
                      navigateTo('vehicle-details', { vehicleId: vehicle.id });
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}

            {/* Empty Slot if less than 4 */}
            {Array.from({ length: 4 - comparedVehicles.length }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="bg-[#1a1c20]/50 hover:bg-[#1a1c20] border border-dashed border-white/15 hover:border-[#e11d48]/50 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer group min-h-[220px]"
              >
                <div className="w-10 h-10 rounded-sm bg-[#0c0e12] text-[#b9c8de] group-hover:text-[#e11d48] flex items-center justify-center border border-white/10 transition-colors">
                  <span className="material-symbols-outlined text-[24px]">add</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline font-semibold text-xs text-white">
                    Add Vehicle Slot
                  </span>
                  <span className="font-mono text-[10px] text-[#b9c8de]">
                    Compare up to 4 models
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* 2. Key Performance Attributes Table */}
          <div className="bg-[#1a1c20] rounded-xl border border-white/8 overflow-hidden shadow-sm">
            <div className="bg-[#1e2024] p-3 px-4 border-b border-white/8 flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-[#e11d48] uppercase tracking-wider">
                01 // Performance &amp; Dyno Benchmarks
              </span>
              <span className="font-mono text-[10px] text-[#b9c8de]">Factory Certified Homeland Values (Demo)</span>
            </div>

            <div className="flex flex-col divide-y divide-white/5 font-mono text-xs">
              {/* Output Power */}
              <div className="grid grid-cols-5 p-3 items-center">
                <span className="text-[#b9c8de] uppercase text-[11px]">Output Power</span>
                {comparedVehicles.map((v) => {
                  const isLeader = highlightDifferences && v.telemetry.outputHp === maxHp;
                  return (
                    <div key={v.id} className="flex items-center gap-1.5">
                      <span className={`font-bold ${isLeader ? 'text-[#4ade80]' : 'text-white'}`}>
                        {v.telemetry.outputHp} HP
                      </span>
                      {isLeader && (
                        <span className="text-[10px] bg-[#4ade80]/20 text-[#4ade80] px-1 rounded-sm uppercase">
                          Peak
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 0-100 km/h */}
              <div className="grid grid-cols-5 p-3 items-center bg-[#0c0e12]/20">
                <span className="text-[#b9c8de] uppercase text-[11px]">0–100 km/h Sprint</span>
                {comparedVehicles.map((v) => {
                  const isLeader =
                    highlightDifferences && v.telemetry.acceleration0to100 === bestAcceleration;
                  return (
                    <div key={v.id} className="flex items-center gap-1.5">
                      <span className={`font-bold ${isLeader ? 'text-[#4ade80]' : 'text-white'}`}>
                        {v.telemetry.acceleration0to100} s
                      </span>
                      {isLeader && (
                        <span className="text-[10px] bg-[#4ade80]/20 text-[#4ade80] px-1 rounded-sm uppercase">
                          Fastest
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Max Track Speed */}
              <div className="grid grid-cols-5 p-3 items-center">
                <span className="text-[#b9c8de] uppercase text-[11px]">Terminal Track Speed</span>
                {comparedVehicles.map((v) => {
                  const isLeader = highlightDifferences && v.telemetry.topSpeedKmh === maxTopSpeed;
                  return (
                    <div key={v.id} className="flex items-center gap-1.5">
                      <span className={`font-bold ${isLeader ? 'text-[#4ade80]' : 'text-white'}`}>
                        {v.telemetry.topSpeedKmh} km/h
                      </span>
                      <span className="text-[#b9c8de]/70 text-[10px]">({v.telemetry.topSpeedMph} mph)</span>
                    </div>
                  );
                })}
              </div>

              {/* Torque */}
              <div className="grid grid-cols-5 p-3 items-center bg-[#0c0e12]/20">
                <span className="text-[#b9c8de] uppercase text-[11px]">Peak Torque</span>
                {comparedVehicles.map((v) => {
                  const isLeader = highlightDifferences && v.telemetry.torqueNm === maxTorque;
                  return (
                    <div key={v.id} className="flex items-center gap-1.5">
                      <span className={`font-bold ${isLeader ? 'text-[#4ade80]' : 'text-white'}`}>
                        {v.telemetry.torqueNm} NM
                      </span>
                      <span className="text-[#b9c8de]/70 text-[10px]">({v.telemetry.torqueLbFt} lb-ft)</span>
                    </div>
                  );
                })}
              </div>

              {/* Drivetrain & Vectoring */}
              <div className="grid grid-cols-5 p-3 items-center">
                <span className="text-[#b9c8de] uppercase text-[11px]">Drivetrain</span>
                {comparedVehicles.map((v) => (
                  <div key={v.id} className="text-white font-medium">
                    {v.telemetry.drivetrain}
                  </div>
                ))}
              </div>

              {/* Transmission */}
              <div className="grid grid-cols-5 p-3 items-center bg-[#0c0e12]/20">
                <span className="text-[#b9c8de] uppercase text-[11px]">Transmission</span>
                {comparedVehicles.map((v) => (
                  <div key={v.id} className="text-white truncate pr-2">
                    {v.telemetry.transmission}
                  </div>
                ))}
              </div>

              {/* Fuel / Powertrain */}
              <div className="grid grid-cols-5 p-3 items-center">
                <span className="text-[#b9c8de] uppercase text-[11px]">Powertrain</span>
                {comparedVehicles.map((v) => (
                  <div key={v.id} className="text-[#ffb3b6]">
                    {v.telemetry.fuelType}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Technical Homologation Matrix Table */}
          <div className="bg-[#1a1c20] rounded-xl border border-white/8 overflow-hidden shadow-sm">
            <div className="bg-[#1e2024] p-3 px-4 border-b border-white/8">
              <span className="font-mono text-xs font-semibold text-[#e11d48] uppercase tracking-wider">
                02 // Chassis &amp; Homologation Matrix
              </span>
            </div>

            <div className="flex flex-col divide-y divide-white/5 font-mono text-xs">
              <div className="grid grid-cols-5 p-3 items-center">
                <span className="text-[#b9c8de] uppercase text-[11px]">Engine Displacement</span>
                {comparedVehicles.map((v) => (
                  <div key={v.id} className="text-white">
                    {v.technicalMatrix.displacementCc > 0
                      ? `${v.technicalMatrix.displacementCc} cc`
                      : 'Dual Electric Motors'}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 p-3 items-center bg-[#0c0e12]/20">
                <span className="text-[#b9c8de] uppercase text-[11px]">Compression Ratio</span>
                {comparedVehicles.map((v) => (
                  <div key={v.id} className="text-white">
                    {v.technicalMatrix.compressionRatio}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 p-3 items-center">
                <span className="text-[#b9c8de] uppercase text-[11px]">Curb Weight (DIN)</span>
                {comparedVehicles.map((v) => (
                  <div key={v.id} className="text-white">
                    {v.technicalMatrix.curbWeightKg.toLocaleString()} kg ({v.technicalMatrix.curbWeightLbs.toLocaleString()} lbs)
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 p-3 items-center bg-[#0c0e12]/20">
                <span className="text-[#b9c8de] uppercase text-[11px]">Drag Coefficient</span>
                {comparedVehicles.map((v) => (
                  <div key={v.id} className="text-white">
                    {v.technicalMatrix.dragCoefficient}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 p-3 items-center">
                <span className="text-[#b9c8de] uppercase text-[11px]">Front Brakes</span>
                {comparedVehicles.map((v) => (
                  <div key={v.id} className="text-white truncate pr-2">
                    {v.technicalMatrix.frontBrakeDisc}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 p-3 items-center bg-[#0c0e12]/20">
                <span className="text-[#b9c8de] uppercase text-[11px]">Fuel / Battery Tank</span>
                {comparedVehicles.map((v) => (
                  <div key={v.id} className="text-white">
                    {v.technicalMatrix.fuelTankCapacityLiters > 0
                      ? `${v.technicalMatrix.fuelTankCapacityLiters} Liters`
                      : '100% Electric'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal (Max 4 check) */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Stage Vehicle for Comparison"
        subtitle={`Select Allocation (${comparedVehicles.length} of 4 Staged)`}
        maxWidth="xl"
      >
        <div className="flex flex-col gap-4">
          <p className="font-body text-xs text-[#b9c8de]">
            Choose an allocation from our catalog to compare telemetry parameters, acceleration, and mechanical specs.
          </p>

          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
            {availableToAdd.map((v) => (
              <div
                key={v.id}
                onClick={() => {
                  const added = addToCompare(v.id);
                  if (added) {
                    setAddModalOpen(false);
                  }
                }}
                className="p-3 bg-[#0c0e12] hover:bg-[#1e2024] rounded-sm border border-white/10 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={v.primaryImage}
                    alt={v.model}
                    className="w-16 h-10 object-cover rounded-sm border border-white/5"
                  />
                  <div className="flex flex-col">
                    <span className="font-headline font-semibold text-xs text-white">
                      {v.year} {v.make} {v.model}
                    </span>
                    <span className="font-mono text-[10px] text-[#b9c8de]">
                      {v.bodyClass} • {v.telemetry.outputHp} HP • ${v.priceUsd.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button variant="secondary" size="sm">
                  Add +
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-white/10">
            <Button variant="ghost" size="sm" onClick={() => setAddModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
