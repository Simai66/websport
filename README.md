<div align="center">

# ⚽ WebSport
### ระบบจองสนามกีฬาออนไลน์

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/Vitest-Unit_Test-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" />
  <img src="https://img.shields.io/badge/Playwright-E2E_Test-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

> แพลตฟอร์มจองสนามกีฬาออนไลน์ครบวงจร พร้อมระบบชำระเงิน PromptPay QR, แดชบอร์ดผู้ดูแล และการจัดการผู้ใช้แบบ Role-based

</div>

---

## ✨ Features

| ฟีเจอร์ | รายละเอียด |
|--------|-----------|
| 🏟️ **จองสนามกีฬา** | เลือกสนาม วันที่ และช่วงเวลาได้สูงสุด 4 ชั่วโมงต่อครั้ง |
| 📅 **ตารางสนาม** | ดูสถานะ slot ว่าง/จองแล้วแบบ real-time |
| 💳 **PromptPay QR** | สร้าง QR Code ชำระเงินอัตโนมัติ พร้อม countdown timer 10 นาที |
| 📸 **อัปโหลดสลิป** | บีบอัดรูปภาพก่อนอัปโหลด ด้วย Canvas API |
| 🔐 **Firebase Auth** | สมัครสมาชิก / Login / Google Sign-In / Reset Password |
| 👥 **Role-based Access** | 3 ระดับ: `owner` › `admin` › `user` |
| 📊 **Admin Dashboard** | จัดการการจอง, สนาม, ผู้ใช้, และการตั้งค่าระบบ |
| 📱 **Responsive Design** | รองรับทุกขนาดหน้าจอ |

---

## 🛠️ Tech Stack

```
Frontend   React 19 + Vite 7
Routing    React Router v7
Backend    Firebase Auth + Cloud Firestore
QR Code    promptpay-qr + qrcode
Icons      react-icons
Testing    Vitest (Unit) + Playwright (E2E)
Deploy     Firebase Hosting
```

---

## 📁 Project Structure

```
websport/
├── public/                   # Static assets
├── src/
│   ├── components/           # Shared UI components
│   │   ├── layout/           # Navbar, Footer, AuthGuard
│   │   ├── Calendar.jsx      # Booking calendar
│   │   ├── FieldCard.jsx     # Field listing card
│   │   ├── QRPayment.jsx     # PromptPay QR + slip upload
│   │   ├── StatusBadge.jsx   # Booking status badge
│   │   └── Toast.jsx         # Notification toast
│   ├── contexts/
│   │   └── AuthContext.jsx   # Firebase Auth context + hooks
│   ├── features/
│   │   └── dashboard/        # Admin dashboard pages & components
│   │       ├── Bookings.jsx
│   │       ├── Fields.jsx
│   │       ├── Overview.jsx
│   │       ├── Schedule.jsx
│   │       ├── Settings.jsx
│   │       └── UserManagement.jsx
│   ├── layouts/
│   │   ├── DashboardLayout.jsx
│   │   └── MarketingLayout.jsx
│   ├── pages/
│   │   ├── Home.jsx          # หน้าหลัก + รายชื่อสนาม
│   │   ├── FieldDetail.jsx   # รายละเอียดสนาม + จอง
│   │   ├── MyBookings.jsx    # ประวัติการจองของผู้ใช้
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Profile.jsx
│   ├── data.js               # Data layer (localStorage CRUD)
│   ├── firebase.js           # Firebase config
│   └── App.jsx               # Routes definition
├── firestore.rules           # Firestore security rules
├── firebase.json             # Firebase deploy config
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 18`
- npm `>= 9`
- Firebase project (Auth + Firestore enabled)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Simai66/websport.git
cd websport

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# แก้ไข .env.local ด้วย Firebase config ของคุณ

# 4. Start development server
npm run dev
```

---

## 🔑 Environment Variables

สร้างไฟล์ `.env.local` ที่ root ของโปรเจกต์:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **อย่า commit ไฟล์ `.env.local`** — ไฟล์นี้อยู่ใน `.gitignore` แล้ว

---

## 📜 Scripts

| คำสั่ง | ความหมาย |
|--------|---------|
| `npm run dev` | รัน dev server ที่ `http://localhost:5173` |
| `npm run build` | Build สำหรับ production |
| `npm run preview` | Preview production build |
| `npm run lint` | ตรวจสอบ ESLint |
| `npm test` | รัน Unit Tests (Vitest) |
| `npm run test:watch` | รัน Unit Tests แบบ watch mode |

---

## 🧪 Testing

โปรเจกต์นี้มี test coverage ครอบคลุม 2 ระดับ:

### Unit Tests (Vitest)

```bash
npm test
```

ครอบคลุมฟังก์ชันใน `data.js` ทั้งหมด และ validation logic ใน `Register.jsx`
**37 test cases — ผ่านทั้งหมด ✅**

### E2E Tests (Playwright)

```bash
npx playwright test
```

ทดสอบ booking flow และ authentication flow ตั้งแต่ต้นจนจบ

### Test Report

ดูรายงาน test cases ฉบับเต็ม 41 กรณีได้ที่ [`WebSport_TestReport.docx`](./WebSport_TestReport.docx)

---

## 👥 Roles & Permissions

| สิทธิ์ | `user` | `admin` | `owner` |
|-------|:------:|:-------:|:-------:|
| จองสนาม | ✅ | ✅ | ✅ |
| ดูการจองตัวเอง | ✅ | ✅ | ✅ |
| ยืนยัน/ปฏิเสธการจอง | ❌ | ✅ | ✅ |
| จัดการสนาม | ❌ | ✅ | ✅ |
| จัดการผู้ใช้ | ❌ | ❌ | ✅ |
| ตั้งค่าระบบ | ❌ | ❌ | ✅ |

---

## 🚢 Deployment

```bash
# Build และ deploy ไปยัง Firebase Hosting
npm run build
firebase deploy
```

---

## 🔒 Security

- **Firestore Rules** — อ่าน/เขียนด้วยสิทธิ์ตาม role เท่านั้น
- **Environment Variables** — Firebase config ไม่ถูก commit ลง repository
- **Image Compression** — ลดขนาดสลิปก่อนอัปโหลด (max 600px, quality 60%)
- **Booking Timeout** — การจองที่ไม่ชำระเงินภายใน 10 นาทีจะหมดอายุอัตโนมัติ

---

## 📄 License

MIT License — © 2569 นาย ภาณุวัฒน์ เวยรัมย์

---

<div align="center">
  <sub>Built with ❤️ using React + Firebase</sub>
</div>
