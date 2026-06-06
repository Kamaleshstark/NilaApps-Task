import { ComponentsResponse, LearningPath } from '../types';

const BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

const headers = {
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export async function fetchComponents(): Promise<ComponentsResponse> {
  const res = await fetch(`${BASE}/api-components`, { headers });
  if (!res.ok) throw new Error(`Failed to load components: ${res.statusText}`);
  return res.json();
}

export async function saveLearningPath(path: LearningPath): Promise<LearningPath> {
  const res = await fetch(`${BASE}/api-learning-paths`, {
    method: 'POST',
    headers,
    body: JSON.stringify(path),
  });
  if (!res.ok) throw new Error(`Failed to save: ${res.statusText}`);
  return res.json();
}

export async function loadLearningPath(id: string): Promise<LearningPath> {
  const res = await fetch(`${BASE}/api-learning-paths/${id}`, { headers });
  if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`);
  return res.json();
}

export async function listLearningPaths(): Promise<{ items: LearningPath[]; totalCount: number }> {
  const res = await fetch(`${BASE}/api-learning-paths`, { headers });
  if (!res.ok) throw new Error(`Failed to list paths: ${res.statusText}`);
  return res.json();
}
