import { useState, useEffect } from "react";
import SidebarNav from "../components/layout/SidebarNav";
import { API_BASE_URL } from "../api/client";
import { getDropdowns } from "../api/lookups";

const API = API_BASE_URL;
const EVAL_API = `${API}/research-evaluations`;
const PAGE_SIZE = 10;

const CAMPUSES     = ["TIP-QC (Quezon City)", "TIP-Manila"];
const EVALUATION_BREAKDOWN_KEY = "scholarSphereEvaluationBreakdown";

const FILE_FIELDS = [
  { key:"authorship_form",         label:"Authorship Form" },
  { key:"evaluation_form",         label:"Evaluation Form" },
  { key:"full_paper",              label:"Full Paper" },
  { key:"turnitin_report",         label:"Turnitin Report" },
  { key:"grammarly_report",        label:"Grammarly Report" },
  { key:"journal_conference_info", label:"Journal / Conference Info" },
  { key:"call_for_paper",          label:"Call For Paper" },
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
      {opts.map((o) => {
        const value = typeof o === "object" ? String(o.value ?? o.id ?? o.label ?? "") : String(o);
        const label = typeof o === "object" ? String(o.label ?? o.name ?? o.value ?? value) : String(o);
        return (
          <option key={value || label} value={value}>
            {label}
          </option>
        );
      })}
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

const getRecordId = (row, fallback = 0) => row?.re_id ?? row?.evaluation_id ?? row?.id ?? fallback;

const normalizeEvaluationRecord = (row, index = 0) => {
  const id = getRecordId(row, index + 1);
  const links = row?.document_links && typeof row.document_links === "object" ? row.document_links : {};
  const normalizedFileFields = FILE_FIELDS.reduce((accumulator, { key, label }) => {
    const fileUrl = row?.[key] ?? links?.[key] ?? "";
    const fileName = row?.[`${key}_name`] ?? links?.[`${key}_name`] ?? label;
    accumulator[key] = fileUrl;
    accumulator[`${key}_name`] = fileName;
    return accumulator;
  }, {});

  return {
    ...row,
    ...normalizedFileFields,
    re_id: id,
    title_of_research: row?.title_of_research ?? row?.research_title ?? `Research ${id}`,
    author_id: row?.author_id ?? row?.authorship_from_link ?? "",
    campus_id: row?.campus_id ?? "",
    college_id: row?.college_id ?? "",
    department_id: row?.department_id ?? "",
    school_year_id: row?.school_year_id ?? "",
    semester_id: row?.semester_id ?? row?.status ?? "",
  };
};

const normalizeEvaluationList = (payload) => {
  let evaluations = [];
  if (Array.isArray(payload)) evaluations = payload.map(normalizeEvaluationRecord);
  else if (payload && Array.isArray(payload.research_evaluations)) {
    evaluations = payload.research_evaluations.map(normalizeEvaluationRecord);
  }
  // Sort by re_id descending (newest first, oldest last)
  return evaluations.sort((a, b) => (b.re_id || 0) - (a.re_id || 0));
};

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
function ViewModal({ r, onClose, schoolYearLabel, semesterLabel, campusLabel, collegeLabel, departmentLabel }) {
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
          <Row><VF label="School Year" value={schoolYearLabel(r)} /><VF label="Semester" value={semesterLabel(r)} /></Row>
          <SLbl t="Author(s) & Academic Unit" />
          <VF label="Author(s)" value={r.author_id} />
          <VF label="Campus" value={campusLabel(r)} />
          <Row><VF label="College" value={collegeLabel(r)} /><VF label="Department" value={departmentLabel(r)} /></Row>
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
    call_for_paper:null,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [lookupOptions, setLookupOptions] = useState({
    campuses: [],
    colleges: [],
    departmentsByCollege: {},
    schoolYears: [],
    semesters: [],
  });

  const set   = (k, v) => setF(f => ({ ...f, [k]: v }));
  const on    = (k) => (e) => set(k, e.target.value);
  const setNF = (k, v) => setNewFiles(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const loadLookupOptions = async () => {
      try {
        let data = await getDropdowns({
          resources: "campuses,colleges,departments,school_years,school_semesters",
          limit: 100,
          activeOnly: false,
        });

        if (!data || typeof data !== "object") {
          data = await getDropdowns({ resources: "campuses,colleges,departments,school_years,school_semesters" });
        }

        const toOptionList = (items = [], labelKey = "name") => (
          Array.isArray(items)
            ? items.map((item) => ({ value: String(item.id), label: String(item[labelKey] ?? item.id) }))
            : []
        );

        const departmentsByCollege = Array.isArray(data.departments)
          ? data.departments.reduce((accumulator, item) => {
              const collegeId = String(item.college_id ?? "");
              if (!collegeId) return accumulator;
              if (!accumulator[collegeId]) accumulator[collegeId] = [];
              accumulator[collegeId].push({ value: String(item.id), label: String(item.name ?? item.id) });
              return accumulator;
            }, {})
          : {};

        setLookupOptions({
          campuses: toOptionList(data.campuses, "name"),
          colleges: toOptionList(data.colleges, "name"),
          departmentsByCollege,
          schoolYears: toOptionList(data.school_years, "label"),
          semesters: toOptionList(data.school_semesters, "name"),
        });
      } catch {
        setLookupOptions({
          campuses: [],
          colleges: [],
          departmentsByCollege: {},
          schoolYears: [],
          semesters: [],
        });
      }
    };

    loadLookupOptions();
  }, []);

  const depts = lookupOptions.departmentsByCollege[String(form.college_id)] || [];

  const save = async () => {
    setSaving(true); setErr("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      FILE_FIELDS.forEach(({ key }) => {
        if (newFiles[key]) fd.append(key, newFiles[key]);
        else fd.append(key, new Blob([]), "");   // empty = keep existing
      });
      const res = await fetch(`${EVAL_API}/${getRecordId(r)}`, { method:"PUT", body:fd });
      if (!res.ok) throw new Error((await res.json()).detail);
      onSaved(normalizeEvaluationRecord(await res.json()));
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
            <F label="School Year"><Sel val={form.school_year_id} onChange={on("school_year_id")} opts={lookupOptions.schoolYears} placeholder="Select" /></F>
            <F label="Semester"><Sel val={form.semester_id} onChange={on("semester_id")} opts={lookupOptions.semesters} placeholder="Select" /></F>
          </Row>

          <SLbl t="Author(s) & Academic Unit" />
          <F label="Author(s)">
            <Input type="text" value={form.author_id} onChange={on("author_id")}
              placeholder="Comma-separated names" />
          </F>
          <F label="Campus">
            <Sel val={form.campus_id} onChange={on("campus_id")} opts={lookupOptions.campuses} placeholder="Select campus" />
          </F>
          <Row>
            <F label="College">
              <Sel val={form.college_id}
                onChange={e => { set("college_id", e.target.value); set("department_id",""); }}
                opts={lookupOptions.colleges} placeholder="Select college" />
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
          <Row>
            {FILE_FIELDS.slice(6,8).map(({ key, label }) => (
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
    await fetch(`${EVAL_API}/${getRecordId(r)}`, { method:"DELETE" });
    onDeleted(getRecordId(r));
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
      collapsible={false}
    />
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function EvaluationDashboard({ onNavigate, onBack }) {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSearch, setPageSearch] = useState("");
  const [lookupLabelMaps, setLookupLabelMaps] = useState({
    campuses: {},
    colleges: {},
    departments: {},
    schoolYears: {},
    semesters: {},
  });
  const [viewing, setViewing]   = useState(null);
  const [editing, setEditing]   = useState(null);
  const [deleting, setDeleting] = useState(null);

  const labelFor = (map, value) => {
    if (value === null || value === undefined || value === "") return "—";
    const key = String(value);
    return map[key] || key;
  };

  const collegeLabel = (row) => labelFor(lookupLabelMaps.colleges, row.college_id);
  const departmentLabel = (row) => labelFor(lookupLabelMaps.departments, row.department_id);
  const schoolYearLabel = (row) => labelFor(lookupLabelMaps.schoolYears, row.school_year_id);
  const semesterLabel = (row) => labelFor(lookupLabelMaps.semesters, row.semester_id);
  const campusLabel = (row) => labelFor(lookupLabelMaps.campuses, row.campus_id);

  const campusBucket = (row) => {
    const text = campusLabel(row).toLowerCase();
    if (text.includes("qc") || text.includes("quezon")) return "TIP-QC (Quezon City)";
    if (text.includes("manila")) return "TIP-Manila";
    return "Others";
  };

  const loadLookupLabels = async () => {
    try {
      let data = await getDropdowns({
        resources: "campuses,colleges,departments,school_years,school_semesters",
        limit: 100,
        activeOnly: false,
      });

      // Retry once with default params if custom query is rejected.
      if (!data || typeof data !== "object") {
        data = await getDropdowns({ resources: "campuses,colleges,departments,school_years,school_semesters" });
      }

      const toNameMap = (items = [], labelKey = "name") => Object.fromEntries(
        items.map(item => [String(item.id), item[labelKey] ?? String(item.id)])
      );

      setLookupLabelMaps({
        campuses: toNameMap(data.campuses, "name"),
        colleges: toNameMap(data.colleges, "name"),
        departments: toNameMap(data.departments, "name"),
        schoolYears: toNameMap(data.school_years, "label"),
        semesters: toNameMap(data.school_semesters, "name"),
      });
    } catch (_) {
      setLookupLabelMaps({
        campuses: {},
        colleges: {},
        departments: {},
        schoolYears: {},
        semesters: {},
      });
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(EVAL_API);
      if (!res.ok) {
        setRecords([]);
      } else {
        const payload = await res.json();
        setRecords(normalizeEvaluationList(payload));
      }
    }
    catch (_) { setRecords([]); }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    loadLookupLabels();
  }, []);

  useEffect(() => {
    const breakdown = CAMPUSES.map((label) => ({
      label,
      value: records.filter(r => campusBucket(r) === label).length,
    }));
    localStorage.setItem(EVALUATION_BREAKDOWN_KEY, JSON.stringify(breakdown));
    window.dispatchEvent(new Event('scholarSphereDashboardTotalsChanged'));
  }, [records.length]);

  const filtered = (() => {
    const withFilters = records;
    
    const q  = search.trim().toLowerCase();
    if (!q) return withFilters;

    return withFilters.filter(r => {
      const resolvedCollege = collegeLabel(r).toLowerCase();
      const resolvedDepartment = departmentLabel(r).toLowerCase();
      const resolvedCampus = campusLabel(r).toLowerCase();
      const resolvedYearSemester = `${schoolYearLabel(r)} ${semesterLabel(r)}`.toLowerCase();
      
      // Text search
      const textMatch =
        (r.title_of_research || "").toLowerCase().includes(q) ||
        (r.author_id || "").toLowerCase().includes(q) ||
        resolvedCampus.includes(q) ||
        resolvedCollege.includes(q) ||
        resolvedDepartment.includes(q) ||
        resolvedYearSemester.includes(q);

      // ID search - calculate display ID based on position in withFilters
      const recordPosition = withFilters.indexOf(r);
      const displayId = withFilters.length - recordPosition;
      const idMatch = String(displayId).includes(q) || `re-${displayId}`.toLowerCase().includes(q);

      return textMatch || idMatch;
    });
  })();

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const jumpToPage = () => {
    const target = Number.parseInt(pageSearch, 10);
    if (!Number.isFinite(target)) return;
    const bounded = Math.min(Math.max(target, 1), totalPages);
    setCurrentPage(bounded);
    setPageSearch("");
  };

  return (
    <div style={{ display:"flex", height:"100%", minHeight:0, overflow:"hidden" }}>

      {/* Sidebar */}
      <Sidebar onNavigate={onNavigate} activePage="eval-dashboard" onBack={onBack} />

      {/* Main content */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", overflowY:"auto" }}>
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
          const count = records.filter(r => campusBucket(r) === c).length;
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
        <div style={searchWrap}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight:10, flexShrink:0 }}>
            <circle cx="11" cy="11" r="7" stroke="#9e9e9e" strokeWidth="2" />
            <path d="M20 20L16.65 16.65" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search Evaluation Records"
            style={searchInput} />
        </div>
        {search && (
          <button onClick={() => { setSearch(""); }}
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
                {paginated.map((r, index) => {
                  const recordPosition = filtered.indexOf(r);
                  const displayId = filtered.length - recordPosition;
                  return (
                  <tr key={getRecordId(r, pageStart + index)} style={{ borderBottom:"1px solid #f0f0f0" }}>
                    <td style={td}>
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
                        fontWeight:800, color:"#1565c0", fontSize:13,
                        background:"#e3f2fd", padding:"2px 7px", borderRadius:2 }}>
                        RE-{displayId}
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
                      {(() => {
                        const currentCampus = campusLabel(r);
                        const isQc = currentCampus.toLowerCase().includes("qc") || currentCampus.toLowerCase().includes("quezon");
                        const isManila = currentCampus.toLowerCase().includes("manila");
                        const badgeLabel = isQc ? "TIP-QC" : isManila ? "TIP-Manila" : currentCampus;
                        const badgeStyle = isQc
                          ? { background:"#fff8e1", color:"#f9a825" }
                          : isManila
                            ? { background:"#e3f2fd", color:"#1565c0" }
                            : { background:"#f5f5f5", color:"#616161" };
                        return (
                      <span style={{
                        background: badgeStyle.background,
                        color: badgeStyle.color,
                        fontSize:10, fontWeight:700, padding:"3px 7px",
                        borderRadius:10, whiteSpace:"nowrap",
                      }}>
                        {badgeLabel}
                      </span>
                        );
                      })()}
                    </td>
                    <td style={{ ...td, maxWidth:140 }}>
                      <div style={{ fontSize:11, color:"#5a5a5a", overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={collegeLabel(r)}>{collegeLabel(r)}</div>
                    </td>
                    <td style={{ ...td, maxWidth:120 }}>
                      <div style={{ fontSize:11, color:"#5a5a5a", overflow:"hidden",
                        textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={departmentLabel(r)}>{departmentLabel(r)}</div>
                    </td>
                    <td style={td}>
                      <div style={{ fontSize:12, color:"#5a5a5a" }}>{schoolYearLabel(r)}</div>
                      <div style={{ fontSize:11, color:"#9e9e9e" }}>{semesterLabel(r)}</div>
                    </td>
                    <td style={td}>
                      {(() => {
                        const uploadedDocs = FILE_FIELDS.filter(({ key }) => Boolean(r[key]));
                        if (uploadedDocs.length === 0) {
                          return <span style={{ color:"#ccc", fontSize:12 }}>—</span>;
                        }

                        return (
                          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                            {uploadedDocs.map(({ key, label }) => (
                              <FileLink key={key} url={r[key]} name={r[`${key}_name`] || label} />
                            ))}
                          </div>
                        );
                      })()}
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
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {filtered.length > 0 && (
          <div style={{ marginTop:10, fontSize:12, color:"#9e9e9e", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
            <span>
              Showing {paginated.length} of {filtered.length} matching record{filtered.length !== 1 ? "s" : ""}
            </span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage <= 1}
                style={{ ...btnSec, fontSize:11, padding:"5px 10px", opacity: currentPage <= 1 ? 0.6 : 1 }}
              >
                {"<"}
              </button>
              <span style={{ fontSize:12, color:"#5a5a5a", minWidth:72, textAlign:"center" }}>
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage >= totalPages}
                style={{ ...btnSec, fontSize:11, padding:"5px 10px", opacity: currentPage >= totalPages ? 0.6 : 1 }}
              >
                {">"}
              </button>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={pageSearch}
                onChange={(event) => setPageSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    jumpToPage();
                  }
                }}
                placeholder="Page"
                style={{
                  width:68,
                  height:28,
                  border:"1.5px solid #e0e0e0",
                  borderRadius:3,
                  padding:"0 8px",
                  fontSize:11,
                  color:"#4b5563",
                  background:"#fff",
                }}
              />
              <button
                onClick={jumpToPage}
                disabled={!pageSearch.trim()}
                style={{ ...btnSec, fontSize:11, padding:"5px 10px", opacity: pageSearch.trim() ? 1 : 0.6 }}
              >
                Go
              </button>
            </div>
          </div>
        )}
      </div>

      {viewing  && <ViewModal
        r={viewing}
        onClose={() => setViewing(null)}
        schoolYearLabel={schoolYearLabel}
        semesterLabel={semesterLabel}
        campusLabel={campusLabel}
        collegeLabel={collegeLabel}
        departmentLabel={departmentLabel}
      />}
      {editing  && <EditModal   r={editing}  onClose={() => setEditing(null)}
        onSaved={u => { setRecords(rs => rs.map(r => getRecordId(r) === getRecordId(u) ? u : r)); setEditing(null); }} />}
      {deleting && <DeleteModal r={deleting} onClose={() => setDeleting(null)}
        onDeleted={id => { setRecords(rs => rs.filter(r => getRecordId(r) !== id)); setDeleting(null); }} />}
      </div>
      </div>
    </div>
  );
}