# ⏱️ تطبيق المؤقت (Timer App)

تطبيق ويب حديث لإدارة الوقت والمؤقتات مع نظام مصادقة متكامل.

## ✨ المميزات

### المصادقة والحسابات
- ✅ تسجيل دخول/خروج آمن
- ✅ إنشاء حسابات جديدة
- ✅ تسجيل دخول بـ **Google** 
- ✅ التحقق من الحساب عبر **البريد الإلكتروني**
- ✅ إعادة تعيين كلمة المرور
- ✅ إشعارات عبر البريد الإلكتروني

### الميزات الأخرى
- 🎨 واجهة مستخدم حديثة وسهلة
- 📱 تصميم متجاوب (Responsive)
- 🌙 دعم الوضع الليلي
- 📊 تتبع الإنجازات

## 📋 المتطلبات

### الخادم (Backend)
```bash
Node.js >= 14
npm أو yarn
```

### المتطلبات الخارجية
1. **حساب Gmail** - لإرسال الرسائل
2. **Google OAuth** - لتسجيل الدخول بـ Google
3. **قاعدة بيانات** (اختيارية) - MongoDB أو PostgreSQL

## 🚀 التثبيت والتشغيل

### 1️⃣ استنساخ المستودع
```bash
git clone https://github.com/timerap/timer-app.git
cd timer-app
```

### 2️⃣ تثبيت المتطلبات (Backend)
```bash
cd backend
npm install
```

### 3️⃣ إعداد متغيرات البيئة

انسخ ملف `.env.example` إلى `.env`:
```bash
cp .env.example .env
```

ثم قم بتحرير `.env` بإضافة بيانات اعتمادك:
```env
# JWT
JWT_SECRET=your-super-secret-key

# Gmail Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URL=http://localhost:3000/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:3001
```

### 4️⃣ الحصول على بيانات اعتماد Gmail

1. اذهب إلى [Google Account](https://myaccount.google.com/)
2. اضغط على "الأمان" في الجانب الأيسر
3. فعّل "التحقق بخطوتين"
4. اذهب إلى "كلمات المرور التطبيق" (App Passwords)
5. اختر "البريد" و "Windows Computer"
6. انسخ كلمة المرور وضعها في `EMAIL_PASSWORD`

### 5️⃣ الحصول على بيانات Google OAuth

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد
3. فعّل Google+ API
4. أنشئ بيانات اعتماد OAuth 2.0:
   - اختر "تطبيق ويب"
   - أضف `http://localhost:3000/auth/google/callback` إلى "URIs إعادة التوجيه المصرح بها"
5. انسخ Client ID و Client Secret

### 6️⃣ تشغيل الخادم
```bash
npm run dev
# أو
npm start
```

الخادم سيعمل على `http://localhost:3000`

### 7️⃣ فتح التطبيق

افتح المتصفح واذهب إلى:
- صفحة تسجيل الدخول: `http://localhost:3000/auth.html`
- التطبيق الرئيسي: `http://localhost:3000/index.html`

## 📁 هيكل المشروع

```
timer-app/
├── auth.html              # صفحة تسجيل الدخول
├── index.html             # الصفحة الرئيسية
├── frontend/
│   ├── auth.js           # مكتبة المصادقة
│   ├── styles.css        # الأنماط
│   └── app.js            # منطق التطبيق
├── backend/
│   ├── auth-server.js    # خادم المصادقة
│   ├── package.json
│   └── .env.example
├── auth-middleware.js     # Middleware للتحقق
└── README.md
```

## 🔐 مسارات API

### المصادقة (Authentication)

| الطريقة | المسار | الوصف |
|--------|--------|-------|
| POST | `/auth/register` | تسجيل مستخدم جديد |
| POST | `/auth/login` | تسجيل دخول بالبريد |
| POST | `/auth/google-login` | تسجيل دخول بـ Google |
| POST | `/auth/verify-email` | التحقق من البريد |
| POST | `/auth/forgot-password` | طلب إعادة تعيين كلمة المرور |
| POST | `/auth/reset-password` | إعادة تعيين كلمة المرور |

### الإشعارات (Notifications)

| الطريقة | المسار | الوصف |
|--------|--------|-------|
| POST | `/notifications/send` | إرسال إشعار بريدي |

## 📝 أمثلة الاستخدام

### تسجيل دخول بالبريد الإلكتروني
```javascript
const result = await authService.loginWithEmail(
    'user@example.com',
    'password123'
);
```

### تسجيل دخول بـ Google
```javascript
const result = await authService.loginWithGoogle(googleToken);
```

### التحقق من تسجيل الدخول
```javascript
if (authService.isAuthenticated()) {
    const user = authService.getUser();
    console.log('Welcome:', user.name);
}
```

### طلب إعادة تعيين كلمة المرور
```javascript
const result = await authService.requestPasswordReset('user@example.com');
```

## 🛡️ الأمان

- ✅ تشفير كلمات المرور بـ bcrypt
- ✅ التحقق الآمن من JWT tokens
- ✅ حماية CORS
- ✅ التحقق من البريد الإلكتروني
- ✅ رموز إعادة التعيين المؤقتة

## 📧 البريد الإلكتروني

يتم إرسال الرسائل التالية تلقائياً:

1. **بريد التحقق من الحساب**
   - يُرسل عند التسجيل
   - يحتوي على كود التحقق

2. **بريد إعادة تعيين كلمة المرور**
   - يُرسل عند نسيان كلمة المرور
   - يحتوي على رابط آمن

3. **إشعارات الأمان**
   - إخطار بتسجيل دخول جديد
   - إخطار بتغيير كلمة المرور

4. **الترحيب والإشعارات**
   - رسالة ترحيب عند الحساب الجديد
   - إشعارات مخصصة

## 🐛 استكشاف الأخطاء

### خطأ: "لا يمكن الاتصال بـ API"
- تأكد من أن الخادم يعمل على `localhost:3000`
- تحقق من اتصال الإنترنت

### خطأ: "فشل إرسال البريد الإلكتروني"
- تحقق من بيانات Gmail في `.env`
- تأكد من تفعيل "تطبيقات أقل أماناً" أو استخدام "كلمات مرور التطبيق"

### خطأ: "فشل تسجيل الدخول بـ Google"
- تحقق من `GOOGLE_CLIENT_ID` و `GOOGLE_CLIENT_SECRET`
- تأكد من إضافة `localhost:3000` إلى URIs المصرح بها

## 📚 الموارد والمراجع

- [Express.js Documentation](https://expressjs.com/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Nodemailer Guide](https://nodemailer.com/)
- [JWT (JSON Web Tokens)](https://jwt.io/)

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License

## 👥 المساهمة

نرحب بالمساهمات! يرجى:

1. عمل Fork للمستودع
2. إنشاء فرع جديد (`git checkout -b feature/amazing`)
3. الالتزام بالتغييرات (`git commit -m 'Add amazing feature'`)
4. رفع التغييرات (`git push origin feature/amazing`)
5. فتح Pull Request

## 📞 التواصل والدعم

- 📧 البريد الإلكتروني: support@timerapp.com
- 🐙 GitHub Issues: [Report a bug](https://github.com/timerap/timer-app/issues)

---

**صُنع بـ ❤️ بواسطة فريق timerap**