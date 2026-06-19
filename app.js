// Content Management System Logic for Department of Energy Website (energy.bm)
// Updated for Full-Stack Dynamic Server Integration
// â”€â”€ Responsive Sidebar Toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MOBILE_BREAKPOINT = 900;

function toggleSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  const btn      = document.getElementById('sidebar-toggle');
  const isOpen   = sidebar.classList.contains('sidebar-open');

  if (isOpen) {
    sidebar.classList.remove('sidebar-open');
    overlay.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    btn.classList.remove('is-open');
  } else {
    sidebar.classList.add('sidebar-open');
    overlay.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    btn.classList.add('is-open');
  }
}

function closeSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  const btn      = document.getElementById('sidebar-toggle');
  sidebar.classList.remove('sidebar-open');
  overlay.classList.remove('active');
  if (btn) {
    btn.setAttribute('aria-expanded', 'false');
    btn.classList.remove('is-open');
  }
}

// Auto-close on nav link click when in mobile mode
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('aside#sidebar nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) closeSidebar();
    });
  });

  // Also close if viewport is resized back to desktop while drawer is open
  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) closeSidebar();
  });
});
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function isFutureDate(dateStr) {
  if (!dateStr) return false;
  const inputDateStr = dateStr.split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];
  return inputDateStr > todayStr;
}

function isPastDate(dateStr) {
  if (!dateStr) return false;
  const inputDateStr = dateStr.split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];
  return inputDateStr < todayStr;
}

let db = {
  kpis: [], news: [], policies: [], consultations: [], 
  projects: [], tracker: [], installers: [], 
  education: [], settings: {},
  solarInstallations: [], innovation: []
};

// 1. Initialize State from Backend API
async function initDatabase() {
  try {
    const response = await fetch('/api/db');
    db = await response.json();
    console.log("Database synchronized with backend server API.");
  } catch (e) {
    console.error("Failed to connect to backend server. Utilizing localStorage fallback.", e);
    const saved = localStorage.getItem('doe_cms_db');
    if (saved) {
      db = JSON.parse(saved);
    } else {
      db = { ...INITIAL_MOCK_DATA };
    }
  }
}

// Sync single collection from backend
async function syncCollection(name) {
  try {
    const response = await fetch(`/api/${name}`);
    db[name] = await response.json();
  } catch (e) {
    console.error(`Error syncing collection ${name}:`, e);
  }
}

// 2. Navigation & Routing
let currentActiveView = 'dashboard';

function setupNavigation() {
  const sidebarLinks = document.querySelectorAll('aside#sidebar nav a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetView = link.getAttribute('data-view');
      if (!targetView) return;
      
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Clear global search input when navigating explicitly via sidebar
      const searchInput = document.getElementById('global-search');
      if (searchInput) searchInput.value = '';
      
      switchView(targetView);
    });
  });
  
  // Site selector removed â€” single-site CMS
}

async function switchView(viewId) {
  currentActiveView = viewId;
  
  const views = document.querySelectorAll('.content-view');
  views.forEach(v => {
    v.classList.remove('active');
    if (v.id === `${viewId}-view`) {
      v.classList.add('active');
    }
  });
  
  const headerTitle = document.getElementById('header-title-text');
  if (headerTitle) {
    headerTitle.textContent = getFriendlyViewName(viewId);
  }
  
  // Re-fetch database to ensure fresh state
  await initDatabase();
  renderCurrentView();
}

function getFriendlyViewName(viewId) {
  const names = {
    'dashboard': 'Dashboard Metrics & Overview',
    'news': 'News & Media Management',
    'policies': 'Policies',
    'consultations': 'Public Consultations',
    'projects': 'Projects & Government Initiatives',
    'tracker': 'Policy & Legislation Tracker',
    'kpis': 'Dashboard KPI Management',
    'installers': 'Registered Solar PV Installers',
    'education': 'Education & Public Awareness',
    'logs': 'Security Action Audit Logs',
    'recycleBin': 'System Recycle Bin',
    'search': 'Global Search Results',
    'preview': 'Live Portal Preview',
    'settings': 'CMS & Global Site Settings',
    'innovation': 'Energy Innovation & Emerging Technologies',
    'statistics': 'Statistics & Data File Manager',
  };
  return names[viewId] || 'CMS Admin';
}

function getMatchingViewId(query) {
  const q = query.toLowerCase().trim();
  if (['dashboard', 'home', 'main', 'main dashboard'].includes(q)) return 'dashboard';
  if (['news', 'news & media', 'media', 'articles'].includes(q)) return 'news';
  if (['policies', 'policy', 'acts', 'policies & acts'].includes(q)) return 'policies';
  if (['consultations', 'consultation', 'public consultations'].includes(q)) return 'consultations';
  if (['projects', 'programmes', 'initiatives', 'active programmes', 'energy projects'].includes(q)) return 'projects';
  if (['tracker', 'policy progress tracker', 'progress'].includes(q)) return 'tracker';
  if (['kpis', 'renewable dashboard kpis', 'metrics', 'dashboard metrics'].includes(q)) return 'kpis';
  if (['installers', 'solar installers', 'installers directory', 'solar pv installers directory'].includes(q)) return 'installers';
  if (['solarinstallations', 'registry', 'solar installation registry', 'pv registry', 'solar pv registry'].includes(q)) return 'solarInstallations';
  if (['education', 'education & stem', 'stem', 'resources'].includes(q)) return 'education';
  if (['innovation', 'innovation & emerging technologies', 'emerging technologies', 'energy innovation'].includes(q)) return 'innovation';
  if (['settings', 'system settings'].includes(q)) return 'settings';
  if (['logs', 'audit logs', 'system audit logs'].includes(q)) return 'logs';
  if (['recycle bin', 'recycle', 'bin', 'trash'].includes(q)) return 'recycleBin';
  return null;
}

function renderCurrentView(event) {
  const searchInput = document.getElementById('global-search');
  if (searchInput && searchInput.value.trim() !== '') {
    const query = searchInput.value.trim().toLowerCase();
    
    // Intercept Enter key for direct page navigation
    if (event && event.key === 'Enter') {
      const targetView = getMatchingViewId(query);
      if (targetView) {
        searchInput.value = ''; // Clear search input
        switchView(targetView);
        return;
      }
    }

    if (currentActiveView !== 'search') {
      currentActiveView = 'search';
      const views = document.querySelectorAll('.content-view');
      views.forEach(v => {
        v.classList.remove('active');
        if (v.id === 'search-view') v.classList.add('active');
      });
      const headerTitle = document.getElementById('header-title-text');
      if (headerTitle) headerTitle.textContent = 'Global Search Results';
      const sidebarLinks = document.querySelectorAll('aside#sidebar nav a');
      sidebarLinks.forEach(l => l.classList.remove('active'));
    }
    performGlobalSearch();
    return;
  }

  switch (currentActiveView) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'news':
      renderNews();
      break;
    case 'policies':
      renderPolicies();
      break;
    case 'consultations':
      renderConsultations();
      break;
    case 'projects':
      renderProjects();
      break;
    case 'tracker':
      renderTracker();
      break;
    case 'kpis':
      renderKPIs();
      break;
    case 'installers':
      renderInstallers();
      break;
    case 'education':
      renderEducation();
      break;
    case 'logs':
      renderLogs();
      break;
    case 'recycleBin':
      renderRecycleBin();
      break;
    case 'preview':
      renderLivePreview();
      break;
    case 'settings':
      renderSettings();
      break;
    case 'solarInstallations':
      renderSolarInstallations();
      break;
    case 'innovation':
      renderInnovation();
      break;
    case 'statistics':
      switchStatTab('files');
      break;
  }
}

// 3. Render Modules
// --- DASHBOARD ---
function renderDashboard() {
  const newsCount = db.news.length;
  const policiesCount = db.policies.length;
  const consCount = db.consultations.length;
  const projCount = db.projects.length;
  
  document.getElementById('dash-kpi-policies').textContent = policiesCount;
  document.getElementById('dash-kpi-news').textContent = newsCount;
  document.getElementById('dash-kpi-consultations').textContent = consCount;
  document.getElementById('dash-kpi-projects').textContent = projCount;
  
  const recentList = document.getElementById('dashboard-recent-updates');
  recentList.innerHTML = '';
  
  let updates = [];
  db.news.forEach(n => updates.push({ title: n.title, type: 'News & Media', date: n.publishDate }));
  db.policies.forEach(p => updates.push({ title: p.title, type: 'Policy/Publication', date: p.effectiveDate }));
  db.consultations.forEach(c => updates.push({ title: c.title, type: 'Consultation', date: c.startDate }));
  
  updates.sort((a,b) => new Date(b.date) - new Date(a.date));
  
  if (updates.length === 0) {
    recentList.innerHTML = '<li class="card-list-item"><div class="item-details"><div class="item-title">No recent content updates.</div></div></li>';
  } else {
    updates.slice(0, 5).forEach(upd => {
      const li = document.createElement('li');
      li.className = 'card-list-item';
      li.innerHTML = `
        <div class="item-details">
          <div class="item-title">${escapeHTML(upd.title)}</div>
          <div class="item-meta">${upd.type} &bull; ${upd.date}</div>
        </div>
      `;
      recentList.appendChild(li);
    });
  }
  
  const docList = document.getElementById('dashboard-recent-docs');
  docList.innerHTML = '';
  if (!db.media || db.media.length === 0) {
    docList.innerHTML = '<li class="card-list-item"><div class="item-details"><div class="item-title">No uploaded documents.</div></div></li>';
  } else {
    db.media.slice(0, 5).forEach(m => {
      const li = document.createElement('li');
      li.className = 'card-list-item';
      li.innerHTML = `
        <div class="item-details">
          <div class="item-title">${escapeHTML(m.name)}</div>
          <div class="item-meta">${m.type.toUpperCase()} &bull; ${m.size} &bull; By ${m.uploadedBy}</div>
        </div>
        <div class="item-meta">${m.date}</div>
      `;
      docList.appendChild(li);
    });
  }
  
  renderHealthWarnings();
}

function renderHealthWarnings() {
  const container = document.getElementById('dashboard-health-warnings');
  if (!container) return;
  container.innerHTML = '';
  
  const warnings = [];
  
  // 1. Settings completeness check
  if (!db.settings.contactPhone || !(db.settings.contactLocation || db.settings.contactOfficeLocation) || !db.settings.allowedFileTypes || !db.settings.maxUploadSize) {
    warnings.push({
      type: 'warning',
      text: 'Global contact details or upload governance constraints are not fully configured in Settings.'
    });
  }
  
  // 2. Pending installers check
  const pendingInstallers = (db.installers || []).filter(i => i.status === 'Pending' || i.status === 'Draft').length;
  if (pendingInstallers > 0) {
    warnings.push({
      type: 'warning',
      text: `${pendingInstallers} Solar PV Installer registrations are pending review and approval.`
    });
  }
  
  // 3. Expired active consultations check
  const now = new Date();
  const expiredConsultations = (db.consultations || []).filter(c => c.status === 'Open' && c.endDate && new Date(c.endDate) < now).length;
  if (expiredConsultations > 0) {
    warnings.push({
      type: 'warning',
      text: `${expiredConsultations} consultations are past their closing date but still marked Open.`
    });
  }
  
  // 4. Missing SEO tags in Static Pages check
  const missingSeoPages = (db.staticPages || []).filter(p => !p.seoTitle || !p.seoDescription || !p.seoKeywords).length;
  if (missingSeoPages > 0) {
    warnings.push({
      type: 'warning',
      text: `${missingSeoPages} static site pages are missing complete SEO titles, meta descriptions, or keywords.`
    });
  }
  
  if (warnings.length === 0) {
    container.innerHTML = `
      <li style="display:flex; align-items:center; gap:0.5rem; color:#10b981; font-weight:500;">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        All system check audits passing. Platform status: Healthy
      </li>
    `;
  } else {
    warnings.forEach(w => {
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.alignItems = 'flex-start';
      li.style.gap = '0.5rem';
      li.style.color = '#cbd5e1';
      li.innerHTML = `
        <span style="color:#f59e0b; flex-shrink:0;">âš ï¸</span>
        <span>${escapeHTML(w.text)}</span>
      `;
      container.appendChild(li);
    });
  }
  
  // Fetch and append Recycle Bin items count dynamically
  try {
    fetch('/api/recycleBin')
      .then(res => res.json())
      .then(binItems => {
        if (binItems && binItems.length > 0) {
          const li = document.createElement('li');
          li.style.display = 'flex';
          li.style.alignItems = 'flex-start';
          li.style.gap = '0.5rem';
          li.style.color = '#cbd5e1';
          li.innerHTML = `
            <span style="color:var(--accent-cyan); flex-shrink:0;">â„¹ï¸</span>
            <span>Recycle Bin contains ${binItems.length} soft-deleted items. <a href="#" onclick="switchView('recycleBin'); return false;" style="color:var(--accent-cyan); text-decoration:underline;">View Recycle Bin</a></span>
          `;
          container.appendChild(li);
        }
      });
  } catch (err) {
    console.error("Failed to fetch recycle bin count", err);
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Real File Upload API Integration helper
function handleRealFileUpload(inputId, targetInputId) {
  const fileInput = document.getElementById(inputId);
  if (!fileInput.files || fileInput.files.length === 0) return;
  
  // Resolve correct status element ID
  let statusId = inputId.replace('input', 'upload-status');
  if (!document.getElementById(statusId)) {
    statusId = inputId.replace('-file-input', '-upload-status')
                     .replace('-file', '-upload-status')
                     .replace('input', 'upload-status');
  }
  
  const statusText = document.getElementById(statusId);
  const file = fileInput.files[0];
  
  const formData = new FormData();
  formData.append('file', file);
  
  const xhr = new XMLHttpRequest();
  
  // Track upload progress dynamically
  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const percentComplete = Math.round((event.loaded / event.total) * 100);
      if (statusText) {
        statusText.innerHTML = `
          <div style="width:100%; display:flex; flex-direction:column; gap:0.25rem; margin-top:0.4rem;">
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--primary-light); font-weight:600;">
              <span>Uploading ${escapeHTML(file.name)}</span>
              <span>${percentComplete}%</span>
            </div>
            <div style="width:100%; height:6px; background-color:var(--border-color); border-radius:4px; overflow:hidden;">
              <div style="width:${percentComplete}%; height:100%; background-color:var(--primary-light); transition: width 0.1s ease;"></div>
            </div>
          </div>
        `;
      }
    }
  };
  
  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const result = JSON.parse(xhr.responseText);
        if (result.success) {
          document.getElementById(targetInputId).value = result.url;
          if (statusText) {
            statusText.innerHTML = `<span style="color:var(--success); font-weight:600;">âœ“ Uploaded: ${escapeHTML(file.name)}</span>`;
          }
        } else {
          if (statusText) {
            statusText.innerHTML = `<span style="color:var(--danger)">Upload failed: ${escapeHTML(result.error || "Unknown error")}</span>`;
          }
        }
      } catch (e) {
        if (statusText) {
          statusText.innerHTML = `<span style="color:var(--danger)">Upload failed to parse response.</span>`;
        }
      }
    } else {
      let errText = "Upload failed with status code " + xhr.status;
      try {
        const errObj = JSON.parse(xhr.responseText);
        if (errObj.error) errText = errObj.error;
      } catch (e) {}
      if (statusText) {
        statusText.innerHTML = `<span style="color:var(--danger)">${escapeHTML(errText)}</span>`;
      }
    }
  };
  
  xhr.onerror = () => {
    if (statusText) {
      statusText.innerHTML = `<span style="color:var(--danger)">Connection error during upload.</span>`;
    }
  };
  
  xhr.open('POST', '/api/upload', true);
  xhr.send(formData);
}

