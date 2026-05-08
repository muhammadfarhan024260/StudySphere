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

const messaging = firebase.messaging()

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || 'StudySphere'
  const body  = payload.notification?.body  || ''
  self.registration.showNotification(title, { body, icon: '/icon.png' })
})
