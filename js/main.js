// --- MOBILE MENU LOGIC ---
function toggleMobileMenu() {
	const menu = document.getElementById("mobile-menu");
	menu.classList.toggle("hidden");
}

// --- TOAST NOTIFICATION ---
function showToast() {
	const toast = document.getElementById("toast");
	toast.classList.remove("translate-y-48");
	setTimeout(() => toast.classList.add("translate-y-48"), 3000);
}

// --- INITIALIZATION SAAT HALAMAN DIMUAT ---
document.addEventListener("DOMContentLoaded", () => {
	// 1. Tampilkan voucher tersimpan
	if (typeof renderVouchers === "function") {
		renderVouchers();
	}

	// 2. Load icons
	if (typeof lucide !== "undefined") {
		lucide.createIcons();
	}

	// 3. Navbar scroll listener
	window.addEventListener("scroll", () => {
		const nav = document.getElementById("navbar");
		if (window.scrollY > 50) {
			nav.classList.add("shadow-md");
			nav.style.top = "0";
		} else {
			nav.classList.remove("shadow-md");
			nav.style.top = "12px";
		}
	});
});
