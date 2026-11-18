/* Qur'on O'rgan — asosiy ilova mantig'i */
(function () {
"use strict";

// ---------- Yordamchi funksiyalar ----------
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad3 = n => String(n).padStart(3, "0");
const NATIVE = typeof window.Native !== "undefined";
let toastT = null;
const toast = m => { if (NATIVE) { Native.toast(m); return; }
  let el = document.getElementById("wtoast"); if (!el) { el = document.createElement("div"); el.id = "wtoast"; document.body.appendChild(el); }
  el.textContent = m; el.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("on"), 3200); };
let FRAMED = false; try { FRAMED = window.self !== window.top; } catch (e) { FRAMED = true; }
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const arDigits = n => String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

const DEF = {
  theme: "light", ar: 30, tr: 16, script: "lat", tr_key: "uzbek_sadiq", showTr: true,
  wbw: true, translit: false, wbwLang: "uz", wbwFallback: "ru",
  reciter: "Alafasy_128kbps", repeat: 1, autoscroll: true, tajweed: true, mushaf: "madina", arOnly: false, goal: 10, remOn: false, remTime: "20:00"
};
const S = Object.assign({}, DEF, store.get("settings", {}));
const save = () => store.set("settings", S);
// O'zbekcha so'zma-so'z lug'ati: inglizcha ma'no -> o'zbekcha (uzdict.js)
const uzOf = en => (window.UZD && en) ? UZD[en] : undefined;
// Lotin -> Kirill (o'zbek). Faqat o'zbekcha so'zma-so'z ma'nolariga qo'llanadi
const L2C = [["yo'","йў"],["yo‘","йў"],["sh","ш"],["ch","ч"],["o'","ў"],["g'","ғ"],["o‘","ў"],["g‘","ғ"],["yo","ё"],["yu","ю"],["ya","я"],["ye","е"],
  ["a","а"],["b","б"],["d","д"],["e","е"],["f","ф"],["g","г"],["h","ҳ"],["i","и"],["j","ж"],["k","к"],["l","л"],["m","м"],["n","н"],["o","о"],["p","п"],["q","қ"],["r","р"],["s","с"],["t","т"],["u","у"],["v","в"],["x","х"],["y","й"],["z","з"],["'","ъ"],["’","ъ"]];
function lat2cyr(t) {
  let o = "", i = 0; const src = String(t || "");
  while (i < src.length) {
    let hit = false;
    for (const [l, c] of L2C) {
      const seg = src.substr(i, l.length);
      if (seg.toLowerCase() === l) {
        const prev = i > 0 ? src[i - 1] : " ";
        let r = c;
        if (l === "e" && !/[a-zA-Z'‘’]/.test(prev)) r = "э";
        if (seg[0] !== seg[0].toLowerCase()) r = r.toUpperCase();
        o += r; i += l.length; hit = true; break;
      }
    }
    if (!hit) { o += src[i]; i++; }
  }
  return o;
}
let UZVALS = null;
function uzShow(t) {
  if (S.script !== "cyr" || !t) return t;
  if (!UZVALS) UZVALS = new Set(Object.values(window.UZD || {}));
  return UZVALS.has(t) ? lat2cyr(t) : t;
}
function uzCoverage(s) { let a = 0, b = 0; (QDATA[s - 1] || []).forEach(r => r[2].split("|").forEach(e => { b++; if (uzOf(e)) a++; })); return b ? a / b : 0; }

// Kirill -> Lotin (o'zbek alifbosi)
const CL = { "а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"yo","ж":"j","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"x","ц":"ts","ч":"ch","ш":"sh","щ":"sh","ъ":"’","ь":"","ы":"i","э":"e","ю":"yu","я":"ya","ў":"o‘","қ":"q","ғ":"g‘","ҳ":"h" };
const VOW = "аеёиоуэюяўАЕЁИОУЭЮЯЎъьЪЬ";
function cyr2lat(t) {
  if (!t || S.script === "cyr") return t || "";
  let o = "";
  for (let i = 0; i < t.length; i++) {
    const c = t[i], lc = c.toLowerCase();
    if (!(lc in CL)) { o += c; continue; }
    let r = CL[lc];
    if (lc === "е") {
      const p = i > 0 ? t[i - 1] : " ";
      if (i === 0 || !/[Ѐ-ӿ]/.test(p) || VOW.includes(p)) r = "ye";
    }
    if (c !== lc && r) {
      const n = t[i + 1];
      r = (n && n !== n.toLowerCase()) ? r.toUpperCase() : r[0].toUpperCase() + r.slice(1);
    }
    o += r;
  }
  return o;
}

// ---------- Tarmoq (Native orqali — CORS cheklovisiz va keshlanadi) ----------
let cbSeq = 0; const cbs = {};
window.__nativeCb = (id, ok, body) => { const p = cbs[id]; if (!p) return; delete cbs[id]; ok ? p.res(body) : p.rej(new Error(body)); };
function nget(url, preferCache) {
  if (NATIVE) return new Promise((res, rej) => { const id = "c" + (++cbSeq); cbs[id] = { res, rej }; Native.fetch(url, id, !!preferCache); });
  return fetch(url).then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); });
}
const jget = (u, pc) => nget(u, pc).then(t => JSON.parse(t));

const memo = {};
function getVerses(s, lang) {
  const k = "v" + s + lang;
  if (memo[k]) return memo[k];
  const base = `https://api.quran.com/api/v4/verses/by_chapter/${s}?language=${lang}&word_translation_language=${lang}&words=true&word_fields=text_uthmani&fields=text_uthmani,text_uthmani_tajweed&per_page=50&page=`;
  const p = jget(base + 1, true).then(first => {
    const total = (first.pagination && first.pagination.total_pages) || 1;
    const rest = [];
    for (let i = 2; i <= total; i++) rest.push(jget(base + i, true));
    return Promise.all(rest).then(r => [first].concat(r).reduce((a, x) => a.concat(x.verses || []), []));
  });
  memo[k] = p; p.catch(() => delete memo[k]);
  return p;
}
const TRB_LOAD = {};
function loadTRB(key) {
  if (window.TRB && TRB[key]) return Promise.resolve(TRB[key]);
  if (TRB_LOAD[key]) return TRB_LOAD[key];
  return TRB_LOAD[key] = new Promise((res, rej) => { const sc = document.createElement("script"); sc.src = "tr_" + key + ".js";
    sc.onload = () => (window.TRB && TRB[key]) ? res(TRB[key]) : rej(new Error("no data")); sc.onerror = () => { delete TRB_LOAD[key]; rej(new Error("load")); }; document.head.appendChild(sc); });
}
const BUNDLED_TR = ["uzbek_sadiq", "uzbek_mansour", "uzbek_rwwad"];
function getEnc(key, s) {
  const k = "e" + key + s;
  if (memo[k]) return memo[k];
  if (!NATIVE && BUNDLED_TR.includes(key)) {
    const pb = loadTRB(key).then(all => { const m = {}; (all[s - 1] || []).forEach((t, i) => { m[i + 1] = { aya: i + 1, translation: t }; }); return m; });
    memo[k] = pb; pb.catch(() => delete memo[k]); return pb;
  }
  const p = jget(`https://quranenc.com/api/v1/translation/sura/${key}/${s}`, true).then(j => {
    const m = {};
    (j.result || []).forEach(r => { m[+r.aya] = r; });
    return m;
  });
  memo[k] = p; p.catch(() => delete memo[k]);
  return p;
}

// Tarjimani asosiy matn va izohga ajratish
function splitEnc(key, r) {
  if (!r) return { main: "", note: "" };
  let t = String(r.translation || "").trim().replace(/^\d+\.\s*/, "");
  let note = "";
  if (key === "uzbek_mokhtasar") { return { main: t, note: t + (r.footnotes ? "\n\n" + r.footnotes : "") }; }
  let m = t.split(/\n?\s*И\s*з\s*о\s*ҳ\s*\.?\s*/);
  if (m.length > 1) { t = m[0].trim(); note = m.slice(1).join("\n").trim(); }
  else {
    const mm = t.match(/^([\s\S]*?)\n\s*\(([\s\S]*)\)\s*$/);
    if (mm) { t = mm[1].trim(); note = mm[2].trim(); }
  }
  if (r.footnotes) note = (note ? note + "\n\n" : "") + String(r.footnotes).trim();
  return { main: t, note };
}

// ---------- Ko'rinishlar boshqaruvi ----------
const view = $("#view");
let tab = "quran";
let stack = [];
function setTitle(t, back, action, action2) {
  $("#title").textContent = t;
  $("#backBtn").classList.toggle("hidden", !back);
  [[$("#topAction"), action], [$("#topAction2"), action2]].forEach(([a, ac]) => {
    if (ac) { a.innerHTML = ac.icon; a.onclick = ac.fn; a.classList.remove("hidden"); a.classList.toggle("on", !!ac.on); }
    else a.classList.add("hidden");
  });
}
function push(fn, args) {
  if (stack.length) stack[stack.length - 1].scroll = view.scrollTop;
  stack.push({ fn, args: args || [] });
  render(0);
}
function render(scroll) {
  const top = stack[stack.length - 1];
  view.innerHTML = "";
  top.fn.apply(null, top.args);
  view.scrollTop = scroll || 0;
}
function pop() {
  if (stack.length <= 1) return false;
  stack.pop();
  render(stack[stack.length - 1].scroll || 0);
  return true;
}
function goTab(t) {
  tab = t;
  $$("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === t));
  stack = [];
  push({ quran: vHome, learn: vLearn, vocab: vVocab, saved: vSaved, settings: vSettings }[t]);
}
$("#backBtn").onclick = () => pop();
$$("#tabs button").forEach(b => b.onclick = () => goTab(b.dataset.tab));
window.appBack = function () {
  if (!$("#sheet").classList.contains("hidden")) { closeSheet(); return true; }
  if (pop()) return true;
  if (tab !== "quran") { goTab("quran"); return true; }
  return false;
};

function openSheet(html, onMount) {
  $("#sheetBody").innerHTML = html;
  $("#sheet").classList.remove("hidden");
  $(".sheet-box").scrollTop = 0;
  if (onMount) onMount($("#sheetBody"));
}
function closeSheet() { $("#sheet").classList.add("hidden"); $$(".w.sel").forEach(x => x.classList.remove("sel")); }
$(".sheet-bg").onclick = closeSheet;

function applyTheme() {
  document.body.classList.remove("dark", "sepia", "ms-madina", "ms-oldmadina", "ms-indopak", "ms-amiri");
  document.body.classList.add("ms-" + (S.mushaf || "madina"));
  if (S.theme !== "light") document.body.classList.add(S.theme);
  document.documentElement.style.setProperty("--ar", S.ar + "px");
  document.documentElement.style.setProperty("--tr", S.tr + "px");
  if (NATIVE) Native.setBarColor({ dark: "#0b1120", sepia: "#6b4423" }[S.theme] || "#0E5C48");
}

function speak(t) {
  if (NATIVE) { if (!Native.speak(t)) toast("Telefonda arab tili ovozi topilmadi. Sozlamalar → Matnni ovozga aylantirish (Google TTS) bo'limida arab tilini yuklab oling."); }
  else if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(t); u.lang = "ar"; u.rate = .75; speechSynthesis.speak(u); }
}
const wAudio = $("#waudio");
function playWord(url, fallbackText) {
  if (!url) { speak(fallbackText); return; }
  wAudio.src = url; wAudio.play().catch(() => speak(fallbackText));
}