// --- NEWS MANAGEMENT ---
function renderNews() {
  const tbody = document.querySelector('#news-table tbody');
  tbody.innerHTML = '';
  
  db.news.forEach(item => {
    const tr = document.createElement('tr');
    const statusClass = item.status === 'Published' ? 'badge-published' : 'badge-draft';
    
    tr.innerHTML = `
      <td style="font-weight:600; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(item.title)}</td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(item.summary || item.excerpt || '')}</td>
      <td>${item.publishDate || item.publish_date || ''}</td>
      <td><span class="badge ${statusClass}">${item.status}</span>${item.attachment_url || item.attachmentUrl ? ' <span style="font-size:0.7rem;background:#dbeafe;color:#1e40af;padding:1px 6px;border-radius:4px;">📎 Doc</span>' : ''}</td>
      <td class="action-buttons">
        <button class="action-btn edit" onclick="openNewsForm('${item.id}')" title="Edit Article">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="action-btn" onclick="duplicateNews('${item.id}')" title="Duplicate for next month" style="background:rgba(16,185,129,0.1);color:#059669;border:1px solid rgba(16,185,129,0.3);">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button class="action-btn delete" onclick="deleteNews('${item.id}')" title="Delete Article">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openNewsForm(id = null) {
  const modal = document.getElementById('cms-modal');
  const modalBody = modal.querySelector('.modal-body');
  const modalTitle = modal.querySelector('.modal-header h3');

  let item = {
    title: '', summary: '', content: '', image: '', excerpt: '',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'Draft', category: 'Renewable Energy', featured: true,
    attachment_url: '', attachment_name: ''
  };
  if (id) { item = db.news.find(n => n.id === id) || item; modalTitle.textContent = 'Edit News Article'; }
  else { modalTitle.textContent = 'Create News Article'; }

  const att = item.attachment_url || item.attachmentUrl || '';
  const attName = item.attachment_name || item.attachmentName || '';
  const showDoc = !!att;
  const tabBase = 'padding:0.5rem 1.25rem;font-size:0.875rem;font-weight:600;border:none;background:none;cursor:pointer;border-bottom:3px solid transparent;color:#64748b;transition:all 0.15s;';
  const tabActive = 'padding:0.5rem 1.25rem;font-size:0.875rem;font-weight:600;border:none;background:none;cursor:pointer;border-bottom:3px solid #0ea5e9;color:#0ea5e9;transition:all 0.15s;';

  // Store state on window to avoid closure issues
  window._newsFormState = { attachmentUrl: att, attachmentName: attName, imageUrl: item.image || '' };

  modalBody.innerHTML = `
    <form id=”news-form” onsubmit=”return false;”>
      <!-- hidden id stored in JS, not DOM to avoid CSS showing it -->

      <!-- TAB BAR -->
      <div style=”display:flex;gap:0;border-bottom:2px solid #e2e8f0;margin-bottom:1.25rem;”>
        <button type=”button” id=”ntab-manual” style=”${showDoc ? tabBase : tabActive}” onclick=”newsTabSwitch('manual')”>✏️ Write Manually</button>
        <button type=”button” id=”ntab-doc” style=”${showDoc ? tabActive : tabBase}” onclick=”newsTabSwitch('doc')”>📎 Attach Document (PDF / DOC)</button>
      </div>

      <!-- SHARED FIELDS -->
      <div class=”form-group”>
        <label>Article Title *</label>
        <input type=”text” id=”nf-title” value=”${escapeHTML(item.title)}” required placeholder=”e.g. Department of Energy Announces Solar Grant”>
      </div>
      <div class=”form-group”>
        <label>Brief Summary *</label>
        <input type=”text” id=”nf-summary” value=”${escapeHTML(item.summary || item.excerpt || '')}” required placeholder=”Short summary shown on news cards and homepage”>
      </div>
      <div class=”form-row”>
        <div class=”form-group”>
          <label>Category</label>
          <select id=”nf-category”>
            <option value=”Renewable Energy” ${(item.category||'Renewable Energy')==='Renewable Energy'?'selected':''}>Renewable Energy</option>
            <option value=”Events” ${item.category==='Events'?'selected':''}>Events</option>
            <option value=”Policy” ${item.category==='Policy'?'selected':''}>Policy</option>
            <option value=”Education” ${item.category==='Education'?'selected':''}>Education</option>
            <option value=”GIS & Data” ${item.category==='GIS & Data'?'selected':''}>GIS &amp; Data</option>
            <option value=”Announcement” ${item.category==='Announcement'?'selected':''}>Announcement</option>
          </select>
        </div>
        <div class=”form-group”>
          <label>Publish Date *</label>
          <input type=”date” id=”nf-date” value=”${item.publishDate || item.publish_date || ''}” required>
        </div>
      </div>
      <div class=”form-row”>
        <div class=”form-group”>
          <label>Status</label>
          <select id=”nf-status”>
            <option value=”Draft” ${item.status==='Draft'?'selected':''}>Draft (hidden)</option>
            <option value=”Published” ${item.status==='Published'?'selected':''}>Published</option>
            <option value=”Scheduled” ${item.status==='Scheduled'?'selected':''}>Scheduled</option>
          </select>
        </div>
        <div class=”form-group” style=”display:flex;align-items:center;gap:0.5rem;margin-top:1.75rem;”>
          <input type=”checkbox” id=”nf-featured” ${item.featured!==false?'checked':''} style=”width:auto;margin:0;”>
          <label for=”nf-featured” style=”margin:0;cursor:pointer;”>Featured (show on Homepage)</label>
        </div>
      </div>

      <!-- WRITE MANUALLY PANEL -->
      <div id=”npanel-manual” style=”display:${showDoc?'none':'block'};”>
        <div class=”form-group”>
          <label>Article Content</label>
          <textarea id=”nf-content” rows=”7” placeholder=”Write the full article here. Separate paragraphs with a blank line.”>${escapeHTML(item.content || '')}</textarea>
        </div>
      </div>

      <!-- ATTACH DOCUMENT PANEL -->
      <div id=”npanel-doc” style=”display:${showDoc?'block':'none'};”>
        <p style=”font-size:0.85rem;color:#64748b;margin:0 0 0.75rem;”>Attach a PDF or Word document. Readers can download it from the article page. Perfect for monthly updates.</p>
        <div id=”ndoc-dropzone” style=”border:2px dashed #cbd5e1;border-radius:8px;padding:2rem 1rem;text-align:center;cursor:pointer;background:#f8fafc;transition:border-color 0.2s;” onclick=”document.getElementById('ndoc-file-input').click()” ondragover=”event.preventDefault();this.style.borderColor='#0ea5e9';” ondragleave=”this.style.borderColor='#cbd5e1';” ondrop=”newsDocDrop(event)”>
          <svg viewBox=”0 0 24 24” width=”36” height=”36” fill=”none” stroke=”#94a3b8” stroke-width=”1.5” style=”margin:0 auto 0.5rem;display:block;”><path d=”M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z”/><polyline points=”14 2 14 8 20 8”/><line x1=”12” y1=”18” x2=”12” y2=”12”/><polyline points=”9 15 12 18 15 15”/></svg>
          <p style=”font-weight:600;color:#1e293b;margin:0;”>Click to browse or drag &amp; drop</p>
          <p style=”font-size:0.78rem;color:#64748b;margin:0.2rem 0 0;”>PDF, DOC, DOCX — up to 20 MB</p>
          <input type=”file” id=”ndoc-file-input” accept=”.pdf,.doc,.docx” style=”display:none;” onchange=”newsDocUpload(this)”>
        </div>
        <div id=”ndoc-attached” style=”display:${att?'flex':'none'};align-items:center;gap:0.75rem;margin-top:0.75rem;padding:0.75rem 1rem;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;”>
          <svg viewBox=”0 0 24 24” width=”26” height=”26” fill=”none” stroke=”#16a34a” stroke-width=”1.5”><path d=”M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z”/><polyline points=”14 2 14 8 20 8”/></svg>
          <div style=”flex:1;min-width:0;”>
            <p style=”margin:0;font-weight:600;font-size:0.875rem;” id=”ndoc-name”>${escapeHTML(attName||'Attached document')}</p>
            <a id=”ndoc-link” href=”${escapeHTML(att)}” target=”_blank” style=”font-size:0.75rem;color:#0d9488;”>${att ? 'View file' : ''}</a>
          </div>
          <button type=”button” onclick=”newsDocRemove()” style=”background:none;border:none;cursor:pointer;color:#ef4444;font-size:1.2rem;line-height:1;” title=”Remove”>×</button>
        </div>
        <p style=”font-size:0.75rem;color:#64748b;margin-top:0.5rem;”>💡 Monthly tip: use the <strong>Duplicate</strong> button on any article in the list to copy it, then just swap the date and upload the new month's file.</p>
      </div>

      <!-- IMAGE UPLOAD (always shown, outside panels) -->
      <div class=”form-group” style=”margin-top:1rem;padding-top:1rem;border-top:1px solid #e2e8f0;”>
        <label>Featured Photo</label>
        <input type=”text” id=”nf-image” value=”${escapeHTML(item.image||'')}” placeholder=”/images/events/photo.jpg  or  https://...”>
        <input type=”file” id=”nf-image-file” accept=”image/jpeg,image/png,image/webp” style=”display:none;” onchange=”newsImageUpload(this)”>
        <div class=”file-upload-mock” style=”margin-top:0.4rem;padding:0.6rem;cursor:pointer;” onclick=”document.getElementById('nf-image-file').click()”>
          <p id=”nf-image-status”>📸 Click to upload photo (JPG, PNG, WEBP)</p>
        </div>
      </div>
    </form>`;

  // --- Tab switch ---
  window.newsTabSwitch = function(tab) {
    const tabBase2 = 'padding:0.5rem 1.25rem;font-size:0.875rem;font-weight:600;border:none;background:none;cursor:pointer;border-bottom:3px solid transparent;color:#64748b;transition:all 0.15s;';
    const tabActive2 = 'padding:0.5rem 1.25rem;font-size:0.875rem;font-weight:600;border:none;background:none;cursor:pointer;border-bottom:3px solid #0ea5e9;color:#0ea5e9;transition:all 0.15s;';
    document.getElementById('npanel-manual').style.display = tab === 'manual' ? 'block' : 'none';
    document.getElementById('npanel-doc').style.display = tab === 'doc' ? 'block' : 'none';
    document.getElementById('ntab-manual').style.cssText = tab === 'manual' ? tabActive2 : tabBase2;
    document.getElementById('ntab-doc').style.cssText = tab === 'doc' ? tabActive2 : tabBase2;
  };

  // --- Document upload ---
  window.newsDocUpload = async function(input) {
    const file = input && input.files && input.files[0];
    if (!file) return;
    const dz = document.getElementById('ndoc-dropzone');
    dz.style.borderColor = '#0ea5e9';
    dz.querySelector('p').textContent = 'Uploading…';
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd });
      const data = await res.json();
      if (!res.ok) { alert('Upload failed: ' + (data.error || res.status)); return; }
      const url = data.url || '';
      window._newsFormState.attachmentUrl = url;
      window._newsFormState.attachmentName = file.name;
      document.getElementById('ndoc-name').textContent = file.name;
      document.getElementById('ndoc-link').href = url;
      document.getElementById('ndoc-link').textContent = 'View file';
      document.getElementById('ndoc-attached').style.display = 'flex';
      dz.style.borderColor = '#86efac';
      dz.querySelector('p').textContent = '✓ Uploaded — click to replace';
      if (!document.getElementById('nf-title').value) {
        document.getElementById('nf-title').value = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      }
    } catch(e) { alert('Upload error: ' + e.message); }
    if (input.value !== undefined) input.value = '';
  };

  window.newsDocDrop = async function(e) {
    e.preventDefault();
    document.getElementById('ndoc-dropzone').style.borderColor = '#cbd5e1';
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await newsDocUpload({ files: [file] });
  };

  window.newsDocRemove = function() {
    window._newsFormState.attachmentUrl = '';
    window._newsFormState.attachmentName = '';
    document.getElementById('ndoc-attached').style.display = 'none';
    const dz = document.getElementById('ndoc-dropzone');
    dz.style.borderColor = '#cbd5e1';
    dz.querySelector('p').textContent = 'Click to browse or drag & drop';
  };

  // --- Image upload ---
  window.newsImageUpload = async function(input) {
    const file = input && input.files && input.files[0];
    if (!file) return;
    const status = document.getElementById('nf-image-status');
    status.textContent = 'Uploading photo…';
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: fd });
      const data = await res.json();
      if (!res.ok) { alert('Photo upload failed: ' + (data.error || res.status)); return; }
      document.getElementById('nf-image').value = data.url || '';
      window._newsFormState.imageUrl = data.url || '';
      status.innerHTML = '<span style=”color:#059669;font-weight:600;”>✓ Photo uploaded: ' + escapeHTML(file.name) + '</span>';
    } catch(e) { alert('Upload error: ' + e.message); }
    if (input.value !== undefined) input.value = '';
  };

  // --- Save ---
  const saveBtn = modal.querySelector('#modal-save-btn');
  saveBtn.textContent = id ? 'Save Changes' : 'Publish Article';
  saveBtn.onclick = async () => {
    const title = document.getElementById('nf-title').value.trim();
    const summary = document.getElementById('nf-summary').value.trim();
    const pubDate = document.getElementById('nf-date').value;
    if (!title) { alert('Article title is required'); document.getElementById('nf-title').focus(); return; }
    if (!summary) { alert('Brief summary is required'); document.getElementById('nf-summary').focus(); return; }
    if (!pubDate) { alert('Publish date is required'); return; }
    let status = document.getElementById('nf-status').value;
    if (pubDate && isFutureDate(pubDate)) status = 'Scheduled';
    const imageUrl = document.getElementById('nf-image').value.trim() || window._newsFormState.imageUrl || '';
    const article = {
      title,
      summary,
      excerpt: summary,
      content: (document.getElementById('nf-content') || {}).value || '',
      image: imageUrl,
      publishDate: pubDate,
      publish_date: pubDate,
      scheduledPublishDate: status === 'Scheduled' ? pubDate : null,
      status,
      targetSite: 'all',
      modifiedBy: currentUser?.username || 'CMS Editor',
      category: document.getElementById('nf-category').value,
      featured: document.getElementById('nf-featured').checked,
      attachment_url: window._newsFormState.attachmentUrl || '',
      attachment_name: window._newsFormState.attachmentName || '',
    };
    try {
      const url = id ? `/api/news/${id}` : '/api/news';
      const method = id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(article) });
      const result = await res.json();
      if (result.success) { closeModal(); switchView('news'); }
      else { alert('Error saving: ' + (result.error || 'Unknown error')); }
    } catch (e) { alert('Network error: ' + e.message); }
  };

  openModal();
}

async function deleteNews(id) {
  if (confirm("Are you sure you want to delete this news article?")) {
    try {
      const response = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        switchView('news');
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting article.");
    }
  }
}

async function duplicateNews(id) {
  const original = db.news.find(n => n.id === id);
  if (!original) { alert('Article not found'); return; }
  const today = new Date().toISOString().split('T')[0];
  const copy = {
    title: original.title + ' (Copy)',
    summary: original.summary || original.excerpt || '',
    excerpt: original.excerpt || original.summary || '',
    content: original.content || '',
    image: original.image || '',
    publishDate: today,
    publish_date: today,
    status: 'Draft',
    targetSite: 'all',
    modifiedBy: currentUser?.username || 'CMS Editor',
    category: original.category || 'Renewable Energy',
    featured: false,
    attachment_url: '',
    attachment_name: '',
  };
  try {
    const res = await fetch('/api/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(copy) });
    const result = await res.json();
    if (result.success) {
      switchView('news');
      setTimeout(() => openNewsForm(result.id || result.data?.id), 300);
    } else { alert('Could not duplicate: ' + result.error); }
  } catch (e) { alert('Error: ' + e.message); }
}

// --- POLICIES & PUBLICATIONS ---
function renderPolicies() {
  const tbody = document.querySelector('#policies-table tbody');
  tbody.innerHTML = '';
  
  
  db.policies.forEach(item => {
    const tr = document.createElement('tr');
    

    
    let statusClass = 'badge-draft';
    if (item.status === 'In Force') statusClass = 'badge-inforce';
    if (item.status === 'Approved') statusClass = 'badge-approved';
    if (item.status === 'In Development') statusClass = 'badge-development';
    if (item.status === 'Completed') statusClass = 'badge-completed';
    
    tr.innerHTML = `
      <td style="font-weight:600;">${escapeHTML(item.title)}</td>
      <td>${escapeHTML(item.category)}</td>
      <td>${item.effectiveDate}</td>
      <td><span class="badge ${statusClass}">${item.status}</span></td>
      <td class="action-buttons">
        <button class="action-btn edit" onclick="openPolicyForm('${item.id}')" title="Edit Policy">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="action-btn delete" onclick="deletePolicy('${item.id}')" title="Delete Policy">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openPolicyForm(id = null) {
  const modal = document.getElementById('cms-modal');
  const modalBody = modal.querySelector('.modal-body');
  const modalTitle = modal.querySelector('.modal-header h3');
  
  let item = { title: '', category: 'Energy', effectiveDate: new Date().toISOString().split('T')[0], expiryDate: '', description: '', pdfLink: '', status: 'In Development', targetSite: 'all' };
  
  if (id) {
    item = db.policies.find(p => p.id === id) || item;
    modalTitle.textContent = "Edit Policy & Publication";
  } else {
    modalTitle.textContent = "Create Policy & Publication";
  }
  
  modalBody.innerHTML = `
    <form id="policy-form">
      <input type="hidden" name="id" value="${id || ''}">
      <div class="form-group">
        <label>Policy / Document Title*</label>
        <input type="text" name="title" value="${escapeHTML(item.title)}" required placeholder="e.g., National Fuels Policy Guidelines">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Category*</label>
          <select name="category">
            <option value="Energy" ${item.category === 'Energy' ? 'selected' : ''}>Energy</option>
            <option value="Electricity" ${item.category === 'Electricity' ? 'selected' : ''}>Electricity</option>
            <option value="Fuels" ${item.category === 'Fuels' ? 'selected' : ''}>Fuels</option>
            <option value="Transportation" ${item.category === 'Transportation' ? 'selected' : ''}>Transportation</option>
            <option value="Space & Satellite" ${item.category === 'Space & Satellite' ? 'selected' : ''}>Space & Satellite</option>
            <option value="Electronic Communications" ${item.category === 'Electronic Communications' ? 'selected' : ''}>Electronic Communications</option>
          </select>
        </div>
        <div class="form-group">
          <label>Effective Date / Publish Date*</label>
          <input type="date" name="effectiveDate" value="${item.effectiveDate}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Regulatory Status*</label>
          <select name="status">
            <option value="In Development" ${item.status === 'In Development' ? 'selected' : ''}>In Development</option>
            <option value="Approved" ${item.status === 'Approved' ? 'selected' : ''}>Approved</option>
            <option value="In Force" ${item.status === 'In Force' ? 'selected' : ''}>In Force (Legislation)</option>
            <option value="Completed" ${item.status === 'Completed' ? 'selected' : ''}>Completed (Archived/Strategy)</option>
            <option value="Scheduled" ${item.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Summary / Description*</label>
        <textarea name="description" required placeholder="Describe the document mandate, scope, or key goals...">${escapeHTML(item.description)}</textarea>
      </div>

      <div class="form-group">
        <label>PDF Link / Document Attachment URL</label>
        <input type="text" name="pdfLink" id="policy-pdf-link-input" value="${escapeHTML(item.pdfLink)}" placeholder="e.g. /uploads/policy.pdf">
        <input type="file" id="policy-file-input" style="display:none;" onchange="handleRealFileUpload('policy-file-input', 'policy-pdf-link-input')">
        <div class="file-upload-mock" style="margin-top:0.5rem;" onclick="document.getElementById('policy-file-input').click()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"></path></svg>
          <p id="policy-file-upload-status">Upload Real PDF Document (Compliant WCAG Remediation)</p>
        </div>
      </div>
      <div id="version-history-container"></div>
    </form>
  `;
  
  if (id) {
    loadVersionHistory('policies', id);
  }
  
  const saveBtn = modal.querySelector('#modal-save-btn');
  saveBtn.onclick = async () => {
    const form = document.getElementById('policy-form');
    if (!form.reportValidity()) return;
    
    const formData = new FormData(form);
    const formId = formData.get('id');
    
    let computedStatus = formData.get('status');
    const effDate = formData.get('effectiveDate');
    
    if (effDate && isFutureDate(effDate)) {
      computedStatus = 'Scheduled';
    }
    
    const policy = {
      title: formData.get('title'),
      category: formData.get('category'),
      effectiveDate: effDate,
      scheduledPublishDate: computedStatus === 'Scheduled' ? effDate : null,
      expiryDate: '',
      description: formData.get('description'),
      pdfLink: formData.get('pdfLink') || '#',
      status: computedStatus,
      targetSite: 'all',
      modifiedBy: currentUser?.username || 'CMS Editor'
    };
    
    try {
      let response;
      if (formId) {
        response = await fetch(`/api/policies/${formId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(policy)
        });
      } else {
        response = await fetch('/api/policies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(policy)
        });
      }
      const result = await response.json();
      if (result.success) {
        closeModal();
        switchView('policies');
      }
    } catch (e) {
      console.error(e);
      alert("Error saving policy registry entry.");
    }
  };
  
  openModal();
}

async function deletePolicy(id) {
  if (confirm("Are you sure you want to delete this policy document?")) {
    try {
      const response = await fetch(`/api/policies/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        switchView('policies');
      }
    } catch (e) {
      console.error(e);
    }
  }
}

// --- CONSULTATIONS ---
function renderConsultations() {
  const tbody = document.querySelector('#consultations-table tbody');
  tbody.innerHTML = '';
  
  
  db.consultations.forEach(item => {
    const tr = document.createElement('tr');
    

    
    const statusClass = item.status === 'Open' ? 'badge-consultation' : 'badge-closed';
    
    tr.innerHTML = `
      <td style="font-weight:600;">${escapeHTML(item.title)}</td>
      <td>${item.startDate}</td>
      <td>${item.endDate}</td>
      <td><span class="badge ${statusClass}">${item.status}</span></td>
      <td class="action-buttons">
        <button class="action-btn edit" onclick="openConsultationForm('${item.id}')" title="Edit Consultation">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="action-btn delete" onclick="deleteConsultation('${item.id}')" title="Delete Consultation">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openConsultationForm(id = null) {
  const modal = document.getElementById('cms-modal');
  const modalBody = modal.querySelector('.modal-body');
  const modalTitle = modal.querySelector('.modal-header h3');
  
  let item = { title: '', description: '', startDate: new Date().toISOString().split('T')[0], endDate: '', relatedLinks: '', supportingDocs: '', status: 'Open', targetSite: 'all' };
  
  if (id) {
    item = db.consultations.find(c => c.id === id) || item;
    modalTitle.textContent = "Edit Public Consultation";
  } else {
    modalTitle.textContent = "Create Public Consultation";
  }
  
  modalBody.innerHTML = `
    <form id="consultation-form">
      <input type="hidden" name="id" value="${id || ''}">
      <div class="form-group">
        <label>Consultation Title*</label>
        <input type="text" name="title" value="${escapeHTML(item.title)}" required placeholder="e.g., Public Consultation on Space Filings">
      </div>
      <div class="form-group">
        <label>Description & Scope of Issue*</label>
        <textarea name="description" required placeholder="Briefly outline what feedback is requested, key concerns, and guidelines...">${escapeHTML(item.description)}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Start Date*</label>
          <input type="date" name="startDate" value="${item.startDate}" required>
        </div>
        <div class="form-group">
          <label>Close Date*</label>
          <input type="date" name="endDate" value="${item.endDate}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">

        </div>
        <div class="form-group">
          <label>Consultation Status*</label>
          <select name="status">
            <option value="Open" ${item.status === 'Open' ? 'selected' : ''}>Open (Accepting Submissions)</option>
            <option value="Closed" ${item.status === 'Closed' ? 'selected' : ''}>Closed / Archived</option>
            <option value="Scheduled" ${item.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Related Consultation Link (e.g. forum.gov.bm/en/...)</label>
        <input type="url" name="relatedLinks" value="${escapeHTML(item.relatedLinks)}" placeholder="https://forum.gov.bm/en/consultations/...">
      </div>
      <div id="version-history-container"></div>
    </form>
  `;
  
  if (id) {
    loadVersionHistory('consultations', id);
  }
  
  const saveBtn = modal.querySelector('#modal-save-btn');
  saveBtn.onclick = async () => {
    const form = document.getElementById('consultation-form');
    if (!form.reportValidity()) return;
    
    const formData = new FormData(form);
    const formId = formData.get('id');
    
    let computedStatus = formData.get('status');
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    
    if (startDate && isFutureDate(startDate)) {
      computedStatus = 'Scheduled';
    } else if (endDate && isPastDate(endDate)) {
      computedStatus = 'Closed';
    }
    
    const consultation = {
      title: formData.get('title'),
      description: formData.get('description'),
      startDate: startDate,
      endDate: endDate,
      scheduledPublishDate: computedStatus === 'Scheduled' ? startDate : null,
      scheduledExpiryDate: endDate || null,
      relatedLinks: formData.get('relatedLinks'),
      supportingDocs: '',
      status: computedStatus,
      targetSite: 'all',
      modifiedBy: currentUser?.username || 'CMS Editor'
    };
    
    try {
      let response;
      if (formId) {
        response = await fetch(`/api/consultations/${formId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(consultation)
        });
      } else {
        response = await fetch('/api/consultations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(consultation)
        });
      }
      const result = await response.json();
      if (result.success) {
        closeModal();
        switchView('consultations');
      }
    } catch (e) {
      console.error(e);
      alert("Error saving public consultation paper.");
    }
  };
  
  openModal();
}

async function deleteConsultation(id) {
  if (confirm("Are you sure you want to delete this public consultation?")) {
    try {
      const response = await fetch(`/api/consultations/${id}`, { method: 'DELETE' });
      if ((await response.json()).success) {
        switchView('consultations');
      }
    } catch (e) {
      console.error(e);
    }
  }
}

// --- PROJECTS & INITIATIVES ---
function renderProjects() {
  const tbody = document.querySelector('#projects-table tbody');
  tbody.innerHTML = '';
  
  
  db.projects.forEach(item => {
    const tr = document.createElement('tr');
    

    
    let statusClass = 'badge-draft';
    if (item.status === 'Completed') statusClass = 'badge-published';
    if (item.status === 'In Progress') statusClass = 'badge-consultation';
    if (item.status === 'Planning') statusClass = 'badge-development';
    
    tr.innerHTML = `
      <td style="font-weight:600;">${escapeHTML(item.title)}</td>
      <td>${escapeHTML(item.description)}</td>
      <td>${item.timeline}</td>
      <td><span class="badge ${statusClass}">${item.status}</span></td>
      <td class="action-buttons">
        <button class="action-btn edit" onclick="openProjectForm('${item.id}')" title="Edit Project">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="action-btn delete" onclick="deleteProject('${item.id}')" title="Delete Project">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openProjectForm(id = null) {
  const modal = document.getElementById('cms-modal');
  const modalBody = modal.querySelector('.modal-body');
  const modalTitle = modal.querySelector('.modal-header h3');
  
  let item = { title: '', description: '', timeline: '2026 - 2028', status: 'Planning', image: '', targetSite: 'all' };
  
  if (id) {
    item = db.projects.find(p => p.id === id);
    modalTitle.textContent = "Edit Project & Initiative";
  } else {
    modalTitle.textContent = "Create Project & Initiative";
  }
  
  modalBody.innerHTML = `
    <form id="project-form">
      <input type="hidden" name="id" value="${id || ''}">
      <div class="form-group">
        <label>Project Name*</label>
        <input type="text" name="title" value="${escapeHTML(item.title)}" required placeholder="e.g., Balcony Solar Pilot Programme">
      </div>
      <div class="form-group">
        <label>Description & Objectives*</label>
        <textarea name="description" required placeholder="Specify what this government project covers, target capacity, energy impact, etc...">${escapeHTML(item.description)}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Implementation Timeline*</label>
          <input type="text" name="timeline" value="${escapeHTML(item.timeline)}" required placeholder="e.g., 2027 - 2028">
        </div>
        <div class="form-group">
          <label>Project Status*</label>
          <select name="status">
            <option value="Planning" ${item.status === 'Planning' ? 'selected' : ''}>Planning / Concept</option>
            <option value="In Progress" ${item.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${item.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">

        </div>
        <div class="form-group">
          <label>Banner Image (URL or Upload below)</label>
          <input type="text" name="image" id="project-image-url-input" value="${escapeHTML(item.image)}" placeholder="https://images.unsplash.com/...">
          <input type="file" id="project-image-file-input" style="display:none;" onchange="handleRealFileUpload('project-image-file-input', 'project-image-url-input')">
          <div class="file-upload-mock" style="margin-top:0.4rem; padding:0.6rem;" onclick="document.getElementById('project-image-file-input').click()">
            <p id="project-image-upload-status">ðŸ–¼ Click to upload project photo</p>
          </div>
        </div>
      </div>
    </form>
  `;
  
  const saveBtn = modal.querySelector('#modal-save-btn');
  saveBtn.onclick = async () => {
    const form = document.getElementById('project-form');
    if (!form.reportValidity()) return;
    
    const formData = new FormData(form);
    const formId = formData.get('id');
    
    const project = {
      title: formData.get('title'),
      description: formData.get('description'),
      timeline: formData.get('timeline'),
      status: formData.get('status'),
      image: formData.get('image') || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80',
      targetSite: 'all'
    };
    
    try {
      let response;
      if (formId) {
        response = await fetch(`/api/projects/${formId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(project)
        });
      } else {
        response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(project)
        });
      }
      if ((await response.json()).success) {
        closeModal();
        switchView('projects');
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  openModal();
}

async function deleteProject(id) {
  if (confirm("Are you sure you want to delete this project?")) {
    try {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if ((await response.json()).success) {
        switchView('projects');
      }
    } catch (e) {
      console.error(e);
    }
  }
}

// --- POLICY & LEGISLATION PROGRESS TRACKER ---
const TRACKER_STAGES = [
  { value: "Planning", label: "In Development", progress: 15 },
  { value: "Consultation", label: "Open for Consultation", progress: 40 },
  { value: "Review", label: "Under Review / Closed", progress: 60 },
  { value: "Approval", label: "Approved / Tabled", progress: 85 },
  { value: "Implementation", label: "Passed / In Force / Completed", progress: 100 }
];

function renderTracker() {
  const container = document.getElementById('tracker-list-container');
  container.innerHTML = '';
  
  
  db.tracker.forEach(item => {
    const card = document.createElement('div');
    card.className = 'dashboard-card';
    card.style.marginBottom = '1.5rem';
    
    let timelineStepsHTML = '';
    let currentStageIndex = TRACKER_STAGES.findIndex(s => s.value === item.stage);
    if (currentStageIndex === -1) currentStageIndex = 0;
    
    TRACKER_STAGES.forEach((stage, idx) => {
      let stepClass = '';
      if (idx === currentStageIndex) stepClass = 'active';
      else if (idx < currentStageIndex) stepClass = 'completed';
      
      timelineStepsHTML += `
        <div class="tracker-step ${stepClass}">
          <div class="step-dot">${idx + 1}</div>
          <div class="step-label">${stage.value}</div>
        </div>
      `;
    });
    
    card.innerHTML = `
      <div class="card-header">
        <div>
          <h3 style="font-size:1.05rem; font-weight:600;">${escapeHTML(item.name)}</h3>
          <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.25rem;">
            Sector: <strong>${item.sector}</strong> &bull; Type: <strong>${item.type}</strong> &bull; Last updated: ${item.lastUpdated}
          </p>
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center;">

          <span class="badge badge-approved">${escapeHTML(item.statusLabel)}</span>
          <button class="action-btn edit" onclick="openTrackerForm('${item.id}')" title="Edit Tracked Item">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="action-btn delete" onclick="deleteTrackerItem('${item.id}')" title="Delete Tracked Item">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      </div>
      <div style="padding:1.5rem;">
        <div class="tracker-timeline">
          ${timelineStepsHTML}
        </div>
        <div style="margin-top:1.5rem; display:flex; align-items:center; gap:1rem;">
          <div style="flex-grow:1;">
            <div style="display:flex; justify-content:space-between; font-size:0.78rem; font-weight:600; margin-bottom:0.25rem;">
              <span>Overall Completion Progress</span>
              <span>${item.progress}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: ${item.progress}%"></div>
            </div>
          </div>
          <div style="font-size:0.78rem; background:#f8fafc; border:1px solid var(--border-color); padding:0.5rem 0.75rem; border-radius:4px; font-weight:600;">
            Related Document: <a href="${item.relatedDocs || '#'}" target="_blank" style="color:var(--primary-light); text-decoration:none;">${item.relatedDocs ? item.relatedDocs.split('/').pop() : 'None linked'}</a>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function openTrackerForm(id = null) {
  const modal = document.getElementById('cms-modal');
  const modalBody = modal.querySelector('.modal-body');
  const modalTitle = modal.querySelector('.modal-header h3');
  
  let item = { name: '', type: 'Policy', sector: 'Energy', stage: 'Planning', progress: 15, statusLabel: 'In Development', relatedDocs: '', targetSite: 'all' };
  
  if (id) {
    item = db.tracker.find(t => t.id === id);
    modalTitle.textContent = "Edit Tracker Item";
  } else {
    modalTitle.textContent = "Add Tracker Item";
  }
  
  modalBody.innerHTML = `
    <form id="tracker-form">
      <input type="hidden" name="id" value="${id || ''}">
      <div class="form-group">
        <label>Policy or Bill Name*</label>
        <input type="text" name="name" value="${escapeHTML(item.name)}" required placeholder="e.g., Electricity Amendment Act 2026">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Item Type*</label>
          <select name="type">
            <option value="Policy" ${item.type === 'Policy' ? 'selected' : ''}>Policy</option>
            <option value="Strategy" ${item.type === 'Strategy' ? 'selected' : ''}>Strategy</option>
            <option value="Bill" ${item.type === 'Bill' ? 'selected' : ''}>Bill (Parliamentary)</option>
            <option value="Regulation" ${item.type === 'Regulation' ? 'selected' : ''}>Regulation</option>
            <option value="Consultation" ${item.type === 'Consultation' ? 'selected' : ''}>Consultation Document</option>
          </select>
        </div>
        <div class="form-group">
          <label>Sector*</label>
          <select name="sector">
            <option value="Energy" ${item.sector === 'Energy' ? 'selected' : ''}>Energy</option>
            <option value="Electricity" ${item.sector === 'Electricity' ? 'selected' : ''}>Electricity</option>
            <option value="Fuels" ${item.sector === 'Fuels' ? 'selected' : ''}>Fuels</option>
            <option value="Space & Satellite" ${item.sector === 'Space & Satellite' ? 'selected' : ''}>Space & Satellite</option>
            <option value="Electronic Communications" ${item.sector === 'Electronic Communications' ? 'selected' : ''}>Electronic Communications</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">

        </div>
        <div class="form-group">
          <label>Current Development Stage*</label>
          <select name="stage" id="tracker-form-stage" onchange="autoFillTrackerProgress()">
            <option value="Planning" ${item.stage === 'Planning' ? 'selected' : ''}>1. Planning / Drafting</option>
            <option value="Consultation" ${item.stage === 'Consultation' ? 'selected' : ''}>2. Public Consultation</option>
            <option value="Review" ${item.stage === 'Review' ? 'selected' : ''}>3. Under Review & Analysis</option>
            <option value="Approval" ${item.stage === 'Approval' ? 'selected' : ''}>4. Approved / Tabled</option>
            <option value="Implementation" ${item.stage === 'Implementation' ? 'selected' : ''}>5. Implementation / In Force</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Progress percentage (0 - 100)*</label>
          <input type="number" name="progress" id="tracker-form-progress" min="0" max="100" value="${item.progress}" required>
        </div>
        <div class="form-group">
          <label>Custom Status Label*</label>
          <input type="text" name="statusLabel" id="tracker-form-statusLabel" value="${escapeHTML(item.statusLabel)}" required placeholder="e.g. Open for Consultation">
        </div>
      </div>
      <div class="form-group">
        <label>Related Document URL</label>
        <input type="text" name="relatedDocs" id="tracker-doc-input" value="${escapeHTML(item.relatedDocs)}" placeholder="e.g. /uploads/amendment.pdf">
        <input type="file" id="tracker-file-input" style="display:none;" onchange="handleRealFileUpload('tracker-file-input', 'tracker-doc-input')">
        <div class="file-upload-mock" style="margin-top:0.4rem; padding:0.6rem;" onclick="document.getElementById('tracker-file-input').click()">
          <p id="tracker-file-upload-status">ðŸ“„ Upload policy/bill PDF</p>
        </div>
      </div>
    </form>
  `;
  
  const saveBtn = modal.querySelector('#modal-save-btn');
  saveBtn.onclick = async () => {
    const form = document.getElementById('tracker-form');
    if (!form.reportValidity()) return;
    
    const formData = new FormData(form);
    const formId = formData.get('id');
    
    const trackerItem = {
      name: formData.get('name'),
      type: formData.get('type'),
      sector: formData.get('sector'),
      stage: formData.get('stage'),
      progress: parseInt(formData.get('progress')),
      statusLabel: formData.get('statusLabel'),
      relatedDocs: formData.get('relatedDocs') || '',
      lastUpdated: new Date().toISOString().split('T')[0],
      targetSite: 'all'
    };
    
    try {
      let response;
      if (formId) {
        response = await fetch(`/api/tracker/${formId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trackerItem)
        });
      } else {
        response = await fetch('/api/tracker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trackerItem)
        });
      }
      if ((await response.json()).success) {
        closeModal();
        switchView('tracker');
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  openModal();
}

function autoFillTrackerProgress() {
  const stage = document.getElementById('tracker-form-stage').value;
  const progressInput = document.getElementById('tracker-form-progress');
  const labelInput = document.getElementById('tracker-form-statusLabel');
  
  const match = TRACKER_STAGES.find(s => s.value === stage);
  if (match) {
    progressInput.value = match.progress;
    labelInput.value = match.label;
  }
}

async function deleteTrackerItem(id) {
  if (confirm("Are you sure you want to remove this item from the progress tracker?")) {
    try {
      const response = await fetch(`/api/tracker/${id}`, { method: 'DELETE' });
      if ((await response.json()).success) {
        switchView('tracker');
      }
    } catch (e) {
      console.error(e);
    }
  }
}

// --- DASHBOARD METRICS (KPIs) ---
function renderKPIs() {
  const tbody = document.querySelector('#kpis-table tbody');
  tbody.innerHTML = '';
  
  db.kpis.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600;">${escapeHTML(item.name)}</td>
      <td>
        <input type="text" class="form-group" style="padding:0.4rem; margin:0; width:120px; text-align:center; font-weight:700;" 
               id="kpi-val-${item.id}" value="${escapeHTML(item.value)}">
      </td>
      <td>${escapeHTML(item.unit)}</td>
      <td>${item.lastUpdated}</td>
      <td>
        <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="updateKPI('${item.id}')">Save</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function updateKPI(id) {
  const inputVal = document.getElementById(`kpi-val-${id}`).value;
  
  try {
    const response = await fetch(`/api/kpis/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: inputVal })
    });
    const result = await response.json();
    if (result.success) {
      await initDatabase();
      renderKPIs();
      alert(`KPI Updated. Real-time websites synced.`);
    }
  } catch (e) {
    console.error(e);
    alert("Error updating KPI.");
  }
}

// --- SOLAR INSTALLER DIRECTORY ---
function renderInstallers() {
  const tbody = document.querySelector('#installers-table tbody');
  tbody.innerHTML = '';
  
  db.installers.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600;">${escapeHTML(item.name)}</td>
      <td>${escapeHTML(item.contact)}</td>
      <td><a href="${item.website}" target="_blank" style="color:var(--primary-light);">${escapeHTML(item.website)}</a></td>
      <td><span class="badge badge-published">${item.status}</span></td>
      <td class="action-buttons">
        <button class="action-btn edit" onclick="openInstallerForm('${item.id}')" title="Edit Company Details">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="action-btn delete" onclick="deleteInstaller('${item.id}')" title="Remove Company">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openInstallerForm(id = null) {
  const modal = document.getElementById('cms-modal');
  const modalBody = modal.querySelector('.modal-body');
  const modalTitle = modal.querySelector('.modal-header h3');
  
  let item = { name: '', contact: '', website: 'https://', status: 'Active', parish: 'Hamilton', certifications: 'Registered Solar PV Installer, Battery Storage', projects: 0, rating: 5.0, description: '' };
  
  if (id) {
    item = db.installers.find(i => i.id === id);
    modalTitle.textContent = "Edit Installer Record";
  } else {
    modalTitle.textContent = "Register Solar PV Installer";
  }
  
  modalBody.innerHTML = `
    <form id="installer-form">
      <input type="hidden" name="id" value="${id || ''}">
      <div class="form-group">
        <label>Installer Company Name*</label>
        <input type="text" name="name" value="${escapeHTML(item.name)}" required placeholder="e.g. Bermuda Solar Solutions Ltd">
      </div>
      <div class="form-group">
        <label>Contact Information (Email | Phone)*</label>
        <input type="text" name="contact" value="${escapeHTML(item.contact)}" required placeholder="e.g., office@solarsolutions.bm | +1 (441) 555-0199">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Company Website*</label>
          <input type="url" name="website" value="${escapeHTML(item.website)}" required placeholder="https://...">
        </div>
        <div class="form-group">
          <label>Registry Status*</label>
          <select name="status">
            <option value="Active" ${item.status === 'Active' ? 'selected' : ''}>Active / Approved</option>
            <option value="Suspended" ${item.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
          </select>
        </div>
      </div>
      </div>
    </form>
  `;
  
  const saveBtn = modal.querySelector('#modal-save-btn');
  saveBtn.onclick = async () => {
    const form = document.getElementById('installer-form');
    if (!form.reportValidity()) return;
    
    const formData = new FormData(form);
    const formId = formData.get('id');
    
    const installer = {
      name: formData.get('name'),
      contact: formData.get('contact'),
      website: formData.get('website'),
      status: formData.get('status'),
      parish: 'Hamilton',
      certifications: 'Registered Solar PV Installer',
      projects: 0,
      rating: 5.0,
      description: ''
    };
    
    try {
      let response;
      if (formId) {
        response = await fetch(`/api/installers/${formId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(installer)
        });
      } else {
        response = await fetch('/api/installers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(installer)
        });
      }
      if ((await response.json()).success) {
        closeModal();
        switchView('installers');
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  openModal();
}

async function deleteInstaller(id) {
  if (confirm("Are you sure you want to remove this installer from the registry?")) {
    try {
      const response = await fetch(`/api/installers/${id}`, { method: 'DELETE' });
      if ((await response.json()).success) {
        switchView('installers');
      }
    } catch (e) {
      console.error(e);
    }
  }
}

// --- ENERGY INNOVATION & EMERGING TECHNOLOGIES ---
function renderInnovation() {
  const tbody = document.querySelector('#innovation-table tbody');
  tbody.innerHTML = '';
  
  if (!db.innovation) db.innovation = [];
  
  db.innovation.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600;">${escapeHTML(item.title)}</td>
      <td><span class="badge ${item.status === 'Active' ? 'badge-published' : 'badge-draft'}">${escapeHTML(item.status)}</span></td>
      <td>${item.linkTo || item.link_to ? `<code>${escapeHTML(item.linkTo || item.link_to)}</code>` : '<span style="color:#aaa;">None</span>'}</td>
      <td>${item.linkLabel || item.link_label ? escapeHTML(item.linkLabel || item.link_label) : '<span style="color:#aaa;">None</span>'}</td>
      <td style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(item.description)}</td>
      <td class="action-buttons">
        <button class="action-btn edit" onclick="openInnovationForm('${item.id}')" title="Edit Topic">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="action-btn delete" onclick="deleteInnovation('${item.id}')" title="Delete Topic">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openInnovationForm(id = null) {
  const modal = document.getElementById('cms-modal');
  const modalBody = modal.querySelector('.modal-body');
  const modalTitle = modal.querySelector('.modal-header h3');
  
  let item = { title: '', description: '', status: 'Active', link_to: '', link_label: '' };
  
  if (id) {
    item = db.innovation.find(i => i.id === id || String(i.id) === String(id));
    modalTitle.textContent = "Edit Innovation Topic";
  } else {
    modalTitle.textContent = "Add Energy Innovation Topic";
  }
  
  modalBody.innerHTML = `
    <form id="innovation-form">
      <input type="hidden" name="id" value="${id || ''}">
      <div class="form-group">
        <label>Topic Title*</label>
        <input type="text" name="title" value="${escapeHTML(item.title || '')}" required placeholder="e.g. Smart Grids" max="100">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Topic Status*</label>
          <select name="status">
            <option value="Active" ${item.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Research" ${item.status === 'Research' ? 'selected' : ''}>Research</option>
            <option value="Pilot" ${item.status === 'Pilot' ? 'selected' : ''}>Pilot</option>
            <option value="Coming Soon" ${item.status === 'Coming Soon' ? 'selected' : ''}>Coming Soon</option>
          </select>
        </div>
        <div class="form-group">
          <label>Link Label (Optional)</label>
          <input type="text" name="link_label" value="${escapeHTML(item.linkLabel || item.link_label || '')}" placeholder="e.g. View grid data">
        </div>
      </div>
      <div class="form-group">
        <label>Link Destination Route (Optional)</label>
        <input type="text" name="link_to" value="${escapeHTML(item.linkTo || item.link_to || '')}" placeholder="e.g. /dashboard or /projects">
      </div>
      <div class="form-group">
        <label>Description (Max 1000 characters)*</label>
        <textarea name="description" required placeholder="Describe the technology and its potential impact..." style="height:120px;" max="1000">${escapeHTML(item.description || '')}</textarea>
        <div class="character-counter" style="text-align:right; font-size:0.8rem; color:#888; margin-top:2px;">
          <span class="count-current">0</span>/<span class="count-max">1000</span>
        </div>
      </div>
    </form>
  `;
  
  // Setup character counter
  const textarea = modalBody.querySelector('textarea[name="description"]');
  const counterSpan = modalBody.querySelector('.count-current');
  if (textarea && counterSpan) {
    counterSpan.textContent = textarea.value.length;
    textarea.addEventListener('input', () => {
      counterSpan.textContent = textarea.value.length;
    });
  }

  const saveBtn = modal.querySelector('#modal-save-btn');
  saveBtn.onclick = async () => {
    const form = document.getElementById('innovation-form');
    if (!form.reportValidity()) return;
    
    const formData = new FormData(form);
    const formId = formData.get('id');
    
    const topic = {
      title: formData.get('title'),
      status: formData.get('status'),
      link_to: formData.get('link_to') || null,
      link_label: formData.get('link_label') || null,
      description: formData.get('description')
    };
    
    try {
      let response;
      if (formId) {
        response = await fetch(`/api/innovation/${formId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(topic)
        });
      } else {
        response = await fetch('/api/innovation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(topic)
        });
      }
      if ((await response.json()).success) {
        closeModal();
        switchView('innovation');
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  openModal();
}

async function deleteInnovation(id) {
  if (confirm("Are you sure you want to delete this innovation topic?")) {
    try {
      const response = await fetch(`/api/innovation/${id}`, { method: 'DELETE' });
      if ((await response.json()).success) {
        switchView('innovation');
      }
    } catch (e) {
      console.error(e);
    }
  }
}

// --- SOLAR PV REGISTRY & GIS MAP ---
function renderSolarInstallations() {
  const tbody = document.querySelector('#solarInstallations-table tbody');
  tbody.innerHTML = '';
  
  db.solarInstallations.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: monospace; font-size: 0.75rem;">${escapeHTML(item.id)}</td>
      <td style="font-weight:600;">${escapeHTML(item.name)}</td>
      <td>${escapeHTML(item.parish)}</td>
      <td><span class="badge badge-published">${escapeHTML(item.type)}</span></td>
      <td>${escapeHTML(String(item.capacity))} kW</td>
      <td>${escapeHTML(item.installer)}</td>
      <td style="font-family: monospace; font-size: 0.75rem;">(${item.coordinateX}, ${item.coordinateY})</td>
      <td><span class="badge badge-published">${escapeHTML(item.status)}</span></td>
      <td class="action-buttons">
        <button class="action-btn edit" onclick="openSolarInstallationForm('${item.id}')" title="Edit Installation Details">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="action-btn delete" onclick="deleteSolarInstallation('${item.id}')" title="Remove Installation">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openSolarInstallationForm(id = null) {
  const modal = document.getElementById('cms-modal');
  const modalBody = modal.querySelector('.modal-body');
  const modalTitle = modal.querySelector('.modal-header h3');
  
  let item = { id: '', name: '', parish: 'Hamilton', type: 'Residential', capacity: 5.0, status: 'Active', installDate: new Date().toISOString().split('T')[0], installer: '', coordinateX: 50, coordinateY: 50 };
  
  if (id) {
    item = db.solarInstallations.find(i => i.id === id);
    modalTitle.textContent = "Edit Solar PV Installation";
  } else {
    modalTitle.textContent = "Register Solar PV Installation";
  }
  
  const installersOptions = db.installers.map(inst => 
    `<option value="${escapeHTML(inst.name)}" ${item.installer === inst.name ? 'selected' : ''}>${escapeHTML(inst.name)}</option>`
  ).join('');
  
  modalBody.innerHTML = `
    <form id="solar-installation-form">
      <div class="form-row">
        <div class="form-group">
          <label>Installation ID* (Format: REG-YYYY-XXX)</label>
          <input type="text" name="id" value="${escapeHTML(item.id)}" ${id ? 'readonly style="background-color:#eee; cursor:not-allowed;"' : 'required'} placeholder="e.g. REG-2026-001">
        </div>
        <div class="form-group">
          <label>Site / Owner Name*</label>
          <input type="text" name="name" value="${escapeHTML(item.name)}" required placeholder="e.g. Southampton Residence">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Parish*</label>
          <select name="parish" required>
            ${['Hamilton', 'Devonshire', 'Warwick', 'Pembroke', 'Southampton', 'Sandys', 'St. George\'s', 'Paget', 'Smith\'s'].map(p => 
              `<option value="${p}" ${item.parish === p ? 'selected' : ''}>${p}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Installation Type*</label>
          <select name="type" required>
            ${['Residential', 'Commercial', 'Community', 'Utility'].map(t => 
              `<option value="${t}" ${item.type === t ? 'selected' : ''}>${t}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>System Capacity (kW)*</label>
          <input type="number" name="capacity" value="${item.capacity || 0}" step="0.1" min="0.1" required>
        </div>
        <div class="form-group">
          <label>Installer Company*</label>
          <select name="installer" required>
            <option value="">-- Select Installer --</option>
            ${installersOptions}
            <option value="Other" ${!db.installers.some(inst => inst.name === item.installer) && item.installer ? 'selected' : ''}>Other / DIY</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>GIS Coordinate X (0-100)*</label>
          <input type="number" name="coordinateX" value="${item.coordinateX || 50}" min="0" max="100" required>
        </div>
        <div class="form-group">
          <label>GIS Coordinate Y (0-100)*</label>
          <input type="number" name="coordinateY" value="${item.coordinateY || 50}" min="0" max="100" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Installation Date*</label>
          <input type="date" name="installDate" value="${item.installDate || ''}" required>
        </div>
        <div class="form-group">
          <label>Registry Status*</label>
          <select name="status">
            <option value="Active" ${item.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Pending" ${item.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Inactive" ${item.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>
    </form>
  `;
  
  const saveBtn = modal.querySelector('#modal-save-btn');
  saveBtn.onclick = async () => {
    const form = document.getElementById('solar-installation-form');
    if (!form.reportValidity()) return;
    
    const formData = new FormData(form);
    const formId = id || formData.get('id');
    
    const installation = {
      id: formId,
      name: formData.get('name'),
      parish: formData.get('parish'),
      type: formData.get('type'),
      capacity: parseFloat(formData.get('capacity')) || 0,
      installer: formData.get('installer'),
      coordinateX: parseFloat(formData.get('coordinateX')) || 50,
      coordinateY: parseFloat(formData.get('coordinateY')) || 50,
      installDate: formData.get('installDate'),
      status: formData.get('status')
    };
    
    try {
      let response;
      if (id) {
        response = await fetch(`/api/solarInstallations/${formId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(installation)
        });
      } else {
        response = await fetch('/api/solarInstallations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(installation)
        });
      }
      if ((await response.json()).success) {
        closeModal();
        switchView('solarInstallations');
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  openModal();
}

async function deleteSolarInstallation(id) {
  if (confirm("Are you sure you want to remove this solar PV installation from the registry?")) {
    try {
      const response = await fetch(`/api/solarInstallations/${id}`, { method: 'DELETE' });
      if ((await response.json()).success) {
        switchView('solarInstallations');
      }
    } catch (e) {
      console.error(e);
    }
  }
}

// --- EDUCATION & PUBLIC AWARENESS ---
function renderEducation() {
  const tbody = document.querySelector('#education-table tbody');
  tbody.innerHTML = '';
  
  
  db.education.forEach(item => {
    const tr = document.createElement('tr');
    

    
    tr.innerHTML = `
      <td style="font-weight:600;">${escapeHTML(item.title)}</td>
      <td>${escapeHTML(item.category)}</td>
      <td>${escapeHTML(item.description)}</td>
      <td><code>${escapeHTML(item.attachment)}</code></td>
      <td class="action-buttons">
        <button class="action-btn edit" onclick="openEducationForm('${item.id}')" title="Edit Educational Resource">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="action-btn delete" onclick="deleteEducation('${item.id}')" title="Remove Resource">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openEducationForm(id = null) {
  const modal = document.getElementById('cms-modal');
  const modalBody = modal.querySelector('.modal-body');
  const modalTitle = modal.querySelector('.modal-header h3');
  
  let item = { title: '', category: 'Guides', description: '', attachment: '', targetSite: 'all' };
  
  if (id) {
    item = db.education.find(e => e.id === id);
    modalTitle.textContent = "Edit Educational Resource";
  } else {
    modalTitle.textContent = "Create Educational Resource";
  }
  
  modalBody.innerHTML = `
    <form id="education-form">
      <input type="hidden" name="id" value="${id || ''}">
      <div class="form-group">
        <label>Resource Title*</label>
        <input type="text" name="title" value="${escapeHTML(item.title)}" required placeholder="e.g., Small Satellite & STEM Education Handbook">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Category*</label>
          <select name="category">
            <option value="Guides" ${item.category === 'Guides' ? 'selected' : ''}>Guides</option>
            <option value="Fact Sheets" ${item.category === 'Fact Sheets' ? 'selected' : ''}>Fact Sheets</option>
            <option value="Videos" ${item.category === 'Videos' ? 'selected' : ''}>Videos</option>
            <option value="Educational Resources" ${item.category === 'Educational Resources' ? 'selected' : ''}>Educational Resources / STEM</option>
          </select>
        </div>
        <div class="form-group">

        </div>
      </div>
      <div class="form-group">
        <label>Description / Curricular alignment*</label>
        <textarea name="description" required placeholder="Outline context, targeted age group, or key concepts...">${escapeHTML(item.description)}</textarea>
      </div>
      <div class="form-group">
        <label>Attachment URL / Path</label>
        <input type="text" name="attachment" id="edu-file-link-input" value="${escapeHTML(item.attachment)}" placeholder="e.g. /uploads/guide.pdf">
        <input type="file" id="edu-file-input" style="display:none;" onchange="handleRealFileUpload('edu-file-input', 'edu-file-link-input')">
        <div class="file-upload-mock" style="margin-top:0.4rem; padding:0.6rem;" onclick="document.getElementById('edu-file-input').click()">
          <p id="edu-file-upload-status">ðŸ“„ Upload resource attachment</p>
        </div>
      </div>
    </form>
  `;
  
  const saveBtn = modal.querySelector('#modal-save-btn');
  saveBtn.onclick = async () => {
    const form = document.getElementById('education-form');
    if (!form.reportValidity()) return;
    
    const formData = new FormData(form);
    const formId = formData.get('id');
    
    const eduResource = {
      title: formData.get('title'),
      category: formData.get('category'),
      description: formData.get('description'),
      attachment: formData.get('attachment') || 'No attachment',
      targetSite: 'all'
    };
    
    try {
      let response;
      if (formId) {
        response = await fetch(`/api/education/${formId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eduResource)
        });
      } else {
        response = await fetch('/api/education', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eduResource)
        });
      }
      if ((await response.json()).success) {
        closeModal();
        switchView('education');
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  openModal();
}

async function deleteEducation(id) {
  if (confirm("Are you sure you want to delete this educational resource?")) {
    try {
      const response = await fetch(`/api/education/${id}`, { method: 'DELETE' });
      if ((await response.json()).success) {
        switchView('education');
      }
    } catch (e) {
      console.error(e);
    }
  }
}

// --- SETTINGS ---
function renderSettings() {
  document.getElementById('settings-site-name').value = db.settings.siteName || '';
  document.getElementById('settings-contact-email').value = db.settings.contactEmail || '';
  document.getElementById('settings-footer-info').value = db.settings.footerInfo || '';
  document.getElementById('settings-social-fb').value = db.settings.socialFacebook || '';
  document.getElementById('settings-social-tw').value = db.settings.socialTwitter || '';
  document.getElementById('settings-social-ig').value = db.settings.socialInstagram || '';
  
  // Extended Contact & Governance Settings
  document.getElementById('settings-contact-phone').value = db.settings.contactPhone || '';
  document.getElementById('settings-contact-hours').value = db.settings.contactHours || '';
  document.getElementById('settings-contact-location').value = db.settings.contactLocation || db.settings.contactOfficeLocation || '';
  document.getElementById('settings-contact-dept-list').value = db.settings.contactDeptList || db.settings.contactDepartmentList || '';
  document.getElementById('settings-allowed-file-types').value = db.settings.allowedFileTypes || 'pdf,docx,xlsx,png,jpg,jpeg,mp4';
  document.getElementById('settings-max-upload-size').value = db.settings.maxUploadSize || '10';

  // Featured Learning Hub Settings
  document.getElementById('settings-featured-guide').value = db.settings.featuredGuide || '';
  document.getElementById('settings-featured-tip').value = db.settings.featuredTip || '';
  document.getElementById('settings-featured-resource').value = db.settings.featuredResource || '';
  document.getElementById('settings-featured-infographic').value = db.settings.featuredInfographic || '';
}

async function saveSettings() {
  const settings = {
    siteName: document.getElementById('settings-site-name').value,
    contactEmail: document.getElementById('settings-contact-email').value,
    footerInfo: document.getElementById('settings-footer-info').value,
    socialFacebook: document.getElementById('settings-social-fb').value,
    socialTwitter: document.getElementById('settings-social-tw').value,
    socialInstagram: document.getElementById('settings-social-ig').value,
    
    // Extended Contact & Governance Settings
    contactPhone: document.getElementById('settings-contact-phone').value,
    contactHours: document.getElementById('settings-contact-hours').value,
    contactLocation: document.getElementById('settings-contact-location').value,
    contactDeptList: document.getElementById('settings-contact-dept-list').value,
    allowedFileTypes: document.getElementById('settings-allowed-file-types').value,
    maxUploadSize: document.getElementById('settings-max-upload-size').value,

    // Featured Learning Hub Settings
    featuredGuide: document.getElementById('settings-featured-guide').value,
    featuredTip: document.getElementById('settings-featured-tip').value,
    featuredResource: document.getElementById('settings-featured-resource').value,
    featuredInfographic: document.getElementById('settings-featured-infographic').value
  };
  
  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const result = await response.json();
    if (result.success) {
      db.settings = result.settings;
      alert("Settings and enterprise governance constraints saved successfully.");
    }
  } catch (e) {
    console.error(e);
    alert("Error saving global settings.");
  }
}





// --- SECURITY ACTION AUDIT LOGS ---
let currentLogs = [];

async function renderLogs() {
  const tbody = document.querySelector('#logs-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-secondary);">Loading logs...</td></tr>';
  
  try {
    const response = await fetch('/api/logs');
    currentLogs = await response.json();
    
    // Sort reverse chronological
    currentLogs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    applyLogsFilter();
  } catch (err) {
    console.error("Failed to load audit logs:", err);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ef4444;">Error loading system logs.</td></tr>';
  }
}

function applyLogsFilter() {
  const tbody = document.querySelector('#logs-table tbody');
  if (!tbody) return;
  
  const searchEl = document.getElementById('log-filter-search');
  const query = searchEl ? searchEl.value.toLowerCase().trim() : '';
  const filterTypeEl = document.getElementById('log-filter-type');
  const filterActionEl = document.getElementById('log-filter-action');
  const filterType = filterTypeEl ? filterTypeEl.value : 'all';
  const filterAction = filterActionEl ? filterActionEl.value : 'all';
  
  let filtered = currentLogs;
  
  if (query) {
    filtered = filtered.filter(l => 
      (l.user || '').toLowerCase().includes(query) ||
      (l.action || '').toLowerCase().includes(query) ||
      (l.contentType || '').toLowerCase().includes(query) ||
      (l.contentName || '').toLowerCase().includes(query)
    );
  }
  if (filterType !== 'all') {
    filtered = filtered.filter(l => l.contentType === filterType);
  }
  if (filterAction !== 'all') {
    filtered = filtered.filter(l => (l.action || '').toLowerCase().includes(filterAction.toLowerCase()));
  }
  
  tbody.innerHTML = '';
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-secondary);">No logs matching search criteria.</td></tr>';
    return;
  }
  
  filtered.forEach(log => {
    const tr = document.createElement('tr');
    const d = new Date(log.timestamp);
    const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    
    tr.innerHTML = `
      <td>${dateStr}</td>
      <td style="font-weight:600; color:var(--accent-cyan);">${escapeHTML(log.user || 'System')}</td>
      <td><span class="badge" style="background:rgba(255,255,255,0.06); border:1px solid var(--border-color);">${escapeHTML(log.action)}</span></td>
      <td><code>${escapeHTML(log.contentType)}</code></td>
      <td>${escapeHTML(log.contentName || '')}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportLogsToCSV() {
  if (currentLogs.length === 0) {
    alert("No log records available to export.");
    return;
  }
  
  let csv = 'Timestamp,User,Action,Module/Collection,Record Details\n';
  currentLogs.forEach(l => {
    const timestampStr = `"${new Date(l.timestamp).toISOString()}"`;
    const userStr = `"${(l.user || 'System').replace(/"/g, '""')}"`;
    const actionStr = `"${(l.action || '').replace(/"/g, '""')}"`;
    const moduleStr = `"${(l.contentType || '').replace(/"/g, '""')}"`;
    const detailsStr = `"${(l.contentName || '').replace(/"/g, '""')}"`;
    
    csv += `${timestampStr},${userStr},${actionStr},${moduleStr},${detailsStr}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `doe_cms_security_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- RECYCLE BIN ---
async function renderRecycleBin() {
  const tbody = document.querySelector('#recycleBin-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-secondary);">Loading Recycle Bin...</td></tr>';
  
  try {
    const response = await fetch('/api/recycleBin');
    const items = await response.json();
    
    tbody.innerHTML = '';
    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-secondary);">Recycle Bin is empty.</td></tr>';
      return;
    }
    
    items.forEach(item => {
      const tr = document.createElement('tr');
      const details = item.itemData.title || item.itemData.name || item.itemData.id || '';
      
      tr.innerHTML = `
        <td style="font-weight:600; color:var(--text-primary);">${escapeHTML(details)}</td>
        <td><code>${escapeHTML(item.originalCollection)}</code></td>
        <td>${item.deletedAt}</td>
        <td class="action-buttons">
          <button class="action-btn edit" onclick="restoreRecycleItem('${item.id}')" title="Restore Item" style="color:var(--success); border-color:rgba(16, 185, 129, 0.3);">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <polyline points="16 3 16 8 21 8"></polyline>
              <line x1="21" y1="12" x2="21" y2="21"></line>
              <path d="M12 21a9 9 0 0 1-9-9"></path>
            </svg>
            <span style="font-size:0.75rem; margin-left:4px;">Restore</span>
          </button>
          <button class="action-btn delete" onclick="permanentlyDeleteRecycleItem('${item.id}')" title="Permanently Purge" style="color:#ef4444; border-color:rgba(239, 68, 68, 0.3);">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            </svg>
            <span style="font-size:0.75rem; margin-left:4px;">Purge</span>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load recycle bin:", err);
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ef4444;">Error loading Recycle Bin.</td></tr>';
  }
}

async function restoreRecycleItem(id) {
  try {
    const response = await fetch(`/api/recycleBin/${id}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modifiedBy: currentUser?.username || 'CMS Editor' })
    });
    const result = await response.json();
    if (result.success) {
      await initDatabase();
      renderRecycleBin();
      alert("Item restored to original section successfully.");
    }
  } catch (err) {
    console.error(err);
    alert("Error restoring item.");
  }
}

async function permanentlyDeleteRecycleItem(id) {
  if (!confirm("âš ï¸ WARNING: This will permanently purge this record from the system. This action is irreversible and compliant under document destruction policies. Proceed?")) return;
  try {
    const response = await fetch(`/api/recycleBin/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-name': currentUser?.username || 'CMS Editor' }
    });
    const result = await response.json();
    if (result.success) {
      renderRecycleBin();
    }
  } catch (err) {
    console.error(err);
    alert("Error purging item.");
  }
}

// --- VERSION REVISION RESTORATION ---
async function loadVersionHistory(collection, id) {
  const container = document.getElementById('version-history-container');
  if (!container || !id) return;
  container.innerHTML = '<span style="color:var(--text-secondary); font-size:0.85rem;">Loading version history...</span>';
  try {
    const response = await fetch(`/api/versions/${id}`);
    const versions = await response.json();
    if (versions.length === 0) {
      container.innerHTML = '<span style="color:var(--text-secondary); font-size:0.85rem; display:block; margin-top:0.5rem;">No previous versions recorded for this item.</span>';
      return;
    }
    
    let html = `
      <div style="font-weight:600; font-size:0.85rem; color:var(--text-secondary); margin-top:1rem; margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
        <span>Revision Version History (${versions.length})</span>
        <span style="font-size:0.75rem; font-weight:normal; color:#f59e0b;">Restoring will overwrite current draft edits</span>
      </div>
      <div style="max-height: 120px; overflow-y: auto; display:flex; flex-direction:column; gap:0.35rem; padding-right:0.25rem;">
    `;
    
    versions.forEach(v => {
      const formattedDate = new Date(v.modifiedAt).toLocaleString();
      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid var(--border-color); padding:0.4rem 0.5rem; border-radius:4px; font-size:0.8rem;">
          <div style="display:flex; flex-direction:column; gap:0.1rem;">
            <span style="font-weight:600; color:var(--text-primary);">Rev #${v.versionNumber} by ${escapeHTML(v.modifiedBy)}</span>
            <span style="color:var(--text-secondary); font-size:0.72rem;">${formattedDate}</span>
          </div>
          <button type="button" class="btn btn-secondary" style="padding:0.2rem 0.5rem; font-size:0.75rem; height:auto; background:rgba(6, 182, 212, 0.15); border-color:rgba(6, 182, 212, 0.3); color:var(--accent-cyan); cursor:pointer;" onclick="restoreVersion('${v.id}', '${id}', '${collection}')">
            Restore
          </button>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
  } catch (err) {
    console.error("Error loading version history:", err);
    container.innerHTML = '<span style="color:var(--text-secondary); font-size:0.85rem;">Error loading version history.</span>';
  }
}

async function restoreVersion(versionId, itemId, collection) {
  if (!confirm("Are you sure you want to restore this older version? Current unsaved draft changes will be replaced.")) return;
  try {
    const response = await fetch(`/api/versions/${versionId}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modifiedBy: currentUser?.username || 'CMS Editor' })
    });
    const result = await response.json();
    if (result.success) {
      alert("Version restored successfully!");
      closeModal();
      await initDatabase();
      switchView(collection === 'staticPages' ? 'pages' : collection);
    } else {
      alert("Failed to restore: " + result.error);
    }
  } catch (err) {
    console.error("Error restoring version:", err);
    alert("Network error restoring version.");
  }
}





// --- GLOBAL CMS CROSS-COLLECTION SEARCH ---
function performGlobalSearch() {
  const query = document.getElementById('global-search').value.toLowerCase().trim();
  const searchResultsView = document.getElementById('search-view');
  
  if (!query) {
    // Switch to dashboard if search cleared
    if (currentActiveView === 'search') {
      switchView('dashboard');
    }
    return;
  }
  
  // Switch to search view pane
  switchView('search');
  
  const resultsContainer = document.getElementById('search-results-container');
  resultsContainer.innerHTML = '';
  
  // Navigation shortcut card if query matches a page
  const matchedView = getMatchingViewId(query);
  if (matchedView) {
    const viewLabels = {
      dashboard: 'Dashboard',
      news: 'News & Media',
      policies: 'Policies',
      consultations: 'Consultations',
      projects: 'Energy Projects & Initiatives',
      tracker: 'Policy Progress Tracker',
      kpis: 'Dashboard Metrics',
      installers: 'Solar PV Installers Directory',
      solarInstallations: 'Solar PV Registry',
      education: 'Education & STEM',
      innovation: 'Energy Innovation',
      settings: 'Settings',
      logs: 'System Audit Logs',
      recycleBin: 'Recycle Bin'
    };
    const shortcutCard = document.createElement('div');
    shortcutCard.className = 'dashboard-card';
    shortcutCard.style.cursor = 'pointer';
    shortcutCard.style.border = '1px solid var(--accent-cyan)';
    shortcutCard.style.background = 'rgba(6, 182, 212, 0.05)';
    shortcutCard.style.padding = '1.25rem';
    shortcutCard.style.marginBottom = '0.5rem';
    shortcutCard.style.transition = 'transform 0.2s, box-shadow 0.2s';
    shortcutCard.style.borderRadius = 'var(--border-radius-md)';
    shortcutCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
        <div>
          <span class="badge" style="background:var(--accent-cyan); color:var(--bg-primary); font-weight:600; padding:0.25rem 0.5rem; border-radius:4px; font-size:0.75rem;">PAGE LINK DIRECT SHORTCUT</span>
          <h3 style="font-size:1.15rem; font-weight:600; color:var(--text-primary); margin-top:0.4rem; margin-bottom:0.25rem;">Go to ${viewLabels[matchedView]}</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin:0;">Switch CMS panel view to the full page for "${escapeHTML(query)}".</p>
        </div>
        <div style="color:var(--accent-cyan); display:flex; align-items:center; gap:0.25rem; font-weight:600; font-size:0.9rem; flex-shrink:0;">
          Open Page &rarr;
        </div>
      </div>
    `;
    shortcutCard.onclick = () => {
      document.getElementById('global-search').value = '';
      switchView(matchedView);
    };
    shortcutCard.onmouseenter = () => {
      shortcutCard.style.transform = 'translateY(-2px)';
      shortcutCard.style.boxShadow = 'var(--shadow-md)';
    };
    shortcutCard.onmouseleave = () => {
      shortcutCard.style.transform = 'translateY(0)';
      shortcutCard.style.boxShadow = 'none';
    };
    resultsContainer.appendChild(shortcutCard);
  }
  
  const typeFilter = document.getElementById('search-filter-type').value;
  
  let matches = [];
  
  // Define collections to search
  const collections = [
    { name: 'news', label: 'News & Media', path: 'news' },
    { name: 'policies', label: 'Policy / Publication', path: 'policies' },
    { name: 'consultations', label: 'Public Consultation', path: 'consultations' },
    { name: 'projects', label: 'Active Programme', path: 'projects' },
    { name: 'tracker', label: 'Policy Tracker Entry', path: 'tracker' },
    { name: 'installers', label: 'Solar PV Installer', path: 'installers' },
    { name: 'education', label: 'Educational Resource', path: 'education' },
    { name: 'solarInstallations', label: 'Solar PV Registry', path: 'solarInstallations' },
    { name: 'innovation', label: 'Energy Innovation Topic', path: 'innovation' }
  ];
  
  collections.forEach(col => {
    if (typeFilter !== 'all' && col.path !== typeFilter) return;
    
    const list = db[col.name] || [];
    list.forEach(item => {
      
      const titleText = (item.title || item.name || item.id || '').toLowerCase();
      const descText = (item.summary || item.description || item.bio || item.content || '').toLowerCase();
      
      if (titleText.includes(query) || descText.includes(query)) {
        matches.push({
          title: item.title || item.name || item.id,
          description: item.summary || item.description || item.bio || item.content || 'No details provided.',
          collectionLabel: col.label,
          collectionPath: col.path,
          targetSite: site,
          id: item.id
        });
      }
    });
  });
  
  document.getElementById('search-query-highlight').textContent = query;
  document.getElementById('search-results-count').textContent = matches.length;
  
  if (matches.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.style.textAlign = 'center';
    emptyDiv.style.padding = '3rem';
    emptyDiv.style.color = 'var(--text-secondary)';
    emptyDiv.innerHTML = `
      <p style="font-size:1.1rem; margin-bottom:0.5rem;">No content entries found matching "${escapeHTML(query)}"</p>
      <p style="font-size:0.85rem;">Try refining your filter settings or spelling search terms differently.</p>
    `;
    resultsContainer.appendChild(emptyDiv);
    return;
  }
  
  matches.forEach(m => {
    const card = document.createElement('div');
    card.className = 'dashboard-card';
    card.style.cursor = 'pointer';
    card.style.transition = 'transform 0.2s, border-color 0.2s';
    card.style.border = '1px solid var(--border-color)';
    card.style.padding = '1.2rem';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '0.5rem';
    
    // Highlight match query
    let titleHTML = escapeHTML(m.title);
    let descHTML = escapeHTML(m.description);
    
    const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    titleHTML = titleHTML.replace(regex, `<mark style="background:rgba(6, 182, 212, 0.3); color:var(--accent-cyan); padding:0 2px; border-radius:2px;">$1</mark>`);
    descHTML = descHTML.replace(regex, `<mark style="background:rgba(6, 182, 212, 0.3); color:var(--accent-cyan); padding:0 2px; border-radius:2px;">$1</mark>`);
    
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <span class="badge" style="background:rgba(255,255,255,0.06); border:1px solid var(--border-color); color:var(--text-secondary);">${m.collectionLabel}</span>
      </div>
      <h3 style="font-size:1.1rem; font-weight:600; color:var(--text-primary); margin-top:0.25rem;">${titleHTML}</h3>
      <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.4; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${descHTML}</p>
      <div style="align-self:flex-end; font-size:0.8rem; color:var(--accent-cyan); display:flex; align-items:center; gap:0.25rem;">
        Click to navigate and edit
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
    `;
    
    card.onclick = () => {
      switchView(m.collectionPath);
      // Automatically open the form modal for this item!
      setTimeout(() => {
        if (m.collectionPath === 'news') openNewsForm(m.id);
        else if (m.collectionPath === 'policies') openPolicyForm(m.id);
        else if (m.collectionPath === 'consultations') openConsultationForm(m.id);
        else if (m.collectionPath === 'projects') openProjectForm(m.id);
        else if (m.collectionPath === 'tracker') openTrackerForm(m.id);
        else if (m.collectionPath === 'installers') openInstallerForm(m.id);
        else if (m.collectionPath === 'education') openEducationForm(m.id);
        else if (m.collectionPath === 'solarInstallations') openSolarInstallationForm(m.id);
        else if (m.collectionPath === 'innovation') openInnovationForm(m.id);
      }, 150);
    };
    
    resultsContainer.appendChild(card);
  });
}

