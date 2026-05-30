firebase.auth().onAuthStateChanged((user)=>{

if(!user){
window.location.href="login.html";
}

});

function showSection(id, element) {

  // sembunyikan semua section
  document.querySelectorAll('.section').forEach(section => {
    section.style.display = 'none';
  });

  // tampilkan section dipilih
  document.getElementById(id).style.display = 'block';

  // hapus active semua tombol
  document.querySelectorAll('.menu button').forEach(btn => {
    btn.classList.remove('active');
  });

  // active tombol diklik
  element.classList.add('active');
}

// =====================
// DATA PELANGGAN
// =====================

const pelangganForm = document.getElementById('pelangganForm');
const pelangganTable = document.getElementById('pelangganTable');

pelangganForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    nama: nama.value,
    alamat: alamat.value,
    paket: paket.value
  };

  await db.collection('pelanggan').add(data);
  pelangganForm.reset();
});

async function loadPelanggan() {
  pelangganTable.innerHTML = '';

  const snapshot = await db.collection('pelanggan').get();

  document.getElementById('totalPelanggan').innerText = snapshot.size;

  snapshot.forEach(doc => {
  const d = doc.data();

  pelangganTable.innerHTML += `
    <tr>
      <td>${d.nama}</td>
      <td>${d.alamat}</td>
      <td>${d.paket}</td>

      <td>
        <button onclick="hapusPelanggan('${doc.id}')">
          Hapus
        </button>
      </td>
    </tr>
  `;
});
}

// =====================
// DATA ODP
// =====================

const odpForm = document.getElementById('odpForm');
const odpTable = document.getElementById('odpTable');

odpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    nama: namaOdp.value,
    core: core.value,
    status: status.value
  };

  await db.collection('odp').add(data);
  odpForm.reset();
});

async function loadODP() {
  odpTable.innerHTML = '';

  const snapshot = await db.collection('odp').get();

  document.getElementById('totalODP').innerText = snapshot.size;

  snapshot.forEach(doc => {
    const d = doc.data();

    odpTable.innerHTML += `
      <tr>
        <td>${d.nama}</td>
        <td>${d.core}</td>
        <td>${d.status}</td>
      </tr>
    `;
  });
}

// =====================
// GANGGUAN
// =====================

const gangguanForm = document.getElementById('gangguanForm');
const gangguanTable = document.getElementById('gangguanTable');

 gangguanForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    lokasi: lokasiGangguan.value,
    jenis: jenisGangguan.value
  };

  await db.collection('gangguan').add(data);
  gangguanForm.reset();
});

async function loadGangguan() {
  gangguanTable.innerHTML = '';

  const snapshot = await db.collection('gangguan').get();

  document.getElementById('totalGangguan').innerText = snapshot.size;

  snapshot.forEach(doc => {
    const d = doc.data();

    gangguanTable.innerHTML += `
      <tr>
        <td>${d.lokasi}</td>
        <td>${d.jenis}</td>
      </tr>
    `;
  });
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
      </tr>
    `;
  });
}

//=====================
// LOGOUT
//=====================
funcion logout()
 firebase.auth().signOut().then(()=>{
  window.location.href= "login.html";
});
}
// =====================
// DATA JALUR FTTH
// =====================

const jalurForm = document.getElementById('jalurForm');
const jalurTable = document.getElementById('jalurTable');

jalurForm.addEventListener('submit', async (e)=>{
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

async function loadJalur(){
  jalurTable.innerHTML='';

  const snapshot = await db.collection('jalur').get();

  let no = 1;

  snapshot.forEach(doc=>{
    const d = doc.data();

    let statusClass = '';

    if(d.status === 'Active'){
      statusClass = 'status-active';
    }else if(d.status === 'Maintenance'){
      statusClass = 'status-maintenance';
    }else{
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
    <button onclick="editJalur('${doc.id}', '${d.namaJalur}', '${d.warnaCore}', '${d.odp}', '${d.pot}', '${d.teknisi}', '${d.status}')">
      Edit
    </button>

    <button onclick="hapusJalur('${doc.id}')">
      Hapus
    </button>
  </td>
</tr>
`;
    });

}

async function hapusJalur(id){

  await db.collection('jalur').doc(id).delete();

  loadJalur();
}

async function editJalur(id, nama, core, odp, pot, teknisi, status){

  const namaBaru = prompt('Edit Nama Jalur', nama);
  const coreBaru = prompt('Edit Warna Core', core);
  const odpBaru = prompt('Edit ODP', odp);
  const potBaru = prompt('Edit POT', pot);
  const teknisiBaru = prompt('Edit Teknisi', teknisi);
  const statusBaru = prompt('Edit Status', status);

  if(!namaBaru) return;

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

loadPelanggan();
loadODP();
loadGangguan();
loadTeknisi();
loadJalur();

window.hapusPelanggan = async function(id) {
  await db.collection('pelanggan').doc(id).delete();
  loadPelanggan();
}