// ---------- Bosh sahifa (suralar ro'yxati) ----------
let listFilter = "all", listQuery = "";
function vHome() {
  setTitle("Qur'on O'rgan · so'zma-so'z", false, { icon: "🔍", fn: () => push(vSearch) });
  const last = store.get("last", null);
  let h = "";
  if (!NATIVE && !FRAMED && IS_IOS && !navigator.standalone && !store.get("iosTipX", false))
    h += `<div id="iosTip"><button onclick="try{localStorage.setItem('iosTipX','true')}catch(e){};this.parentNode.remove()">×</button>📲 <b>Ilova kabi o'rnating:</b> Safari pastidagi <b>Ulashish ⬆︎</b> tugmasini bosing → <b>«Добавить на экран Домой» / «Add to Home Screen»</b>. Shunda ikonka paydo bo'ladi va to'liq ekranda ochiladi.</div>`;
  if (last && SURAS[last.s - 1]) {
    h += `<div class="hero"><h3>Oxirgi o'qilgan joy</h3><div class="big">${esc(SURAS[last.s - 1][0])} · ${last.a}-oyat</div>
      <button class="btn light" id="contBtn">Davom ettirish →</button></div>`;
  } else {
    h += `<div class="hero"><h3>Assalomu alaykum!</h3><div class="big">Qur'onni o'qishni va tushunishni o'rganing</div>
      <button class="btn light" id="startBtn">Alifbodan boshlash →</button></div>`;
  }
  h += `<div class="pad" style="padding-bottom:4px"><input class="search" id="q" placeholder="Sura nomi yoki raqami..." value="${esc(listQuery)}"></div>
    <div class="chips"><button class="chip ${listFilter === "all" ? "on" : ""}" data-f="all">Barcha suralar</button>
    <button class="chip ${listFilter === "short" ? "on" : ""}" data-f="short">Yod olish uchun qisqa suralar</button></div>
    <div class="card" id="list"></div>`;
  view.innerHTML = h;
  const c = $("#contBtn"); if (c) c.onclick = () => openSura(last.s, last.a);
  const st = $("#startBtn"); if (st) st.onclick = () => { goTab("learn"); push(vAlphabet); };
  $$(".chip[data-f]").forEach(b => b.onclick = () => { listFilter = b.dataset.f; render(view.scrollTop); });
  const q = $("#q");
  q.oninput = () => { listQuery = q.value; fillList(); };
  fillList();
}
function fillList() {
  const q = listQuery.trim().toLowerCase().replace(/[‘’'`ʻ\-\s]/g, "");
  let ids = listFilter === "short" ? SHORT_SURAS.slice() : SURAS.map((_, i) => i + 1);
  if (q) ids = ids.filter(i => String(i) === q || SURAS[i - 1][0].toLowerCase().replace(/[‘’'`ʻ\-\s]/g, "").includes(q) || SURAS[i - 1][1].includes(listQuery.trim()));
  $("#list").innerHTML = ids.map(i => {
    const s = SURAS[i - 1];
    return `<div class="row" data-s="${i}"><div class="num">${i}</div><div class="rmain"><div class="rtitle">${esc(s[0])}</div>
      <div class="rsub">${s[3] === "M" ? "Makkiy" : "Madaniy"} · ${s[2]} oyat</div></div><div class="rar">${s[1]}</div></div>`;
  }).join("") || `<div class="empty">Hech narsa topilmadi</div>`;
  $$("#list .row").forEach(r => r.onclick = () => openSura(+r.dataset.s));
}

// ---------- Sura o'qish oynasi ----------
let cur = null; // {s, verses, tr, wbwSrc}
function openSura(s, a) { if (tab !== "quran") { tab = "quran"; $$("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === "quran")); stack = [{ fn: vHome, args: [] }]; } push(vSura, [s, a]); }

// Ilova ichidagi (oflayn) matn va so'zlar: Tanzil/QUL Usmoniy matn + Quran.com so'z ma'lumotlari
function localVerses(s) {
  const src = (window.QDATA || [])[s - 1]; if (!src) return null;
  return src.map((r, i) => {
    const ar = r[0].split("|"), tl = r[1].split("|"), en = r[2].split("|"), n = i + 1;
    const words = ar.map((w, j) => ({
      char_type_name: "word", text_uthmani: w, en: en[j] || "",
      transliteration: { text: tl[j] || "" }, translation: { text: en[j] || "", language_name: "english" },
      audio_url: `wbw/${pad3(s)}_${pad3(n)}_${pad3(j + 1)}.mp3`
    }));
    words.push({ char_type_name: "end" });
    return { verse_number: n, words };
  });
}
// Serverdan kelgan qo'shimchalar (rangli tajvid, ruscha so'z ma'nolari) — bo'lsa qo'shamiz
function mergeApi(local, api, wantLang) {
  let langUsed = null;
  const byN = {}; api.forEach(v => byN[v.verse_number] = v);
  local.forEach(v => {
    const a = byN[v.verse_number]; if (!a) return;
    if (a.text_uthmani_tajweed) v.text_uthmani_tajweed = a.text_uthmani_tajweed;
    const aw = (a.words || []).filter(w => w.char_type_name !== "end");
    const lw = v.words.filter(w => w.char_type_name !== "end");
    if (wantLang !== "en" && aw.length === lw.length) {
      aw.forEach((w, j) => {
        const t = w.translation; if (!t || !t.text) return;
        if ((t.language_name || "") !== "english") { lw[j].translation = { text: t.text, language_name: t.language_name }; langUsed = t.language_name; }
      });
    }
  });
  return langUsed;
}
function vSura(s, gotoA) {
  const info = SURAS[s - 1];
  setTitle(`${s}. ${info[0]}`, true, { icon: "Aa", fn: () => readerSettings(s) },
    { icon: "ع", on: S.arOnly, fn: () => { S.arOnly = !S.arOnly; save(); toast(S.arOnly ? "Faqat arabcha matn" : "O'rganish ko'rinishi"); const a = topAyah(); stack[stack.length - 1].args = [s, a]; render(0); } });
  view.innerHTML = `<div class="sura-head"><div class="ar">سُورَةُ ${info[1]}</div>
    <div class="meta">${info[3] === "M" ? "Makkiy" : "Madaniy"} sura · ${info[2]} oyat</div>
    <div class="playall"><button class="btn" id="playAll">▶ Butun surani tinglash</button><button class="btn out" id="playFrom">Davomidan</button></div></div>
    <div id="rd"><div class="loading"><div class="spinner"></div>Yuklanmoqda...</div></div>`;
  const uzCov = uzCoverage(s), hasUz = S.wbwLang === "uz" && uzCov >= 0.999;
  const lang = S.wbwLang === "uz" ? S.wbwFallback : S.wbwLang;
  const verses = localVerses(s);
  $("#playAll").onclick = () => { if (player.s === s && player.playing) { stopPlayer(); return; } startPlayer(s, 1); toast(`${info[0]} — butun sura tinglanmoqda`); };
  $("#playFrom").onclick = () => { const a = topAyah(); startPlayer(s, a); toast(`${a}-oyatdan tinglanmoqda`); };
  const alive = () => stack.length && stack[stack.length - 1].fn === vSura && stack[stack.length - 1].args[0] === s;
  cur = { s, verses, tr: {}, hasUz, lang, apiLang: "english", trErr: false };
  const draw = (keepScroll) => {
    if (!alive()) return;
    const rd = $("#rd"); if (!rd) return;
    const st = view.scrollTop;
    let h = "";
    const needOther = S.wbw && !hasUz && !S.arOnly;
    if (needOther && S.wbwLang === "uz")
      h += `<div class="banner">Bu surada so'zlarning ${Math.floor(uzCov * 100)}% i o'zbekcha. Qolganlari hozircha ${cur.apiLang === "russian" ? "ruscha" : "inglizcha"} ko'rsatiladi.</div>`;
    if (cur.trErr) h += `<div class="banner">Oyat tarjimasini yuklab bo'lmadi — internetni tekshiring. Arabcha matn va so'zma-so'z ma'nolar ilova ichida bor.</div>`;
    if (s !== 1 && s !== 9) h += `<div class="bism">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
    h += S.arOnly ? mushafHtml(s) : cur.verses.map(v => ayahHtml(s, v)).join("");
    h += `<div class="foot">Arabcha matn: Tanzil/QUL · Morfologiya: quran-search-engine (MIT) · So'z ma'lumotlari: Quran.com · Tarjima va tafsir: QuranEnc.com · Audio: EveryAyah.com</div>`;
    rd.innerHTML = h;
    bindReader(rd, s);
    if (keepScroll) view.scrollTop = st;
    else if (gotoA && gotoA > 1) { const el = $("#a" + gotoA); if (el) view.scrollTop = el.offsetTop - 8; }
    if (player.s === s && player.a) markPlaying(player.a);
  };
  // 1) Tarjima (QuranEnc) — kelishi bilan chizamiz; ilova ichidagi matn bilan
  getEnc(S.tr_key, s).then(tr => { cur.tr = tr; }).catch(() => { cur.trErr = true; }).then(() => {
    if (!alive()) return;
    draw(false);
    // 2) Qo'shimchalar: rangli tajvid va (tanlangan bo'lsa) ruscha so'z ma'nolari
    const wantApi = S.wbw && !hasUz && lang !== "en";
    if (!wantApi) return;
    getVerses(s, lang === "en" ? "en" : lang).then(api => {
      if (!alive()) return;
      const used = mergeApi(cur.verses, api, lang);
      if (used) cur.apiLang = used;
      draw(true);
    }).catch(() => {});
  });
}

// Rangli tajvid: oyatning tajvid belgilangan matnini so'zlarga ajratish
// TAJ ma'lumoti formati: "{<kod><matn>}" — kod TAJ_CODES ro'yxatidagi qoidaning harfi
const AR_LETTER = /[\u0621-\u064A\u0671-\u06D3\u06FA-\u06FC]/;
function tajWords(str) {
  if (!str) return null;
  try {
    const seq = []; let cls = "";
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (c === "{") { cls = TAJ_CODES[str.charCodeAt(i + 1) - 97] || ""; i++; continue; }
      if (c === "}") { cls = ""; continue; }
      seq.push([c, cls]);
    }
    const words = []; let cur = [];
    for (const it of seq) { if (/\s/.test(it[0])) { if (cur.length) { words.push(cur); cur = []; } } else cur.push(it); }
    if (cur.length) words.push(cur);
    return words.filter(w => w.some(x => AR_LETTER.test(x[0]))).map(w => {
      let h = "", run = "", rc = null;
      const flush = () => { if (run) h += rc ? `<i class="tj-${rc}">${esc(run)}</i>` : esc(run); run = ""; };
      for (const [c, k] of w) { if (k !== rc) { flush(); rc = k; } run += c; }
      flush(); return h;
    });
  } catch (e) { return null; }
}

// Yozuv uslublari (xattotlik): matn manbai va shrift
const MUSHAFS = [
  ["madina", "Madina mushafi (yangi, 1441-h)", "Shoh Fahd majmuasi bosmasi uslubi, Usmoniy rasm"],
  ["oldmadina", "Madina mushafi (eski, 1405-h)", "Avvalgi Madina bosmasining xati"],
  ["indopak", "Qozon / Hind-Pok uslubi", "Qozon, Buxoro va Hind bosmalariga xos yozuv: madd harflarida sukun, to'liq harakatlar"],
  ["amiri", "Naskh (Amiri)", "Kitob uslubidagi oddiy naskh xati"]
];
function ayahWords(s, v, wbw) {
  const n = v.verse_number, key = s + ":" + n;
  const real = (v.words || []).filter(w => w.char_type_name !== "end"), nW = real.length;
  let ind = S.mushaf === "indopak" && window.INDOPAK && INDOPAK[s - 1] ? INDOPAK[s - 1][n - 1].split("|") : null;
  if (ind && ind.length !== nW) ind = null;
  const fallbackFont = S.mushaf === "indopak" && !ind;
  let tw = !ind && S.tajweed && window.TAJ && TAJ[s - 1] ? tajWords(TAJ[s - 1][n - 1]) : null;
  if (tw && tw.length !== nW) tw = null;
  let wi = 0;
  const html = (v.words || []).map((w, i) => {
    if (w.char_type_name === "end") return `<span class="end" data-act="menu">﴿${arDigits(n)}﴾</span>`;
    const mean = (S.wbwLang === "uz" && uzOf(w.en)) || (w.translation && w.translation.text) || w.en || "";
    const arH = ind ? esc(ind[wi]) : tw ? tw[wi] : esc(w.text_uthmani || w.text || "");
    wi++;
    const inv = VSET.has(vKey(s, n, wi - 1)) ? " inv" : "";
    if (!wbw) return `<span class="w${inv}" data-i="${i}"><span class="wa">${arH}</span></span>`;
    return `<span class="w${inv}" data-i="${i}"><span class="wa">${arH}</span><span class="wt">${esc(w.transliteration && w.transliteration.text || "")}</span><span class="wm">${esc(uzShow(mean))}</span></span>`;
  }).join(" ");
  return { html, fallbackFont };
}

// ---------- Lug'at: oraliqli takrorlash (Spaced Repetition, SM-2 asosida) ----------
const vKey = (s, n, wi) => `${s}:${n}:${wi}`;
const vocab = () => store.get("vocab", {});
let VSET = new Set(Object.keys(vocab()));
function saveVocab(all) { store.set("vocab", all); VSET = new Set(Object.keys(all)); syncNative(); }
// ---------- Kunlik maqsad va ketma-ketlik ----------
const dayKey = (d) => { d = d || new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const daily = () => store.get("daily", {});
function bump(n) { const d = daily(), k = dayKey(); d[k] = (d[k] || 0) + (n || 1); store.set("daily", d); syncNative(); }
const todayDone = () => daily()[dayKey()] || 0;
function streak() {
  const d = daily(); let n = 0; const t = new Date();
  if (!d[dayKey(t)]) t.setDate(t.getDate() - 1);
  while (d[dayKey(t)]) { n++; t.setDate(t.getDate() - 1); }
  return n;
}
function syncNative() {
  if (!NATIVE || !Native.syncDue) return;
  try { const all = store.get("vocab", {}); Native.syncDue(Object.values(all).map(c => c.due).join(","), dayKey() + ":" + todayDone(), +S.goal || 10); } catch (e) {}
}
function goalHtml() {
  const t = todayDone(), g = +S.goal || 10, st = streak(), ok = t >= g;
  return `<div class="goalbar"><div><b>Bugun: ${t}/${g}</b> ${ok ? "✓ maqsad bajarildi" : "so'z"}</div><div class="streak">🔥 ${st} kun ketma-ket</div></div>
    <div class="progress"><div style="width:${Math.min(100, t / g * 100)}%"></div></div>`;
}
const vocabHas = (s, n, wi) => VSET.has(vKey(s, n, wi));
const MIN = 60000, DAY = 86400000;
function dueList() { const now = Date.now(), all = vocab(); return Object.keys(all).filter(k => all[k].due <= now).sort((a, b) => all[a].due - all[b].due); }
function updVocabBadge() { const n = dueList().length, b = $("#vBadge"); if (b) { b.textContent = n > 99 ? "99+" : n; b.classList.toggle("hidden", !n); } }
// Javob bahosi: 0 = qiyin, 1 = o'rta, 2 = oson. Qaytaradi: yangi holat
function schedule(c, g) {
  const x = Object.assign({}, c);
  if (g === 0) { x.lapses = (x.reps > 0 ? x.lapses + 1 : x.lapses); x.reps = 0; x.iv = 0; x.ef = Math.max(1.3, x.ef - 0.2); x.due = Date.now() + 10 * MIN; return x; }
  x.reps++;
  if (g === 1) { x.iv = x.reps === 1 ? 1 : x.reps === 2 ? 3 : Math.round(x.iv * x.ef); }
  else { x.iv = x.reps === 1 ? 4 : Math.round(Math.max(x.iv, 1) * x.ef * 1.3); x.ef = Math.min(3, x.ef + 0.15); }
  x.iv = Math.max(1, Math.min(x.iv, 365)); x.due = Date.now() + x.iv * DAY;
  return x;
}
function ivLabel(c, g) {
  const x = schedule(c, g);
  if (g === 0) return "10 daqiqa";
  return x.iv >= 30 ? Math.round(x.iv / 30) + " oy" : x.iv + " kun";
}
function whenLabel(t) {
  const d = t - Date.now();
  if (d <= 0) return "hozir";
  if (d < 3600000) return Math.ceil(d / MIN) + " daqiqadan keyin";
  if (d < DAY) return Math.ceil(d / 3600000) + " soatdan keyin";
  return Math.round(d / DAY) + " kundan keyin";
}
// ---------- Morfologiya: ildiz, asl shakl, chastota, misollar ----------
let MW = null, MIDX = null;
const M_STRIP = /[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u0640]/g;
function morphMap() {
  if (MW) return MW;
  MW = new Map();
  (MORPH.W || "").split(";").forEach(p => { const i = p.lastIndexOf(":"); if (i > 0) { const [l, r] = p.slice(i + 1).split(","); MW.set(p.slice(0, i), [+l, +r]); } });
  return MW;
}
function morphOf(w) {
  const m = morphMap();
  let a = String(w || "").replace(/ٱ/g, "ا").replace(/ءَا/g, "آ").replace(/ءا/g, "آ").replace(/وٰ/g, "ا");
  for (const dag of ["", "ا"]) {
    const t = a.replace(/\u0670/g, dag).replace(M_STRIP, "");
    for (const x of [t, t.replace(/ى/g, "ي"), t.replace(/ي/g, "ى"), t.replace(/ءا/g, "آ")]) {
      const r = m.get(x); if (r) return { lemma: MORPH.L[r[0]], root: MORPH.R[r[1]], li: r[0], ri: r[1] };
    }
  }
  return null;
}
function glossAt(s, a, wi) {
  const r = QDATA[s - 1][a - 1], en = (r[2].split("|")[wi]) || "";
  return uzOf(en) || en;
}
// Butun Qur'on bo'yicha indeks (bir marta, kerak bo'lganda quriladi)
function morphIndex() {
  if (MIDX) return MIDX;
  const lc = new Map(), rc = new Map(), locc = new Map(), rl = new Map(), lr = new Map(); let total = 0;
  QDATA.forEach((ays, si) => ays.forEach((r, ai) => r[0].split("|").forEach((w, wi) => {
    total++;
    const m = morphOf(w); if (!m || !m.lemma) return;
    lc.set(m.li, (lc.get(m.li) || 0) + 1);
    if (!locc.has(m.li)) locc.set(m.li, []);
    const o = locc.get(m.li); if (o.length < 40) o.push([si + 1, ai + 1, wi]);
    if (m.root) { if (!lr.has(m.li)) lr.set(m.li, new Map()); const mm = lr.get(m.li); mm.set(m.ri, (mm.get(m.ri) || 0) + 1); }
  })));
  // Har bir asl shaklga bitta (eng ko'p uchragan) ildiz — ma'lumotdagi xatolarni chetlab o'tish uchun
  const lroot = new Map();
  lr.forEach((mm, li) => { let best = -1, bc = 0; mm.forEach((c, ri) => { if (c > bc) { bc = c; best = ri; } }); lroot.set(li, best); if (!rl.has(best)) rl.set(best, new Set()); rl.get(best).add(li); });
  rc.clear(); lroot.forEach((ri, li) => rc.set(ri, (rc.get(ri) || 0) + (lc.get(li) || 0)));
  MIDX = { lc, rc, locc, rl, lroot, total };
  return MIDX;
}
const rootPretty = r => String(r || "").split("-").join(" ");
function wordDetailHtml(s, n, wi, ar, mean) {
  const m = morphOf(ar);
  if (!m) return `<div class="note" style="padding:8px 0">Bu so'z uchun ildiz ma'lumoti yo'q (odatda yuklama yoki olmosh).</div>`;
  const X = morphIndex();
  if (X.lroot.has(m.li)) { m.ri = X.lroot.get(m.li); m.root = MORPH.R[m.ri]; }
  if (m.root && m.root.split("-").length < 3) m.root = "";
  const lcount = X.lc.get(m.li) || 0, rcount = m.root ? (X.rc.get(m.ri) || 0) : 0;
  let h = `<div class="mgrid">
    ${m.root ? `<div class="mbox"><small>Ildizi</small><div class="mar">${esc(rootPretty(m.root))}</div><small>Qur'onda ${rcount} marta</small></div>` : ""}
    <div class="mbox"><small>Asl shakli (lug'atdagi)</small><div class="mar">${esc(m.lemma)}</div><small>Qur'onda ${lcount} marta</small></div></div>`;
  if (lcount >= 50) h += `<div class="tipbox">⭐ Qur'onda eng ko'p uchraydigan so'zlardan biri — uni bilsangiz ko'p oyatni tushunasiz.</div>`;
  // So'z oilasi — bir ildizdan boshqa so'zlar
  if (m.root && X.rl.has(m.ri)) {
    const fam = [...X.rl.get(m.ri)].filter(li => li !== m.li).sort((a, b) => (X.lc.get(b) || 0) - (X.lc.get(a) || 0)).slice(0, 8);
    if (fam.length) h += `<h4>So'z oilasi (ildizi «${esc(rootPretty(m.root))}»)</h4><div class="fam">` + fam.map(li => {
      const o = X.locc.get(li)[0], w = QDATA[o[0] - 1][o[1] - 1][0].split("|")[o[2]];
      return `<button class="famw" data-go="${o[0]}:${o[1]}"><span class="far">${esc(w)}</span><span>${esc(uzShow(glossAt(o[0], o[1], o[2])))}</span><small>${X.lc.get(li)} marta</small></button>`;
    }).join("") + `</div>`;
  }
  // Misollar — boshqa oyatlarda
  const ex = (X.locc.get(m.li) || []).filter(o => !(o[0] === s && o[1] === n)).slice(0, 4);
  if (ex.length) h += `<h4>Boshqa oyatlarda</h4>` + ex.map(o => {
    const ws = QDATA[o[0] - 1][o[1] - 1][0].split("|");
    const st = Math.max(0, o[2] - 3), en = Math.min(ws.length, o[2] + 4);
    const frag = ws.slice(st, en).map((w, j) => st + j === o[2] ? `<mark>${esc(w)}</mark>` : esc(w)).join(" ");
    return `<div class="exrow" data-go="${o[0]}:${o[1]}"><div class="exar">${st > 0 ? "… " : ""}${frag}${en < ws.length ? " …" : ""}</div>
      <div class="rsub">«${esc(uzShow(glossAt(o[0], o[1], o[2])))}» · ${esc(SURAS[o[0] - 1][0])} ${o[1]}-oyat</div></div>`;
  }).join("");
  return h;
}
function bindDetail(root) {
  $$("[data-go]", root).forEach(x => x.onclick = () => { const [a, b] = x.dataset.go.split(":"); closeSheet(); openSura(+a, +b); });
}
function showWordDetail(k) {
  const c = vocab()[k]; if (!c) return;
  openSheet(`<div class="word-pop"><div class="wbig">${esc(c.ar)}</div><div class="wtl">${esc(c.tl)}</div><div class="wmn">${esc(uzShow(c.m))}</div>
    <button class="btn out" id="dSay">🔊 Tinglash</button></div>
    <div id="dBody"><div class="loading"><div class="spinner"></div>Tahlil qilinmoqda...</div></div>
    <h4>Mening eslatmam (yodda qolish uchun)</h4>
    <textarea id="dNote" class="search" style="min-height:70px;font-family:inherit" placeholder="Masalan: «kitob» so'zi bizda ham bor; ildizi ك ت ب — yozish">${esc(c.note || "")}</textarea>
    <div style="display:flex;gap:8px;margin-top:8px"><button class="btn" id="dSave" style="flex:1">Saqlash</button><button class="btn out" id="dOpen">Oyatni ochish</button></div>`, (b) => {
    $("#dSay").onclick = () => playWord(c.audio, c.ar);
    $("#dSave").onclick = () => { const a = vocab(); if (a[k]) { a[k].note = $("#dNote").value.trim(); saveVocab(a); } toast("Saqlandi"); closeSheet(); };
    $("#dOpen").onclick = () => { closeSheet(); openSura(c.s, c.n); };
    setTimeout(() => { const d = $("#dBody"); if (d) { d.innerHTML = wordDetailHtml(c.s, c.n, c.wi, c.ar, c.m); bindDetail(d); } }, 30);
  });
}
// Tayyor to'plam: Qur'onda eng ko'p uchraydigan so'zlar
function addTopDeck(count) {
  const X = morphIndex(), all = vocab();
  const have = new Set(Object.values(all).map(c => { const m = morphOf(c.ar); return m ? m.li : -1; }));
  const top = [...X.lc.entries()].sort((a, b) => b[1] - a[1]);
  let added = 0;
  for (const [li] of top) {
    if (added >= count) break;
    if (have.has(li)) continue;
    const occ = X.locc.get(li) || []; if (!occ.length) continue;
    const o = occ.find(x => uzOf(QDATA[x[0] - 1][x[1] - 1][2].split("|")[x[2]])) || occ[0];
    const r = QDATA[o[0] - 1][o[1] - 1], ar = r[0].split("|")[o[2]];
    const k = vKey(o[0], o[1], o[2]); if (all[k]) continue;
    all[k] = { ar, tl: r[1].split("|")[o[2]] || "", m: glossAt(o[0], o[1], o[2]), s: o[0], n: o[1], wi: o[2], audio: `https://audio.qurancdn.com/wbw/${pad3(o[0])}_${pad3(o[1])}_${pad3(o[2] + 1)}.mp3`, added: Date.now(), due: Date.now(), iv: 0, ef: 2.5, reps: 0, lapses: 0, deck: 1 };
    added++;
  }
  saveVocab(all); updVocabBadge();
  return added;
}
function coverage() {
  const X = morphIndex(), all = vocab(), seen = new Set(); let n = 0;
  Object.values(all).forEach(c => { const m = morphOf(c.ar); if (m && !seen.has(m.li)) { seen.add(m.li); n += X.lc.get(m.li) || 0; } });
  return X.total ? Math.round(n / X.total * 1000) / 10 : 0;
}
let vReverse = store.get("vReverse", false);

let vocabFilter = "all";
function vVocab() {
  setTitle("Lug'atim", false);
  const all = vocab(), keys = Object.keys(all), due = dueList();
  const learned = keys.filter(k => all[k].iv >= 21).length, learning = keys.length - learned;
  const deckBtn = `<div class="card"><div class="set"><label>📚 Tayyor to'plam</label><div class="hint">Qur'onda eng ko'p uchraydigan so'zlar. Eng ko'p uchraydigan 100 ta so'z Qur'on matnining yarmidan ko'pini tashkil qiladi.</div>
    <div style="display:flex;gap:8px;margin-top:8px"><button class="btn" data-deck="20">+20 so'z</button><button class="btn out" data-deck="50">+50</button><button class="btn out" data-deck="100">+100</button></div></div></div>`;
  const bindDeck = () => $$("[data-deck]", view).forEach(b => b.onclick = () => { b.textContent = "..."; setTimeout(() => { const n = addTopDeck(+b.dataset.deck); toast(n ? `${n} ta yangi so'z qo'shildi` : "Bu so'zlar allaqachon lug'atingizda"); render(0); }, 30); });
  if (!keys.length) {
    view.innerHTML = deckBtn + `<div class="empty" style="padding-top:20px">Yoki sura o'qiyotganda notanish so'zni bosing va <b>«➕ Lug'atimga qo'shish»</b>ni tanlang.<br><br>So'zlar <b>oraliqli takrorlash</b> usulida qaytariladi: yaxshi bilgan so'zingiz kamroq, qiyin so'z tez-tez chiqadi.</div>`;
    bindDeck();
    return;
    view.innerHTML = `<div class="empty">Lug'atingiz hozircha bo'sh.<br><br>Sura o'qiyotganda notanish so'zni bosing va <b>«➕ Lug'atimga qo'shish»</b> tugmasini tanlang.<br><br>So'zlar <b>oraliqli takrorlash</b> usulida qaytariladi: yaxshi bilgan so'zingiz kamroq, qiyin so'z tez-tez chiqadi.</div>`;
    return;
  }
  let list = keys.sort((a, b) => all[a].due - all[b].due);
  if (vocabFilter === "due") list = due; else if (vocabFilter === "learned") list = list.filter(k => all[k].iv >= 21);
  view.innerHTML = `<div class="hero">${goalHtml()}<h3 style="margin-top:12px">Bugun takrorlash kerak</h3><div class="big">${due.length} ta so'z</div>
      <div class="vstats"><span>Jami: <b>${keys.length}</b></span><span>O'rganilmoqda: <b>${learning}</b></span><span>O'zlashtirilgan: <b>${learned}</b></span></div>
      <button class="btn light" id="vStart" ${due.length ? "" : "disabled"}>${due.length ? "▶ Takrorlashni boshlash" : "✓ Bugungi takrorlash tugadi"}</button>
      ${!due.length ? `<button class="btn light" id="vExtra" style="margin-left:6px">Baribir mashq qilish</button>` : ""}
      <div class="covbar"><div>Lug'atingizdagi so'zlar Qur'on matnining <b id="covN">…</b> qismida uchraydi</div><div class="progress"><div id="covP" style="width:0"></div></div></div></div>
    <div class="pad" style="padding:6px 12px 0;display:flex;gap:8px"><button class="btn out" id="vListen" style="flex:1">🎧 Tinglab tanish mashqi</button></div>
    <div class="chips"><button class="chip ${vReverse ? "" : "on"}" data-rv="0">Arabcha → ma'no</button><button class="chip ${vReverse ? "on" : ""}" data-rv="1">Ma'no → arabcha</button></div>
    <div class="chips"><button class="chip ${vocabFilter === "all" ? "on" : ""}" data-f="all">Barchasi</button><button class="chip ${vocabFilter === "due" ? "on" : ""}" data-f="due">Takrorlash kerak</button><button class="chip ${vocabFilter === "learned" ? "on" : ""}" data-f="learned">O'zlashtirilgan</button></div>
    <div class="card">` + (list.length ? list.map(k => { const c = all[k]; return `<div class="row" data-k="${k}"><div class="rar vword">${esc(c.ar)}</div><div class="rmain">
      <div class="rtitle">${esc(uzShow(c.m))}</div><div class="rsub">${esc(SURAS[c.s - 1][0])} ${c.n}-oyat · ${c.iv >= 21 ? "✓ o'zlashtirilgan" : "takror: " + whenLabel(c.due)}</div></div>
      <button class="iconbtn" data-del="${k}" style="color:var(--muted)">✕</button></div>`; }).join("") : `<div class="empty" style="padding:24px">Bu ro'yxat bo'sh</div>`) + `</div>
    ${deckBtn}
    <div class="note">Oson — so'zni darhol eslasangiz. O'rta — biroz o'ylab eslasangiz. Qiyin — eslay olmasangiz (10 daqiqadan keyin yana chiqadi).</div>`;
  const st = $("#vStart"); if (st && due.length) st.onclick = () => push(vReview, [due]);
  $("#vListen").onclick = () => push(vListen);
  const ex = $("#vExtra"); if (ex) ex.onclick = () => { const k = Object.keys(all).sort((a, b) => all[a].due - all[b].due).slice(0, 20); push(vReview, [k, true]); };
  $$(".chip[data-f]", view).forEach(c => c.onclick = () => { vocabFilter = c.dataset.f; render(0); });
  $$(".chip[data-rv]", view).forEach(c => c.onclick = () => { vReverse = c.dataset.rv === "1"; store.set("vReverse", vReverse); $$(".chip[data-rv]", view).forEach(y => y.classList.toggle("on", y === c)); });
  bindDeck();
  setTimeout(() => { const p = coverage(), n = $("#covN"), b = $("#covP"); if (n) n.textContent = p + "%"; if (b) b.style.width = Math.min(100, p) + "%"; }, 50);
  $$(".row[data-k]", view).forEach(r => r.onclick = (e) => {
    const d = e.target.closest("[data-del]");
    if (d) { const a = vocab(); delete a[d.dataset.del]; saveVocab(a); updVocabBadge(); render(view.scrollTop); return; }
    showWordDetail(r.dataset.k);
  });
}
// ---------- Tinglab tanish mashqi ----------
let lq = { ok: 0, n: 0 };
function vListen() {
  setTitle("Tinglab tanish", true);
  const all = vocab(); let pool = Object.keys(all).map(k => Object.assign({ k }, all[k]));
  if (pool.length < 4) {
    view.innerHTML = `<div class="empty">Bu mashq uchun lug'atda kamida 4 ta so'z bo'lishi kerak.<br><br><button class="btn" id="lqAdd">Tayyor to'plamdan 20 ta so'z qo'shish</button></div>`;
    $("#lqAdd").onclick = () => { addTopDeck(20); render(0); }; return;
  }
  const now = Date.now();
  pool.sort((a, b) => (a.due <= now ? 0 : 1) - (b.due <= now ? 0 : 1) || Math.random() - .5);
  const ans = pool[Math.floor(Math.random() * Math.min(pool.length, 12))];
  const seen = new Set([ans.ar]), opts = [ans];
  for (const c of pool.sort(() => Math.random() - .5)) { if (opts.length >= 4) break; if (!seen.has(c.ar)) { seen.add(c.ar); opts.push(c); } }
  opts.sort(() => Math.random() - .5);
  view.innerHTML = `<div class="hero" style="padding:12px 16px">${goalHtml()}</div>
    <div class="score">To'g'ri: ${lq.ok} / ${lq.n}</div>
    <div style="text-align:center;padding:16px"><button class="btn" id="lqPlay" style="font-size:20px;padding:18px 28px;border-radius:50px">🔊 Eshitish</button>
      <div class="note" style="text-align:center">So'zni tinglang va qaysi biri ekanini tanlang</div></div>
    <div class="lqopts">` + opts.map((o, i) => `<button data-i="${i}">${esc(o.ar)}</button>`).join("") + `</div>
    <div id="lqRes" class="pad" style="text-align:center"></div>`;
  const play = () => playWord(ans.audio, ans.ar);
  $("#lqPlay").onclick = play; setTimeout(play, 300);
  let done = false;
  $$(".lqopts button", view).forEach(b => b.onclick = () => {
    if (done) return; done = true; lq.n++;
    const o = opts[+b.dataset.i], ok = o.ar === ans.ar;
    if (ok) { lq.ok++; b.classList.add("ok"); bump(); } else { b.classList.add("bad"); $$(".lqopts button", view).forEach(x => { if (opts[+x.dataset.i].ar === ans.ar) x.classList.add("ok"); }); }
    $("#lqRes").innerHTML = `<div class="fa" style="font-size:20px">${esc(uzShow(ans.m))}</div><div class="wtl">${esc(ans.tl)}</div><button class="btn" id="lqNext" style="margin-top:10px">Keyingisi →</button>`;
    $("#lqNext").onclick = () => render(0);
  });
}

// ---------- Zaxira nusxa ----------
const BK_KEYS = ["vocab", "notes", "bookmarks", "daily", "settings", "last", "vReverse"];
function doBackup() {
  const data = { app: "quron-organ", v: 1, date: new Date().toISOString() };
  BK_KEYS.forEach(k => data[k] = store.get(k, null));
  const json = JSON.stringify(data);
  const name = `quron-organ-zaxira-${dayKey()}.json`;
  if (!NATIVE) {
    try { const f = new File([json], name, { type: "application/json" });
      if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: name }).then(() => toast("Zaxira nusxa yuborildi ✓")).catch(() => {}); return; } } catch (e) {}
    try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([json], { type: "application/json" })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); toast("Zaxira fayl yuklab olindi ✓"); } catch (e) { toast("Saqlab bo'lmadi"); }
    return; }
  cbs["__backup"] = { res: () => toast("Zaxira nusxa saqlandi ✓"), rej: (e) => toast("Saqlanmadi: " + e.message) };
  Native.saveBackup(json, name);
}
function doRestore() {
  if (!NATIVE) {
    const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json,text/plain";
    inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) return; const fr = new FileReader(); fr.onload = () => cbs["__restore"].res(String(fr.result)); fr.readAsText(f); };
    cbs["__restore"] = { res: restoreFrom, rej: () => {} }; inp.click(); return;
  }
  cbs["__restore"] = { res: restoreFrom, rej: (e) => toast("Ochilmadi: " + e.message) };
  Native.openBackup();
}
function restoreFrom(txt) {
    try {
      const d = JSON.parse(txt); if (d.app !== "quron-organ") throw new Error("bu ilova fayli emas");
      const cur0 = store.get("vocab", {}), nv = d.vocab || {};
      BK_KEYS.forEach(k => { if (d[k] != null && k !== "vocab") store.set(k, d[k]); });
      store.set("vocab", Object.assign({}, cur0, nv)); VSET = new Set(Object.keys(store.get("vocab", {})));
      Object.assign(S, store.get("settings", {})); applyTheme(); syncNative(); updVocabBadge();
      toast(`Tiklandi: ${Object.keys(nv).length} ta so'z`); render(0);
    } catch (e) { toast("Fayl o'qilmadi: " + e.message); }
}
function applyReminder() {
  if (!NATIVE || !Native.setReminder) return;
  const [h, m] = String(S.remTime || "20:00").split(":").map(Number);
  Native.setReminder(!!S.remOn, h || 0, m || 0); syncNative();
}
window.openTab = (t) => { goTab(t); };

