import { useState } from "react";
import { FiX } from "react-icons/fi";

export default function ShipmentFilterPanel({
  open,
  onClose,
  onApply,
  defaultFilters,
}) {
  const [filters, setFilters] = useState(defaultFilters);

  const toggle = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key]?.includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...(prev[key] || []), value],
    }));
  };

  return (
    open && (
      <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
        <div className="w-full max-w-sm bg-white h-full p-6 overflow-y-auto">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Filters</h2>
            <FiX className="cursor-pointer" onClick={onClose} />
          </div>

          {/* STATUS */}
          <section className="mb-6">
            <h3 className="text-sm font-medium mb-3">Shipment Status</h3>
            {["PENDING", "IN_TRANSIT", "DELIVERED"].map((s) => (
              <label key={s} className="flex items-center gap-2 text-sm mb-2">
                <input
                  type="checkbox"
                  checked={filters.status?.includes(s)}
                  onChange={() => toggle("status", s)}
                />
                {s.replace("_", " ")}
              </label>
            ))}
          </section>

          {/* DELAY RISK */}
          <section className="mb-6">
            <h3 className="text-sm font-medium mb-3">Delay Risk</h3>
            {["LOW", "MEDIUM", "HIGH"].map((r) => (
              <label key={r} className="flex items-center gap-2 text-sm mb-2">
                <input
                  type="checkbox"
                  checked={filters.delayRisk?.includes(r)}
                  onChange={() => toggle("delayRisk", r)}
                />
                {r}
              </label>
            ))}
          </section>

          {/* ASSIGNMENT */}
          <section className="mb-8">
            <h3 className="text-sm font-medium mb-3">Assignment</h3>
            {["ASSIGNED", "UNASSIGNED"].map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm mb-2">
                <input
                  type="checkbox"
                  checked={filters.assignment?.includes(a)}
                  onChange={() => toggle("assignment", a)}
                />
                {a}
              </label>
            ))}
          </section>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => onApply(filters)}
              className="px-5 py-2 bg-[#c6ac8f] text-white rounded-lg text-sm"
            >
              Apply Filters
            </button>
          </div>

        </div>
      </div>
    )
  );
}
