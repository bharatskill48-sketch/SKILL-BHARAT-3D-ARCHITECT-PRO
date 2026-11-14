# SKILL BHARAT 3D ARCHITECT PRO — ধাপ ১

এটি প্রথম কার্যকর 2D prototype।

## কাজ করে
- Demo room নির্বাচন ও drag করে সরানো
- নতুন room যোগ করা, নাম/মাপ/অবস্থান/রং বদলানো, delete
- Local Storage-এ Save
- JSON project download/import
- SVG floor-plan export
- Responsive mobile layout

## চালাতে
Node.js ইনস্টল করা কম্পিউটারে:
```bash
npm install
npm run dev
npm run build
```

Firebase এখনো ঐচ্ছিক placeholder। `.env.example` কপি করে `.env` বানিয়ে Firebase Web App config দিন। Cloud sync/login পরের ধাপে যুক্ত হবে। Firebase Spark Plan-এর free limits আছে; সীমা অতিক্রম করলে ফ্রি থাকা নিশ্চিত নয়। Service-account private key কখনো browser code-এ দেবেন না।

পরবর্তী ধাপ: feet/meters measurement, walls, doors/windows, 3D extrusion, furniture library, Firebase sync, Android APK। এই prototype নির্মাণের জন্য অনুমোদিত CAD নয়; নির্মাণের আগে পেশাদার যাচাই জরুরি।
