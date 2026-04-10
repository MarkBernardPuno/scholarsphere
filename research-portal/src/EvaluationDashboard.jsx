import { useState, useEffect } from "react";

const API = "http://localhost:8000";

const CAMPUSES     = ["TIP-QC (Quezon City)", "TIP-Manila"];
const SCHOOL_YEARS = ["2021-2022","2022-2023","2023-2024","2024-2025","2025-2026"];
const SEMESTERS    = ["1st Semester","2nd Semester","Summer"];
const COLLEGES     = [
  "College of Engineering and Architecture","College of Computer Studies",
  "College of Business Education","College of Arts","Graduate","College of Education",
];
const DEPTS = {
  "College of Engineering and Architecture": [
    "Architecture (BS Arch)","Chemical Engineering (BSChE)","Civil Engineering (BSCE)",
    "Computer Engineering (BSCpE)","Electrical Engineering (BSEE)","Electronics Engineering (BSECE)",
    "Environmental and Sanitary Engineering (BSEnSE)","Industrial Engineering (BSIE)","Mechanical Engineering (BSME)",
  ],
  "College of Computer Studies": [
    "Computer Science (BSCS)","Information Systems (BSIS)",
    "Information Technology (BSIT)","Data Science and Analytics (BSDSA)",
  ],
  "College of Business Education": ["Business Administration (BSBA)","Accountancy (BSA)"],
  "College of Arts": ["Arts in Communication (BA Comm)"],
  "Graduate": [
    "Information Technology (MIT)","Science in Computer Science (MSCS)","Information Systems (MSIS)",
    "Engineering - Civil Engineering (MCE)","Engineering - Electronics Engineering (MECE)",
    "Engineering Management","Logistics Management","Supply Chain Management",
  ],
  "College of Education": ["Secondary Education (BSEd)","Teaching Certificate Program (TCP)"],
};

const FILE_FIELDS = [
  { key:"authorship_form",         label:"Authorship Form" },
  { key:"evaluation_form",         label:"Evaluation Form" },
  { key:"full_paper",              label:"Full Paper" },
  { key:"turnitin_report",         label:"Turnitin Report" },
  { key:"grammarly_report",        label:"Grammarly Report" },
  { key:"journal_conference_info", label:"Journal / Conference Info" },
];

const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png";

// ── Shared UI ─────────────────────────────────────────────────────────────────
const iStyle = {
  width:"100%", background:"#f9f9f9", border:"1.5px solid #e0e0e0", borderRadius:3,
  padding:"9px 11px", fontFamily:"'Barlow',sans-serif", fontSize:13, color:"#0d0d0d",
  outline:"none", appearance:"none",
};
const Input = (p) => <input style={iStyle} {...p} />;
const Lbl   = ({ t }) => (
  <label style={{ display:"block", fontSize:9, fontWeight:700, letterSpacing:"2px",
    textTransform:"uppercase", color:"#5a5a5a", marginBottom:5 }}>{t}</label>
);
const Sel   = ({ val, onChange, opts, placeholder, disabled }) => (
  <div style={{ position:"relative" }}>
    <select value={val} onChange={onChange} disabled={disabled} style={iStyle}>
      <option value="">{placeholder}</option>
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
    <span style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)",
      pointerEvents:"none", color:"#9e9e9e", fontSize:11 }}>▾</span>
  </div>
);
const F     = ({ label, children }) => (
  <div style={{ marginBottom:13 }}><Lbl t={label} />{children}</div>
);
const Row   = ({ children, cols=2 }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:12, marginBottom:13 }}>
    {children}
  </div>
);
const SLbl  = ({ t }) => (
  <div style={{ fontSize:10, fontWeight:700, letterSpacing:"2.5px", textTransform:"uppercase",
    color:"#9e9e9e", borderBottom:"1px solid #e0e0e0", paddingBottom:7,
    marginBottom:13, marginTop:18 }}>{t}</div>
);

const overlay  = { position:"fixed", inset:0, background:"rgba(0,0,0,.55)",
  display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 };
const modalBox = { background:"#fff", borderRadius:6, width:"92%", maxHeight:"90vh",
  boxShadow:"0 20px 60px rgba(0,0,0,.3)", display:"flex", flexDirection:"column" };
