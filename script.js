// =====================
// SISTEM ROLE
// =====================
const userRole = sessionStorage.getItem("userRole") || "viewer";

function applyRoleAccess() {
  if (userRole === "viewer") {
    document.querySelectorAll("form").forEach(form => form.style.display = "none");
    const style = document.createElement("style");
    style.innerHTML = `th:last-child, td:last-child { display: none !important; }`;
    document.head.appendChild(style);
    const profileCard = document.querySelector(".profile-card");
    if (profileCard) {
      const badge = document.createElement("span");
      badge.innerText = "👁️ Mode Viewer";
      badge.style.cssText = "font-size:12px;background:rgba(234,179,8,0.2);color:#facc15;padding:4px 10px;border-radius:20px;display:inline-block;margin-top:6px;";
      profileCard.appendChild(badge);
    }
  }
}
document.addEventListener("DOMContentLoaded", applyRoleAccess);

// =====================
// AUTH
// =====================
firebase.auth().onAuthStateChanged((user) => {
  if (!user) window.location.href = "login.html";
});

function showSection(id, element) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(id).style.display = 'block';
  document.querySelectorAll('.menu button').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
  if (id === 'statistik') loadStatistik();
}

// =====================
// TEKNISI
// =====================
const teknisiForm = document.getElementById('teknisiForm');
const teknisiTable = document.getElementById('teknisiTable');

teknisiForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await db.collection('teknisi').add({ nama: namaTeknisi.value, pekerjaan: jobTeknisi.value });
  teknisiForm.reset();
  loadTeknisi();
});

async function loadTeknisi() {
  teknisiTable.innerHTML = '';
  const snapshot = await db.collection('teknisi').get();
  snapshot.forEach(doc => {
    const d = doc.data();
    teknisiTable.innerHTML += `
      <tr>
        <td>${d.nama}</td><td>${d.pekerjaan}</td>
        <td><button onclick="hapusTeknisi('${doc.id}')">Hapus</button></td>
      </tr>`;
  });
}

window.hapusTeknisi = async function(id) {
  await db.collection('teknisi').doc(id).delete();
  loadTeknisi();
}

// =====================
// LOGOUT
// =====================
function logout() {
  firebase.auth().signOut().then(() => window.location.href = "login.html");
}

// =====================
// JALUR FTTH
// =====================
const jalurForm = document.getElementById('jalurForm');
const jalurTable = document.getElementById('jalurTable');

jalurForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    namaJalur: namaJalur.value, warnaCore: warnaCore.value,
    odp: odpJalur.value, pot: potJalur.value,
    teknisi: teknisiJalur.value, status: statusJalur.value
  };
  await db.collection('jalur').add(data);
  jalurForm.reset();
  loadJalur();
});

async function loadJalur() {
  jalurTable.innerHTML = '';
  const snapshot = await db.collection('jalur').get();
  let no = 1;
  snapshot.forEach(doc => {
    const d = doc.data();
    let statusClass = d.status === 'Active' ? 'status-active' : d.status === 'Maintenance' ? 'status-maintenance' : 'status-putus';
    jalurTable.innerHTML += `
      <tr>
        <td>${no++}</td><td>${d.namaJalur}</td><td>${d.warnaCore}</td>
        <td>${d.odp}</td><td>${d.pot}</td><td>${d.teknisi}</td>
        <td><span class="${statusClass}">${d.status}</span></td>
        <td>
          <button onclick="editJalur('${doc.id}','${d.namaJalur}','${d.warnaCore}','${d.odp}','${d.pot}','${d.teknisi}','${d.status}')">Edit</button>
          <button onclick="hapusJalur('${doc.id}')">Hapus</button>
        </td>
      </tr>`;
  });
}

async function hapusJalur(id) {
  await db.collection('jalur').doc(id).delete();
  loadJalur();
}

async function editJalur(id, nama, core, odp, pot, teknisi, status) {
  const namaBaru = prompt('Edit Nama Jalur', nama);
  if (!namaBaru) return;
  await db.collection('jalur').doc(id).update({
    namaJalur: namaBaru,
    warnaCore: prompt('Edit Warna Core', core),
    odp: prompt('Edit ODP', odp),
    pot: prompt('Edit POT', pot),
    teknisi: prompt('Edit Teknisi', teknisi),
    status: prompt('Edit Status', status)
  });
  loadJalur();
}

// =====================
// LOAD ALL
// =====================
loadTeknisi();
loadJalur();

