import { useCallback, DragEvent, useImperativeHandle, forwardRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  NodeTypes,
  MarkerType,
  BackgroundVariant,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CanvasNode, { NodeData } from './nodes/CanvasNode';
import { PathNode, PathEdge, NodeType } from '../types';
import { getDragComponent, clearDragComponent } from '../lib/canvas-utils';

const nodeTypes: NodeTypes = { canvasNode: CanvasNode };

export interface CanvasHandle {
  getState: () => { nodes: PathNode[]; edges: PathEdge[] };
  updateNode: (id: string, patch: Partial<PathNode>) => void;
  updateEdge: (id: string, patch: Partial<PathEdge>) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;
}

function toFlowNode(n: PathNode): Node {
  return {
    id: n.id,
    type: 'canvasNode',
    position: n.position,
    data: {
      label: n.label,
      nodeType: n.type,
      componentId: n.componentId,
      approximateDurationMinutes: n.config?.approximateDurationMinutes,
      description: n.description,
    } as NodeData,
  };
}

function toFlowEdge(e: PathEdge): Edge {
  return {
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    label: e.label || '',
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#64748b' },
    style: { stroke: '#64748b', strokeWidth: 1.5 },
    labelStyle: { fontSize: 10, fill: '#64748b' },
    labelBgStyle: { fill: 'white', fillOpacity: 0.85 },
    data: { conditions: e.conditions, priority: e.priority, isDefault: e.isDefault },
  };
}

function fromFlowNode(n: Node): PathNode {
  const d = n.data as unknown as NodeData;
  return {
    id: n.id,
    componentId: d.componentId,
    type: d.nodeType as NodeType,
    label: d.label,
    description: d.description,
    position: n.position,
    config: d.approximateDurationMinutes
      ? { approximateDurationMinutes: d.approximateDurationMinutes }
      : undefined,
  };
}

function fromFlowEdge(e: Edge): PathEdge {
  return {
    id: e.id,
    sourceNodeId: e.source,
    targetNodeId: e.target,
    label: String(e.label || ''),
    priority: (e.data as { priority?: number })?.priority ?? 1,
    isDefault: (e.data as { isDefault?: boolean })?.isDefault ?? false,
    conditions: (e.data as { conditions?: PathEdge['conditions'] })?.conditions ?? {
      operator: 'AND',
      rules: [],
    },
  };
}

const INITIAL_NODES: PathNode[] = [
  { id: 'node-start', componentId: 'system-start', type: 'start', label: 'Start Assessment', position: { x: 280, y: 40 } },
  { id: 'node-end', componentId: 'system-end', type: 'end', label: 'Complete Assessment', position: { x: 280, y: 500 } },
];

interface CanvasProps {
  initialNodes?: PathNode[];
  initialEdges?: PathEdge[];
  onSelectionChange: (type: 'node' | 'edge' | null, id: string | null) => void;
}


const CanvasInner = forwardRef<CanvasHandle, CanvasProps>(function CanvasInner(
  { initialNodes, initialEdges, onSelectionChange },
  ref
) {
  const startNodes = (initialNodes && initialNodes.length > 0 ? initialNodes : INITIAL_NODES).map(toFlowNode);
  const startEdges = (initialEdges || []).map(toFlowEdge);

  const [nodes, setNodes, onNodesChange] = useNodesState(startNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(startEdges);
  const reactFlow = useReactFlow();

  useImperativeHandle(ref, () => ({
    getState: () => ({
      nodes: nodes.map(fromFlowNode),
      edges: edges.map(fromFlowEdge),
    }),

    updateNode: (id, patch) => {
      setNodes(prev => prev.map(n => {
        if (n.id !== id) return n;
        const d = n.data as unknown as NodeData;
        return {
          ...n,
          data: {
            ...d,
            label: patch.label ?? d.label,
            description: patch.description ?? d.description,
            approximateDurationMinutes:
              patch.config?.approximateDurationMinutes ?? d.approximateDurationMinutes,
          } as Record<string, unknown>,
        };
      }));
    },

    updateEdge: (id, patch) => {
      setEdges(prev => prev.map(e => {
        if (e.id !== id) return e;
        return {
          ...e,
          label: patch.label ?? e.label,
          data: {
            ...(e.data as object),
            conditions: patch.conditions ?? (e.data as { conditions: PathEdge['conditions'] }).conditions,
            priority: patch.priority ?? (e.data as { priority?: number }).priority,
            isDefault: patch.isDefault ?? (e.data as { isDefault?: boolean }).isDefault,
          },
        };
      }));
    },

    deleteNode: (id) => {
      setNodes(prev => prev.filter(n => n.id !== id));
      setEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    },

    deleteEdge: (id) => {
      setEdges(prev => prev.filter(e => e.id !== id));
    },
  }), [nodes, edges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `edge-${Date.now()}`,
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#64748b' },
        style: { stroke: '#64748b', strokeWidth: 1.5 },
        labelStyle: { fontSize: 10, fill: '#64748b' },
        labelBgStyle: { fill: 'white', fillOpacity: 0.85 },
        data: { conditions: { operator: 'AND', rules: [] }, priority: 1, isDefault: false },
      };
      setEdges(eds => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const component = getDragComponent();
      if (!component) return;

      const bounds = event.currentTarget.getBoundingClientRect();
      const position = reactFlow.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const nodeId = `node-${component.id}-${Date.now()}`;
      const newNode: Node = {
        id: nodeId,
        type: 'canvasNode',
        position,
        data: {
          label: component.title,
          nodeType: component.type as NodeType,
          componentId: component.id,
          approximateDurationMinutes: component.approximateDurationMinutes,
          description: component.shortDescription,
        } as Record<string, unknown>,
      };
      setNodes(nds => [...nds, newNode]);
      clearDragComponent();
    },
    [reactFlow, setNodes]
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="w-full h-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onSelectionChange('node', node.id)}
        onEdgeClick={(_, edge) => onSelectionChange('edge', edge.id)}
        onPaneClick={() => onSelectionChange(null, null)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultEdgeOptions={{
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#64748b', strokeWidth: 1.5 },
        }}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        snapToGrid
        snapGrid={[16, 16]}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const d = n.data as unknown as NodeData;
            if (d.nodeType === 'assessment') return '#fef3c7';
            if (d.nodeType === 'unit') return '#dbeafe';
            if (d.nodeType === 'start') return '#d1fae5';
            return '#f1f5f9';
          }}
          maskColor="rgba(248,250,252,0.7)"
        />
        <Panel position="top-center">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-3 py-1 text-[10px] text-slate-500 shadow-sm">
            Drag components from the left · Connect nodes by dragging between handles · Click to select
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
});

export default CanvasInner;
