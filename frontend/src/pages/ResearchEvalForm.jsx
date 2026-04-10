import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../api/client";
import { getAuthors } from "../api/authors";
import { getDropdowns } from "../api/lookups";
import AuthorTagInput from "../components/form/AuthorTagInput";
import SidebarNav from "../components/layout/SidebarNav";

const API = API_BASE_URL;

const REFERENCES = {
  authorship_form: { url: "https://docs.google.com/document/d/1uWv9hi7OQvMKSnCm1xSE49EErp-XilQ9LY3TcObuIb8/edit?tab=t.0" },
  evaluation_form: { url: "https://drive.google.com/file/d/1aR5LN-rDMRFgVKqfucWjOEmZw1jCesVN/view" },
};

const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png";

const REQUIRED_TEXT = [
  ["author_id","Author(s)"],["campus_id","Campus"],["college_id","College"],
  ["department_id","Department"],["school_year_id","School Year"],
  ["semester_id","Semester"],["title_of_research","Title of Research"],
];

const FILE_FIELDS = [
  "authorship_form","evaluation_form","full_paper",
  "turnitin_report","grammarly_report","journal_conference_info",
  "call_for_paper",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function isWeekend(dateStr) {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 || day === 6;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

const iStyle = {
  width:"100%", background:"#fff", border:"1.5px solid #e0e0e0", borderRadius:4,
  padding:"10px 13px", fontFamily:"'Barlow',sans-serif", fontSize:14, color:"#0d0d0d",
  outline:"none", appearance:"none", transition:"border-color .15s", boxSizing:"border-box",
};

const Input = (p) => <input style={iStyle} {...p} />;

const Lbl = ({ t, req }) => (
  <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:"2px",
    textTransform:"uppercase", color:"#5a5a5a", marginBottom:6 }}>
    {t}{req && <span style={{ color:"#d4a900" }}> *</span>}
  </label>
);

const Sel = ({ val, onChange, opts, placeholder, disabled }) => (
  <div style={{ position:"relative" }}>
    <select value={val} onChange={onChange} disabled={disabled} style={{
      ...iStyle, paddingRight:32,
      background: disabled ? "#f5f5f5" : "#fff",
      color: disabled ? "#9e9e9e" : "#0d0d0d",
      cursor: disabled ? "not-allowed" : "pointer",
    }}>
      <option value="">{placeholder}</option>
      {opts.map(o => {
        const value = typeof o === "object" ? String(o.id) : String(o);
        const label = typeof o === "object" ? (o.name ?? o.label ?? String(o.id)) : o;
        return <option key={value} value={value}>{label}</option>;
      })}
    </select>
    <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
      pointerEvents:"none", color:"#9e9e9e" }}>▾</span>
  </div>
);

const F = ({ label, req, children }) => (
  <div style={{ marginBottom:16 }}><Lbl t={label} req={req} />{children}</div>
);

const Row = ({ children, cols=2 }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:16 }}>
    {children}
  </div>
);

// ── Section wrapper ───────────────────────────────────────────────────────────

const Section = ({ title, children }) => (
  <div style={{ background:"#fff", borderRadius:6, border:"1px solid #e8e8e8",
    marginBottom:16, overflow:"hidden" }}>
    <div style={{ background:"#0d0d0d", padding:"10px 20px",
      fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700,
      letterSpacing:"3px", textTransform:"uppercase", color:"#F5C400" }}>
      {title}
    </div>
    <div style={{ padding:"20px 20px 4px" }}>{children}</div>
  </div>
);

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

// ── Author Tag Input ──────────────────────────────────────────────────────────

function AuthorInput({ value, onChange, suggestions }) {
  return <AuthorTagInput value={value} onChange={onChange} suggestions={suggestions} />;
}

// ── File Upload Field ─────────────────────────────────────────────────────────

