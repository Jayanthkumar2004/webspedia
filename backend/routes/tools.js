import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';

const router = express.Router();


// ✅ GET ALL TOOLS (LATEST FIRST)
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});


// ✅ ADD TOOL
router.post('/', async (req, res) => {
  const {
    title,
    category,
    tool_url,
    description,
    image_url,
    pdf_url
  } = req.body;

  // 🔒 VALIDATION
  if (!title || !category || !tool_url) {
    return res.status(400).json({
      error: 'Title, category and tool_url are required'
    });
  }

  const { data, error } = await supabaseAdmin
    .from('tools')
    .insert([
      {
        title,
        category,
        tool_url,
        description: description || '',
        image_url: image_url || '',
        pdf_url: pdf_url || '',
        likes: 0,
        downloads: 0,
        visits: 0
      }
    ]);

  if (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Tool added successfully', data });
});


// ✅ UPDATE TOOL
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  const {
    title,
    category,
    tool_url,
    description,
    image_url,
    pdf_url
  } = req.body;

  const { data, error } = await supabaseAdmin
    .from('tools')
    .update({
      title,
      category,
      tool_url,
      description,
      image_url,
      pdf_url
    })
    .eq('id', id);

  if (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Tool updated', data });
});


// ✅ DELETE TOOL
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('tools')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Tool deleted' });
});


// ✅ LIKE TOOL
router.put('/like/:id', async (req, res) => {
  const { id } = req.params;

  const { data: tool } = await supabaseAdmin
    .from('tools')
    .select('likes')
    .eq('id', id)
    .single();

  const newLikes = (tool?.likes || 0) + 1;

  const { error } = await supabaseAdmin
    .from('tools')
    .update({ likes: newLikes })
    .eq('id', id);

  if (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'Liked', likes: newLikes });
});


// ✅ DOWNLOAD TRACK
router.put('/download/:id', async (req, res) => {
  const { id } = req.params;

  const { data: tool } = await supabaseAdmin
    .from('tools')
    .select('downloads')
    .eq('id', id)
    .single();

  const newDownloads = (tool?.downloads || 0) + 1;

  await supabaseAdmin
    .from('tools')
    .update({ downloads: newDownloads })
    .eq('id', id);

  res.json({ message: 'Download tracked', downloads: newDownloads });
});


// ✅ VISIT TRACK
router.put('/visit/:id', async (req, res) => {
  const { id } = req.params;

  const { data: tool } = await supabaseAdmin
    .from('tools')
    .select('visits')
    .eq('id', id)
    .single();

  const newVisits = (tool?.visits || 0) + 1;

  await supabaseAdmin
    .from('tools')
    .update({ visits: newVisits })
    .eq('id', id);

  res.json({ message: 'Visit tracked', visits: newVisits });
});


export default router;