// --- THE REAL-TIME PORTAL LIVE PREVIEW ---
function renderLivePreview() {
  const frame = document.getElementById('preview-portal-frame');
  frame.innerHTML = `<iframe src="/portal/" style="width:100%; height:600px; border:none; border-radius:8px; background:#0b1329;"></iframe>`;
}

// 4. Modal Helpers
function setupCharacterCounters() {
  const modal = document.getElementById('cms-modal');
  if (!modal) return;
  
  const fields = modal.querySelectorAll('input[type="text"], input[type="url"], input:not([type]), textarea');
  fields.forEach(field => {
    if (field.type === 'hidden' || field.type === 'file' || field.type === 'checkbox' || field.type === 'radio' || field.type === 'date') {
      return;
    }
    
    const name = (field.name || '').toLowerCase();
    const id = (field.id || '').toLowerCase();
    const placeholder = (field.placeholder || '').toLowerCase();
    
    const label = field.parentElement ? field.parentElement.querySelector('label') : null;
    const labelText = label ? label.textContent.toLowerCase() : '';
    
    let maxLimit = 1000;
    
    if (name.includes('seodescription') || labelText.includes('seo')) {
      maxLimit = 160;
    } else if (name.includes('summary') || (labelText.includes('summary') && !labelText.includes('description'))) {
      maxLimit = 200;
    } else if (name.includes('title') || name.includes('name') || labelText.includes('title') || labelText.includes('name') || name === 'id' || id === 'id') {
      maxLimit = 100;
    } else if (name.includes('route') || name.includes('url') || labelText.includes('route') || labelText.includes('url') || name.includes('link') || labelText.includes('link') || name.includes('website') || labelText.includes('website') || name.includes('contact') || labelText.includes('contact')) {
      maxLimit = 250;
    } else if (name.includes('content') || name.includes('milestones') || labelText.includes('content') || labelText.includes('milestones')) {
      maxLimit = 5000;
    } else if (name.includes('takeaways') || labelText.includes('takeaways') || name.includes('key') || labelText.includes('key')) {
      maxLimit = 1000;
    }
    
    field.setAttribute('maxlength', maxLimit);
    
    let counterContainer = field.parentElement.querySelector('.char-counter-container');
    if (!counterContainer) {
      counterContainer = document.createElement('div');
      counterContainer.className = 'char-counter-container';
      field.parentNode.appendChild(counterContainer);
    }
    
    const updateDisplay = () => {
      const len = field.value.length;
      counterContainer.textContent = `${len} / ${maxLimit} characters`;
      if (len >= maxLimit) {
        counterContainer.classList.add('limit-reached');
      } else {
        counterContainer.classList.remove('limit-reached');
      }
    };
    
    field.removeEventListener('input', updateDisplay);
    field.addEventListener('input', updateDisplay);
    updateDisplay();
  });
}

