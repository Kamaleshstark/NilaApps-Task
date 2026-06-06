import { useState, useEffect } from 'react';
import { BookOpen, ClipboardList, Search, Clock, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { ContentComponent } from '../types';
import { fetchComponents } from '../lib/api';

interface LeftPanelProps {
  onDragStart: (component: ContentComponent) => void;
}

const typeConfig = {
  assessment: {
    icon: <ClipboardList size={14} className="text-amber-600" />,
    badge: 'Assessment',
    badgeBg: 'bg-amber-100 text-amber-700',
    borderColor: 'border-amber-200 hover:border-amber-400',
    bg: 'bg-amber-50',
  },
  unit: {
    icon: <BookOpen size={14} className="text-blue-600" />,
    badge: 'Unit',
    badgeBg: 'bg-blue-100 text-blue-700',
    borderColor: 'border-blue-200 hover:border-blue-400',
    bg: 'bg-blue-50',
  },
};

function ComponentCard({ component, onDragStart }: { component: ContentComponent; onDragStart: (c: ContentComponent) => void }) {
  const cfg = typeConfig[component.type] || typeConfig.unit;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(component)}
      className={`
        group border rounded-lg p-2.5 cursor-grab active:cursor-grabbing transition-all duration-150
        ${cfg.borderColor} ${cfg.bg} hover:shadow-sm select-none
      `}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {cfg.icon}
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${cfg.badgeBg}`}>
            {cfg.badge}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
          className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5 shrink-0"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      <div className="mt-1.5">
        <p className="text-xs font-semibold text-slate-800 leading-tight line-clamp-2">{component.title}</p>
        {expanded && (
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">{component.shortDescription}</p>
        )}
      </div>

      <div className="flex items-center gap-1 mt-1.5">
        <Clock size={10} className="text-slate-400" />
        <span className="text-[10px] text-slate-500">{component.approximateDurationMinutes} min</span>
        {component.metadata?.assessment && (
          <span className="text-[10px] text-slate-400 ml-auto">
            Max: {component.metadata.assessment.maxScore} / Pass: {component.metadata.assessment.passingScore}
          </span>
        )}
      </div>

      <div className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[9px] text-slate-400 text-center">Drag to canvas</p>
      </div>
    </div>
  );
}

export default function LeftPanel({ onDragStart }: LeftPanelProps) {
  const [components, setComponents] = useState<ContentComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unit' | 'assessment'>('all');
  const [showHowItWorks, setShowHowItWorks] = useState(true);

  useEffect(() => {
    fetchComponents()
      .then(r => setComponents(r.items))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = components.filter(c => {
    const matchesType = filter === 'all' || c.type === filter;
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const units = filtered.filter(c => c.type === 'unit');
  const assessments = filtered.filter(c => c.type === 'assessment');

  return (
    <aside className="w-64 flex flex-col border-r border-slate-200 bg-white h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Add Components</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Drag or click to add to canvas</p>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-100">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-slate-50"
          />
        </div>
        <div className="flex gap-1 mt-2">
          {(['all', 'unit', 'assessment'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 text-[10px] py-1 rounded font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'unit' ? 'Units' : 'Assessments'}
            </button>
          ))}
        </div>
      </div>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>
        )}

        {!loading && !error && (
          <>
            {assessments.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Assessments ({assessments.length})
                </p>
                <div className="space-y-2">
                  {assessments.map(c => (
                    <ComponentCard key={c.id} component={c} onDragStart={onDragStart} />
                  ))}
                </div>
              </div>
            )}

            {units.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Units ({units.length})
                </p>
                <div className="space-y-2">
                  {units.map(c => (
                    <ComponentCard key={c.id} component={c} onDragStart={onDragStart} />
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <p className="text-[11px] text-slate-400 text-center py-4">No components found</p>
            )}
          </>
        )}

        {/* How it works */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowHowItWorks(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Info size={12} className="text-slate-400" />
              <span className="text-[11px] font-semibold text-slate-600">How it works</span>
            </div>
            {showHowItWorks ? <ChevronUp size={11} className="text-slate-400" /> : <ChevronDown size={11} className="text-slate-400" />}
          </button>
          {showHowItWorks && (
            <div className="px-3 py-2 text-[10px] text-slate-500 space-y-1.5 bg-white">
              <p>• Drag <strong>Assessment</strong> or <strong>Unit</strong> modules onto the canvas</p>
              <p>• Connect nodes by dragging from the bottom handle to another node's top handle</p>
              <p>• Click a connection to define conditional routing rules</p>
              <p>• Click a node to edit its properties in the right panel</p>
              <p>• Use <strong>Save Draft</strong> to persist your work</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
