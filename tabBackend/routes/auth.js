import express from 'express';
import jwt from 'jsonwebtoken'
import User from '../models/User.js';
import bcrypt from 'bcryptjs'

const router = express.Router();

const generateToken = (user) => {
    return jwt.sign(
        {
            id : user._id,
            email : user.email
        },
        process.env.JWT_SECRET,
        {expiresIn : '30d'}
    );
};

//POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        const found = await User.findOne({ email });
        if(found) {
            return res.status(400).json({error : `Email already registered`});
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({email : email, password : hashed});

        res.status(201).json({
            token : generateToken(user),
            user: { id: user._id, email: user.email, plan: user.plan }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//POST /api/auth/login
router.post(`/login`, async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if(!match) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        res.status(201).json({
            token: generateToken(user),
            user: { id: user._id, email: user.email, plan: user.plan }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;