import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { BookOpen, ClipboardList, Play, Flag } from 'lucide-react';
import { NodeType } from '../../types';

export interface NodeData extends Record<string, unknown> {
  label: string;
  nodeType: NodeType;
  componentId: string;
  approximateDurationMinutes?: number;
  description?: string;
  selected?: boolean;
}

const nodeStyles: Record<NodeType, { bg: string; border: string; icon: React.ReactNode; badge?: string; badgeBg?: string }> = {
  start: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-400',
    icon: <Play size={14} className="text-emerald-600" fill="currentColor" />,
  },
  end: {
    bg: 'bg-slate-100',
    border: 'border-slate-400',
    icon: <Flag size={14} className="text-slate-600" />,
  },
  unit: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    icon: <BookOpen size={14} className="text-blue-600" />,
    badge: 'Unit',
    badgeBg: 'bg-blue-100 text-blue-700',
  },
  assessment: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    icon: <ClipboardList size={14} className="text-amber-600" />,
    badge: 'Assessment',
    badgeBg: 'bg-amber-100 text-amber-700',
  },
};

function CanvasNode({ data, selected }: NodeProps) {
  const nodeData = (data as unknown) as NodeData;
  const style = nodeStyles[nodeData.nodeType] || nodeStyles.unit;
  const isStartEnd = nodeData.nodeType === 'start' || nodeData.nodeType === 'end';

  return (
    <div
      className={`
        relative rounded-lg border-2 transition-all duration-150 cursor-pointer
        ${style.bg} ${style.border}
        ${selected ? 'ring-2 ring-offset-1 ring-blue-500 shadow-lg' : 'shadow-sm hover:shadow-md'}
        ${isStartEnd ? 'min-w-[160px]' : 'min-w-[200px] max-w-[220px]'}
      `}
    >
      {!isStartEnd && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white hover:!bg-blue-500 transition-colors"
        />
      )}

      <div className="px-3 py-2.5">
        {isStartEnd ? (
          <div className="flex items-center gap-2 justify-center">
            {style.icon}
            <span className="text-sm font-semibold text-slate-700">{nodeData.label}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                {style.icon}
                {style.badge && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${style.badgeBg}`}>
                    {style.badge}
                  </span>
                )}
              </div>
              {nodeData.approximateDurationMinutes && (
                <span className="text-[10px] text-slate-400">{nodeData.approximateDurationMinutes} min</span>
              )}
            </div>
            <div className="text-xs font-semibold text-slate-800 leading-tight line-clamp-2">
              {nodeData.label}
            </div>
            {nodeData.description && (
              <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{nodeData.description}</div>
            )}
          </>
        )}
      </div>

      {!isStartEnd && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white hover:!bg-blue-500 transition-colors"
        />
      )}
      {isStartEnd && nodeData.nodeType === 'start' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white hover:!bg-blue-500 transition-colors"
        />
      )}
      {isStartEnd && nodeData.nodeType === 'end' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white hover:!bg-blue-500 transition-colors"
        />
      )}
    </div>
  );
}

export default memo(CanvasNode);
