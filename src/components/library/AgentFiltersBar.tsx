import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { motion } from 'framer-motion';

interface AgentFiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSystem: string;
  onSystemChange: (system: string) => void;
  selectedSetupTime: string;
  onSetupTimeChange: (time: string) => void;
  systems: string[];
  agentCount: number;
}

const setupTimeOptions = [
  { value: '', label: 'Any setup time' },
  { value: '15', label: '< 15 min' },
  { value: '30', label: '15–30 min' },
  { value: '30+', label: '30+ min' },
];

const AgentFiltersBar = ({
  searchQuery,
  onSearchChange,
  selectedSystem,
  onSystemChange,
  selectedSetupTime,
  onSetupTimeChange,
  systems,
  agentCount,
}: AgentFiltersBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = selectedSystem || selectedSetupTime || searchQuery;

  const clearAllFilters = () => {
    onSearchChange('');
    onSystemChange('');
    onSetupTimeChange('');
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Systems */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Tool / System</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSystemChange('')}
            className={`filter-chip ${!selectedSystem ? 'active' : ''}`}
          >
            All
          </button>
          {systems.slice(0, 8).map((system) => (
            <button
              key={system}
              onClick={() => onSystemChange(system)}
              className={`filter-chip ${selectedSystem === system ? 'active' : ''}`}
            >
              {system}
            </button>
          ))}
        </div>
      </div>

      {/* Setup Time */}
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">Setup Time</label>
        <div className="flex flex-wrap gap-2">
          {setupTimeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSetupTimeChange(option.value)}
              className={`filter-chip ${selectedSetupTime === option.value ? 'active' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card border border-border rounded-xl p-4 md:p-6 mb-8"
    >
      {/* Top row: Search + Filter button (mobile) / inline filters (desktop) */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Desktop filters */}
        <div className="hidden md:flex items-center gap-3 flex-wrap">
          <select
            value={selectedSystem}
            onChange={(e) => onSystemChange(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All systems</option>
            {systems.map((system) => (
              <option key={system} value={system}>{system}</option>
            ))}
          </select>

          <select
            value={selectedSetupTime}
            onChange={(e) => onSetupTimeChange(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {setupTimeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Mobile filter trigger */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh]">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span>Filter Agents</span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear all
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
            <div className="mt-8">
              <Button className="w-full" onClick={() => setIsOpen(false)}>
                Show {agentCount} agents
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Results count */}
      <div className="mt-4 text-sm text-muted-foreground">
        {agentCount} agent{agentCount !== 1 ? 's' : ''} found
      </div>
    </motion.div>
  );
};

export default AgentFiltersBar;
