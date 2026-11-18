/* ====== PENGATURAN ====== */
const SCRIPT_URL = "PASTE_URL_WEB_APP_APPS_SCRIPT_DI_SINI";
const DRIVERS = ["Sandi Suhendra", "Topa"]; // ganti dengan nama driver
const Q = [
  ["KEPATUHAN DRIVER TERHADAP ATURAN LALU LINTAS", "Rambu, batas kecepatan, dan sikap ke pengguna jalan lain"],
  ["KETEPATAN WAKTU", "Berangkat dan tiba sesuai jadwal"],
  ["KESELAMATAN & KENYAMANAN BERKENDARA", "Pengereman, kecepatan, dan gaya mengemudi"],
  ["SIKAP & KERAMAHAN DRIVER", "Sopan, membantu, dan komunikatif"],
  ["KEBERSIHAN KENDARAAN", "Kondisi interior dan eksterior mobil"],
  ["KESIAPAN & KONDISI KENDARAAN", "AC, ban, lampu, dan kelayakan mobil"],
  ["KOMUNIKASI & KONFIRMASI JADWAL", "Konfirmasi rute, jadwal, dan info keterlambatan"]
];
const QUICK = ["Drivernya ramah banget 👍", "Mobil bersih dan wangi ✨", "Perlu lebih tepat waktu ⏰", "Mobil kurang enak", "Nyetirnya nyaman 😌"];
const LEVELS = ["Sangat Kurang", "Kurang", "Cukup", "Baik", "Sangat Baik"];
const BAD = ["Waduh, segitu parahnya? 😱", "Aduh, maaf ya! Kami perbaiki 🙏", "Yah… ceritain di komentar dong 😢"];
const GOOD = ["WOW! Juara banget! 🏆", "Mantap jiwa! 🔥", "Driver terbaik sejagat! 🌟", "Yeay! Bikin dia terbang ✨"];
/* ======================== */

const $ = s => document.querySelector(s);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const hueOf = v => v < .5 ? lerp(8, 48, v / .5) : lerp(48, 135, (v - .5) / .5);
const root = document.documentElement;
const setHue = h => root.style.setProperty("--h", h.toFixed(1));

/* ---------- wajah SVG yang berubah halus ---------- */
function Face(host) {
  host.innerHTML = '<svg viewBox="0 0 200 200"><circle class="fc" cx="100" cy="100" r="92"/>' +
    '<ellipse cx="70" cy="45" rx="38" ry="16" fill="#fff" opacity=".2" transform="rotate(-20 70 45)"/>' +
    '<ellipse class="ch" cx="48" cy="120" rx="15" ry="9" fill="#ff6b81"/><ellipse class="ch" cx="152" cy="120" rx="15" ry="9" fill="#ff6b81"/>' +
    '<circle class="ey" cx="70" cy="86" r="10" fill="#2b2118"/><circle class="ey" cx="130" cy="86" r="10" fill="#2b2118"/>' +
    '<ellipse class="lid" cx="70" rx="16" ry="13"/><ellipse class="lid" cx="130" rx="16" ry="13"/>' +
    '<line class="br" stroke="#2b2118" stroke-width="6" stroke-linecap="round"/><line class="br" stroke="#2b2118" stroke-width="6" stroke-linecap="round"/>' +
    '<path class="tear" d="M58 100q-7 13 0 17q7-4 0-17z" fill="#59b8ff"/>' +
    '<path class="mf" fill="#7a1f2b"/><path class="mo" fill="none" stroke="#2b2118" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const a = s => host.querySelectorAll(s), fc = a(".fc")[0], lids = a(".lid"), ch = a(".ch"), br = a(".br"),
        mo = a(".mo")[0], mf = a(".mf")[0], tear = a(".tear")[0], fi = host;
  return function (v) {
    const h = hueOf(v), col = "hsl(" + h + " 88% 60%)";
    fc.setAttribute("fill", col);
    lids.forEach(l => { l.setAttribute("fill", col); l.setAttribute("cy", 110 - 17 * clamp((v - .7) / .3)); });
    const tilt = v < .25 ? lerp(10, -8, v / .25) : v < .5 ? lerp(-8, 0, (v - .25) / .25) : 0, by = 66 - Math.max(0, v - .5) * 12;
    br[0].setAttribute("x1", 46); br[0].setAttribute("y1", by); br[0].setAttribute("x2", 90); br[0].setAttribute("y2", by + tilt);
    br[1].setAttribute("x1", 110); br[1].setAttribute("y1", by + tilt); br[1].setAttribute("x2", 154); br[1].setAttribute("y2", by);
    ch.forEach(c => c.setAttribute("opacity", clamp((v - .55) / .3) * .55));
    tear.setAttribute("opacity", clamp((.35 - v) / .25));
    const k = (v - .5) * 2, cn = 142 - 14 * k, cy = cn + (k < 0 ? 44 : 70) * k, x1 = 60 - 8 * Math.max(k, 0), x2 = 200 - x1;
    mo.setAttribute("d", "M" + x1 + " " + cn + "Q100 " + cy + " " + x2 + " " + cn);
    mf.setAttribute("d", "M" + x1 + " " + cn + "Q100 " + cy + " " + x2 + " " + cn + "Z");
    mf.setAttribute("fill-opacity", clamp((k - .35) / .4));
    fi.style.transform = "rotate(" + ((v - .5) * 10) + "deg) scale(" + (.94 + v * .12) + ")";
    return h;
  };
}

