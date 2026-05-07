import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyBkUktu2SQS9T4Gwwd8JSfPsDQqD1rSLTE",
  authDomain: "avenyx48.firebaseapp.com",
  projectId: "avenyx48",
  storageBucket: "avenyx48.firebasestorage.app",
  messagingSenderId: "1047050800219",
  appId: "1:1047050800219:web:6758e39c1889bc3a9bc37e",
  measurementId: "G-SX1VQNST66",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_EMAIL = "auriliadjami@gmail.com";
const ADMIN_LOGIN_KEY = "avenyx48_admin_login";
const ADMIN_WA = "6285742653063"; // GANTI NOMOR ADMIN KAMU

const schedulesRef = collection(db, "schedules");
let schedules = [];

/* IMAGE */
function imageToBase64(file) {
  return new Promise((resolve) => {
    if (!file) return resolve("");

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/* LOGIN ADMIN */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document
      .getElementById("adminEmail")
      .value.trim()
      .toLowerCase();
    const message = document.getElementById("loginMessage");

    if (email === ADMIN_EMAIL) {
      localStorage.setItem(ADMIN_LOGIN_KEY, "true");
      window.location.href = "admin.html";
    } else {
      message.textContent = "Email admin salah.";
    }
  });
}

function protectAdminPage() {
  const isAdminPage = document.querySelector(".admin-layout");
  if (!isAdminPage) return;

  if (localStorage.getItem(ADMIN_LOGIN_KEY) !== "true") {
    window.location.href = "login.html";
  }
}

protectAdminPage();

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem(ADMIN_LOGIN_KEY);
    window.location.href = "login.html";
  });
}

/* FIREBASE REALTIME DATA */
function startRealtimeSchedules() {
  const q = query(schedulesRef, orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    schedules = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    renderUserSchedules();
    renderAdminSchedules();
  });
}

startRealtimeSchedules();

/* USER SCHEDULE */

function isToday(dateString) {
  const today = new Date();
  const inputDate = new Date(dateString);

  return (
    today.getFullYear() === inputDate.getFullYear() &&
    today.getMonth() === inputDate.getMonth() &&
    today.getDate() === inputDate.getDate()
  );
}

function renderUserSchedules() {
  const list = document.getElementById("scheduleList");
  if (!list) return;

  if (schedules.length === 0) {
    list.innerHTML = `<div class="empty">Belum ada jadwal show.</div>`;
    return;
  }

  list.innerHTML = schedules
    .map(
      (item, index) => `
    <div class="show-card">
      ${item.image ? `<img src="${item.image}" alt="${item.title}">` : ""}

      <h3>${item.title}</h3>
      <p class="show-date">${item.date} | ${item.time} WIB</p>

      <div class="member-tags">
        <span>Theater</span>
      </div>

    <div class="countdown ${isToday(item.date) ? "live-now" : ""}">
        ${isToday(item.date) ? "🔴 LIVE HARI INI" : "⏱ Jadwal tersedia"}
    </div>

      <p class="show-desc">${item.description}</p>

      <div class="show-bottom">
        <div class="show-price">${item.price}</div>
        <button class="detail-btn" onclick="openShowDetail(${index})">Detail Show</button>
      </div>
    </div>
  `,
    )
    .join("");
}

/* ADMIN SCHEDULE */
function renderAdminSchedules() {
  const list = document.getElementById("adminScheduleList");
  if (!list) return;

  if (schedules.length === 0) {
    list.innerHTML = `<div class="empty">Belum ada jadwal show.</div>`;
    return;
  }

  list.innerHTML = schedules
    .map(
      (item) => `
    <div class="admin-item">
      ${item.image ? `<img src="${item.image}" alt="${item.title}">` : ""}
      <h3>${item.title}</h3>
      <p><b>Tanggal:</b> ${item.date}</p>
      <p><b>Jam:</b> ${item.time}</p>
      <p><b>Harga:</b> ${item.price}</p>
      <p>${item.description}</p>
      <button class="delete-btn" onclick="deleteSchedule('${item.id}')">Hapus</button>
    </div>
  `,
    )
    .join("");
}

