import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search");

    let query = supabase
      .from("components")
      .select("id, title, short_description, type, approximate_duration_minutes, metadata")
      .order("type", { ascending: true })
      .order("title", { ascending: true });

    if (type && (type === "unit" || type === "assessment")) {
      query = query.eq("type", type);
    }
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const items = (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      shortDescription: row.short_description,
      type: row.type,
      approximateDurationMinutes: row.approximate_duration_minutes,
      metadata: row.metadata || {},
    }));

    return new Response(
      JSON.stringify({ items, totalCount: items.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