// =====================
// ODP WILAYAH
// =====================
const wilayahLabels = {
  tambahrejo:'Tambahrejo', pondok:'Pondok', brumbung:'Brumbung',
  randutelu:'Randutelu', ploso:'Ploso', sembung:'Sembung',
  mangunreja:'Mangunreja', mojopahit:'Mojopahit', pojok:'Pojok',
  bogo:'Bogo', karangtengah:'Karang Tengah', karangmalang:'Karang Malang',
  sempu:'Sempu', nambangan:'Nambangan', gebang:'Gebang',
  kalirejo:'Kalirejo', metok:'Metok', bandang:'Bandang',
  piton:'Piton', tanjungsari:'Tanjungsari'
};

let currentWilayah = null;

function toggleOdpMenu(btn) {
  const submenu = document.getElementById('odpSubmenu');
  submenu.classList.toggle('open');
  btn.classList.toggle('open');
}

function showOdpWilayah(wilayah, element) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById('odp-wilayah').style.display = 'block';
  document.getElementById('odpWilayahTitle').innerText = 'Data ODP - Wilayah ' + wilayahLabels[wilayah];
  document.querySelectorAll('.menu > button').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.odp-toggle').classList.add('active');
  document.querySelectorAll('.odp-submenu button').forEach(btn => btn.classList.remove('active'));
  element.classList.add('active');
  currentWilayah = wilayah;
  loadODPWilayah(wilayah);

  const form = document.getElementById('odpWilayahForm');
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  document.getElementById('odpWilayahForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      odc: document.getElementById('odcOdpW').value,
      nama: document.getElementById('namaOdpW').value,
      kapasitas: parseInt(document.getElementById('kapasitasOdpW').value),
      portSisa: parseInt(document.getElementById('portSisaOdpW').value),
      lat: document.getElementById('latOdpW').value.trim(),
      lng: document.getElementById('lngOdpW').value.trim(),
      wilayah: wilayah
    };
    await db.collection('odp_' + wilayah).add(data);
    document.getElementById('odpWilayahForm').reset();
    loadODPWilayah(wilayah);
  });
}

async function loadODPWilayah(wilayah) {
  const table = document.getElementById('odpWilayahTable');
  table.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8">Memuat data...</td></tr>';
  const snapshot = await db.collection('odp_' + wilayah).get();
  table.innerHTML = '';
  if (snapshot.empty) {
    table.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8">Belum ada data ODP untuk wilayah ini.</td></tr>';
    return;
  }
  snapshot.forEach(doc => {
    const d = doc.data();
    const mapsLink = (d.lat && d.lng)
      ? `<a href="https://www.google.com/maps?q=${d.lat},${d.lng}" target="_blank" style="color:#60a5fa;">📍 Lihat Map</a>`
      : '-';
    table.innerHTML += `
      <tr>
        <td>${d.odc||'-'}</td><td>${d.nama}</td>
        <td>${d.kapasitas||'-'} Port</td><td>${d.portSisa}</td>
        <td>${mapsLink}</td>
        <td><button onclick="hapusODPWilayah('${doc.id}','${wilayah}')">Hapus</button></td>
      </tr>`;
  });
}

window.hapusODPWilayah = async function(id, wilayah) {
  if (!confirm('Yakin hapus data ini?')) return;
  await db.collection('odp_' + wilayah).doc(id).delete();
  loadODPWilayah(wilayah);
}

// =====================
// STATISTIK ODP
// =====================
let allOdpData = [];

async function loadStatistik() {
  const grid = document.getElementById('odpStatGrid');
  grid.innerHTML = '<p style="color:#94a3b8;text-align:center;">Memuat data...</p>';
  allOdpData = [];
  const wilayahKeys = Object.keys(wilayahLabels);
  for (const wilayah of wilayahKeys) {
    const snapshot = await db.collection('odp_' + wilayah).get();
    snapshot.forEach(doc => allOdpData.push({ id: doc.id, wilayah, ...doc.data() }));
  }
  renderStatistik(allOdpData);
}

function filterStatistik() {
  const q = document.getElementById('searchOdp').value.toLowerCase();
  const filtered = allOdpData.filter(o =>
    (o.nama||'').toLowerCase().includes(q) ||
    (o.wilayah||'').toLowerCase().includes(q) ||
    (o.odc||'').toLowerCase().includes(q)
  );
  renderStatistik(filtered);
}

