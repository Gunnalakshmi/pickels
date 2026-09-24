import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { config } from '../config/env';

export class AuthController {
  public async register(req: Request, res: Response) {
    try {
      const { name, email, phone, password, referralCode } = req.body;

      if (!name || !email || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide full name, email, phone number, and password.',
        });
      }

      const users = db.getStore('users');
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email or mobile number already exists.',
        });
      }

      // Check referral
      let referredBy = null;
      let walletBonus = 0;
      if (referralCode) {
        const referrer = users.find(u => u.referral_code === referralCode.trim().toUpperCase());
        if (referrer) {
          referredBy = referrer.referral_code;
          walletBonus = 50.0; // ₹50 welcome wallet bonus
        }
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUserId = `usr_${uuidv4().slice(0, 8)}`;
      const userRefCode = `${name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;

      const newUser = {
        id: newUserId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password_hash: passwordHash,
        role: 'customer',
        referral_code: userRefCode,
        referred_by: referredBy,
        wallet_balance: walletBonus,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      users.push(newUser);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
      );

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully. Welcome to PickleMart India!',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          referralCode: newUser.referral_code,
          walletBalance: newUser.wallet_balance,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const { emailOrPhone, password } = req.body;
      if (!emailOrPhone || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide mobile number or email, and password.',
        });
      }

      const users = db.getStore('users');
      const user = users.find(
        u =>
          u.email.toLowerCase() === emailOrPhone.trim().toLowerCase() ||
          u.phone === emailOrPhone.trim()
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. User not found.',
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact customer support.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password credentials.',
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
      );

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          referralCode: user.referral_code,
          walletBalance: user.wallet_balance,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async adminLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const users = db.getStore('users');
      const user = users.find(u => u.email.toLowerCase() === (email || '').trim().toLowerCase());

      if (!user || user.role !== 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized. Admin credentials required.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials.',
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: 'admin', name: user.name },
        config.jwtSecret,
        { expiresIn: '12h' }
      );

      return res.json({
        success: true,
        message: 'Admin authorization granted.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'admin',
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const users = db.getStore('users');
      const user = users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const addresses = db.getStore('addresses').filter(a => a.user_id === userId);
      const orders = db.getStore('orders').filter(o => o.user_id === userId);

      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          referralCode: user.referral_code,
          walletBalance: user.wallet_balance,
          savedAddressesCount: addresses.length,
          totalOrdersCount: orders.length,
          createdAt: user.created_at,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async getAddresses(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const addresses = db.getStore('addresses').filter(a => a.user_id === userId);
      return res.json({ success: true, addresses });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async addAddress(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { full_name, phone, house_flat, street, landmark, city, district, state, pincode, address_type, is_default } = req.body;

      if (!full_name || !phone || !house_flat || !street || !city || !pincode) {
        return res.status(400).json({
          success: false,
          message: 'Please complete required delivery address fields.',
        });
      }

      const addresses = db.getStore('addresses');

      if (is_default) {
        addresses.filter(a => a.user_id === userId).forEach(a => (a.is_default = false));
      }

      const newAddr = {
        id: `addr_${uuidv4().slice(0, 8)}`,
        user_id: userId,
        full_name,
        phone,
        house_flat,
        street,
        landmark: landmark || '',
        city,
        district: district || city,
        state: state || 'India',
        pincode,
        address_type: address_type || 'Home',
        is_default: is_default || addresses.filter(a => a.user_id === userId).length === 0,
        created_at: new Date().toISOString(),
      };

      addresses.push(newAddr);
      return res.status(201).json({ success: true, message: 'Address saved.', address: newAddr });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public async deleteAddress(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { addressId } = req.params;
      const addresses = db.getStore('addresses');
      const filtered = addresses.filter(a => !(a.id === addressId && a.user_id === userId));
      db.setStore('addresses', filtered);
      return res.json({ success: true, message: 'Address removed successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const authController = new AuthController();