function openModal() {
  document.getElementById('cms-modal').classList.add('active');
  setupCharacterCounters();
}

function closeModal() {
  document.getElementById('cms-modal').classList.remove('active');
}

// 5. App Initialization with Secure Authentication
let currentUser = null;

async function checkAuth() {
  const loginContainer = document.getElementById('login-container');
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      currentUser = await response.json();
      if (loginContainer) loginContainer.classList.add('hidden');
      
      // Update UI displays for user profile
      const nameEl = document.querySelector('.sidebar-footer .user-name');
      if (nameEl) nameEl.textContent = currentUser.username;
      
      const roleEl = document.querySelector('.sidebar-footer .user-role');
      if (roleEl) roleEl.textContent = currentUser.role;

      // Apply Client-Side RBAC Hiding
      applyUiRbac(currentUser.role);
      
      return true;
    }
  } catch (err) {
    console.error("Auth check failed:", err);
  }
  
  currentUser = null;
  if (loginContainer) loginContainer.classList.remove('hidden');
  return false;
}

function applyUiRbac(role) {
  // Viewer can only read. Hide all primary write, update, delete, and upload buttons.
  if (role === 'Viewer') {
    document.querySelectorAll('.btn-primary, .action-btn.edit, .action-btn.delete, #modal-save-btn, .file-upload-mock').forEach(el => {
      if (el.id !== 'cms-logout-btn') {
        el.style.display = 'none';
      }
    });
  }
  
  // Non-Admins cannot access system settings, security logs, or recycle bin.
  if (role !== 'Administrator') {
    document.querySelectorAll('aside nav a[data-view="settings"], aside nav a[data-view="logs"], aside nav a[data-view="recycleBin"]').forEach(el => {
      el.style.display = 'none';
    });
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  // Bind Login Form Submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const errorMsg = document.getElementById('login-error-msg');
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
          if (errorMsg) errorMsg.style.display = 'none';
          const isAuth = await checkAuth();
          if (isAuth) {
            await initApp();
          }
        } else {
          const errData = await response.json();
          if (errorMsg) {
            errorMsg.textContent = errData.error || "Invalid email or password";
            errorMsg.style.display = 'block';
          }
        }
      } catch (err) {
        console.error("Login call failed:", err);
        if (errorMsg) {
          errorMsg.textContent = "Server communication failed.";
          errorMsg.style.display = 'block';
        }
      }
    });
  }
  
  // --- FORGOT PASSWORD / RESET PASSWORD FLOW ---
  const forgotPasswordLink = document.getElementById('forgot-password-link');
  const backToLoginLink = document.getElementById('back-to-login-link');
  const resetBackToLoginLink = document.getElementById('reset-back-to-login-link');
  
  const loginFormEl = document.getElementById('login-form');
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  const resetPasswordForm = document.getElementById('reset-password-form');

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginFormEl.style.display = 'none';
      forgotPasswordForm.style.display = 'block';
    });
  }

  if (backToLoginLink) {
    backToLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      forgotPasswordForm.style.display = 'none';
      loginFormEl.style.display = 'block';
      
      document.getElementById('forgot-email').value = '';
      document.getElementById('forgot-error-msg').style.display = 'none';
      document.getElementById('forgot-success-msg').style.display = 'none';
    });
  }

  if (resetBackToLoginLink) {
    resetBackToLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      resetPasswordForm.style.display = 'none';
      loginFormEl.style.display = 'block';
      
      document.getElementById('reset-token-input').value = '';
      document.getElementById('reset-new-password').value = '';
      document.getElementById('reset-error-msg').style.display = 'none';
      document.getElementById('reset-success-msg').style.display = 'none';
    });
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value;
      const errorEl = document.getElementById('forgot-error-msg');
      const successEl = document.getElementById('forgot-success-msg');
      
      errorEl.style.display = 'none';
      successEl.style.display = 'none';
      
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          successEl.textContent = data.message;
          successEl.style.display = 'block';
          
          if (data.token) {
            const devLink = document.createElement('a');
            devLink.href = '#';
            devLink.style.display = 'block';
            devLink.style.marginTop = '1rem';
            devLink.style.color = '#0d9488';
            devLink.style.fontWeight = 'bold';
            devLink.style.textDecoration = 'none';
            devLink.textContent = '[Dev Tool] Click to Reset Password';
            devLink.addEventListener('click', (evt) => {
              evt.preventDefault();
              forgotPasswordForm.style.display = 'none';
              resetPasswordForm.style.display = 'block';
              document.getElementById('reset-token-input').value = data.token;
            });
            successEl.appendChild(devLink);
          }
        } else {
          errorEl.textContent = data.error || 'Failed to send reset link.';
          errorEl.style.display = 'block';
        }
      } catch (err) {
        console.error(err);
        errorEl.textContent = 'Network error occurred.';
        errorEl.style.display = 'block';
      }
    });
  }

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = document.getElementById('reset-token-input').value;
      const newPassword = document.getElementById('reset-new-password').value;
      const errorEl = document.getElementById('reset-error-msg');
      const successEl = document.getElementById('reset-success-msg');
      
      errorEl.style.display = 'none';
      successEl.style.display = 'none';
      
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword })
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          successEl.textContent = data.message;
          successEl.style.display = 'block';
          
          document.getElementById('reset-token-input').value = '';
          document.getElementById('reset-new-password').value = '';
          
          setTimeout(() => {
            resetPasswordForm.style.display = 'none';
            loginFormEl.style.display = 'block';
            successEl.style.display = 'none';
          }, 3000);
        } else {
          errorEl.textContent = data.error || 'Failed to reset password.';
          errorEl.style.display = 'block';
        }
      } catch (err) {
        console.error(err);
        errorEl.textContent = 'Network error occurred.';
        errorEl.style.display = 'block';
      }
    });
  }
  
  // Bind Logout Button
  const logoutBtn = document.getElementById('cms-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (e) {}
      location.reload();
    });
  }

  // If already authenticated, initialize CMS workspace
  const isAuthenticated = await checkAuth();
  if (isAuthenticated) {
    await initApp();
  }
});