function vReview(queue, extra) {
  setTitle("Takrorlash", true);
  queue = queue.slice();
  let shown = false, done = 0, total = queue.length;
  const next = () => {
    const all = vocab();
    while (queue.length && !all[queue[0]]) queue.shift();
    if (!queue.length) {
      view.innerHTML = `<div class="empty">🎉 Barakalla! Takrorlash tugadi.<br>${done} ta javob berildi.<br><br><button class="btn" id="vBack">Lug'atga qaytish</button></div>`;
      $("#vBack").onclick = () => pop(); updVocabBadge(); return;
    }
    const k = queue[0], c = all[k]; shown = false;
    const draw = () => {
      view.innerHTML = `<div class="score">Qoldi: ${queue.length} · Javob berildi: ${done}</div>
        <div class="progress" style="margin:0 14px"><div style="width:${Math.min(100, done / Math.max(total, 1) * 100)}%"></div></div>
        <div class="card flash">${vReverse && !shown ? `<div class="fa" style="padding:40px 10px 10px">${esc(uzShow(c.m))}</div>` : `<div class="fq">${esc(c.ar)}</div>`}
          ${shown ? `${vReverse ? `<div class="fa">${esc(uzShow(c.m))}</div>` : ""}<div class="wtl" style="text-align:center">${esc(c.tl)}</div>${vReverse ? "" : `<div class="fa">${esc(uzShow(c.m))}</div>`}
            ${c.note ? `<div class="tipbox">💡 ${esc(c.note)}</div>` : ""}
            <div id="vDet" class="vdet"></div>
            <div class="note" style="text-align:center">${esc(SURAS[c.s - 1][0])}, ${c.n}-oyat · <a href="#" id="vCtx">oyatni ochish</a> · <a href="#" id="vMore">batafsil</a></div>` :
            `<div class="note" style="text-align:center;padding:18px">${vReverse ? "Arabchasini eslang (iloji bo'lsa yozib ko'ring)" : "Ma'nosini eslang"}, so'ng javobni oching</div>`}
          <div style="text-align:center;padding-bottom:12px">${shown || !vReverse ? `<button class="btn out" id="vSay">🔊 Tinglash</button>` : ""}</div></div>
        ${shown ? `<div class="grades"><button class="g0" data-g="0">Qiyin<small>${ivLabel(c, 0)}</small></button><button class="g1" data-g="1">O'rta<small>${ivLabel(c, 1)}</small></button><button class="g2" data-g="2">Oson<small>${ivLabel(c, 2)}</small></button></div>`
          : `<div class="pad"><button class="btn" id="vShow" style="width:100%;padding:14px">Javobni ko'rsatish</button></div>`}`;
      const vs = $("#vSay"); if (vs) vs.onclick = () => playWord(c.audio, c.ar);
      const vm = $("#vMore"); if (vm) vm.onclick = (e) => { e.preventDefault(); showWordDetail(k); };
      const vd = $("#vDet"); if (vd) { const m = morphOf(c.ar); if (m && m.root) { const X = morphIndex(); if (X.lroot.has(m.li)) m.root = MORPH.R[X.lroot.get(m.li)]; vd.innerHTML = `<span>Ildiz: <b class="arx">${esc(rootPretty(m.root))}</b></span><span>Qur'onda: <b>${X.lc.get(m.li) || 0}</b> marta</span>`; } }
      const sh = $("#vShow"); if (sh) sh.onclick = () => { shown = true; draw(); };
      const cx = $("#vCtx"); if (cx) cx.onclick = (e) => { e.preventDefault(); openSura(c.s, c.n); };
      $$("[data-g]", view).forEach(b => b.onclick = () => {
        const g = +b.dataset.g, a = vocab();
        a[k] = schedule(a[k], g); saveVocab(a); done++; bump();
        if (todayDone() === (+S.goal || 10)) toast(`🎉 Bugungi maqsad bajarildi! 🔥 ${streak()} kun ketma-ket`);
        queue.shift();
        if (g === 0) queue.push(k); // qiyin so'z shu mashg'ulot oxirida yana chiqadi
        next();
      });
    };
    draw();
  };
  next();
}

