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
const sourceSearchToggle = document.getElementById("sourceSearchToggle");
const sourceSearchDialog = document.getElementById("sourceSearchDialog");
const closeSourceSearch = document.getElementById("closeSourceSearch");
const sourceSearchForm = document.getElementById("sourceSearchForm");
const sourceSearchInput = document.getElementById("sourceSearchInput");
const sourceSearchStatus = document.getElementById("sourceSearchStatus");
const sourceSearchResults = document.getElementById("sourceSearchResults");

const notes = [
  "這份網站版同步成 12 張學術簡報風投影片。整體主軸是：ASCVD 的抗血小板治療不是固定答案，而是在不同臨床情境與時間點，重新平衡缺血風險與出血風險。",
  "這張先建立判斷框架。近期 ACS、PCI、STEMI、複雜病灶與 PAD 會把缺血風險拉高；高齡、貧血、CKD、既往出血、抗凝與手術需求則會把出血風險放大。",
  "這張保留原文 Figure 1。讀圖時重點不是背所有 receptor，而是把 aspirin、P2Y12 抑制劑、GPIIb/IIIa 抑制劑放回血小板活化路徑，理解各自壓住哪個環節。",
  "Central Illustration 是整篇 statement 最適合快速回顧的圖。它提醒我們，primary prevention、ACS、CCD、PAD、stroke/TIA 的治療強度與期間，取決於情境與時間軸。",
  "初級預防的 aspirin 角色已經很窄。可考慮的是 40-70 歲、心血管風險較高、出血風險低的族群；超過 70 歲或高出血風險時，常規使用通常不划算。",
  "PCI 後先記住基準：CCD 加 PCI 通常是 aspirin 加 clopidogrel 6 個月；ACS 加 PCI 通常是 aspirin 加 P2Y12 抑制劑 12 個月，再依缺血與出血風險調整。",
  "縮短 DAPT 或降階並不是少做，而是明確用來降低出血。短 DAPT 後 P2Y12 單用、或 ACS 後從較強 P2Y12 抑制劑轉 clopidogrel，都需要先確認病人不是高缺血風險。",
  "一年後的次級預防越來越個別化。Clopidogrel 單用、延長 DAPT、或 aspirin 加低劑量 rivaroxaban 都可能是選項，但前提是病人的缺血效益足以抵過出血代價。",
  "PAD 的整理重點是短期介入後可較強，長期則回到風險分層。血管內介入後可 DAPT 1-6 個月；症狀性 PAD 長期至少要有單一抗血小板治療。",
  "輕微缺血性中風或高風險 TIA 的 DAPT 是短程策略。可在 12-24 小時內開始 aspirin 加 clopidogrel，通常 21 天後轉為單一抗血小板，避免長期 DAPT。",
  "同時需要抗凝或面臨手術時，出血風險會主導決策。Triple therapy 應縮到最短；非心臟手術前則先看 PCI 後多久，以及 P2Y12 抑制劑需要停幾天。",
  "最後收成四步驟：先定情境，再定時間軸，接著用風險工具輔助判斷，最後定期重新評估。這也是這篇 statement 最實用的臨床閱讀方式。"
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

let sourcePagesPromise;
let sourcePages = [];

const stopWords = new Set([
  "the", "and", "for", "with", "after", "before", "from", "that", "this", "what",
  "when", "where", "which", "should", "about", "patient", "patients", "therapy",
  "treatment", "多久", "如何", "什麼", "是否", "可以", "需要", "使用", "治療"
]);

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s/-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function queryTerms(query) {
  return normalizeText(query)
    .split(" ")
    .map((term) => term.trim())
    .filter((term) => term.length > 1 && !stopWords.has(term));
}

async function loadSourcePages() {
  if (sourcePages.length) return sourcePages;
  if (!sourcePagesPromise) {
    sourceSearchStatus.textContent = "正在讀取原文 PDF，第一次搜尋需要幾秒鐘。";
    sourcePagesPromise = import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs")
      .then(async (pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
        const pdf = await pdfjsLib.getDocument("source.pdf").promise;
        const pages = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          const text = content.items
            .map((item) => item.str)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          pages.push({ page: pageNumber, text, normalized: normalizeText(text) });
        }
        sourcePages = pages;
        return pages;
      });
  }
  return sourcePagesPromise;
}

