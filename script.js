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
  if (id === 'peta') loadPeta();
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
        <td>${d.nama}</td>
        <td>${d.pekerjaan}</td>
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
      kapasitas: parseInt(document.getElementById('kapasitasOdpW').value) || 8,
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
        <td>${d.odc||'-'}</td>
        <td>${d.nama}</td>
        <td>${d.kapasitas||'-'} Port</td>
        <td>${d.portSisa}</td>
        <td>${mapsLink}</td>
        <td>
          <button onclick="editODPWilayah('${doc.id}','${wilayah}','${d.odc||''}','${d.nama}','${d.kapasitas||8}','${d.portSisa}','${d.lat||''}','${d.lng||''}')">Edit</button>
          <button onclick="hapusODPWilayah('${doc.id}','${wilayah}')">Hapus</button>
        </td>
      </tr>`;
  });
}

window.editODPWilayah = async function(id, wilayah, odc, nama, kapasitas, portSisa, lat, lng) {
  const odcBaru = prompt('Edit ODC', odc);
  if (odcBaru === null) return;
  const namaBaru = prompt('Edit Nama ODP', nama);
  if (namaBaru === null) return;
  const kapasitasBaru = prompt('Edit Kapasitas Port (4/8/16)', kapasitas);
  if (kapasitasBaru === null) return;
  const portSisaBaru = prompt('Edit Port Sisa', portSisa);
  if (portSisaBaru === null) return;
  const latBaru = prompt('Edit Latitude', lat);
  if (latBaru === null) return;
  const lngBaru = prompt('Edit Longitude', lng);
  if (lngBaru === null) return;

  await db.collection('odp_' + wilayah).doc(id).update({
    odc: odcBaru,
    nama: namaBaru,
    kapasitas: parseInt(kapasitasBaru),
    portSisa: parseInt(portSisaBaru),
    lat: latBaru,
    lng: lngBaru
  });
  loadODPWilayah(wilayah);
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
// PETA ODP 3D - MAPBOX
// =====================

let petaMap = null;
let modeGambarGaris = false;
let titikGarisSementara = null;
let garisSource = null;
let odpMarkers = [];

const MAPBOX_TOKEN = 'pk.eyJ1IjoiemFreWFjaG1hZCIsImEiOiJjbXB2dnRmdTMwMzRiMnJvanRnM2JqZjM1In0.M3lIZVBMvmh-xuVvfsjncQ';

async function loadPeta() {
  if (petaMap) {
    petaMap.resize();
    await refreshPetaData();
    return;
  }

  mapboxgl.accessToken = MAPBOX_TOKEN;

  petaMap = new mapboxgl.Map({
    container: 'mapOdp',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [110.4, -7.0],
    zoom: 14,
    pitch: 55,       // Kemiringan 3D
    bearing: -20,    // Rotasi
    antialias: true
  });

  // Kontrol navigasi (zoom, rotate, tilt)
  petaMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

  // Kontrol fullscreen
  petaMap.addControl(new mapboxgl.FullscreenControl(), 'top-right');

  petaMap.on('load', async () => {
    // Tambah layer bangunan 3D
    petaMap.addLayer({
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 15,
      paint: {
        'fill-extrusion-color': '#0a2a1a',
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': ['get', 'min_height'],
        'fill-extrusion-opacity': 0.7
      }
    });

    // Source untuk garis jalur
    petaMap.addSource('garis-jalur', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });

    petaMap.addLayer({
      id: 'garis-jalur-layer',
      type: 'line',
      source: 'garis-jalur',
      paint: {
        'line-color': ['get', 'warna'],
        'line-width': 3,
        'line-opacity': 0.9
      }
    });

    // Klik garis jalur
    petaMap.on('click', 'garis-jalur-layer', (e) => {
      const props = e.features[0].properties;
      new mapboxgl.Popup({ className: 'odp-popup' })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="background:#0a1628;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;font-family:'Poppins',sans-serif;color:white;min-width:160px;">
            <div style="font-weight:700;font-size:13px;color:${props.warna};margin-bottom:10px">〰️ ${props.nama}</div>
            <button onclick="hapusGaris('${props.id}')" style="width:100%;background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);color:#ff6666;padding:6px;border-radius:6px;cursor:pointer;font-size:11px;">🗑️ Hapus Garis</button>
          </div>
        `)
        .addTo(petaMap);
    });

    petaMap.on('mouseenter', 'garis-jalur-layer', () => petaMap.getCanvas().style.cursor = 'pointer');
    petaMap.on('mouseleave', 'garis-jalur-layer', () => petaMap.getCanvas().style.cursor = '');

    // Klik peta untuk tambah ODP / garis
    petaMap.on('click', (e) => {
      // Cek apakah klik di garis (sudah dihandle di atas)
      const features = petaMap.queryRenderedFeatures(e.point, { layers: ['garis-jalur-layer'] });
      if (features.length > 0) return;

      if (modeGambarGaris) {
        handleKlikGaris(e.lngLat);
      } else {
        tampilFormTambahODP(e.lngLat);
      }
    });

    await refreshPetaData();
  });

  setTimeout(() => petaMap.resize(), 300);
}

async function refreshPetaData() {
  await loadMarkersFromFirebase();
  await loadGarisFromFirebase();
}

