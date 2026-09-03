import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/users.js';
import toolRoutes from './routes/tools.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/tools', toolRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});