function ayahHtml(s, v) {
  const n = v.verse_number, key = s + ":" + n;
  const aw = ayahWords(s, v, true);
  const tr = S.showTr ? cyr2lat(splitEnc(S.tr_key, cur.tr[n]).main) : "";
  const bm = isBookmarked(s, n);
  return `<div class="ayah" id="a${n}" data-n="${n}">
    <div class="ayah-head"><span class="key">${key}</span>
      <button class="iconbtn" data-act="play" title="Tinglash">▶</button>
      <button class="iconbtn" data-act="tafsir" title="Tafsir">📖</button>
      <button class="iconbtn" data-act="note" title="Eslatma">✎</button>
      <button class="iconbtn ${bm ? "on" : ""}" data-act="bm" title="Saqlash">${bm ? "★" : "☆"}</button></div>
    <div class="${S.wbw ? "wbw" : ""} ${S.translit ? "tl" : ""}"><div class="ar-line ${aw.fallbackFont ? "ar-amiri" : ""}">${aw.html}</div></div>
    ${tr ? `<div class="tr-text">${esc(tr)}</div>` : ""}
    ${notes()[key] ? `<div class="note-box">✎ ${esc(notes()[key].t)}</div>` : ""}</div>`;
}

const THEMES = [
  ["light", "Zumrad", "#F6F4EE", "#0E5C48", "#0E5C48"],
  ["sepia", "Qum (sepiya)", "#f3e9d2", "#6b4423", "#7a4b25"],
  ["dark", "Tungi osmon", "#0d1422", "#0b1120", "#d4b25a"]
];
function themePicker() {
  return `<div class="tpick">` + THEMES.map(t => `<button data-th="${t[0]}" class="${S.theme === t[0] ? "on" : ""}"><div class="tp-prev" style="background:${t[2]}"><i style="background:${t[3]}"></i><span style="color:${t[4]}">قُرْآن</span></div><b>${t[1]}</b></button>`).join("") + `</div>`;
}
function bindThemePicker(root) {
  $$("[data-th]", root).forEach(x => x.onclick = () => { S.theme = x.dataset.th; save(); applyTheme(); $$("[data-th]", root).forEach(y => y.classList.toggle("on", y === x)); });
}
function mushafPicker() {
  return `<div class="mpick">` + MUSHAFS.map(m => `<button data-ms="${m[0]}" class="${S.mushaf === m[0] ? "on" : ""}"><span class="mp-ar ms-${m[0]}">بِسْمِ ٱللَّهِ</span><b>${m[1]}</b><small>${m[2]}</small></button>`).join("") +
    `</div><div class="hint">Qozon/Hind-Pok uslubida rangli tajvid ko'rsatilmaydi.</div>`;
}
function bindMushafPicker(root, onChange) {
  $$("[data-ms]", root).forEach(x => x.onclick = () => {
    S.mushaf = x.dataset.ms; save(); applyTheme();
    $$("[data-ms]", root).forEach(y => y.classList.toggle("on", y === x)); if (onChange) onChange();
  });
}

