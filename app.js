/* ==============================================
   BERMUDA ENERGY CMS — app.js v2.0
   ============================================== */

// ─── STATE ───────────────────────────────────
const STATE = {
  view: 'dashboard',
  user: null,
  role: 'viewer',
  token: localStorage.getItem('cms_token') || null,
  db: { news:[], policies:[], consultations:[], projects:[], kpis:[],
        installers:[], education:[], innovation:[], bursaryRecipients:[],
        leadership:[], settings:{}, solarInstallations:[] },
  drawerSaveFn: null,
  confirmCb: null,
  pendingUploads: {},   // { fieldId: File }
  currentImageUrls: {}  // { fieldId: existingUrl }
}

// ─── NAV CONFIG ──────────────────────────────
const NAV = [
  { id:'dashboard', label:'Dashboard', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
  { section:'CONTENT' },
  { id:'news', label:'News & Media', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>' },
  { id:'policies', label:'Policies', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
  { id:'consultations', label:'Consultations', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
  { id:'projects', label:'Projects', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>' },
  { section:'DATA & TOOLS' },
  { id:'kpis', label:'KPI Dashboard', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
  { id:'solar-registry', label:'Solar Registry', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' },
  { id:'installers', label:'Solar Installers', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' },
  { id:'statistics', label:'Statistics', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>' },
  { section:'PROGRAMMES' },
  { id:'education', label:'Education', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' },
  { id:'innovation', label:'Innovation', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>' },
  { id:'bursary', label:'Bursary Recipients', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>' },
  { id:'leadership', label:'Leadership Team', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  { section:'ADMIN' },
  { id:'media', label:'Media Library', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' },
  { id:'logs', label:'Audit Logs', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>' },
  { id:'settings', label:'Settings', icon:'<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' },
]

// ─── UTILITIES ───────────────────────────────
function esc(s) {
  if (s == null) return ''
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function formatDate(d) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
  } catch { return d }
}

function fmtBytes(b) {
  if (!b) return ''
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB'
  return (b/1048576).toFixed(1) + ' MB'
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7)
}

function badge(text, type='gray') {
  return `<span class="badge badge-${type}">${esc(text)}</span>`
}

function statusBadge(s) {
  const map = {
    published:'green', active:'green', approved:'green', open:'green', completed:'green',
    draft:'orange', pending:'orange', 'in progress':'orange', 'in-progress':'orange',
    closed:'gray', inactive:'gray', archived:'gray',
    rejected:'red', cancelled:'red', suspended:'red'
  }
  const key = (s||'').toLowerCase()
  return badge(s||'—', map[key]||'gray')
}

function emptyState(msg, btnLabel, btnFn) {
  const btn = btnLabel ? `<button class="btn btn-primary btn-sm" onclick="${btnFn}">${btnLabel}</button>` : ''
  return `<div class="empty-state"><div class="empty-icon">📭</div><p class="empty-msg">${esc(msg)}</p>${btn}</div>`
}

// ─── API LAYER ────────────────────────────────
async function api(method, path, body) {
  const headers = {}
  if (STATE.token) headers['Authorization'] = 'Bearer ' + STATE.token
  const opts = { method, headers, credentials: 'include' }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(path, opts)
  if (res.status === 401) {
    STATE.token = null
    localStorage.removeItem('cms_token')
    document.getElementById('app').style.display = 'none'
    document.getElementById('login-screen').style.display = 'flex'
    showScreen('login')
    throw new Error('Session expired — please sign in again')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`)
  return data
}

async function uploadFile(file) {
  const fd = new FormData()
  fd.append('file', file)
  const headers = {}
  if (STATE.token) headers['Authorization'] = 'Bearer ' + STATE.token
  const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', headers, body: fd })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || err.message || 'Upload failed')
  }
  return res.json()
}

async function fetchDb() {
  try {
    STATE.db = await api('GET', '/api/db')
  } catch(e) {
    console.error('fetchDb error:', e)
  }
}

async function fetchCollection(name) {
  try {
    const data = await api('GET', `/api/${name}`)
    STATE.db[name] = data
    return data
  } catch(e) {
    console.error(`fetchCollection(${name}) error:`, e)
    return STATE.db[name] || []
  }
}

// ─── AUTH ─────────────────────────────────────
async function init() {
  setupForms()
  if (STATE.token) {
    try {
      const me = await api('GET', '/api/auth/me')
      STATE.user = me
      STATE.role = me.role || 'Viewer'
      showApp()
      return
    } catch {
      STATE.token = null
      localStorage.removeItem('cms_token')
    }
  }
  showScreen('login')
}

function setupForms() {
  document.getElementById('login-form').addEventListener('submit', doLogin)
  document.getElementById('forgot-form').addEventListener('submit', doForgot)
  document.getElementById('reset-form').addEventListener('submit', doReset)
}

async function doLogin(e) {
  e.preventDefault()
  const email = document.getElementById('login-email').value.trim()
  const pass  = document.getElementById('login-password').value
  const btn   = document.getElementById('login-submit')
  const errEl = document.getElementById('login-error')
  errEl.style.display = 'none'
  btn.disabled = true
  btn.textContent = 'Signing in…'
  try {
    const data = await api('POST', '/api/auth/login', { email, password: pass })
    STATE.token = data.token
    localStorage.setItem('cms_token', data.token)
    STATE.user = data.user
    STATE.role = data.user?.role || 'Viewer'
    showApp()
  } catch(err) {
    errEl.textContent = err.message || 'Invalid credentials'
    errEl.style.display = 'block'
  } finally {
    btn.disabled = false
    btn.textContent = 'Sign In'
  }
}

async function doForgot(e) {
  e.preventDefault()
  const email = document.getElementById('forgot-email').value.trim()
  const msg   = document.getElementById('forgot-msg')
  msg.className = 'alert'
  msg.style.display = 'none'
  try {
    await api('POST', '/api/auth/forgot-password', { email })
    msg.className = 'alert alert-success'
    msg.textContent = 'Reset link sent — check your inbox.'
    msg.style.display = 'block'
  } catch(err) {
    msg.className = 'alert alert-danger'
    msg.textContent = err.message || 'Request failed'
    msg.style.display = 'block'
  }
}

async function doReset(e) {
  e.preventDefault()
  const token    = document.getElementById('reset-token').value.trim()
  const password = document.getElementById('reset-password').value
  const msg      = document.getElementById('reset-msg')
  msg.className = 'alert'
  msg.style.display = 'none'
  try {
    await api('POST', '/api/auth/reset-password', { token, newPassword: password })
    msg.className = 'alert alert-success'
    msg.textContent = 'Password updated. You can now sign in.'
    msg.style.display = 'block'
    setTimeout(() => showScreen('login'), 2000)
  } catch(err) {
    msg.className = 'alert alert-danger'
    msg.textContent = err.message || 'Reset failed'
    msg.style.display = 'block'
  }
}

async function logout() {
  try { await api('POST', '/api/auth/logout') } catch {}
  STATE.user = null
  STATE.role = 'Viewer'
  document.getElementById('app').style.display = 'none'
  document.getElementById('login-screen').style.display = 'flex'
  showScreen('login')
}

function showScreen(name) {
  const forms = ['login-form','forgot-form','reset-form']
  const msgs  = ['login-error','forgot-msg','reset-msg']
  forms.forEach(id => {
    const el = document.getElementById(id)
    if (el) el.style.display = 'none'
  })
  msgs.forEach(id => {
    const el = document.getElementById(id)
    if (el) el.style.display = 'none'
  })
  const map = { login:'login-form', forgot:'forgot-form', reset:'reset-form' }
  const target = document.getElementById(map[name])
  if (target) target.style.display = 'block'
}

function togglePwd(inputId, btn) {
  const inp = document.getElementById(inputId)
  if (!inp) return
  const show = inp.type === 'password'
  inp.type = show ? 'text' : 'password'
  btn.innerHTML = show
    ? '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
    : '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
}

function applyRbac(role) {
  const canWrite = ['Administrator', 'Editor', 'Approver'].includes(role)
  document.querySelectorAll('.write-only').forEach(el => {
    el.style.display = canWrite ? '' : 'none'
  })
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = role === 'Administrator' ? '' : 'none'
  })
}

async function showApp() {
  document.getElementById('login-screen').style.display = 'none'
  document.getElementById('app').style.display = 'flex'
  document.getElementById('sb-user-name').textContent = STATE.user?.name || STATE.user?.email || 'Staff'
  document.getElementById('sb-user-role').textContent = STATE.role
  const initials = (STATE.user?.name || STATE.user?.email || '?')[0].toUpperCase()
  document.getElementById('sb-avatar').textContent = initials
  setupNav()
  applyRbac(STATE.role)
  await fetchDb()
  navigate('dashboard')
}

// ─── NAVIGATION ───────────────────────────────
function setupNav() {
  const nav = document.getElementById('sb-nav')
  nav.innerHTML = NAV.map(item => {
    if (item.section) return `<div class="nav-section">${item.section}</div>`
    return `<div class="nav-item" data-view="${item.id}" onclick="navigate('${item.id}')">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
    </div>`
  }).join('')
}

function navigate(viewId) {
  STATE.view = viewId
  document.querySelectorAll('.nav-item').forEach(el =>
    el.classList.toggle('active', el.dataset.view === viewId))
  const nav = NAV.find(n => n.id === viewId)
  document.getElementById('topbar-title').textContent = nav ? nav.label : viewId
  if (window.innerWidth <= 960) {
    document.getElementById('sidebar').classList.remove('open')
    document.getElementById('overlay').classList.remove('active')
  }
  renderView(viewId)
}

async function renderView(viewId) {
  const vc = document.getElementById('view-container')
  vc.innerHTML = `<div style="display:flex;justify-content:center;padding:3rem"><div class="loader-spinner"></div></div>`
  try {
    switch(viewId) {
      case 'dashboard':      await renderDashboard(); break
      case 'news':           await renderNews(); break
      case 'policies':       await renderPolicies(); break
      case 'consultations':  await renderConsultations(); break
      case 'projects':       await renderProjects(); break
      case 'kpis':           await renderKpis(); break
      case 'solar-registry': await renderSolarRegistry(); break
      case 'installers':     await renderInstallers(); break
      case 'statistics':     await renderStatistics(); break
      case 'education':      await renderEducation(); break
      case 'innovation':     await renderInnovation(); break
      case 'bursary':        await renderBursary(); break
      case 'leadership':     await renderLeadership(); break
      case 'media':          await renderMedia(); break
      case 'logs':           await renderLogs(); break
      case 'settings':       await renderSettings(); break
      case 'search':         renderSearchResults(); break
      default: vc.innerHTML = emptyState(`Unknown view: ${viewId}`)
    }
  } catch(e) {
    console.error('renderView error:', e)
    vc.innerHTML = `<div class="card card-body"><p style="color:var(--c-danger)">Error loading view: ${esc(e.message)}</p></div>`
  }
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar')
  const ov = document.getElementById('overlay')
  const open = sb.classList.toggle('open')
  ov.classList.toggle('active', open)
}

function overlayClick() {
  document.getElementById('sidebar').classList.remove('open')
  document.getElementById('overlay').classList.remove('active')
  closeDrawer()
}

function handleSearch(e) {
  if (e.key !== 'Enter') return
  const q = e.target.value.trim()
  if (!q) return
  STATE.searchQuery = q
  navigate('search')
}

// ─── TOAST ────────────────────────────────────
function toast(msg, type='success', dur=3500) {
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' }
  const el = document.createElement('div')
  el.className = `toast toast-${type}`
  el.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-msg">${esc(msg)}</span>`
  document.getElementById('toast-container').prepend(el)
  setTimeout(() => {
    el.style.animation = 'toast-out 0.25s ease forwards'
    setTimeout(() => el.remove(), 260)
  }, dur)
}

// ─── CONFIRM DIALOG ───────────────────────────
function confirmDelete(msg, cb) {
  STATE.confirmCb = cb
  document.getElementById('confirm-body').textContent = msg
  const dlg = document.getElementById('confirm-dialog')
  dlg.style.display = 'flex'
  document.getElementById('confirm-ok').onclick = () => {
    dlg.style.display = 'none'
    cb()
  }
  document.getElementById('confirm-cancel').onclick = cancelConfirm
}

function cancelConfirm() {
  document.getElementById('confirm-dialog').style.display = 'none'
  STATE.confirmCb = null
}

// ─── DRAWER ───────────────────────────────────
function openDrawer(cfg) {
  // cfg: { title, sub?, body, saveFn, saveLabel?, wide? }
  STATE.drawerSaveFn = cfg.saveFn
  document.getElementById('drawer-title').textContent = cfg.title
  const sub = document.getElementById('drawer-sub')
  if (cfg.sub) { sub.textContent = cfg.sub; sub.style.display = 'block' }
  else sub.style.display = 'none'
  document.getElementById('drawer-body').innerHTML = cfg.body
  document.getElementById('drawer-save-label').textContent = cfg.saveLabel || 'Save'
  document.getElementById('drawer-tabs').style.display = 'none'
  document.getElementById('drawer-tabs').innerHTML = ''
  const drawer = document.getElementById('drawer')
  if (cfg.wide) drawer.style.setProperty('--drawer-w','720px')
  else drawer.style.removeProperty('--drawer-w')
  drawer.classList.add('open')
  document.getElementById('overlay').classList.add('active')
  document.getElementById('drawer-save').onclick = async () => {
    if (STATE.drawerSaveFn) {
      document.getElementById('drawer-save').disabled = true
      document.getElementById('drawer-save-label').textContent = 'Saving…'
      try { await STATE.drawerSaveFn() }
      catch(e) { toast(e.message||'Save failed', 'error') }
      finally {
        document.getElementById('drawer-save').disabled = false
        document.getElementById('drawer-save-label').textContent = cfg.saveLabel || 'Save'
      }
    }
  }
}

function openDrawerWithTabs(cfg) {
  // cfg: { title, tabs:[{id,label,body}], saveFn, saveLabel? }
  STATE.drawerSaveFn = cfg.saveFn
  document.getElementById('drawer-title').textContent = cfg.title
  document.getElementById('drawer-sub').style.display = 'none'
  const tabsEl = document.getElementById('drawer-tabs')
  tabsEl.style.display = 'flex'
  tabsEl.innerHTML = cfg.tabs.map((t,i) =>
    `<button class="drawer-tab${i===0?' active':''}" onclick="switchDrawerTab('${t.id}')" data-tab="${t.id}">${t.label}</button>`
  ).join('')
  document.getElementById('drawer-body').innerHTML = cfg.tabs.map((t,i) =>
    `<div id="dtab-${t.id}" class="drawer-tab-panel" style="${i===0?'':'display:none'}">${t.body}</div>`
  ).join('')
  document.getElementById('drawer-save-label').textContent = cfg.saveLabel || 'Save'
  document.getElementById('drawer').classList.add('open')
  document.getElementById('overlay').classList.add('active')
  document.getElementById('drawer-save').onclick = async () => {
    if (STATE.drawerSaveFn) {
      document.getElementById('drawer-save').disabled = true
      document.getElementById('drawer-save-label').textContent = 'Saving…'
      try { await STATE.drawerSaveFn() }
      catch(e) { toast(e.message||'Save failed', 'error') }
      finally {
        document.getElementById('drawer-save').disabled = false
        document.getElementById('drawer-save-label').textContent = cfg.saveLabel || 'Save'
      }
    }
  }
}

function switchDrawerTab(tabId) {
  document.querySelectorAll('.drawer-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId))
  document.querySelectorAll('.drawer-tab-panel').forEach(p => {
    p.style.display = p.id === `dtab-${tabId}` ? 'block' : 'none'
  })
}

function closeDrawer() {
  document.getElementById('drawer').classList.remove('open')
  document.getElementById('overlay').classList.remove('active')
  STATE.drawerSaveFn = null
  STATE.pendingUploads = {}
  STATE.currentImageUrls = {}
}

// ─── UPLOAD HELPERS ───────────────────────────
function setupImageZone(zoneId, inputId, previewId, fieldKey) {
  const zone  = document.getElementById(zoneId)
  const input = document.getElementById(inputId)
  if (!zone || !input) return

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) { toast('Please select an image file','warning'); return }
    if (file.size > 8*1024*1024) { toast('Image must be under 8 MB','warning'); return }
    STATE.pendingUploads[fieldKey] = file
    const reader = new FileReader()
    reader.onload = e => {
      const prev = document.getElementById(previewId)
      if (prev) {
        prev.innerHTML = `
          <div class="upload-preview">
            <img src="${e.target.result}" class="upload-img" alt="Preview">
            <button type="button" class="upload-remove" onclick="clearImageField('${fieldKey}','${previewId}','${zoneId}')">✕</button>
          </div>`
        prev.nextElementSibling && (prev.nextElementSibling.style.display = 'none')
      }
    }
    reader.readAsDataURL(file)
  }

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over') })
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'))
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over')
    handleFile(e.dataTransfer.files[0])
  })
  input.addEventListener('change', e => handleFile(e.target.files[0]))
}

function clearImageField(fieldKey, previewId, zoneId) {
  delete STATE.pendingUploads[fieldKey]
  delete STATE.currentImageUrls[fieldKey]
  const prev = document.getElementById(previewId)
  if (prev) { prev.innerHTML = ''; if (prev.nextElementSibling) prev.nextElementSibling.style.display = '' }
}

function setupFileZone(zoneId, inputId, listId, fieldKey, accept) {
  const zone  = document.getElementById(zoneId)
  const input = document.getElementById(inputId)
  if (!zone || !input) return

  function handleFile(file) {
    if (!file) return
    if (file.size > 30*1024*1024) { toast('File too large (max 30 MB)','warning'); return }
    STATE.pendingUploads[fieldKey] = file
    const list = document.getElementById(listId)
    if (list) {
      list.innerHTML = `
        <ul class="file-list">
          <li class="file-item">
            <span class="file-ico">📄</span>
            <span class="file-name">${esc(file.name)}</span>
            <span class="file-sz">${fmtBytes(file.size)}</span>
            <button type="button" class="file-rm" onclick="clearFileField('${fieldKey}','${listId}')">✕</button>
          </li>
        </ul>`
    }
  }

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over') })
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'))
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over')
    handleFile(e.dataTransfer.files[0])
  })
  input.addEventListener('change', e => handleFile(e.target.files[0]))
}

function clearFileField(fieldKey, listId) {
  delete STATE.pendingUploads[fieldKey]
  const list = document.getElementById(listId)
  if (list) list.innerHTML = ''
}

async function resolveUploads() {
  const urls = {}
  for (const [key, file] of Object.entries(STATE.pendingUploads)) {
    const res = await uploadFile(file)
    urls[key] = res.url
  }
  STATE.pendingUploads = {}
  return urls
}

function val(id) {
  const el = document.getElementById(id)
  return el ? el.value.trim() : ''
}

// ─── DASHBOARD ────────────────────────────────
async function renderDashboard() {
  const db = STATE.db
  const news   = db.news   || []
  const pol    = db.policies || []
  const cons   = db.consultations || []
  const proj   = db.projects || []
  const inst   = db.installers || []
  const openCons = cons.filter(c => (c.status||'').toLowerCase() === 'open').length

  document.getElementById('view-container').innerHTML = `
    <div class="view-header">
      <div>
        <h2 class="view-title">Dashboard</h2>
        <p class="view-sub">Welcome back, ${esc(STATE.user?.name || STATE.user?.email || 'Staff')}</p>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon teal">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">${news.length}</div>
          <div class="stat-label">News Articles</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">${pol.length}</div>
          <div class="stat-label">Policies</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">${openCons}</div>
          <div class="stat-label">Open Consultations</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">${proj.length}</div>
          <div class="stat-label">Projects</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon teal">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">${inst.length}</div>
          <div class="stat-label">Installers</div>
        </div>
      </div>
    </div>

    <div class="dash-row">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Recent News</span>
          <button class="btn btn-outline btn-sm" onclick="navigate('news')">View All</button>
        </div>
        <div class="card-body" style="padding:0">
          ${news.length === 0 ? emptyState('No news articles yet','Add Article',"navigate('news')") : `
          <ul class="activity-list" style="padding:0 1.375rem">
            ${news.slice(0,5).map(a => `
              <li class="activity-item">
                <div class="activity-dot"></div>
                <div class="activity-text">${esc(a.title)}</div>
                <div class="activity-time">${formatDate(a.date||a.publishedAt)}</div>
              </li>`).join('')}
          </ul>`}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Quick Actions</span>
        </div>
        <div class="card-body">
          <div class="qa-grid">
            <button class="qa-card write-only" onclick="navigate('news');setTimeout(()=>openNewsDrawer(),300)">
              <div class="qa-icon">✏️</div>Add News
            </button>
            <button class="qa-card write-only" onclick="navigate('policies');setTimeout(()=>openPolicyDrawer(),300)">
              <div class="qa-icon">📄</div>Add Policy
            </button>
            <button class="qa-card write-only" onclick="navigate('consultations');setTimeout(()=>openConsultationDrawer(),300)">
              <div class="qa-icon">💬</div>Add Consultation
            </button>
            <button class="qa-card" onclick="navigate('media')">
              <div class="qa-icon">🖼️</div>Media Library
            </button>
            <button class="qa-card admin-only" onclick="navigate('logs')">
              <div class="qa-icon">📋</div>Audit Logs
            </button>
            <button class="qa-card" onclick="navigate('settings')">
              <div class="qa-icon">⚙️</div>Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  `
  applyRbac(STATE.role)
}

// ─── NEWS ─────────────────────────────────────
async function renderNews() {
  const items = await fetchCollection('news')
  const vc = document.getElementById('view-container')
  const canWrite = STATE.role === 'admin' || STATE.role === 'editor'

  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">News & Media</h2><p class="view-sub">${items.length} article${items.length!==1?'s':''}</p></div>
      <div class="view-actions">
        <button class="btn btn-primary write-only" onclick="openNewsDrawer()">+ Add Article</button>
      </div>
    </div>
    <div class="filter-bar">
      <div class="filter-search">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" placeholder="Search articles…" oninput="filterTable(this.value,'news-tbody','news-rows')">
      </div>
      <select class="filter-select" onchange="filterTableStatus(this.value,'news-tbody','news-rows','status')">
        <option value="">All Status</option>
        <option>Published</option><option>Draft</option>
      </select>
    </div>
    ${items.length === 0 ? emptyState('No news articles yet. Add your first article.','Add Article','openNewsDrawer()') : `
    <div class="table-wrap">
      <table class="cms-table">
        <thead><tr>
          <th>Title</th><th>Category</th><th>Date</th><th>Status</th><th class="th-actions">Actions</th>
        </tr></thead>
        <tbody id="news-tbody">
          ${items.map(a => `<tr data-status="${esc(a.status||'')}" class="news-rows">
            <td class="td-title"><span class="td-title-text" title="${esc(a.title)}">${esc(a.title)}</span>${a.image?'<span style="font-size:.7rem;margin-left:.4rem;color:var(--c-text-light)">📷</span>':''}${a.attachmentUrl?'<span style="font-size:.7rem;margin-left:.4rem;color:var(--c-text-light)">📄</span>':''}</td>
            <td class="td-muted">${esc(a.category||'—')}</td>
            <td class="td-muted">${formatDate(a.publishDate||a.publishedAt||a.date)}</td>
            <td>${statusBadge(a.status)}</td>
            <td class="td-actions">
              <button class="btn-icon btn-edit write-only" onclick="openNewsDrawer('${esc(a.id)}')" title="Edit">✏️</button>
              <button class="btn-icon btn-del write-only" onclick="deleteNews('${esc(a.id)}')" title="Delete">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`}
  `
  applyRbac(STATE.role)
}

async function openNewsDrawer(id) {
  let item = {}
  if (id) {
    const items = STATE.db.news || []
    item = items.find(n => n.id === id) || {}
  }
  STATE.pendingUploads = {}
  STATE.currentImageUrls = { newsImage: item.image||'', newsDoc: item.attachmentUrl||'' }

  const storyTab = `
    <div class="form-field">
      <label class="form-label">Title <span class="form-required">*</span></label>
      <input id="n-title" class="form-input" value="${esc(item.title)}" placeholder="Article title" required>
    </div>
    <div class="form-field">
      <label class="form-label">Summary / Excerpt</label>
      <textarea id="n-summary" class="form-textarea" rows="3" placeholder="Brief description shown on listing pages">${esc(item.summary||item.excerpt||'')}</textarea>
    </div>
    <div class="form-field">
      <label class="form-label">Full Content</label>
      <textarea id="n-content" class="form-textarea" rows="7" placeholder="Full article body">${esc(item.content||item.body||'')}</textarea>
    </div>
    <div class="field-row">
      <div class="form-field">
        <label class="form-label">Category</label>
        <select id="n-category" class="form-select">
          ${['General','Policy','Renewable Energy','Events','Announcements','Press Release'].map(c=>`<option${c===(item.category||'General')?' selected':''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="form-field">
        <label class="form-label">Status</label>
        <select id="n-status" class="form-select">
          <option${(item.status||'Draft')==='Draft'?' selected':''}>Draft</option>
          <option${item.status==='Published'?' selected':''}>Published</option>
        </select>
      </div>
    </div>
    <div class="field-row">
      <div class="form-field">
        <label class="form-label">Publication Date</label>
        <input id="n-date" type="date" class="form-input" value="${esc((item.date||item.publishedAt||'').split('T')[0])}">
      </div>
      <div class="form-field">
        <label class="form-label">External URL</label>
        <input id="n-url" type="url" class="form-input" value="${esc(item.externalUrl||item.url||'')}" placeholder="https://…">
      </div>
    </div>
  `

  const mediaTab = `
    <div class="form-field">
      <label class="form-label">Featured Image</label>
      <div id="n-img-preview">${item.image?`<div class="upload-preview"><img src="${esc(item.image)}" class="upload-img"><button type="button" class="upload-remove" onclick="clearImageField('newsImage','n-img-preview','n-img-zone')">✕</button></div>`:''}
      </div>
      <div id="n-img-zone" class="upload-zone" style="${item.image?'display:none':''}">
        <input type="file" id="n-img-input" accept="image/*">
        <svg class="upload-icon" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <div class="upload-prompt"><p>Drag & drop image here</p><p style="font-size:.8rem;color:var(--c-text-light)">or click to browse</p></div>
        <p class="upload-hint">JPG, PNG, WebP — max 8 MB</p>
      </div>
    </div>
    <div class="section-divider"></div>
    <div class="form-field">
      <label class="form-label">PDF Document</label>
      <div id="n-doc-list">${item.attachmentUrl?`<ul class="file-list"><li class="file-item"><span class="file-ico">📄</span><span class="file-name">${esc(item.attachmentUrl.split('/').pop())}</span><button type="button" class="file-rm" onclick="clearFileField('newsDoc','n-doc-list')">✕</button></li></ul>`:''}</div>
      <div id="n-doc-zone" class="upload-zone">
        <input type="file" id="n-doc-input" accept=".pdf,.doc,.docx">
        <svg class="upload-icon" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <div class="upload-prompt"><p>Drag & drop PDF here</p><p style="font-size:.8rem;color:var(--c-text-light)">or click to browse</p></div>
        <p class="upload-hint">PDF, DOC, DOCX — max 30 MB</p>
      </div>
    </div>
  `

  openDrawerWithTabs({
    title: id ? 'Edit Article' : 'New Article',
    tabs: [{ id:'story', label:'Story', body:storyTab }, { id:'media', label:'Media', body:mediaTab }],
    saveFn: () => saveNews(id),
    saveLabel: id ? 'Update' : 'Publish'
  })

  setTimeout(() => {
    setupImageZone('n-img-zone','n-img-input','n-img-preview','newsImage')
    setupFileZone('n-doc-zone','n-doc-input','n-doc-list','newsDoc','.pdf,.doc,.docx')
  }, 50)
}

async function saveNews(id) {
  const title = val('n-title')
  if (!title) { toast('Title is required','warning'); return }

  const uploads = await resolveUploads()
  const imageUrl   = uploads['newsImage'] || STATE.currentImageUrls['newsImage'] || ''
  const documentUrl= uploads['newsDoc']   || STATE.currentImageUrls['newsDoc']   || ''

  const payload = {
    title,
    image:         imageUrl,
    attachmentUrl: documentUrl,
    summary:       val('n-summary'),
    excerpt:       val('n-summary'),
    content:       val('n-content'),
    category:      val('n-category'),
    status:        val('n-status'),
    publishDate:   val('n-date'),
    publishedAt:   val('n-date'),
  }

  if (!id) {
    payload.slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + Date.now()
    payload.featured = false
  }
  if (id) await api('PUT', `/api/news/${id}`, payload)
  else     await api('POST', '/api/news', payload)

  toast(id ? 'Article updated' : 'Article published', 'success')
  closeDrawer()
  await renderNews()
}

async function deleteNews(id) {
  confirmDelete('Delete this article? This cannot be undone.', async () => {
    await api('DELETE', `/api/news/${id}`)
    toast('Article deleted')
    await renderNews()
  })
}

// ─── POLICIES ─────────────────────────────────
async function renderPolicies() {
  const items = await fetchCollection('policies')
  const vc = document.getElementById('view-container')
  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">Policies & Legislation</h2><p class="view-sub">${items.length} document${items.length!==1?'s':''}</p></div>
      <div class="view-actions">
        <button class="btn btn-primary write-only" onclick="openPolicyDrawer()">+ Add Policy</button>
      </div>
    </div>
    <div class="filter-bar">
      <div class="filter-search">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" placeholder="Search policies…" oninput="filterTable(this.value,'pol-tbody','pol-rows')">
      </div>
    </div>
    ${items.length === 0 ? emptyState('No policies yet.','Add Policy','openPolicyDrawer()') : `
    <div class="table-wrap">
      <table class="cms-table">
        <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Status</th><th class="th-actions">Actions</th></tr></thead>
        <tbody id="pol-tbody">
          ${items.map(p => `<tr class="pol-rows">
            <td class="td-title"><span class="td-title-text" title="${esc(p.title)}">${esc(p.title)}</span>${p.fileUrl?'<span style="font-size:.7rem;margin-left:.4rem;color:var(--c-text-light)">📎</span>':''}</td>
            <td class="td-muted">${esc(p.category||'—')}</td>
            <td class="td-muted">${formatDate(p.date)}</td>
            <td>${statusBadge(p.status)}</td>
            <td class="td-actions">
              <button class="btn-icon btn-edit write-only" onclick="openPolicyDrawer('${esc(p.id)}')" title="Edit">✏️</button>
              <button class="btn-icon btn-del write-only" onclick="deletePolicy('${esc(p.id)}')" title="Delete">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`}
  `
  applyRbac(STATE.role)
}

function openPolicyDrawer(id) {
  const item = id ? (STATE.db.policies||[]).find(p=>p.id===id)||{} : {}
  STATE.currentImageUrls = { policyDoc: item.fileUrl||'' }

  openDrawer({
    title: id ? 'Edit Policy' : 'New Policy',
    body: `
      <div class="form-field">
        <label class="form-label">Title <span class="form-required">*</span></label>
        <input id="p-title" class="form-input" value="${esc(item.title)}" placeholder="Policy title" required>
      </div>
      <div class="form-field">
        <label class="form-label">Description</label>
        <textarea id="p-desc" class="form-textarea" rows="4" placeholder="Brief description">${esc(item.description||item.summary||'')}</textarea>
      </div>
      <div class="field-row">
        <div class="form-field">
          <label class="form-label">Category</label>
          <select id="p-category" class="form-select">
            ${['Energy Policy','Legislation','Regulation','Renewable Energy','Efficiency','Other'].map(c=>`<option${c===(item.category||'Energy Policy')?' selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">Status</label>
          <select id="p-status" class="form-select">
            <option${(item.status||'Active')==='Active'?' selected':''}>Active</option>
            <option${item.status==='Draft'?' selected':''}>Draft</option>
            <option${item.status==='Archived'?' selected':''}>Archived</option>
          </select>
        </div>
      </div>
      <div class="field-row">
        <div class="form-field">
          <label class="form-label">Date</label>
          <input id="p-date" type="date" class="form-input" value="${esc((item.date||'').split('T')[0])}">
        </div>
        <div class="form-field">
          <label class="form-label">External URL</label>
          <input id="p-url" type="url" class="form-input" value="${esc(item.externalUrl||item.url||'')}" placeholder="https://…">
        </div>
      </div>
      <div class="form-field">
        <label class="form-label">Document / PDF</label>
        <div id="p-doc-list">${item.fileUrl?`<ul class="file-list"><li class="file-item"><span class="file-ico">📄</span><span class="file-name">${esc(item.fileUrl.split('/').pop())}</span><button class="file-rm" onclick="clearFileField('policyDoc','p-doc-list')">✕</button></li></ul>`:''}</div>
        <div id="p-doc-zone" class="upload-zone">
          <input type="file" id="p-doc-input" accept=".pdf,.doc,.docx">
          <svg class="upload-icon" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div class="upload-prompt"><p>Drag & drop document</p></div>
          <p class="upload-hint">PDF, DOC, DOCX — max 30 MB</p>
        </div>
      </div>
    `,
    saveFn: () => savePolicy(id),
    saveLabel: id ? 'Update' : 'Save'
  })
  setTimeout(() => setupFileZone('p-doc-zone','p-doc-input','p-doc-list','policyDoc'), 50)
}

async function savePolicy(id) {
  const title = val('p-title')
  if (!title) { toast('Title is required','warning'); return }
  const uploads = await resolveUploads()
  const payload = {
    title, description: val('p-desc'), category: val('p-category'),
    status: val('p-status'), date: val('p-date'),
    externalUrl: val('p-url'),
    fileUrl: uploads['policyDoc'] || STATE.currentImageUrls['policyDoc'] || ''
  }
  if (id) await api('PUT', `/api/policies/${id}`, payload)
  else     await api('POST', '/api/policies', payload)
  toast(id ? 'Policy updated' : 'Policy saved')
  closeDrawer()
  await renderPolicies()
}

async function deletePolicy(id) {
  confirmDelete('Delete this policy?', async () => {
    await api('DELETE', `/api/policies/${id}`)
    toast('Policy deleted')
    await renderPolicies()
  })
}

// ─── CONSULTATIONS ────────────────────────────
async function renderConsultations() {
  const items = await fetchCollection('consultations')
  const vc = document.getElementById('view-container')
  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">Consultations</h2><p class="view-sub">${items.length} consultation${items.length!==1?'s':''}</p></div>
      <div class="view-actions">
        <button class="btn btn-primary write-only" onclick="openConsultationDrawer()">+ Add Consultation</button>
      </div>
    </div>
    <div class="filter-bar">
      <div class="filter-search">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" placeholder="Search consultations…" oninput="filterTable(this.value,'cons-tbody','cons-rows')">
      </div>
      <select class="filter-select" onchange="filterTableStatus(this.value,'cons-tbody','cons-rows','status')">
        <option value="">All Status</option><option>Open</option><option>Closed</option>
      </select>
    </div>
    ${items.length === 0 ? emptyState('No consultations yet.','Add Consultation','openConsultationDrawer()') : `
    <div class="table-wrap">
      <table class="cms-table">
        <thead><tr><th>Title</th><th>Opening</th><th>Closing</th><th>Status</th><th class="th-actions">Actions</th></tr></thead>
        <tbody id="cons-tbody">
          ${items.map(c => `<tr data-status="${esc(c.status||'')}" class="cons-rows">
            <td class="td-title"><span class="td-title-text" title="${esc(c.title)}">${esc(c.title)}</span></td>
            <td class="td-muted">${formatDate(c.openingDate||c.start_date||c.startDate)}</td>
            <td class="td-muted">${formatDate(c.closingDate||c.end_date||c.endDate)}</td>
            <td>${statusBadge(c.status)}</td>
            <td class="td-actions">
              <button class="btn-icon btn-edit write-only" onclick="openConsultationDrawer('${esc(c.id)}')" title="Edit">✏️</button>
              <button class="btn-icon btn-del write-only" onclick="deleteConsultation('${esc(c.id)}')" title="Delete">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`}
  `
  applyRbac(STATE.role)
}

function openConsultationDrawer(id) {
  const item = id ? (STATE.db.consultations||[]).find(c=>c.id===id)||{} : {}
  openDrawer({
    title: id ? 'Edit Consultation' : 'New Consultation',
    body: `
      <div class="form-field">
        <label class="form-label">Title <span class="form-required">*</span></label>
        <input id="c-title" class="form-input" value="${esc(item.title)}" placeholder="Consultation title" required>
      </div>
      <div class="form-field">
        <label class="form-label">Description</label>
        <textarea id="c-desc" class="form-textarea" rows="4" placeholder="What this consultation covers">${esc(item.description||'')}</textarea>
      </div>
      <div class="field-row">
        <div class="form-field">
          <label class="form-label">Opening Date</label>
          <input id="c-open" type="date" class="form-input" value="${esc(((item.openingDate||item.start_date||item.startDate)||'').split('T')[0])}">
        </div>
        <div class="form-field">
          <label class="form-label">Closing Date</label>
          <input id="c-close" type="date" class="form-input" value="${esc(((item.closingDate||item.end_date||item.endDate)||'').split('T')[0])}">
        </div>
      </div>
      <div class="field-row">
        <div class="form-field">
          <label class="form-label">Status</label>
          <select id="c-status" class="form-select">
            <option${(item.status||'Open')==='Open'?' selected':''}>Open</option>
            <option${item.status==='Closed'?' selected':''}>Closed</option>
            <option${item.status==='Draft'?' selected':''}>Draft</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">Submission Link</label>
          <input id="c-url" type="url" class="form-input" value="${esc(item.externalUrl||item.url||'')}" placeholder="https://forum.gov.bm/…">
        </div>
      </div>
    `,
    saveFn: () => saveConsultation(id),
    saveLabel: id ? 'Update' : 'Save'
  })
}

async function saveConsultation(id) {
  const title = val('c-title')
  if (!title) { toast('Title is required','warning'); return }
  const payload = {
    title, description: val('c-desc'),
    openingDate: val('c-open'), closingDate: val('c-close'),
    start_date: val('c-open'), end_date: val('c-close'),
    status: val('c-status'), externalUrl: val('c-url')
  }
  if (id) await api('PUT', `/api/consultations/${id}`, payload)
  else     await api('POST', '/api/consultations', payload)
  toast(id ? 'Consultation updated' : 'Consultation saved')
  closeDrawer()
  await renderConsultations()
}

async function deleteConsultation(id) {
  confirmDelete('Delete this consultation?', async () => {
    await api('DELETE', `/api/consultations/${id}`)
    toast('Consultation deleted')
    await renderConsultations()
  })
}

// ─── PROJECTS ─────────────────────────────────
async function renderProjects() {
  const items = await fetchCollection('projects')
  const vc = document.getElementById('view-container')
  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">Projects & Initiatives</h2><p class="view-sub">${items.length} project${items.length!==1?'s':''}</p></div>
      <div class="view-actions">
        <button class="btn btn-primary write-only" onclick="openProjectDrawer()">+ Add Project</button>
      </div>
    </div>
    <div class="filter-bar">
      <div class="filter-search">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" placeholder="Search projects…" oninput="filterTable(this.value,'proj-tbody','proj-rows')">
      </div>
    </div>
    ${items.length === 0 ? emptyState('No projects yet.','Add Project','openProjectDrawer()') : `
    <div class="table-wrap">
      <table class="cms-table">
        <thead><tr><th>Name</th><th>Start</th><th>End</th><th>Status</th><th class="th-actions">Actions</th></tr></thead>
        <tbody id="proj-tbody">
          ${items.map(p => `<tr class="proj-rows">
            <td class="td-title"><span class="td-title-text" title="${esc(p.name||p.title)}">${esc(p.name||p.title)}</span></td>
            <td class="td-muted">${formatDate(p.startDate||p.start_date)}</td>
            <td class="td-muted">${formatDate(p.endDate||p.end_date)}</td>
            <td>${statusBadge(p.status)}</td>
            <td class="td-actions">
              <button class="btn-icon btn-edit write-only" onclick="openProjectDrawer('${esc(p.id)}')" title="Edit">✏️</button>
              <button class="btn-icon btn-del write-only" onclick="deleteProject('${esc(p.id)}')" title="Delete">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`}
  `
  applyRbac(STATE.role)
}

function openProjectDrawer(id) {
  const item = id ? (STATE.db.projects||[]).find(p=>p.id===id)||{} : {}
  openDrawer({
    title: id ? 'Edit Project' : 'New Project',
    body: `
      <div class="form-field">
        <label class="form-label">Project Name <span class="form-required">*</span></label>
        <input id="pr-name" class="form-input" value="${esc(item.name||item.title)}" placeholder="Project name" required>
      </div>
      <div class="form-field">
        <label class="form-label">Description</label>
        <textarea id="pr-desc" class="form-textarea" rows="4" placeholder="Project overview">${esc(item.description||'')}</textarea>
      </div>
      <div class="field-row">
        <div class="form-field">
          <label class="form-label">Status</label>
          <select id="pr-status" class="form-select">
            ${['Active','In Progress','Completed','On Hold','Cancelled'].map(s=>`<option${s===(item.status||'Active')?' selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">Budget</label>
          <input id="pr-budget" class="form-input" value="${esc(item.budget||'')}" placeholder="e.g. $250,000">
        </div>
      </div>
      <div class="field-row">
        <div class="form-field">
          <label class="form-label">Start Date</label>
          <input id="pr-start" type="date" class="form-input" value="${esc(((item.startDate||item.start_date)||'').split('T')[0])}">
        </div>
        <div class="form-field">
          <label class="form-label">End Date</label>
          <input id="pr-end" type="date" class="form-input" value="${esc(((item.endDate||item.end_date)||'').split('T')[0])}">
        </div>
      </div>
    `,
    saveFn: () => saveProject(id),
    saveLabel: id ? 'Update' : 'Save'
  })
}

async function saveProject(id) {
  const name = val('pr-name')
  if (!name) { toast('Project name is required','warning'); return }
  const payload = {
    name, title: name, description: val('pr-desc'), status: val('pr-status'),
    budget: val('pr-budget'), startDate: val('pr-start'), endDate: val('pr-end'),
    start_date: val('pr-start'), end_date: val('pr-end')
  }
  if (id) await api('PUT', `/api/projects/${id}`, payload)
  else     await api('POST', '/api/projects', payload)
  toast(id ? 'Project updated' : 'Project saved')
  closeDrawer()
  await renderProjects()
}

async function deleteProject(id) {
  confirmDelete('Delete this project?', async () => {
    await api('DELETE', `/api/projects/${id}`)
    toast('Project deleted')
    await renderProjects()
  })
}

// ─── TABLE FILTER HELPERS ─────────────────────
function filterTable(q, tbodyId, rowClass) {
  const rows = document.querySelectorAll(`.${rowClass}`)
  const lower = q.toLowerCase()
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(lower) ? '' : 'none'
  })
}

function filterTableStatus(val, tbodyId, rowClass, attr) {
  document.querySelectorAll(`.${rowClass}`).forEach(row => {
    const statusEl = row.querySelector('.badge')
    const text = statusEl ? statusEl.textContent : ''
    row.style.display = (!val || text.toLowerCase() === val.toLowerCase()) ? '' : 'none'
  })
}

// ─── KPIs ────────────────────────────────────
async function renderKpis() {
  const items = await fetchCollection('kpis')
  const vc = document.getElementById('view-container')
  const canWrite = STATE.role === 'admin' || STATE.role === 'editor'
  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">KPI Dashboard</h2><p class="view-sub">Edit key performance indicators shown on the portal</p></div>
      <div class="view-actions write-only">
        <button class="btn btn-outline btn-sm" onclick="addKpi()">+ Add KPI</button>
      </div>
    </div>
    ${items.length === 0 ? emptyState('No KPIs configured.','Add KPI','addKpi()') : `
    <div class="kpi-grid" id="kpi-grid">
      ${items.map(k => `
        <div class="kpi-card" id="kpi-${esc(k.id)}">
          <div class="kpi-label">${esc(k.name||k.label)}</div>
          <div class="kpi-row">
            <input class="kpi-input" id="kv-${esc(k.id)}" value="${esc(k.value||k.val||'')}" placeholder="—" ${canWrite?'':'readonly'}>
            ${k.unit ? `<span class="kpi-unit">${esc(k.unit)}</span>` : ''}
          </div>
          <div class="kpi-row" style="margin-top:.5rem;gap:.375rem">
            <button class="btn btn-primary btn-sm kpi-save-btn write-only" onclick="saveKpi('${esc(k.id)}')">Save</button>
            <button class="btn btn-ghost btn-sm write-only" onclick="deleteKpi('${esc(k.id)}')">Delete</button>
          </div>
        </div>`).join('')}
    </div>`}
  `
  applyRbac(STATE.role)
}

async function saveKpi(id) {
  const value = document.getElementById(`kv-${id}`)?.value?.trim()
  await api('PUT', `/api/kpis/${id}`, { value })
  toast('KPI updated')
  await fetchCollection('kpis')
}

async function addKpi() {
  openDrawer({
    title: 'Add KPI',
    body: `
      <div class="form-field"><label class="form-label">Label <span class="form-required">*</span></label>
        <input id="kpi-name" class="form-input" placeholder="e.g. Solar Installations"></div>
      <div class="field-row">
        <div class="form-field"><label class="form-label">Value <span class="form-required">*</span></label>
          <input id="kpi-value" class="form-input" placeholder="e.g. 1,240"></div>
        <div class="form-field"><label class="form-label">Unit</label>
          <input id="kpi-unit" class="form-input" placeholder="e.g. systems, MW, %"></div>
      </div>`,
    saveFn: async () => {
      const name = val('kpi-name')
      if (!name) { toast('Label required','warning'); return }
      await api('POST', '/api/kpis', { name, label:name, value: val('kpi-value'), unit: val('kpi-unit') })
      toast('KPI added'); closeDrawer(); await renderKpis()
    }
  })
}

async function deleteKpi(id) {
  confirmDelete('Delete this KPI?', async () => {
    await api('DELETE', `/api/kpis/${id}`)
    toast('KPI deleted'); await renderKpis()
  })
}

// ─── SOLAR REGISTRY ───────────────────────────
async function renderSolarRegistry() {
  const vc = document.getElementById('view-container')

  // Load stats and preview rows in parallel
  let stats = null, preview = []
  try {
    const [sRes, iRes] = await Promise.all([
      fetch('/api/solar/stats', { credentials: 'include' }),
      fetch('/api/solar/installations', { credentials: 'include' }),
    ])
    if (sRes.ok) stats = await sRes.json()
    if (iRes.ok) preview = await iRes.json()
  } catch (_) {}

  const fmtNum = n => Number.isFinite(n) ? n.toLocaleString() : '—'
  const statCard = (label, value, sub='') => `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;min-width:130px">
      <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:0 0 4px">${label}</p>
      <p style="font-size:24px;font-weight:700;color:#0f172a;margin:0">${value}</p>
      ${sub ? `<p style="font-size:11px;color:#94a3b8;margin:4px 0 0">${sub}</p>` : ''}
    </div>`

  const totalKW  = stats ? fmtNum(stats.totalKWExtracted) : '—'
  const total    = stats ? fmtNum(stats.total) : (preview.length ? fmtNum(preview.length) : '—')
  const complete = stats?.byStatus?.find(s=>s.status==='Complete')?.count
  const lastMod  = stats?.fileLastModified ? new Date(stats.fileLastModified).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : 'No file uploaded yet'

  // Top 20 preview rows
  const shown = preview.slice(0, 20)

  vc.innerHTML = `
    <div class="view-header">
      <div>
        <h2 class="view-title">Solar PV Registry</h2>
        <p class="view-sub">Permit data powering the GIS heat map and solar statistics</p>
      </div>
    </div>

    <!-- ── Upload card ── -->
    <div style="background:#fffbeb;border:2px dashed #f59e0b;border-radius:12px;padding:24px 28px;margin-bottom:24px" class="write-only">
      <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap">
        <div style="flex:1;min-width:220px">
          <p style="font-weight:700;color:#92400e;margin:0 0 4px;font-size:15px">Upload Solar Permit Data (Excel)</p>
          <p style="font-size:13px;color:#78350f;margin:0 0 10px">
            Replaces the active dataset. Required columns: <strong>Permit Number, Address, Permit Type, Permit Status,
            Permit Issue Date, Permit Description, Extracted AC Capacity, Annual Output (kWh), latitude, longitude</strong>.
          </p>
          <p style="font-size:12px;color:#b45309;margin:0">Last file: <strong>${lastMod}</strong></p>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
          <label style="cursor:pointer">
            <input type="file" id="solar-excel-input" accept=".xlsx,.xls" style="display:none" onchange="uploadSolarExcel(this)">
            <span class="btn btn-primary" style="background:#d97706;border-color:#d97706" onclick="document.getElementById('solar-excel-input').click()">
              Choose Excel File
            </span>
          </label>
          <p id="solar-upload-status" style="font-size:12px;color:#6b7280;margin:0"></p>
        </div>
      </div>
    </div>

    <!-- ── Summary stats ── -->
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px">
      ${statCard('Total Permits', total)}
      ${statCard('Completed', fmtNum(complete), 'installations')}
      ${statCard('Total Capacity', totalKW + ' kW', 'extracted from permits')}
      ${stats?.byYear?.length ? statCard('Years', stats.byYear[0].year + '–' + stats.byYear[stats.byYear.length-1].year, 'data range') : ''}
    </div>

    ${preview.length === 0 ? `
      <div style="text-align:center;padding:48px 24px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
        <p style="color:#64748b;font-size:15px;margin:0 0 8px">No solar permit data loaded yet.</p>
        <p style="color:#94a3b8;font-size:13px;margin:0">Upload your Excel file above to populate the GIS heat map and solar statistics pages.</p>
      </div>` : `

    <!-- ── District breakdown ── -->
    ${stats?.byDistrict?.length ? `
    <div style="margin-bottom:24px">
      <h3 style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:0 0 10px">Permits by Parish</h3>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${stats.byDistrict.map(d=>`
          <span style="background:#e0f2fe;color:#0369a1;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:500">
            ${esc(d.district)} <strong>${d.count}</strong>
          </span>`).join('')}
      </div>
    </div>` : ''}

    <!-- ── Preview table ── -->
    <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <h3 style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:0">
        Data Preview (first ${shown.length} of ${fmtNum(preview.length)} records)
      </h3>
      <div class="filter-search" style="width:240px">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" placeholder="Filter preview…" oninput="filterTable(this.value,'sol-tbody','sol-rows')">
      </div>
    </div>
    <div class="table-wrap">
      <table class="cms-table">
        <thead><tr>
          <th>Permit #</th>
          <th>Address</th>
          <th>Status</th>
          <th>Issue Date</th>
          <th style="text-align:right">Capacity (kW)</th>
          <th style="text-align:right">Annual kWh</th>
          <th style="text-align:right">Lat / Lng</th>
        </tr></thead>
        <tbody id="sol-tbody">
          ${shown.map(s => `<tr class="sol-rows">
            <td style="font-family:monospace;font-size:12px;white-space:nowrap">${esc(s.id||'—')}</td>
            <td class="td-title"><span class="td-title-text" style="max-width:260px">${esc(s.address||s.name||'—')}</span></td>
            <td>${statusBadge(s.status||'Unknown')}</td>
            <td class="td-muted" style="white-space:nowrap">${s.installDate ? formatDate(s.installDate) : '—'}</td>
            <td class="td-muted" style="text-align:right">${s.capacity ? s.capacity.toFixed(3) : '—'}</td>
            <td class="td-muted" style="text-align:right">${s.annualOutput ? fmtNum(s.annualOutput) : '—'}</td>
            <td class="td-muted" style="text-align:right;font-family:monospace;font-size:11px">${s.lat ? s.lat.toFixed(4)+', '+s.lng.toFixed(4) : '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${preview.length > 20 ? `<p style="text-align:center;font-size:12px;color:#94a3b8;margin:8px 0 0">Showing 20 of ${fmtNum(preview.length)} records — all records are used for the GIS map and statistics.</p>` : ''}
    `}
  `
  applyRbac(STATE.role)
}

async function uploadSolarExcel(input) {
  const file = input.files[0]
  if (!file) return
  const statusEl = document.getElementById('solar-upload-status')
  statusEl.textContent = 'Uploading…'
  statusEl.style.color = '#6b7280'
  try {
    const fd = new FormData()
    fd.append('file', file)
    const dfHeaders = STATE.token ? { 'Authorization': 'Bearer ' + STATE.token } : {}
    const res = await fetch('/api/data-files/solar', { method: 'POST', credentials: 'include', headers: dfHeaders, body: fd })
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Upload failed') }
    const data = await res.json()
    const rowInfo = data.inserted != null ? ` — ${data.inserted.toLocaleString()} installations imported` : ` (${(data.size/1024).toFixed(0)} KB)`
    statusEl.textContent = `Uploaded: ${file.name}${rowInfo}`
    statusEl.style.color = '#16a34a'
    toast(data.inserted != null ? `Solar data saved — ${data.inserted.toLocaleString()} installations loaded into database` : 'Solar data file uploaded')
    // Refresh the view to show new stats
    setTimeout(() => renderSolarRegistry(), 1200)
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message
    statusEl.style.color = '#dc2626'
    toast('Upload failed: ' + err.message, 'error')
  }
  input.value = ''
}

function openSolarDrawer(id) {
  const item = id ? (STATE.db.solarInstallations||[]).find(s=>s.id===id)||{} : {}
  openDrawer({
    title: id ? 'Edit Installation' : 'New Installation',
    body: `
      <div class="form-field"><label class="form-label">Address / Location <span class="form-required">*</span></label>
        <input id="sol-addr" class="form-input" value="${esc(item.address||item.name||item.location||'')}" placeholder="Installation address" required></div>
      <div class="field-row">
        <div class="form-field"><label class="form-label">Capacity (kW)</label>
          <input id="sol-cap" type="number" step="0.1" class="form-input" value="${esc(item.capacity||item.capacityKw||'')}"></div>
        <div class="form-field"><label class="form-label">System Type</label>
          <select id="sol-type" class="form-select">
            ${['Residential','Commercial','Industrial','Community','Agricultural','Other'].map(t=>`<option${t===(item.type||item.systemType||'Residential')?' selected':''}>${t}</option>`).join('')}
          </select></div>
      </div>
      <div class="field-row">
        <div class="form-field"><label class="form-label">Install Date</label>
          <input id="sol-date" type="date" class="form-input" value="${esc(((item.installDate||item.date)||'').split('T')[0])}"></div>
        <div class="form-field"><label class="form-label">Status</label>
          <select id="sol-status" class="form-select">
            ${['Active','Inactive','Under Review'].map(s=>`<option${s===(item.status||'Active')?' selected':''}>${s}</option>`).join('')}
          </select></div>
      </div>
      <div class="field-row">
        <div class="form-field"><label class="form-label">Latitude</label>
          <input id="sol-lat" class="form-input" value="${esc(item.lat||item.latitude||'')}" placeholder="32.29…"></div>
        <div class="form-field"><label class="form-label">Longitude</label>
          <input id="sol-lng" class="form-input" value="${esc(item.lng||item.longitude||'')}" placeholder="-64.78…"></div>
      </div>`,
    saveFn: () => saveSolar(id)
  })
}

async function saveSolar(id) {
  const address = val('sol-addr')
  if (!address) { toast('Address is required','warning'); return }
  const payload = { address, name:address, location:address,
    capacity: val('sol-cap'), capacityKw: val('sol-cap'),
    type: val('sol-type'), systemType: val('sol-type'),
    installDate: val('sol-date'), date: val('sol-date'),
    status: val('sol-status'),
    lat: val('sol-lat'), latitude: val('sol-lat'),
    lng: val('sol-lng'), longitude: val('sol-lng') }
  if (id) await api('PUT', `/api/solar/${id}`, payload)
  else     await api('POST', '/api/solar', payload)
  toast(id ? 'Installation updated' : 'Installation added')
  closeDrawer(); await renderSolarRegistry()
}

async function deleteSolar(id) {
  confirmDelete('Delete this solar installation record?', async () => {
    await api('DELETE', `/api/solar/${id}`)
    toast('Installation deleted'); await renderSolarRegistry()
  })
}

// ─── SOLAR INSTALLERS ─────────────────────────
async function renderInstallers() {
  const items = await fetchCollection('installers')
  const vc = document.getElementById('view-container')
  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">Solar Installers Directory</h2><p class="view-sub">${items.length} installer${items.length!==1?'s':''}</p></div>
      <div class="view-actions write-only">
        <button class="btn btn-primary" onclick="openInstallerDrawer()">+ Add Installer</button>
      </div>
    </div>
    <div class="filter-bar">
      <div class="filter-search">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" placeholder="Search installers…" oninput="filterTable(this.value,'inst-tbody','inst-rows')">
      </div>
    </div>
    ${items.length === 0 ? emptyState('No installers listed.','Add Installer','openInstallerDrawer()') : `
    <div class="table-wrap">
      <table class="cms-table">
        <thead><tr><th>Company / Name</th><th>Email</th><th>Phone</th><th>Licence #</th><th>Status</th><th class="th-actions">Actions</th></tr></thead>
        <tbody id="inst-tbody">
          ${items.map(i => `<tr class="inst-rows">
            <td class="td-title"><span class="td-title-text">${esc(i.company||i.name||'—')}</span></td>
            <td class="td-muted">${esc(i.email||'—')}</td>
            <td class="td-muted">${esc(i.phone||'—')}</td>
            <td class="td-muted">${esc(i.licenseNumber||i.licence||'—')}</td>
            <td>${statusBadge(i.status||'Active')}</td>
            <td class="td-actions">
              <button class="btn-icon btn-edit write-only" onclick="openInstallerDrawer('${esc(i.id)}')" title="Edit">✏️</button>
              <button class="btn-icon btn-del write-only" onclick="deleteInstaller('${esc(i.id)}')" title="Delete">🗑️</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`}
  `
  applyRbac(STATE.role)
}

function openInstallerDrawer(id) {
  const item = id ? (STATE.db.installers||[]).find(i=>i.id===id)||{} : {}
  openDrawer({
    title: id ? 'Edit Installer' : 'New Installer',
    body: `
      <div class="form-field"><label class="form-label">Company Name <span class="form-required">*</span></label>
        <input id="ins-company" class="form-input" value="${esc(item.company||item.name||'')}" placeholder="Company name" required></div>
      <div class="form-field"><label class="form-label">Contact Person</label>
        <input id="ins-name" class="form-input" value="${esc(item.contactName||item.contact||'')}" placeholder="Contact name"></div>
      <div class="field-row">
        <div class="form-field"><label class="form-label">Email</label>
          <input id="ins-email" type="email" class="form-input" value="${esc(item.email||'')}"></div>
        <div class="form-field"><label class="form-label">Phone</label>
          <input id="ins-phone" class="form-input" value="${esc(item.phone||'')}"></div>
      </div>
      <div class="field-row">
        <div class="form-field"><label class="form-label">Licence Number</label>
          <input id="ins-lic" class="form-input" value="${esc(item.licenseNumber||item.licence||'')}"></div>
        <div class="form-field"><label class="form-label">Status</label>
          <select id="ins-status" class="form-select">
            ${['Active','Inactive','Suspended'].map(s=>`<option${s===(item.status||'Active')?' selected':''}>${s}</option>`).join('')}
          </select></div>
      </div>
      <div class="form-field"><label class="form-label">Website</label>
        <input id="ins-web" type="url" class="form-input" value="${esc(item.website||item.url||'')}" placeholder="https://…"></div>`,
    saveFn: () => saveInstaller(id)
  })
}

async function saveInstaller(id) {
  const company = val('ins-company')
  if (!company) { toast('Company name is required','warning'); return }
  const payload = { company, name:company, contactName: val('ins-name'),
    email: val('ins-email'), phone: val('ins-phone'),
    licenseNumber: val('ins-lic'), licence: val('ins-lic'),
    status: val('ins-status'), website: val('ins-web') }
  if (id) await api('PUT', `/api/installers/${id}`, payload)
  else     await api('POST', '/api/installers', payload)
  toast(id ? 'Installer updated' : 'Installer added')
  closeDrawer(); await renderInstallers()
}

async function deleteInstaller(id) {
  confirmDelete('Remove this installer?', async () => {
    await api('DELETE', `/api/installers/${id}`)
    toast('Installer removed'); await renderInstallers()
  })
}

// ─── STATISTICS ───────────────────────────────
async function renderStatistics() {
  const vc = document.getElementById('view-container')
  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">Statistics Upload</h2>
        <p class="view-sub">Upload Excel/CSV files to update fleet and energy statistics on the portal</p></div>
    </div>
    <div class="card write-only">
      <div class="card-header"><span class="card-title">Upload Statistics File</span></div>
      <div class="card-body">
        <p style="font-size:.875rem;color:var(--c-text-muted);margin-bottom:1.25rem">
          Upload an Excel (.xlsx) or CSV file with columns: category, label, value, unit, year.
          The portal will automatically update with the new data.
        </p>
        <div id="stat-upload-zone" class="upload-zone" style="max-width:480px">
          <input type="file" id="stat-file-input" accept=".xlsx,.xls,.csv">
          <svg class="upload-icon" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <div class="upload-prompt">
            <p>Drag & drop statistics file here</p>
            <p style="font-size:.8rem;color:var(--c-text-light)">or click to browse</p>
          </div>
          <p class="upload-hint">XLSX, XLS, CSV — max 10 MB</p>
        </div>
        <div id="stat-upload-result" style="margin-top:1rem"></div>
      </div>
    </div>
    <div class="card" style="margin-top:1.25rem">
      <div class="card-header"><span class="card-title">Current Statistics</span></div>
      <div class="card-body" id="stat-current-body">
        <p style="color:var(--c-text-muted);font-size:.875rem">Loading current statistics…</p>
      </div>
    </div>
  `
  applyRbac(STATE.role)
  setupStatUpload()
  loadCurrentStatistics()
}

function setupStatUpload() {
  const zone  = document.getElementById('stat-upload-zone')
  const input = document.getElementById('stat-file-input')
  if (!zone || !input) return
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over') })
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'))
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); handleStatFile(e.dataTransfer.files[0]) })
  input.addEventListener('change', e => handleStatFile(e.target.files[0]))
}

async function handleStatFile(file) {
  if (!file) return
  const result = document.getElementById('stat-upload-result')
  result.innerHTML = '<div class="alert alert-info">Uploading…</div>'
  try {
    const fd = new FormData(); fd.append('file', file)
    const headers = STATE.token ? { 'Authorization': `Bearer ${STATE.token}` } : {}
    const res = await fetch('/api/statistics/upload', { method:'POST', headers, body:fd })
    const data = await res.json()
    if (res.ok) {
      result.innerHTML = '<div class="alert alert-success">Statistics file uploaded and processed successfully.</div>'
      loadCurrentStatistics()
    } else throw new Error(data.message||'Upload failed')
  } catch(e) {
    result.innerHTML = `<div class="alert alert-danger">${esc(e.message)}</div>`
  }
}

async function loadCurrentStatistics() {
  const body = document.getElementById('stat-current-body')
  if (!body) return
  try {
    const data = await api('GET', '/api/statistics')
    if (!data || !data.length) { body.innerHTML = '<p style="color:var(--c-text-muted);font-size:.875rem">No statistics data uploaded yet.</p>'; return }
    body.innerHTML = `<div class="table-wrap"><table class="cms-table"><thead><tr><th>Category</th><th>Label</th><th>Value</th><th>Unit</th><th>Year</th></tr></thead><tbody>
      ${data.map(s=>`<tr><td>${esc(s.category||'—')}</td><td>${esc(s.label||s.name||'—')}</td><td><strong>${esc(s.value||'—')}</strong></td><td class="td-muted">${esc(s.unit||'')}</td><td class="td-muted">${esc(s.year||'')}</td></tr>`).join('')}
    </tbody></table></div>`
  } catch { body.innerHTML = '<p style="color:var(--c-text-muted);font-size:.875rem">Could not load statistics.</p>' }
}

// ─── EDUCATION ────────────────────────────────
async function renderEducation() {
  const items = await fetchCollection('education')
  const vc = document.getElementById('view-container')
  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">Education Resources</h2><p class="view-sub">${items.length} resource${items.length!==1?'s':''}</p></div>
      <div class="view-actions write-only"><button class="btn btn-primary" onclick="openEducationDrawer()">+ Add Resource</button></div>
    </div>
    <div class="filter-bar">
      <div class="filter-search">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" placeholder="Search resources…" oninput="filterTable(this.value,'edu-tbody','edu-rows')">
      </div>
    </div>
    ${items.length===0 ? emptyState('No resources yet.','Add Resource','openEducationDrawer()') : `
    <div class="table-wrap"><table class="cms-table">
      <thead><tr><th>Title</th><th>Type</th><th>Category</th><th class="th-actions">Actions</th></tr></thead>
      <tbody id="edu-tbody">
        ${items.map(r=>`<tr class="edu-rows">
          <td class="td-title"><span class="td-title-text">${esc(r.title)}</span></td>
          <td>${badge(r.type||'—','blue')}</td>
          <td class="td-muted">${esc(r.category||'—')}</td>
          <td class="td-actions">
            <button class="btn-icon btn-edit write-only" onclick="openEducationDrawer('${esc(r.id)}')" title="Edit">✏️</button>
            <button class="btn-icon btn-del write-only" onclick="deleteEducation('${esc(r.id)}')" title="Delete">🗑️</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`}
  `; applyRbac(STATE.role)
}

function openEducationDrawer(id) {
  const item = id ? (STATE.db.education||[]).find(r=>r.id===id)||{} : {}
  openDrawer({ title: id?'Edit Resource':'New Resource', body:`
    <div class="form-field"><label class="form-label">Title <span class="form-required">*</span></label>
      <input id="edu-title" class="form-input" value="${esc(item.title||'')}" placeholder="Resource title" required></div>
    <div class="form-field"><label class="form-label">Description</label>
      <textarea id="edu-desc" class="form-textarea" rows="3" placeholder="What this resource covers">${esc(item.description||'')}</textarea></div>
    <div class="field-row">
      <div class="form-field"><label class="form-label">Type</label>
        <select id="edu-type" class="form-select">
          ${['Article','Video','Guide','Report','Toolkit','Infographic','Course'].map(t=>`<option${t===(item.type||'Article')?' selected':''}>${t}</option>`).join('')}
        </select></div>
      <div class="form-field"><label class="form-label">Category</label>
        <select id="edu-cat" class="form-select">
          ${['Solar Energy','Energy Efficiency','Renewable Energy','Policy','General'].map(c=>`<option${c===(item.category||'General')?' selected':''}>${c}</option>`).join('')}
        </select></div>
    </div>
    <div class="form-field"><label class="form-label">Resource URL / Link</label>
      <input id="edu-url" type="url" class="form-input" value="${esc(item.resourceUrl||item.url||item.videoUrl||'')}" placeholder="https://…"></div>
    <div class="form-field"><label class="form-label">Download URL (PDF/file)</label>
      <input id="edu-dl" type="url" class="form-input" value="${esc(item.downloadUrl||'')}" placeholder="https://…"></div>
  `, saveFn:()=>saveEducation(id), saveLabel:id?'Update':'Save' })
}

async function saveEducation(id) {
  const title = val('edu-title')
  if (!title) { toast('Title is required','warning'); return }
  const payload = { title, description:val('edu-desc'), type:val('edu-type'), category:val('edu-cat'), resourceUrl:val('edu-url'), url:val('edu-url'), videoUrl:val('edu-url'), downloadUrl:val('edu-dl') }
  if (id) await api('PUT',`/api/education/${id}`,payload)
  else     await api('POST','/api/education',payload)
  toast(id?'Resource updated':'Resource added'); closeDrawer(); await renderEducation()
}

async function deleteEducation(id) {
  confirmDelete('Delete this resource?', async()=>{ await api('DELETE',`/api/education/${id}`); toast('Resource deleted'); await renderEducation() })
}

// ─── INNOVATION ───────────────────────────────
async function renderInnovation() {
  const items = await fetchCollection('innovation')
  const vc = document.getElementById('view-container')
  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">Innovation & Emerging Tech</h2><p class="view-sub">${items.length} item${items.length!==1?'s':''}</p></div>
      <div class="view-actions write-only"><button class="btn btn-primary" onclick="openInnovationDrawer()">+ Add Item</button></div>
    </div>
    ${items.length===0 ? emptyState('No innovation items yet.','Add Item','openInnovationDrawer()') : `
    <div class="table-wrap"><table class="cms-table">
      <thead><tr><th>Title</th><th>Category</th><th>Status</th><th class="th-actions">Actions</th></tr></thead>
      <tbody>
        ${items.map(i=>`<tr>
          <td class="td-title"><span class="td-title-text">${esc(i.name||i.title)}</span></td>
          <td class="td-muted">${esc(i.category||'—')}</td>
          <td>${statusBadge(i.status)}</td>
          <td class="td-actions">
            <button class="btn-icon btn-edit write-only" onclick="openInnovationDrawer('${esc(i.id)}')" title="Edit">✏️</button>
            <button class="btn-icon btn-del write-only" onclick="deleteInnovation('${esc(i.id)}')" title="Delete">🗑️</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`}
  `; applyRbac(STATE.role)
}

function openInnovationDrawer(id) {
  const item = id ? (STATE.db.innovation||[]).find(i=>i.id===id)||{} : {}
  openDrawer({ title:id?'Edit Item':'New Innovation Item', body:`
    <div class="form-field"><label class="form-label">Title <span class="form-required">*</span></label>
      <input id="inn-title" class="form-input" value="${esc(item.name||item.title||'')}" placeholder="Technology or initiative name" required></div>
    <div class="form-field"><label class="form-label">Description</label>
      <textarea id="inn-desc" class="form-textarea" rows="4" placeholder="Overview of this technology or initiative">${esc(item.description||'')}</textarea></div>
    <div class="field-row">
      <div class="form-field"><label class="form-label">Category</label>
        <select id="inn-cat" class="form-select">
          ${['Battery Storage','EV & Transport','Smart Grid','Green Hydrogen','Offshore Wind','Solar Tech','Other'].map(c=>`<option${c===(item.category||'Other')?' selected':''}>${c}</option>`).join('')}
        </select></div>
      <div class="form-field"><label class="form-label">Status</label>
        <select id="inn-status" class="form-select">
          ${['Active','Research','Pilot','Completed','Inactive'].map(s=>`<option${s===(item.status||'Active')?' selected':''}>${s}</option>`).join('')}
        </select></div>
    </div>
  `, saveFn:()=>saveInnovation(id), saveLabel:id?'Update':'Save' })
}

async function saveInnovation(id) {
  const title = val('inn-title')
  if (!title) { toast('Title is required','warning'); return }
  const payload = { name:title, title, description:val('inn-desc'), category:val('inn-cat'), status:val('inn-status') }
  if (id) await api('PUT',`/api/innovation/${id}`,payload)
  else     await api('POST','/api/innovation',payload)
  toast(id?'Item updated':'Item added'); closeDrawer(); await renderInnovation()
}

async function deleteInnovation(id) {
  confirmDelete('Delete this item?', async()=>{ await api('DELETE',`/api/innovation/${id}`); toast('Item deleted'); await renderInnovation() })
}

// ─── BURSARY ─────────────────────────────────
async function renderBursary() {
  const items = await fetchCollection('bursaries')
  const vc = document.getElementById('view-container')
  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">Bursary Recipients</h2><p class="view-sub">${items.length} recipient${items.length!==1?'s':''}</p></div>
      <div class="view-actions write-only"><button class="btn btn-primary" onclick="openBursaryDrawer()">+ Add Recipient</button></div>
    </div>
    ${items.length===0 ? emptyState('No bursary recipients yet.','Add Recipient','openBursaryDrawer()') : `
    <div class="table-wrap"><table class="cms-table">
      <thead><tr><th>Name</th><th>Year</th><th>Programme</th><th>School</th><th class="th-actions">Actions</th></tr></thead>
      <tbody>
        ${items.map(r=>`<tr>
          <td class="td-title">${r.photoUrl?`<img src="${esc(r.photoUrl)}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;margin-right:.5rem;vertical-align:middle">`:''}<span>${esc(r.name)}</span></td>
          <td class="td-muted">${esc(r.academicYear||'—')}</td>
          <td class="td-muted">${esc(r.fieldOfStudy||'—')}</td>
          <td class="td-muted">${esc(r.school||'—')}</td>
          <td class="td-actions">
            <button class="btn-icon btn-edit write-only" onclick="openBursaryDrawer('${esc(r.id)}')" title="Edit">✏️</button>
            <button class="btn-icon btn-del write-only" onclick="deleteBursary('${esc(r.id)}')" title="Delete">🗑️</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`}
  `; applyRbac(STATE.role)
}

function openBursaryDrawer(id) {
  const item = id ? (STATE.db.bursaries||[]).find(r=>r.id===id)||{} : {}
  STATE.pendingUploads = {}
  STATE.currentImageUrls = { bursaryImg: item.photoUrl||'' }
  openDrawer({ title:id?'Edit Recipient':'New Recipient', body:`
    <div class="form-field"><label class="form-label">Full Name <span class="form-required">*</span></label>
      <input id="bur-name" class="form-input" value="${esc(item.name||'')}" placeholder="Recipient full name" required></div>
    <div class="field-row">
      <div class="form-field"><label class="form-label">Academic Year</label>
        <input id="bur-year" class="form-input" value="${esc(item.academicYear||'')}" placeholder="${new Date().getFullYear()}"></div>
      <div class="form-field"><label class="form-label">Field of Study</label>
        <input id="bur-prog" class="form-input" value="${esc(item.fieldOfStudy||'')}" placeholder="e.g. Renewable Energy"></div>
    </div>
    <div class="form-field"><label class="form-label">School / Institution</label>
      <input id="bur-school" class="form-input" value="${esc(item.school||'')}" placeholder="University or school name"></div>
    <div class="form-field"><label class="form-label">Education</label>
      <textarea id="bur-education" class="form-textarea" rows="2" placeholder="e.g. Pursuing a Bachelor of Science in Mechanical Engineering at Virginia Tech.">${esc(item.education||'')}</textarea></div>
    <div class="form-field"><label class="form-label">Background</label>
      <textarea id="bur-background" class="form-textarea" rows="3" placeholder="Recipient's personal or academic background…">${esc(item.background||'')}</textarea></div>
    <div class="form-field"><label class="form-label">Achievement</label>
      <textarea id="bur-achievement" class="form-textarea" rows="3" placeholder="Notable achievements, awards, or accomplishments…">${esc(item.achievement||'')}</textarea></div>
    <div class="form-field"><label class="form-label">Focus</label>
      <textarea id="bur-focus" class="form-textarea" rows="2" placeholder="e.g. Independent energy infrastructure and modern technical planning on the island.">${esc(item.focus||'')}</textarea></div>
    <div class="form-field"><label class="form-label">Bio</label>
      <textarea id="bur-desc" class="form-textarea" rows="3" placeholder="Brief summary bio">${esc(item.bio||'')}</textarea></div>
    <div class="form-field">
      <label class="form-label">Photo</label>
      <div id="bur-img-preview">${item.photoUrl?`<div class="upload-preview"><img src="${esc(item.photoUrl)}" class="upload-img"><button type="button" class="upload-remove" onclick="clearImageField('bursaryImg','bur-img-preview','bur-img-zone')">✕</button></div>`:''}</div>
      <div id="bur-img-zone" class="upload-zone" style="${item.photoUrl?'display:none':''}">
        <input type="file" id="bur-img-input" accept="image/*">
        <svg class="upload-icon" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <div class="upload-prompt"><p>Drag & drop photo</p></div>
        <p class="upload-hint">JPG, PNG — max 5 MB</p>
      </div>
    </div>
  `, saveFn:()=>saveBursary(id), saveLabel:id?'Update':'Save' })
  setTimeout(()=>setupImageZone('bur-img-zone','bur-img-input','bur-img-preview','bursaryImg'),50)
}

async function saveBursary(id) {
  const name = val('bur-name')
  if (!name) { toast('Name is required','warning'); return }
  const uploads = await resolveUploads()
  const payload = {
    name, academicYear:val('bur-year'), fieldOfStudy:val('bur-prog'), school:val('bur-school'),
    education:val('bur-education'), background:val('bur-background'),
    achievement:val('bur-achievement'), focus:val('bur-focus'),
    bio:val('bur-desc'), photoUrl: uploads['bursaryImg']||STATE.currentImageUrls['bursaryImg']||''
  }
  if (id) await api('PUT',`/api/bursaries/${id}`,payload)
  else     await api('POST','/api/bursaries',payload)
  toast(id?'Recipient updated':'Recipient added'); closeDrawer(); await renderBursary()
}

async function deleteBursary(id) {
  confirmDelete('Remove this recipient?', async()=>{ await api('DELETE',`/api/bursaries/${id}`); toast('Recipient removed'); await renderBursary() })
}

// ─── LEADERSHIP ───────────────────────────────
async function renderLeadership() {
  const items = await fetchCollection('leadership')
  const vc = document.getElementById('view-container')
  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">Leadership Team</h2><p class="view-sub">${items.length} member${items.length!==1?'s':''}</p></div>
      <div class="view-actions write-only"><button class="btn btn-primary" onclick="openLeadershipDrawer()">+ Add Member</button></div>
    </div>
    ${items.length===0 ? emptyState('No team members yet.','Add Member','openLeadershipDrawer()') : `
    <div class="table-wrap"><table class="cms-table">
      <thead><tr><th>Name</th><th>Role / Title</th><th>Status</th><th class="th-actions">Actions</th></tr></thead>
      <tbody>
        ${items.sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0)).map(m=>`<tr>
          <td class="td-title">${m.imageUrl?`<img src="${esc(m.imageUrl)}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;margin-right:.5rem;vertical-align:middle">`:''}<span>${esc(m.name)}</span></td>
          <td class="td-muted">${esc(m.role||'—')}</td>
          <td>${statusBadge(m.status||'Active')}</td>
          <td class="td-actions">
            <button class="btn-icon btn-edit write-only" onclick="openLeadershipDrawer('${esc(m.id)}')" title="Edit">✏️</button>
            <button class="btn-icon btn-del write-only" onclick="deleteLeadership('${esc(m.id)}')" title="Delete">🗑️</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`}
  `; applyRbac(STATE.role)
}

function openLeadershipDrawer(id) {
  const item = id ? (STATE.db.leadership||[]).find(m=>m.id===id)||{} : {}
  STATE.pendingUploads = {}
  STATE.currentImageUrls = { leaderImg: item.imageUrl||'' }
  openDrawer({ title:id?'Edit Member':'New Member', body:`
    <div class="form-field"><label class="form-label">Full Name <span class="form-required">*</span></label>
      <input id="lea-name" class="form-input" value="${esc(item.name||'')}" placeholder="Full name" required></div>
    <div class="field-row">
      <div class="form-field"><label class="form-label">Role / Title</label>
        <input id="lea-role" class="form-input" value="${esc(item.role||'')}" placeholder="e.g. Director of Energy"></div>
      <div class="form-field"><label class="form-label">Display Order</label>
        <input id="lea-order" type="number" class="form-input" value="${esc(item.displayOrder||'')}" placeholder="1, 2, 3…"></div>
    </div>
    <div class="form-field"><label class="form-label">Biography</label>
      <textarea id="lea-bio" class="form-textarea" rows="4" placeholder="Short professional bio">${esc(item.bio||'')}</textarea></div>
    <div class="form-field">
      <label class="form-label">Photo</label>
      <div id="lea-img-preview">${item.imageUrl?`<div class="upload-preview"><img src="${esc(item.imageUrl)}" class="upload-img"><button type="button" class="upload-remove" onclick="clearImageField('leaderImg','lea-img-preview','lea-img-zone')">✕</button></div>`:''}</div>
      <div id="lea-img-zone" class="upload-zone" style="${item.imageUrl?'display:none':''}">
        <input type="file" id="lea-img-input" accept="image/*">
        <svg class="upload-icon" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <div class="upload-prompt"><p>Drag & drop photo</p></div>
        <p class="upload-hint">JPG, PNG — max 5 MB</p>
      </div>
    </div>
  `, saveFn:()=>saveLeadership(id), saveLabel:id?'Update':'Save' })
  setTimeout(()=>setupImageZone('lea-img-zone','lea-img-input','lea-img-preview','leaderImg'),50)
}

async function saveLeadership(id) {
  const name = val('lea-name')
  if (!name) { toast('Name is required','warning'); return }
  const uploads = await resolveUploads()
  const payload = { name, role:val('lea-role'), bio:val('lea-bio'), displayOrder:parseInt(val('lea-order'))||0, imageUrl: uploads['leaderImg']||STATE.currentImageUrls['leaderImg']||'' }
  if (id) await api('PUT',`/api/leadership/${id}`,payload)
  else     await api('POST','/api/leadership',payload)
  toast(id?'Member updated':'Member added'); closeDrawer(); await renderLeadership()
}

async function deleteLeadership(id) {
  confirmDelete('Remove this team member?', async()=>{ await api('DELETE',`/api/leadership/${id}`); toast('Member removed'); await renderLeadership() })
}

// ─── MEDIA LIBRARY ────────────────────────────
async function renderMedia() {
  const vc = document.getElementById('view-container')
  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">Media Library</h2><p class="view-sub">Uploaded images and documents</p></div>
      <div class="view-actions write-only">
        <label class="btn btn-primary" style="cursor:pointer">
          + Upload File <input type="file" id="media-upload-input" style="display:none" multiple onchange="handleMediaUpload(this.files)">
        </label>
      </div>
    </div>
    <div id="media-grid-wrap"><div style="display:flex;justify-content:center;padding:2rem"><div class="loader-spinner"></div></div></div>
  `
  applyRbac(STATE.role)
  await loadMedia()
}

async function loadMedia() {
  const wrap = document.getElementById('media-grid-wrap')
  if (!wrap) return
  try {
    const files = await api('GET', '/api/media')
    if (!files || !files.length) { wrap.innerHTML = emptyState('No files uploaded yet.'); return }
    wrap.innerHTML = `<div class="media-grid">
      ${files.map(f => {
        const isImg = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.filename||f.url||'')
        return `<div class="media-item">
          ${isImg
            ? `<img src="${esc(f.url)}" class="media-thumb" loading="lazy" alt="${esc(f.filename||'')}"/>`
            : `<div class="media-thumb-pdf">📄</div>`}
          <div class="media-info">
            <div class="media-name" title="${esc(f.filename||f.url||'')}">${esc((f.filename||f.url||'').split('/').pop())}</div>
            <div class="media-meta">${f.size ? fmtBytes(f.size) : ''}</div>
          </div>
          <div class="media-actions">
            <button class="btn btn-sm btn-outline" onclick="copyMediaUrl('${esc(f.url)}')" title="Copy URL">📋 Copy</button>
            <button class="btn btn-sm btn-del write-only" onclick="deleteMediaFile('${esc(f.filename||f.url.split('/').pop())}','${esc(f.url)}')" title="Delete">🗑️</button>
          </div>
        </div>`
      }).join('')}
    </div>`
    applyRbac(STATE.role)
  } catch(e) { wrap.innerHTML = `<div class="alert alert-danger">Could not load media: ${esc(e.message)}</div>` }
}

async function handleMediaUpload(files) {
  const fArr = Array.from(files)
  for (const file of fArr) {
    try {
      await uploadFile(file)
      toast(`${file.name} uploaded`)
    } catch(e) { toast(`Failed to upload ${file.name}: ${e.message}`, 'error') }
  }
  await loadMedia()
}

function copyMediaUrl(url) {
  navigator.clipboard.writeText(window.location.origin + url).then(() => toast('URL copied to clipboard'))
}

async function deleteMediaFile(filename, url) {
  confirmDelete('Delete this file? Any content using it will lose the image.', async () => {
    try {
      await api('DELETE', `/api/media/${encodeURIComponent(filename)}`)
      toast('File deleted'); await loadMedia()
    } catch(e) { toast(e.message||'Delete failed','error') }
  })
}

// ─── AUDIT LOGS ───────────────────────────────
async function renderLogs() {
  const vc = document.getElementById('view-container')
  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">Audit Logs</h2><p class="view-sub">Track all CMS activity</p></div>
      <div class="view-actions">
        <button class="btn btn-outline btn-sm" onclick="exportLogsCsv()">Export CSV</button>
      </div>
    </div>
    <div class="filter-bar">
      <div class="filter-search">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="search" placeholder="Search logs…" oninput="filterTable(this.value,'log-tbody','log-rows')">
      </div>
      <select class="filter-select" onchange="filterLogLevel(this.value)">
        <option value="">All Levels</option><option>info</option><option>warn</option><option>error</option>
      </select>
    </div>
    <div id="log-wrap"><div style="display:flex;justify-content:center;padding:2rem"><div class="loader-spinner"></div></div></div>
  `
  loadLogs()
}

async function loadLogs() {
  const wrap = document.getElementById('log-wrap')
  if (!wrap) return
  try {
    const logs = await api('GET', '/api/logs')
    if (!logs || !logs.length) { wrap.innerHTML = emptyState('No audit logs found.'); return }
    wrap.innerHTML = `<div class="table-wrap"><table class="cms-table">
      <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th><th>Level</th></tr></thead>
      <tbody id="log-tbody">
        ${logs.slice(0,200).map(l=>`<tr class="log-rows log-level-${esc(l.level||'info')}" data-level="${esc(l.level||'info')}">
          <td class="td-muted" style="white-space:nowrap">${formatDate(l.timestamp||l.created_at||l.time)}</td>
          <td class="td-muted">${esc(l.user||l.email||'—')}</td>
          <td><strong>${esc(l.action||l.event||'—')}</strong></td>
          <td class="td-muted" style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(l.details||l.message||'')}</td>
          <td><span class="badge-level">${esc(l.level||'info')}</span></td>
        </tr>`).join('')}
      </tbody>
    </table></div>`
  } catch(e) { wrap.innerHTML = `<div class="alert alert-danger">Could not load logs: ${esc(e.message)}</div>` }
}

function filterLogLevel(level) {
  document.querySelectorAll('.log-rows').forEach(row => {
    row.style.display = (!level || row.dataset.level === level) ? '' : 'none'
  })
}

function exportLogsCsv() {
  const rows = document.querySelectorAll('.log-rows')
  const csv = ['Time,User,Action,Details,Level']
  rows.forEach(r => {
    const cells = r.querySelectorAll('td')
    csv.push([...cells].map(c => `"${c.textContent.replace(/"/g,'""')}"`).join(','))
  })
  const blob = new Blob([csv.join('\n')], { type:'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`
  a.click(); URL.revokeObjectURL(a.href)
}

// ─── SETTINGS ─────────────────────────────────
async function renderSettings() {
  const vc = document.getElementById('view-container')
  vc.innerHTML = `<div style="display:flex;justify-content:center;padding:2rem"><div class="loader-spinner"></div></div>`
  let settings = {}
  try { settings = await api('GET', '/api/settings') } catch {}
  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">Settings</h2><p class="view-sub">Portal configuration and contact information</p></div>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="settings-section">
          <div class="settings-section-title">Site Information</div>
          <div class="settings-grid">
            <div class="form-field"><label class="form-label">Site Name</label>
              <input id="set-name" class="form-input" value="${esc(settings.siteName||settings.name||'Department of Energy')}" placeholder="Site name"></div>
            <div class="form-field"><label class="form-label">Tagline</label>
              <input id="set-tagline" class="form-input" value="${esc(settings.tagline||settings.subtitle||'')}" placeholder="Short tagline"></div>
          </div>
        </div>
        <div class="settings-section">
          <div class="settings-section-title">Contact Information</div>
          <div class="settings-grid">
            <div class="form-field"><label class="form-label">Email Address</label>
              <input id="set-email" type="email" class="form-input" value="${esc(settings.contactEmail||settings.email||'')}"></div>
            <div class="form-field"><label class="form-label">Phone Number</label>
              <input id="set-phone" class="form-input" value="${esc(settings.contactPhone||settings.phone||'')}"></div>
            <div class="form-field"><label class="form-label">Physical Address</label>
              <input id="set-addr" class="form-input" value="${esc(settings.address||'')}"></div>
            <div class="form-field"><label class="form-label">Office Hours</label>
              <input id="set-hours" class="form-input" value="${esc(settings.officeHours||settings.hours||'')}" placeholder="e.g. Mon–Fri 9am–5pm"></div>
          </div>
        </div>
        <div class="settings-section">
          <div class="settings-section-title">Social Media</div>
          <div class="settings-grid">
            <div class="form-field"><label class="form-label">Facebook URL</label>
              <input id="set-fb" type="url" class="form-input" value="${esc(settings.facebook||settings.facebookUrl||'')}" placeholder="https://facebook.com/…"></div>
            <div class="form-field"><label class="form-label">Twitter / X URL</label>
              <input id="set-tw" type="url" class="form-input" value="${esc(settings.twitter||settings.twitterUrl||'')}" placeholder="https://x.com/…"></div>
            <div class="form-field"><label class="form-label">Instagram URL</label>
              <input id="set-ig" type="url" class="form-input" value="${esc(settings.instagram||settings.instagramUrl||'')}" placeholder="https://instagram.com/…"></div>
            <div class="form-field"><label class="form-label">LinkedIn URL</label>
              <input id="set-li" type="url" class="form-input" value="${esc(settings.linkedin||settings.linkedinUrl||'')}" placeholder="https://linkedin.com/…"></div>
          </div>
        </div>
        <div class="settings-section" style="margin-bottom:0">
          <div class="settings-section-title">Portal Notices</div>
          <div class="form-field"><label class="form-label">Banner Message (leave blank to hide)</label>
            <input id="set-banner" class="form-input" value="${esc(settings.bannerMessage||settings.banner||'')}" placeholder="e.g. Office closed 25 Dec"></div>
          <div class="form-field"><label class="form-label">Maintenance Mode</label>
            <select id="set-maintenance" class="form-select" style="max-width:200px">
              <option value="false"${settings.maintenanceMode===true?' selected':''}>Off (Portal Live)</option>
              <option value="true"${settings.maintenanceMode===true?' selected':''}>On (Maintenance)</option>
            </select></div>
        </div>
        <div style="margin-top:1.5rem">
          <button class="btn btn-primary write-only" onclick="saveSettings()">Save Settings</button>
        </div>
      </div>
    </div>
  `
  applyRbac(STATE.role)
}

async function saveSettings() {
  const payload = {
    siteName: val('set-name'), name: val('set-name'), tagline: val('set-tagline'), subtitle: val('set-tagline'),
    contactEmail: val('set-email'), email: val('set-email'),
    contactPhone: val('set-phone'), phone: val('set-phone'),
    address: val('set-addr'), officeHours: val('set-hours'), hours: val('set-hours'),
    facebook: val('set-fb'), facebookUrl: val('set-fb'),
    twitter: val('set-tw'), twitterUrl: val('set-tw'),
    instagram: val('set-ig'), instagramUrl: val('set-ig'),
    linkedin: val('set-li'), linkedinUrl: val('set-li'),
    bannerMessage: val('set-banner'), banner: val('set-banner'),
    maintenanceMode: document.getElementById('set-maintenance')?.value === 'true'
  }
  await api('PUT', '/api/settings', payload)
  toast('Settings saved')
}

// ─── SEARCH RESULTS ───────────────────────────
function renderSearchResults() {
  const q = (STATE.searchQuery||'').toLowerCase()
  const vc = document.getElementById('view-container')
  if (!q) { vc.innerHTML = emptyState('Enter a search term in the top bar.'); return }

  const results = []
  const db = STATE.db

  ;(db.news||[]).forEach(i => {
    if ((i.title||'').toLowerCase().includes(q)||(i.summary||'').toLowerCase().includes(q))
      results.push({ section:'News', title:i.title, sub:i.summary, action:`navigate('news')` })
  })
  ;(db.policies||[]).forEach(i => {
    if ((i.title||'').toLowerCase().includes(q))
      results.push({ section:'Policies', title:i.title, sub:i.category, action:`navigate('policies')` })
  })
  ;(db.consultations||[]).forEach(i => {
    if ((i.title||'').toLowerCase().includes(q))
      results.push({ section:'Consultations', title:i.title, sub:i.description, action:`navigate('consultations')` })
  })
  ;(db.projects||[]).forEach(i => {
    if ((i.name||i.title||'').toLowerCase().includes(q))
      results.push({ section:'Projects', title:i.name||i.title, sub:i.description, action:`navigate('projects')` })
  })
  ;(db.installers||[]).forEach(i => {
    if ((i.company||i.name||'').toLowerCase().includes(q))
      results.push({ section:'Installers', title:i.company||i.name, sub:i.email, action:`navigate('installers')` })
  })

  vc.innerHTML = `
    <div class="view-header">
      <div><h2 class="view-title">Search Results</h2>
        <p class="view-sub">${results.length} result${results.length!==1?'s':''} for "<strong>${esc(STATE.searchQuery)}</strong>"</p></div>
    </div>
    ${results.length===0 ? emptyState('No matching content found.') : `
    <div class="table-wrap"><table class="cms-table">
      <thead><tr><th>Section</th><th>Title</th><th>Details</th><th class="th-actions">Go</th></tr></thead>
      <tbody>
        ${results.map(r=>`<tr>
          <td>${badge(r.section,'teal')}</td>
          <td class="td-title"><span class="td-title-text">${esc(r.title)}</span></td>
          <td class="td-muted">${esc((r.sub||'').slice(0,80))}</td>
          <td class="td-actions"><button class="btn btn-sm btn-outline" onclick="${r.action}">View →</button></td>
        </tr>`).join('')}
      </tbody>
    </table></div>`}
  `
}

// ─── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', init)
