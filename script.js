// =====================
// SISTEM ROLE ADMIN & VIEWER
// =====================
// Tambahkan kode ini di paling ATAS script.js, sebelum kode lainnya

const userRole = sessionStorage.getItem("userRole") || "viewer";

function applyRoleAccess() {
  if (userRole === "viewer") {
    // Sembunyikan semua form tambah data
    document.querySelectorAll("form").forEach(form => {
      form.style.display = "none";
    });

    // Sembunyikan kolom Aksi di semua tabel (hapus/edit)
    const style = document.createElement("style");
    style.innerHTML = `
      th:last-child, td:last-child { display: none !important; }
    `;
    document.head.appendChild(style);

    // Tampilkan badge viewer di profile card
    const profileCard = document.querySelector(".profile-card");
    if (profileCard) {
      const badge = document.createElement("span");
      badge.innerText = "👁️ Mode Viewer";
      badge.style.cssText = "font-size:12px;background:rgba(234,179,8,0.2);color:#facc15;padding:4px 10px;border-radius:20px;display:inline-block;margin-top:6px;";
      profileCard.appendChild(badge);
    }
  }
}

// Jalankan setelah halaman siap
document.addEventListener("DOMContentLoaded", applyRoleAccess);


firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

function showSection(id, element) {
  document.querySelectorAll('.section').forEach(section => {
    section.style.display = 'none';
  });

  document.getElementById(id).style.display = 'block';

  document.querySelectorAll('.menu button').forEach(btn => {
    btn.classList.remove('active');
  });

  element.classList.add('active');
}

// =====================
// TEKNISI
// =====================

const teknisiForm = document.getElementById('teknisiForm');
const teknisiTable = document.getElementById('teknisiTable');

teknisiForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    nama: namaTeknisi.value,
    pekerjaan: jobTeknisi.value
  };

  await db.collection('teknisi').add(data);
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
        <td>
          <button onclick="hapusTeknisi('${doc.id}')">Hapus</button>
        </td>
      </tr>
    `;
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
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}

// =====================
// DATA JALUR FTTH
// =====================

const jalurForm = document.getElementById('jalurForm');
const jalurTable = document.getElementById('jalurTable');

jalurForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    namaJalur: namaJalur.value,
    warnaCore: warnaCore.value,
    odp: odpJalur.value,
    pot: potJalur.value,
    teknisi: teknisiJalur.value,
    status: statusJalur.value
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

    let statusClass = '';

    if (d.status === 'Active') {
      statusClass = 'status-active';
    } else if (d.status === 'Maintenance') {
      statusClass = 'status-maintenance';
    } else {
      statusClass = 'status-putus';
    }

    jalurTable.innerHTML += `
      <tr>
        <td>${no++}</td>
        <td>${d.namaJalur}</td>
        <td>${d.warnaCore}</td>
        <td>${d.odp}</td>
        <td>${d.pot}</td>
        <td>${d.teknisi}</td>
        <td><span class="${statusClass}">${d.status}</span></td>
        <td>
          <button onclick="editJalur('${doc.id}', '${d.namaJalur}', '${d.warnaCore}', '${d.odp}', '${d.pot}', '${d.teknisi}', '${d.status}')">Edit</button>
          <button onclick="hapusJalur('${doc.id}')">Hapus</button>
        </td>
      </tr>
    `;
  });
}

async function hapusJalur(id) {
  await db.collection('jalur').doc(id).delete();
  loadJalur();
}

async function editJalur(id, nama, core, odp, pot, teknisi, status) {
  const namaBaru = prompt('Edit Nama Jalur', nama);
  const coreBaru = prompt('Edit Warna Core', core);
  const odpBaru = prompt('Edit ODP', odp);
  const potBaru = prompt('Edit POT', pot);
  const teknisiBaru = prompt('Edit Teknisi', teknisi);
  const statusBaru = prompt('Edit Status', status);

  if (!namaBaru) return;

  await db.collection('jalur').doc(id).update({
    namaJalur: namaBaru,
    warnaCore: coreBaru,
    odp: odpBaru,
    pot: potBaru,
    teknisi: teknisiBaru,
    status: statusBaru
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
  tambahrejo: 'Tambahrejo',
  pondok: 'Pondok',
  brumbung: 'Brumbung',
  randutelu: 'Randutelu',
  ploso: 'Ploso',
  sembung: 'Sembung',
  mangunreja: 'Mangunreja',
  mojopahit: 'Mojopahit',
  pojok: 'Pojok',
  bogo: 'Bogo',
  karangtengah: 'Karang Tengah',
  karangmalang: 'Karang Malang',
  sempu: 'Sempu',
  nambangan: 'Nambangan',
  gebang: 'Gebang',
  kalirejo: 'Kalirejo',
  metok: 'Metok',
  bandang: 'Bandang',
  piton: 'Piton',
  tanjungsari: 'Tanjungsari'
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

    const lat = document.getElementById('latOdpW').value.trim();
    const lng = document.getElementById('lngOdpW').value.trim();

    const data = {
      odc: document.getElementById('odcOdpW').value,
      nama: document.getElementById('namaOdpW').value,
      portSisa: document.getElementById('portSisaOdpW').value,
      lat: lat,
      lng: lng,
      wilayah: wilayah
    };

    await db.collection('odp_' + wilayah).add(data);
    document.getElementById('odpWilayahForm').reset();
    loadODPWilayah(wilayah);
  });
}

async function loadODPWilayah(wilayah) {
  const table = document.getElementById('odpWilayahTable');
  table.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8">Memuat data...</td></tr>';

  const snapshot = await db.collection('odp_' + wilayah).get();
  table.innerHTML = '';

  if (snapshot.empty) {
    table.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8">Belum ada data ODP untuk wilayah ini.</td></tr>';
    return;
  }

  snapshot.forEach(doc => {
    const d = doc.data();
    const mapsLink = (d.lat && d.lng)
      ? `<a href="https://www.google.com/maps?q=${d.lat},${d.lng}" target="_blank" style="color:#60a5fa;">📍 Lihat Map</a>`
      : '-';

    table.innerHTML += `
      <tr>
        <td>${d.odc || '-'}</td>
        <td>${d.nama}</td>
        <td>${d.portSisa}</td>
        <td>${mapsLink}</td>
        <td>
          <button onclick="hapusODPWilayah('${doc.id}', '${wilayah}')">Hapus</button>
        </td>
      </tr>
    `;
  });
}

window.hapusODPWilayah = async function(id, wilayah) {
  if (!confirm('Yakin hapus data ini?')) return;
  await db.collection('odp_' + wilayah).doc(id).delete();
  loadODPWilayah(wilayah);
}

// =====================
// SALAM REALTIME
// =====================

function updateSalam() {
  const jam = new Date().getHours();
  let salam = '';

  if (jam >= 5 && jam < 12) {
    salam = '🌅 Hai selamat pagi';
  } else if (jam >= 12 && jam < 15) {
    salam = '☀️ Hai selamat siang';
  } else if (jam >= 15 && jam < 18) {
    salam = '🌆 Hai selamat sore';
  } else {
    salam = '🌙 Hai selamat malam';
  }

  const el = document.querySelector('.profile-card h3');
  if (el) el.innerText = salam;
}

updateSalam();
setInterval(updateSalam, 60000);
