import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getDatabase, ref, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyADtj_iYU1wn3kBaaPfXTqMqEAClVJRVNE",
  authDomain: "raouf-68d9e.firebaseapp.com",
  databaseURL: "https://raouf-68d9e-default-rtdb.firebaseio.com",
  projectId: "raouf-68d9e",
  storageBucket: "raouf-68d9e.firebasestorage.app",
  messagingSenderId: "390151395077",
  appId: "1:390151395077:web:993860d19c10650cc1496c",
  measurementId: "G-VSZ31FMZGD"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const totalRef = ref(db, 'stats/total_visitors');
runTransaction(totalRef, (curr) => (curr || 0) + 1);

onValue(totalRef, (snap) => {
  const el = document.getElementById('total-visitors');
  if (el) el.innerText = snap.val() || 0;
});

window.updateDL = (id) => {
  if (!id) return;
  runTransaction(ref(db, 'counts/' + id), (curr) => (curr || 0) + 1);
};

window.syncCounts = () => {
  onValue(ref(db, 'counts/'), (snap) => {
    const data = snap.val();
    if (!data) return;
    for (let id in data) {
      const el = document.getElementById('c-' + id);
      if (el) el.innerText = "تم التحميل " + data[id] + " مرة";
    }
  });
};
