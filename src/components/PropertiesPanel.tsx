import { Trash2, Plus, X, ChevronDown } from 'lucide-react';
import {
  PathNode, PathEdge, Rule, Metric, RuleOperator, ConditionsOperator, SourceType,
} from '../types';

interface PropertiesPanelProps {
  selectedType: 'node' | 'edge' | null;
  selectedId: string | null;
  nodes: PathNode[];
  edges: PathEdge[];
  onUpdateNode: (id: string, patch: Partial<PathNode>) => void;
  onUpdateEdge: (id: string, patch: Partial<PathEdge>) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ASSESSMENT_METRICS: { value: Metric; label: string }[] = [
  { value: 'completion', label: 'Completion' },
  { value: 'passed', label: 'Passed' },
  { value: 'score', label: 'Score' },
  { value: 'score_range', label: 'Score Range' },
];

const UNIT_METRICS: { value: Metric; label: string }[] = [
  { value: 'completion', label: 'Completion' },
  { value: 'time_spent_minutes', label: 'Time Spent (min)' },
  { value: 'percentage_completion', label: '% Completion' },
];

const OPERATORS: { value: RuleOperator; label: string }[] = [
  { value: 'eq', label: 'equals (=)' },
  { value: 'ne', label: 'not equal (≠)' },
  { value: 'gt', label: 'greater than (>)' },
  { value: 'gte', label: 'greater or equal (≥)' },
  { value: 'lt', label: 'less than (<)' },
  { value: 'lte', label: 'less or equal (≤)' },
  { value: 'between', label: 'between' },
];

function select(className: string, value: string, onChange: (v: string) => void, options: { value: string; label: string }[]) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full appearance-none text-xs border border-slate-200 rounded-md px-2.5 py-1.5 pr-7 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${className}`}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function input(value: string | number, onChange: (v: string) => void, type = 'text', placeholder = '') {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
    />
  );
}

// ─── Rule Editor ─────────────────────────────────────────────────────────────

interface RuleEditorProps {
  rule: Rule;
  sourceNodes: PathNode[];
  onChange: (r: Rule) => void;
  onDelete: () => void;
}

function RuleEditor({ rule, sourceNodes, onChange, onDelete }: RuleEditorProps) {
  const sourceNode = sourceNodes.find(n => n.id === rule.sourceNodeId);
  const sourceType: SourceType = sourceNode?.type === 'assessment' ? 'assessment' : 'unit';
  const metrics = sourceType === 'assessment' ? ASSESSMENT_METRICS : UNIT_METRICS;
  const isBooleanMetric = rule.metric === 'completion' || rule.metric === 'passed';
  const isRangeMetric = rule.metric === 'score_range';
  const isBetween = rule.operator === 'between';

  return (
    <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Rule</span>
        <button onClick={onDelete} className="text-slate-400 hover:text-red-500 transition-colors">
          <X size={12} />
        </button>
      </div>

      {/* Source node */}
      <div>
        <label className="text-[10px] text-slate-500 block mb-1">Source Node</label>
        {select('', rule.sourceNodeId, v => onChange({ ...rule, sourceNodeId: v }),
          sourceNodes.filter(n => n.type === 'assessment' || n.type === 'unit').map(n => ({ value: n.id, label: n.label }))
        )}
      </div>

      {/* Metric */}
      <div>
        <label className="text-[10px] text-slate-500 block mb-1">Metric</label>
        {select('', rule.metric, v => onChange({ ...rule, metric: v as Metric, value: undefined, range: undefined }), metrics)}
      </div>

      {/* Operator — hidden for range metrics */}
      {!isRangeMetric && (
        <div>
          <label className="text-[10px] text-slate-500 block mb-1">Operator</label>
          {select('', rule.operator, v => onChange({ ...rule, operator: v as RuleOperator }),
            isBooleanMetric
              ? OPERATORS.filter(o => o.value === 'eq' || o.value === 'ne')
              : OPERATORS
          )}
        </div>
      )}

      {/* Value / Range inputs */}
      {isBooleanMetric && (
        <div>
          <label className="text-[10px] text-slate-500 block mb-1">Value</label>
          {select('', String(rule.value ?? 'true'), v => onChange({ ...rule, value: v === 'true' }),
            [{ value: 'true', label: 'true' }, { value: 'false', label: 'false' }]
          )}
        </div>
      )}

      {!isBooleanMetric && !isRangeMetric && !isBetween && (
        <div>
          <label className="text-[10px] text-slate-500 block mb-1">Value</label>
          {input(String(rule.value ?? ''), v => onChange({ ...rule, value: Number(v) }), 'number', '0')}
        </div>
      )}

      {(isRangeMetric || isBetween) && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Min</label>
            {input(String(rule.range?.min ?? 0), v => onChange({ ...rule, range: { ...(rule.range || { min: 0, max: 100 }), min: Number(v) } }), 'number', '0')}
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Max</label>
            {input(String(rule.range?.max ?? 100), v => onChange({ ...rule, range: { ...(rule.range || { min: 0, max: 100 }), max: Number(v) } }), 'number', '100')}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Node Properties ──────────────────────────────────────────────────────────

function NodeProperties({ node, onUpdate, onDelete }: {
  node: PathNode;
  onUpdate: (patch: Partial<PathNode>) => void;
  onDelete: () => void;
}) {
  const isSystem = node.type === 'start' || node.type === 'end';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Node Properties</h3>
        {!isSystem && (
          <button
            onClick={onDelete}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
            title="Delete node"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div>
        <label className="text-[11px] font-medium text-slate-600 block mb-1">Label</label>
        <input
          type="text"
          value={node.label}
          onChange={e => onUpdate({ label: e.target.value })}
          disabled={isSystem}
          className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-slate-50 disabled:text-slate-400"
        />
      </div>

      {!isSystem && (
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">Description</label>
          <textarea
            value={node.description || ''}
            onChange={e => onUpdate({ description: e.target.value })}
            rows={3}
            placeholder="Enter description..."
            className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
          />
        </div>
      )}

      {!isSystem && (
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">Duration (min)</label>
          <input
            type="number"
            min={0}
            max={600}
            value={node.config?.approximateDurationMinutes ?? ''}
            onChange={e => onUpdate({ config: { ...node.config, approximateDurationMinutes: Number(e.target.value) } })}
            className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
      )}

      {node.type === 'assessment' && (
        <div>
          <label className="text-[11px] font-semibold text-slate-700 block mb-2">Assessment Config</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Max Score</label>
              <input
                type="number"
                min={1}
                value={node.config?.assessment?.maxScore ?? 100}
                onChange={e => onUpdate({ config: { ...node.config, assessment: { ...(node.config?.assessment || { maxScore: 100, passingScore: 50 }), maxScore: Number(e.target.value) } } })}
                className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Passing Score</label>
              <input
                type="number"
                min={0}
                value={node.config?.assessment?.passingScore ?? 50}
                onChange={e => onUpdate({ config: { ...node.config, assessment: { ...(node.config?.assessment || { maxScore: 100, passingScore: 50 }), passingScore: Number(e.target.value) } } })}
                className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-slate-100">
        <p className="text-[10px] text-slate-400">
          Type: <span className="font-medium capitalize text-slate-500">{node.type}</span>
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
          ID: <span className="font-mono text-slate-400">{node.id}</span>
        </p>
      </div>
    </div>
  );
}

// ─── Edge Properties ──────────────────────────────────────────────────────────

function EdgeProperties({ edge, nodes, onUpdate, onDelete }: {
  edge: PathEdge;
  nodes: PathNode[];
  onUpdate: (patch: Partial<PathEdge>) => void;
  onDelete: () => void;
}) {
  const sourceNode = nodes.find(n => n.id === edge.sourceNodeId);
  const targetNode = nodes.find(n => n.id === edge.targetNodeId);

  const addRule = () => {
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      sourceType: (sourceNode?.type === 'assessment' ? 'assessment' : 'unit') as SourceType,
      sourceNodeId: edge.sourceNodeId,
      metric: sourceNode?.type === 'assessment' ? 'completion' : 'completion',
      operator: 'eq',
      value: true,
    };
    onUpdate({ conditions: { ...edge.conditions, rules: [...edge.conditions.rules, newRule] } });
  };

  const updateRule = (idx: number, r: Rule) => {
    const rules = [...edge.conditions.rules];
    rules[idx] = r;
    onUpdate({ conditions: { ...edge.conditions, rules } });
  };

  const deleteRule = (idx: number) => {
    const rules = edge.conditions.rules.filter((_, i) => i !== idx);
    onUpdate({ conditions: { ...edge.conditions, rules } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Connection Properties</h3>
        <button
          onClick={onDelete}
          className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
          title="Delete connection"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="text-[10px] text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100">
        <span className="font-medium text-slate-600">{sourceNode?.label ?? edge.sourceNodeId}</span>
        <span className="mx-1.5">→</span>
        <span className="font-medium text-slate-600">{targetNode?.label ?? edge.targetNodeId}</span>
      </div>

      <div>
        <label className="text-[11px] font-medium text-slate-600 block mb-1">Label</label>
        <input
          type="text"
          value={edge.label || ''}
          onChange={e => onUpdate({ label: e.target.value })}
          placeholder="e.g. Score below passing"
          className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">Priority</label>
          <input
            type="number"
            min={1}
            value={edge.priority ?? 1}
            onChange={e => onUpdate({ priority: Number(e.target.value) })}
            className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={edge.isDefault ?? false}
              onChange={e => onUpdate({ isDefault: e.target.checked })}
              className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
            />
            <span className="text-[11px] text-slate-600">Default route</span>
          </label>
        </div>
      </div>

      {/* Conditions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-semibold text-slate-700">Conditions</label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">Match:</span>
            <div className="flex rounded-md overflow-hidden border border-slate-200">
              {(['AND', 'OR'] as ConditionsOperator[]).map(op => (
                <button
                  key={op}
                  onClick={() => onUpdate({ conditions: { ...edge.conditions, operator: op } })}
                  className={`px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                    edge.conditions.operator === op
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {edge.conditions.rules.map((rule, idx) => (
            <RuleEditor
              key={rule.id}
              rule={rule}
              sourceNodes={nodes.filter(n => n.type === 'assessment' || n.type === 'unit')}
              onChange={r => updateRule(idx, r)}
              onDelete={() => deleteRule(idx)}
            />
          ))}
        </div>

