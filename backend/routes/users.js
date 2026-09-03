import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';

const router = express.Router();


// ✅ GET ALL USERS (LATEST FIRST)
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, username, role, is_banned, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});


// ✅ GET SINGLE USER
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});


// ✅ FULL DELETE USER (AUTH + PROFILE)
router.delete('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // 🔥 DELETE FROM AUTH
    await supabaseAdmin.auth.admin.deleteUser(userId);

    // 🔥 DELETE FROM PROFILES
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    res.json({ message: 'User deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});


// ✅ BAN USER (SOFT DELETE)
router.put('/ban/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_banned: true })
    .eq('id', id);

  if (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'User banned successfully' });
});


// ✅ UNBAN USER
router.put('/unban/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_banned: false })
    .eq('id', id);

  if (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: 'User unbanned successfully' });
});


export default router;