// =====================
// TAMBAH ODP DARI PETA
// =====================
function tampilFormTambahODP(lnglat) {
  const formHtml = `
    <div style="background:#0a1628;border:1px solid rgba(0,255,136,0.3);border-radius:10px;padding:16px;min-width:220px;font-family:'Poppins',sans-serif;color:white;">
      <div style="font-weight:700;font-size:13px;color:#00ff88;margin-bottom:12px">📍 Tambah ODP</div>
      <input id="popupOdc" type="text" placeholder="ODC" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
      <input id="popupNama" type="text" placeholder="Nama ODP" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
      <select id="popupWilayah" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
        <option value="">Pilih Wilayah</option>
        ${Object.entries(wilayahLabels).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}
      </select>
      <select id="popupKapasitas" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
        <option value="">Kapasitas Port</option>
        <option value="4">4 Port</option>
        <option value="8">8 Port</option>
        <option value="16">16 Port</option>
      </select>
      <input id="popupPortSisa" type="number" placeholder="Port Sisa" min="0" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:12px;font-size:12px;box-sizing:border-box;outline:none;">
      <div style="display:flex;gap:8px;">
        <button onclick="simpanODPDariPeta(${lnglat.lng},${lnglat.lat})" style="flex:1;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.4);color:#00ff88;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">SIMPAN</button>
        <button onclick="document.querySelector('.mapboxgl-popup').remove()" style="flex:1;background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);color:#ff6666;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;">BATAL</button>
      </div>
    </div>`;

  new mapboxgl.Popup({ className: 'odp-popup', maxWidth: '280px' })
    .setLngLat(lnglat)
    .setHTML(formHtml)
    .addTo(petaMap);
}

window.simpanODPDariPeta = async function(lng, lat) {
  const odc = document.getElementById('popupOdc').value;
  const nama = document.getElementById('popupNama').value;
  const wilayah = document.getElementById('popupWilayah').value;
  const kapasitas = parseInt(document.getElementById('popupKapasitas').value) || 8;
  const portSisa = parseInt(document.getElementById('popupPortSisa').value) || 0;
  if (!nama || !wilayah) { alert('Nama ODP dan Wilayah wajib diisi!'); return; }
  await db.collection('odp_' + wilayah).add({ odc, nama, wilayah, kapasitas, portSisa, lat: lat.toString(), lng: lng.toString() });
  document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
  await loadMarkersFromFirebase();
}

