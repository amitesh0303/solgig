"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { JOB_CATEGORIES, STATUS_LABELS } from "@/lib/constants";

export interface FilterState {
  search: string;
  status: string;
  category: string;
  minBudget: string;
  maxBudget: string;
}

interface JobFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const STATUS_OPTIONS = ["open", "in_progress", "completed", "disputed"];

export function JobFilters({ filters, onChange }: JobFiltersProps) {
  const [expanded, setExpanded] = useState(true);

  const update = (key: keyof FilterState, value: string) =>
    onChange({ ...filters, [key]: value });

  const clearAll = () =>
    onChange({ search: "", status: "", category: "", minBudget: "", maxBudget: "" });

  const hasActive =
    filters.status || filters.category || filters.minBudget || filters.maxBudget;

  return (
    <div className="rounded-xl border border-purple-900/30 bg-[#1a0f2e] overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">Filters</span>
          {hasActive && (
            <span className="h-2 w-2 rounded-full bg-purple-500" />
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-purple-900/20 pt-4">
          {/* Search */}
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => update("search", e.target.value)}
                placeholder="Keywords..."
                className="w-full rounded-lg border border-purple-900/40 bg-[#12091f] pl-8 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1.5">Status</label>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => update("status", "")}
                className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  !filters.status
                    ? "bg-purple-600/30 text-purple-300"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                All
              </button>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => update("status", s)}
                  className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    filters.status === s
                      ? "bg-purple-600/30 text-purple-300"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1.5">Category</label>
            <select
              value={filters.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full rounded-lg border border-purple-900/40 bg-[#12091f] px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {JOB_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Budget range */}
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1.5">
              Budget Range ($)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={0}
                value={filters.minBudget}
                onChange={(e) => update("minBudget", e.target.value)}
                placeholder="Min"
                className="w-full rounded-lg border border-purple-900/40 bg-[#12091f] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
              />
              <span className="text-gray-600 text-xs shrink-0">to</span>
              <input
                type="number"
                min={0}
                value={filters.maxBudget}
                onChange={(e) => update("maxBudget", e.target.value)}
                placeholder="Max"
                className="w-full rounded-lg border border-purple-900/40 bg-[#12091f] px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Clear */}
          {hasActive && (
            <button
              onClick={clearAll}
              className="w-full text-xs text-gray-500 hover:text-purple-400 transition-colors py-1"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
