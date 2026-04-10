import { useCallback, useEffect, useState } from "react";
import { getAuthors } from "../api/authors";
import { getDropdowns } from "../api/lookups";
import AuthorTagInput from "../components/form/AuthorTagInput";
import SidebarNav from "../components/layout/SidebarNav";

import { API_BASE_URL } from "../api/client";

const API = API_BASE_URL;

const INDEXING = ["Scopus","Web of Science","DOAJ","PubMed","ESCI","Emerging Sources","Others"];

const REQUIRED_FIELDS = [
  ["school_year_id","School Year"],
  ["semester_id","Semester"],
  ["research_output_type_id","Research Output Type"],
  ["title","Research Title"],
  ["research_type_id","Research Type"],
  ["authors","Author(s)"],
  ["campus_id","Campus"],
  ["college_id","College"],
  ["department_id","Department"],
];

// ── Shared UI ─────────────────────────────────────────────────────────────────

const iStyle = {
  width:"100%", background:"#fff", border:"1.5px solid #e0e0e0", borderRadius:4,
  padding:"10px 13px", fontFamily:"'Barlow',sans-serif", fontSize:14, color:"#0d0d0d",
  outline:"none", appearance:"none", WebkitAppearance:"none",
  transition:"border-color .15s", boxSizing:"border-box",
};

const Input    = (p) => <input style={iStyle} {...p} />;
const TA       = (p) => <textarea style={{ ...iStyle, resize:"vertical", minHeight:72, lineHeight:1.6 }} {...p} />;
const Textarea = (p) => <textarea style={{ ...iStyle, resize:"vertical", minHeight:88, lineHeight:1.6 }} {...p} />;

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
  <div style={{ marginBottom:18 }}><Lbl t={label} req={req} />{children}</div>
);