function countMatches(text, term) {
  if (!term) return 0;
  let count = 0;
  let start = 0;
  while (true) {
    const indexAt = text.indexOf(term, start);
    if (indexAt === -1) break;
    count += 1;
    start = indexAt + term.length;
  }
  return count;
}

function makeSnippet(pageText, terms, query) {
  const lowerText = pageText.toLowerCase();
  const phrase = query.trim().toLowerCase();
  let hitAt = phrase.length > 2 ? lowerText.indexOf(phrase) : -1;
  if (hitAt === -1) {
    hitAt = terms
      .map((term) => lowerText.indexOf(term.toLowerCase()))
      .filter((position) => position >= 0)
      .sort((a, b) => a - b)[0];
  }
  const center = hitAt >= 0 ? hitAt : 0;
  const start = Math.max(0, center - 120);
  const end = Math.min(pageText.length, center + 260);
  let snippet = `${start > 0 ? "..." : ""}${pageText.slice(start, end)}${end < pageText.length ? "..." : ""}`;
  terms.slice(0, 8).forEach((term) => {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    snippet = snippet.replace(new RegExp(`(${escapedTerm})`, "gi"), "\u0000$1\u0001");
  });
  return escapeHtml(snippet)
    .replace(/\u0000/g, "<mark>")
    .replace(/\u0001/g, "</mark>");
}

function searchSource(query) {
  const normalizedQuery = normalizeText(query);
  const terms = queryTerms(query);
  if (!normalizedQuery || !terms.length) return [];

  return sourcePages
    .map((page) => {
      const phraseScore = countMatches(page.normalized, normalizedQuery) * 12;
      const termScore = terms.reduce((sum, term) => sum + countMatches(page.normalized, term), 0);
      const coverageScore = terms.filter((term) => page.normalized.includes(term)).length * 4;
      return {
        page: page.page,
        text: page.text,
        score: phraseScore + termScore + coverageScore
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((result) => ({
      ...result,
      snippet: makeSnippet(result.text, terms, query)
    }));
}

function renderSourceResults(results, query) {
  if (!results.length) {
    sourceSearchResults.innerHTML = `<div class="empty-result">找不到明確符合「${escapeHtml(query)}」的段落。可以改用英文關鍵字，例如 DAPT、bleeding、PCI、clopidogrel、rivaroxaban。</div>`;
    return;
  }
  sourceSearchResults.innerHTML = results.map((result) => `
    <article class="source-result">
      <a href="source.pdf#page=${result.page}" target="_blank" rel="noreferrer">原文第 ${result.page} 頁</a>
      <p>${result.snippet}</p>
    </article>
  `).join("");
}

sourceSearchToggle.addEventListener("click", () => {
  sourceSearchDialog.showModal();
  setTimeout(() => sourceSearchInput.focus(), 0);
});

closeSourceSearch.addEventListener("click", () => sourceSearchDialog.close());

sourceSearchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = sourceSearchInput.value.trim();
  if (!query) {
    sourceSearchInput.focus();
    return;
  }
  sourceSearchResults.innerHTML = "";
  try {
    await loadSourcePages();
    const results = searchSource(query);
    sourceSearchStatus.textContent = `已搜尋原文 ${sourcePages.length} 頁。結果以頁碼與原文片段呈現。`;
    renderSourceResults(results, query);
  } catch (error) {
    sourceSearchStatus.textContent = "目前無法讀取 PDF。請確認網路可連線，或直接開啟原文 PDF 使用瀏覽器搜尋。";
    sourceSearchResults.innerHTML = `<div class="empty-result">PDF 搜尋載入失敗：${escapeHtml(error.message || "unknown error")}</div>`;
  }
});

const initialSlide = Number(new URLSearchParams(window.location.search).get("slide"));
setSlide(Number.isFinite(initialSlide) && initialSlide > 0 ? initialSlide - 1 : 0);