const mHead    = { padding:"16px 24px", borderBottom:"1px solid #e0e0e0",
  display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 };
const mTitle   = { fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:800, color:"#0d0d0d" };
const closeBtn = { background:"none", border:"none", fontSize:16, cursor:"pointer", color:"#9e9e9e", padding:"2px 6px" };
const btnPri   = { background:"#F5C400", color:"#0d0d0d", border:"none", padding:"9px 22px",
  fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:800,
  letterSpacing:"2px", textTransform:"uppercase", cursor:"pointer", borderRadius:2 };
const btnSec   = { background:"#fff", color:"#5a5a5a", border:"1.5px solid #e0e0e0",
  padding:"8px 18px", fontFamily:"'Barlow',sans-serif", fontSize:12, cursor:"pointer", borderRadius:2 };
const td       = { padding:"11px 14px", verticalAlign:"middle" };
const actBtn   = { border:"none", padding:"5px 8px", borderRadius:3, cursor:"pointer", fontSize:13, lineHeight:1 };

// ── File download link ────────────────────────────────────────────────────────
const FileLink = ({ url, name }) => url ? (
  <a href={`${API}${url}`} target="_blank" rel="noreferrer" download={name} style={{
    color:"#1565c0", fontSize:12, textDecoration:"none",
    display:"inline-flex", alignItems:"center", gap:4,
    background:"#e3f2fd", padding:"3px 8px", borderRadius:3, fontWeight:500,
  }}>
    📥 {name || "Download"}
  </a>
) : <span style={{ color:"#ccc", fontSize:12 }}>—</span>;

