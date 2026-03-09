// ملف main.jsx (أو index.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

/**
 * 🔹 نقطة الدخول الرئيسية لتطبيق الفاشون
 * 
 * هنا نقوم بإنشاء الجذر وتقديم التطبيق
 * كل شيء مرتبط بمتجر Soo Style
 */
const rootElement = document.getElementById('root');

// التحقق من وجود عنصر الجذر قبل التشغيل
if (!rootElement) {
  throw new Error('❌ لم يتم العثور على عنصر الجذر. تأكد من وجود عنصر بمعرف "root" في ملف HTML');
}

// إنشاء الجذر وتقديم التطبيق
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* 🌸 Soo Style App */}
    <App />
  </React.StrictMode>
);