/* ---------- navigasi layar ---------- */
const S = ["w", "id1", "id2", ...Q.map((_, i) => "q" + i), "cm", "done"];
let si = 0, qi = 0, info = {}, ans = new Array(Q.length).fill(0), wOn = false;
const FW = Face($("#fw")), FQ = Face($("#fq")), FD = Face($("#fd"));

function go(n, dir = 1) {
  si = n; const k = S[n], id = k[0] === "q" && k !== "q" ? "q" : k;
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("on", "fwd", "bck"));
  $("#" + id).classList.add("on", dir > 0 ? "fwd" : "bck");
  $("#pb").style.width = (n / (S.length - 2) * 100) + "%";
  $("#back").style.visibility = n >= 1 && k !== "done" ? "visible" : "hidden";
  wOn = k === "w"; if (wOn) loop();
  if (id === "q") showQ(+k.slice(1)); else if (k !== "done") setHue(k === "w" ? 220 : 220);
  window.scrollTo(0, 0);
}
function loop() {
  const t0 = performance.now(), f = t => { if (!wOn) return; const v = .5 + .5 * Math.sin((t - t0) / 900 - 1.2); setHue(FW(v)); requestAnimationFrame(f); };
  requestAnimationFrame(f);
}
$("#back").onclick = () => { if (si > 0) go(si - 1, -1); };
$("#go0").onclick = () => go(1);
$("#go1").onclick = () => {
  const email = $("#email").value.trim(), nama = $("#nama").value.trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return $("#e1").textContent = "Email belum valid ya.";
  if (nama.length < 2) return $("#e1").textContent = "Nama lengkap jangan lupa diisi.";
  $("#e1").textContent = ""; info.email = email; info.nama = nama; go(2);
};
DRIVERS.forEach((d, i) => {
  const b = document.createElement("button"); b.type = "button"; b.className = "chip";
  b.innerHTML = '<span class="av" style="background:hsl(' + (i * 67 + 200) + ' 65% 50%)">' + d.trim()[0].toUpperCase() + "</span>" + d;
  b.onclick = () => { document.querySelectorAll("#drv .chip").forEach(c => c.classList.remove("on")); b.classList.add("on"); info.driver = d; };
  $("#drv").appendChild(b);
});
$("#go2").onclick = () => {
  const t = $("#tujuan").value.trim();
  if (!t) return $("#e2").textContent = "Tujuan peminjaman belum diisi.";
  if (!info.driver) return $("#e2").textContent = "Pilih drivernya dulu ya.";
  $("#e2").textContent = ""; info.tujuan = t; go(3);
};

/* ---------- slider halus + interaksi emoji ---------- */
let v = .5, drag = false, anim = 0, atL = false, atR = false, lastLv = -1, bt = 0;
const sl = $("#sl"), trk = $("#trk"), th = $("#th");
[0, .25, .5, .75, 1].forEach(p => { const t = document.createElement("i"); t.className = "tick"; t.style.left = p * 100 + "%"; trk.insertBefore(t, th); });

