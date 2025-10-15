import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { protect } from '../middleware/authMiddleware.js';
import pool from '../mysql-connector.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: 'Please provide email and password' });
//   }

//   try {
//     await db.read();
//     const user = db.data.team.find(u => u.email.toLowerCase() === email.toLowerCase());

//     if (user && (await bcrypt.compare(password, user.password))) {
//       const { password, ...userWithoutPassword } = user;
//       res.json({
//         user: userWithoutPassword,
//         token: generateToken(user.id, user.role),
//       });
//     } else {
//       res.status(401).json({ message: 'Invalid credentials' });
//     }
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Server error during login.' });
//   }
// });

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM team_members WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Remove password before sending response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token: generateToken(user.id, user.role),
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, (req, res) => {
  res.status(200).json(req.user);
});

// @desc    Update user password
// @route   POST /api/auth/password
// @access  Private
// router.post('/password', protect, async (req, res) => {
//   const { currentPassword, newPassword } = req.body;
//   const userId = req.user.id;

//   if (!currentPassword || !newPassword) {
//     return res.status(400).json({ message: 'Please provide current and new passwords.' });
//   }

//   if (newPassword.length < 6) {
//     return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
//   }

//   try {
//     await db.read();
//     const userIndex = db.data.team.findIndex(u => u.id === userId);
//     if (userIndex === -1) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     const user = db.data.team[userIndex];

//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Incorrect current password.' });
//     }

//     const salt = bcrypt.genSaltSync(10);
//     const hashedPassword = bcrypt.hashSync(newPassword, salt);

//     db.data.team[userIndex].password = hashedPassword;
//     await db.write();

//     res.status(200).json({ message: 'Password updated successfully.' });

//   } catch (error) {
//     console.error('Password update error:', error);
//     res.status(500).json({ message: 'Server error during password update.' });
//   }
// });

router.post('/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide current and new passwords.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
  }

  try {
    // 1. Fetch user by ID
    const [rows] = await pool.query('SELECT * FROM team_members WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = rows[0];

    // 2. Compare current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password.' });
    }

    // 3. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update password in DB
    await pool.query('UPDATE team_members SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.status(200).json({ message: 'Password updated successfully.' });

  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Server error during password update.' });
  }
});
export default router;