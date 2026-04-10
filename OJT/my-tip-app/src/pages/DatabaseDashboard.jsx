import { useState, useEffect } from "react";
import { API_BASE_URL } from "../api/client";

const API = API_BASE_URL;
const PAPER_API = `${API}/research/papers`;
const REPOSITORY_API = `${API}/research-database`;

const SCHOOL_YEARS   = ["2021-2022","2022-2023","2023-2024","2024-2025","2025-2026"];
const SEMESTERS      = ["1st Semester","2nd Semester","Summer"];
const OUTPUT_TYPES   = ["Local Presentation","Local Publication","International Presentation","International Publication"];
const RESEARCH_TYPES = ["Student","Faculty","Student & Faculty","Industry Collaborative","Faculty & Industry"];
const INDEXING       = ["Scopus","Web of Science","DOAJ","PubMed","ESCI","Emerging Sources","Others"];
const COLLEGES       = [
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

const EMPTY = {
  school_year_id:"", semester_id:"", research_output_type_id:"", research_title:"",
  research_type_id:"", authors_id:"", college_id:"", program_department_id:"",
  presentation_venue:"", conference_name:"", presentation_abstract:"", presentation_keywords:"",
  doi:"", manuscript_link:"", journal_publisher:"", volume:"", issue_number:"",
  page_number:"", publication_date:"", indexing:"", cite_score:"", impact_factor:"",
  editorial_board:"", journal_website:"", apa_format:"", publication_abstract:"", publication_keywords:"",
};

const TYPE_COLORS = {
  "Local Presentation":         { bg:"#fff8e1", color:"#f9a825" },
  "Local Publication":          { bg:"#e3f2fd", color:"#1565c0" },
  "International Presentation": { bg:"#fce4ec", color:"#ad1457" },
  "International Publication":  { bg:"#e8f5e9", color:"#2e7d32" },
};

const OUTPUT_TYPE_ALIASES = {
  "Presentation": "Local Presentation",
  "Publication": "Local Publication",
  "Intl Presentation": "International Presentation",
  "Intl Publication": "International Publication",
};

const normalizeOutputType = (value) => OUTPUT_TYPE_ALIASES[value] || value;

// ── Shared UI ─────────────────────────────────────────────────────────────────
const iStyle = {
  width:"100%", background:"#f9f9f9", border:"1.5px solid #e0e0e0", borderRadius:3,
  padding:"9px 11px", fontFamily:"'Barlow',sans-serif", fontSize:13, color:"#0d0d0d",
  outline:"none", appearance:"none",
};
const Input  = (p) => <input style={iStyle} {...p} />;
const TA     = (p) => <textarea style={{ ...iStyle, resize:"vertical", minHeight:72, lineHeight:1.6 }} {...p} />;
const Lbl    = ({ t }) => (
  <label style={{ display:"block", fontSize:9, fontWeight:700, letterSpacing:"2px",
    textTransform:"uppercase", color:"#5a5a5a", marginBottom:5 }}>{t}</label>
);
const Sel    = ({ val, onChange, opts, placeholder, disabled }) => (
  <div style={{ position:"relative" }}>
    <select value={val} onChange={onChange} disabled={disabled} style={iStyle}>
      <option value="">{placeholder}</option>
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
    <span style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)",
      pointerEvents:"none", color:"#9e9e9e", fontSize:11 }}>▾</span>
  </div>
);
const F      = ({ label, children }) => (
  <div style={{ marginBottom:13 }}><Lbl t={label} />{children}</div>
);
const Row    = ({ children, cols=2 }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:12, marginBottom:13 }}>
    {children}
  </div>
);
const SLbl   = ({ t }) => (
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
const searchWrap = {
  width: 420,
  maxWidth: "100%",
  height: 42,
  borderRadius: 3,
  background: "#fff",
  border: "1.5px solid #e0e0e0",
  display: "flex",
  alignItems: "center",
  padding: "0 11px",
  boxSizing: "border-box",
};
const searchInput = {
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#0d0d0d",
  fontFamily: "'Barlow',sans-serif",
  fontSize: 13,
  lineHeight: 1,
};

const normalizePaper = (row) => ({
  ...row,
  paper_id: row?.paper_id ?? row?.id,
  research_title: row?.research_title ?? row?.title ?? "Untitled research",
  authors_id: row?.authors_id ?? (Array.isArray(row?.author_ids) ? row.author_ids.join(", ") : ""),
  program_department_id: row?.program_department_id ?? "",
  college_id: row?.college_id ?? "",
  research_output_type_id: normalizeOutputType(String(row?.research_output_type_id ?? "")),
  school_year_id: row?.school_year_id != null ? String(row.school_year_id) : "",
  semester_id: row?.semester_id != null ? String(row.semester_id) : "",
});

const normalizePaperList = (payload) => {
  if (Array.isArray(payload)) return payload.map(normalizePaper);
  if (payload && Array.isArray(payload.papers)) return payload.papers.map(normalizePaper);
  return [];
};

const TypeBadge = ({ t }) => {
  const normalizedType = normalizeOutputType(t);
  const c = TYPE_COLORS[normalizedType] || { bg:"#f0f0f0", color:"#555" };
  return <span style={{ background:c.bg, color:c.color, fontSize:10, fontWeight:700,
    padding:"3px 8px", borderRadius:10, whiteSpace:"nowrap" }}>{normalizedType}</span>;
};

// ── Form used in Edit Modal ───────────────────────────────────────────────────
function RecordForm({ form, setForm }) {
  const set   = (k,v) => setForm(f => ({ ...f, [k]: v }));
  const on    = (k) => (e) => set(k, e.target.value);
  const normalizedType = normalizeOutputType(form.research_output_type_id);
  const showPres = ["Local Presentation","International Presentation"].includes(normalizedType);
  const showPub  = ["Local Publication","International Publication"].includes(normalizedType);
  const depts    = DEPTS[form.college_id] || [];
  return (
    <div>
      <SLbl t="Core Information" />
      <Row>
        <F label="School Year"><Sel val={form.school_year_id} onChange={on("school_year_id")} opts={SCHOOL_YEARS} placeholder="Select" /></F>
        <F label="Semester"><Sel val={form.semester_id} onChange={on("semester_id")} opts={SEMESTERS} placeholder="Select" /></F>
      </Row>
      <F label="Research Output Type"><Sel val={form.research_output_type_id} onChange={on("research_output_type_id")} opts={OUTPUT_TYPES} placeholder="Select" /></F>
      <F label="Research Title"><TA value={form.research_title} onChange={on("research_title")} rows={2} /></F>
      <F label="Research Type"><Sel val={form.research_type_id} onChange={on("research_type_id")} opts={RESEARCH_TYPES} placeholder="Select" /></F>
      <F label="Authors"><Input type="text" value={form.authors_id} onChange={on("authors_id")} /></F>
      <Row>
        <F label="College">
          <Sel val={form.college_id}
            onChange={e => { set("college_id", e.target.value); set("program_department_id",""); }}
            opts={COLLEGES} placeholder="Select" />
        </F>
        <F label="Department">
          <Sel val={form.program_department_id} onChange={on("program_department_id")}
            opts={depts} disabled={!form.college_id}
            placeholder={form.college_id ? "Select" : "Select college first"} />
        </F>
      </Row>
      {showPres && (
        <>
          <SLbl t="Presentation" />
          <Row>
            <F label="Venue"><Input type="text" value={form.presentation_venue} onChange={on("presentation_venue")} /></F>
            <F label="Conference"><Input type="text" value={form.conference_name} onChange={on("conference_name")} /></F>
          </Row>
          <F label="Abstract"><TA value={form.presentation_abstract} onChange={on("presentation_abstract")} rows={3} /></F>
          <F label="Keywords"><Input type="text" value={form.presentation_keywords} onChange={on("presentation_keywords")} /></F>
        </>
      )}
      {showPub && (
        <>
          <SLbl t="Publication" />
          <Row>
            <F label="DOI"><Input type="text" value={form.doi} onChange={on("doi")} /></F>
            <F label="Manuscript Link"><Input type="url" value={form.manuscript_link} onChange={on("manuscript_link")} /></F>
          </Row>
          <F label="Journal / Publisher"><Input type="text" value={form.journal_publisher} onChange={on("journal_publisher")} /></F>
          <Row cols={3}>
            <F label="Volume"><Input type="text" value={form.volume} onChange={on("volume")} /></F>
            <F label="Issue"><Input type="text" value={form.issue_number} onChange={on("issue_number")} /></F>
            <F label="Pages"><Input type="text" value={form.page_number} onChange={on("page_number")} /></F>
          </Row>
          <Row>
            <F label="Pub. Date"><Input type="date" value={form.publication_date || ""} onChange={on("publication_date")} /></F>
            <F label="Indexing"><Sel val={form.indexing} onChange={on("indexing")} opts={INDEXING} placeholder="Select" /></F>
          </Row>
          <Row>
            <F label="Cite Score"><Input type="number" step="0.01" value={form.cite_score || ""} onChange={on("cite_score")} /></F>
            <F label="Impact Factor"><Input type="number" step="0.01" value={form.impact_factor || ""} onChange={on("impact_factor")} /></F>
          </Row>
          <SLbl t="Additional Publication Info" />
          <F label="Editorial Board"><TA value={form.editorial_board} onChange={on("editorial_board")} rows={2} /></F>
          <F label="Journal Website"><Input type="url" value={form.journal_website} onChange={on("journal_website")} /></F>
          <F label="APA Citation"><TA value={form.apa_format} onChange={on("apa_format")} rows={2} /></F>
          <F label="Abstract"><TA value={form.publication_abstract} onChange={on("publication_abstract")} rows={3} /></F>
          <F label="Keywords"><Input type="text" value={form.publication_keywords} onChange={on("publication_keywords")} /></F>
        </>
      )}
    </div>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ r, onClose }) {
  const VF = ({ label, value }) => value ? (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:9, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"#9e9e9e" }}>{label}</div>
      <div style={{ fontSize:14, color:"#0d0d0d", marginTop:3 }}>{String(value)}</div>
    </div>
  ) : null;
  const normalizedType = normalizeOutputType(r.research_output_type_id);
  const showPres = ["Local Presentation","International Presentation"].includes(normalizedType);
  const showPub  = ["Local Publication","International Publication"].includes(normalizedType);
  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth:640 }}>
        <div style={mHead}>
          <span style={mTitle}>Record #P-{r.paper_id}</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding:"20px 24px", overflowY:"auto", flex:1 }}>
          <SLbl t="Core Information" />
          <VF label="Research Title" value={r.research_title} />
          <VF label="Output Type" value={normalizedType} />
          <VF label="Research Type" value={r.research_type_id} />
          <Row><VF label="School Year" value={r.school_year_id} /><VF label="Semester" value={r.semester_id} /></Row>
          <VF label="Authors" value={r.authors_id} />
          <Row><VF label="College" value={r.college_id} /><VF label="Department" value={r.program_department_id} /></Row>
          {showPres && (
            <>
              <SLbl t="Presentation" />
              <VF label="Venue" value={r.presentation_venue} />
              <VF label="Conference" value={r.conference_name} />
              <VF label="Abstract" value={r.presentation_abstract} />
              <VF label="Keywords" value={r.presentation_keywords} />
            </>
          )}
          {showPub && (
            <>
              <SLbl t="Publication" />
              <Row><VF label="DOI" value={r.doi} /><VF label="Publisher" value={r.journal_publisher} /></Row>
              <VF label="Manuscript Link" value={r.manuscript_link} />
              <Row cols={3}><VF label="Volume" value={r.volume} /><VF label="Issue" value={r.issue_number} /><VF label="Pages" value={r.page_number} /></Row>
              <Row><VF label="Pub. Date" value={r.publication_date} /><VF label="Indexing" value={r.indexing} /></Row>
              <Row><VF label="Cite Score" value={r.cite_score} /><VF label="Impact Factor" value={r.impact_factor} /></Row>
              <VF label="Journal Website" value={r.journal_website} />
              <VF label="APA Citation" value={r.apa_format} />
              <VF label="Abstract" value={r.publication_abstract} />
              <VF label="Keywords" value={r.publication_keywords} />
            </>
          )}
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
  const [form, setForm] = useState({ ...EMPTY, ...r,
    publication_date: r.publication_date || "",
    cite_score: r.cite_score || "",
    impact_factor: r.impact_factor || "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    setSaving(true); setErr("");
    try {
      const payload = {
        title: form.research_title,
        research_type_id: form.research_type_id ? Number(form.research_type_id) : null,
        research_output_type_id: form.research_output_type_id ? Number(form.research_output_type_id) : null,
        school_year_id: form.school_year_id ? Number(form.school_year_id) : null,
        semester_id: form.semester_id ? Number(form.semester_id) : null,
      };
      const res = await fetch(`${PAPER_API}/${r.paper_id}`, {
        method:"PUT", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      onSaved(normalizePaper(await res.json()));
    } catch (e) { setErr(e.message || "Update failed."); }
    finally { setSaving(false); }
  };

  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth:680 }}>
        <div style={mHead}>
          <span style={mTitle}>Edit Record #P-{r.paper_id}</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding:"20px 24px", overflowY:"auto", flex:1 }}>
          <RecordForm form={form} setForm={setForm} />
          {err && <div style={{ color:"#e53935", fontSize:12, marginTop:8 }}>{err}</div>}
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
    await fetch(`${REPOSITORY_API}/${r.paper_id}`, { method:"DELETE" });
    onDeleted(r.paper_id);
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
            Delete <strong>#P-{r.paper_id}</strong>?<br/>
            <span style={{ color:"#9e9e9e", fontSize:12 }}>"{r.research_title}"</span>
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
function Sidebar({ onNavigate, activePage, onBack }) {
  const [showRepoMenu, setShowRepoMenu] = useState(true);
  const navItem = (page, icon, label) => {
    const isActive = activePage === page;
    return (
      <button
        key={page}
        onClick={() => onNavigate(page)}
        style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"9px 14px", fontFamily:"'Barlow',sans-serif",
          fontSize:12, fontWeight: isActive ? 600 : 500,
          color: isActive ? "#b8860b" : "#3a3a3a",
          cursor:"pointer", width:"100%", textAlign:"left",
          background: isActive ? "#fffbea" : "none",
          border:"none",
          borderLeft: isActive ? "3px solid #F5C400" : "3px solid transparent",
          transition:"background 0.12s, color 0.12s",
          boxSizing:"border-box",
          whiteSpace:"nowrap",
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

  const sectionToggle = (text, open, onToggle) => (
    <button
      onClick={onToggle}
      style={{
        width:"100%", textAlign:"left", border:"none", background:"transparent", cursor:"pointer",
        fontFamily:"'Barlow Condensed',sans-serif", fontSize:8, fontWeight:700,
        letterSpacing:"2.5px", textTransform:"uppercase", color:"#b0b0b0",
        padding:"10px 18px 4px", display:"flex", justifyContent:"space-between", alignItems:"center",
      }}
    >
      <span>{text}</span>
      <span style={{ fontSize:10 }}>{open ? "▾" : "▸"}</span>
    </button>
  );

  return (
    <aside style={{
      width:190, flexShrink:0, background:"#ffffff",
      borderRight:"2px solid #0d0d0d",
      display:"flex", flexDirection:"column",
      position:"sticky", top:0, height:"100%", overflowY:"auto",
    }}>
      {/* Nav */}
      <nav style={{ flex:1, padding:"12px 0" }}>
        <div style={{ marginBottom:4 }}>
          {sectionToggle("Research Repository", showRepoMenu, () => setShowRepoMenu(v => !v))}
          {showRepoMenu && navItem("db-dashboard", "📋", "Research Records")}
          {showRepoMenu && navItem("db-form",      "📄", "Submit Research")}
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
export default function Dashboard({ onNavigate, onBack }) {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [viewing, setViewing]   = useState(null);
  const [editing, setEditing]   = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      let payload = null;
      let ok = false;

      const repoRes = await fetch(REPOSITORY_API);
      if (repoRes.ok) {
        payload = await repoRes.json();
        ok = true;
      } else {
        const legacyRes = await fetch(PAPER_API);
        if (legacyRes.ok) {
          payload = await legacyRes.json();
          ok = true;
        }
      }

      setRecords(ok ? normalizePaperList(payload) : []);
    } catch (_) { setRecords([]); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = records.filter(r => {
    const q = search.trim().toLowerCase();
    const outputType = normalizeOutputType(r.research_output_type_id || "").toLowerCase();
    const yearSemester = `${r.school_year_id || ""} ${r.semester_id || ""}`.toLowerCase();
    const ms = !q ||
      (r.research_title || "").toLowerCase().includes(q) ||
      (r.authors_id || "").toLowerCase().includes(q) ||
      (r.college_id || "").toLowerCase().includes(q) ||
      (r.program_department_id || "").toLowerCase().includes(q) ||
      outputType.includes(q) ||
      yearSemester.includes(q);
    return ms;
  });

  return (
    <div style={{ display:"flex", height:"100%", minHeight:0, overflow:"hidden" }}>

      {/* Sidebar */}
      <Sidebar onNavigate={onNavigate} activePage="db-dashboard" onBack={onBack} />

      {/* Main content */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", overflowY:"auto" }}>
      <div style={{ minHeight:"100%", background:"#f5f5f5" }}>

      {/* Page Header */}
      <div style={{ background:"#0d0d0d", padding:"24px 40px",
        borderBottom:"3px solid #F5C400",
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", color:"#F5C400",
            fontSize:9, fontWeight:700, letterSpacing:"3px",
            textTransform:"uppercase", opacity:.7, marginBottom:4 }}>Research Repository</div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", color:"#fff",
            fontSize:32, fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.5px",
            display:"flex", alignItems:"center", gap:12 }}>
            Research Records
            <span style={{ background:"#F5C400", color:"#0d0d0d", fontSize:11,
              fontWeight:800, padding:"2px 10px", borderRadius:2 }}>
              {records.length}
            </span>
          </h1>
        </div>
        <button onClick={() => onNavigate("db-form")} style={btnPri}>
          + New Record
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e0e0e0",
        padding:"12px 40px", display:"flex", gap:24, flexWrap:"wrap" }}>
        {OUTPUT_TYPES.map(t => {
          const count = records.filter(r => normalizeOutputType(r.research_output_type_id) === t).length;
          const c = TYPE_COLORS[t];
          return (
            <div key={t} style={{ display:"flex", alignItems:"center", gap:7 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:c.color }}/>
              <span style={{ fontSize:12, color:"#5a5a5a" }}>{t}:</span>
              <span style={{ fontSize:13, fontWeight:700, color:"#0d0d0d" }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ padding:"16px 40px", display:"flex", gap:12, alignItems:"center" }}>
        <div style={searchWrap}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight:10, flexShrink:0 }}>
            <circle cx="11" cy="11" r="7" stroke="#9e9e9e" strokeWidth="2" />
            <path d="M20 20L16.65 16.65" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search Repository Records"
            style={searchInput} />
        </div>
        {search && (
          <button onClick={() => { setSearch(""); }}
            style={{ ...btnSec, fontSize:12 }}>Clear</button>
        )}
      </div>

      {/* Table */}
      <div style={{ padding:"0 40px 40px" }}>
        <div style={{ background:"#fff", borderRadius:4, border:"1px solid #e0e0e0", overflow:"hidden" }}>
          {loading ? (
            <div style={{ padding:48, textAlign:"center", color:"#9e9e9e" }}>Loading records…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:64, textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>📄</div>
              <div style={{ fontSize:15, fontWeight:600 }}>No records found</div>
              <div style={{ fontSize:13, color:"#9e9e9e", marginTop:6 }}>
                {records.length === 0
                  ? "Submit your first research record to get started."
                  : "Try adjusting your search or filters."}
              </div>
              {records.length === 0 && (
                <button onClick={() => onNavigate("db-form")}
                  style={{ ...btnPri, marginTop:20 }}>+ Add First Record</button>
              )}
            </div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:"#f9f9f9", borderBottom:"1.5px solid #e0e0e0" }}>
                  {["ID","Title","Authors","College","Type","Year","Actions"].map(h => (
                    <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:9,
                      fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"#9e9e9e" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.paper_id} style={{ borderBottom:"1px solid #f0f0f0" }}>
                    <td style={td}>
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
                        fontWeight:800, color:"#1565c0", fontSize:13,
                        background:"#e3f2fd", padding:"2px 7px", borderRadius:2 }}>
                        P-{r.paper_id}
                      </span>
                    </td>
                    <td style={{ ...td, maxWidth:240 }}>
                      <div style={{ fontWeight:600, color:"#0d0d0d", overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={r.research_title}>
                        {r.research_title}
                      </div>
                      <div style={{ fontSize:11, color:"#9e9e9e", marginTop:2 }}>
                        {r.program_department_id}
                      </div>
                    </td>
                    <td style={{ ...td, maxWidth:160 }}>
                      <div style={{ fontSize:12, color:"#5a5a5a", overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={r.authors_id}>
                        {r.authors_id}
                      </div>
                    </td>
                    <td style={{ ...td, maxWidth:160 }}>
                      <div style={{ fontSize:11, color:"#5a5a5a", overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.college_id}</div>
                    </td>
                    <td style={td}><TypeBadge t={r.research_output_type_id} /></td>
                    <td style={td}>
                      <div style={{ fontSize:12, color:"#5a5a5a" }}>{r.school_year_id}</div>
                      <div style={{ fontSize:11, color:"#9e9e9e" }}>{r.semester_id}</div>
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
        onSaved={u => { setRecords(rs => rs.map(r => r.paper_id === u.paper_id ? u : r)); setEditing(null); }} />}
      {deleting && <DeleteModal r={deleting} onClose={() => setDeleting(null)}
        onDeleted={id => { setRecords(rs => rs.filter(r => r.paper_id !== id)); setDeleting(null); }} />}
      </div>
      </div>
    </div>
  );
}