const Row = ({ children, cols=2 }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},minmax(0,1fr))`, gap:16 }}>
    {children}
  </div>
);

// ── Card (Section) ────────────────────────────────────────────────────────────

const Card = ({ title, children }) => (
  <div style={{ background:"#fff", border:"1px solid #e8e8e8", borderRadius:6,
    marginBottom:16, overflow:"hidden" }}>
    <div style={{ background:"#111", padding:"9px 20px",
      fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700,
      letterSpacing:"3px", textTransform:"uppercase", color:"#F5C400" }}>
      {title}
    </div>
    <div style={{ padding:"20px 20px 8px" }}>{children}</div>
  </div>
);

// ── Sidebar ───────────────────────────────────────────────────────────────────

const REPOSITORY_SIDEBAR_ITEMS = [
  { page: "db-dashboard", icon: "📋", label: "Research Records" },
  { page: "db-form", icon: "📄", label: "Submit Research" },
];

function Sidebar({ onNavigate, activePage, onBack }) {
  return (
    <SidebarNav
      sectionTitle="Research Repository"
      items={REPOSITORY_SIDEBAR_ITEMS}
      activePage={activePage}
      onNavigate={onNavigate}
    />
  );
}

// ── Author Tag Input ──────────────────────────────────────────────────────────

function AuthorInput({ value, onChange, suggestions }) {
  return <AuthorTagInput value={value} onChange={onChange} suggestions={suggestions} />;
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ResearchRepository({ onNavigate, onBack }) {
  const [form, setF] = useState({
    school_year_id:"", semester_id:"", research_output_type_id:"",
    title:"", research_type_id:"", authors:"",
    campus_id:"", college_id:"", department_id:"",
    // Presentation fields
    presentation_venue:"", conference_name:"",
    presentation_abstract:"", presentation_keywords:"",
    // Publication fields
    doi:"", manuscript_link:"", journal_publisher:"",
    volume:"", issue_number:"", page_number:"",
    publication_date:"", indexing:"",
    cite_score:"", impact_factor:"",
    editorial_board:"", journal_website:"",
    apa_format:"", publication_abstract:"", publication_keywords:"",
  });
  const [status, setStatus]   = useState({ type:"", msg:"" });
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [campuses, setCampuses] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [researchOutputTypes, setResearchOutputTypes] = useState([]);
  const [researchTypes, setResearchTypes] = useState([]);
  const [authorsList, setAuthorsList] = useState([]);
  const [lookupLoading, setLookupLoading] = useState({
    campuses: false,
    colleges: false,
    departments: false,
    references: false,
  });

  const set     = (k, v) => setF(f => ({ ...f, [k]: v }));
  const on      = (k) => (e) => set(k, e.target.value);
  const selectedOutputType = researchOutputTypes.find(
    (item) => String(item.id) === String(form.research_output_type_id),
  );
  const selectedResearchType = researchTypes.find(
    (item) => String(item.id) === String(form.research_type_id),
  );
  const normalizedOutputType = selectedOutputType?.name || "";
  const showPres = ["Local Presentation","International Presentation"].includes(normalizedOutputType);
  const showPub  = ["Local Publication","International Publication"].includes(normalizedOutputType);

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

  const loadReferenceLookups = useCallback(async () => {
    setLookupError("");
    setLookupLoadingKey("references", true);
    try {
      const data = await getDropdowns({
        resources: "school_years,school_semesters,research_output_types,research_types",
      });
      setSchoolYears(data.school_years || []);
      setSemesters(data.school_semesters || []);
      setResearchOutputTypes(data.research_output_types || []);
      setResearchTypes(data.research_types || []);
    } catch (error) {
      setLookupError(error.message || "Unable to load school years, semesters, and research type options.");
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
    for (const [k, lbl] of REQUIRED_FIELDS) {
      if (!form[k]) { setStatus({ type:"error", msg:`"${lbl}" is required.` }); return; }
    }
    setLoading(true); setStatus({ type:"", msg:"" });
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      fd.append("output_type", selectedOutputType?.name || "");
      fd.append("research_type", selectedResearchType?.name || "");
      const res = await fetch(`${API}/research-database`, { method:"POST", body:fd });
      if (!res.ok) throw new Error((await res.json()).detail);
      setStatus({ type:"success", msg:"Research record submitted successfully!" });
      setF({
        school_year_id:"", semester_id:"", research_output_type_id:"",
        title:"", research_type_id:"", authors:"",
        campus_id:"", college_id:"", department_id:"",
        presentation_venue:"", conference_name:"",
        presentation_abstract:"", presentation_keywords:"",
        doi:"", manuscript_link:"", journal_publisher:"",
        volume:"", issue_number:"", page_number:"",
        publication_date:"", indexing:"",
        cite_score:"", impact_factor:"",
        editorial_board:"", journal_website:"",
        apa_format:"", publication_abstract:"", publication_keywords:"",
      });
      setTimeout(() => onNavigate("db-dashboard"), 1200);
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
      <Sidebar onNavigate={onNavigate} activePage="db-form" onBack={onBack} />

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
                Research Repository
              </div>
              <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", color:"#fff",
                fontSize:32, fontWeight:900, textTransform:"uppercase",
                letterSpacing:"-0.5px", margin:0 }}>
                Submit Research Repository Record
              </h1>
            </div>
            <button onClick={() => onNavigate("db-dashboard")} style={{
              background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,.6)",
              border:"1px solid rgba(255,255,255,.15)", padding:"8px 18px",
              fontFamily:"'Barlow',sans-serif", fontSize:12, cursor:"pointer",
              borderRadius:4, whiteSpace:"nowrap",
            }}>← Return</button>
          </div>

          {/* Body */}
          <div style={{ padding:"18px 28px 60px" }} onKeyDown={handleEnterSubmit}>

            {/* Tip banner */}
            <div style={{ background:"#fffbea", border:"1px solid #f5c400", borderRadius:4,
              padding:"9px 14px", marginBottom:16, fontSize:12, color:"#7a6000",
              display:"flex", alignItems:"center", gap:8 }}>
              💡 Fill in all required fields marked with
              <span style={{ color:"#d4a900", margin:"0 2px" }}>*</span>.
              Accepted file formats: PDF, Word, Excel, PowerPoint, or Image.
            </div>

            {/* ── Card 1: Research Information ── */}
            <Card title="Research Information">
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
              <F label="Research Output Type" req>
                <Sel val={form.research_output_type_id} onChange={on("research_output_type_id")}
                  opts={researchOutputTypes}
                  placeholder={lookupLoading.references ? "Loading output types..." : "Select output type"}
                  disabled={lookupLoading.references} />
              </F>
              <F label="Research Title" req>
                <Textarea value={form.title} onChange={on("title")}
                  placeholder="Enter the full research title…" />
              </F>
            </Card>

            {/* ── Card 2: Research Type & Authorship ── */}
            <Card title="Research Type & Authorship">
              <F label="Research Type" req>
                <Sel val={form.research_type_id} onChange={on("research_type_id")}
                  opts={researchTypes}
                  placeholder={lookupLoading.references ? "Loading research types..." : "Select research type"}
                  disabled={lookupLoading.references} />
              </F>
              <F label="Authors" req>
                <AuthorInput
                  value={form.authors}
                  onChange={v => set("authors", v)}
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
            </Card>

            {/* ── Card 3: Presentation Details (only for Presentation / Intl Presentation) ── */}
            {showPres && (
              <Card title="Presentation Details">
                <Row>
                  <F label="Venue">
                    <Input type="text" value={form.presentation_venue} onChange={on("presentation_venue")}
                      placeholder="e.g. SMX Convention Center" />
                  </F>
                  <F label="Conference Name">
                    <Input type="text" value={form.conference_name} onChange={on("conference_name")}
                      placeholder="e.g. IEEE ICCV 2025" />
                  </F>
                </Row>
                <F label="Abstract">
                  <TA value={form.presentation_abstract} onChange={on("presentation_abstract")}
                    placeholder="Enter the presentation abstract…" rows={4} />
                </F>
                <F label="Keywords">
                  <Input type="text" value={form.presentation_keywords} onChange={on("presentation_keywords")}
                    placeholder="e.g. deep learning, image segmentation" />
                </F>
              </Card>
            )}

            {/* ── Card 3b: Publication Details (only for Publication / Intl Publication) ── */}
            {showPub && (
              <Card title="Publication Details">

                {/* Row 1: DOI + Manuscript Link */}
                <Row>
                  <F label="DOI">
                    <Input type="text" value={form.doi} onChange={on("doi")}
                      placeholder="e.g. 10.1016/j.xxx.2025" />
                  </F>
                  <F label="Manuscript Link">
                    <Input type="url" value={form.manuscript_link} onChange={on("manuscript_link")}
                      placeholder="https://..." />
                  </F>
                </Row>

                {/* Row 2: Journal / Publisher */}
                <F label="Journal / Publisher">
                  <Input type="text" value={form.journal_publisher} onChange={on("journal_publisher")}
                    placeholder="e.g. Elsevier, IEEE, Springer" />
                </F>

                {/* Row 3: Volume + Issue No. + Page Number */}
                <Row cols={3}>
                  <F label="Volume">
                    <Input type="text" value={form.volume} onChange={on("volume")}
                      placeholder="e.g. 12" />
                  </F>
                  <F label="Issue No.">
                    <Input type="text" value={form.issue_number} onChange={on("issue_number")}
                      placeholder="e.g. 3" />
                  </F>
                  <F label="Page Number">
                    <Input type="text" value={form.page_number} onChange={on("page_number")}
                      placeholder="e.g. 45-58" />
                  </F>
                </Row>

                {/* Row 4: Publication Date + Indexing */}
                <Row>
                  <F label="Publication Date">
                    <Input type="date" value={form.publication_date} onChange={on("publication_date")} />
                  </F>
                  <F label="Indexing">
                    <Sel val={form.indexing} onChange={on("indexing")}
                      opts={INDEXING} placeholder="Select indexing" />
                  </F>
                </Row>

                {/* Row 5: Cite Score + Impact Factor */}
                <Row>
                  <F label="Cite Score">
                    <Input type="number" step="0.01" value={form.cite_score} onChange={on("cite_score")}
                      placeholder="e.g. 4.20" />
                  </F>
                  <F label="Impact Factor">
                    <Input type="number" step="0.01" value={form.impact_factor} onChange={on("impact_factor")}
                      placeholder="e.g. 3.75" />
                  </F>
                </Row>

                {/* Row 6: Editorial Board */}
                <F label="Editorial Board">
                  <TA value={form.editorial_board} onChange={on("editorial_board")}
                    placeholder="Board members…" />
                </F>

                {/* Row 7: Journal Website */}
                <F label="Journal Website">
                  <Input type="url" value={form.journal_website} onChange={on("journal_website")}
                    placeholder="https://..." />
                </F>

                {/* Row 8: APA Format Citation */}
                <F label="APA Format Citation">
                  <TA value={form.apa_format} onChange={on("apa_format")}
                    placeholder="Author, A. A. (Year). Title. Journal, Vol(Issue), pages. DOI" />
                </F>

                {/* Row 9: Abstract */}
                <F label="Abstract">
                  <TA value={form.publication_abstract} onChange={on("publication_abstract")}
                    placeholder="Enter abstract…" rows={4} />
                </F>

                {/* Row 10: Keywords */}
                <F label="Keywords">
                  <Input type="text" value={form.publication_keywords} onChange={on("publication_keywords")}
                    placeholder="e.g. deep learning, image segmentation" />
                </F>

              </Card>
            )}

            {/* Submit */}
            <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap", marginTop:8, paddingBottom:18 }}>
              <button onClick={handleSubmit} disabled={loading} style={{
                background:"#F5C400", color:"#0d0d0d", border:"none", padding:"13px 44px",
                fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:800,
                letterSpacing:"3px", textTransform:"uppercase", cursor:"pointer",
                borderRadius:4, opacity: loading ? 0.6 : 1,
              }}>
                {loading ? "Submitting…" : "Submit Record"}
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