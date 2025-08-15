AOS.init({ once: false, duration: 800, easing: 'ease-out-cubic' });
document.getElementById('y').textContent = new Date().getFullYear();

/* ==========================
         DATA DUMMY (TOKO & MENU)
         ========================== */
const STORES = [
  {
    id: 'cafeteria',
    name: 'Cafetaria',
    eta: 5,
    desc: 'Menu favorit mahasiswa, dari kopi hingga pancake.',
    menus: [
      { id: 'chk', name: 'Chicken Katsu', price: 20000, img: './img/cafetaria_chiken_katsu.jpg', desc: 'Ayam katsu renyah disajikan dengan saus spesial dan sayuran segar.' },
      { id: 'cof', name: 'Coffee', price: 18000, img: './img/cafetaria_cofee.jpg', desc: 'Kopi hangat dengan aroma khas, cocok untuk menemani waktu santai.' },
      { id: 'pnc', name: 'Pancake', price: 16000, img: './img/cafetaria_pancake.jpg', desc: 'Pancake lembut dengan sirup maple manis dan taburan gula halus.' },
    ],
  },
  {
    id: 'wbs',
    name: 'Kantin WBS',
    eta: 8,
    desc: 'Pilihan menu praktis, nikmat, dan terjangkau.',
    menus: [
      { id: 'grg', name: 'Gorengan Campur', price: 2000, img: './img/wbs_gorengan.jpg', desc: 'Aneka gorengan seperti tempe, tahu, dan bakwan, cocok untuk camilan.' },
      { id: 'nsc', name: 'Nasi Campur', price: 10000, img: './img/wbs_nasi_campur.jpg', desc: 'Nasi putih dengan lauk lengkap, sayur, dan sambal khas WBS.' },
      { id: 'nsg', name: 'Nasi Goreng', price: 10000, img: './img/wbs_nasi_gorengan.jpg', desc: 'Nasi goreng dengan bumbu khas, disajikan dengan telur dan kerupuk.' },
    ],
  },
  {
    id: 'lounge',
    name: 'Lounge',
    eta: 6,
    desc: 'Tempat santai dengan minuman segar dan snack ringan.',
    menus: [
      { id: 'bks', name: 'Bakso', price: 10000, img: './img/lounge_bakso.jpg', desc: 'Bakso sapi kenyal dengan kuah gurih dan taburan bawang goreng.' },
      { id: 'mie', name: 'Pop Mie', price: 8000, img: './img/lounge_pop_mie.jpg', desc: 'Mi instan dalam cup, praktis dan lezat untuk mengganjal perut.' },
      { id: 'tpc', name: 'Teh Pucuk', price: 4000, img: './img/lounge_teh_pucuk.jpg', desc: 'Teh manis dalam kemasan botol, segar diminum dingin.' },
    ],
  }
];

/* ==========================
         STATE & HELPERS
         ========================== */
const WA_NUMBER = '6283156416534'; // TODO: ganti!
let selectedStore = null;
let selectedMenu = null;

const rupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function openModal(el) {
  const m = bootstrap.Modal.getOrCreateInstance(el);
  m.show();
}
function closeModal(el, cb) {
  const m = bootstrap.Modal.getInstance(el);
  if (!m) {
    cb?.();
    return;
  }
  el.addEventListener('hidden.bs.modal', function handler() {
    el.removeEventListener('hidden.bs.modal', handler);
    cb?.();
  });
  m.hide();
}

/* ==========================
         RENDER: LIST TOKO
         ========================== */
function renderStores() {
  const wrap = document.getElementById('storeList');
  wrap.innerHTML = '';
  STORES.forEach((s) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center store-item';
    item.innerHTML = `
            <div class="text-start">
              <div class="fw-semibold">${s.name}</div>
              <small class="">${s.desc ?? ''}</small>
            </div>
            <span class="badge  rounded-pill">ETA ${s.eta}'</span>
          `;
    item.addEventListener('click', () => chooseStore(s.id));
    wrap.appendChild(item);
  });
}

/* ==========================
         AKSI: PILIH TOKO → TAMPILKAN MENU
         ========================== */
function chooseStore(storeId) {
  selectedStore = STORES.find((s) => s.id === storeId) || null;
  selectedMenu = null;
  const storeModalEl = document.getElementById('storeModal');
  closeModal(storeModalEl, () => {
    renderMenusForSelectedStore();
    openModal(document.getElementById('menuListModal'));
  });
}