// Faqat arabcha matn — mushaf kabi uzluksiz o'qish
function mushafHtml(s) {
  return `<div class="mushaf">` + cur.verses.map(v => {
    const aw = ayahWords(s, v, false);
    return `<span class="ma ${aw.fallbackFont ? "ar-amiri" : ""}" id="a${v.verse_number}" data-n="${v.verse_number}">${aw.html}</span>`;
  }).join(" ") + `</div><div class="note" style="text-align:center">So'zni bosing — ma'nosi chiqadi. ﴿ ﴾ raqamini bosing — tinglash, tafsir, tarjima.</div>`;
}
function ayahMenu(s, n) {
  const bm = isBookmarked(s, n);
  const tr = cyr2lat(splitEnc(S.tr_key, cur.tr[n]).main);
  openSheet(`<h3>${esc(SURAS[s - 1][0])}, ${n}-oyat</h3>${tr ? `<div class="tafsir-text" style="margin-bottom:12px">${esc(tr)}</div>` : ""}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <button class="btn" data-m="play">▶ Tinglash</button><button class="btn out" data-m="tafsir">📖 Tafsir</button>
      <button class="btn out" data-m="note">✎ Eslatma</button><button class="btn out" data-m="bm">${bm ? "★ Saqlangan" : "☆ Saqlash"}</button></div>`, (b) => {
    $$("[data-m]", b).forEach(x => x.onclick = () => {
      const m = x.dataset.m;
      if (m === "play") { closeSheet(); startPlayer(s, n); }
      else if (m === "tafsir") showTafsir(s, n, store.get("tafsirKey", NATIVE ? "uzbek_mokhtasar" : "uzbek_sadiq"));
      else if (m === "note") editNote(s, n);
      else if (m === "bm") { toggleBookmark(s, n); toast(isBookmarked(s, n) ? "Saqlandi" : "O'chirildi"); closeSheet(); }
    });
  });
}

function bindReader(rd, s) {
  rd.onclick = (e) => {
    const btn = e.target.closest("[data-act]");
    const ay = e.target.closest("[data-n]");
    if (btn && ay) {
      const n = +ay.dataset.n, act = btn.dataset.act;
      if (act === "menu") ayahMenu(s, n);
      else if (act === "play") startPlayer(s, n);
      else if (act === "tafsir") showTafsir(s, n, store.get("tafsirKey", NATIVE ? "uzbek_mokhtasar" : "uzbek_sadiq"));
      else if (act === "note") editNote(s, n);
      else if (act === "bm") { toggleBookmark(s, n); const on = isBookmarked(s, n); btn.classList.toggle("on", on); btn.textContent = on ? "★" : "☆"; toast(on ? "Saqlandi" : "O'chirildi"); }
      return;
    }
    const w = e.target.closest(".w");
    if (w && ay) showWord(s, +ay.dataset.n, +w.dataset.i, w);
  };
}

function showWord(s, n, i, el) {
  const v = cur.verses.find(x => x.verse_number === n); if (!v) return;
  $$(".w.sel").forEach(x => x.classList.remove("sel")); el.classList.add("sel");
  if (v.__plain !== undefined) {
    const t = v.__plain.split(/\s+/).filter(Boolean)[i];
    openSheet(`<div class="word-pop"><div class="wbig">${esc(t)}</div><button class="btn" id="wsay">🔊 Tinglash</button></div>`, () => $("#wsay").onclick = () => speak(t));
    return;
  }
  const w = v.words[i];
  let wi = 0; for (let k = 0; k < i; k++) if (v.words[k].char_type_name !== "end") wi++;
  const uz = uzOf(w.en) || null;
  const other = (w.translation && w.translation.text !== uz && w.translation.text) || (w.en !== uz ? w.en : "");
  const otherLang = { english: "inglizcha", russian: "ruscha", uzbek: "o'zbekcha" }[(w.translation && w.translation.language_name) || ""] || "";
  const audio = w.audio_url ? (/^https?:/.test(w.audio_url) ? w.audio_url : "https://audio.qurancdn.com/" + w.audio_url) : null;
  openSheet(`<div class="word-pop"><div class="wbig">${esc(w.text_uthmani)}</div>
    <div class="wtl">${esc(w.transliteration && w.transliteration.text || "")}</div>
    <div class="wmn">${esc(uzShow(uz || other || ""))}</div>
    ${uz && other ? `<div class="alts">${otherLang}: ${esc(other)}</div>` : ""}
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <button class="btn" id="wplay">🔊 Tinglash</button>
      <button class="btn ${vocabHas(s, n, wi) ? "out" : ""}" id="wvoc">${vocabHas(s, n, wi) ? "✓ Lug'atimda" : "➕ Lug'atimga qo'shish"}</button></div>
    <div class="note" style="margin-top:12px">${s}-sura, ${n}-oyat, ${wi + 1}-so'z</div></div>
    <div id="wDet"><div class="loading" style="padding:14px"><div class="spinner"></div></div></div>`, () => {
    setTimeout(() => { const d = $("#wDet"); if (d) { d.innerHTML = wordDetailHtml(s, n, wi, w.text_uthmani, uz || other); bindDetail(d); } }, 30);
    $("#wplay").onclick = () => playWord(audio, w.text_uthmani);
    $("#wvoc").onclick = () => {
      const k = vKey(s, n, wi), all = vocab();
      if (all[k]) { delete all[k]; toast("Lug'atdan olib tashlandi"); }
      else { all[k] = { ar: w.text_uthmani, tl: (w.transliteration && w.transliteration.text) || "", m: uz || other || "", s, n, wi, audio, added: Date.now(), due: Date.now(), iv: 0, ef: 2.5, reps: 0, lapses: 0 }; toast("Lug'atga qo'shildi — «Lug'at» bo'limida takrorlaysiz"); }
      saveVocab(all);
      const on = !!all[k]; const b = $("#wvoc"); b.textContent = on ? "✓ Lug'atimda" : "➕ Lug'atimga qo'shish"; b.classList.toggle("out", on);
      el.classList.toggle("inv", on); updVocabBadge();
    };
    playWord(audio, w.text_uthmani);
  });
}

function showTafsir(s, n, key) {
  store.set("tafsirKey", key);
  const chips = TAFSIRS.map(t => `<button class="chip ${t[0] === key ? "on" : ""}" data-k="${t[0]}">${t[1]}</button>`).join("");
  openSheet(`<h3>${esc(SURAS[s - 1][0])}, ${n}-oyat tafsiri</h3><div class="chips" style="padding:0 0 10px">${chips}</div><div id="tf"><div class="loading"><div class="spinner"></div></div></div>`, (b) => {
    $$(".chip", b).forEach(c => c.onclick = () => showTafsir(s, n, c.dataset.k));
    getEnc(key, s).then(m => {
      const r = splitEnc(key, m[n]);
      const tf = $("#tf"); if (!tf) return;
      tf.innerHTML = r.note ? `<div class="tafsir-text">${esc(cyr2lat(r.note))}</div><div class="note" style="padding:12px 0 0">Manba: QuranEnc.com</div>`
        : `<div class="empty" style="padding:30px 10px">Bu oyat uchun ushbu manbada alohida izoh yo'q. Boshqa tafsirni tanlab ko'ring.</div>`;
    }).catch(() => { const tf = $("#tf"); if (tf) tf.innerHTML = `<div class="err">Yuklab bo'lmadi. Internetni tekshiring.</div>`; });
  });
}

function readerSettings(s) {
  const seg = (k, opts) => `<div class="seg" data-k="${k}">` + opts.map(o => `<button data-v="${o[0]}" class="${String(S[k]) === String(o[0]) ? "on" : ""}">${o[1]}</button>`).join("") + `</div>`;
  const tg = (k, l) => `<div class="set toggle"><label>${l}</label><div class="sw ${S[k] ? "on" : ""}" data-t="${k}"></div></div>`;
  openSheet(`<h3>Ko'rinish</h3>
    <div class="set"><label>Oyatga o'tish</label><div style="display:flex;gap:8px"><input class="search" id="gotoN" type="number" min="1" max="${SURAS[s - 1][2]}" placeholder="1–${SURAS[s - 1][2]}"><button class="btn" id="gotoB">O'tish</button></div></div>
    <div class="set"><label>Oraliqni takrorlash (yod olish uchun)</label>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        <input class="search" id="rFrom" type="number" min="1" value="1" style="width:72px"> –
        <input class="search" id="rTo" type="number" min="1" value="${Math.min(5, SURAS[s - 1][2])}" style="width:72px">
        <select id="rTimes" style="width:auto;flex:1">${[2, 3, 5, 7, 10, 20].map(n => `<option value="${n}" ${n === 3 ? "selected" : ""}>${n} marta</option>`).join("")}</select></div>
      <button class="btn" id="rGo" style="width:100%;margin-top:8px">▶ Takrorlashni boshlash</button>
      <div class="hint">Masalan, 1–5-oyatlar ketma-ket o'qiladi va bu guruh 3 marta aylantiriladi. Har oyatni alohida takrorlash soni Sozlamalarda.</div></div>
    <div class="set"><label>Qori ovozini telefonga yuklash</label><button class="btn out" id="dlAud" style="width:100%">⬇ Shu suraning audiosini yuklab olish</button>
      <div class="hint" id="dlAudInfo">Yuklangandan keyin internetsiz tinglanadi. Qori: ${esc((RECITERS.find(r => r[0] === S.reciter) || ["", ""])[1])}</div></div>
    <div class="set"><label>Mavzu</label>${themePicker()}</div>
    <div class="set"><label>Yozuv uslubi (xat)</label>${mushafPicker()}</div>
    ${tg("arOnly", "Faqat arabcha matn (mushaf ko'rinishi)")}
    ${tg("tajweed", "Rangli tajvid")}<div class="set" style="padding-top:0"><button class="btn out" id="tjLeg">Tajvid ranglari nimani bildiradi?</button></div>
    ${tg("wbw", "So'zma-so'z tarjima")}${tg("translit", "Talaffuz (lotincha o'qilishi)")}${tg("showTr", "Oyat tarjimasi")}
    <div class="set"><label>Arabcha harf o'lchami: <span id="arv">${S.ar}</span></label><input type="range" min="22" max="50" value="${S.ar}" id="arR"></div>
    <div class="set"><label>Tarjima harf o'lchami: <span id="trv">${S.tr}</span></label><input type="range" min="13" max="24" value="${S.tr}" id="trR"></div>
    <div class="set"><label>Tarjima</label>${seg("tr_key", TRANSLATIONS)}</div>
    <div class="set"><label>So'zma-so'z tili</label>${seg("wbwLang", [["uz", "O'zbekcha"], ["ru", "Ruscha"], ["en", "Inglizcha"]])}</div>
    <div class="set"><label>Yozuv</label>${seg("script", [["lat", "Lotin"], ["cyr", "Kirill"]])}</div>`, (b) => {
    let dirty = false;
    $$(".sw", b).forEach(x => x.onclick = () => { S[x.dataset.t] = !S[x.dataset.t]; x.classList.toggle("on"); save(); dirty = true; });
    $$(".seg", b).forEach(g => $$("button", g).forEach(x => x.onclick = () => { S[g.dataset.k] = x.dataset.v; $$("button", g).forEach(y => y.classList.toggle("on", y === x)); save(); dirty = true; }));
    $("#arR").oninput = e => { S.ar = +e.target.value; $("#arv").textContent = S.ar; applyTheme(); save(); };
    $("#trR").oninput = e => { S.tr = +e.target.value; $("#trv").textContent = S.tr; applyTheme(); save(); };
    if (!NATIVE) { const e = $("#dlAud"); if (e) e.closest(".set").remove(); } else $("#dlAud").onclick = () => downloadSuraAudio(s);
    bindMushafPicker(b, () => { dirty = true; });
    bindThemePicker(b);
    $("#tjLeg").onclick = () => { closeSheet(); setTimeout(tajweedLegend, 50); };
    $("#rGo").onclick = () => {
      const max = SURAS[s - 1][2];
      let f = Math.max(1, Math.min(max, +$("#rFrom").value || 1)), t = Math.max(1, Math.min(max, +$("#rTo").value || f));
      if (t < f) [f, t] = [t, f];
      closeSheet(); startRange(s, f, t, +$("#rTimes").value);
    };
    $("#gotoB").onclick = () => { const n = +$("#gotoN").value; if (n >= 1 && n <= SURAS[s - 1][2]) { closeSheet(); const el = $("#a" + n); if (el) view.scrollTop = el.offsetTop - 8; } };
    const obs = new MutationObserver(() => {
      if ($("#sheet").classList.contains("hidden")) { obs.disconnect(); if (dirty) { const a = topAyah(); stack[stack.length - 1].args = [s, a]; render(0); } }
    });
    obs.observe($("#sheet"), { attributes: true });
  });
}

