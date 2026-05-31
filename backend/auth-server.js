/**
 * خادم المصادقة والبريد الإلكتروني
 * يتعامل مع تسجيل الدخول والتسجيل وإرسال الرسائل
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ==================== Configuration ====================

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // استخدم App Password من Google
    }
});

// Support Email
const SUPPORT_EMAIL = 'timerapp.io@hmail.com';

// Google OAuth2
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

// ==================== Database (مثال بسيط) ====================
// في التطبيق الفعلي، استخدم قاعدة بيانات مثل MongoDB أو PostgreSQL

const users = new Map(); // مؤقتاً، استخدم قاعدة بيانات فعلية

// ==================== Helper Functions ====================

/**
 * توليد JWT Token
 */
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * إرسال بريد التحقق من الحساب
 */
async function sendVerificationEmail(email, verificationCode) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '✓ تحقق من بريدك الإلكتروني - تطبيق المؤقت',
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f5f5f5;">
                <div style="background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #667eea; margin-bottom: 20px;">⏱️ تطبيق المؤقت</h2>
                    <h3 style="color: #333; margin-bottom: 15px;">مرحباً بك!</h3>
                    <p style="color: #666; line-height: 1.6;">شكراً لتسجيلك معنا! يرجى التحقق من بريدك الإلكتروني باستخدام الكود أدناه:</p>
                    <div style="background: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
                        <h3 style="color: #333; letter-spacing: 2px; margin: 0;">${verificationCode}</h3>
                    </div>
                    <p style="color: #999; font-size: 14px;">هذا الكود صالح لمدة 24 ساعة</p>
                    <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
                        إذا لم تقم بهذا الطلب، يرجى تجاهل هذا البريد
                    </p>
                    <p style="color: #999; font-size: 12px; margin-top: 10px;">
                        للدعم والمساعدة: 
                        <a href="mailto:${SUPPORT_EMAIL}" style="color: #667eea; text-decoration: none;">
                            ${SUPPORT_EMAIL}
                        </a>
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
}

/**
 * إرسال بريد إعادة تعيين كلمة المرور
 */
async function sendPasswordResetEmail(email, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'إعادة تعيين كلمة المرور - تطبيق المؤقت',
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f5f5f5;">
                <div style="background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #667eea; margin-bottom: 20px;">⏱️ تطبيق المؤقت</h2>
                    <h3 style="color: #333; margin-bottom: 15px;">إعادة تعيين كلمة المرور</h3>
                    <p style="color: #666; line-height: 1.6;">لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر أدناه لإنشاء كلمة مرور جديدة:</p>
                    <p style="margin: 30px 0;">
                        <a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; display: inline-block; font-weight: bold;">
                            إعادة تعيين كلمة المرور
                        </a>
                    </p>
                    <p style="color: #999; font-size: 12px;">هذا الرابط صالح لمدة 1 ساعة فقط</p>
                    <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
                        إذا لم تطلب هذا، يرجى تجاهل هذا البريد
                    </p>
                    <p style="color: #999; font-size: 12px; margin-top: 10px;">
                        للدعم والمساعدة: 
                        <a href="mailto:${SUPPORT_EMAIL}" style="color: #667eea; text-decoration: none;">
                            ${SUPPORT_EMAIL}
                        </a>
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
}

/**
 * إرسال إشعارات ورسائل للمستخدم
 */
async function sendNotification(email, subject, message) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #667eea; margin-bottom: 20px;">⏱️ تطبيق المؤقت</h2>
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea; line-height: 1.6;">
                        ${message}
                    </div>
                    <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
                        للدعم والمساعدة: 
                        <a href="mailto:${SUPPORT_EMAIL}" style="color: #667eea; text-decoration: none;">
                            ${SUPPORT_EMAIL}
                        </a>
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Notification send error:', error);
        return false;
    }
}

/**
 * إرسال بريد الدعم من المستخدمين
 */
