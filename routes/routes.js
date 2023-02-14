const express = require('express');
const Model = require('../models/model');
const router = express.Router();
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  const data = new Model({
    name: name,
    email: email,
    password: hashPassword,
    twoFactorEnable: false,
    secret: ''
  });

  try {
    await data.save();
    res.status(201).json({
      status: 'success',
      message: 'Registered successfully, please login'
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Model.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Email or password incorrect'
      });
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Email or password incorrect' });
    }
    res.status(200).json({
      status: 'success',
      user
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/otp/generateQR', async (req, res) => {
  try {
    const { user_id, email } = req.body;
    const { base32, otpauth_url } = await speakeasy.generateSecret({
      issuer: 'wecopytrade.com',
      name: email
    });
    await Model.findByIdAndUpdate(user_id, {
      secret: base32
    });

    res.status(200).json({
      status: 'success',
      base32,
      otpauth_url
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

router.post('/otp/verify', async (req, res) => {
  try {
    const { user_id, token } = req.body;
    const user = await Model.findById(user_id);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: "User doesn't exist"
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(401).send({
        status: 'fail',
        message: 'TOTP code is incorrect'
      });
    }
    const userUpdate = await Model.findByIdAndUpdate(
      user_id,
      {
        twoFactorEnable: true
      },
      { returnOriginal: false, returnDocument: true }
    );
    res.status(200).json({
      status: 'success',
      user: userUpdate
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/otp/disable', async (req, res) => {
  try {
    const { user_id } = req.body;
    const user = await Model.findById(user_id);

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: "User doesn't exist"
      });
    }

    const userUpdate = await Model.findByIdAndUpdate(
      user_id,
      { twoFactorEnable: false },
      { returnOriginal: false, returnDocument: true }
    );
    res.status(200).json({
      status: 'success',
      user: userUpdate
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

router.post('/otp/validate', async (req, res) => {
  try {
    const { user_id, token } = req.body;
    const user = await Model.findById(user_id);
    const message = "Token is invalid or user doesn't exist";
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message
      });
    }

    const validToken = speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'base32',
      token
    });

    if (!validToken) {
      return res.status(401).send({
        status: 'fail',
        message
      });
    }

    res.status(200).json({
      status: 'success',
      otp_valid: true
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
