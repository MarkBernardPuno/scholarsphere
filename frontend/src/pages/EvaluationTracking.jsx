import { useState, useEffect } from "react";
import SidebarNav from "../components/layout/SidebarNav";
import { API_BASE_URL } from "../api/client";

const API = API_BASE_URL;
const TRACKING_API = `${API}/research-evaluations/`;

const STATUSES = [
  { key: "Submitted",    label: "Submitted",    color: "#1565c0", bg: "#e3f2fd" },
  { key: "Under Review", label: "Under Review", color: "#e65100", bg: "#fff3e0" },
  { key: "For Revision", label: "For Revision", color: "#6a1b9a", bg: "#f3e5f5" },
  { key: "Approved",     label: "Approved",     color: "#2e7d32", bg: "#e8f5e9" },
  { key: "Rejected",     label: "Rejected",     color: "#c62828", bg: "#ffebee" },
];

// ── Shared UI ──────────────────────────────────────────────────────────────────
const iStyle = {
  width: "100%", background: "#f9f9f9", border: "1.5px solid #e0e0e0", borderRadius: 3,
  padding: "9px 11px", fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#0d0d0d",
  outline: "none", appearance: "none",
};

const overlay  = { position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalBox = { background: "#fff", borderRadius: 6, width: "92%", maxWidth: 560,
  maxHeight: "88vh", boxShadow: "0 24px 72px rgba(0,0,0,.35)", display: "flex", flexDirection: "column" };
const mHead    = { padding: "16px 24px", borderBottom: "1px solid #e0e0e0",
  display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 };
const mTitle   = { fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 800, color: "#0d0d0d" };
const closeBtn = { background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#9e9e9e", padding: "2px 6px" };
const btnPri   = { background: "#F5C400", color: "#0d0d0d", border: "none", padding: "9px 22px",
  fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 800,
  letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2 };
const btnSec   = { background: "#fff", color: "#5a5a5a", border: "1.5px solid #e0e0e0",
  padding: "8px 18px", fontFamily: "'Barlow',sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 };

const StatusBadge = ({ s }) => {
  const cfg = STATUSES.find(x => x.key === s) || STATUSES[0];
  return (
    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700,
      padding: "3px 10px", borderRadius: 10, whiteSpace: "nowrap", letterSpacing: "0.5px" }}>
      {cfg.label}
    </span>
  );
};

const getRecordId = (row, fallback = 0) => row?.re_id ?? row?.evaluation_id ?? row?.id ?? fallback;

const normalizeTrackingRecord = (row, index = 0) => {
  const links = row?.document_links && typeof row.document_links === "object" ? row.document_links : {};
  const journalInfo = row?.journal_conference_info && typeof row.journal_conference_info === "object"
    ? row.journal_conference_info
    : {};
  const id = getRecordId(row, index + 1);
  const createdDate = row?.created_at ? String(row.created_at).slice(0, 10) : "";
  return {
    ...row,
    re_id: id,
    tracking_status: row?.tracking_status ?? row?.status ?? "Submitted",
    title_of_research: row?.title_of_research ?? row?.research_title ?? `Research Evaluation #${id}`,
    author_id: row?.author_id ?? row?.authorship_from_link ?? `Paper #${row?.paper_id ?? "N/A"}`,
    college_id: row?.college_id ?? "",
    remarks: row?.remarks ?? journalInfo?.remarks ?? "",
    appointment_date: row?.appointment_date ?? createdDate,
    authorship_form: row?.authorship_form ?? links?.authorship_form ?? "",
    evaluation_form: row?.evaluation_form ?? links?.evaluation_form ?? "",
    full_paper: row?.full_paper ?? links?.full_paper ?? "",
    turnitin_report: row?.turnitin_report ?? links?.turnitin_report ?? "",
    grammarly_report: row?.grammarly_report ?? links?.grammarly_report ?? "",
    journal_conference_info: row?.journal_conference_info ?? links?.journal_conference_info ?? "",
  };
};

const normalizeTrackingList = (payload) => {
  if (Array.isArray(payload)) return payload.map(normalizeTrackingRecord);
  if (payload && Array.isArray(payload.research_evaluations)) {
    return payload.research_evaluations.map(normalizeTrackingRecord);
  }
  return [];
};

// FIX: prepend API base so server file paths render as real download links
const FileLink = ({ url, label }) => {
  const href = url ? (url.startsWith("http") ? url : `${API}${url}`) : null;
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" style={{
      color: "#1565c0", textDecoration: "none", fontSize: 11, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 4, marginBottom: 4,
    }}>
      <span>📄</span> {label}
    </a>
  ) : (
    <div style={{ color: "#ccc", fontSize: 11, marginBottom: 4 }}>No {label}</div>
  );
};