async function sendSupportEmail(userEmail, userName, subject, message) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: SUPPORT_EMAIL,
        replyTo: userEmail,
        subject: `[دعم] ${subject} - من ${userName}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #667eea;">رسالة دعم جديدة</h2>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>من:</strong> ${userName}</p>
                    <p><strong>البريد الإلكتروني:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
                    <p><strong>الموضوع:</strong> ${subject}</p>
                    <p><strong>الرسالة:</strong></p>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        
        // إرسال تأكيد للمستخدم
        const confirmOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'تم استلام رسالتك - فريق الدعم',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                    <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
                        <h2 style="color: #667eea; margin-bottom: 20px;">⏱️ تطبيق المؤقت</h2>
                        <h3 style="color: #333;">شكراً لتواصلك معنا!</h3>
                        <p style="color: #666; line-height: 1.6;">تم استلام رسالتك بنجاح. سيرد عليك فريق الدعم في أقرب وقت ممكن.</p>
                        <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
                            فريق الدعم: 
                            <a href="mailto:${SUPPORT_EMAIL}" style="color: #667eea; text-decoration: none;">
                                ${SUPPORT_EMAIL}
                            </a>
                        </p>
                    </div>
                </div>
            `
        };
        
        await transporter.sendMail(confirmOptions);
        return true;
    } catch (error) {
        console.error('Support email error:', error);
        return false;
    }
}

// ==================== Routes ====================

/**
 * تسجيل مستخدم جديد
 */
app.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // التحقق من المدخلات
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'يرجى ملء جميع الحقول'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'البريد الإلكتروني غير صحيح'
            });
        }

        // التحقق من عدم وجود المستخدم مسبقاً
        if (users.has(email)) {
            return res.status(409).json({
                success: false,
                message: 'هذا البريد الإلكتروني مسجل بالفعل'
            });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // توليد كود التحقق
        const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // حفظ المستخدم
        const user = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            verified: false,
            verificationCode,
            createdAt: new Date()
        };

        users.set(email, user);

        // إرسال بريد التحقق
        const emailSent = await sendVerificationEmail(email, verificationCode);

        if (emailSent) {
            res.status(201).json({
                success: true,
                message: 'تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني'
            });
        } else {
            res.status(201).json({
                success: true,
                message: 'تم إنشاء الحساب لكن فشل إرسال البريد. حاول لاحقاً'
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم'
        });
    }
});

/**
 * التحقق من الحساب
 */
app.post('/auth/verify-email', (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        const user = users.get(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({
                success: false,
                message: 'كود التحقق غير صحيح'
            });
        }

        user.verified = true;
        delete user.verificationCode;

        res.json({
            success: true,
            message: 'تم التحقق من الحساب بنجاح!'
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم'
        });
    }
});

/**
 * تسجيل الدخول بالبريد الإلكتروني
 */
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // التحقق من المدخلات
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'يرجى ملء جميع الحقول'
            });
        }

        // البحث عن المستخدم
        const user = users.get(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            });
        }

        // التحقق من كلمة المرور
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            });
        }

        // التحقق من تفعيل الحساب
        if (!user.verified) {
            return res.status(403).json({
                success: false,
                message: 'يرجى التحقق من بريدك الإلكتروني أولاً'
            });
        }

        // توليد التوكن
        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

        // إرسال إشعار بتسجيل الدخول
        await sendNotification(
            email,
            'تنبيه الأمان: تم تسجيل الدخول',
            '<p>✓ تم تسجيل الدخول إلى حسابك للتو من جهاز جديد.</p><p style="color: #999; font-size: 12px;">إذا لم تقم بذلك، يرجى تغيير كلمة المرور فوراً.</p>'
        );

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم'
        });
    }
});

/**
 * تسجيل الدخول بـ Google
 */