window.deleteSchedule = async function (id) {
  const yakin = confirm("Yakin mau hapus jadwal ini?");
  if (!yakin) return;

  await deleteDoc(doc(db, "schedules", id));
};

/* ADD SHOW */
const showForm = document.getElementById("showForm");

if (showForm) {
  showForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const imageFile = document.getElementById("image").files[0];
    const imageBase64 = await imageToBase64(imageFile);

    await addDoc(schedulesRef, {
      image: imageBase64,
      title: document.getElementById("title").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      price: document.getElementById("price").value,
      description: document.getElementById("description").value,
      createdAt: serverTimestamp(),
    });

    showForm.reset();
    alert("Jadwal berhasil ditambahkan!");
  });
}

/* DETAIL SHOW */
window.openShowDetail = function (index) {
  const item = schedules[index];

  const modal = document.createElement("div");
  modal.className = "detail-modal";

  modal.innerHTML = `
    <div class="detail-card">
      <button class="close-modal" onclick="closeShowDetail()">×</button>

      <h2>Show Detail</h2>

      <div class="detail-line"></div>

      <div class="detail-date-row">
        <div>
          <span>TANGGAL</span>
          <strong>${item.date || "-"}</strong>
        </div>

        <div>
          <span>WAKTU</span>
          <strong>${item.time || "TBA"} WIB</strong>
        </div>
      </div>

      <div class="detail-info">
        <p>🚫 <span>Tidak bisa direfund.</span></p>
        <p>📅 <span>Hanya berlaku di tanggal yang dipilih.</span></p>
        <p>✉️ <span>Konfirmasi pemesanan di WhatsApp admin.</span></p>
        <p>🎟️ <span>Penukaran tiket 1 jam sebelum show.</span></p>
      </div>

      <div class="ticket-box">
        <label>JUMLAH TIKET</label>
        <div class="ticket-control">
          <button onclick="changeTicketQty(-1)">−</button>
          <input id="ticketQty" type="number" value="1" min="1" readonly>
          <button onclick="changeTicketQty(1)">+</button>
        </div>
      </div>

      <div class="detail-line"></div>

      <div class="detail-price-row">
        <span>HARGA TIKET</span>
        <strong>${item.price}</strong>
      </div>

      <a href="#" onclick="buyTicket(${index})" class="buy-ticket-btn">
        Beli Tiket Show
      </a>
    </div>
  `;

  document.body.appendChild(modal);
};

window.closeShowDetail = function () {
  const modal = document.querySelector(".detail-modal");
  if (modal) modal.remove();
};

window.changeTicketQty = function (amount) {
  const input = document.getElementById("ticketQty");
  let value = parseInt(input.value) || 1;

  value += amount;
  if (value < 1) value = 1;

  input.value = value;
};

window.buyTicket = function (index) {
  const item = schedules[index];
  const qty = document.getElementById("ticketQty").value;

  const message = encodeURIComponent(
    `Halo admin Avenyx_48, saya mau beli tiket show:\n\n` +
      `Judul: ${item.title}\n` +
      `Tanggal: ${item.date}\n` +
      `Jam: ${item.time} WIB\n` +
      `Harga: ${item.price}\n` +
      `Jumlah Tiket: ${qty}`,
  );

  window.open(`https://wa.me/${ADMIN_WA}?text=${message}`, "_blank");
};

