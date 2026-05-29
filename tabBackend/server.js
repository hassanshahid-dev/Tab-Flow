import express from 'express'
import mongoose from "mongoose"
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import workspaceRoutes from './routes/workspaces.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);

//test
app.get('/', (req, res) => {
    res.json({ message: 'TabFlow API running' });
});

//DB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log(`MongoDB connected`);
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => console.log('MongoDB error:', err));