        <button
          onClick={addRule}
          className="mt-2 w-full flex items-center justify-center gap-1.5 text-[11px] font-medium text-blue-600 border border-blue-200 border-dashed rounded-lg py-2 hover:bg-blue-50 transition-colors"
        >
          <Plus size={12} />
          Add Condition Rule
        </button>

        {edge.conditions.rules.length === 0 && (
          <p className="text-[10px] text-slate-400 text-center mt-1">
            No rules — this edge is always traversed
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function PropertiesPanel({
  selectedType,
  selectedId,
  nodes,
  edges,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
}: PropertiesPanelProps) {
  const selectedNode = selectedType === 'node' ? nodes.find(n => n.id === selectedId) : null;
  const selectedEdge = selectedType === 'edge' ? edges.find(e => e.id === selectedId) : null;

  return (
    <aside className="w-64 flex flex-col border-l border-slate-200 bg-white h-full overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Properties</h2>
        {selectedId && (
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full capitalize">
            {selectedType}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!selectedId && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <path d="M17.5 17.5L21 21M14 17.5h3.5v3.5"/>
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-500">Nothing selected</p>
            <p className="text-[10px] text-slate-400 mt-1">Click a node or connection to edit its properties</p>
          </div>
        )}

        {selectedNode && (
          <NodeProperties
            node={selectedNode}
            onUpdate={patch => onUpdateNode(selectedNode.id, patch)}
            onDelete={() => onDeleteNode(selectedNode.id)}
          />
        )}

        {selectedEdge && (
          <EdgeProperties
            edge={selectedEdge}
            nodes={nodes}
            onUpdate={patch => onUpdateEdge(selectedEdge.id, patch)}
            onDelete={() => onDeleteEdge(selectedEdge.id)}
          />
        )}
      </div>
    </aside>
  );
}