// ── Status Timeline ────────────────────────────────────────────────────────────
function StatusTimeline({ current }) {
  const steps = ["Submitted", "Under Review", "For Revision", "Approved"];
  const currentIdx = steps.indexOf(current);
  const isRejected = current === "Rejected";

  return (
    <div style={{ padding: "18px 0 10px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 2, background: "#e0e0e0", zIndex: 0 }} />
        {steps.map((step, i) => {
          const done   = !isRejected && i <= currentIdx;
          const active = !isRejected && i === currentIdx;
          const cfg    = STATUSES.find(x => x.key === step);
          return (
            <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: done ? (active ? cfg.color : "#2e7d32") : "#e0e0e0",
                border: active ? `3px solid ${cfg.color}` : "3px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: done ? "#fff" : "#9e9e9e",
                boxShadow: active ? `0 0 0 4px ${cfg.bg}` : "none",
                transition: "all .3s",
              }}>
                {done && !active ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
                color: done ? (active ? cfg.color : "#2e7d32") : "#9e9e9e",
                marginTop: 6, textAlign: "center", lineHeight: 1.3 }}>
                {step.replace(" ", "\n")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

const EVALUATION_SIDEBAR_ITEMS = [
  { page: "eval-dashboard", icon: "📋", label: "Evaluation Records" },
  { page: "eval-form", icon: "📄", label: "Submit Evaluation" },
  { page: "tracking", icon: "📍", label: "Tracking" },
];

function Sidebar({ onNavigate, activePage, onBack }) {
  return (
    <SidebarNav
      sectionTitle="Research Evaluation"
      items={EVALUATION_SIDEBAR_ITEMS}
      activePage={activePage}
      onNavigate={onNavigate}
    />
  );
}

// ── Detail Modal ───────────────────────────────────────────────────────────────
function DetailModal({ r, onClose }) {
  const VF = ({ label, value }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: "#9e9e9e" }}>{label}</div>
      <div style={{ fontSize: 14, color: "#0d0d0d", marginTop: 3 }}>{value || "—"}</div>
    </div>
  );
  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth: 620 }}>
        <div style={mHead}>
          <span style={mTitle}>Tracking Detail — RE-{r.re_id}</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding: "20px 24px", overflowY: "auto" }}>
          <StatusBadge s={r.tracking_status || "Submitted"} />
          <StatusTimeline current={r.tracking_status || "Submitted"} />
          <div style={{ height: 1, background: "#f0f0f0", margin: "16px 0" }} />
          <VF label="Title" value={r.title_of_research} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <VF label="Author" value={r.author_id} />
            <VF label="College" value={r.college_id} />
          </div>
          <div style={{ marginTop: 15, background: "#f9f9f9", padding: 12, borderRadius: 4, border: "1px solid #eee" }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase",
              color: "#9e9e9e", marginBottom: 10 }}>Uploaded Documents</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <FileLink url={r.authorship_form}        label="Authorship Form" />
              <FileLink url={r.evaluation_form}        label="Evaluation Form" />
              <FileLink url={r.full_paper}             label="Full Paper" />
              <FileLink url={r.turnitin_report}        label="Turnitin Report" />
              <FileLink url={r.grammarly_report}       label="Grammarly Report" />
              <FileLink url={r.journal_conference_info} label="Journal/Conf Info" />
            </div>
          </div>
          {r.remarks && (
            <div style={{ marginTop: 15 }}>
              <VF label="Remarks" value={r.remarks} />
            </div>
          )}
        </div>
        <div style={{ padding: "12px 24px", borderTop: "1px solid #e0e0e0" }}>
          <button onClick={onClose} style={btnSec}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Inline Editing Table Row ───────────────────────────────────────────────────
