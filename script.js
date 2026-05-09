let data = [];

function renderTable() {
  const table = document.getElementById("dataJaringan");
  table.innerHTML = "";

  data.forEach((item, index) => {
    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.nama}</td>
        <td>${item.ip}</td>
        <td>${item.lokasi}</td>
        <td>
          <button class="delete-btn" onclick="hapusData(${index})">
            Hapus
          </button>
        </td>
      </tr>
    `;
  });
}

function tambahData() {
  const nama = document.getElementById("nama").value;
  const ip = document.getElementById("ip").value;
  const lokasi = document.getElementById("lokasi").value;

  if (nama === "" || ip === "" || lokasi === "") {
    alert("Semua data wajib diisi!");
    return;
  }

  data.push({ nama, ip, lokasi });

  renderTable();

  document.getElementById("nama").value = "";
  document.getElementById("ip").value = "";
  document.getElementById("lokasi").value = "";
}

function hapusData(index) {
  data.splice(index, 1);
  renderTable();
}