// =====================
// LOAD MARKERS
// =====================
async function loadMarkersFromFirebase() {
  odpMarkers.forEach(m => m.remove());
  odpMarkers = [];
  const bounds = new mapboxgl.LngLatBounds();
  let hasData = false;

  for (const wilayah of Object.keys(wilayahLabels)) {
    const snapshot = await db.collection('odp_' + wilayah).get();
    snapshot.forEach(doc => {
      const d = doc.data();
      if (!d.lat || !d.lng) return;
      const lat = parseFloat(d.lat), lng = parseFloat(d.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const kapasitas = d.kapasitas || 8;
      const portSisa = d.portSisa || 0;
      const terpakai = kapasitas - portSisa;
      const persen = Math.round((terpakai / kapasitas) * 100);

      let warna = persen===100?'#ef4444':persen>=75?'#f97316':persen===0?'#6b7280':'#22c55e';
      let status = persen===100?'PENUH':persen>=75?'HAMPIR PENUH':persen===0?'KOSONG':'TERSEDIA';

      // Custom marker element
      const el = document.createElement('div');
      el.style.cssText = `
        width: 16px; height: 16px;
        background: ${warna};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 12px ${warna}, 0 0 24px ${warna}80;
        cursor: pointer;
        transition: transform 0.2s;
      `;
      el.onmouseover = () => el.style.transform = 'scale(1.4)';
      el.onmouseout = () => el.style.transform = 'scale(1)';

      const popup = new mapboxgl.Popup({ className: 'odp-popup', offset: 12, maxWidth: '260px' })
        .setHTML(`
          <div style="background:#0a1628;border:1px solid ${warna}60;border-radius:10px;padding:14px;font-family:'Poppins',sans-serif;color:white;min-width:200px;">
            <div style="font-weight:700;font-size:14px;color:${warna};margin-bottom:4px">${d.nama}</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:10px">📍 Wilayah ${wilayahLabels[wilayah]}</div>
            <div style="display:flex;justify-content:space-around;margin-bottom:8px">
              <div style="text-align:center"><div style="font-size:20px;font-weight:700">${kapasitas}</div><div style="font-size:10px;color:#94a3b8">Total</div></div>
              <div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#f97316">${terpakai}</div><div style="font-size:10px;color:#94a3b8">Terpakai</div></div>
              <div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#22c55e">${portSisa}</div><div style="font-size:10px;color:#94a3b8">Sisa</div></div>
            </div>
            <div style="background:rgba(255,255,255,0.1);border-radius:999px;height:6px;overflow:hidden;margin-bottom:8px">
              <div style="width:${persen}%;height:100%;background:${warna};border-radius:999px"></div>
            </div>
            <div style="background:${warna}20;color:${warna};font-size:11px;font-weight:700;text-align:center;padding:4px;border-radius:6px;border:1px solid ${warna}40;margin-bottom:8px">${status} · ${persen}%</div>
            <button onclick="hapusODPDariPeta('${doc.id}','${wilayah}')" style="width:100%;background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);color:#ff6666;padding:6px;border-radius:6px;cursor:pointer;font-size:11px;">🗑️ Hapus ODP</button>
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(petaMap);

      odpMarkers.push(marker);
      bounds.extend([lng, lat]);
      hasData = true;
    });
  }

  if (hasData) {
    petaMap.fitBounds(bounds, { padding: 60, pitch: 55, duration: 1500 });
  }
}

window.hapusODPDariPeta = async function(id, wilayah) {
  if (!confirm('Yakin hapus ODP ini?')) return;
  await db.collection('odp_' + wilayah).doc(id).delete();
  document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
  await loadMarkersFromFirebase();
}

// =====================
// GARIS JALUR
// =====================
function toggleModeGaris() {
  modeGambarGaris = !modeGambarGaris;
  const btn = document.getElementById('btnModeGaris');
  if (modeGambarGaris) {
    btn.style.background = 'rgba(0,255,136,0.2)';
    btn.style.borderColor = 'rgba(0,255,136,0.6)';
    btn.style.color = '#00ff88';
    btn.innerText = '✏️ Mode Garis: ON — Klik 2 titik';
    petaMap.getCanvas().style.cursor = 'crosshair';
    titikGarisSementara = null;
  } else {
    btn.style.background = 'rgba(255,255,255,0.05)';
    btn.style.borderColor = 'rgba(255,255,255,0.15)';
    btn.style.color = '#94a3b8';
    btn.innerText = '〰️ Gambar Garis Jalur';
    petaMap.getCanvas().style.cursor = '';
    titikGarisSementara = null;
  }
}

function handleKlikGaris(lnglat) {
  if (!titikGarisSementara) {
    titikGarisSementara = lnglat;

    // Marker titik awal sementara
    const el = document.createElement('div');
    el.style.cssText = 'width:12px;height:12px;background:#00ff88;border:2px solid white;border-radius:50%;box-shadow:0 0 10px #00ff88;';
    el.id = 'titikAwalTemp';
    new mapboxgl.Marker(el).setLngLat(lnglat).addTo(petaMap);

  } else {
    const titikAkhir = lnglat;
    const titikAwal = titikGarisSementara;

    // Hapus marker sementara
    document.getElementById('titikAwalTemp')?.parentElement?.remove();

    const formHtml = `
      <div style="background:#0a1628;border:1px solid rgba(0,255,136,0.3);border-radius:10px;padding:16px;min-width:220px;font-family:'Poppins',sans-serif;color:white;">
        <div style="font-weight:700;font-size:13px;color:#00ff88;margin-bottom:12px">〰️ Simpan Garis Jalur</div>
        <input id="namaGaris" type="text" placeholder="Nama Jalur" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
        <select id="warnaGaris" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:12px;font-size:12px;box-sizing:border-box;outline:none;">
          <option value="#00ff88">Hijau</option>
          <option value="#3b82f6">Biru</option>
          <option value="#f97316">Orange</option>
          <option value="#ef4444">Merah</option>
          <option value="#facc15">Kuning</option>
          <option value="#ffffff">Putih</option>
        </select>
        <div style="display:flex;gap:8px;">
          <button onclick="simpanGaris(${titikAwal.lng},${titikAwal.lat},${titikAkhir.lng},${titikAkhir.lat})" style="flex:1;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.4);color:#00ff88;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">SIMPAN</button>
          <button onclick="batalGaris()" style="flex:1;background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);color:#ff6666;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;">BATAL</button>
        </div>
      </div>`;

    new mapboxgl.Popup({ className: 'odp-popup', maxWidth: '280px' })
      .setLngLat(titikAkhir)
      .setHTML(formHtml)
      .addTo(petaMap);

    titikGarisSementara = null;
  }
}

window.simpanGaris = async function(lng1, lat1, lng2, lat2) {
  const nama = document.getElementById('namaGaris').value || 'Jalur Baru';
  const warna = document.getElementById('warnaGaris').value;
  await db.collection('garis_jalur').add({ nama, warna, lat1:lat1.toString(), lng1:lng1.toString(), lat2:lat2.toString(), lng2:lng2.toString() });
  document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
  modeGambarGaris = false;
  const btn = document.getElementById('btnModeGaris');
  if (btn) { btn.style.background='rgba(255,255,255,0.05)';btn.style.borderColor='rgba(255,255,255,0.15)';btn.style.color='#94a3b8';btn.innerText='〰️ Gambar Garis Jalur';petaMap.getCanvas().style.cursor=''; }
  await loadGarisFromFirebase();
}

window.batalGaris = function() {
  document.getElementById('titikAwalTemp')?.parentElement?.remove();
  titikGarisSementara = null;
  document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
}

async function loadGarisFromFirebase() {
  const snapshot = await db.collection('garis_jalur').get();
  const features = [];
  snapshot.forEach(doc => {
    const d = doc.data();
    const lat1=parseFloat(d.lat1),lng1=parseFloat(d.lng1),lat2=parseFloat(d.lat2),lng2=parseFloat(d.lng2);
    if (isNaN(lat1)||isNaN(lng1)||isNaN(lat2)||isNaN(lng2)) return;
    features.push({
      type: 'Feature',
      properties: { id: doc.id, nama: d.nama, warna: d.warna||'#00ff88' },
      geometry: { type: 'LineString', coordinates: [[lng1,lat1],[lng2,lat2]] }
    });
  });

  if (petaMap.getSource('garis-jalur')) {
    petaMap.getSource('garis-jalur').setData({ type: 'FeatureCollection', features });
  }
}

window.hapusGaris = async function(id) {
  if (!confirm('Yakin hapus garis ini?')) return;
  await db.collection('garis_jalur').doc(id).delete();
  document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
  await loadGarisFromFirebase();
}
// =====================
// PETA ODP 3D - MAPBOX
// =====================

let petaMap = null;
let modeGambarGaris = false;
let titikGarisSementara = null;
let garisSource = null;
let odpMarkers = [];

const MAPBOX_TOKEN = 'pk.eyJ1IjoiemFreWFjaG1hZCIsImEiOiJjbXB2dnRmdTMwMzRiMnJvanRnM2JqZjM1In0.M3lIZVBMvmh-xuVvfsjncQ';

async function loadPeta() {
  if (petaMap) {
    petaMap.resize();
    await refreshPetaData();
    return;
  }

  mapboxgl.accessToken = MAPBOX_TOKEN;

  petaMap = new mapboxgl.Map({
    container: 'mapOdp',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [110.4, -7.0],
    zoom: 14,
    pitch: 55,       // Kemiringan 3D
    bearing: -20,    // Rotasi
    antialias: true
  });

  // Kontrol navigasi (zoom, rotate, tilt)
  petaMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

  // Kontrol fullscreen
  petaMap.addControl(new mapboxgl.FullscreenControl(), 'top-right');

  petaMap.on('load', async () => {
    // Tambah layer bangunan 3D
    petaMap.addLayer({
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 15,
      paint: {
        'fill-extrusion-color': '#0a2a1a',
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': ['get', 'min_height'],
        'fill-extrusion-opacity': 0.7
      }
    });

    // Source untuk garis jalur
    petaMap.addSource('garis-jalur', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });

    petaMap.addLayer({
      id: 'garis-jalur-layer',
      type: 'line',
      source: 'garis-jalur',
      paint: {
        'line-color': ['get', 'warna'],
        'line-width': 3,
        'line-opacity': 0.9
      }
    });

    // Klik garis jalur
    petaMap.on('click', 'garis-jalur-layer', (e) => {
      const props = e.features[0].properties;
      new mapboxgl.Popup({ className: 'odp-popup' })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="background:#0a1628;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;font-family:'Poppins',sans-serif;color:white;min-width:160px;">
            <div style="font-weight:700;font-size:13px;color:${props.warna};margin-bottom:10px">〰️ ${props.nama}</div>
            <button onclick="hapusGaris('${props.id}')" style="width:100%;background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);color:#ff6666;padding:6px;border-radius:6px;cursor:pointer;font-size:11px;">🗑️ Hapus Garis</button>
          </div>
        `)
        .addTo(petaMap);
    });

    petaMap.on('mouseenter', 'garis-jalur-layer', () => petaMap.getCanvas().style.cursor = 'pointer');
    petaMap.on('mouseleave', 'garis-jalur-layer', () => petaMap.getCanvas().style.cursor = '');

    // Klik peta untuk tambah ODP / garis
    petaMap.on('click', (e) => {
      // Cek apakah klik di garis (sudah dihandle di atas)
      const features = petaMap.queryRenderedFeatures(e.point, { layers: ['garis-jalur-layer'] });
      if (features.length > 0) return;

      if (modeGambarGaris) {
        handleKlikGaris(e.lngLat);
      } else {
        tampilFormTambahODP(e.lngLat);
      }
    });

    await refreshPetaData();
  });

  setTimeout(() => petaMap.resize(), 300);
}