app.post('/auth/google-login', async (req, res) => {
    try {
        const { token } = req.body;

        // التحقق من التوكن مع Google
        const ticket = await oauth2Client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // البحث عن المستخدم أو إنشاء واحد جديد
        let user = users.get(email);
        if (!user) {
            user = {
                id: Date.now().toString(),
                name,
                email,
                picture,
                verified: true,
                loginMethod: 'google',
                createdAt: new Date()
            };
            users.set(email, user);
        }

        // توليد التوكن
        const jwtToken = generateToken(user);

        res.json({
            success: true,
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                picture: user.picture
            }
        });

        // إرسال ترحيب إذا كان حساب جديد
        if (!user.loginMethod || user.loginMethod !== 'google') {
            await sendNotification(
                email,
                'أهلاً وسهلاً في تطبيق المؤقت',
                '<p>✓ تم ربط حسابك بـ Google بنجاح. استمتع بميزات التطبيق الكاملة!</p>'
            );
        }

    } catch (error) {
        console.error('Google login error:', error);
        res.status(401).json({
            success: false,
            message: 'فشل التحقق من حساب Google'
        });
    }
});

/**
 * طلب إعادة تعيين كلمة المرور
 */
app.post('/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = users.get(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'لا يوجد حساب بهذا البريد الإلكتروني'
            });
        }

        // توليد رمز إعادة التعيين
        const resetToken = jwt.sign(
            { email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // حفظ التوكن مؤقتاً (في التطبيق الفعلي، احفظه في قاعدة البيانات)
        user.resetToken = resetToken;
        user.resetTokenExpires = Date.now() + 3600000; // ساعة واحدة

        // إرسال بريد إعادة التعيين
        const emailSent = await sendPasswordResetEmail(email, resetToken);

        if (emailSent) {
            res.json({
                success: true,
                message: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'فشل إرسال البريد. حاول لاحقاً'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم'
        });
    }
});

/**
 * إعادة تعيين كلمة المرور
 */
app.post('/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // التحقق من التوكن
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.get(decoded.email);

        if (!user || user.resetToken !== token) {
            return res.status(400).json({
                success: false,
                message: 'رابط إعادة التعيين غير صحيح أو منتهي الصلاحية'
            });
        }

        // تحديث كلمة المرور
        user.password = await bcrypt.hash(newPassword, 10);
        delete user.resetToken;
        delete user.resetTokenExpires;

        res.json({
            success: true,
            message: 'تم تحديث كلمة المرور بنجاح'
        });

        // إرسال إشعار بتغيير كلمة المرور
        await sendNotification(
            decoded.email,
            'تم تغيير كلمة المرور',
            '<p>✓ تم تغيير كلمة المرور الخاصة بك بنجاح.</p>'
        );

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم'
        });
    }
});

/**
 * إرسال إشعار مخصص
 */
app.post('/notifications/send', (req, res) => {
    try {
        const { email, subject, message } = req.body;

        // التحقق من أن المستخدم مسجل دخول
        const user = users.get(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        // إرسال الإشعار
        sendNotification(email, subject, message);

        res.json({
            success: true,
            message: 'تم إرسال الإشعار بنجاح'
        });
    } catch (error) {
        console.error('Notification error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم'
        });
    }
});

/**
 * إرسال رسالة دعم من المستخدم
 */
app.post('/support/send', async (req, res) => {
    try {
        const { email, name, subject, message } = req.body;

        // التحقق من المدخلات
        if (!email || !name || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'يرجى ملء جميع الحقول المطلوبة'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'البريد الإلكتروني غير صحيح'
            });
        }

        // إرسال رسالة الدعم
        const emailSent = await sendSupportEmail(email, name, subject, message);

        if (emailSent) {
            res.json({
                success: true,
                message: 'تم إرسال رسالتك بنجاح. سيرد عليك فريق الدع�� قريباً'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'فشل إرسال الرسالة. حاول لاحقاً'
            });
        }
    } catch (error) {
        console.error('Support email error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم'
        });
    }
});

// ==================== Server Start ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✓ Authentication Server running on port ${PORT}`);
    console.log(`✓ Email notifications enabled`);
    console.log(`✓ Google OAuth2 configured`);
    console.log(`✓ Support Email: ${SUPPORT_EMAIL}`);
});

module.exports = app;