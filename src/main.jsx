// main.jsx (أو index.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

/**
 * ===========================================
 * 🔹 Fashion Store Entry Point - Soo Style
 * ===========================================
 * هذا هو الملف الرئيسي لتشغيل تطبيق الفاشون
 * يقوم بتهيئة React DOM وتقديم التطبيق بالكامل.
 */

// الحصول على عنصر الجذر في HTML
const rootElement = document.getElementById('root');

// التحقق من وجود عنصر الجذر قبل محاولة التشغيل
if (!rootElement) {
  throw new Error(
    '❌ لم يتم العثور على عنصر الجذر. ' +
    'تأكد من وجود عنصر <div id="root"></div> في ملف index.html'
  );
}

// إنشاء React Root وتقديم التطبيق
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    {/* 🌸 Soo Style App */}
    <App />
  </React.StrictMode>
);