async function refreshPetaData() {
  await loadMarkersFromFirebase();
  await loadGarisFromFirebase();
}

// =====================
// TAMBAH ODP DARI PETA
// =====================
function tampilFormTambahODP(lnglat) {
  const formHtml = `
    <div style="background:#0a1628;border:1px solid rgba(0,255,136,0.3);border-radius:10px;padding:16px;min-width:220px;font-family:'Poppins',sans-serif;color:white;">
      <div style="font-weight:700;font-size:13px;color:#00ff88;margin-bottom:12px">📍 Tambah ODP</div>
      <input id="popupOdc" type="text" placeholder="ODC" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
      <input id="popupNama" type="text" placeholder="Nama ODP" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
      <select id="popupWilayah" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
        <option value="">Pilih Wilayah</option>
        ${Object.entries(wilayahLabels).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}
      </select>
      <select id="popupKapasitas" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
        <option value="">Kapasitas Port</option>
        <option value="4">4 Port</option>
        <option value="8">8 Port</option>
        <option value="16">16 Port</option>
      </select>
      <input id="popupPortSisa" type="number" placeholder="Port Sisa" min="0" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:12px;font-size:12px;box-sizing:border-box;outline:none;">
      <div style="display:flex;gap:8px;">
        <button onclick="simpanODPDariPeta(${lnglat.lng},${lnglat.lat})" style="flex:1;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.4);color:#00ff88;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">SIMPAN</button>
        <button onclick="document.querySelector('.mapboxgl-popup').remove()" style="flex:1;background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);color:#ff6666;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;">BATAL</button>
      </div>
    </div>`;

  new mapboxgl.Popup({ className: 'odp-popup', maxWidth: '280px' })
    .setLngLat(lnglat)
    .setHTML(formHtml)
    .addTo(petaMap);
}

