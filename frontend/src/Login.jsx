import { useEffect, useState } from 'react';
import backDesign from './backdesign.png';
import tipLogo from './tipLogo.png';
import coverLogin from './cover.png';
import Registration from './registration';
import { login as loginRequest } from './api/auth';
import EvaluationDashboard from './pages/EvaluationDashboard';
import ResearchEvalForm from './pages/ResearchEvalForm';
import EvaluationTracking from './pages/EvaluationTracking';
import DatabaseDashboard from './pages/DatabaseDashboard';
import ResearchRepository from './pages/ResearchRepository';
import PieChartSection from './components/piechart';
import PasswordField from './components/PasswordField';
import { getDropdowns } from './api/lookups';
import {
  createSetting,
  deleteSetting,
  INDEXING_STORAGE_KEY,
  getSettingsMeta,
  listSettings,
  normalizeSettingRows,
  updateSetting,
  fetchStatusList,
  createStatus,
  updateStatus,
  deleteStatus,
  fetchStatusesAndRemarksList,
  createStatusesAndRemarks,
  updateStatusesAndRemarks,
  deleteStatusesAndRemarks,
} from './api/settings';

const _style = document.createElement('style');
_style.innerHTML = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { width: 100%; height: 100%; overflow: hidden; }
  input[type="file"] { display: none; }
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear { display: none; }
  .sideBtn:hover  { background-color: #fdf3d8 !important; color: #b8860b !important; }
  .actionBtn:hover { opacity: 0.8; }
  .uploadArea:hover { border-color: #d4a017 !important; background: #fdf8ec !important; }
  tr:hover td { background-color: #fffcf2 !important; }
  select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
  .navBtn:hover { border-bottom-color: #d4a017 !important; color: #d4a017 !important; }
  .trackFileLink { color: #3a5fc8; font-size: 12px; font-family: Georgia, serif; text-decoration: none; display: flex; align-items: center; gap: 5px; padding: 2px 0; }
  .trackFileLink:hover { text-decoration: underline; color: #2a4aaa; }
  .statCard:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.13) !important; transform: translateY(-1px); }
  .statCard { transition: all 0.18s; }
  .trackRow:hover td { background-color: #fffcf2 !important; }
  .searchInp:focus { border-color: #d4a017 !important; box-shadow: 0 0 0 3px rgba(212,160,23,0.15) !important; }
`;
document.head.appendChild(_style);

const F = 'Georgia, serif';

const MENU_ITEMS = [
  'Author', 'Campus', 'College', 'Department', 'Indexing',
  'Research Output', 'Research', 'Role', 'School Year', 'Semester', 'Status', 'Statuses and Remarks',
];

const DASH_NAV = [
  { label: 'Repository', view: 'repository' },
  { label: 'Evaluation', view: 'evaluation' },
  { label: 'Incentives', view: 'incentives' },
  { label: 'Settings',   view: 'settings'   },
];

const AUTH_STORAGE_KEY = 'authToken';
const UI_STATE_STORAGE_KEY = 'uiState';
const DEFAULT_MENU = 'Indexing';
const DEFAULT_PORTAL_PAGE = 'eval-dashboard';
const SETTINGS_PAGE_SIZE = 10;
const VALID_VIEWS = new Set(['landing', 'login', 'signup', 'home', 'repository', 'evaluation', 'settings', 'incentives']);
const AUTH_ONLY_VIEWS = new Set(['home', 'repository', 'evaluation', 'settings', 'incentives']);
const VALID_PORTAL_PAGES = new Set(['eval-dashboard', 'eval-form', 'tracking', 'db-dashboard', 'db-form']);

const parseStoredAuthSession = () => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.access_token || typeof parsed.access_token !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const parseStoredUiState = () => {
  const raw = localStorage.getItem(UI_STATE_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const hasValidStoredSession = () => {
  const session = parseStoredAuthSession();
  if (!session) return false;

  const payload = decodeJwtPayload(session.access_token);
  const exp = payload?.exp;

  if (typeof exp !== 'number') return true;
  return Math.floor(Date.now() / 1000) < exp;
};

const getInitialUiState = () => {
  const hasSession = hasValidStoredSession();
  const fallbackView = hasSession ? 'home' : 'landing';
  const storedUi = parseStoredUiState();

  if (!storedUi) {
    return {
      view: fallbackView,
      activeMenu: DEFAULT_MENU,
      portalPage: DEFAULT_PORTAL_PAGE,
    };
  }

  const storedView = typeof storedUi.view === 'string' && VALID_VIEWS.has(storedUi.view)
    ? storedUi.view
    : fallbackView;
  const safeView = !hasSession && AUTH_ONLY_VIEWS.has(storedView) ? 'landing' : storedView;
  const safeMenu = typeof storedUi.activeMenu === 'string' && MENU_ITEMS.includes(storedUi.activeMenu)
    ? storedUi.activeMenu
    : DEFAULT_MENU;
  const safePortalPage = typeof storedUi.portalPage === 'string' && VALID_PORTAL_PAGES.has(storedUi.portalPage)
    ? storedUi.portalPage
    : DEFAULT_PORTAL_PAGE;

  return {
    view: safeView,
    activeMenu: safeMenu,
    portalPage: safePortalPage,
  };
};

// ── Illustrations ──────────────────────────────────────────────────

const LoginIllustration = () => (
  <div style={{ width: '100%', height: '100%', backgroundImage: `url(${coverLogin})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden' }} />
);

// ── Shared Sub-components ──────────────────────────────────────────

const DarkHeader = ({ onLogoClick }) => (
  <header style={S.topHeader}>
    <div style={S.headerInner}>
      <div
        style={{ ...S.logoBox, cursor: 'pointer' }}
        onClick={onLogoClick}
        title="Go to home"
      >
        <img src={tipLogo} alt="TIP Logo" style={S.logoImg} />
        <div style={S.headerTextGroup}>
          <span style={S.headerTitle}>Academic Research Unit</span>
          <span style={S.headerSubtitle}>Technological Institute of the Philippines</span>
        </div>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer style={S.footer}>
    <span style={S.footerLink}>Terms and Conditions</span>
    <span style={S.footerLink}>Privacy Policy</span>
  </footer>
);

const DashTopBar = ({ activeView, setView, handleLogout, onLogoClick }) => (
  <div style={S.dashTopBar}>
    <div style={{ ...S.logoBox, cursor: 'pointer' }} onClick={onLogoClick}>
      <img src={tipLogo} alt="TIP Logo" style={S.logoImg} />
      <div style={S.headerTextGroup}>
        <span style={S.headerTitle}>Academic Research Unit</span>
        <span style={S.headerSubtitle}>Technological Institute of the Philippines</span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {DASH_NAV.map(({ label, view }) => (
        <button
          key={label}
          className="navBtn"
          onClick={() => setView(view)}
          style={{
            ...S.navBtn,
            borderBottomColor: activeView === view ? '#d4a017' : 'transparent',
            color: activeView === view ? '#d4a017' : '#ccc',
          }}
        >
          {label}
        </button>
      ))}
      <button onClick={handleLogout} style={S.logoutBtn}>Log out</button>
    </div>
  </div>
);

const DashShell = ({ activeView, setView, handleLogout, activeMenu, setActiveMenu, menuItems = MENU_ITEMS, onLogoClick, children }) => (
  <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: F }}>
    <DashTopBar activeView={activeView} setView={setView} handleLogout={handleLogout} onLogoClick={onLogoClick} />
    <div style={S.dashLayout}>
      <aside style={S.sidebar}>
        <div style={S.sideTitle}>Scholar Sphere</div>
        {menuItems.map(item => (
          <button key={item} className="sideBtn"
            onClick={() => setActiveMenu(item)}
            style={{
              ...S.sideBtn,
              backgroundColor: item === activeMenu ? '#fdf3d8' : 'transparent',
              color:            item === activeMenu ? '#b8860b' : '#2a2a2a',
              border:           item === activeMenu ? '1px solid #d4a017' : '1px solid transparent',
            }}>{item}</button>
        ))}
      </aside>
      <main style={S.dashMain}>
        {children}
      </main>
    </div>
  </div>
);

// ── Main App ───────────────────────────────────────────────────────

export default function App() {
  const initialUiState = getInitialUiState();
  const [view, setView]             = useState(initialUiState.view);
  const [activeMenu, setActiveMenu] = useState(initialUiState.activeMenu);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass]   = useState('');
  const [authError, setAuthError]   = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [portalPage, setPortalPage] = useState(initialUiState.portalPage);

  const [records, setRecords]         = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [statusRecords, setStatusRecords] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusPagination, setStatusPagination] = useState({ page: 1, input: '1' });
  const [statusesAndRemarksRecords, setStatusesAndRemarksRecords] = useState([]);
  const [statusesAndRemarksLoading, setStatusesAndRemarksLoading] = useState(false);
  const [statusesAndRemarksError, setStatusesAndRemarksError] = useState('');
  const [statusesAndRemarksPagination, setStatusesAndRemarksPagination] = useState({ page: 1, input: '1' });
  const [editingId, setEditingId]     = useState(null);
  const [editName, setEditName]       = useState('');
  const [editExtra, setEditExtra]     = useState('');
  const [showAddRow, setShowAddRow]   = useState(false);
  const [newName, setNewName]         = useState('');
  const [newExtra, setNewExtra] = useState('');
  const [campusOptions, setCampusOptions] = useState([]);
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [settingsPage, setSettingsPage] = useState(1);
  const [settingsPageInput, setSettingsPageInput] = useState('1');

  const isIndexingMenu = activeMenu === 'Indexing';
  const isStatusMenu = activeMenu === 'Status';
  const isStatusesAndRemarksMenu = activeMenu === 'Statuses and Remarks';
  const settingsMeta = isIndexingMenu
    ? { extraLabel: null, extraPlaceholder: '' }
    : getSettingsMeta(activeMenu);

  const activeSettingsError = isStatusMenu
    ? statusError
    : isStatusesAndRemarksMenu
      ? statusesAndRemarksError
      : settingsError;

  const activeSettingsLoading = isStatusMenu
    ? statusLoading
    : isStatusesAndRemarksMenu
      ? statusesAndRemarksLoading
      : settingsLoading;

  const activeRecords = isStatusMenu
    ? statusRecords
    : isStatusesAndRemarksMenu
      ? statusesAndRemarksRecords
      : records;

  const activeSettingsPage = isStatusMenu
    ? statusPagination.page
    : isStatusesAndRemarksMenu
      ? statusesAndRemarksPagination.page
      : settingsPage;

  const activeSettingsPageInput = isStatusMenu
    ? statusPagination.input
    : isStatusesAndRemarksMenu
      ? statusesAndRemarksPagination.input
      : settingsPageInput;

  const readIndexingSettings = () => {
    try {
      const raw = localStorage.getItem(INDEXING_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed
            .map((item) => ({
              id: item?.id ?? String(Date.now()),
              name: String(item?.name ?? '').trim(),
              extra: '',
            }))
            .filter((item) => item.name)
        : [];
    } catch {
      return [];
    }
  };

  const saveIndexingSettings = (rows) => {
    localStorage.setItem(INDEXING_STORAGE_KEY, JSON.stringify(rows));
    window.dispatchEvent(new Event('scholarSphere:indexing-updated'));
  };

  const handleEnterKey = (action) => (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    action();
  };

  const handleLogin = async () => {
    setAuthError('');
    if (!loginEmail.trim() || !loginPass) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setAuthLoading(true);
    try {
      const tokenResponse = await loginRequest({ email: loginEmail.trim(), password: loginPass });
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokenResponse));
      setView('home');
    } catch (err) {
      setAuthError(err.message || 'Unable to log in. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setView('landing');
    setActiveMenu(DEFAULT_MENU);
    setPortalPage(DEFAULT_PORTAL_PAGE);
    setLoginPass('');
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(UI_STATE_STORAGE_KEY);
  };

  const loadSettings = async (menu) => {
    if (menu === 'Status') {
      setStatusLoading(true);
      setStatusError('');
      try {
        const data = await fetchStatusList();
        setStatusRecords(data);
      } catch (err) {
        setStatusError(err.message || 'Failed to load records.');
        setStatusRecords([]);
      } finally {
        setStatusLoading(false);
      }
      return;
    }

    if (menu === 'Statuses and Remarks') {
      setStatusesAndRemarksLoading(true);
      setStatusesAndRemarksError('');
      try {
        const data = await fetchStatusesAndRemarksList();
        setStatusesAndRemarksRecords(data);
      } catch (err) {
        setStatusesAndRemarksError(err.message || 'Failed to load records.');
        setStatusesAndRemarksRecords([]);
      } finally {
        setStatusesAndRemarksLoading(false);
      }
      return;
    }

    setSettingsLoading(true);
    setSettingsError('');
    try {
      if (menu === 'Indexing') {
        setRecords(readIndexingSettings());
        return;
      }
      const data = await listSettings(menu);
      setRecords(normalizeSettingRows(menu, data));
    } catch (err) {
      setSettingsError(err.message || 'Failed to load records.');
      setRecords([]);
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadParentOptions = async () => {
    try {
      const [campusesResp, collegesResp] = await Promise.all([
        getDropdowns({ resources: 'campuses', limit: 100 }),
        getDropdowns({ resources: 'colleges', limit: 100 }),
      ]);
      const campuses = Array.isArray(campusesResp?.campuses) ? campusesResp.campuses : [];
      const colleges = Array.isArray(collegesResp?.colleges) ? collegesResp.colleges : [];
      setCampusOptions(campuses.map((item) => ({ value: String(item.id), label: item.name })));
      setCollegeOptions(colleges.map((item) => ({ value: String(item.id), label: item.name })));
    } catch {
      setCampusOptions([]);
      setCollegeOptions([]);
    }
  };

  useEffect(() => {
    if (view !== 'settings') return;
    loadSettings(activeMenu);
  }, [activeMenu, view]);

  useEffect(() => {
    if (view !== 'settings') return;
    if (activeMenu === 'Status') {
      setStatusPagination((prev) => ({ ...prev, page: 1, input: '1' }));
      return;
    }
    if (activeMenu === 'Statuses and Remarks') {
      setStatusesAndRemarksPagination((prev) => ({ ...prev, page: 1, input: '1' }));
      return;
    }
    setSettingsPage(1);
  }, [activeMenu, view]);

  useEffect(() => {
    if (view !== 'settings') return;
    loadParentOptions();
  }, [view]);

  const settingsTotalPages = Math.max(1, Math.ceil(activeRecords.length / SETTINGS_PAGE_SIZE));
  const settingsCurrentPage = Math.min(activeSettingsPage, settingsTotalPages);
  const settingsStartIndex = (settingsCurrentPage - 1) * SETTINGS_PAGE_SIZE;
  const settingsVisibleRows = activeRecords.slice(settingsStartIndex, settingsStartIndex + SETTINGS_PAGE_SIZE);

  useEffect(() => {
    if (isStatusMenu) {
      if (statusPagination.page > settingsTotalPages) {
        setStatusPagination((prev) => ({ ...prev, page: settingsTotalPages, input: String(settingsTotalPages) }));
      }
      return;
    }

    if (isStatusesAndRemarksMenu) {
      if (statusesAndRemarksPagination.page > settingsTotalPages) {
        setStatusesAndRemarksPagination((prev) => ({ ...prev, page: settingsTotalPages, input: String(settingsTotalPages) }));
      }
      return;
    }

    if (settingsPage > settingsTotalPages) {
      setSettingsPage(settingsTotalPages);
    }
  }, [
    isStatusMenu,
    isStatusesAndRemarksMenu,
    settingsPage,
    settingsTotalPages,
    statusPagination.page,
    statusesAndRemarksPagination.page,
  ]);

  useEffect(() => {
    if (isStatusMenu) {
      setStatusPagination((prev) => ({ ...prev, input: String(settingsCurrentPage) }));
      return;
    }
    if (isStatusesAndRemarksMenu) {
      setStatusesAndRemarksPagination((prev) => ({ ...prev, input: String(settingsCurrentPage) }));
      return;
    }
    setSettingsPageInput(String(settingsCurrentPage));
  }, [settingsCurrentPage]);

  useEffect(() => {
    localStorage.setItem(UI_STATE_STORAGE_KEY, JSON.stringify({
      view,
      activeMenu,
      portalPage,
    }));
  }, [view, activeMenu, portalPage]);

  const addRecord = async () => {
    if (!newName.trim()) return;
    if (isStatusMenu) {
      setStatusError('');
      try {
        await createStatus({ name: newName.trim() });
        setNewName('');
        setNewExtra('');
        setShowAddRow(false);
        await loadSettings(activeMenu);
      } catch (err) {
        setStatusError(err.message || 'Failed to create record.');
      }
      return;
    }

    if (isStatusesAndRemarksMenu) {
      setStatusesAndRemarksError('');
      try {
        await createStatusesAndRemarks({ name: newName.trim() });
        setNewName('');
        setNewExtra('');
        setShowAddRow(false);
        await loadSettings(activeMenu);
      } catch (err) {
        setStatusesAndRemarksError(err.message || 'Failed to create record.');
      }
      return;
    }

    if (isIndexingMenu) {
      const nextName = newName.trim();
      const current = readIndexingSettings();
      const exists = current.some((item) => item.name.toLowerCase() === nextName.toLowerCase());
      if (exists) {
        setSettingsError('Indexing already exists.');
        return;
      }
      const nextRows = [...current, { id: String(Date.now()), name: nextName, extra: '' }];
      setSettingsError('');
      try {
        saveIndexingSettings(nextRows);
        setRecords(nextRows);
        setNewName('');
        setNewExtra('');
        setShowAddRow(false);
      } catch (err) {
        setSettingsError(err.message || 'Failed to create record.');
      }
      return;
    }
    const { extraLabel } = settingsMeta;
    if (extraLabel && !newExtra.trim()) {
      setSettingsError(`${extraLabel} is required.`);
      return;
    }
    setSettingsError('');
    try {
      await createSetting(activeMenu, { name: newName.trim(), extra: newExtra.trim() });
      setNewName('');
      setNewExtra('');
      setShowAddRow(false);
      await loadSettings(activeMenu);
    } catch (err) {
      setSettingsError(err.message || 'Failed to create record.');
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditName(row.name);
    setEditExtra(row.extra ? String(row.extra) : '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditExtra('');
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    if (isStatusMenu) {
      setStatusError('');
      try {
        await updateStatus(id, { name: editName.trim() });
        cancelEdit();
        await loadSettings(activeMenu);
      } catch (err) {
        setStatusError(err.message || 'Failed to update record.');
      }
      return;
    }

    if (isStatusesAndRemarksMenu) {
      setStatusesAndRemarksError('');
      try {
        await updateStatusesAndRemarks(id, { name: editName.trim() });
        cancelEdit();
        await loadSettings(activeMenu);
      } catch (err) {
        setStatusesAndRemarksError(err.message || 'Failed to update record.');
      }
      return;
    }

    if (isIndexingMenu) {
      const nextName = editName.trim();
      const current = readIndexingSettings();
      const exists = current.some((item) => item.id !== id && item.name.toLowerCase() === nextName.toLowerCase());
      if (exists) {
        setSettingsError('Indexing already exists.');
        return;
      }
      const nextRows = current.map((item) => (item.id === id ? { ...item, name: nextName } : item));
      setSettingsError('');
      try {
        saveIndexingSettings(nextRows);
        cancelEdit();
        setRecords(nextRows);
      } catch (err) {
        setSettingsError(err.message || 'Failed to update record.');
      }
      return;
    }
    const { extraLabel } = settingsMeta;
    if (extraLabel && !editExtra.trim()) {
      setSettingsError(`${extraLabel} is required.`);
      return;
    }
    setSettingsError('');
    try {
      await updateSetting(activeMenu, id, { name: editName.trim(), extra: editExtra.trim() });
      cancelEdit();
      await loadSettings(activeMenu);
    } catch (err) {
      setSettingsError(err.message || 'Failed to update record.');
    }
  };

  const removeRow = async (id) => {
    if (isStatusMenu) {
      setStatusError('');
      try {
        await deleteStatus(id);
        setStatusRecords((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        setStatusError(err.message || 'Failed to delete record.');
      }
      return;
    }

    if (isStatusesAndRemarksMenu) {
      setStatusesAndRemarksError('');
      try {
        await deleteStatusesAndRemarks(id);
        setStatusesAndRemarksRecords((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        setStatusesAndRemarksError(err.message || 'Failed to delete record.');
      }
      return;
    }

    setSettingsError('');
    try {
      if (isIndexingMenu) {
        const nextRows = readIndexingSettings().filter((item) => item.id !== id);
        saveIndexingSettings(nextRows);
        setRecords(nextRows);
        return;
      }
      await deleteSetting(activeMenu, id);
      await loadSettings(activeMenu);
    } catch (err) {
      setSettingsError(err.message || 'Failed to delete record.');
    }
  };

  const resetDashState = () => {
    setEditingId(null);
    setShowAddRow(false);
    setNewName('');
    setNewExtra('');
    setEditName('');
    setEditExtra('');
    setSettingsError('');
    setStatusError('');
    setStatusesAndRemarksError('');
    setSettingsPage(1);
    setSettingsPageInput('1');
    setStatusPagination({ page: 1, input: '1' });
    setStatusesAndRemarksPagination({ page: 1, input: '1' });
  };

  const goToSettingsPage = (targetPage) => {
    const next = Math.min(Math.max(targetPage, 1), settingsTotalPages);
    if (isStatusMenu) {
      setStatusPagination({ page: next, input: String(next) });
      return;
    }
    if (isStatusesAndRemarksMenu) {
      setStatusesAndRemarksPagination({ page: next, input: String(next) });
      return;
    }
    setSettingsPage(next);
    setSettingsPageInput(String(next));
  };

  const handleSettingsPageSubmit = () => {
    const parsed = Number(activeSettingsPageInput);
    if (!Number.isFinite(parsed)) {
      if (isStatusMenu) {
        setStatusPagination((prev) => ({ ...prev, input: String(settingsCurrentPage) }));
        return;
      }
      if (isStatusesAndRemarksMenu) {
        setStatusesAndRemarksPagination((prev) => ({ ...prev, input: String(settingsCurrentPage) }));
        return;
      }
      setSettingsPageInput(String(settingsCurrentPage));
      return;
    }
    goToSettingsPage(Math.trunc(parsed));
  };

  const goTo = (v) => {
    resetDashState();
    if (v === 'evaluation') setPortalPage('eval-dashboard');
    if (v === 'repository') setPortalPage('db-dashboard');
    setView(v);
  };

  const handlePortalNavigate = (page) => {
    setPortalPage(page);
    if (page.startsWith('eval-') || page === 'tracking') setView('evaluation');
    if (page.startsWith('db-')) setView('repository');
  };

  const handleHeaderLogoClick = () => {
    if (view === 'landing') {
      window.location.reload();
      return;
    }
    setAuthError('');
    setView('landing');
  };

  const handlePostLoginLogoClick = () => {
    if (view === 'repository' || view === 'evaluation' || view === 'settings' || view === 'incentives') {
      // Send user to the main post-login home screen.
      goTo('home');
      return;
    }
    if (view === 'home') {
      window.location.reload();
    }
  };

  const LandingHeader = () => <DarkHeader onLogoClick={handleHeaderLogoClick} />;

  const portalPages = {
    'eval-dashboard': EvaluationDashboard,
    'eval-form': ResearchEvalForm,
    tracking: EvaluationTracking,
    'db-dashboard': DatabaseDashboard,
    'db-form': ResearchRepository,
  };

  // ── LANDING ──────────────────────────────────────────────────────
  if (view === 'landing') return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: F }}>
      <DarkHeader onLogoClick={handleHeaderLogoClick} />
      <div style={{ ...S.landingBg, backgroundImage: `url(${backDesign})` }}>
        <div style={S.landingFade}>
          <div style={S.rightPanel}>
            <div style={S.landingContent}>
              <div style={S.logoBadge}>Scholar Sphere</div>
              <h1 style={S.heroText}>Elevating TIP's Research Landscape</h1>
              <p style={S.heroSubtext}>
                Dive into the heart of academic exploration with the Academic Research Unit (ARU) at
                Technological Institute of the Philippines. Uncover, share, and incentivize groundbreaking
                research at ScholarSphere.
              </p>
              <button onClick={() => setView('login')} style={S.primaryBtn}>Login or Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── LOGIN ────────────────────────────────────────────────────────
  if (view === 'login') return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: F }}>
      <DarkHeader onLogoClick={handleHeaderLogoClick} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={S.authFormPanel}>
          <div style={S.authFormInner}>
            <h2 style={S.authHeading}>Log In</h2>
            {authError && <div style={S.errorBox}>{authError}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input style={S.inp} type="email" placeholder="Enter email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={handleEnterKey(handleLogin)} />
              <PasswordField
                style={S.inp}
                placeholder="Password"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                onKeyDown={handleEnterKey(handleLogin)}
                autoComplete="current-password"
              />
              <button
                style={{ ...S.submitBtn, opacity: authLoading ? 0.8 : 1 }}
                onClick={handleLogin}
                disabled={authLoading}
              >
                {authLoading ? 'Logging in...' : 'Login'}
              </button>
              <p style={S.switchText}>Don't have an account?{' '}<span onClick={() => { setAuthError(''); setView('signup'); }} style={S.switchLink}>Sign Up</span></p>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <LoginIllustration />
          <div style={{ ...S.quoteBox, top: '60px', left: '48px', right: '48px', textAlign: 'left' }}>
            <p style={S.quoteText}>Research is formalized <span style={{ color: '#d4a017' }}>curiosity</span>. It is poking and<br />prying with a <span style={{ color: '#d4a017' }}>purpose</span>.</p>
            <p style={{ ...S.quoteAuthor, textAlign: 'right', marginTop: '12px' }}>-Zora Neale Hurston</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );

  // ── SIGN UP ──────────────────────────────────────────────────────
  if (view === 'signup') {
    return (
      <Registration
        styles={S}
        DarkHeader={LandingHeader}
        Footer={Footer}
        onSwitchToLogin={() => setView('login')}
      />
    );
  }

  // ── HOME ─────────────────────────────────────────────────────────
  if (view === 'home') return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: F, background: '#f5f4f0' }}>
      <div style={S.dashTopBar}>
        <div style={{ ...S.logoBox, cursor: 'pointer' }} onClick={handlePostLoginLogoClick} title="Refresh page">
          <img src={tipLogo} alt="TIP Logo" style={S.logoImg} />
          <div style={S.headerTextGroup}>
            <span style={S.headerTitle}>Academic Research Unit</span>
            <span style={S.headerSubtitle}>Technological Institute of the Philippines</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {DASH_NAV.map(({ label, view: target }) => (
            <button key={label} className="navBtn" onClick={() => goTo(target)}
              style={{ ...S.navBtn, borderBottomColor: 'transparent', color: '#ccc' }}>
              {label}
            </button>
          ))}
          <button onClick={handleLogout} style={S.logoutBtn}>Log out</button>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <PieChartSection />
      </div>
      <Footer />
    </div>
  );

  // ── SETTINGS ─────────────────────────────────────────────────────
  if (view === 'settings') return (
    <DashShell
      activeView={view}
      setView={goTo}
      handleLogout={handleLogout}
      activeMenu={activeMenu}
      setActiveMenu={(m) => { resetDashState(); setActiveMenu(m); }}
      onLogoClick={handlePostLoginLogoClick}
    >
      <header style={S.dashHeader}>
        <h1 style={S.welcomeText}><span style={{ color: '#d4a017' }}>Settings</span></h1>
      </header>
      <section style={S.infoCard}>
        <div style={S.cardTitleRow}>
          <h2 style={S.cardHeading}>{activeMenu.toUpperCase()}</h2>
        </div>
        {activeSettingsError && <div style={{ ...S.errorBox, marginBottom: '12px' }}>{activeSettingsError}</div>}
        <div style={S.block}>
          <div style={{ ...S.blockHeader, marginBottom: '14px' }}>
            <span style={S.blockLabel}>Records</span>
            <button style={S.uploadBtn} onClick={() => setShowAddRow(v => !v)}>
              {showAddRow ? '✕ Cancel' : '+ Add Record'}
            </button>
          </div>
          {showAddRow && (
            <div style={S.addRowForm}>
              <input
                style={{ ...S.inp, flex: 1 }}
                placeholder="Name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={handleEnterKey(addRecord)}
              />
              {!isIndexingMenu && activeMenu === 'College' && (
                <select style={{ ...S.inp, ...S.sel, flex: 1 }} value={newExtra} onChange={e => setNewExtra(e.target.value)} onKeyDown={handleEnterKey(addRecord)}>
                  <option value="">Select campus</option>
                  {campusOptions.map((campus) => (
                    <option key={campus.value} value={String(campus.value)}>{campus.label}</option>
                  ))}
                </select>
              )}
              {!isIndexingMenu && activeMenu === 'Department' && (
                <select style={{ ...S.inp, ...S.sel, flex: 1 }} value={newExtra} onChange={e => setNewExtra(e.target.value)} onKeyDown={handleEnterKey(addRecord)}>
                  <option value="">Select college</option>
                  {collegeOptions.map((college) => (
                    <option key={college.value} value={String(college.value)}>{college.label}</option>
                  ))}
                </select>
              )}
              <button style={S.saveBtn} onClick={addRecord}>✔ Save</button>
            </div>
          )}
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr style={S.thead}>
                  <th style={{ ...S.th, width: '60px' }}>ID</th>
                  <th style={S.th}>{isIndexingMenu ? 'Indexing' : 'Name'}</th>
                  {!isIndexingMenu && <th style={S.th}>{settingsMeta.extraLabel || 'Details'}</th>}
                  <th style={{ ...S.th, width: '190px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeSettingsLoading ? (
                  <tr><td colSpan={isIndexingMenu ? 3 : 4} style={S.emptyCell}>Loading records...</td></tr>
                ) : activeRecords.length === 0 ? (
                  <tr><td colSpan={isIndexingMenu ? 3 : 4} style={S.emptyCell}>No records yet. Click "+ Add Record" to get started.</td></tr>
                ) : settingsVisibleRows.map((row, i) => (
                  <tr key={row.id} style={{ backgroundColor: i % 2 === 0 ? '#fafaf8' : '#fff' }}>
                    <td style={S.td}>{settingsStartIndex + i + 1}</td>
                    <td style={S.td}>
                      {editingId === row.id
                        ? <input style={S.inlineInp} value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={handleEnterKey(() => saveEdit(row.id))} placeholder="Name" />
                        : row.name}
                    </td>
                    {!isIndexingMenu && (
                      <td style={S.td}>
                        {editingId === row.id ? (
                          activeMenu === 'College' ? (
                          <select style={{ ...S.inlineInp, ...S.sel }} value={editExtra} onChange={e => setEditExtra(e.target.value)} onKeyDown={handleEnterKey(() => saveEdit(row.id))}>
                            <option value="">Select campus</option>
                            {campusOptions.map((campus) => (
                              <option key={campus.value} value={String(campus.value)}>{campus.label}</option>
                            ))}
                          </select>
                          ) : activeMenu === 'Department' ? (
                          <select style={{ ...S.inlineInp, ...S.sel }} value={editExtra} onChange={e => setEditExtra(e.target.value)} onKeyDown={handleEnterKey(() => saveEdit(row.id))}>
                            <option value="">Select college</option>
                            {collegeOptions.map((college) => (
                              <option key={college.value} value={String(college.value)}>{college.label}</option>
                            ))}
                          </select>
                          ) : (
                          row.extra || '—'
                          )
                        ) : (row.extra || '—')}
                      </td>
                    )}
                    <td style={{ ...S.td, textAlign: 'center' }}>
                      {editingId === row.id ? (
                        <>
                          <button className="actionBtn" style={S.saveBtn}   onClick={() => saveEdit(row.id)}>✔ Save</button>
                          <button className="actionBtn" style={S.cancelBtn} onClick={cancelEdit}>✕ Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="actionBtn" style={S.renameBtn} onClick={() => startEdit(row)}>Rename</button>
                          <button className="actionBtn" style={S.deleteBtn} onClick={() => removeRow(row.id)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!activeSettingsLoading && activeRecords.length > 0 && (
            <div style={S.paginationBar}>
              <button
                type="button"
                style={{ ...S.pageBtn, opacity: settingsCurrentPage === 1 ? 0.5 : 1, cursor: settingsCurrentPage === 1 ? 'not-allowed' : 'pointer' }}
                onClick={() => goToSettingsPage(settingsCurrentPage - 1)}
                disabled={settingsCurrentPage === 1}
              >
                {'<'}
              </button>
              <span style={S.pageLabel}>Page {settingsCurrentPage} of {settingsTotalPages}</span>
              <button
                type="button"
                style={{ ...S.pageBtn, opacity: settingsCurrentPage === settingsTotalPages ? 0.5 : 1, cursor: settingsCurrentPage === settingsTotalPages ? 'not-allowed' : 'pointer' }}
                onClick={() => goToSettingsPage(settingsCurrentPage + 1)}
                disabled={settingsCurrentPage === settingsTotalPages}
              >
                {'>'}
              </button>
              <input
                type="number"
                min="1"
                max={settingsTotalPages}
                value={activeSettingsPageInput}
                onChange={(e) => {
                  if (isStatusMenu) {
                    setStatusPagination((prev) => ({ ...prev, input: e.target.value }));
                    return;
                  }
                  if (isStatusesAndRemarksMenu) {
                    setStatusesAndRemarksPagination((prev) => ({ ...prev, input: e.target.value }));
                    return;
                  }
                  setSettingsPageInput(e.target.value);
                }}
                onKeyDown={handleEnterKey(handleSettingsPageSubmit)}
                style={S.pageInput}
              />
              <button type="button" style={S.pageGoBtn} onClick={handleSettingsPageSubmit}>Go</button>
            </div>
          )}
        </div>
      </section>
    </DashShell>
  );

  // ── REPOSITORY ───────────────────────────────────────────────────
  if (view === 'repository') {
    const RepositoryPage = portalPages[portalPage] || DatabaseDashboard;
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: F }}>
        <DashTopBar activeView={view} setView={goTo} handleLogout={handleLogout} onLogoClick={handlePostLoginLogoClick} />
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <RepositoryPage onNavigate={handlePortalNavigate} onBack={() => goTo('home')} />
        </div>
      </div>
    );
  }

  // ── EVALUATION ───────────────────────────────────────────────────
  if (view === 'evaluation') {
    const EvaluationPage = portalPages[portalPage] || EvaluationDashboard;
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', fontFamily: F }}>
        <DashTopBar activeView={view} setView={goTo} handleLogout={handleLogout} onLogoClick={handlePostLoginLogoClick} />
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <EvaluationPage onNavigate={handlePortalNavigate} onBack={() => goTo('home')} />
        </div>
      </div>
    );
  }

  // ── INCENTIVES ───────────────────────────────────────────────────
  if (view === 'incentives') return (
    <DashShell
      activeView={view}
      setView={goTo}
      handleLogout={handleLogout}
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
      onLogoClick={handlePostLoginLogoClick}
    >
      <header style={S.dashHeader}>
        <h1 style={S.welcomeText}><span style={{ color: '#d4a017' }}>Incentives</span></h1>
      </header>
      <section style={S.infoCard}>
        <p style={{ fontFamily: F, color: '#888', fontSize: '14px' }}>Incentives content goes here.</p>
      </section>
    </DashShell>
  );

  return null;
}

// ── STYLES ─────────────────────────────────────────────────────────
const S = {
  topHeader:        { width: '100%', backgroundColor: '#1a1a1a', borderBottom: '1px solid #333', flexShrink: 0, zIndex: 100 },
  headerInner:      { padding: '15px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logoBox:          { display: 'flex', alignItems: 'center', gap: '17px' },
  logoImg:          { width: '55px', height: '55px', objectFit: 'contain', flexShrink: 0 },
  headerTextGroup:  { display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left' },
  headerTitle:      { color: '#f0e8d0', fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: '700', letterSpacing: '0.3px' },
  headerSubtitle:   { color: '#999', fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: '400' },
  footer:           { width: '100%', backgroundColor: '#d4a017', padding: '14px 28px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px', flexShrink: 0 },
  footerLink:       { fontSize: '12px', color: '#1a1a1a', fontFamily: 'Georgia, serif', cursor: 'pointer' },
  landingBg:        { flex: 1, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden' },
  landingFade:      { position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,0) 38%, rgba(255,255,255,0.92) 58%, rgba(255,255,255,0.97) 72%)', display: 'flex', alignItems: 'center' },
  rightPanel:       { marginLeft: 'auto', width: '48%', padding: '0 72px 0 48px' },
  landingContent:   { width: '100%', textAlign: 'right' },
  logoBadge:        { display: 'inline-block', color: '#d4a017', fontWeight: '700', fontSize: '20px', letterSpacing: '3px', fontFamily: 'Georgia, serif', marginBottom: '10px' },
  heroText:         { fontSize: '35px', fontWeight: '900', color: '#1a1a1a', margin: '0 0 16px 0', lineHeight: '1.18', fontFamily: 'Georgia, serif' },
  heroSubtext:      { fontSize: '16px', color: '#444', marginBottom: '34px', lineHeight: '1.75', fontFamily: 'Georgia, serif', maxWidth: '600px', marginLeft: 'auto' },
  primaryBtn:       { padding: '12px 36px', background: '#d4a017', color: '#1a1a1a', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '14px', fontFamily: 'Georgia, serif', letterSpacing: '0.5px', boxShadow: '0 4px 18px rgba(212,160,23,.35)' },
  authFormPanel:    { width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', overflowY: 'auto', padding: '40px 20px' },
  authFormInner:    { width: '100%', maxWidth: '400px' },
  authHeading:      { fontSize: '22px', fontWeight: '700', color: '#2a2a2a', marginBottom: '24px', fontFamily: 'Georgia, serif' },
  inp:              { width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', fontFamily: 'Georgia, serif', color: '#2a2a2a', background: '#fff', outline: 'none', boxSizing: 'border-box' },
  sel:              { backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23666' strokeWidth='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'pointer' },
  submitBtn:        { width: '100%', padding: '12px', background: '#3a5fc8', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', fontSize: '15px', fontFamily: 'Georgia, serif', letterSpacing: '0.3px' },
  switchText:       { fontSize: '13px', color: '#555', fontFamily: 'Georgia, serif', margin: 0 },
  switchLink:       { color: '#3a5fc8', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600' },
  errorBox:         { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', textAlign: 'center', fontSize: '13px', fontFamily: 'Georgia, serif', marginBottom: '8px' },
  quoteBox:         { position: 'absolute', top: '55px', left: '50px', right: '50px', fontFamily: 'Georgia, serif' },
  quoteText:        { fontSize: '25px', lineHeight: '1.45', color: '#2a2a2a', margin: 0, fontWeight: '400' },
  quoteAuthor:      { marginTop: '14px', color: '#666', fontSize: '15px', fontFamily: 'Georgia, serif' },
  dashTopBar:       { width: '100%', backgroundColor: '#1a1a1a', borderBottom: '1px solid #333', padding: '15px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 100 },
  dashLayout:       { flex: 1, display: 'flex', backgroundColor: '#f5f4f0', overflow: 'hidden' },
  sidebar:          { width: '240px', minWidth: '240px', background: 'rgba(255,255,255,0.97)', padding: '30px 14px', display: 'flex', flexDirection: 'column', gap: '5px', borderRight: '1px solid #e8e2d4', overflowY: 'auto' },
  sideTitle:        { fontSize: '14px', fontWeight: '800', color: '#2a2a2a', marginBottom: '14px', fontFamily: 'Georgia, serif', letterSpacing: '0.4px' },
  sideBtn:          { textAlign: 'left', padding: '10px 13px', borderRadius: '7px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'Georgia, serif', transition: 'all 0.18s' },
  dashMain:         { flex: 1, backgroundColor: 'transparent', overflowY: 'auto', padding: '36px 44px' },
  dashHeader:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  welcomeText:      { fontSize: '23px', fontWeight: '900', color: '#1a1a1a', fontFamily: 'Georgia, serif', margin: 0 },
  navBtn:           { padding: '9px 14px', background: 'transparent', color: '#ccc', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: '600', letterSpacing: '0.3px', transition: 'all 0.15s' },
  logoutBtn:        { padding: '8px 22px', background: 'transparent', border: '1px solid #555', borderRadius: '7px', cursor: 'pointer', color: '#ccc', fontWeight: '700', fontSize: '13px', fontFamily: 'Georgia, serif', marginLeft: '10px' },
  infoCard:         { background: '#ffffff', borderRadius: '14px', padding: '30px 34px 36px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  cardTitleRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  cardHeading:      { fontSize: '15px', color: '#2a2a2a', fontWeight: '800', fontFamily: 'Georgia, serif', margin: 0, letterSpacing: '0.4px' },
  block:            { marginBottom: '28px' },
  blockHeader:      { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' },
  blockLabel:       { fontSize: '14px', fontWeight: '700', color: '#2a2a2a', fontFamily: 'Georgia, serif' },
  uploadBtn:        { padding: '7px 18px', background: '#d4a017', color: '#2a2a2a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'Georgia, serif', fontWeight: '700' },
  addRowForm:       { display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center', background: '#fffdf5', border: '1px solid #e8dfc0', borderRadius: '8px', padding: '12px 14px' },
  tableWrap:        { overflowX: 'auto', borderRadius: '10px', border: '1px solid #e8e2d4' },
  table:            { width: '100%', borderCollapse: 'collapse', fontFamily: 'Georgia, serif', fontSize: '13px' },
  thead:            { backgroundColor: '#2a2a2a' },
  th:               { padding: '12px 16px', textAlign: 'left', color: '#d4a017', fontWeight: '700', fontSize: '12px', letterSpacing: '0.6px', textTransform: 'uppercase', fontFamily: 'Georgia, serif' },
  td:               { padding: '11px 16px', color: '#2a2a2a', borderBottom: '1px solid #f0ece4', verticalAlign: 'middle' },
  emptyCell:        { padding: '42px 16px', textAlign: 'center', color: '#bbb', fontStyle: 'italic', fontFamily: 'Georgia, serif', fontSize: '14px' },
  inlineInp:        { width: '100%', padding: '6px 10px', border: '1px solid #d4a017', borderRadius: '5px', fontSize: '13px', fontFamily: 'Georgia, serif', color: '#2a2a2a', outline: 'none', background: '#fffdf5' },
  renameBtn:        { padding: '5px 12px', background: '#fdf3d8', color: '#b8860b', border: '1px solid #d4a017', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontFamily: 'Georgia, serif', fontWeight: '700', marginRight: '6px' },
  deleteBtn:        { padding: '5px 12px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontFamily: 'Georgia, serif', fontWeight: '700' },
  saveBtn:          { padding: '5px 12px', background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontFamily: 'Georgia, serif', fontWeight: '700', marginRight: '6px' },
  cancelBtn:        { padding: '5px 12px', background: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontFamily: 'Georgia, serif', fontWeight: '700' },
  paginationBar:    { marginTop: '12px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  pageBtn:          { minWidth: '34px', height: '32px', borderRadius: '6px', border: '1px solid #d9d2bf', background: '#fff', color: '#2a2a2a', fontFamily: 'Georgia, serif', fontSize: '13px', fontWeight: '700' },
  pageLabel:        { fontSize: '13px', color: '#6b6354', fontFamily: 'Georgia, serif', minWidth: '95px', textAlign: 'center' },
  pageInput:        { width: '64px', height: '32px', borderRadius: '6px', border: '1px solid #d9d2bf', background: '#fff', color: '#2a2a2a', fontFamily: 'Georgia, serif', fontSize: '13px', textAlign: 'center', outline: 'none' },
  pageGoBtn:        { height: '32px', padding: '0 12px', borderRadius: '6px', border: '1px solid #d9d2bf', background: '#f9f6ee', color: '#2a2a2a', fontFamily: 'Georgia, serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
};
