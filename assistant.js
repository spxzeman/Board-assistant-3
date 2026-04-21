// ============ BASSIST v5.0 (IDs ONLY MODE) ============
(() => {
  // ============ Utils ============
  const $$  = (root, sel) => Array.from(root.querySelectorAll(sel));
  const txt = (el) => (el ? el.textContent.trim() : "");
  const byIdLike = (row, prefix) => row.querySelector(`[id^="${prefix}"]`);
  const norm = (s) => (s || "").toLowerCase();
  const sleep = (ms)=> new Promise(r=>setTimeout(r, ms));
  const debounce = (fn, ms=350)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; };

  const isForza      = (s) => norm(s).includes("forza");
  const isValueTruck = (s) => norm(s).includes("value truck of az");

  const isRich = (s) => {
    const n = norm(s);
    const compact = n.replace(/[^a-z0-9]/g, ""); 
    return (
      compact.includes("richlogistics") || 
      compact.includes("catinc")        || 
      compact.includes("catcoqc")          
    );
  };

  function stripParenSuffix(s){
    return (s || "").replace(/\s*\([^)]*\)\s*$/,"").trim();
  }

  function normalizePhone(s){
    if (!s) return "";
    const digits = (s.match(/\d/g)||[]).join("");
    if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    if (digits.length === 11 && digits[0]==="1") return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
    return s.trim();
  }

  const getStateAbbrev = (s) => {
    if (!s) return "";
    const m = s.match(/,\s*([A-Za-z]{2})\b/);
    return m ? m[1].toUpperCase() : s.trim().toUpperCase();
  };

  const getCityState = (s) => {
    if (!s) return { city: "", st: "" };
    const m = s.match(/^\s*([^,]+)\s*,\s*([A-Za-z]{2})\b/);
    return m
      ? { city: m[1].trim(), st: m[2].toUpperCase() }
      : { city: s.trim(), st: "" };
  };

  async function copyText(s) {
    try { await navigator.clipboard.writeText(s); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = s; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); ta.remove();
    }
  }

  function grabRows() {
    return $$(document,'tr[class*="arrive_Table__tableRow"], tr.arrive_Table__tableRow');
  }

  function parseBoard() {
    const rows = grabRows();

    return rows.map((row) => {
      const loadA      = row.querySelector('a[id^="grid_load_loadNumber__"]');
      const loadNumber = txt(loadA);

      const carrierA = byIdLike(row, "grid_load_carrierCode__");
      const carrier  = txt(carrierA);

      return {
        loadNumber,
        carrier
      };
    }).filter(r => r.loadNumber);
  }

  async function waitForStableRows({settleMs=150, timeoutMs=3000} = {}){
    const start = Date.now();
    let lastCount = -1;
    while (Date.now() - start < timeoutMs) {
      const n = grabRows().length;
      if (n === lastCount) break;
      lastCount = n;
      await sleep(settleMs);
    }
  }

  // ✅ CLEAN OUTPUT HERE
  async function formatLinesForCarrier(carrier, arr) {
    return arr.map(r => String(r.loadNumber).trim());
  }

  let ui = null;

  function createUI() {
    document.getElementById("__ba_btn")?.remove();

    const btn = document.createElement("button");
    btn.id = "__ba_btn";
    btn.textContent = "Copy Loads";
    btn.style.cssText = `
      position:fixed;
      top:20px;
      right:20px;
      z-index:999999;
      padding:10px 14px;
      background:#0077c8;
      color:#fff;
      border:none;
      border-radius:8px;
      font-weight:bold;
      cursor:pointer;
    `;
    document.body.appendChild(btn);

    btn.onclick = async () => {
      await waitForStableRows({});
      const rows = parseBoard();

      const lines = await formatLinesForCarrier("", rows);

      await copyText(lines.join("\n"));
      btn.textContent = "Copied!";
      setTimeout(()=>btn.textContent="Copy Loads",1000);
    };
  }

  (async function run(){
    createUI();
  })();
})();
