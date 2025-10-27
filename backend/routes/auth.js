import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { protect } from '../middleware/authMiddleware.js';
import pool from '../mysql-connector.js';

import crypto from 'crypto';
import nodemailer from 'nodemailer';

import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '30d',
  });
};



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



// Temporary token store (for demo; use DB in production)
const passwordResetTokens = new Map();

// Forgot password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Please provide your email address.' });
  // console.log("Email user:", process.env.EMAIL_USER);
  // console.log("Email pass length:", process.env.EMAIL_PASS?.length);
  try {
    const [rows] = await pool.query('SELECT * FROM team_members WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const user = rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 10; // 10 minutes

    passwordResetTokens.set(resetToken, { userId: user.id, expiresAt });

    //const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    const resetLink = `${process.env.VITE_SERVER_APP_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click below:</p>
        <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
        <p>This link expires in 10 minutes.</p>
      `,
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error sending reset link.' });
  }
});

/**
 * @route POST /api/auth/reset-password
 * @desc  Reset password with token
 * @access Public
 */
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }

  const tokenData = passwordResetTokens.get(token);

  if (!tokenData || Date.now() > tokenData.expiresAt) {
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }

  try {
    const { userId } = tokenData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE team_members SET password = ? WHERE id = ?', [hashedPassword, userId]);

    passwordResetTokens.delete(token);

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password.' });
  }
});


export default router;