function FileUploadField({ label, fieldKey, file, onFileChange, referenceUrl }) {
  const hasFile = Boolean(file);
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <Lbl t={label} />
        {referenceUrl && (
          <a href={referenceUrl} target="_blank" rel="noreferrer" style={{
            fontSize:10, color:"#1565c0", textDecoration:"none", fontWeight:600,
            display:"flex", alignItems:"center", gap:4,
            border:"1px solid #bbdefb", borderRadius:3, padding:"2px 8px",
            background:"#e3f2fd", whiteSpace:"nowrap",
          }}>📄 View Template</a>
        )}
      </div>
      <label style={{
        display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
        border:`2px dashed ${hasFile ? "#F5C400" : "#e0e0e0"}`,
        borderRadius:4, background: hasFile ? "#fffbea" : "#fafafa",
        cursor:"pointer", transition:"all .15s",
      }}>
        <input type="file" accept={ACCEPTED} style={{ display:"none" }}
          onChange={e => onFileChange(fieldKey, e.target.files[0] || null)} />
        <span style={{ fontSize:20, opacity: hasFile ? 1 : 0.3 }}>
          {hasFile ? "✅" : "📁"}
        </span>
        <div style={{ flex:1, minWidth:0 }}>
          {hasFile ? (
            <>
              <div style={{ fontSize:13, fontWeight:600, color:"#0d0d0d",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {file.name}
              </div>
              <div style={{ fontSize:11, color:"#9e9e9e", marginTop:2 }}>
                {(file.size/1024).toFixed(1)} KB · Click to replace
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize:13, color:"#5a5a5a", fontWeight:500 }}>
                Click to upload file
              </div>
              <div style={{ fontSize:11, color:"#9e9e9e", marginTop:1 }}>
                PDF, Word, Excel, PowerPoint, or Image
              </div>
            </>
          )}
        </div>
        {hasFile && (
          <span style={{ fontSize:11, color:"#F5C400", fontWeight:700, whiteSpace:"nowrap" }}>
            Uploaded ✓
          </span>
        )}
      </label>
      {hasFile && (
        <button onClick={() => onFileChange(fieldKey, null)} style={{
          marginTop:4, background:"none", border:"none", color:"#e53935",
          fontSize:11, cursor:"pointer", padding:0,
        }}>✕ Remove file</button>
      )}
    </div>
  );
}

// ── Schedule Preview Badge ────────────────────────────────────────────────────

