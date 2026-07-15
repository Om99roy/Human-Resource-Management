// ---------- Config ----------
// Use the current host by default, but if the frontend is served from the
// demo static server on port 5500, point to the backend on port 8001.
const API_BASE = window.API_BASE || (
  window.location.port === "5500"
    ? `${window.location.protocol}//${window.location.hostname}:8001`
    : window.location.origin
);

// ---------- Token storage ----------
// NOTE: localStorage is used here for simplicity (easy to demo with plain JS).
// It is readable by any JS on the page, so it's vulnerable to XSS.
// For production, prefer httpOnly secure cookies set by the server instead.
const TokenStore = {
  getAccess() { return localStorage.getItem("access_token"); },
  getRefresh() { return localStorage.getItem("refresh_token"); },
  set(access, refresh) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  },
  clear() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

// ---------- Core request helper with auto refresh-on-401 ----------
async function apiRequest(path, { method = "GET", body = null, auth = false, retry = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = TokenStore.getAccess();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Access token expired — try refreshing once, then retry the original request.
  if (res.status === 401 && auth && retry && TokenStore.getRefresh()) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiRequest(path, { method, body, auth, retry: false });
    }
  }

  let data = null;
  try { data = await res.json(); } catch (_) { /* no body */ }

  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}

async function tryRefresh() {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: TokenStore.getRefresh() }),
    });
    if (!res.ok) {
      TokenStore.clear();
      return false;
    }
    const data = await res.json();
    TokenStore.set(data.access_token, data.refresh_token);
    return true;
  } catch (_) {
    TokenStore.clear();
    return false;
  }
}

// ---------- UI helpers ----------
function showAlert(el, message, type = "error") {
  el.textContent = message;
  el.className = `alert ${type}`;
}

function clearAlert(el) {
  el.textContent = "";
  el.className = "alert";
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function requireAuthOrRedirect() {
  if (!TokenStore.getAccess()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// ---------- Validation helpers ----------
function validateEmail(email) {
  // simple RFC-ish check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  // 0..4
  let label = "Very weak";
  if (score >= 3) label = "Strong";
  else if (score === 2) label = "Okay";
  else if (score === 1) label = "Weak";
  return { score, label };
}

function showPasswordStrength(el, password) {
  if (!el) return;
  const { score, label } = passwordStrength(password || "");
  el.dataset.score = score;
  el.className = `hint pw-strength s${score}`;
  // text label and visual bar
  const meter = `<span class="pw-meter">` +
    Array.from({ length: 4 }).map((_, i) => `<span class="seg ${i<score? 'on':''} s${score}"></span>`).join("") +
    `</span>`;
  el.innerHTML = `${label} ${meter}`;
}

window.validateEmail = validateEmail;
window.passwordStrength = passwordStrength;
window.showPasswordStrength = showPasswordStrength;

// ---------- JWT helpers & token expiry UX ----------
function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
}

function getTokenSecondsLeft(token) {
  const p = parseJwt(token);
  if (!p || !p.exp) return null;
  const now = Math.floor(Date.now() / 1000);
  return p.exp - now;
}

let _tokenMonitorId = null;
function startTokenMonitor({ onTick = () => {}, onExpiring = () => {}, onExpired = () => {}, tickInterval = 1000, expiringThreshold = 30 } = {}) {
  stopTokenMonitor();
  function tick() {
    const token = TokenStore.getAccess();
    if (!token) return stopTokenMonitor();
    const left = getTokenSecondsLeft(token);
    if (left == null) return stopTokenMonitor();
    onTick(left);
    if (left <= 0) {
      stopTokenMonitor();
      onExpired();
    } else if (left <= expiringThreshold) {
      onExpiring(left);
    }
  }
  _tokenMonitorId = setInterval(tick, tickInterval);
  tick();
}

function stopTokenMonitor() {
  if (_tokenMonitorId) {
    clearInterval(_tokenMonitorId);
    _tokenMonitorId = null;
  }
}

window.startTokenMonitor = startTokenMonitor;
window.stopTokenMonitor = stopTokenMonitor;
window.getTokenSecondsLeft = getTokenSecondsLeft;