function topAyah() {
  const els = $$(".ayah, .ma"); const st = view.scrollTop;
  for (const el of els) if (el.offsetTop + el.offsetHeight > st + 10) return +el.dataset.n;
  return 1;
}
let scrollT = 0;
view.addEventListener("scroll", () => {
  clearTimeout(scrollT);
  scrollT = setTimeout(() => {
    const top = stack[stack.length - 1];
    if (top && top.fn === vSura && $(".ayah, .ma")) store.set("last", { s: top.args[0], a: topAyah() });
  }, 400);
});

// ---------- Audio pleer ----------
const audio = $("#audio");
const player = { s: 0, a: 0, rep: 0, playing: false, range: null };
// Qori ovozi: avval telefondagi fayl, keyin bir nechta server navbat bilan
const ISLAMIC_NET = { Alafasy_128kbps: "ar.alafasy", Husary_128kbps: "ar.husary", Husary_Muallim_128kbps: "ar.husary", Minshawy_Teacher_128kbps: "ar.minshawi", Abdul_Basit_Murattal_192kbps: "ar.abdulbasitmurattal", Maher_AlMuaiqly_64kbps: "ar.mahermuaiqly", Ghamadi_40kbps: "ar.alafasy" };
const QCOM = { Alafasy_128kbps: "Alafasy/mp3", Husary_128kbps: "Husary/mp3", Husary_Muallim_128kbps: "Husary/mp3", Minshawy_Teacher_128kbps: "Minshawi/Murattal/mp3", Abdul_Basit_Murattal_192kbps: "AbdulBaset/Murattal/mp3" };
function globalAyah(s, a) { let n = 0; for (let i = 0; i < s - 1; i++) n += SURAS[i][2]; return n + a; }
const audioRel = (s, a) => `audio/${S.reciter}/${pad3(s)}${pad3(a)}.mp3`;
function ayahUrls(s, a) {
  const f = pad3(s) + pad3(a), l = [];
  if (NATIVE) { const p = Native.localPath(audioRel(s, a)); if (p) l.push(p); }
  l.push(`https://everyayah.com/data/${S.reciter}/${f}.mp3`);
  if (ISLAMIC_NET[S.reciter]) { l.push(`https://cdn.islamic.network/quran/audio/128/${ISLAMIC_NET[S.reciter]}/${globalAyah(s, a)}.mp3`); l.push(`https://cdn.islamic.network/quran/audio/64/${ISLAMIC_NET[S.reciter]}/${globalAyah(s, a)}.mp3`); }
  if (QCOM[S.reciter]) l.push(`https://verses.quran.com/${QCOM[S.reciter]}/${f}.mp3`);
  return l;
}
function markPlaying(a) {
  $$(".playing").forEach(x => x.classList.remove("playing"));
  const el = $("#a" + a);
  const top = stack[stack.length - 1];
  if (el && top && top.fn === vSura && top.args[0] === player.s) {
    el.classList.add("playing");
    if (S.autoscroll) { const r = el.getBoundingClientRect(), vr = view.getBoundingClientRect(); if (r.top < vr.top || r.bottom > vr.bottom) view.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" }); }
  }
}
function updPlayer() {
  $("#player").classList.toggle("hidden", !player.s);
  $("#plPlay").innerHTML = player.playing ? "&#9208;" : "&#9654;";
  if (player.s) {
    const r = player.range;
    $("#plInfo").textContent = `${SURAS[player.s - 1][0]} · ${player.a}-oyat` + (S.repeat > 1 ? ` · ${player.rep + 1}/${S.repeat}` : "") +
      (r ? ` · ${r.from}–${r.to}: ${r.loop + 1}/${r.times}-aylanish` : "");
  }
}
function playCur() {
  player.urls = ayahUrls(player.s, player.a); player.ui = 0;
  audio.src = player.urls[0];
  audio.play().then(() => { player.playing = true; updPlayer(); }).catch(() => {});
  markPlaying(player.a); updPlayer();
  if (NATIVE) Native.keepScreenOn(true);
}
function startPlayer(s, a) { player.s = s; player.a = a; player.rep = 0; player.range = null; playCur(); }
function startRange(s, from, to, times) { player.s = s; player.a = from; player.rep = 0; player.range = { from, to, times, loop: 0 }; playCur(); toast(`${from}–${to}-oyatlar ${times} marta takrorlanadi`); }
function stopPlayer() { audio.pause(); player.s = 0; player.range = null; player.playing = false; $$(".playing").forEach(x => x.classList.remove("playing")); updPlayer(); if (NATIVE) Native.keepScreenOn(false); }
audio.addEventListener("ended", () => {
  if (player.rep + 1 < S.repeat) { player.rep++; playCur(); return; }
  player.rep = 0;
  const r = player.range;
  if (r) {
    if (player.a < r.to) { player.a++; playCur(); }
    else if (r.loop + 1 < r.times) { r.loop++; player.a = r.from; playCur(); }
    else { stopPlayer(); toast("Takrorlash tugadi. Barakalla!"); }
    return;
  }
  if (player.a < SURAS[player.s - 1][2]) { player.a++; playCur(); }
  else { stopPlayer(); toast("Sura tugadi"); }
});
audio.addEventListener("error", () => {
  if (!player.s) return;
  if (player.urls && player.ui + 1 < player.urls.length) { player.ui++; audio.src = player.urls[player.ui]; audio.play().catch(() => {}); return; }
  toast(NATIVE ? "Audio yuklanmadi: hech bir serverga ulanib bo'lmadi. Internetni tekshiring yoki surani Wi-Fi'da yuklab oling." : FRAMED ? "Qori ovozi bu havolada ishlamaydi (xavfsizlik cheklovi). To'liq web versiyada ishlaydi." : "Audio yuklanmadi. Internetni tekshiring.");
  player.playing = false; updPlayer();
});
$("#plPlay").onclick = () => { if (player.playing) { audio.pause(); player.playing = false; } else { audio.play(); player.playing = true; } updPlayer(); };
$("#plNext").onclick = () => { if (player.a < SURAS[player.s - 1][2]) { player.a++; player.rep = 0; playCur(); } };
$("#plPrev").onclick = () => { if (player.a > 1) { player.a--; player.rep = 0; playCur(); } };
$("#plStop").onclick = stopPlayer;
$("#plInfo").onclick = () => { if (player.s) openSura(player.s, player.a); };

// ---------- Saqlanganlar ----------
const bms = () => store.get("bookmarks", []);
const isBookmarked = (s, a) => bms().some(b => b.s === s && b.a === a);
function toggleBookmark(s, a) {
  let l = bms();
  if (l.some(b => b.s === s && b.a === a)) l = l.filter(b => !(b.s === s && b.a === a));
  else {
    const t = cur && cur.tr[a] ? cyr2lat(splitEnc(S.tr_key, cur.tr[a]).main) : "";
    l.unshift({ s, a, t: t.slice(0, 120), d: Date.now() });
  }
  store.set("bookmarks", l);
}
const notes = () => store.get("notes", {});
function editNote(s, n) {
  const key = s + ":" + n, cur0 = notes()[key];
  openSheet(`<h3>${esc(SURAS[s - 1][0])}, ${n}-oyatga eslatma</h3>
    <textarea id="noteT" class="search" style="min-height:140px;resize:vertical;font-family:inherit" placeholder="Fikringiz, savolingiz yoki ustozdan eshitgan izoh...">${esc(cur0 ? cur0.t : "")}</textarea>
    <div style="display:flex;gap:8px;margin-top:10px"><button class="btn" id="noteS" style="flex:1">Saqlash</button>${cur0 ? `<button class="btn out" id="noteD">O'chirish</button>` : ""}</div>`, () => {
    const done = () => { closeSheet(); const top = stack[stack.length - 1]; if (top.fn === vSura) { top.args = [s, n]; render(0); } else render(view.scrollTop); };
    $("#noteS").onclick = () => {
      const t = $("#noteT").value.trim(), all = notes();
      if (t) all[key] = { t, d: Date.now() }; else delete all[key];
      store.set("notes", all); toast(t ? "Eslatma saqlandi" : "Eslatma o'chirildi"); done();
    };
    const d = $("#noteD"); if (d) d.onclick = () => { const all = notes(); delete all[key]; store.set("notes", all); toast("Eslatma o'chirildi"); done(); };
  });
}
let savedTab = "bm";
function vSaved() {
  setTitle("Saqlanganlar", false);
  const chips = `<div class="chips" style="padding-top:10px"><button class="chip ${savedTab === "bm" ? "on" : ""}" data-t="bm">☆ Xatcho'plar</button><button class="chip ${savedTab === "nt" ? "on" : ""}" data-t="nt">✎ Eslatmalar</button></div>`;
  let body;
  if (savedTab === "bm") {
    const l = bms();
    body = !l.length ? `<div class="empty">Hozircha saqlangan oyat yo'q.<br>Oyat yonidagi ☆ belgisini bosib saqlang.</div>` :
      `<div class="card">` + l.map((b, i) => `<div class="row" data-s="${b.s}" data-a="${b.a}"><div class="num">${b.a}</div><div class="rmain">
      <div class="rtitle">${esc(SURAS[b.s - 1][0])}, ${b.a}-oyat</div><div class="rsub">${esc(b.t)}${b.t.length >= 120 ? "…" : ""}</div></div>
      <button class="iconbtn" data-del="${i}" style="color:var(--muted)">✕</button></div>`).join("") + `</div>`;
  } else {
    const all = notes(), ks = Object.keys(all).sort((a, b) => all[b].d - all[a].d);
    body = !ks.length ? `<div class="empty">Hozircha eslatma yo'q.<br>Oyat yonidagi ✎ belgisini bosib yozing.</div>` :
      `<div class="card">` + ks.map(k => { const [s, a] = k.split(":"); return `<div class="row" data-s="${s}" data-a="${a}"><div class="num">${a}</div><div class="rmain">
      <div class="rtitle">${esc(SURAS[s - 1][0])}, ${a}-oyat</div><div class="rsub" style="white-space:pre-wrap">${esc(all[k].t)}</div></div></div>`; }).join("") + `</div>`;
  }
  view.innerHTML = chips + body;
  $$(".chip[data-t]", view).forEach(c => c.onclick = () => { savedTab = c.dataset.t; render(0); });
  $$(".row", view).forEach(r => r.onclick = (e) => {
    const d = e.target.closest("[data-del]");
    if (d) { const x = bms(); x.splice(+d.dataset.del, 1); store.set("bookmarks", x); render(view.scrollTop); return; }
    openSura(+r.dataset.s, +r.dataset.a);
  });
}

// ---------- Qidiruv ----------
const AR_STRIP = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
// Qidiruv uchun soddalashtirish: harakatlar, alif va hamza shakllari olib tashlanadi (Usmoniy imlo farqlari uchun)
const normAr = t => String(t || "").replace(AR_STRIP, "").replace(/[أإآٱاءٰ]/g, "").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/\s+/g, " ").trim();
const normLat = t => String(t || "").toLowerCase().replace(/[‘’'`ʻʼ]/g, "");
let searchQ = "", searchSeq = 0;
function vSearch() {
  setTitle("Qidiruv", true);
  view.innerHTML = `<div class="pad"><div style="display:flex;gap:8px"><input class="search" id="sq" placeholder="So'z yoki ibora: masalan, sabr, جنة" value="${esc(searchQ)}"><button class="btn" id="sgo">🔍</button></div>
    <div class="note" style="padding:6px 2px 0">Tarjimadan (lotin yoki kirill) yoki arabcha matndan qidiradi. Birinchi qidiruvda barcha suralar internetdan yuklanadi.</div></div>
    <div id="sres"></div>`;
  const go = () => { searchQ = $("#sq").value.trim(); if (searchQ.length >= 2) doSearch(searchQ); };
  $("#sgo").onclick = go;
  $("#sq").onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); $("#sq").blur(); go(); } };
  if (searchQ.length >= 2) doSearch(searchQ); else setTimeout(() => $("#sq").focus(), 100);
}
function doSearch(q) {
  const my = ++searchSeq;
  const isAr = /[\u0600-\u06FF]/.test(q);
  const qn = isAr ? normAr(q) : normLat(q);
  const res = []; let done = 0, next = 1, fail = 0;
  const box = $("#sres");
  const draw = () => {
    if (my !== searchSeq || !$("#sres")) return;
    const head = done < 114 ? `<div class="note"><div class="progress"><div style="width:${done / 114 * 100}%"></div></div>Qidirilmoqda: ${done}/114 sura</div>` :
      `<div class="note">${res.length ? `${res.length} ta oyat topildi${res.length >= 300 ? " (birinchi 300 tasi)" : ""}` : "Hech narsa topilmadi"}${fail ? ` · ${fail} ta sura yuklanmadi` : ""}</div>`;
    $("#sres").innerHTML = head + (res.length ? `<div class="card">` + res.slice().sort((a, b) => a.s - b.s || a.a - b.a).slice(0, 300).map(r =>
      `<div class="row" data-s="${r.s}" data-a="${r.a}"><div class="num">${r.a}</div><div class="rmain"><div class="rtitle">${esc(SURAS[r.s - 1][0])}, ${r.a}-oyat</div>
      <div class="rsub ${isAr ? "rar" : ""}" style="${isAr ? "font-size:20px" : ""}">${esc(r.t)}</div></div></div>`).join("") + `</div>` : "");
    $$("#sres .row").forEach(r => r.onclick = () => openSura(+r.dataset.s, +r.dataset.a));
  };
  const snip = (t, idx, len) => { const a = Math.max(0, idx - 50); return (a > 0 ? "…" : "") + t.slice(a, idx + len + 70) + (idx + len + 70 < t.length ? "…" : ""); };
  const worker = () => {
    if (next > 114 || my !== searchSeq) return Promise.resolve();
    const s = next++;
    if (isAr) {
      (QDATA[s - 1] || []).forEach((r, i) => { if (res.length < 300) { const t = r[0].replace(/\|/g, " "); if (normAr(t).includes(qn)) res.push({ s, a: i + 1, t }); } });
      done++; if (done % 6 === 0 || done === 114) draw(); return Promise.resolve().then(worker);
    }
    return getEnc(S.tr_key, s).then(m => {
      Object.keys(m).forEach(k => {
        if (res.length >= 300) return;
        const r = m[k];
        if (isAr) { const t = normAr(r.arabic_text); if (t.includes(qn)) res.push({ s, a: +k, t: r.arabic_text }); }
        else {
          const raw = splitEnc(S.tr_key, r).main, lat = cyr2lat(raw);
          const ln = normLat(lat), cn = normLat(raw);
          let i = ln.indexOf(qn), src = lat;
          if (i < 0) { i = cn.indexOf(qn); src = raw; }
          if (i >= 0) res.push({ s, a: +k, t: snip(src, i, qn.length) });
        }
      });
    }).catch(() => { fail++; }).then(() => { done++; if (done % 6 === 0 || done === 114) draw(); return worker(); });
  };
  draw();
  Promise.all([worker(), worker(), worker(), worker()]).then(draw);
}