/* MEMBERSHIP */
/* BUNDLE DETAIL POPUP */
window.openBundleDetail = function (packageName, priceNum) {
  const modal = document.createElement("div");
  modal.className = "detail-modal";

  modal.innerHTML = `
    <div class="detail-card">
      <button class="close-modal" onclick="closeShowDetail()">×</button>

      <h2>${packageName}</h2>

      <div class="detail-line"></div>

      <div class="detail-info">
        <p>🚫 <span>Tidak bisa direfund.</span></p>
        <p>✉️ <span>Konfirmasi pemesanan di WhatsApp admin.</span></p>
        <p>💎 <span>Akses langsung setelah konfirmasi.</span></p>
      </div>

      <div class="ticket-box">
        <label>JUMLAH PAKET</label>
        <div class="ticket-control">
          <button onclick="changeBundleQty(-1, ${priceNum})">−</button>
          <input id="bundleQty" type="number" value="1" min="1" readonly>
          <button onclick="changeBundleQty(1, ${priceNum})">+</button>
        </div>
      </div>

      <div class="detail-line"></div>

      <div class="detail-price-row">
        <span>TOTAL HARGA</span>
        <strong id="bundleTotalPrice">Rp ${priceNum.toLocaleString("id-ID")}</strong>
      </div>

      <a href="#" onclick="buyBundle('${packageName}', ${priceNum})" class="buy-ticket-btn">
        Order Sekarang
      </a>
    </div>
  `;

  document.body.appendChild(modal);
};

window.changeBundleQty = function (amount, pricePerItem) {
  const input = document.getElementById("bundleQty");
  let value = parseInt(input.value) || 1;

  value += amount;
  if (value < 1) value = 1;

  input.value = value;

  const total = value * pricePerItem;
  document.getElementById("bundleTotalPrice").textContent =
    "Rp " + total.toLocaleString("id-ID");
};

window.buyBundle = function (packageName, priceNum) {
  const qty = document.getElementById("bundleQty").value;
  const total = parseInt(qty) * priceNum;

  const message = encodeURIComponent(
    `Halo admin Avenyx_48, saya mau order:\n\n` +
      `Paket: ${packageName}\n` +
      `Harga Satuan: Rp ${priceNum.toLocaleString("id-ID")}\n` +
      `Jumlah: ${qty}\n` +
      `Total: Rp ${total.toLocaleString("id-ID")}`,
  );

  window.open(`https://wa.me/${ADMIN_WA}?text=${message}`, "_blank");
};

window.openMembershipDetail = function () {
  const modal = document.createElement("div");
  modal.className = "detail-modal";

  modal.innerHTML = `
    <div class="detail-card">
      <button class="close-modal" onclick="closeShowDetail()">×</button>

      <h2>Paket Langganan</h2>

      <div class="detail-line"></div>

      <div class="detail-info">
        <p>✅ <span>Akses show selama 30 hari.</span></p>
        <p>📅 <span>Update jadwal theater otomatis.</span></p>
        <p>🔁 <span>Info replay show tersedia.</span></p>
        <p>🎥 <span>Resolusi HD.</span></p>
        <p>🚫 <span>Tidak bisa direfund.</span></p>
        <p>✉️ <span>Konfirmasi pemesanan di WhatsApp admin.</span></p>
        <p>💎 <span>Akses langsung setelah konfirmasi.</span></p>
      </div>

      <div class="detail-line"></div>

      <div class="detail-price-row">
        <span>HARGA</span>
        <strong>Rp 30.000 <small style="font-weight:normal;color:#888">/bulan</small></strong>
      </div>

      <a href="#" onclick="buyMembership()" class="buy-ticket-btn">
        Ambil Promo Ini
      </a>
    </div>
  `;

  document.body.appendChild(modal);
};

window.buyMembership = function () {
  const message = encodeURIComponent(
    `Halo admin Avenyx_48, saya mau ambil Paket Langganan:\n\n` +
      `Paket: Langganan 30 Hari\n` +
      `Harga: Rp 30.000/bulan`,
  );

  window.open(`https://wa.me/${ADMIN_WA}?text=${message}`, "_blank");
};

window.toggleMenu = function () {
  const menu = document.getElementById("mobileMenu");
  if (menu) {
    menu.classList.toggle("show");
  }
};