function renderMenusForSelectedStore() {
  const title = document.getElementById('menuListTitle');
  const list = document.getElementById('menuList');
  if (!selectedStore) {
    title.textContent = 'Pilih Menu';
    list.innerHTML = '';
    return;
  }
  title.textContent = `${selectedStore.name} – Pilih Menu`;
  list.innerHTML = '';

  selectedStore.menus.forEach((menu) => {
    const col = document.createElement('div');
    col.className = 'col-6 col-sm-6 col-lg-4';
    col.innerHTML = `
        <div class="menu-pick-card">
    <div class="thumb-wrap">
      <img class="menu-pick-thumb" src="${menu.img}" alt="${menu.name}" />
      <span class="price-chip">${rupiah(menu.price)}</span>
      <span class="thumb-overlay"></span>
    </div>

    <div class="menu-pick-body">
      <div class="item-title">${menu.name}</div>
      <button class="btn btn-glass btn-sm mt-2">Pilih</button>
    </div>
  </div>
          `;
    col.querySelector('button').addEventListener('click', () => chooseMenu(menu.id));
    list.appendChild(col);
  });
}

/* ==========================
         AKSI: PILIH MENU → FORM
         ========================== */
function chooseMenu(menuId) {
  if (!selectedStore) return;
  selectedMenu = selectedStore.menus.find((m) => m.id === menuId) || null;
  const menuListModalEl = document.getElementById('menuListModal');
  closeModal(menuListModalEl, () => {
    fillOrderForm();
    updateOrderTotals();
    openModal(document.getElementById('orderModal'));
  });
}

function fillOrderForm() {
  const storeInput = document.getElementById('orderStore');
  const itemInput = document.getElementById('orderItem');
  const priceInput = document.getElementById('orderPrice');
  const qtyInput = document.getElementById('orderQty');
  const ongkirInput = document.getElementById('postageFees');
  document.getElementById('orderNote').value = '';

  storeInput.value = selectedStore?.name ?? '';
  itemInput.value = selectedMenu?.name ?? '';
  priceInput.value = selectedMenu ? rupiah(selectedMenu.price) : '';
  qtyInput.value = 1;
  ongkirInput.value = rupiah(5000); // Ongkir tetap 5.000

  // Fokus ke nama
  setTimeout(() => document.getElementById('orderName').focus(), 200);
}

/* ==========================
         SUBMIT → KIRIM WA
         ========================== */
document.getElementById('formOrder').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('orderName').value.trim();
  const qty = Math.max(1, parseInt(document.getElementById('orderQty').value || '1', 10));
  const note = document.getElementById('orderNote').value.trim();
  const ongkir = 5000; // Ongkir tetap 5.000
  const adminFee = 3000; // Biaya admin tetap 3.000
  const location = document.getElementById('locationDelivery').value.trim();

  if (!name || !selectedStore || !selectedMenu) {
    alert('Lengkapi data: nama, toko, dan menu.');
    return;
  }

   const subtotal = selectedMenu.price * qty;
  const total = subtotal + ongkir + adminFee;
  const lines = [
    'Halo Nitip.in, saya ingin pesan:',
    `Nama  : ${name}`,
    `Toko  : ${selectedStore.name}`,
    `Menu  : ${selectedMenu.name}`,
    `Qty   : ${qty}`,
    `Lokasi: ${location}`,
    `Harga : ${rupiah(selectedMenu.price)}`,
    `Biaya Admin: ${rupiah(adminFee)}`,
    `Ongkir: ${rupiah(ongkir)}`,
    `Total : ${rupiah(total) }`, 

    note ? `Catatan: ${note}` : null,
    '',
    'Terima kasih.',
  ].filter(Boolean);

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  window.open(url, '_blank');

  // Tutup & reset
  const orderModalEl = document.getElementById('orderModal');
  const modal = bootstrap.Modal.getInstance(orderModalEl);
  modal?.hide();
  e.target.reset();
});

/* ==========================
         WA FLOATING WIDGET (punyamu)
         ========================== */
// (function () {
//   const box = document.getElementById('waBox');
//   const btn = document.getElementById('waToggle');
//   function toggleBox() {
//     box.classList.toggle('show');
//   }
//   btn.addEventListener('click', toggleBox);

//   let opened = sessionStorage.getItem('wa_hint');
//   if (!opened) {
//     setTimeout(() => {
//       box.classList.add('show');
//       sessionStorage.setItem('wa_hint', '1');
//     }, 1600);
//   }

//   document.addEventListener('keydown', (e) => {
//     if (e.key === 'Escape') box.classList.remove('show');
//   });
// })();

function currentUnitPrice() {
  return selectedMenu ? selectedMenu.price : 0;
}

function updateOrderTotals() {
  const qty = Math.max(1, parseInt(document.getElementById('orderQty').value || '1', 10));
  const ongkir = 5000; // Fixed delivery fee
  const subtotal = currentUnitPrice() * qty;
  const adminFee = 3000; // Fixed admin fee
  const total = subtotal + ongkir + adminFee;
  document.getElementById('orderTotal').value = rupiah(total);
}

// jalankan saat qty berubah
document.addEventListener('input', (e) => {
  if (e.target.id === 'orderQty') updateOrderTotals();
});



/* ==========================
         INIT on load
         ========================== */
document.addEventListener('DOMContentLoaded', () => {
  renderStores();
});