async function initApp() {
  await initDatabase();
  setupNavigation();

  // Start on Dashboard
  switchView('dashboard');

  const closeBtn = document.querySelector('#cms-modal .close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  const cancelBtn = document.querySelector('#modal-cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }
}

// â”€â”€ DATA FILE MANAGER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function switchStatTab(tab) {
  document.getElementById('stat-panel-files').style.display = tab === 'files' ? '' : 'none';
  document.getElementById('stat-panel-monthly').style.display = tab === 'monthly' ? '' : 'none';
  const tabFiles = document.getElementById('stat-tab-files');
  const tabMonthly = document.getElementById('stat-tab-monthly');
  tabFiles.style.borderBottomColor = tab === 'files' ? 'var(--accent-cyan)' : 'transparent';
  tabFiles.style.color = tab === 'files' ? 'var(--accent-cyan)' : 'var(--text-secondary)';
  tabMonthly.style.borderBottomColor = tab === 'monthly' ? 'var(--accent-cyan)' : 'transparent';
  tabMonthly.style.color = tab === 'monthly' ? 'var(--accent-cyan)' : 'var(--text-secondary)';
  if (tab === 'files') loadDataFiles();
}

async function loadDataFiles() {
  const container = document.getElementById('data-files-list');
  container.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-secondary);">Loadingâ€¦</div>';
  try {
    const res = await fetch('/api/data-files');
    if (!res.ok) throw new Error(await res.text());
    const files = await res.json();
    renderDataFiles(files);
  } catch (err) {
    container.innerHTML = `<div style="color:var(--danger); padding:1rem;">Error loading data files: ${escapeHTML(err.message)}</div>`;
  }
}