function TrackingRow({ r, onUpdate, onView }) {
  const [status,  setStatus]  = useState(r.tracking_status || "Submitted");
  const [remarks, setRemarks] = useState(r.remarks || "");

  const [vAuth,     setVAuth]     = useState(false);
  const [vEval,     setVEval]     = useState(false);
  const [vPaper,    setVPaper]    = useState(false);
  const [vTurnitin, setVTurnitin] = useState(false);
  const [vGrammarly,setVGrammarly]= useState(false);  // FIX: was setVGammarly (typo)
  const [vJournal,  setVJournal]  = useState(false);

  const [saving, setSaving] = useState(false);

  // Sync if parent data changes
  useEffect(() => {
    setStatus(r.tracking_status || "Submitted");
    setRemarks(r.remarks || "");
  }, [r]);

  const isChanged  = status !== (r.tracking_status || "Submitted") || remarks !== (r.remarks || "");
  const allVerified = vAuth && vEval && vPaper && vTurnitin && vGrammarly && vJournal;
  const isBlocked  = status === "Approved" && !allVerified;

  const tdStyle = { padding: "14px 14px", verticalAlign: "top", borderBottom: "1px solid #f0f0f0" };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${TRACKING_API}${getRecordId(r)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          journal_conference_info: {
            ...(r.journal_conference_info && typeof r.journal_conference_info === "object" ? r.journal_conference_info : {}),
            remarks,
          },
        }),
      });
      if (res.ok) {
        const updated = normalizeTrackingRecord(await res.json());
        onUpdate(updated);   // FIX: pass fresh server response, not stale r
      }
    } catch (_) { alert("Failed to save record."); }
    finally { setSaving(false); }
  };

  const Check = ({ label, checked, onChange }) => (
    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11,
      cursor: "pointer", color: checked ? "#2e7d32" : "#5a5a5a", fontWeight: checked ? 700 : 500 }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        style={{ width: 12, height: 12, accentColor: "#2e7d32" }} />
      {label}
    </label>
  );

  // FIX: use journal_conference_info to match the actual API field name
  const hasJournal = r.journal_conference_info || r.journal_info;

  return (
    <tr style={{ background: isChanged ? "#fffde7" : "transparent", transition: "background 0.3s" }}>
      <td style={tdStyle}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800,
          color: "#F5C400", fontSize: 13, background: "#0d0d0d",
          padding: "2px 7px", borderRadius: 2 }}>
          RE-{r.re_id}
        </span>
      </td>

      <td style={{ ...tdStyle, maxWidth: 220 }}>
        <div style={{ fontWeight: 600, color: "#0d0d0d", marginBottom: 4 }}>{r.title_of_research}</div>
        <div style={{ fontSize: 11, color: "#9e9e9e" }}>{r.author_id} • {r.college_id}</div>
        <div style={{ fontSize: 11, color: "#9e9e9e", marginTop: 4 }}>
          Date: {r.appointment_date || r.evaluation_date || "—"}
        </div>
      </td>

      <td style={{ ...tdStyle, minWidth: 150 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FileLink url={r.authorship_form}         label="Authorship Form" />
          <FileLink url={r.evaluation_form}         label="Evaluation Form" />
          <FileLink url={r.full_paper}              label="Full Paper" />
          <FileLink url={r.turnitin_report}         label="Turnitin Report" />
          <FileLink url={r.grammarly_report}        label="Grammarly Report" />
          <FileLink url={hasJournal}                label="Journal/Conf Info" />
        </div>
      </td>

      <td style={{ ...tdStyle, minWidth: 140, background: "#fcfcfc",
        borderRight: "1px dashed #e0e0e0", borderLeft: "1px dashed #e0e0e0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Check label="Authorship"  checked={vAuth}      onChange={setVAuth} />
          <Check label="Evaluation"  checked={vEval}      onChange={setVEval} />
          <Check label="Full Paper"  checked={vPaper}     onChange={setVPaper} />
          <Check label="Turnitin"    checked={vTurnitin}  onChange={setVTurnitin} />
          <Check label="Grammarly"   checked={vGrammarly} onChange={setVGrammarly} />
          <Check label="Journal Info"checked={vJournal}   onChange={setVJournal} />
        </div>
      </td>

      <td style={tdStyle}>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ ...iStyle, padding: "6px 8px", fontSize: 12, marginBottom: 6,
            border: isBlocked ? "1.5px solid #c62828" : iStyle.border }}>
          {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <input type="text" placeholder="Remarks..." value={remarks}
          onChange={e => setRemarks(e.target.value)}
          style={{ ...iStyle, padding: "6px 8px", fontSize: 12 }} />
        {isBlocked && (
          <div style={{ color: "#c62828", fontSize: 10, fontWeight: 700, marginTop: 6, lineHeight: 1.2 }}>
            ⚠ VERIFY ALL FILES<br />TO APPROVE
          </div>
        )}
      </td>

      <td style={tdStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {isChanged && (
            <button onClick={save} disabled={saving || isBlocked}
              style={{ ...btnPri, padding: "6px 12px", fontSize: 11,
                opacity: (saving || isBlocked) ? 0.5 : 1 }}>
              {saving ? "..." : "SAVE"}
            </button>
          )}
          <button onClick={onView}
            style={{ ...btnSec, padding: "6px 12px", fontSize: 11,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <span>👁</span> View Full
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function EvaluationTracking({ onNavigate, onBack }) {
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filterS,  setFilterS]  = useState("");
  const [viewing,  setViewing]  = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(TRACKING_API);
      if (!res.ok) {
        setRecords([]);
      } else {
        const payload = await res.json();
        setRecords(normalizeTrackingList(payload));
      }
    }
    catch (_) { setRecords([]); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = records.filter(r => {
    const q  = search.toLowerCase();
    const ms = !q ||
      (r.title_of_research || "").toLowerCase().includes(q) ||
      (r.author_id || "").toLowerCase().includes(q) ||
      (r.college_id || "").toLowerCase().includes(q);
    const mf = !filterS || (r.tracking_status || "Submitted") === filterS;
    return ms && mf;
  });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.key] = records.filter(r => (r.tracking_status || "Submitted") === s.key).length;
    return acc;
  }, {});

  // FIX: when a row updates, also refresh the viewing modal if it's open for that record
  const handleUpdate = (updated) => {
    setRecords(rs => rs.map(x => x.re_id === updated.re_id ? updated : x));
    setViewing(v => v && v.re_id === updated.re_id ? updated : v);
  };

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0, overflow: "hidden" }}>

      {/* ── Sidebar ── */}
      <Sidebar onNavigate={onNavigate} activePage="tracking" onBack={onBack} />

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ minHeight: "100%", background: "#f5f5f5" }}>

          {/* Header */}
          <div style={{ background: "#0d0d0d", padding: "24px 40px", borderBottom: "3px solid #F5C400",
            display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", color: "#F5C400",
                fontSize: 9, fontWeight: 700, letterSpacing: "3px",
                textTransform: "uppercase", opacity: .7, marginBottom: 4 }}>
                Research Evaluation
              </div>
              <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", color: "#fff",
                fontSize: 32, fontWeight: 900, textTransform: "uppercase",
                letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: 12 }}>
                Evaluation Tracking
                <span style={{ background: "#F5C400", color: "#0d0d0d", fontSize: 11,
                  fontWeight: 800, padding: "2px 10px", borderRadius: 2 }}>
                  {records.length}
                </span>
              </h1>
            </div>
            <button onClick={() => onNavigate("eval-form")} style={btnPri}>+ Add New Entry</button>
          </div>

          {/* Status Summary Cards */}
          <div style={{ padding: "20px 40px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
              {STATUSES.map(cfg => (
                <button key={cfg.key}
                  onClick={() => setFilterS(filterS === cfg.key ? "" : cfg.key)}
                  style={{
                    background: filterS === cfg.key ? cfg.bg : "#fff",
                    border: filterS === cfg.key ? `2px solid ${cfg.color}` : "1.5px solid #e0e0e0",
                    borderRadius: 6, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                    transition: "all .15s",
                    boxShadow: filterS === cfg.key ? `0 2px 12px ${cfg.bg}` : "none",
                  }}>
                  <div style={{ fontSize: 22, fontWeight: 900,
                    fontFamily: "'Barlow Condensed',sans-serif",
                    color: cfg.color, lineHeight: 1 }}>
                    {counts[cfg.key] || 0}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: filterS === cfg.key ? cfg.color : "#9e9e9e", marginTop: 4 }}>
                    {cfg.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div style={{ padding: "0 40px 16px", display: "flex", gap: 12, alignItems: "center" }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, author, or college…"
              style={{ ...iStyle, maxWidth: 360, background: "#fff" }} />
            <div style={{ position: "relative" }}>
              <select value={filterS} onChange={e => setFilterS(e.target.value)}
                style={{ ...iStyle, width: 180, background: "#fff" }}>
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s.key} value={s.key}>{s.key}</option>)}
              </select>
              <span style={{ position: "absolute", right: 9, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none", color: "#9e9e9e" }}>▾</span>
            </div>
            {(search || filterS) && (
              <button onClick={() => { setSearch(""); setFilterS(""); }}
                style={{ ...btnSec, fontSize: 12 }}>Clear</button>
            )}
          </div>

          {/* Table */}
          <div style={{ padding: "0 40px 40px" }}>
            <div style={{ background: "#fff", borderRadius: 4, border: "1px solid #e0e0e0", overflow: "auto" }}>
              {loading ? (
                <div style={{ padding: 48, textAlign: "center", color: "#9e9e9e" }}>Loading records…</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: 64, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>No records found</div>
                  <div style={{ fontSize: 13, color: "#9e9e9e", marginTop: 6 }}>
                    {records.length === 0
                      ? "No evaluation records to track yet."
                      : "Try adjusting your search or filters."}
                  </div>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 1200 }}>
                  <thead>
                    <tr style={{ background: "#f9f9f9", borderBottom: "1.5px solid #e0e0e0" }}>
                      {["ID", "Research Details", "Uploaded Files", "Verification", "Status & Remarks", "Actions"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 9,
                          fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                          color: "#9e9e9e", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => (
                      <TrackingRow
                        key={r.re_id}
                        r={r}
                        onUpdate={handleUpdate}
                        onView={() => setViewing(r)}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {filtered.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#9e9e9e" }}>
                Showing {filtered.length} of {records.length} record{records.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

        </div>
      </div>

      {viewing  && <DetailModal r={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
