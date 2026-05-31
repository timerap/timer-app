/**
 * مكتبة المصادقة للتطبيق الأمامي
 * تتعامل مع التوكن وبيانات المستخدم
 */

class AuthService {
    constructor(apiUrl = 'http://localhost:3000') {
        this.apiUrl = apiUrl;
        this.tokenKey = 'token';
        this.userKey = 'user';
    }

    /**
     * الحصول على التوكن المحفوظ
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * الحصول على بيانات المستخدم المحفوظة
     */
    getUser() {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }

    /**
     * التحقق من تسجيل دخول المستخدم
     */
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getUser();
        return !!(token && user);
    }

    /**
     * حفظ التوكن والمستخدم
     */
    setAuth(token, user) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    /**
     * مسح بيانات المستخدم (تسجيل خروج)
     */
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    /**
     * تسجيل دخول بالبريد الإلكتروني
     */
    async loginWithEmail(email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.setAuth(data.token, data.user);
                return { success: true, data };
            } else {
                return { success: false, error: data.message };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * تسجيل مستخدم جديد
     */
    async register(name, email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * التحقق من الحساب بواسطة كود
     */
    async verifyEmail(email, verificationCode) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, verificationCode })
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * طلب إعادة تعيين كلمة المرور
     */
    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * إعادة تعيين كلمة المرور
     */
    async resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * تسجيل دخول بـ Google
     */
    async loginWithGoogle(googleToken) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/google-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: googleToken })
            });

            const data = await response.json();

            if (response.ok) {
                this.setAuth(data.token, data.user);
                return { success: true, data };
            } else {
                return { success: false, error: data.message };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * إرسال طلب مع التوكن
     */
    async fetchWithAuth(url, options = {}) {
        const token = this.getToken();
        
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        return fetch(url, {
            ...options,
            headers
        });
    }

    /**
     * تحديث بيانات المستخدم
     */
    updateUser(userUpdates) {
        const user = this.getUser();
        const updatedUser = { ...user, ...userUpdates };
        localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
        return updatedUser;
    }
}

// تصدير الخدمة
const authService = new AuthService();

// للاستخدام في HTML:
// <script src="frontend/auth.js"></script>
// ثم يمكن استخدام authService مباشرة