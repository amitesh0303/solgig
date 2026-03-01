"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { JobFilters, type FilterState } from "@/components/JobFilters";
import { MOCK_JOBS } from "@/lib/mockData";

export default function JobsPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    category: "",
    minBudget: "",
    maxBudget: "",
  });

  const filtered = useMemo(() => {
    let jobs = [...MOCK_JOBS];
    if (filters.status) jobs = jobs.filter((j) => j.status === filters.status);
    if (filters.category) jobs = jobs.filter((j) => j.category === filters.category);
    if (filters.minBudget) jobs = jobs.filter((j) => j.budget >= Number(filters.minBudget));
    if (filters.maxBudget) jobs = jobs.filter((j) => j.budget <= Number(filters.maxBudget));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.tags.some((t) => t.toLowerCase().includes(q)) ||
          j.category.toLowerCase().includes(q)
      );
    }
    return jobs;
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#0d0a1a] px-4 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Job Board</h1>
            <p className="text-gray-400 text-sm mt-1">
              {filtered.length} job{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Post Job
          </Link>
        </div>

        {/* Mobile search bar */}
        <div className="relative mb-6 sm:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Search jobs..."
            className="w-full rounded-lg border border-purple-900/40 bg-[#1a0f2e] pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className="hidden sm:block w-64 shrink-0">
            <div className="sticky top-20">
              <JobFilters filters={filters} onChange={setFilters} />
            </div>
          </aside>

          {/* Job list */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="h-12 w-12 text-gray-700 mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">No jobs found</h3>
                <p className="text-sm text-gray-600">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filtered.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
