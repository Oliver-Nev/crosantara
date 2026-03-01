// --- LOGIC KUIS & COOLDOWN ---
let currentActiveQuestions = [];
const COOLDOWN_HOURS = 48;

function checkAndOpenQuiz() {
	const lastAttempt = localStorage.getItem("crosantara_quiz_last_attempt");
	const modal = document.getElementById("quiz-modal");
	const content = document.getElementById("quiz-content");

	document.getElementById("quiz-form-container").classList.add("hidden");
	document.getElementById("quiz-blocked").classList.add("hidden");
	document.getElementById("quiz-success").classList.add("hidden");
	document.getElementById("quiz-fail").classList.add("hidden");

	modal.classList.remove("hidden");
	setTimeout(() => {
		content.classList.remove("scale-95", "opacity-0");
		content.classList.add("scale-100", "opacity-100");
	}, 10);

	if (lastAttempt) {
		const now = new Date().getTime();
		const diff = now - parseInt(lastAttempt);
		const hoursPassed = diff / (1000 * 60 * 60);

		if (hoursPassed < COOLDOWN_HOURS) {
			showBlockedState(lastAttempt);
			return;
		}
	}

	generateRandomQuestions();
	document.getElementById("quiz-form-container").classList.remove("hidden");
}

function generateRandomQuestions() {
	// Membutuhkan variabel 'questionBank' dari data.js
	if (typeof questionBank === "undefined") return;

	const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
	currentActiveQuestions = shuffled.slice(0, 3);

	const wrapper = document.getElementById("questions-wrapper");
	wrapper.innerHTML = "";

	currentActiveQuestions.forEach((item, index) => {
		const div = document.createElement("div");
		div.className = "pb-6 border-b border-stone-100 last:border-0";
		div.innerHTML = `
            <p class="font-bold text-brand-dark mb-4 text-base font-serif flex gap-2">
                <span class="text-brand-gold">${index + 1}.</span> ${item.q}
            </p>
            <div class="space-y-3">
                ${item.options
									.map(
										(opt) => `
                    <label class="flex items-center gap-4 p-3 border-2 border-transparent bg-stone-50 hover:bg-white hover:border-brand-brown/30 transition cursor-pointer group rounded-lg">
                        <div class="relative flex items-center justify-center w-5 h-5">
                            <input type="radio" name="q${item.id}" value="${opt}" class="peer appearance-none w-5 h-5 border-2 border-stone-300 rounded-full checked:border-brand-brown checked:bg-brand-brown transition" required>
                            <div class="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition"></div>
                        </div>
                        <span class="text-sm text-stone-600 group-hover:text-brand-dark transition font-medium">${opt}</span>
                    </label>
                `,
									)
									.join("")}
            </div>
        `;
		wrapper.appendChild(div);
	});
}

function submitQuiz(e) {
	e.preventDefault();
	const formData = new FormData(e.target);
	let allCorrect = true;
	currentActiveQuestions.forEach((item) => {
		if (formData.get(`q${item.id}`) !== item.a) allCorrect = false;
	});

	document.getElementById("quiz-form-container").classList.add("hidden");
	localStorage.setItem("crosantara_quiz_last_attempt", new Date().getTime().toString());

	if (allCorrect) {
		// LOGIC PENARIKAN VOUCHER DINAMIS
		let ownedVouchers = JSON.parse(localStorage.getItem("crosantara_vouchers") || "[]");

		// Membutuhkan VOUCHER_CODES dari data.js
		let availableCodes = typeof VOUCHER_CODES !== "undefined" ? VOUCHER_CODES.filter((code) => !ownedVouchers.some((v) => v.code === code)) : ["SUPERWIN50"];

		if (availableCodes.length === 0) availableCodes = ["SUPERWIN50"];

		const randomCode = availableCodes[Math.floor(Math.random() * availableCodes.length)];

		ownedVouchers.push({ code: randomCode, used: false });
		localStorage.setItem("crosantara_vouchers", JSON.stringify(ownedVouchers));

		document.getElementById("won-voucher-display").innerText = randomCode;

		document.getElementById("quiz-success").classList.remove("hidden");
		if (typeof confetti === "function") {
			confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ["#D4AF37", "#5D4037", "#ffffff"] });
		}

		// Memanggil fungsi dari cart.js
		if (typeof renderVouchers === "function") renderVouchers();
	} else {
		document.getElementById("quiz-fail").classList.remove("hidden");
	}
}

function showBlockedState(lastTimestamp) {
	document.getElementById("quiz-blocked").classList.remove("hidden");
	const timerEl = document.getElementById("countdown-timer");
	const targetTime = parseInt(lastTimestamp) + COOLDOWN_HOURS * 60 * 60 * 1000;
	const updateTimer = () => {
		const now = new Date().getTime();
		const distance = targetTime - now;
		if (distance < 0) {
			timerEl.innerText = "Sekarang!";
			return;
		}
		const hours = Math.floor(distance / (1000 * 60 * 60));
		const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((distance % (1000 * 60)) / 1000);
		timerEl.innerText = `${hours} Jam ${minutes} Menit ${seconds} Detik`;
	};
	updateTimer();
	if (window.quizTimerInterval) clearInterval(window.quizTimerInterval);
	window.quizTimerInterval = setInterval(updateTimer, 1000);
}

function closeQuiz() {
	const modal = document.getElementById("quiz-modal");
	const content = document.getElementById("quiz-content");
	content.classList.remove("scale-100", "opacity-100");
	content.classList.add("scale-95", "opacity-0");
	setTimeout(() => {
		modal.classList.add("hidden");
		document.getElementById("quiz-form").reset();
	}, 300);
}

function copyCodeFromDisplay() {
	const codeToCopy = document.getElementById("won-voucher-display").innerText;
	navigator.clipboard.writeText(codeToCopy);
	alert("Kode voucher disalin: " + codeToCopy);
}

function closeQuizAndShop() {
	closeQuiz();
	document.getElementById("menu").scrollIntoView();
}
