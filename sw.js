const CACHE_NAME = 'battery-pos-v2';

// ระบุ URL ทั้งหมดที่ต้องการให้โหลดเก็บไว้ในเครื่อง รวมถึงไฟล์จากเว็บนอก (CDN)
const urlsToCache = [
  '/',                     
  '/index.html',           // ชื่อไฟล์ HTML ของคุณ
  '/manifest.json',        // ชื่อไฟล์ PWA
  
  // ใส่ Link ของ sql.js เข้าไปตรงๆ ได้เลย
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm'
];

// 1. ตอนติดตั้ง Service Worker ให้ไปดาวน์โหลดไฟล์ทั้งหมดมาเก็บไว้
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('กำลังดาวน์โหลดไฟล์ลงเครื่อง...');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. ดักจับการทำงาน เมื่อแอปต้องการไฟล์ ให้หาในเครื่องก่อน
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // ถ้าเจอไฟล์ในเครื่อง (Cache) ให้ส่งกลับไปเลย ไม่ต้องง้อเน็ต
        if (response) {
          return response;
        }
        // ถ้าไม่เจอ ค่อยวิ่งไปหาจากอินเทอร์เน็ต
        return fetch(event.request);
      })
  );
});

// 3. จัดการลบไฟล์แคชเวอร์ชันเก่าทิ้ง
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});