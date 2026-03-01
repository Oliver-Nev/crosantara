// --- CART & SYSTEM ---
let cart = [];
let isDiscountApplied = false;
let appliedVoucherCode = null; // Menyimpan kode mana yang sedang aktif di cart

// --- DOMPET VOUCHER ---
function renderVouchers() {
	const wallet = document.getElementById("voucher-wallet");
	const list = document.getElementById("voucher-list");
	if (!wallet || !list) return;

	let ownedVouchers = JSON.parse(localStorage.getItem("crosantara_vouchers") || "[]");
	let activeVouchers = ownedVouchers.filter((v) => !v.used);

	if (activeVouchers.length > 0) {
		wallet.classList.remove("hidden");
		list.innerHTML = activeVouchers
			.map(
				(v) => `
            <div onclick="copySpecificCode('${v.code}')" class="relative group cursor-pointer flex items-center gap-2 bg-brand-cream border border-brand-gold/40 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md hover:border-brand-brown transition">
                <i data-lucide="ticket" class="w-4 h-4 text-brand-gold"></i>
                <span class="font-mono font-bold text-brand-dark text-sm">${v.code}</span>
                <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-brand-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">Klik untuk Salin</div>
            </div>
        `,
			)
			.join("");
		if (typeof lucide !== "undefined") lucide.createIcons();
	} else {
		wallet.classList.add("hidden");
	}

	updateCartReminder();
}

function copySpecificCode(code) {
	navigator.clipboard.writeText(code);
	alert("Kode voucher disalin: " + code);

	// Auto isi ke keranjang jika keranjang tidak tersembunyi
	const discountInput = document.getElementById("discount-code");
	if (discountInput) {
		discountInput.value = code;
	}
}

function updateCartReminder() {
	const reminderBox = document.getElementById("cart-voucher-reminder");
	const vouchersContainer = document.getElementById("cart-available-vouchers");
	if (!reminderBox || !vouchersContainer) return;

	let ownedVouchers = JSON.parse(localStorage.getItem("crosantara_vouchers") || "[]");
	let activeVouchers = ownedVouchers.filter((v) => !v.used);

	if (activeVouchers.length > 0 && !isDiscountApplied) {
		reminderBox.classList.remove("hidden");
		vouchersContainer.innerHTML = activeVouchers
			.map(
				(v) =>
					`<button onclick="autoFillVoucher('${v.code}')" class="bg-white border border-brand-brown/30 px-3 py-1.5 rounded shadow-sm text-xs font-bold font-mono text-brand-brown hover:bg-brand-brown hover:text-white transition">Pakai: ${v.code}</button>`,
			)
			.join("");
	} else {
		reminderBox.classList.add("hidden");
	}
}

function autoFillVoucher(code) {
	document.getElementById("discount-code").value = code;
	applyDiscount();
}

function addToCart(name, price, image) {
	const existingItem = cart.find((item) => item.name === name && item.price === price);
	if (existingItem) {
		existingItem.qty++;
	} else {
		cart.push({ name, price, image, qty: 1 });
	}
	updateCartUI();
	if (typeof showToast === "function") showToast();
}

function removeFromCart(name) {
	cart = cart.filter((item) => item.name !== name);
	if (cart.length === 0) resetDiscount();
	updateCartUI();
}

function applyDiscount() {
	const codeInput = document.getElementById("discount-code").value.toUpperCase().trim();
	const msgEl = document.getElementById("discount-msg");

	// Mengambil database voucher milik user
	let ownedVouchers = JSON.parse(localStorage.getItem("crosantara_vouchers") || "[]");
	const voucher = ownedVouchers.find((v) => v.code === codeInput);

	msgEl.classList.remove("hidden");

	if (voucher && !voucher.used) {
		isDiscountApplied = true;
		appliedVoucherCode = codeInput;
		msgEl.innerHTML = `<i data-lucide="check-circle" class="w-3 h-3"></i> Kode valid! Diskon 50% aktif.`;
		msgEl.className = "text-xs mt-2 text-klepon-green font-bold flex items-center gap-1";
		if (typeof confetti === "function") {
			confetti({ particleCount: 40, spread: 50, origin: { x: 0.9, y: 0.8 }, colors: ["#D4AF37"] });
		}
	} else if (voucher && voucher.used) {
		isDiscountApplied = false;
		appliedVoucherCode = null;
		msgEl.innerHTML = `<i data-lucide="alert-circle" class="w-3 h-3"></i> Kode sudah pernah digunakan / kedaluwarsa.`;
		msgEl.className = "text-xs mt-2 text-rica-red flex items-center gap-1";
	} else {
		isDiscountApplied = false;
		appliedVoucherCode = null;
		msgEl.innerHTML = `<i data-lucide="alert-circle" class="w-3 h-3"></i> Kode tidak valid atau belum didapatkan.`;
		msgEl.className = "text-xs mt-2 text-rica-red flex items-center gap-1";
	}

	if (typeof lucide !== "undefined") lucide.createIcons();
	updateCartUI();
	updateCartReminder(); // Perbarui reminder jika diskon sukses diterapkan
}

function resetDiscount() {
	isDiscountApplied = false;
	appliedVoucherCode = null;
	document.getElementById("discount-code").value = "";
	document.getElementById("discount-msg").classList.add("hidden");
	updateCartReminder();
}