function renderStatistik(data) {
  const grid = document.getElementById('odpStatGrid');
  const cards = document.getElementById('statistikCards');
  const totalPort = data.reduce((a,b) => a+(b.kapasitas||0), 0);
  const totalSisa = data.reduce((a,b) => a+(b.portSisa||0), 0);
  const totalTerpakai = totalPort - totalSisa;
  const totalPenuh = data.filter(o => o.portSisa === 0).length;

  cards.innerHTML = `
    <div class="stat-card" style="border-color:rgba(59,130,246,0.3)">
      <div style="font-size:22px">📦</div>
      <div style="font-size:28px;font-weight:700;color:#3b82f6">${data.length}</div>
      <div style="font-size:12px;color:#94a3b8">Total ODP</div>
    </div>
    <div class="stat-card" style="border-color:rgba(34,197,94,0.3)">
      <div style="font-size:22px">✅</div>
      <div style="font-size:28px;font-weight:700;color:#22c55e">${totalSisa}</div>
      <div style="font-size:12px;color:#94a3b8">Port Tersedia</div>
    </div>
    <div class="stat-card" style="border-color:rgba(249,115,22,0.3)">
      <div style="font-size:22px">🔌</div>
      <div style="font-size:28px;font-weight:700;color:#f97316">${totalTerpakai}</div>
      <div style="font-size:12px;color:#94a3b8">Port Terpakai</div>
    </div>
    <div class="stat-card" style="border-color:rgba(239,68,68,0.3)">
      <div style="font-size:22px">🔴</div>
      <div style="font-size:28px;font-weight:700;color:#ef4444">${totalPenuh}</div>
      <div style="font-size:12px;color:#94a3b8">ODP Penuh</div>
    </div>`;

  if (data.length === 0) {
    grid.innerHTML = '<p style="color:#94a3b8;text-align:center;margin-top:30px">Tidak ada data ODP ditemukan.</p>';
    return;
  }

  grid.innerHTML = data.map(odp => {
    const kapasitas = odp.kapasitas || 8;
    const sisa = odp.portSisa || 0;
    const terpakai = kapasitas - sisa;
    const persen = Math.round((terpakai / kapasitas) * 100);
    let barColor, badgeText, badgeBg, badgeColor;
    if (persen===100){barColor='#ef4444';badgeText='PENUH';badgeBg='rgba(239,68,68,0.15)';badgeColor='#ef4444';}
    else if(persen>=75){barColor='#f97316';badgeText='HAMPIR PENUH';badgeBg='rgba(249,115,22,0.15)';badgeColor='#f97316';}
    else if(persen===0){barColor='#6b7280';badgeText='KOSONG';badgeBg='rgba(107,114,128,0.15)';badgeColor='#9ca3af';}
    else{barColor='#22c55e';badgeText='TERSEDIA';badgeBg='rgba(34,197,94,0.15)';badgeColor='#22c55e';}
    const ports = Array.from({length:kapasitas},(_,i)=>
      `<div style="width:22px;height:22px;border-radius:6px;background:${i<terpakai?barColor:'rgba(255,255,255,0.08)'};font-size:9px;display:flex;align-items:center;justify-content:center;color:${i<terpakai?'white':'#4b5563'};font-weight:600">${i+1}</div>`
    ).join('');
    return `
      <div style="background:rgba(15,23,42,0.9);border:1px solid rgba(255,255,255,0.06);border-radius:18px;padding:18px 20px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
          <div>
            <div style="font-weight:600;font-size:15px">${odp.nama}</div>
            <div style="color:#94a3b8;font-size:12px;margin-top:2px">📍 ${wilayahLabels[odp.wilayah]} | ${odp.odc||'-'}</div>
          </div>
          <span style="background:${badgeBg};color:${badgeColor};font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px">${badgeText}</span>
        </div>
        <div style="background:rgba(255,255,255,0.06);border-radius:999px;height:8px;overflow:hidden;margin-bottom:6px">
          <div style="width:${persen}%;height:100%;background:${barColor};border-radius:999px"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#94a3b8;margin-bottom:12px">
          <span>${persen}% terpakai</span><span>${sisa} port sisa</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px">${ports}</div>
        <div style="display:flex;justify-content:space-around;border-top:1px solid rgba(255,255,255,0.05);padding-top:12px">
          <div style="text-align:center"><div style="font-weight:700;font-size:18px">${kapasitas}</div><div style="color:#94a3b8;font-size:11px">Total Port</div></div>
          <div style="text-align:center"><div style="font-weight:700;font-size:18px;color:#f97316">${terpakai}</div><div style="color:#94a3b8;font-size:11px">Terpakai</div></div>
          <div style="text-align:center"><div style="font-weight:700;font-size:18px;color:#22c55e">${sisa}</div><div style="color:#94a3b8;font-size:11px">Sisa</div></div>
        </div>
      </div>`;
  }).join('');
}

// =====================
// SALAM REALTIME
// =====================
function updateSalam() {
  const jam = new Date().getHours();
  let salam = jam>=5&&jam<12?'🌅 Hai selamat pagi':jam>=12&&jam<15?'☀️ Hai selamat siang':jam>=15&&jam<18?'🌆 Hai selamat sore':'🌙 Hai selamat malam';
  const el = document.querySelector('.profile-card h3');
  if (el) el.innerText = salam;
}
updateSalam();
setInterval(updateSalam, 60000);
