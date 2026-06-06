import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    // path: /api-learning-paths  or  /api-learning-paths/{id}
    const pathParts = url.pathname.replace(/^\/api-learning-paths\/?/, "").split("/").filter(Boolean);
    const id = pathParts[0];

    // POST /api-learning-paths — save (upsert) a learning path
    if (req.method === "POST" && !id) {
      const body = await req.json();
      const pathId = body.id || `lp-${crypto.randomUUID()}`;

      const { data: existing } = await supabase
        .from("learning_paths")
        .select("version")
        .eq("id", pathId)
        .maybeSingle();

      const version = existing ? (existing.version || 1) + 1 : 1;

      const { data, error } = await supabase
        .from("learning_paths")
        .upsert({
          id: pathId,
          name: body.name,
          description: body.description || "",
          status: body.status || "draft",
          version,
          canvas: body.canvas || { zoom: 1, offsetX: 0, offsetY: 0 },
          nodes: body.nodes || [],
          edges: body.edges || [],
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return json(toPayload(data), 201);
    }

    // GET /api-learning-paths/{id} — load a learning path
    if (req.method === "GET" && id) {
      const { data, error } = await supabase
        .from("learning_paths")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return json({ error: "Not found" }, 404);
      return json(toPayload(data));
    }

    // GET /api-learning-paths — list all
    if (req.method === "GET" && !id) {
      const { data, error } = await supabase
        .from("learning_paths")
        .select("id, name, description, status, version, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return json({ items: data || [], totalCount: (data || []).length });
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

function toPayload(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    version: row.version,
    canvas: row.canvas,
    nodes: row.nodes,
    edges: row.edges,
  };
}