function updateCartUI() {
	const badge = document.getElementById("cart-badge");
	const mobileBadge = document.getElementById("mobile-cart-badge");
	const bottomBar = document.getElementById("bottom-cart-bar");

	const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

	if (totalQty > 0) {
		badge.innerText = totalQty;
		badge.classList.remove("hidden");
		mobileBadge.innerText = totalQty;
		mobileBadge.classList.remove("hidden");
		bottomBar.classList.remove("hidden");
		setTimeout(() => bottomBar.classList.remove("translate-y-full"), 10);
	} else {
		badge.classList.add("hidden");
		mobileBadge.classList.add("hidden");
		bottomBar.classList.add("translate-y-full");
		setTimeout(() => bottomBar.classList.add("hidden"), 300);
	}

	const cartList = document.getElementById("cart-items");
	if (cart.length === 0) {
		cartList.innerHTML = `<div class="text-center py-20 opacity-50"><i data-lucide="shopping-basket" class="w-12 h-12 mx-auto mb-2 text-stone-400"></i><p class="text-stone-500 text-sm font-serif italic">Keranjang kosong.</p></div>`;
	} else {
		cartList.innerHTML = cart
			.map(
				(item) => `
            <div class="flex gap-4 items-center bg-white p-3 border border-stone-100 shadow-sm relative group">
                <img src="${item.image}" class="w-16 h-16 object-cover border border-stone-200" alt="${item.name}">
                <div class="flex-1">
                    <h4 class="font-bold text-brand-dark text-sm font-serif tracking-wide">${item.name}</h4>
                    <div class="flex justify-between items-center mt-2">
                        <p class="text-xs text-stone-500 font-medium">Rp ${item.price.toLocaleString("id-ID")} x ${item.qty}</p>
                        <p class="text-xs font-bold text-brand-brown">Rp ${(item.price * item.qty).toLocaleString("id-ID")}</p>
                    </div>
                </div>
                <button onclick="removeFromCart('${item.name}')" class="absolute -top-2 -right-2 bg-stone-200 hover:bg-rica-red hover:text-white text-stone-500 rounded-full p-1 opacity-100 transition shadow-md"><i data-lucide="x" class="w-3 h-3"></i></button>
            </div>
        `,
			)
			.join("");
	}
	if (typeof lucide !== "undefined") lucide.createIcons();

	const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
	const discount = isDiscountApplied ? subtotal * 0.5 : 0;
	const total = subtotal - discount;

	document.getElementById("cart-subtotal").innerText = "Rp " + subtotal.toLocaleString("id-ID");
	const discRow = document.getElementById("discount-row");
	if (isDiscountApplied && subtotal > 0) {
		discRow.classList.remove("hidden");
		document.getElementById("discount-amount").innerText = "-Rp " + discount.toLocaleString("id-ID");
	} else {
		discRow.classList.add("hidden");
	}

	const totalFormatted = "Rp " + total.toLocaleString("id-ID");
	document.getElementById("cart-total").innerText = totalFormatted;
	document.getElementById("bottom-bar-total").innerText = totalFormatted;
	document.getElementById("bottom-bar-count").innerText = `${totalQty} Item`;
}

function checkout() {
	if (cart.length === 0) return;
	let message = "Salam Crosantara! Saya ingin memesan:\n\n";
	cart.forEach((item) => (message += `• ${item.name} (${item.qty}x) = Rp ${(item.price * item.qty).toLocaleString("id-ID")}\n`));

	const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

	if (isDiscountApplied && appliedVoucherCode) {
		message += `\nSubtotal: Rp ${subtotal.toLocaleString("id-ID")}`;
		message += `\nDiskon 50% (${appliedVoucherCode}): -Rp ${(subtotal * 0.5).toLocaleString("id-ID")}`;
		message += `\n*Total Bayar: Rp ${(subtotal * 0.5).toLocaleString("id-ID")}*`;

		// TANDAI VOUCHER SEBAGAI "SUDAH DIPAKAI" SETELAH CHECKOUT
		let ownedVouchers = JSON.parse(localStorage.getItem("crosantara_vouchers") || "[]");
		let vIndex = ownedVouchers.findIndex((v) => v.code === appliedVoucherCode);
		if (vIndex > -1) {
			ownedVouchers[vIndex].used = true;
			localStorage.setItem("crosantara_vouchers", JSON.stringify(ownedVouchers));
		}
	} else {
		message += `\n*Total Bayar: Rp ${subtotal.toLocaleString("id-ID")}*`;
	}

	// Buka WhatsApp
	window.open(`https://wa.me/6281222667836?text=${encodeURIComponent(message)}`, "_blank");

	// Reset state cart dan discount setelah sukses redirect ke WA
	cart = [];
	resetDiscount();
	updateCartUI();
	toggleCart(); // Tutup panel
	renderVouchers(); // Refresh dompet UI (menghilangkan yang terpakai)
}

function toggleCart() {
	const sidebar = document.getElementById("cart-sidebar");
	const panel = document.getElementById("cart-panel");
	if (sidebar.classList.contains("hidden")) {
		sidebar.classList.remove("hidden");
		setTimeout(() => panel.classList.remove("translate-x-full"), 10);
		updateCartReminder(); // Cek voucher pas keranjang dibuka
	} else {
		panel.classList.add("translate-x-full");
		setTimeout(() => sidebar.classList.add("hidden"), 300);
	}
}
