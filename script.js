const slides = Array.from(document.querySelectorAll(".slide"));
const thumbs = Array.from(document.querySelectorAll(".thumb"));
const notesText = document.getElementById("notesText");
const currentNo = document.getElementById("currentNo");
const range = document.getElementById("slideRange");
const prev = document.getElementById("prevSlide");
const next = document.getElementById("nextSlide");
const dialog = document.getElementById("scriptDialog");
const scriptToggle = document.getElementById("scriptToggle");
const closeScript = document.getElementById("closeScript");
const fullScript = document.getElementById("fullScript");

const notes = [
  "這份讀書筆記整理 2026 ACC Scientific Statement。主軸是 ASCVD 抗血小板治療的情境化決策：同一個藥物組合，在不同時間點與不同風險輪廓下，可能從有益變成有害。",
  "先建立判斷框架。抗血小板治療永遠是在缺血風險與出血風險之間取得平衡。風險工具可以幫忙，但文件提醒我們，最後仍要回到病人的整體臨床脈絡。",
  "這張是原文 Figure 1。它把 aspirin、P2Y12 抑制劑、GPIIb/IIIa 抑制劑與 vorapaxar 放回血小板活化路徑中，適合用來記住藥物作用位置。",
  "這張 Central Illustration 是整篇最適合臨床快速回顧的圖。它把 primary prevention、ACS、CCD、PAD、stroke/TIA 放在同一條治療強度軸上。",
  "初級預防的 aspirin 角色已經很窄。可考慮的族群是 40-70 歲、高心血管風險、低出血風險；超過 70 歲不建議常規使用。",
  "PCI 後的預設仍是重要基準：CCD 通常 6 個月 DAPT，ACS 通常 12 個月 DAPT。ACS 接受 PCI 時，prasugrel 或 ticagrelor 通常優先於 clopidogrel。",
  "縮短 DAPT 或從較強 P2Y12 抑制劑降階到 clopidogrel，是降低出血的策略，但要避開高缺血風險或 STEMI 等較不適合過早降強度的情境。",
  "一年後的長期策略越來越個別化。Clopidogrel 單用相較 aspirin 單用有新興資料支持；但延長 DAPT 或加入低劑量 rivaroxaban 都必須嚴格挑選病人。",
  "PAD 的重點是介入後短期較強、長期依風險回歸。症狀性 PAD 要有長期單一抗血小板治療；高風險且出血可接受時，可考慮 aspirin 加低劑量 rivaroxaban。",
  "輕微缺血性中風或高風險 TIA 的 DAPT 是短程治療。重點是早期啟動、21 天後降為單一抗血小板，避免長期 DAPT 造成出血。",
  "病人同時需要抗凝時，抗血栓治療要盡量簡化。Triple therapy 不是長期方案，通常 aspirin 早期停掉，留下 DOAC 加 clopidogrel，再視情況回到 DOAC 單用。",
  "手術前後管理先看 PCI 後多久。文件引用 2024 AHA/ACC perioperative guideline：CCS PCI 後 elective surgery 盡量延後 6 個月，ACS PCI 後延後 12 個月。",
  "治療追蹤包括副作用、出血、服藥規則性、藥物交互作用與 PPI。早期 DAPT 不規則服藥，尤其是 PCI 後，和支架栓塞與 MACE 上升相關。",
  "最後把這篇收成五個臨床句子：aspirin 初級預防縮窄、DAPT 有預設期間但可調整、出血高時考慮縮短或降階、一年後策略更個別化、治療要持續重評估。"
];

let index = 0;

function setSlide(nextIndex) {
  index = Math.max(0, Math.min(slides.length - 1, nextIndex));
  slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  thumbs.forEach((thumb, i) => thumb.classList.toggle("active", i === index));
  notesText.textContent = notes[index];
  currentNo.textContent = String(index + 1).padStart(2, "0");
  range.value = String(index + 1);
  prev.disabled = index === 0;
  next.disabled = index === slides.length - 1;
}

thumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => setSlide(Number(thumb.dataset.slide)));
});

prev.addEventListener("click", () => setSlide(index - 1));
next.addEventListener("click", () => setSlide(index + 1));
range.addEventListener("input", () => setSlide(Number(range.value) - 1));

document.addEventListener("keydown", (event) => {
  if (dialog.open) return;
  if (event.key === "ArrowRight" || event.key === "PageDown") setSlide(index + 1);
  if (event.key === "ArrowLeft" || event.key === "PageUp") setSlide(index - 1);
});

function buildScript() {
  fullScript.innerHTML = slides.map((slide, i) => {
    const title = slide.dataset.title || `第 ${i + 1} 張`;
    return `<section><h3>${String(i + 1).padStart(2, "0")} ${title}</h3><p>${notes[i]}</p></section>`;
  }).join("");
}

scriptToggle.addEventListener("click", () => {
  buildScript();
  dialog.showModal();
});

closeScript.addEventListener("click", () => dialog.close());
setSlide(0);