// ---------- O'rganish bo'limi ----------
const LESSONS = [
  ["ا", "1. Arab alifbosi", "28 ta harf, ularning nomi, shakllari va talaffuzi", () => push(vAlphabet)],
  ["بَ", "2. Harakatlar", "Zabar, zer, pesh, sukun, tanvin, shadda, madd", () => push(vHarakat)],
  ["بَا", "3. Bo'g'inlar mashqi", "Harflarni harakat bilan qo'shib o'qish", () => push(vDrill)],
  ["؟", "4. Harflarni tanish — test", "O'zingizni sinab ko'ring", () => push(vQuiz)],
  ["ن", "5. Tajvid qoidalari", "To'g'ri va chiroyli o'qish qoidalari", () => push(vTajweed)],
  ["١", "6. Qisqa suralarni yod olish", "O'rgatuvchi qori bilan, takrorlab", () => push(vMemorize)]
];
function vLearn() {
  setTitle("O'rganish", false);
  view.innerHTML = `<div class="hero"><h3>O'qishni o'rganish yo'li</h3><div class="big">Alifbo → Harakatlar → Bo'g'inlar → Tajvid → Suralar</div>
    <div class="note" style="color:#e6f3ee;padding:6px 0 0">Har kuni 15–20 daqiqa shug'ullaning. Imkon bo'lsa, ustoz yoki imomga o'qib bering — Qur'onni eshitib, takrorlab o'rganish eng to'g'ri yo'l.</div></div>
    <div class="card">` + LESSONS.map((l, i) => `<div class="row" data-i="${i}"><div class="lesson-ic">${l[0]}</div><div class="rmain"><div class="rtitle">${l[1]}</div><div class="rsub">${l[2]}</div></div><span style="color:var(--muted)">›</span></div>`).join("") + `</div>`;
  $$(".row", view).forEach(r => r.onclick = () => LESSONS[+r.dataset.i][3]());
}

const AR_NAMES = ["أَلِف","بَاء","تَاء","ثَاء","جِيم","حَاء","خَاء","دَال","ذَال","رَاء","زَاي","سِين","شِين","صَاد","ضَاد","طَاء","ظَاء","عَيْن","غَيْن","فَاء","قَاف","كَاف","لَام","مِيم","نُون","هَاء","وَاو","يَاء","هَمْزَة"];
function vAlphabet() {
  setTitle("Arab alifbosi", true);
  view.innerHTML = `<div class="note" style="padding-top:12px">Arab yozuvi o'ngdan chapga yoziladi va o'qiladi. Harflar so'z ichida qo'shilib yoziladi, shuning uchun bitta harfning 4 tagacha shakli bor. Harfni bosing — shakllari va talaffuzini ko'rasiz.</div>
    <div class="grid" dir="rtl">` + LETTERS.map((l, i) => `<div class="lt" data-i="${i}"><div class="l">${l[0]}</div><div class="n">${l[1]}</div></div>`).join("") + `</div>`;
  $$(".lt", view).forEach(x => x.onclick = () => letterSheet(+x.dataset.i));
}
function letterSheet(i) {
  const [ch, name, how, conn] = LETTERS[i];
  const Z = "‍";
  let forms;
  if (ch === "ء") forms = [[ch, "Yakka"]];
  else if (!conn) forms = [[ch, "Yakka"], [ch, "Boshida"], [Z + ch, "O'rtada"], [Z + ch, "Oxirida"]];
  else forms = [[ch, "Yakka"], [ch + Z, "Boshida"], [Z + ch + Z, "O'rtada"], [Z + ch, "Oxirida"]];
  const ex = ["َ", "ِ", "ُ"].map(hk => ch === "ا" ? "أ" + hk : ch + hk);
  openSheet(`<div class="word-pop"><div class="wbig">${ch}</div><div class="wmn">${name} <span class="arx">${AR_NAMES[i]}</span></div></div>
    <div class="forms">${forms.map(f => `<div><div class="f">${f[0]}</div><div class="c">${f[1]}</div></div>`).join("")}</div>
    <div class="lesson-p" style="padding:0 0 12px">${esc(how)}${!conn && ch !== "ء" ? "<br><i>Bu harf o'zidan keyingi harfga ulanmaydi.</i>" : ""}</div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <button class="btn" id="sayName">🔊 Nomi</button>
      ${ex.map((e, k) => `<button class="btn out sayEx" data-t="${e}"><span class="arx">${e}</span> ${["a", "i", "u"][k]}</button>`).join("")}
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:16px">
      <button class="btn out" id="prevL" ${i === 0 ? "disabled" : ""}>← Oldingi</button><button class="btn out" id="nextL" ${i === LETTERS.length - 1 ? "disabled" : ""}>Keyingi →</button></div>`, (b) => {
    $("#sayName").onclick = () => speak(AR_NAMES[i]);
    $$(".sayEx", b).forEach(x => x.onclick = () => speak(x.dataset.t));
    $("#prevL").onclick = () => i > 0 && letterSheet(i - 1);
    $("#nextL").onclick = () => i < LETTERS.length - 1 && letterSheet(i + 1);
    speak(AR_NAMES[i]);
  });
}

function vHarakat() {
  setTitle("Harakatlar", true);
  view.innerHTML = `<div class="note" style="padding-top:12px">Arab yozuvida qisqa unlilar harf ustiga yoki ostiga qo'yiladigan belgilar — <b>harakatlar</b> bilan ko'rsatiladi. Misolni bosing — ovozini eshitasiz.</div>
    <div class="card">` + HARAKAT.map(h => `<div class="hrow"><div class="hx" data-t="${h[3]}">${h[3]}</div><div class="rmain"><div class="rtitle">${h[1]} <span class="arx">ـ${h[0]}</span></div>
      <div class="rsub">${h[2]} O'qilishi: <b>${h[4]}</b></div></div></div>`).join("") + `</div>
    <div class="pad" style="padding-bottom:0"><b>Cho'ziq unlilar (madd harflari)</b></div>
    <div class="card">` + MADD_EXAMPLES.map(m => `<div class="hrow"><div class="hx" data-t="${m[0]}">${m[0]}</div><div class="rmain"><div class="rtitle">${m[1]}</div><div class="rsub">${m[2]} (2 harakat)</div></div></div>`).join("") + `</div>`;
  $$(".hx", view).forEach(x => x.onclick = () => speak(x.dataset.t));
}

let drillH = 0;
function vDrill() {
  setTitle("Bo'g'inlar mashqi", true);
  const H = [["َ", "zabar (a)"], ["ِ", "zer (i)"], ["ُ", "pesh (u)"], ["ً", "tanvin (an)"], ["ٍ", "tanvin (in)"], ["ٌ", "tanvin (un)"], ["ْ", "sukun"], ["َا", "cho'ziq aa"], ["ِي", "cho'ziq ii"], ["ُو", "cho'ziq uu"]];
  const letters = LETTERS.filter(l => l[0] !== "ء");
  const lat = { "Alif": "'", "Bo": "b", "To": "t", "So": "s", "Jim": "j", "Ha": "h", "Xo": "x", "Dol": "d", "Zol": "z", "Ro": "r", "Zay": "z", "Sin": "s", "Shin": "sh", "Sod": "s", "Zod": "z", "Zo": "z", "Ayn": "'", "G'ayn": "g'", "Fa": "f", "Qof": "q", "Kof": "k", "Lom": "l", "Mim": "m", "Nun": "n", "Vov": "v", "Yo": "y" };
  const vow = ["a", "i", "u", "an", "in", "un", "", "aa", "ii", "uu"][drillH];
  view.innerHTML = `<div class="note" style="padding-top:12px">Harakatni tanlang, so'ng bo'g'inni bosib eshiting va ovoz chiqarib takrorlang.</div>
    <div class="chips">` + H.map((h, i) => `<button class="chip ${i === drillH ? "on" : ""}" data-h="${i}"><span class="arx">ـ${h[0]}</span> ${h[1]}</button>`).join("") + `</div>
    <div class="drill" dir="rtl">` + letters.map(l => {
      const base = l[0] === "ا" ? "أ" : l[0];
      const t = drillH === 6 ? "أَ" + base + "ْ" : base + H[drillH][0];
      const r = drillH === 6 ? "a" + (lat[l[1]] || "") : (lat[l[1]] || "") + vow;
      return `<div class="lt" data-t="${t}"><div class="l">${t}</div><div class="n">${r}</div></div>`;
    }).join("") + `</div>`;
  $$(".chip[data-h]", view).forEach(c => c.onclick = () => { drillH = +c.dataset.h; render(0); });
  $$(".lt", view).forEach(x => x.onclick = () => speak(x.dataset.t));
}

let quiz = { score: 0, total: 0 };
function vQuiz() {
  setTitle("Harflarni tanish", true);
  const pool = LETTERS.slice(0, 28);
  const ans = pool[Math.floor(Math.random() * pool.length)];
  const opts = [ans];
  while (opts.length < 4) { const x = pool[Math.floor(Math.random() * pool.length)]; if (!opts.includes(x) && x[1] !== ans[1]) opts.push(x); }
  opts.sort(() => Math.random() - .5);
  view.innerHTML = `<div class="score">To'g'ri javoblar: ${quiz.score} / ${quiz.total}</div>
    <div class="quiz-q">${ans[0]}</div><div class="note" style="text-align:center">Bu qaysi harf?</div>
    <div class="quiz-opts">` + opts.map(o => `<button data-n="${esc(o[1])}">${esc(o[1])}</button>`).join("") + `</div>
    <div class="pad" style="text-align:center"><button class="btn out" id="qReset">Hisobni nolga tushirish</button></div>`;
  let done = false;
  $$(".quiz-opts button", view).forEach(b => b.onclick = () => {
    if (done) return; done = true; quiz.total++;
    if (b.dataset.n === ans[1]) { quiz.score++; b.classList.add("ok"); }
    else { b.classList.add("bad"); $$(".quiz-opts button", view).forEach(x => { if (x.dataset.n === ans[1]) x.classList.add("ok"); }); }
    speak(AR_NAMES[LETTERS.indexOf(ans)]);
    setTimeout(() => { if (stack[stack.length - 1].fn === vQuiz) render(0); }, 1200);
  });
  $("#qReset").onclick = () => { quiz = { score: 0, total: 0 }; render(0); };
}

const TJ_LEGEND = [
  ["ghunnah", "G'unna (2 harakat burundan)"], ["ikhafa", "Ixfo (nunni yashirish)"], ["ikhafa_shafawi", "Ixfo shafaviy (mim + ب)"],
  ["iqlab", "Iqlob (nun → mim)"], ["idgham_ghunnah", "Idg'om g'unna bilan"], ["idgham_wo_ghunnah", "Idg'om g'unnasiz"],
  ["idgham_shafawi", "Idg'om shafaviy (mim + م)"], ["qalaqah", "Qalqala"], ["madda_normal", "Tabiiy madd (2)"],
  ["madda_permissible", "Joiz madd (2, 4, 5)"], ["madda_obligatory", "Vojib madd (4–5)"], ["madda_necessary", "Lozim madd (6)"],
  ["ham_wasl", "Hamzai vasl / o'qilmaydigan harf"]
];
function tajweedLegend() {
  openSheet(`<h3>Rangli tajvid belgilari</h3><div class="note" style="padding:0 0 8px">Qur'on matnidagi rangli harflar qaysi tajvid qoidasi bilan o'qilishini ko'rsatadi.</div>` +
    TJ_LEGEND.map(l => `<div class="hrow" style="padding:9px 2px"><span class="tjdot tj-bg-${l[0]}"></span><div class="rmain">${l[1]}</div></div>`).join("") +
    `<div class="note" style="padding:10px 0 0">Ranglar Quran.com tajvid belgilashi asosida, ilova ichida saqlangan. Qoidalar tafsiloti: O'rganish → Tajvid qoidalari.</div>`);
}
function vTajweed() {
  setTitle("Tajvid qoidalari", true);
  view.innerHTML = `<div class="note" style="padding-top:12px">Tajvid — Qur'onni har bir harfning haqqini berib, to'g'ri va chiroyli o'qish ilmi. Mavzuni bosing.</div>
    <div class="pad" style="padding-bottom:0"><button class="btn out" id="tjL" style="width:100%">🎨 Rangli tajvid belgilari</button></div>
    <div class="card">` + TAJWEED.map((t, i) => `<div class="row" data-i="${i}"><div class="lesson-ic">${i + 1}</div><div class="rmain"><div class="rtitle">${t.t}</div></div><span style="color:var(--muted)">›</span></div>`).join("") + `</div>`;
  $("#tjL").onclick = tajweedLegend;
  $$(".row", view).forEach(r => r.onclick = () => {
    const t = TAJWEED[+r.dataset.i];
    openSheet(`<h3>${t.t}</h3>` + t.p.map(p => `<p class="lesson-p" style="padding:0">${p}</p>`).join(""), (b) => {
      $$(".arx", b).forEach(x => { x.style.cursor = "pointer"; x.onclick = () => speak(x.textContent); });
    });
  });
}

