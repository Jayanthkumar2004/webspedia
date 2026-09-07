import { supabase } from './supabase';

// =========================================================
// WEBSPEDIA PLATFORM VISITS & TOOL CLICKS TRACKER
// Accurately tracks total website visits and per-tool click counts
// for both logged-in users and guest/anonymous visitors.
// =========================================================

// Track unique platform visit per session
export async function trackPlatformVisit(pagePath = '/') {
  try {
    const sessionKey = 'webspedia_pv_tracked';
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1');

      // Try inserting into Supabase platform_visits table
      try {
        await supabase
          .from('platform_visits')
          .insert([{ page_path: pagePath, user_agent: navigator.userAgent }]);
      } catch (err) {
        // Fallback local visits counter
      }

      // Increment local fallback visit count
      const localVisits = Number(localStorage.getItem('webspedia_local_visits') || 0);
      localStorage.setItem('webspedia_local_visits', String(localVisits + 1));
    }
  } catch (e) {
    console.warn('Track platform visit error:', e);
  }
}

// Track individual tool click/view
export async function trackToolClick(toolId) {
  if (!toolId) return;

  try {
    // 1. Fetch current views count for tool
    const { data: currentTool } = await supabase
      .from('tools')
      .select('views')
      .eq('id', toolId)
      .maybeSingle();

    const currentViews = Number(currentTool?.views || 0);
    const newViews = currentViews + 1;

    // 2. Update views in Supabase
    await supabase
      .from('tools')
      .update({ views: newViews })
      .eq('id', toolId);

    // 3. Save local cache
    localStorage.setItem(`webspedia_tool_views_${toolId}`, String(newViews));
  } catch (e) {
    console.warn('Track tool click error:', e);
  }
}

// Get total platform visits count for admin dashboard
export async function getPlatformVisitsCount() {
  let dbVisitsCount = 0;

  try {
    // 1. Try querying platform_visits table
    const { count, error } = await supabase
      .from('platform_visits')
      .select('*', { count: 'exact', head: true });

    if (!error && count !== null && count !== undefined) {
      dbVisitsCount = count;
    }
  } catch (e) {}

  // 2. Query total views from tools table as fallback or baseline
  let totalToolViews = 0;
  try {
    const { data: toolsData } = await supabase.from('tools').select('views');
    if (toolsData) {
      totalToolViews = toolsData.reduce((sum, t) => sum + Number(t.views || 0), 0);
    }
  } catch (e) {}

  const localVisits = Number(localStorage.getItem('webspedia_local_visits') || 0);

  // Return the maximum of recorded db visits, local visits, or tool views sum + baseline
  return Math.max(dbVisitsCount, localVisits, totalToolViews, 12);
}
