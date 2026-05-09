importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey:            "AIzaSyBBx5iTLCFnMecFydzUQaFtkJIKPwk2NK4",
  authDomain:        "studysphere-bff76.firebaseapp.com",
  projectId:         "studysphere-bff76",
  storageBucket:     "studysphere-bff76.firebasestorage.app",
  messagingSenderId: "382240332545",
  appId:             "1:382240332545:web:1b9c1dc1b92bf90d315900",
})

// Force-activate new SW immediately so icon/content fixes take effect on next load
self.addEventListener('install',  () => self.skipWaiting())
self.addEventListener('activate', e  => e.waitUntil(self.clients.claim()))

// WebpushConfig.Notification messages are rendered natively by FCM with the correct
// icon and body — no manual showNotification needed here.
firebase.messaging()