function vMemorize() {
  setTitle("Qisqa suralarni yod olish", true);
  view.innerHTML = `<div class="card"><div class="lesson-p" style="padding:14px">
    <b>Qanday yod olish kerak:</b><br>
    1. Avval oyatning so'zma-so'z ma'nosini o'qing — nima haqida ekanini tushuning.<br>
    2. O'rgatuvchi qorini tinglang (u har oyatni sekin, aniq o'qiydi).<br>
    3. Har oyatni 3–5 marta eshitib, ovoz chiqarib takrorlang.<br>
    4. Keyin ko'rmasdan o'qib ko'ring, so'ng keyingi oyatga o'ting.<br>
    5. Har kuni avval yod olganlaringizni bir marta takrorlang.</div>
    <div class="pad" style="padding-top:0"><button class="btn" id="learnMode" style="width:100%">✓ O'rganish rejimini yoqish</button>
    <div class="note" style="padding:6px 0 0">O'rgatuvchi qori (Husoriy), har oyat 3 martadan takror, so'zma-so'z tarjima va talaffuz yoqiladi.</div></div></div>
    <div class="card">` + SHORT_SURAS.map(i => { const s = SURAS[i - 1]; return `<div class="row" data-s="${i}"><div class="num">${i}</div><div class="rmain"><div class="rtitle">${esc(s[0])}</div><div class="rsub">${s[2]} oyat</div></div><div class="rar">${s[1]}</div></div>`; }).join("") + `</div>`;
  $("#learnMode").onclick = () => { Object.assign(S, { reciter: "Husary_Muallim_128kbps", repeat: 3, wbw: true, translit: true, wbwLang: "uz" }); save(); toast("O'rganish rejimi yoqildi"); };
  $$(".row[data-s]", view).forEach(r => r.onclick = () => openSura(+r.dataset.s));
}

// ---------- Sozlamalar ----------
function vSettings() {
  setTitle("Sozlamalar", false);
  const seg = (k, opts) => `<div class="seg" data-k="${k}">` + opts.map(o => `<button data-v="${o[0]}" class="${String(S[k]) === String(o[0]) ? "on" : ""}">${o[1]}</button>`).join("") + `</div>`;
  const tg = (k, l, hint) => `<div class="set"><div class="toggle"><label>${l}</label><div class="sw ${S[k] ? "on" : ""}" data-t="${k}"></div></div>${hint ? `<div class="hint">${hint}</div>` : ""}</div>`;
  view.innerHTML = `<div class="card">
    <div class="set"><label>Mavzu (fon va ranglar)</label>${themePicker()}</div>
    <div class="set"><label>Arabcha harf o'lchami: <span id="arv">${S.ar}</span></label><input type="range" min="22" max="50" value="${S.ar}" id="arR">
      <div class="ar-line" id="arPrev" style="text-align:center">بِسْمِ ٱللَّهِ</div></div>
    <div class="set"><label>Tarjima harf o'lchami: <span id="trv">${S.tr}</span></label><input type="range" min="13" max="24" value="${S.tr}" id="trR"></div>
    <div class="set"><label>Tarjima yozuvi</label>${seg("script", [["lat", "Lotin"], ["cyr", "Kirill"]])}</div></div>
  <div class="card"><div class="set"><label>Arabcha yozuv uslubi (xat)</label>${mushafPicker()}</div>
    ${tg("arOnly", "Faqat arabcha matn (mushaf ko'rinishi)", "Tarjima va so'zma-so'zsiz, uzluksiz o'qish uchun. O'qish oynasidagi «ع» tugmasi ham shu.")}</div>
  <div class="card">
    <div class="set"><label>Asosiy tarjima</label><select id="trSel">${TRANSLATIONS.map(t => `<option value="${t[0]}" ${S.tr_key === t[0] ? "selected" : ""}>${t[1]}</option>`).join("")}</select></div>
    ${tg("tajweed", "Rangli tajvid", "Tajvid qoidalari harflarda rang bilan ko'rsatiladi")}
    ${tg("showTr", "Oyat tarjimasini ko'rsatish")}
    ${tg("wbw", "So'zma-so'z tarjima", "Har bir arabcha so'z ostida uning ma'nosi")}
    ${tg("translit", "Talaffuz", "So'zning lotincha o'qilishi")}
    <div class="set"><label>So'zma-so'z tili</label>${seg("wbwLang", [["uz", "O'zbekcha"], ["ru", "Ruscha"], ["en", "Inglizcha"]])}
      <div class="hint">O'zbekcha ma'nosi hali tayyor bo'lmagan so'zlar uchun quyidagi til ishlatiladi:</div>
      <div style="margin-top:8px">${seg("wbwFallback", [["ru", "Ruscha"], ["en", "Inglizcha"]])}</div></div></div>
  <div class="card">
    <div class="set"><label>Qori</label><select id="recSel">${RECITERS.map(r => `<option value="${r[0]}" ${S.reciter === r[0] ? "selected" : ""}>${r[1]}</option>`).join("")}</select></div>
    <div class="set"><label>Har oyatni takrorlash</label>${seg("repeat", [[1, "1"], [2, "2"], [3, "3"], [5, "5"], [10, "10"]])}</div>
    ${tg("autoscroll", "Tinglayotganda oyatga avtomatik o'tish")}</div>
  <div class="card">
    <div class="set"><label>Kunlik maqsad (takrorlangan so'zlar)</label>${seg("goal", [[5, "5"], [10, "10"], [20, "20"], [30, "30"], [50, "50"]])}</div>
    <div class="set"><div class="toggle"><label>Kunlik eslatma</label><div class="sw ${S.remOn ? "on" : ""}" id="remSw"></div></div>
      <div style="display:flex;gap:8px;align-items:center;margin-top:8px"><span>Vaqti:</span><input type="time" id="remT" class="search" value="${esc(S.remTime)}" style="width:130px"><button class="btn out" id="remTest">Sinab ko'rish</button></div>
      <div class="hint">Belgilangan vaqtda "Bugun N ta so'z takrorlash kerak" degan bildirishnoma keladi.</div></div>
    <div class="set"><label>Zaxira nusxa</label><div class="hint" style="margin:0 0 8px">Lug'at, eslatmalar, saqlangan oyatlar, kunlik natijalar va sozlamalar bitta faylga saqlanadi. Uni Telegram yoki Google Drive'ga yuborib qo'ying — telefon almashtirsangiz tiklaysiz.</div>
      <div style="display:flex;gap:8px"><button class="btn" id="bkSave" style="flex:1">💾 Saqlash</button><button class="btn out" id="bkLoad" style="flex:1">📂 Tiklash</button></div></div></div>
  <div class="card">
    <div class="set"><label>Internetsiz o'qish</label>
      <div class="hint">Ochilgan suralar telefonda saqlanadi. Hammasini birdaniga yuklab olish mumkin (audio bundan mustasno).</div>
      <button class="btn" id="dlAll" style="margin-top:10px;width:100%">Barcha suralarni yuklab olish</button>
      <div class="progress hidden" id="dlProg"><div style="width:0"></div></div><div class="hint" id="dlInfo"></div></div>
    <div class="set"><label>Saqlangan ma'lumotlar: <span id="cSize">${NATIVE ? Native.cacheSize() : "-"}</span></label><button class="btn out" id="clr">Keshni tozalash</button></div></div>
  <div class="foot">Qur'on O'rgan: so'zma-so'z — web v2.3<br>Arabcha matn va so'zlar ma'lumoti: Quran.com · O'zbekcha tarjimalar va tafsir: QuranEnc.com, fawazahmed0/quran-api (Muhammad Sodiq Muhammad Yusuf, Alouddin Mansur, Ruvvod markazi) · Audio: EveryAyah.com.<br>O'zbekcha so'zma-so'z ma'nolar yordamchi vosita sifatida tayyorlangan; aniq ma'no uchun to'liq tarjima va tafsirga tayaning.</div>`;
  $$(".sw", view).forEach(x => x.onclick = () => { S[x.dataset.t] = !S[x.dataset.t]; x.classList.toggle("on"); save(); });
  $$(".seg", view).forEach(g => $$("button", g).forEach(x => x.onclick = () => {
    const k = g.dataset.k; S[k] = (k === "repeat" || k === "goal") ? +x.dataset.v : x.dataset.v; if (k === "goal") syncNative();
    $$("button", g).forEach(y => y.classList.toggle("on", y === x)); save(); if (k === "theme") applyTheme();
  }));
  $("#arR").oninput = e => { S.ar = +e.target.value; $("#arv").textContent = S.ar; applyTheme(); save(); };
  $("#trR").oninput = e => { S.tr = +e.target.value; $("#trv").textContent = S.tr; applyTheme(); save(); };
  bindMushafPicker(view);
  bindThemePicker(view);
  $("#trSel").onchange = e => { S.tr_key = e.target.value; save(); };
  $("#recSel").onchange = e => { S.reciter = e.target.value; save(); };
  $("#clr").onclick = () => { if (NATIVE) { Native.clearCache(); $("#cSize").textContent = Native.cacheSize(); } for (const k in memo) delete memo[k]; toast("Kesh tozalandi"); };
  $("#dlAll").onclick = downloadAll;
  $("#remSw").onclick = () => { S.remOn = !S.remOn; $("#remSw").classList.toggle("on", S.remOn); save(); applyReminder(); toast(S.remOn ? `Eslatma yoqildi: har kuni ${S.remTime}` : "Eslatma o'chirildi"); };
  $("#remT").onchange = (e) => { S.remTime = e.target.value || "20:00"; save(); applyReminder(); };
  $("#remTest").onclick = () => { syncNative(); if (NATIVE && Native.testReminder) Native.testReminder(); else toast("Faqat telefonda"); };
  if (!NATIVE) ["#remSw", "#dlAll", "#clr"].forEach(q => { const e = $(q); const c = e && e.closest(".set"); if (c) c.remove(); });
  if ($("#bkSave")) $("#bkSave").onclick = doBackup;
  $("#bkLoad").onclick = doRestore;
}

// Bitta suraning audio fayllarini telefonga saqlash
let audBusy = false;
function nativeDownload(url, rel) {
  return new Promise((res, rej) => { const id = "d" + (++cbSeq); cbs[id] = { res, rej }; Native.download(url, rel, id); });
}
function downloadSuraAudio(s) {
  if (!NATIVE) { toast("Faqat telefonda ishlaydi"); return; }
  if (audBusy) { toast("Yuklash davom etmoqda..."); return; }
  audBusy = true;
  const n = SURAS[s - 1][2]; let done = 0, fail = 0, a = 1;
  const info = () => { const el = $("#dlAudInfo"); if (el) el.textContent = `Yuklanmoqda: ${done}/${n}` + (fail ? ` · ${fail} ta xato` : ""); };
  const one = (ai) => {
    const rel = audioRel(s, ai);
    if (Native.localPath(rel)) return Promise.resolve();
    const urls = ayahUrls(s, ai).filter(u => /^https/.test(u));
    const tryAt = (k) => k >= urls.length ? Promise.reject() : nativeDownload(urls[k], rel).catch(() => tryAt(k + 1));
    return tryAt(0);
  };
  const worker = () => { if (a > n) return Promise.resolve(); const ai = a++; return one(ai).catch(() => fail++).then(() => { done++; info(); return worker(); }); };
  info();
  Promise.all([worker(), worker(), worker()]).then(() => {
    audBusy = false;
    toast(fail ? `${SURAS[s - 1][0]}: ${n - fail}/${n} oyat yuklandi` : `${SURAS[s - 1][0]} audiosi yuklandi — endi internetsiz tinglanadi`);
    const el = $("#dlAudInfo"); if (el) el.textContent = fail ? `${n - fail}/${n} yuklandi. Qolganini qayta urinib ko'ring.` : "Yuklandi ✓";
  });
}

let dlBusy = false;
function downloadAll() {
  if (dlBusy) return; dlBusy = true;
  const lang = S.wbwLang === "uz" ? S.wbwFallback : S.wbwLang;
  let done = 0, fail = 0, next = 1;
  const prog = $("#dlProg"); prog.classList.remove("hidden");
  const upd = () => { const p = $("#dlProg div"); if (p) p.style.width = (done / 114 * 100) + "%"; const i = $("#dlInfo"); if (i) i.textContent = `${done} / 114 sura` + (fail ? ` · ${fail} ta xato` : ""); };
  const worker = () => {
    if (next > 114) return Promise.resolve();
    const s = next++;
    return Promise.all([getEnc(S.tr_key, s), getEnc("uzbek_mokhtasar", s)])
      .catch(() => { fail++; }).then(() => { done++; upd(); return worker(); });
  };
  Promise.all([worker(), worker(), worker()]).then(() => {
    dlBusy = false; toast(fail ? "Yuklash tugadi, ba'zilari xato bilan" : "Barcha suralar yuklandi");
    const c = $("#cSize"); if (c && NATIVE) c.textContent = Native.cacheSize();
  });
}

// ---------- Ishga tushirish ----------
applyTheme();
goTab("quran");
updVocabBadge();
setInterval(updVocabBadge, 60000);
syncNative(); if (S.remOn) applyReminder();
})();