window.simpanODPDariPeta = async function(lng, lat) {
  const odc = document.getElementById('popupOdc').value;
  const nama = document.getElementById('popupNama').value;
  const wilayah = document.getElementById('popupWilayah').value;
  const kapasitas = parseInt(document.getElementById('popupKapasitas').value) || 8;
  const portSisa = parseInt(document.getElementById('popupPortSisa').value) || 0;
  if (!nama || !wilayah) { alert('Nama ODP dan Wilayah wajib diisi!'); return; }
  await db.collection('odp_' + wilayah).add({ odc, nama, wilayah, kapasitas, portSisa, lat: lat.toString(), lng: lng.toString() });
  document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
  await loadMarkersFromFirebase();
}

// =====================
// LOAD MARKERS
// =====================
async function loadMarkersFromFirebase() {
  odpMarkers.forEach(m => m.remove());
  odpMarkers = [];
  const bounds = new mapboxgl.LngLatBounds();
  let hasData = false;

  for (const wilayah of Object.keys(wilayahLabels)) {
    const snapshot = await db.collection('odp_' + wilayah).get();
    snapshot.forEach(doc => {
      const d = doc.data();
      if (!d.lat || !d.lng) return;
      const lat = parseFloat(d.lat), lng = parseFloat(d.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const kapasitas = d.kapasitas || 8;
      const portSisa = d.portSisa || 0;
      const terpakai = kapasitas - portSisa;
      const persen = Math.round((terpakai / kapasitas) * 100);

      let warna = persen===100?'#ef4444':persen>=75?'#f97316':persen===0?'#6b7280':'#22c55e';
      let status = persen===100?'PENUH':persen>=75?'HAMPIR PENUH':persen===0?'KOSONG':'TERSEDIA';

      // Custom marker element
      const el = document.createElement('div');
      el.style.cssText = `
        width: 16px; height: 16px;
        background: ${warna};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 12px ${warna}, 0 0 24px ${warna}80;
        cursor: pointer;
        transition: transform 0.2s;
      `;
      el.onmouseover = () => el.style.transform = 'scale(1.4)';
      el.onmouseout = () => el.style.transform = 'scale(1)';

      const popup = new mapboxgl.Popup({ className: 'odp-popup', offset: 12, maxWidth: '260px' })
        .setHTML(`
          <div style="background:#0a1628;border:1px solid ${warna}60;border-radius:10px;padding:14px;font-family:'Poppins',sans-serif;color:white;min-width:200px;">
            <div style="font-weight:700;font-size:14px;color:${warna};margin-bottom:4px">${d.nama}</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:10px">📍 Wilayah ${wilayahLabels[wilayah]}</div>
            <div style="display:flex;justify-content:space-around;margin-bottom:8px">
              <div style="text-align:center"><div style="font-size:20px;font-weight:700">${kapasitas}</div><div style="font-size:10px;color:#94a3b8">Total</div></div>
              <div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#f97316">${terpakai}</div><div style="font-size:10px;color:#94a3b8">Terpakai</div></div>
              <div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#22c55e">${portSisa}</div><div style="font-size:10px;color:#94a3b8">Sisa</div></div>
            </div>
            <div style="background:rgba(255,255,255,0.1);border-radius:999px;height:6px;overflow:hidden;margin-bottom:8px">
              <div style="width:${persen}%;height:100%;background:${warna};border-radius:999px"></div>
            </div>
            <div style="background:${warna}20;color:${warna};font-size:11px;font-weight:700;text-align:center;padding:4px;border-radius:6px;border:1px solid ${warna}40;margin-bottom:8px">${status} · ${persen}%</div>
            <button onclick="hapusODPDariPeta('${doc.id}','${wilayah}')" style="width:100%;background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);color:#ff6666;padding:6px;border-radius:6px;cursor:pointer;font-size:11px;">🗑️ Hapus ODP</button>
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(petaMap);

      odpMarkers.push(marker);
      bounds.extend([lng, lat]);
      hasData = true;
    });
  }

  if (hasData) {
    petaMap.fitBounds(bounds, { padding: 60, pitch: 55, duration: 1500 });
  }
}

window.hapusODPDariPeta = async function(id, wilayah) {
  if (!confirm('Yakin hapus ODP ini?')) return;
  await db.collection('odp_' + wilayah).doc(id).delete();
  document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
  await loadMarkersFromFirebase();
}

// =====================
// GARIS JALUR
// =====================
function toggleModeGaris() {
  modeGambarGaris = !modeGambarGaris;
  const btn = document.getElementById('btnModeGaris');
  if (modeGambarGaris) {
    btn.style.background = 'rgba(0,255,136,0.2)';
    btn.style.borderColor = 'rgba(0,255,136,0.6)';
    btn.style.color = '#00ff88';
    btn.innerText = '✏️ Mode Garis: ON — Klik 2 titik';
    petaMap.getCanvas().style.cursor = 'crosshair';
    titikGarisSementara = null;
  } else {
    btn.style.background = 'rgba(255,255,255,0.05)';
    btn.style.borderColor = 'rgba(255,255,255,0.15)';
    btn.style.color = '#94a3b8';
    btn.innerText = '〰️ Gambar Garis Jalur';
    petaMap.getCanvas().style.cursor = '';
    titikGarisSementara = null;
  }
}

function handleKlikGaris(lnglat) {
  if (!titikGarisSementara) {
    titikGarisSementara = lnglat;

    // Marker titik awal sementara
    const el = document.createElement('div');
    el.style.cssText = 'width:12px;height:12px;background:#00ff88;border:2px solid white;border-radius:50%;box-shadow:0 0 10px #00ff88;';
    el.id = 'titikAwalTemp';
    new mapboxgl.Marker(el).setLngLat(lnglat).addTo(petaMap);

  } else {
    const titikAkhir = lnglat;
    const titikAwal = titikGarisSementara;

    // Hapus marker sementara
    document.getElementById('titikAwalTemp')?.parentElement?.remove();

    const formHtml = `
      <div style="background:#0a1628;border:1px solid rgba(0,255,136,0.3);border-radius:10px;padding:16px;min-width:220px;font-family:'Poppins',sans-serif;color:white;">
        <div style="font-weight:700;font-size:13px;color:#00ff88;margin-bottom:12px">〰️ Simpan Garis Jalur</div>
        <input id="namaGaris" type="text" placeholder="Nama Jalur" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
        <select id="warnaGaris" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:12px;font-size:12px;box-sizing:border-box;outline:none;">
          <option value="#00ff88">Hijau</option>
          <option value="#3b82f6">Biru</option>
          <option value="#f97316">Orange</option>
          <option value="#ef4444">Merah</option>
          <option value="#facc15">Kuning</option>
          <option value="#ffffff">Putih</option>
        </select>
        <div style="display:flex;gap:8px;">
          <button onclick="simpanGaris(${titikAwal.lng},${titikAwal.lat},${titikAkhir.lng},${titikAkhir.lat})" style="flex:1;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.4);color:#00ff88;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">SIMPAN</button>
          <button onclick="batalGaris()" style="flex:1;background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);color:#ff6666;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;">BATAL</button>
        </div>
      </div>`;

    new mapboxgl.Popup({ className: 'odp-popup', maxWidth: '280px' })
      .setLngLat(titikAkhir)
      .setHTML(formHtml)
      .addTo(petaMap);

    titikGarisSementara = null;
  }
}

window.simpanGaris = async function(lng1, lat1, lng2, lat2) {
  const nama = document.getElementById('namaGaris').value || 'Jalur Baru';
  const warna = document.getElementById('warnaGaris').value;
  await db.collection('garis_jalur').add({ nama, warna, lat1:lat1.toString(), lng1:lng1.toString(), lat2:lat2.toString(), lng2:lng2.toString() });
  document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
  modeGambarGaris = false;
  const btn = document.getElementById('btnModeGaris');
  if (btn) { btn.style.background='rgba(255,255,255,0.05)';btn.style.borderColor='rgba(255,255,255,0.15)';btn.style.color='#94a3b8';btn.innerText='〰️ Gambar Garis Jalur';petaMap.getCanvas().style.cursor=''; }
  await loadGarisFromFirebase();
}

window.batalGaris = function() {
  document.getElementById('titikAwalTemp')?.parentElement?.remove();
  titikGarisSementara = null;
  document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
}

async function loadGarisFromFirebase() {
  const snapshot = await db.collection('garis_jalur').get();
  const features = [];
  snapshot.forEach(doc => {
    const d = doc.data();
    const lat1=parseFloat(d.lat1),lng1=parseFloat(d.lng1),lat2=parseFloat(d.lat2),lng2=parseFloat(d.lng2);
    if (isNaN(lat1)||isNaN(lng1)||isNaN(lat2)||isNaN(lng2)) return;
    features.push({
      type: 'Feature',
      properties: { id: doc.id, nama: d.nama, warna: d.warna||'#00ff88' },
      geometry: { type: 'LineString', coordinates: [[lng1,lat1],[lng2,lat2]] }
    });
  });

  if (petaMap.getSource('garis-jalur')) {
    petaMap.getSource('garis-jalur').setData({ type: 'FeatureCollection', features });
  }
}

window.hapusGaris = async function(id) {
  if (!confirm('Yakin hapus garis ini?')) return;
  await db.collection('garis_jalur').doc(id).delete();
  document.querySelectorAll('.mapboxgl-popup').forEach(p => p.remove());
  await loadGarisFromFirebase();
}


function tampilFormTambahODP(latlng) {
  const formHtml = `
    <div style="background:#0a1628;border:1px solid rgba(0,255,136,0.3);border-radius:10px;padding:16px;min-width:220px;font-family:'Poppins',sans-serif;color:white;">
      <div style="font-weight:700;font-size:13px;color:#00ff88;margin-bottom:12px">📍 Tambah ODP</div>
      <input id="popupOdc" type="text" placeholder="ODC" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
      <input id="popupNama" type="text" placeholder="Nama ODP" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
      <select id="popupWilayah" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
        <option value="">Pilih Wilayah</option>
        ${Object.entries(wilayahLabels).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}
      </select>
      <select id="popupKapasitas" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
        <option value="">Kapasitas Port</option>
        <option value="4">4 Port</option>
        <option value="8">8 Port</option>
        <option value="16">16 Port</option>
      </select>
      <input id="popupPortSisa" type="number" placeholder="Port Sisa" min="0" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:12px;font-size:12px;box-sizing:border-box;outline:none;">
      <div style="display:flex;gap:8px;">
        <button onclick="simpanODPDariPeta(${latlng.lat},${latlng.lng})" style="flex:1;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.4);color:#00ff88;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">SIMPAN</button>
        <button onclick="petaMap.closePopup()" style="flex:1;background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);color:#ff6666;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;">BATAL</button>
      </div>
    </div>`;

  L.popup({ className: 'odp-popup', maxWidth: 260 }).setLatLng(latlng).setContent(formHtml).openOn(petaMap);
}

window.simpanODPDariPeta = async function(lat, lng) {
  const odc = document.getElementById('popupOdc').value;
  const nama = document.getElementById('popupNama').value;
  const wilayah = document.getElementById('popupWilayah').value;
  const kapasitas = parseInt(document.getElementById('popupKapasitas').value);
  const portSisa = parseInt(document.getElementById('popupPortSisa').value);
  if (!nama || !wilayah) { alert('Nama ODP dan Wilayah wajib diisi!'); return; }
  await db.collection('odp_' + wilayah).add({ odc, nama, wilayah, kapasitas: kapasitas||8, portSisa: portSisa||0, lat: lat.toString(), lng: lng.toString() });
  petaMap.closePopup();
  await loadMarkersFromFirebase();
}

async function loadMarkersFromFirebase() {
  petaMarkers.forEach(m => petaMap.removeLayer(m));
  petaMarkers = [];
  const bounds = [];

  for (const wilayah of Object.keys(wilayahLabels)) {
    const snapshot = await db.collection('odp_' + wilayah).get();
    snapshot.forEach(doc => {
      const d = doc.data();
      if (!d.lat || !d.lng) return;
      const lat = parseFloat(d.lat), lng = parseFloat(d.lng);
      if (isNaN(lat)||isNaN(lng)) return;
      const kapasitas = d.kapasitas||8, portSisa = d.portSisa||0;
      const terpakai = kapasitas - portSisa;
      const persen = Math.round((terpakai/kapasitas)*100);
      let warna = persen===100?'#ef4444':persen>=75?'#f97316':persen===0?'#6b7280':'#22c55e';
      let status = persen===100?'PENUH':persen>=75?'HAMPIR PENUH':persen===0?'KOSONG':'TERSEDIA';

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;background:${warna};border:2px solid white;border-radius:50%;box-shadow:0 0 10px ${warna};cursor:pointer;"></div>`,
        iconSize: [14,14], iconAnchor: [7,7], popupAnchor: [0,-10]
      });

      const marker = L.marker([lat,lng], { icon });
      marker.bindPopup(`
        <div style="background:#0a1628;border:1px solid ${warna}60;border-radius:10px;padding:14px;min-width:200px;font-family:'Poppins',sans-serif;color:white;">
          <div style="font-weight:700;font-size:14px;color:${warna};margin-bottom:4px">${d.nama}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:10px">📍 Wilayah ${wilayahLabels[wilayah]}</div>
          <div style="display:flex;justify-content:space-around;margin-bottom:8px">
            <div style="text-align:center"><div style="font-size:20px;font-weight:700">${kapasitas}</div><div style="font-size:10px;color:#94a3b8">Total</div></div>
            <div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#f97316">${terpakai}</div><div style="font-size:10px;color:#94a3b8">Terpakai</div></div>
            <div style="text-align:center"><div style="font-size:20px;font-weight:700;color:#22c55e">${portSisa}</div><div style="font-size:10px;color:#94a3b8">Sisa</div></div>
          </div>
          <div style="background:rgba(255,255,255,0.1);border-radius:999px;height:6px;overflow:hidden;margin-bottom:8px">
            <div style="width:${persen}%;height:100%;background:${warna};border-radius:999px"></div>
          </div>
          <div style="background:${warna}20;color:${warna};font-size:11px;font-weight:700;text-align:center;padding:4px;border-radius:6px;border:1px solid ${warna}40;margin-bottom:8px">${status} · ${persen}%</div>
          <button onclick="hapusODPDariPeta('${doc.id}','${wilayah}')" style="width:100%;background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);color:#ff6666;padding:6px;border-radius:6px;cursor:pointer;font-size:11px;">🗑️ Hapus ODP</button>
        </div>
      `, { className: 'odp-popup', maxWidth: 240 });

      marker.addTo(petaMap);
      petaMarkers.push(marker);
      bounds.push([lat,lng]);
    });
  }
  if (bounds.length > 0) petaMap.fitBounds(bounds, { padding: [40,40] });
}