function bubble(txt) {
  const b = $("#bub"); b.textContent = txt; b.classList.add("show");
  clearTimeout(bt); bt = setTimeout(() => b.classList.remove("show"), 1900);
}
function edge(side) {
  const w = $("#fwq"); w.classList.remove("shake", "jump"); void w.offsetWidth; w.classList.add(side < 0 ? "shake" : "jump");
  bubble((side < 0 ? BAD : GOOD)[Math.floor(Math.random() * (side < 0 ? BAD : GOOD).length)]);
  if (navigator.vibrate) navigator.vibrate(side < 0 ? [40, 40, 40] : 25);
  if (side > 0) confetti($("#fwq"));
}
function paint(nv, quiet) {
  v = clamp(nv); const h = FQ(v); setHue(h);
  th.style.left = v * 100 + "%";
  const lv = Math.round(v * 4);
  if (lv !== lastLv) { lastLv = lv; const l = $("#lvl"); l.textContent = LEVELS[lv]; l.classList.remove("pop"); void l.offsetWidth; l.classList.add("pop"); sl.setAttribute("aria-valuenow", lv + 1); }
  if (!quiet) {
    if (v <= .01) { if (!atL) { atL = true; edge(-1); } } else if (v > .12) atL = false;
    if (v >= .99) { if (!atR) { atR = true; edge(1); } } else if (v < .88) atR = false;
  }
}
function posV(x, off) { const r = trk.getBoundingClientRect(); return clamp((x + off - r.left) / r.width); }
function touched() { th.classList.remove("hint"); $("#gh").style.display = "none"; }
let off = 0;
sl.addEventListener("pointerdown", e => {
  drag = true; cancelAnimationFrame(anim); sl.setPointerCapture(e.pointerId); touched(); th.classList.add("grab");
  const r = trk.getBoundingClientRect(), cx = r.left + v * r.width;
  off = Math.abs(e.clientX - cx) < 30 ? cx - e.clientX : 0; paint(posV(e.clientX, off));
});
sl.addEventListener("pointermove", e => { if (drag) paint(posV(e.clientX, off)); });
const end = () => { if (!drag) return; drag = false; th.classList.remove("grab"); snap(); };
sl.addEventListener("pointerup", end); sl.addEventListener("pointercancel", end);
sl.addEventListener("keydown", e => {
  const d = e.key === "ArrowRight" || e.key === "ArrowUp" ? .25 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -.25 : 0;
  if (!d) return; e.preventDefault(); cancelAnimationFrame(anim); touched(); paint(Math.round(v * 4) / 4 + d); snap();
});
function snap() {
  const from = v, to = Math.round(v * 4) / 4, t0 = performance.now(), D = Math.abs(to - from) * 700 + 260;
  const step = t => {
    const p = clamp((t - t0) / D), e = 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2);
    paint(from + (to - from) * e);
    if (p < 1) anim = requestAnimationFrame(step); else { paint(to); ans[qi] = Math.round(to * 4) + 1; $("#next").disabled = false; }
  };
  anim = requestAnimationFrame(step);
}
function showQ(i) {
  qi = i; cancelAnimationFrame(anim); $("#bub").classList.remove("show");
  $("#qn").textContent = "PERTANYAAN " + (i + 1) + " DARI " + Q.length;
  $("#qt").textContent = Q[i][0]; $("#qh").textContent = Q[i][1];
  $("#next").textContent = i === Q.length - 1 ? "Lanjut ke langkah terakhir" : "Lanjut";
  const a = ans[i]; lastLv = -1; atL = atR = false;
  if (a) { touched(); paint((a - 1) / 4, true); $("#next").disabled = false; }
  else { th.classList.add("hint"); $("#gh").style.display = ""; paint(.5, true); $("#next").disabled = true; }
}
$("#next").onclick = () => go(si + 1);

/* ---------- komentar & kirim ---------- */
QUICK.forEach(t => {
  const b = document.createElement("button"); b.type = "button"; b.className = "chip sm"; b.textContent = t;
  b.onclick = () => { const c = $("#cmt"); c.value = (c.value ? c.value.trim() + ". " : "") + t; b.classList.add("on"); };
  $("#qc").appendChild(b);
});
$("#send").onclick = async () => {
  const btn = $("#send"); btn.disabled = true; btn.textContent = "Mengirim…"; $("#e3").textContent = "";
  const avg = +(ans.reduce((a, b) => a + b, 0) / ans.length).toFixed(2);
  const payload = {...info, jawaban: ans, rata_rata: avg, komentar: $("#cmt").value.trim()};
  const demo = SCRIPT_URL.indexOf("PASTE_") === 0;
  try {
    if (!demo) await fetch(SCRIPT_URL, {method: "POST", mode: "no-cors", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify(payload)});
    go(S.length - 1);
    const dv = (avg - 1) / 4; setHue(FD(dv));
    $("#dt").textContent = "Terima kasih, " + info.nama.split(" ")[0] + "!";
    $("#ds").textContent = avg >= 4.3 ? "Wah, driver kita keren ya 🎉" : "Masukanmu sangat berarti. Kami akan terus memperbaiki 🙏";
    $("#sum").innerHTML = "<div class='sumr'><span>Driver</span><b>" + info.driver + "</b></div><div class='sumr'><span>Rata-rata skor</span><b>" + avg + " / 5</b></div>" + (demo ? "<p class='sub' style='margin-top:12px'>Mode demo: URL Apps Script belum diisi, data belum dikirim.</p>" : "");
    if (avg >= 4) setTimeout(() => confetti($("#fd")), 300);
  } catch (err) {
    $("#e3").textContent = "Gagal mengirim. Periksa koneksi lalu coba lagi.";
    btn.disabled = false; btn.textContent = "Kirim feedback 🚀";
  }
};

function confetti(el) {
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < 24; i++) {
    const s = document.createElement("span"); s.className = "cf"; s.textContent = ["⭐", "✨", "🎉", "💚", "🌟"][i % 5];
    s.style.left = cx + "px"; s.style.top = cy + "px"; document.body.appendChild(s);
    const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 130;
    s.animate([{transform: "translate(-50%,-50%) scale(.3)", opacity: 1},
      {transform: "translate(calc(-50% + " + Math.cos(a) * d + "px),calc(-50% + " + (Math.sin(a) * d - 50) + "px)) scale(1.1) rotate(" + Math.random() * 360 + "deg)", opacity: 0}],
      {duration: 900 + Math.random() * 600, easing: "cubic-bezier(.2,.8,.3,1)"}).onfinish = () => s.remove();
  }
}
go(0);
