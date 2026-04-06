import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// 1. استيراد ملف تسجيل الـ Service Worker
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 2. تغيير التفعيل من unregister إلى register
// ده اللي بيخلي الأبلكيشن يشتغل Offline ويتحول لـ PWA
serviceWorkerRegistration.register();

reportWebVitals();