window.hapusODPDariPeta = async function(id, wilayah) {
  if (!confirm('Yakin hapus ODP ini?')) return;
  await db.collection('odp_' + wilayah).doc(id).delete();
  petaMap.closePopup();
  await loadMarkersFromFirebase();
}

function toggleModeGaris() {
  modeGambarGaris = !modeGambarGaris;
  const btn = document.getElementById('btnModeGaris');
  if (modeGambarGaris) {
    btn.style.background = 'rgba(0,255,136,0.2)';
    btn.style.borderColor = 'rgba(0,255,136,0.6)';
    btn.style.color = '#00ff88';
    btn.innerText = '✏️ Mode Garis: ON — Klik 2 titik';
    petaMap.getContainer().style.cursor = 'crosshair';
    titikGarisSementara = null;
  } else {
    btn.style.background = 'rgba(255,255,255,0.05)';
    btn.style.borderColor = 'rgba(255,255,255,0.15)';
    btn.style.color = '#94a3b8';
    btn.innerText = '〰️ Gambar Garis Jalur';
    petaMap.getContainer().style.cursor = '';
    if (garisSementara) { petaMap.removeLayer(garisSementara); garisSementara = null; }
    titikGarisSementara = null;
  }
}

function handleKlikGaris(latlng) {
  if (!titikGarisSementara) {
    titikGarisSementara = latlng;
    if (garisSementara) petaMap.removeLayer(garisSementara);
    garisSementara = L.circleMarker(latlng, { radius:6, color:'#00ff88', fillColor:'#00ff88', fillOpacity:1 }).addTo(petaMap);
  } else {
    const titikAkhir = latlng;
    const titikAwal = titikGarisSementara;
    if (garisSementara) petaMap.removeLayer(garisSementara);
    garisSementara = L.polyline([titikAwal, titikAkhir], { color:'#00ff88', weight:2, opacity:0.6, dashArray:'6,4' }).addTo(petaMap);

    const formHtml = `
      <div style="background:#0a1628;border:1px solid rgba(0,255,136,0.3);border-radius:10px;padding:16px;min-width:220px;font-family:'Poppins',sans-serif;color:white;">
        <div style="font-weight:700;font-size:13px;color:#00ff88;margin-bottom:12px">〰️ Simpan Garis Jalur</div>
        <input id="namaGaris" type="text" placeholder="Nama Jalur (contoh: Jalur-A)" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:8px;font-size:12px;box-sizing:border-box;outline:none;">
        <select id="warnaGaris" style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);color:white;padding:8px 10px;border-radius:6px;margin-bottom:12px;font-size:12px;box-sizing:border-box;outline:none;">
          <option value="#00ff88">Hijau</option>
          <option value="#3b82f6">Biru</option>
          <option value="#f97316">Orange</option>
          <option value="#ef4444">Merah</option>
          <option value="#facc15">Kuning</option>
          <option value="#ffffff">Putih</option>
        </select>
        <div style="display:flex;gap:8px;">
          <button onclick="simpanGaris(${titikAwal.lat},${titikAwal.lng},${titikAkhir.lat},${titikAkhir.lng})" style="flex:1;background:rgba(0,255,136,0.1);border:1px solid rgba(0,255,136,0.4);color:#00ff88;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;">SIMPAN</button>
          <button onclick="batalGaris()" style="flex:1;background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);color:#ff6666;padding:8px;border-radius:6px;cursor:pointer;font-size:12px;">BATAL</button>
        </div>
      </div>`;

    L.popup({ className:'odp-popup', maxWidth:260 }).setLatLng(titikAkhir).setContent(formHtml).openOn(petaMap);
    titikGarisSementara = null;
  }
}

