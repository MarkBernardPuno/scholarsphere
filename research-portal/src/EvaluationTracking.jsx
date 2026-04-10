import { useState, useEffect } from "react";

const API = "http://localhost:8000";

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
function Sidebar({ onNavigate, activePage }) {
  const navItem = (page, icon, label) => {
    const isActive = activePage === page;
    return (
      <button
        key={page}
        onClick={() => onNavigate(page)}
        style={{
          display: "flex", alignItems: "center", gap: 9,
          padding: "9px 18px", fontFamily: "'Barlow',sans-serif",
          fontSize: 13, fontWeight: isActive ? 600 : 500,
          color: isActive ? "#0d0d0d" : "#3a3a3a",
          cursor: "pointer", width: "100%", textAlign: "left",
          background: isActive ? "#fffbea" : "none",
          border: "none",
          borderLeft: isActive ? "3px solid #F5C400" : "3px solid transparent",
          transition: "background 0.12s, color 0.12s",
          boxSizing: "border-box",
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f5f5f5"; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "none"; }}
      >
        <span style={{ fontSize: 14, opacity: isActive ? 1 : 0.55, flexShrink: 0 }}>{icon}</span>
        {label}
        {isActive && (
          <span style={{ width: 6, height: 6, background: "#F5C400",
            borderRadius: "50%", marginLeft: "auto", flexShrink: 0 }} />
        )}
      </button>
    );
  };

  const sectionLabel = (text) => (
    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 8, fontWeight: 700,
      letterSpacing: "2.5px", textTransform: "uppercase", color: "#b0b0b0",
      padding: "10px 18px 4px" }}>
      {text}
    </div>
  );

  return (
    <aside style={{
      width: 190, flexShrink: 0, background: "#ffffff",
      borderRight: "2px solid #0d0d0d",
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100vh", overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid #e8e8e8" }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 8, fontWeight: 700,
          letterSpacing: "2.5px", textTransform: "uppercase", color: "#9e9e9e", marginBottom: 4 }}>
          TIP – Scholar Sphere
        </div>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 900,
          textTransform: "uppercase", lineHeight: 1.05, color: "#F5C400", letterSpacing: "-0.5px" }}>
          Research<br />Portal
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0" }}>
        <div style={{ marginBottom: 4 }}>
          {sectionLabel("Research Evaluation")}
          {navItem("eval-form",      "📄", "Submit Evaluation")}
          {navItem("eval-dashboard", "📋", "Evaluation Records")}
          {navItem("tracking",       "📍", "Tracking")}
        </div>
        <div style={{ marginBottom: 4 }}>
          {sectionLabel("Research Repository")}
          {navItem("db-form",      "📄", "Submit Research")}
          {navItem("db-dashboard", "📋", "Research Records")}
        </div>
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 18px", borderTop: "1px solid #e8e8e8",
        fontSize: 10, color: "#c0c0c0", fontFamily: "'Barlow',sans-serif" }}>
        Scholar Sphere v1.0
      </div>
    </aside>
  );
}

// ── Admin Create Modal ─────────────────────────────────────────────────────────
// FIX: Send as FormData (multipart) to match the /evaluations POST endpoint,
//      not JSON — the backend rejects JSON for this route.
function CreateEvaluationModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    title_of_research: "", evaluation_date: "",
    tracking_status: "Submitted", author_id: "", college_id: "",
    school_year_id: "", semester_id: "", campus_id: "", department_id: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.title_of_research.trim()) {
      alert("Research title is required."); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      const res = await fetch(`${API}/evaluations`, { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).detail || "Error saving");
      onSaved(await res.json());
    } catch (e) { alert(e.message || "Error saving"); }
    finally { setSaving(false); }
  };

  const lbl = (t) => (
    <label style={{ display: "block", fontSize: 9, fontWeight: 700,
      textTransform: "uppercase", marginBottom: 5, color: "#5a5a5a" }}>{t}</label>
  );

  return (
    <div style={overlay}>
      <div style={modalBox}>
        <div style={mHead}>
          <span style={mTitle}>New Research Evaluation</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          <div style={{ marginBottom: 15 }}>
            {lbl("Research Title")}
            <input style={iStyle} value={form.title_of_research}
              onChange={e => set("title_of_research", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 15 }}>
            <div>
              {lbl("Evaluation Date")}
              <input type="date" style={iStyle} value={form.evaluation_date}
                onChange={e => set("evaluation_date", e.target.value)} />
            </div>
            <div>
              {lbl("Status")}
              <select style={iStyle} value={form.tracking_status}
                onChange={e => set("tracking_status", e.target.value)}>
                {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 15 }}>
            <div>{lbl("Author(s)")}
              <input style={iStyle} value={form.author_id} onChange={e => set("author_id", e.target.value)} /></div>
            <div>{lbl("College")}
              <input style={iStyle} value={form.college_id} onChange={e => set("college_id", e.target.value)} /></div>
            <div>{lbl("School Year")}
              <input style={iStyle} value={form.school_year_id} onChange={e => set("school_year_id", e.target.value)} /></div>
            <div>{lbl("Semester")}
              <input style={iStyle} value={form.semester_id} onChange={e => set("semester_id", e.target.value)} /></div>
            <div>{lbl("Campus")}
              <input style={iStyle} value={form.campus_id} onChange={e => set("campus_id", e.target.value)} /></div>
            <div>{lbl("Department")}
              <input style={iStyle} value={form.department_id} onChange={e => set("department_id", e.target.value)} /></div>
          </div>
          <div style={{ background: "#fcfcfc", padding: 12, border: "1px dashed #e0e0e0", borderRadius: 4 }}>
            <label style={{ display: "block", fontSize: 9, fontWeight: 800,
              textTransform: "uppercase", color: "#9e9e9e", marginBottom: 8 }}>
              Note: File uploads can be added after creation via the Evaluation Records page.
            </label>
          </div>
        </div>
        <div style={{ padding: "13px 24px", borderTop: "1px solid #e0e0e0",
          display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnSec}>Cancel</button>
          <button onClick={save} disabled={saving} style={btnPri}>
            {saving ? "Saving…" : "Create"}
          </button>
        </div>
      </div>
    </div>
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
      const res = await fetch(`${API}/evaluations/${r.re_id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_status: status, remarks }),
      });
      if (res.ok) {
        const updated = await res.json();
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
export default function EvaluationTracking({ onNavigate }) {
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filterS,  setFilterS]  = useState("");
  const [viewing,  setViewing]  = useState(null);
  const [showAdd,  setShowAdd]  = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try { setRecords(await (await fetch(`${API}/evaluations`)).json()); }
    catch (_) { setRecords([]); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = records.filter(r => {
    const q  = search.toLowerCase();
    const ms = !q ||
      r.title_of_research?.toLowerCase().includes(q) ||
      r.author_id?.toLowerCase().includes(q) ||
      r.college_id?.toLowerCase().includes(q);
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
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* ── Sidebar ── */}
      <Sidebar onNavigate={onNavigate} activePage="tracking" />

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
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
            <button onClick={() => setShowAdd(true)} style={btnPri}>+ Add New Entry</button>
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
      {showAdd  && (
        <CreateEvaluationModal
          onClose={() => setShowAdd(false)}
          onSaved={n => { setRecords(rs => [...rs, n]); setShowAdd(false); }}
        />
      )}
    </div>
  );
}
