import { supabaseAdmin } from '../supabaseClient.js';

export const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: 'No token' });

  const jwt = token.replace('Bearer ', '');

  const { data, error } = await supabaseAdmin.auth.getUser(jwt);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // check role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profile.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not admin' });
  }

  req.user = data.user;
  next();
};