window.simpanGaris = async function(lat1, lng1, lat2, lng2) {
  const nama = document.getElementById('namaGaris').value || 'Jalur Baru';
  const warna = document.getElementById('warnaGaris').value;
  await db.collection('garis_jalur').add({ nama, warna, lat1:lat1.toString(), lng1:lng1.toString(), lat2:lat2.toString(), lng2:lng2.toString() });
  if (garisSementara) { petaMap.removeLayer(garisSementara); garisSementara = null; }
  petaMap.closePopup();
  modeGambarGaris = false;
  const btn = document.getElementById('btnModeGaris');
  if (btn) { btn.style.background='rgba(255,255,255,0.05)';btn.style.borderColor='rgba(255,255,255,0.15)';btn.style.color='#94a3b8';btn.innerText='〰️ Gambar Garis Jalur';petaMap.getContainer().style.cursor=''; }
  await loadGarisFromFirebase();
}

window.batalGaris = function() {
  if (garisSementara) { petaMap.removeLayer(garisSementara); garisSementara = null; }
  titikGarisSementara = null;
  petaMap.closePopup();
}

async function loadGarisFromFirebase() {
  petaGaris.forEach(g => petaMap.removeLayer(g));
  petaGaris = [];
  const snapshot = await db.collection('garis_jalur').get();
  snapshot.forEach(doc => {
    const d = doc.data();
    const lat1=parseFloat(d.lat1),lng1=parseFloat(d.lng1),lat2=parseFloat(d.lat2),lng2=parseFloat(d.lng2);
    if (isNaN(lat1)||isNaN(lng1)||isNaN(lat2)||isNaN(lng2)) return;
    const garis = L.polyline([[lat1,lng1],[lat2,lng2]], { color:d.warna||'#00ff88', weight:3, opacity:0.85 });
    garis.bindPopup(`
      <div style="background:#0a1628;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px;font-family:'Poppins',sans-serif;color:white;min-width:160px;">
        <div style="font-weight:700;font-size:13px;color:${d.warna||'#00ff88'};margin-bottom:10px">〰️ ${d.nama}</div>
        <button onclick="hapusGaris('${doc.id}')" style="width:100%;background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);color:#ff6666;padding:6px;border-radius:6px;cursor:pointer;font-size:11px;">🗑️ Hapus Garis</button>
      </div>
    `, { className:'odp-popup' });
    garis.addTo(petaMap);
    petaGaris.push(garis);
  });
}

window.hapusGaris = async function(id) {
  if (!confirm('Yakin hapus garis ini?')) return;
  await db.collection('garis_jalur').doc(id).delete();
  petaMap.closePopup();
  await loadGarisFromFirebase();
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