function ScheduleBadge({ date, time }) {
  if (!date && !time) return null;
  const formattedDate = date
    ? new Date(...date.split("-").map((v,i) => i===1 ? v-1 : +v))
        .toLocaleDateString("en-PH", { weekday:"long", year:"numeric", month:"long", day:"numeric" })
    : null;
  const formattedTime = time
    ? new Date(`1970-01-01T${time}`).toLocaleTimeString("en-PH", { hour:"numeric", minute:"2-digit", hour12:true })
    : null;
  return (
    <div style={{ marginTop:16, background:"#fffbea", border:"1.5px solid #F5C400",
      borderRadius:6, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
      <span style={{ fontSize:22 }}>🗓️</span>
      <div>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"2px",
          textTransform:"uppercase", color:"#9e7a00", marginBottom:2 }}>
          Scheduled Appointment
        </div>
        <div style={{ fontSize:14, fontWeight:700, color:"#0d0d0d" }}>
          {formattedDate || "—"}{formattedTime ? ` · ${formattedTime}` : ""}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ResearchEvaluation({ onNavigate, onBack }) {
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);

  const [form, setF] = useState({
    author_id:"", campus_id:"", college_id:"", department_id:"",
    school_year_id:"", semester_id:"", title_of_research:"",
    appointment_date:"", appointment_time:"",
  });
  const [files, setFiles] = useState({
    authorship_form:null, evaluation_form:null, full_paper:null,
    turnitin_report:null, grammarly_report:null, journal_conference_info:null,
    call_for_paper:null,
  });
  const [status, setStatus]   = useState({ type:"", msg:"" });
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [campuses, setCampuses] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [authorsList, setAuthorsList] = useState([]);
  const [lookupLoading, setLookupLoading] = useState({
    campuses: false,
    colleges: false,
    departments: false,
    references: false,
  });

  const set     = (k, v) => setF(f => ({ ...f, [k]: v }));
  const on      = (k) => (e) => set(k, e.target.value);
  const setFile = (k, v) => setFiles(f => ({ ...f, [k]: v }));
  const weekendError = isWeekend(form.appointment_date);

  const setLookupLoadingKey = (key, value) => {
    setLookupLoading(prev => ({ ...prev, [key]: value }));
  };

  const loadCampuses = useCallback(async () => {
    setLookupError("");
    setLookupLoadingKey("campuses", true);
    try {
      const data = await getDropdowns({ resources: "campuses" });
      setCampuses(data.campuses || []);
    } catch (error) {
      setLookupError(error.message || "Unable to load campuses.");
    } finally {
      setLookupLoadingKey("campuses", false);
    }
  }, []);

  const loadColleges = useCallback(async (campusId) => {
    if (!campusId) return;
    setLookupError("");
    setLookupLoadingKey("colleges", true);
    try {
      const data = await getDropdowns({ resources: "colleges", campusId });
      setColleges(data.colleges || []);
    } catch (error) {
      setLookupError(error.message || "Unable to load colleges.");
    } finally {
      setLookupLoadingKey("colleges", false);
    }
  }, []);

  const loadDepartments = useCallback(async (collegeId) => {
    if (!collegeId) return;
    setLookupError("");
    setLookupLoadingKey("departments", true);
    try {
      const data = await getDropdowns({ resources: "departments", collegeId });
      setDepartments(data.departments || []);
    } catch (error) {
      setLookupError(error.message || "Unable to load departments.");
    } finally {
      setLookupLoadingKey("departments", false);
    }
  }, []);

  const loadReferenceLookups = useCallback(async () => {
    setLookupError("");
    setLookupLoadingKey("references", true);
    try {
      const data = await getDropdowns({ resources: "school_years,school_semesters" });
      setSchoolYears(data.school_years || []);
      setSemesters(data.school_semesters || []);
    } catch (error) {
      setLookupError(error.message || "Unable to load school years and semesters.");
    } finally {
      setLookupLoadingKey("references", false);
    }
  }, []);

  const loadAuthors = useCallback(async () => {
    try {
      const rows = await getAuthors({ limit: 100 });
      setAuthorsList(Array.isArray(rows) ? rows : []);
    } catch (_) {
      setAuthorsList([]);
    }
  }, []);

  useEffect(() => {
    loadCampuses();
    loadReferenceLookups();
    loadAuthors();
  }, [loadCampuses, loadReferenceLookups, loadAuthors]);

  const handleCampusChange = (value) => {
    set("campus_id", value);
    set("college_id", "");
    set("department_id", "");
    setColleges([]);
    setDepartments([]);
    if (value) loadColleges(value);
  };

  const handleCollegeChange = (value) => {
    set("college_id", value);
    set("department_id", "");
    setDepartments([]);
    if (value) loadDepartments(value);
  };

  const handleSubmit = async () => {
    for (const [k, lbl] of REQUIRED_TEXT) {
      if (!form[k]) { setStatus({ type:"error", msg:`"${lbl}" is required.` }); return; }
    }
    if (!form.appointment_date) {
      setStatus({ type:"error", msg:'"Appointment Date" is required.' }); return;
    }
    if (isWeekend(form.appointment_date)) {
      setStatus({ type:"error", msg:"Appointments cannot be scheduled on weekends. Please choose a weekday." }); return;
    }
    if (!form.appointment_time) {
      setStatus({ type:"error", msg:'"Appointment Time" is required.' }); return;
    }
    setLoading(true); setStatus({ type:"", msg:"" });
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      FILE_FIELDS.forEach((k) => {
        if (files[k]) fd.append(k, files[k]);
      });
      const res = await fetch(`${API}/research-evaluations`, { method:"POST", body:fd });
      if (!res.ok) throw new Error((await res.json()).detail);
      setStatus({ type:"success", msg:"Evaluation submitted successfully!" });
      setF({ author_id:"", campus_id:"", college_id:"", department_id:"",
        school_year_id:"", semester_id:"", title_of_research:"",
        appointment_date:"", appointment_time:"" });
      setFiles({ authorship_form:null, evaluation_form:null, full_paper:null,
        turnitin_report:null, grammarly_report:null, journal_conference_info:null,
        call_for_paper:null });
      setTimeout(() => onNavigate("eval-dashboard"), 1200);
    } catch (e) {
      setStatus({ type:"error", msg: e.message || "Submission failed." });
    } finally { setLoading(false); }
  };

  const handleEnterSubmit = (event) => {
    if (event.key !== 'Enter' || event.shiftKey || event.defaultPrevented) return;
    if (event.target.tagName === 'TEXTAREA') return;
    event.preventDefault();
    if (!loading) {
      handleSubmit();
    }
  };

  return (
    // ── Shell: sidebar + main ──
    <div style={{ display:"flex", height:"100%", minHeight:0, overflow:"hidden" }}>

      {/* ── Sidebar ── */}
      <Sidebar onNavigate={onNavigate} activePage="eval-form" onBack={onBack} />

      {/* ── Main content ── */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", overflowY:"auto" }}>
        <div style={{ background:"#f5f5f5", minHeight:"100%" }}>

          {/* Page Header */}
          <div style={{
            background:"#0d0d0d", padding:"24px 40px",
            borderBottom:"3px solid #F5C400",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", color:"#F5C400",
                fontSize:9, fontWeight:700, letterSpacing:"3px",
                textTransform:"uppercase", opacity:.7, marginBottom:4 }}>
                Research Evaluation
              </div>
              <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", color:"#fff",
                fontSize:32, fontWeight:900, textTransform:"uppercase",
                letterSpacing:"-0.5px", margin:0 }}>
                Application For Research Evaluation
              </h1>
            </div>
            <button onClick={() => onNavigate("eval-dashboard")} style={{
              background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,.6)",
              border:"1px solid rgba(255,255,255,.15)", padding:"8px 18px",
              fontFamily:"'Barlow',sans-serif", fontSize:12, cursor:"pointer",
              borderRadius:4, whiteSpace:"nowrap",
            }}>View Records →</button>
          </div>

          {/* Body */}
          <div style={{ padding:"20px 28px 40px" }} onKeyDown={handleEnterSubmit}>

            {/* Tip banner */}
            <div style={{ background:"#fffbea", border:"1px solid #f5c400", borderRadius:4,
              padding:"9px 14px", marginBottom:16, fontSize:12, color:"#7a6000",
              display:"flex", alignItems:"center", gap:8 }}>
              💡 For Authorship Form and Evaluation Form, click <strong>"View Template"</strong> to
              download, fill out, then upload the completed file.
            </div>

            {/* Section 1: Research Information */}
            <Section title="Research Information">
              <F label="Title of Research" req>
                <Input type="text" value={form.title_of_research} onChange={on("title_of_research")}
                  placeholder="Enter the complete title of research…" />
              </F>
              <Row>
                <F label="School Year" req>
                  <Sel val={form.school_year_id} onChange={on("school_year_id")}
                    opts={schoolYears}
                    placeholder={lookupLoading.references ? "Loading school years..." : "Select school year"}
                    disabled={lookupLoading.references} />
                </F>
                <F label="Semester" req>
                  <Sel val={form.semester_id} onChange={on("semester_id")}
                    opts={semesters}
                    placeholder={lookupLoading.references ? "Loading semesters..." : "Select semester"}
                    disabled={lookupLoading.references} />
                </F>
              </Row>
            </Section>

            {/* Section 2: Author & Unit */}
            <Section title="Author(s) & Academic Unit">
              <F label="Author(s)" req>
                <AuthorInput
                  value={form.author_id}
                  onChange={v => set("author_id", v)}
                  suggestions={authorsList.map((item) => item.author_name)}
                />
              </F>
              <Row cols={3}>
                <F label="Campus" req>
                  <Sel val={form.campus_id}
                    onChange={e => handleCampusChange(e.target.value)}
                    opts={campuses}
                    placeholder={lookupLoading.campuses ? "Loading campuses..." : "Select campus"}
                    disabled={lookupLoading.campuses} />
                </F>
                <F label="College" req>
                  <Sel val={form.college_id}
                    onChange={e => handleCollegeChange(e.target.value)}
                    opts={colleges}
                    placeholder={lookupLoading.colleges ? "Loading colleges..." : "Select college"}
                    disabled={!form.campus_id || lookupLoading.colleges} />
                </F>
                <F label="Department / Program" req>
                  <Sel val={form.department_id} onChange={on("department_id")}
                    opts={departments}
                    disabled={!form.college_id || lookupLoading.departments}
                    placeholder={
                      !form.college_id
                        ? "Select college first"
                        : lookupLoading.departments
                          ? "Loading departments..."
                          : "Select department"
                    } />
                </F>
              </Row>
              {lookupError && (
                <div style={{ marginTop:-4, marginBottom:14, fontSize:12, color:"#b45309" }}>
                  {lookupError}
                </div>
              )}
            </Section>

            {/* Section 3: Evaluation Schedule */}
            <Section title="Evaluation Schedule">
              <div style={{ marginBottom:10, fontSize:12, color:"#7a6000",
                background:"#fffbea", border:"1px solid #f5e57a", borderRadius:4,
                padding:"8px 12px", display:"flex", alignItems:"center", gap:7 }}>
                📅 <span>Select your preferred date and time for the evaluation appointment.
                  <strong> Weekends are not available.</strong></span>
              </div>
              <Row>
                <F label="Appointment Date" req>
                  <div style={{ position:"relative" }}>
                    <input ref={dateInputRef} type="date"
                      value={form.appointment_date} min={todayStr()}
                      onChange={e => set("appointment_date", e.target.value)}
                      style={{ ...iStyle, borderColor: weekendError ? "#e53935" : "#e0e0e0", paddingRight:36 }} />
                    <span onClick={() => dateInputRef.current?.showPicker()}
                      style={{ position:"absolute", right:12, top:"50%",
                      transform:"translateY(-50%)", cursor:"pointer", fontSize:16 }}>📅</span>
                  </div>
                  {weekendError && (
                    <div style={{ fontSize:11, color:"#e53935", marginTop:5,
                      display:"flex", alignItems:"center", gap:4 }}>
                      ⚠️ Weekends are not available. Please choose a weekday (Mon–Fri).
                    </div>
                  )}
                </F>
                <F label="Appointment Time" req>
                  <div style={{ position:"relative" }}>
                    <input ref={timeInputRef} type="time"
                      value={form.appointment_time}
                      onChange={e => set("appointment_time", e.target.value)}
                      style={{ ...iStyle, paddingRight:36 }} />
                    <span onClick={() => timeInputRef.current?.showPicker()}
                      style={{ position:"absolute", right:12, top:"50%",
                      transform:"translateY(-50%)", cursor:"pointer", fontSize:16 }}>🕒</span>
                  </div>
                  <div style={{ fontSize:11, color:"#9e9e9e", marginTop:5 }}>
                    Use your preferred time for the evaluation appointment.
                  </div>
                </F>
              </Row>
              <ScheduleBadge date={!weekendError ? form.appointment_date : ""} time={form.appointment_time} />
            </Section>

            {/* Section 4: Document Uploads */}
            <Section title="Document Uploads">
              <Row>
                <FileUploadField label="Authorship Form" fieldKey="authorship_form"
                  file={files.authorship_form} onFileChange={setFile}
                  referenceUrl={REFERENCES.authorship_form.url} />
                <FileUploadField label="Evaluation Form" fieldKey="evaluation_form"
                  file={files.evaluation_form} onFileChange={setFile}
                  referenceUrl={REFERENCES.evaluation_form.url} />
              </Row>
              <Row>
                <FileUploadField label="Full Paper" fieldKey="full_paper"
                  file={files.full_paper} onFileChange={setFile} />
                <FileUploadField label="Turnitin Report" fieldKey="turnitin_report"
                  file={files.turnitin_report} onFileChange={setFile} />
              </Row>
              <Row>
                <FileUploadField label="Grammarly Report" fieldKey="grammarly_report"
                  file={files.grammarly_report} onFileChange={setFile} />
                <FileUploadField label="Journal / Conference Info" fieldKey="journal_conference_info"
                  file={files.journal_conference_info} onFileChange={setFile} />
              </Row>
              <Row>
                <FileUploadField label="Call For Paper" fieldKey="call_for_paper"
                  file={files.call_for_paper} onFileChange={setFile} />
              </Row>
            </Section>

            {/* Submit */}
            <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap", marginTop:8, paddingBottom:18 }}>
              <button onClick={handleSubmit} disabled={loading} style={{
                background:"#F5C400", color:"#0d0d0d", border:"none", padding:"13px 44px",
                fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:800,
                letterSpacing:"3px", textTransform:"uppercase", cursor:"pointer", borderRadius:4,
                opacity: loading ? 0.6 : 1,
              }}>
                {loading ? "Submitting…" : "Submit Application"}
              </button>
              {status.msg && (
                <div style={{
                  fontSize:13, fontWeight:500, padding:"10px 16px", borderRadius:4,
                  background: status.type==="success" ? "#e8f5e9" : "#ffebee",
                  color: status.type==="success" ? "#2e7d32" : "#e53935",
                  borderLeft:`3px solid ${status.type==="success" ? "#2e7d32" : "#e53935"}`,
                }}>{status.msg}</div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}