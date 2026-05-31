/**
 * Middleware للتحقق من المستخدم المسجل دخول
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * التحقق من التوكن وسحب بيانات المستخدم
 */
function verifyToken(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'لا يوجد توكن. يرجى تسجيل الدخول'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'انتهت صلاحية التوكن. يرجى تسجيل الدخول مجدداً'
            });
        }
        res.status(403).json({
            success: false,
            message: 'توكن غير صحيح'
        });
    }
}

/**
 * التحقق من المستخدم الحالي (اختياري)
 */
function optionalAuth(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        }
        next();
    } catch (error) {
        // متابعة حتى لو فشل التحقق
        next();
    }
}

module.exports = {
    verifyToken,
    optionalAuth
};