// ── Mini file upload for edit modal ──────────────────────────────────────────
function MiniFileUpload({ label, fieldKey, currentName, newFile, onChange }) {
  return (
    <div style={{ marginBottom:13 }}>
      <Lbl t={label} />
      <div style={{ border:"1.5px dashed #e0e0e0", borderRadius:3, padding:"10px 12px",
        background:"#f9f9f9", display:"flex", alignItems:"center", justifyContent:"space-between",
        gap:10, flexWrap:"wrap" }}>
        <div>
          {newFile ? (
            <span style={{ fontSize:12, color:"#2e7d32", fontWeight:600 }}>
              ✅ {newFile.name}
            </span>
          ) : (
            <span style={{ fontSize:12, color:"#5a5a5a" }}>
              Current: <strong>{currentName || "—"}</strong>
            </span>
          )}
        </div>
        <label style={{ cursor:"pointer", background:"#F5C400", color:"#0d0d0d",
          fontSize:11, fontWeight:800, padding:"5px 12px", borderRadius:2,
          letterSpacing:"1px", textTransform:"uppercase", whiteSpace:"nowrap" }}>
          {newFile ? "Replace" : "Upload New"}
          <input type="file" accept={ACCEPTED} style={{ display:"none" }}
            onChange={e => onChange(fieldKey, e.target.files[0] || null)} />
        </label>
      </div>
      {newFile && (
        <button onClick={() => onChange(fieldKey, null)} style={{
          marginTop:4, background:"none", border:"none", color:"#e53935",
          fontSize:11, cursor:"pointer", padding:0,
        }}>✕ Keep original</button>
      )}
    </div>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ r, onClose }) {
  const VF = ({ label, value }) => value ? (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:9, fontWeight:700, letterSpacing:"2px",
        textTransform:"uppercase", color:"#9e9e9e" }}>{label}</div>
      <div style={{ fontSize:14, color:"#0d0d0d", marginTop:3 }}>{value}</div>
    </div>
  ) : null;

  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth:640 }}>
        <div style={mHead}>
          <span style={mTitle}>Record RE-{r.re_id}</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding:"20px 24px", overflowY:"auto", flex:1 }}>
          <SLbl t="Research Information" />
          <VF label="Title of Research" value={r.title_of_research} />
          <Row><VF label="School Year" value={r.school_year_id} /><VF label="Semester" value={r.semester_id} /></Row>
          <SLbl t="Author(s) & Academic Unit" />
          <VF label="Author(s)" value={r.author_id} />
          <VF label="Campus" value={r.campus_id} />
          <Row><VF label="College" value={r.college_id} /><VF label="Department" value={r.department_id} /></Row>
          <SLbl t="Uploaded Documents" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {FILE_FIELDS.map(({ key, label }) => (
              <div key={key} style={{ marginBottom:8 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:"2px",
                  textTransform:"uppercase", color:"#9e9e9e", marginBottom:6 }}>{label}</div>
                <FileLink url={r[key]} name={r[`${key}_name`]} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding:"12px 24px", borderTop:"1px solid #e0e0e0", flexShrink:0 }}>
          <button onClick={onClose} style={btnSec}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ r, onClose, onSaved }) {
  const [form, setF] = useState({
    author_id: r.author_id, campus_id: r.campus_id, college_id: r.college_id,
    department_id: r.department_id, school_year_id: r.school_year_id,
    semester_id: r.semester_id, title_of_research: r.title_of_research,
  });
  const [newFiles, setNewFiles] = useState({
    authorship_form:null, evaluation_form:null, full_paper:null,
    turnitin_report:null, grammarly_report:null, journal_conference_info:null,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set   = (k, v) => setF(f => ({ ...f, [k]: v }));
  const on    = (k) => (e) => set(k, e.target.value);
  const setNF = (k, v) => setNewFiles(f => ({ ...f, [k]: v }));
  const depts = DEPTS[form.college_id] || [];

  const save = async () => {
    setSaving(true); setErr("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      FILE_FIELDS.forEach(({ key }) => {
        if (newFiles[key]) fd.append(key, newFiles[key]);
        else fd.append(key, new Blob([]), "");   // empty = keep existing
      });
      const res = await fetch(`${API}/evaluations/${r.re_id}`, { method:"PUT", body:fd });
      if (!res.ok) throw new Error((await res.json()).detail);
      onSaved(await res.json());
    } catch (e) { setErr(e.message || "Update failed."); }
    finally { setSaving(false); }
  };

  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth:700 }}>
        <div style={mHead}>
          <span style={mTitle}>Edit Record RE-{r.re_id}</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding:"20px 24px", overflowY:"auto", flex:1 }}>

          <SLbl t="Research Information" />
          <F label="Title of Research">
            <Input type="text" value={form.title_of_research} onChange={on("title_of_research")} />
          </F>
          <Row>
            <F label="School Year"><Sel val={form.school_year_id} onChange={on("school_year_id")} opts={SCHOOL_YEARS} placeholder="Select" /></F>
            <F label="Semester"><Sel val={form.semester_id} onChange={on("semester_id")} opts={SEMESTERS} placeholder="Select" /></F>
          </Row>

          <SLbl t="Author(s) & Academic Unit" />
          <F label="Author(s)">
            <Input type="text" value={form.author_id} onChange={on("author_id")}
              placeholder="Comma-separated names" />
          </F>
          <F label="Campus">
            <Sel val={form.campus_id} onChange={on("campus_id")} opts={CAMPUSES} placeholder="Select campus" />
          </F>
          <Row>
            <F label="College">
              <Sel val={form.college_id}
                onChange={e => { set("college_id", e.target.value); set("department_id",""); }}
                opts={COLLEGES} placeholder="Select college" />
            </F>
            <F label="Department">
              <Sel val={form.department_id} onChange={on("department_id")} opts={depts}
                disabled={!form.college_id}
                placeholder={form.college_id ? "Select" : "Select college first"} />
            </F>
          </Row>

          <SLbl t="Documents — Leave blank to keep existing file" />
          <Row>
            {FILE_FIELDS.slice(0,2).map(({ key, label }) => (
              <MiniFileUpload key={key} label={label} fieldKey={key}
                currentName={r[`${key}_name`]} newFile={newFiles[key]} onChange={setNF} />
            ))}
          </Row>
          <Row>
            {FILE_FIELDS.slice(2,4).map(({ key, label }) => (
              <MiniFileUpload key={key} label={label} fieldKey={key}
                currentName={r[`${key}_name`]} newFile={newFiles[key]} onChange={setNF} />
            ))}
          </Row>
          <Row>
            {FILE_FIELDS.slice(4,6).map(({ key, label }) => (
              <MiniFileUpload key={key} label={label} fieldKey={key}
                currentName={r[`${key}_name`]} newFile={newFiles[key]} onChange={setNF} />
            ))}
          </Row>

          {err && <div style={{ color:"#e53935", fontSize:12, marginTop:4 }}>{err}</div>}
        </div>
        <div style={{ padding:"13px 24px", borderTop:"1px solid #e0e0e0",
          display:"flex", gap:10, justifyContent:"flex-end", flexShrink:0 }}>
          <button onClick={onClose} style={btnSec}>Cancel</button>
          <button onClick={save} disabled={saving} style={btnPri}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ r, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const del = async () => {
    setLoading(true);
    await fetch(`${API}/evaluations/${r.re_id}`, { method:"DELETE" });
    onDeleted(r.re_id);
  };
  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth:420 }}>
        <div style={mHead}>
          <span style={mTitle}>Delete Record</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding:"20px 24px" }}>
          <p style={{ fontSize:14, color:"#0d0d0d", lineHeight:1.6 }}>
            Delete <strong>RE-{r.re_id}</strong>?<br/>
            <span style={{ color:"#9e9e9e", fontSize:12 }}>"{r.title_of_research}"</span>
          </p>
          <p style={{ fontSize:12, color:"#e53935", marginTop:10 }}>This cannot be undone.</p>
        </div>
        <div style={{ padding:"13px 24px", borderTop:"1px solid #e0e0e0",
          display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={btnSec}>Cancel</button>
          <button onClick={del} disabled={loading}
            style={{ ...btnPri, background:"#e53935", color:"#fff" }}>
            {loading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ onNavigate, activePage }) {
  const navItem = (page, icon, label) => {
    const isActive = activePage === page;
    return (
      <button
        key={page}
        onClick={() => onNavigate(page)}
        style={{
          display:"flex", alignItems:"center", gap:9,
          padding:"9px 18px", fontFamily:"'Barlow',sans-serif",
          fontSize:13, fontWeight: isActive ? 600 : 500,
          color: isActive ? "#0d0d0d" : "#3a3a3a",
          cursor:"pointer", width:"100%", textAlign:"left",
          background: isActive ? "#fffbea" : "none",
          border:"none",
          borderLeft: isActive ? "3px solid #F5C400" : "3px solid transparent",
          transition:"background 0.12s, color 0.12s",
          boxSizing:"border-box",
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f5f5f5"; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "none"; }}
      >
        <span style={{ fontSize:14, opacity: isActive ? 1 : 0.55, flexShrink:0 }}>{icon}</span>
        {label}
        {isActive && (
          <span style={{ width:6, height:6, background:"#F5C400",
            borderRadius:"50%", marginLeft:"auto", flexShrink:0 }} />
        )}
      </button>
    );
  };

  const sectionLabel = (text) => (
    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:8, fontWeight:700,
      letterSpacing:"2.5px", textTransform:"uppercase", color:"#b0b0b0",
      padding:"10px 18px 4px" }}>
      {text}
    </div>
  );

  return (
    <aside style={{
      width:190, flexShrink:0, background:"#ffffff",
      borderRight:"2px solid #0d0d0d",
      display:"flex", flexDirection:"column",
      position:"sticky", top:0, height:"100vh", overflowY:"auto",
    }}>
      {/* Logo */}
      <div style={{ padding:"20px 18px 16px", borderBottom:"1px solid #e8e8e8" }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:8, fontWeight:700,
          letterSpacing:"2.5px", textTransform:"uppercase", color:"#9e9e9e", marginBottom:4 }}>
          TIP – Scholar Sphere
        </div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:900,
          textTransform:"uppercase", lineHeight:1.05, color:"#F5C400", letterSpacing:"-0.5px" }}>
          Research<br />Portal
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"12px 0" }}>
        <div style={{ marginBottom:4 }}>
          {sectionLabel("Research Evaluation")}
          {navItem("eval-form",      "📄", "Submit Evaluation")}
          {navItem("eval-dashboard", "📋", "Evaluation Records")}
          {navItem("tracking",       "📍", "Tracking")}
        </div>
        <div style={{ marginBottom:4 }}>
          {sectionLabel("Research Repository")}
          {navItem("db-form",      "📄", "Submit Research")}
          {navItem("db-dashboard", "📋", "Research Records")}
        </div>
      </nav>

      {/* Footer */}
      <div style={{ padding:"12px 18px", borderTop:"1px solid #e8e8e8",
        fontSize:10, color:"#c0c0c0", fontFamily:"'Barlow',sans-serif" }}>
        Scholar Sphere v1.0
      </div>
    </aside>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function EvaluationDashboard({ onNavigate }) {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterCampus, setFC]   = useState("");
  const [viewing, setViewing]   = useState(null);
  const [editing, setEditing]   = useState(null);
  const [deleting, setDeleting] = useState(null);

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
      r.title_of_research.toLowerCase().includes(q) ||
      r.author_id.toLowerCase().includes(q) ||
      r.college_id.toLowerCase().includes(q) ||
      r.department_id.toLowerCase().includes(q);
    const mc = !filterCampus || r.campus_id === filterCampus;
    return ms && mc;
  });

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>

      {/* Sidebar */}
      <Sidebar onNavigate={onNavigate} activePage="eval-dashboard" />

      {/* Main content */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
      <div style={{ minHeight:"100%", background:"#f5f5f5" }}>

      {/* Header */}
      <div style={{ background:"#0d0d0d", padding:"24px 40px", borderBottom:"3px solid #F5C400",
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", color:"#F5C400",
            fontSize:9, fontWeight:700, letterSpacing:"3px", textTransform:"uppercase",
            opacity:.7, marginBottom:4 }}>Research Evaluation</div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", color:"#fff",
            fontSize:32, fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.5px",
            display:"flex", alignItems:"center", gap:12 }}>
            Evaluation Records
            <span style={{ background:"#F5C400", color:"#0d0d0d", fontSize:11,
              fontWeight:800, padding:"2px 10px", borderRadius:2 }}>{records.length}</span>
          </h1>
        </div>
        <button onClick={() => onNavigate("eval-form")} style={btnPri}>+ Submit New</button>
      </div>

      {/* Stats */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e0e0e0",
        padding:"12px 40px", display:"flex", gap:28, alignItems:"center" }}>
        {CAMPUSES.map(c => {
          const count = records.filter(r => r.campus_id === c).length;
          return (
            <div key={c} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:7, height:7, borderRadius:"50%",
                background: c.includes("QC") ? "#F5C400" : "#1565c0" }}/>
              <span style={{ fontSize:12, color:"#5a5a5a" }}>{c}:</span>
              <span style={{ fontSize:13, fontWeight:700 }}>{count}</span>
            </div>
          );
        })}
        <div style={{ marginLeft:"auto", fontSize:12, color:"#9e9e9e" }}>
          Total: <strong style={{ color:"#0d0d0d" }}>{records.length}</strong>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding:"16px 40px", display:"flex", gap:12, alignItems:"center" }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, author, college, or department…"
          style={{ ...iStyle, maxWidth:380, background:"#fff" }} />
        <div style={{ position:"relative" }}>
          <select value={filterCampus} onChange={e => setFC(e.target.value)}
            style={{ ...iStyle, width:200, background:"#fff" }}>
            <option value="">All Campuses</option>
            {CAMPUSES.map(c => <option key={c}>{c}</option>)}
          </select>
          <span style={{ position:"absolute", right:9, top:"50%",
            transform:"translateY(-50%)", pointerEvents:"none", color:"#9e9e9e" }}>▾</span>
        </div>
        {(search || filterCampus) && (
          <button onClick={() => { setSearch(""); setFC(""); }}
            style={{ ...btnSec, fontSize:12 }}>Clear</button>
        )}
      </div>

      {/* Table */}
      <div style={{ padding:"0 40px 40px" }}>
        <div style={{ background:"#fff", borderRadius:4, border:"1px solid #e0e0e0", overflow:"auto" }}>
          {loading ? (
            <div style={{ padding:48, textAlign:"center", color:"#9e9e9e" }}>Loading records…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:64, textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
              <div style={{ fontSize:15, fontWeight:600 }}>No records found</div>
              <div style={{ fontSize:13, color:"#9e9e9e", marginTop:6 }}>
                {records.length === 0
                  ? "No evaluation records yet."
                  : "Try adjusting your search or filters."}
              </div>
              {records.length === 0 && (
                <button onClick={() => onNavigate("eval-form")}
                  style={{ ...btnPri, marginTop:20 }}>+ Submit First Evaluation</button>
              )}
            </div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:900 }}>
              <thead>
                <tr style={{ background:"#f9f9f9", borderBottom:"1.5px solid #e0e0e0" }}>
                  {["ID","Title","Author(s)","Campus","College","Dept","Year","Documents","Actions"].map(h => (
                    <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:9,
                      fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"#9e9e9e",
                      whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.re_id} style={{ borderBottom:"1px solid #f0f0f0" }}>
                    <td style={td}>
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
                        fontWeight:800, color:"#F5C400", fontSize:13,
                        background:"#0d0d0d", padding:"2px 7px", borderRadius:2 }}>
                        RE-{r.re_id}
                      </span>
                    </td>
                    <td style={{ ...td, maxWidth:200 }}>
                      <div style={{ fontWeight:600, color:"#0d0d0d", overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={r.title_of_research}>
                        {r.title_of_research}
                      </div>
                    </td>
                    <td style={{ ...td, maxWidth:140 }}>
                      <div style={{ fontSize:12, color:"#5a5a5a", overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={r.author_id}>
                        {r.author_id}
                      </div>
                    </td>
                    <td style={td}>
                      <span style={{
                        background: r.campus_id?.includes("QC") ? "#fff8e1" : "#e3f2fd",
                        color: r.campus_id?.includes("QC") ? "#f9a825" : "#1565c0",
                        fontSize:10, fontWeight:700, padding:"3px 7px",
                        borderRadius:10, whiteSpace:"nowrap",
                      }}>
                        {r.campus_id?.includes("QC") ? "TIP-QC" : "TIP-Manila"}
                      </span>
                    </td>
                    <td style={{ ...td, maxWidth:140 }}>
                      <div style={{ fontSize:11, color:"#5a5a5a", overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.college_id}</div>
                    </td>
                    <td style={{ ...td, maxWidth:120 }}>
                      <div style={{ fontSize:11, color:"#5a5a5a", overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.department_id}</div>
                    </td>
                    <td style={td}>
                      <div style={{ fontSize:12, color:"#5a5a5a" }}>{r.school_year_id}</div>
                      <div style={{ fontSize:11, color:"#9e9e9e" }}>{r.semester_id}</div>
                    </td>
                    <td style={td}>
                      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        <FileLink url={r.full_paper} name={r.full_paper_name} />
                        <FileLink url={r.turnitin_report} name={r.turnitin_report_name} />
                      </div>
                    </td>
                    <td style={td}>
                      <div style={{ display:"flex", gap:5 }}>
                        <button onClick={() => setViewing(r)} title="View"
                          style={{ ...actBtn, background:"#e3f2fd", color:"#1565c0" }}>👁</button>
                        <button onClick={() => setEditing(r)} title="Edit"
                          style={{ ...actBtn, background:"#fff8e1", color:"#f9a825" }}>✏️</button>
                        <button onClick={() => setDeleting(r)} title="Delete"
                          style={{ ...actBtn, background:"#ffebee", color:"#e53935" }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {filtered.length > 0 && (
          <div style={{ marginTop:10, fontSize:12, color:"#9e9e9e" }}>
            Showing {filtered.length} of {records.length} record{records.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {viewing  && <ViewModal   r={viewing}  onClose={() => setViewing(null)} />}
      {editing  && <EditModal   r={editing}  onClose={() => setEditing(null)}
        onSaved={u => { setRecords(rs => rs.map(r => r.re_id === u.re_id ? u : r)); setEditing(null); }} />}
      {deleting && <DeleteModal r={deleting} onClose={() => setDeleting(null)}
        onDeleted={id => { setRecords(rs => rs.filter(r => r.re_id !== id)); setDeleting(null); }} />}
      </div>
      </div>
    </div>
  );
}