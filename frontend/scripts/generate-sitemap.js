import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://ozgnzbxuypwlwdabufbw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Z256Ynh1eXB3bHdkYWJ1ZmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NzIxMDQsImV4cCI6MjA5MDU0ODEwNH0.EvV2pKZMfQ-aFjYx4NJfievLSFRtOI4mguK8gwRMY9I';
const supabase = createClient(supabaseUrl, supabaseKey);

const SITE_URL = 'https://webspedia.vercel.app';

function createSlug(title) {
  if (!title) return 'ai-tool';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function generateSitemap() {
  console.log('Generating dynamic SEO sitemap.xml...');

  let tools = [];
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('id, title, created_at');

    if (!error && data) {
      tools = data;
    }
  } catch (err) {
    console.warn('Could not fetch tools for sitemap generation, using fallback:', err);
  }

  const currentDate = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/website-services', priority: '0.9', changefreq: 'weekly' },
    { url: '/saved-tools', priority: '0.5', changefreq: 'monthly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static Pages
  staticPages.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Dynamic AI Tool Pages
  const processedSlugs = new Set();
  tools.forEach(tool => {
    const lastMod = (tool.updated_at || tool.created_at || new Date().toISOString()).split('T')[0];
    const slug = createSlug(tool.title);

    // 1. Tool ID URL
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}/tool/${tool.id}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;

    // 2. SEO Friendly Slug URL
    if (slug && !processedSlugs.has(slug)) {
      processedSlugs.add(slug);
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}/tools/${slug}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }
  });

  xml += `</urlset>\n`;

  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log(`Successfully generated sitemap.xml with ${staticPages.length + (tools.length * 2)} URLs at ${sitemapPath}`);
}

generateSitemap().catch(err => {
  console.error('Sitemap generation error:', err);
});
