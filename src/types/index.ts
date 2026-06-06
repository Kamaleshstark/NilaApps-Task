// ─── Available Content (GET /api/components) ─────────────────────────────────

export interface AssessmentMetadata {
  maxScore: number;
  passingScore: number;
}

export interface UnitMetadata {
  recommendedMinutes?: number;
}

export interface ComponentMetadata {
  assessment?: AssessmentMetadata;
  unit?: UnitMetadata;
}

export type ComponentType = 'unit' | 'assessment';

export interface ContentComponent {
  id: string;
  title: string;
  shortDescription: string;
  type: ComponentType;
  approximateDurationMinutes: number;
  metadata?: ComponentMetadata;
}

export interface ComponentsResponse {
  items: ContentComponent[];
  totalCount: number;
}

// ─── Learning Path ────────────────────────────────────────────────────────────

export type NodeType = 'start' | 'unit' | 'assessment' | 'end';
export type Status = 'draft' | 'published';
export type RuleOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
export type ConditionsOperator = 'AND' | 'OR';
export type SourceType = 'assessment' | 'unit';
export type Metric =
  | 'completion'
  | 'passed'
  | 'score'
  | 'score_range'
  | 'time_spent_minutes'
  | 'percentage_completion';

export interface RuleRange {
  min: number;
  max: number;
  minInclusive?: boolean;
  maxInclusive?: boolean;
}

export interface Rule {
  id: string;
  sourceType: SourceType;
  sourceNodeId: string;
  metric: Metric;
  operator: RuleOperator;
  value?: boolean | number | string;
  range?: RuleRange;
}

export interface Conditions {
  operator: ConditionsOperator;
  rules: Rule[];
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface AssessmentConfig {
  maxScore: number;
  passingScore: number;
}

export interface NodeConfig {
  approximateDurationMinutes?: number;
  assessment?: AssessmentConfig;
}

export interface PathNode {
  id: string;
  componentId: string;
  type: NodeType;
  label: string;
  description?: string;
  position: NodePosition;
  config?: NodeConfig;
}

export interface PathEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  priority?: number;
  isDefault?: boolean;
  conditions: Conditions;
}

export interface CanvasState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface LearningPath {
  id?: string;
  name: string;
  description?: string;
  status: Status;
  version?: number;
  canvas?: CanvasState;
  nodes: PathNode[];
  edges: PathEdge[];
}
