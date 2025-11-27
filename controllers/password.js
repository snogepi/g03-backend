import crypto from 'crypto'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'

import { StudentModel, StaffModel } from '../models/user.js'

async function findUserByEmail(email) {
    let user = await StudentModel.findOne({ email });
    if (user) return { user, role: "Student" };

    user = await StaffModel.findOne({ email });
    if (user) return { user, role: "Staff" };

    return null;
}

async function sendResetEmail(email, resetLink) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,  // try 465 mamaya
        secure: false,  // true for 465 false for 587
        auth: {
            user: 'apikey', 
            pass: process.env.SENDGRID_API_KEY,
        },
    });
    await transporter.sendMail({
        from: 'process.env.EMAIL_USER', 
        to: email,
        subject: "Password Reset Request",
        text: `Click this link to reset your password: ${resetLink}`
    });
}

export async function forgotPassword(req, res) {
    const { email } = req.body;

    try {
        const result = await findUserByEmail(email);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No account found with that email."
            });
        }

        const user = result.user;

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = await bcrypt.hash(resetToken, 10);

        user.resetToken = hashedToken;
        user.resetTokenExpiry = Date.now() + 3600000;
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

        await sendResetEmail(email, resetLink);

        return res.json({
            success: true,
            message: "Password reset link sent to your email."
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
}

export async function resetPassword(req, res) {
    const { email, token, newPassword } = req.body;

    try {
        let user = await StudentModel.findOne({ email });
        if (!user) user = await StaffModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        if (!user.resetToken || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Reset token is invalid or expired."
            });
        }

        const isValid = await bcrypt.compare(token, user.resetToken);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid token."
            });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;

        user.resetToken = null;
        user.resetTokenExpiry = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully."
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
}