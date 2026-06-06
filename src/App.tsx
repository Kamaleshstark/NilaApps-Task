import { useState, useCallback, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Save, Play, Eye, Loader2, CheckCircle, AlertCircle, Layers, BookOpen } from 'lucide-react';
import LeftPanel from './components/LeftPanel';
import Canvas, { CanvasHandle } from './components/Canvas';
import { setDragComponent } from './lib/canvas-utils';
import PropertiesPanel from './components/PropertiesPanel';
import { ContentComponent, PathNode, PathEdge, LearningPath } from './types';
import { saveLearningPath } from './lib/api';

type ViewMode = 'builder' | 'preview';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function App() {
  const canvasRef = useRef<CanvasHandle>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('builder');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pathName, setPathName] = useState('Untitled Learning Path');
  const [pathId, setPathId] = useState<string | undefined>(undefined);
  const [isEditingName, setIsEditingName] = useState(false);

  const [selectedType, setSelectedType] = useState<'node' | 'edge' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Mirror of canvas state for PropertiesPanel reads
  const [nodes, setNodes] = useState<PathNode[]>([]);
  const [edges, setEdges] = useState<PathEdge[]>([]);

  const syncFromCanvas = useCallback(() => {
    const state = canvasRef.current?.getState();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
    }
  }, []);

  const handleSelectionChange = useCallback((type: 'node' | 'edge' | null, id: string | null) => {
    setSelectedType(type);
    setSelectedId(id);
    syncFromCanvas();
  }, [syncFromCanvas]);

  const handleDragStart = useCallback((component: ContentComponent) => {
    setDragComponent(component);
  }, []);

  const handleSave = useCallback(async (status: 'draft' | 'published') => {
    const state = canvasRef.current?.getState();
    if (!state) return;

    setSaveStatus('saving');
    setSaveError(null);

    try {
      const path: LearningPath = {
        id: pathId,
        name: pathName,
        status,
        nodes: state.nodes,
        edges: state.edges,
        canvas: { zoom: 1, offsetX: 0, offsetY: 0 },
      };

      const saved = await saveLearningPath(path);
      setPathId(saved.id);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save');
      setSaveStatus('error');
    }
  }, [pathId, pathName]);

  const handleUpdateNode = useCallback((id: string, patch: Partial<PathNode>) => {
    canvasRef.current?.updateNode(id, patch);
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...patch } : n));
  }, []);

  const handleUpdateEdge = useCallback((id: string, patch: Partial<PathEdge>) => {
    canvasRef.current?.updateEdge(id, patch);
    setEdges(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    canvasRef.current?.deleteNode(id);
    setSelectedType(null);
    setSelectedId(null);
    setNodes(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleDeleteEdge = useCallback((id: string) => {
    canvasRef.current?.deleteEdge(id);
    setSelectedType(null);
    setSelectedId(null);
    setEdges(prev => prev.filter(e => e.id !== id));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 shadow-sm shrink-0 z-10">
        {/* Branding + title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Layers size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-800 hidden sm:block">Edrevel AI</span>
          </div>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <div className="min-w-0">
            {isEditingName ? (
              <input
                autoFocus
                type="text"
                value={pathName}
                onChange={e => setPathName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                className="text-sm font-semibold text-slate-800 border border-blue-400 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 w-64"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-sm font-semibold text-slate-800 hover:text-blue-600 truncate max-w-[280px] transition-colors text-left"
                title="Click to rename"
              >
                {pathName}
              </button>
            )}
            <p className="text-[10px] text-slate-400 hidden md:block">
              Adaptive Learning Path Builder
              {pathId && <span className="ml-1 font-mono opacity-60">· {pathId}</span>}
            </p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('builder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'builder' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen size={12} />
            Builder
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Eye size={12} />
            Preview
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium animate-fade-in">
              <CheckCircle size={12} />
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-red-500 text-xs font-medium" title={saveError ?? ''}>
              <AlertCircle size={12} />
              Error
            </span>
          )}
          <button
            onClick={() => handleSave('draft')}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {saveStatus === 'saving' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Play size={12} fill="currentColor" />
            Publish
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {viewMode === 'builder' ? (
          <>
            <LeftPanel onDragStart={handleDragStart} />

            <main className="flex-1 overflow-hidden relative">
              <ReactFlowProvider>
                <Canvas
                  ref={canvasRef}
                  onSelectionChange={handleSelectionChange}
                />
              </ReactFlowProvider>
            </main>

            <PropertiesPanel
              selectedType={selectedType}
              selectedId={selectedId}
              nodes={nodes}
              edges={edges}
              onUpdateNode={handleUpdateNode}
              onUpdateEdge={handleUpdateEdge}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Eye size={28} className="text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">Preview Mode</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Save your learning path first, then preview how learners will navigate through the modules.
              </p>
              <button
                onClick={() => setViewMode('builder')}
                className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Back to Builder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