function renderDataFiles(files) {
  const container = document.getElementById('data-files-list');
  container.innerHTML = '';
  files.forEach(f => {
    const sizeKB = f.file ? (f.file.size / 1024).toFixed(1) + ' KB' : 'â€”';
    const lastMod = f.file ? new Date(f.file.lastModified).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : 'File not found';
    const card = document.createElement('div');
    card.className = 'dashboard-card';
    card.style.cssText = 'overflow:hidden;';
    card.innerHTML = `
      <div class="card-header" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem;">
        <div>
          <h3 style="margin:0; font-size:1rem;">${escapeHTML(f.label)}</h3>
          <p style="margin:0.25rem 0 0; font-size:0.8rem; color:var(--text-secondary);">${escapeHTML(f.description)}</p>
        </div>
        ${f.file
          ? `<span style="background:var(--success-muted,#ecfdf5); color:var(--success,#16a34a); border:1px solid #bbf7d0; border-radius:999px; padding:0.25rem 0.75rem; font-size:0.75rem; font-weight:600;">âœ“ File present</span>`
          : `<span style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:999px; padding:0.25rem 0.75rem; font-size:0.75rem; font-weight:600;">âš  Missing</span>`}
      </div>
      <div style="padding:1.25rem; display:grid; grid-template-columns:1fr auto; gap:1rem; align-items:end;">
        <div>
          <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.5rem;">
            <strong>Filename:</strong> ${escapeHTML(f.filename)}<br>
            <strong>Size:</strong> ${sizeKB} &nbsp;|&nbsp; <strong>Last updated:</strong> ${lastMod}
          </div>
          <div id="upload-status-${f.key}" style="font-size:0.82rem; min-height:1.5rem;"></div>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.5rem; min-width:180px;">
          ${f.file ? `
          <a href="/portal/documents/${encodeURIComponent(f.filename)}" download
            style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.5rem 0.875rem; border-radius:var(--border-radius-sm); background:var(--surface-secondary); color:var(--text-primary); border:1px solid var(--border-color); font-size:0.82rem; font-weight:500; cursor:pointer; text-decoration:none;">
            â¬‡ Download Current
          </a>` : ''}
          <label style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.5rem 0.875rem; border-radius:var(--border-radius-sm); background:var(--accent-cyan); color:#fff; border:none; font-size:0.82rem; font-weight:600; cursor:pointer;">
            â¬† Upload New File
            <input type="file" accept=".xls,.xlsx" style="display:none;"
              onchange="uploadDataFile('${f.key}', this)">
          </label>
        </div>
      </div>
    `;
    // Stats preview section per file
    const previewDiv = document.createElement('div');
    previewDiv.id = f.key === 'vehicles' ? 'fleet-stats-preview' : 'solar-stats-preview';
    previewDiv.style.cssText = 'padding:0 1.25rem 1.25rem;';
    card.appendChild(previewDiv);

    container.appendChild(card);
  });

  // Live stats previews
  loadFleetPreview();
  loadSolarPreview();
}

async function uploadDataFile(key, input) {
  const file = input.files[0];
  if (!file) return;
  const statusEl = document.getElementById(`upload-status-${key}`);
  statusEl.innerHTML = '<span style="color:var(--accent-cyan);">â³ Uploadingâ€¦</span>';
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch(`/api/data-files/${key}`, { method: 'POST', body: formData });
    const result = await res.json();
    if (res.ok && result.success) {
      statusEl.innerHTML = `<span style="color:var(--success);">âœ“ Uploaded: ${escapeHTML(result.filename)} (${(result.size/1024).toFixed(1)} KB)</span>`;
      setTimeout(() => loadDataFiles(), 1500);
    } else {
      statusEl.innerHTML = `<span style="color:var(--danger);">âœ— ${escapeHTML(result.error || 'Upload failed')}</span>`;
    }
  } catch (err) {
    statusEl.innerHTML = `<span style="color:var(--danger);">âœ— Connection error</span>`;
  }
  input.value = '';
}

async function loadFleetPreview() {
  try {
    const res = await fetch('/api/vehicles/fleet');
    if (!res.ok) return;
    const data = await res.json();
    const previewEl = document.getElementById('fleet-stats-preview');
    if (!previewEl) return;
    previewEl.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:1rem; margin-top:0.75rem;">
        <div style="background:var(--surface-secondary); border-radius:8px; padding:0.75rem 1rem; min-width:120px; text-align:center;">
          <div style="font-size:1.5rem; font-weight:700; color:var(--accent-cyan);">${data.total.toLocaleString()}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">Total EVs</div>
        </div>
        ${Object.entries(data.byCategory).map(([cat, count]) => `
          <div style="background:var(--surface-secondary); border-radius:8px; padding:0.75rem 1rem; min-width:120px; text-align:center;">
            <div style="font-size:1.25rem; font-weight:700; color:var(--text-primary);">${count.toLocaleString()}</div>
            <div style="font-size:0.72rem; color:var(--text-secondary);">${escapeHTML(cat)}</div>
          </div>`).join('')}
      </div>
      <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.5rem;">As at ${data.asOf} Â· Top makes: ${data.topMakes.slice(0,3).map(m=>m.make.trim()).join(', ')}</p>
    `;
  } catch {}
}

async function loadSolarPreview() {
  try {
    const res = await fetch('/api/solar/stats');
    if (!res.ok) return;
    const data = await res.json();
    const previewEl = document.getElementById('solar-stats-preview');
    if (!previewEl) return;
    previewEl.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:1rem; margin-top:0.75rem;">
        <div style="background:var(--surface-secondary); border-radius:8px; padding:0.75rem 1rem; min-width:120px; text-align:center;">
          <div style="font-size:1.5rem; font-weight:700; color:#f59e0b;">${data.total.toLocaleString()}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">Total Permits</div>
        </div>
        <div style="background:var(--surface-secondary); border-radius:8px; padding:0.75rem 1rem; min-width:120px; text-align:center;">
          <div style="font-size:1.5rem; font-weight:700; color:#16a34a;">${data.activeInstalls.toLocaleString()}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">Active Installs</div>
        </div>
        <div style="background:var(--surface-secondary); border-radius:8px; padding:0.75rem 1rem; min-width:130px; text-align:center;">
          <div style="font-size:1.5rem; font-weight:700; color:#0891b2;">${(data.totalKWExtracted/1000).toFixed(1)} MW</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">Est. Capacity</div>
        </div>
        <div style="background:var(--surface-secondary); border-radius:8px; padding:0.75rem 1rem; min-width:120px; text-align:center;">
          <div style="font-size:1.5rem; font-weight:700; color:#7c3aed;">${data.byYear.slice(-1)[0]?.count || 0}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">Permits in ${data.byYear.slice(-1)[0]?.year || 'â€”'}</div>
        </div>
      </div>
      <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.5rem;">Top district: ${data.byDistrict[0]?.district || 'â€”'} (${data.byDistrict[0]?.count || 0} permits) Â· Residential: ${data.byWorkClass.find(w=>w.type==='Residential')?.count || 0} / Commercial: ${data.byWorkClass.find(w=>w.type==='Commercial')?.count || 0}</p>
    `;
  } catch {}
}
