import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface PortfolioFilterProps {
  industries: string[];
  activeType: "all" | "apps" | "prompts";
  activeIndustry: string;
  searchQuery: string;
  onTypeChange: (type: "all" | "apps" | "prompts") => void;
  onIndustryChange: (industry: string) => void;
  onSearchChange: (query: string) => void;
  totalResults: number;
}

export function PortfolioFilter({
  industries,
  activeType,
  activeIndustry,
  searchQuery,
  onTypeChange,
  onIndustryChange,
  onSearchChange,
  totalResults,
}: PortfolioFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const types = [
    { key: "all" as const, label: "All", count: null },
    { key: "apps" as const, label: "Web Apps", count: 20 },
    { key: "prompts" as const, label: "AI Prompts", count: 40 },
  ];

  return (
    <div className="mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search portfolio by name, industry, or keyword..."
          className="w-full pl-11 pr-12 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
            showFilters ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Type Tabs */}
      <div className="flex justify-center gap-1">
        {types.map((type) => (
          <button
            key={type.key}
            onClick={() => onTypeChange(type.key)}
            className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeType === type.key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeType === type.key && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary/10 rounded-lg"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{type.label}</span>
            {type.count !== null && (
              <span className="relative z-10 ml-1.5 text-xs opacity-60">
                {type.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Industry Filter */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap justify-center gap-1.5 pt-2">
              <button
                onClick={() => onIndustryChange("")}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  activeIndustry === ""
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                All Industries
              </button>
              {industries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => onIndustryChange(industry)}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    activeIndustry === industry
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {(searchQuery || activeIndustry || activeType !== "all") && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-muted-foreground"
        >
          {totalResults} {totalResults === 1 ? "result" : "results"} found
          {searchQuery && <> for "<span className="text-foreground font-medium">{searchQuery}</span>"</>}
          {activeIndustry && <> in <span className="text-foreground font-medium">{activeIndustry}</span></>}
        </motion.p>
      )}
    </div>
  );
}
