import { useState } from "react";

const API = "http://localhost:8000";

const CAMPUSES     = ["TIP-QC (Quezon City)", "TIP-Manila"];
const SCHOOL_YEARS = ["2021-2022","2022-2023","2023-2024","2024-2025","2025-2026"];
const SEMESTERS    = ["1st Semester","2nd Semester","Summer"];
const COLLEGES     = [
  "College of Engineering and Architecture",
  "College of Computer Studies",
  "College of Business Education",
  "College of Arts",
  "Graduate",
  "College of Education",
];
const DEPTS = {
  "College of Engineering and Architecture": [
    "Architecture (BS Arch)","Chemical Engineering (BSChE)","Civil Engineering (BSCE)",
    "Computer Engineering (BSCpE)","Electrical Engineering (BSEE)",
    "Electronics Engineering (BSECE)","Environmental and Sanitary Engineering (BSEnSE)",
    "Industrial Engineering (BSIE)","Mechanical Engineering (BSME)",
  ],
  "College of Computer Studies": [
    "Computer Science (BSCS)","Information Systems (BSIS)",
    "Information Technology (BSIT)","Data Science and Analytics (BSDSA)",
  ],
  "College of Business Education": ["Business Administration (BSBA)","Accountancy (BSA)"],
  "College of Arts": ["Arts in Communication (BA Comm)"],
  "Graduate": [
    "Information Technology (MIT)","Science in Computer Science (MSCS)",
    "Information Systems (MSIS)","Engineering - Civil Engineering (MCE)",
    "Engineering - Electronics Engineering (MECE)",
    "Engineering Management","Logistics Management","Supply Chain Management",
  ],
  "College of Education": ["Secondary Education (BSEd)","Teaching Certificate Program (TCP)"],
};

const OUTPUT_TYPES = [
  "Local Presentation","Local Publication","International Presentation","International Publication",
];

const OUTPUT_TYPE_ALIASES = {
  "Presentation": "Local Presentation",
  "Publication": "Local Publication",
  "Intl Presentation": "International Presentation",
  "Intl Publication": "International Publication",
};

const normalizeOutputType = (value) => OUTPUT_TYPE_ALIASES[value] || value;

const INDEXING = ["Scopus","Web of Science","DOAJ","PubMed","ESCI","Emerging Sources","Others"];

const RESEARCH_TYPES = [
  "Basic Research","Applied Research","Action Research","Policy Research","Other",
];

const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png";

const REQUIRED_FIELDS = [
  ["school_year_id","School Year"],
  ["semester_id","Semester"],
  ["output_type","Research Output Type"],
  ["title","Research Title"],
  ["research_type","Research Type"],
  ["authors","Author(s)"],
  ["campus_id","Campus"],
  ["college_id","College"],
  ["department_id","Department"],
];

const FILE_FIELDS_ALL = ["research_file"];

const FILE_FIELDS = ["research_file"];

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
      {opts.map(o => <option key={o}>{o}</option>)}
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
      letterSpacing:"3px", textTransform:"uppercase", color:"#60a5fa" }}>
      {title}
    </div>
    <div style={{ padding:"20px 20px 8px" }}>{children}</div>
  </div>
);

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

// ── Author Tag Input ──────────────────────────────────────────────────────────

function AuthorInput({ value, onChange }) {
  const [input, setInput] = useState("");
  const authors = value ? value.split(",").map(a => a.trim()).filter(Boolean) : [];

  const add = () => {
    const t = input.trim();
    if (!t) return;
    onChange([...authors, t].join(", "));
    setInput("");
  };
  const remove = (idx) => onChange(authors.filter((_, i) => i !== idx).join(", "));

  return (
    <div>
      {authors.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
          {authors.map((a, i) => (
            <span key={i} style={{ background:"#fff8e1", color:"#d4a900", fontSize:12,
              fontWeight:600, padding:"4px 10px", borderRadius:12,
              display:"flex", alignItems:"center", gap:6, border:"1px solid #f5c40044" }}>
              {a}
              <button onClick={() => remove(i)} style={{ background:"none", border:"none",
                cursor:"pointer", color:"#d4a900", fontSize:14, lineHeight:1, padding:0 }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display:"flex", gap:8 }}>
        <Input type="text" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter"||e.key===","){e.preventDefault();add();} }}
          placeholder="e.g. Juan Dela Cruz, Maria Santos…" />
        <button onClick={add} style={{ background:"#F5C400", color:"#0d0d0d", border:"none",
          padding:"0 18px", fontFamily:"'Barlow Condensed',sans-serif", fontSize:12,
          fontWeight:800, letterSpacing:"1px", textTransform:"uppercase",
          cursor:"pointer", borderRadius:4, whiteSpace:"nowrap" }}>Add</button>
      </div>
      <div style={{ fontSize:11, color:"#9e9e9e", marginTop:5 }}>
        Press Enter or click Add for each author.
      </div>
    </div>
  );
}

// ── File Upload Field ─────────────────────────────────────────────────────────

function FileUploadField({ label, fieldKey, file, onFileChange, req }) {
  const hasFile = Boolean(file);
  return (
    <div style={{ marginBottom:18 }}>
      <Lbl t={label} req={req} />
      <label style={{
        display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
        border:`2px dashed ${hasFile ? "#60a5fa" : "#e0e0e0"}`,
        borderRadius:4, background: hasFile ? "#eff6ff" : "#fafafa",
        cursor:"pointer", transition:"all .15s",
      }}>
        <input type="file" accept={ACCEPTED} style={{ display:"none" }}
          onChange={e => onFileChange(fieldKey, e.target.files[0] || null)} />
        <span style={{ fontSize:20, opacity: hasFile ? 1 : 0.3, flexShrink:0 }}>
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
          <span style={{ fontSize:11, color:"#60a5fa", fontWeight:700, whiteSpace:"nowrap" }}>
            Uploaded ✓
          </span>
        )}
      </label>
      {hasFile && (
        <button onClick={() => onFileChange(fieldKey, null)} style={{
          marginTop:4, background:"none", border:"none", color:"#e53935",
          fontSize:11, cursor:"pointer", padding:0, fontFamily:"'Barlow',sans-serif",
        }}>✕ Remove file</button>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ResearchRepository({ onNavigate }) {
  const [form, setF] = useState({
    school_year_id:"", semester_id:"", output_type:"",
    title:"", research_type:"", authors:"",
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
    funding_source:"", remarks:"",
  });
  const [files, setFiles]     = useState({ research_file: null });
  const [status, setStatus]   = useState({ type:"", msg:"" });
  const [loading, setLoading] = useState(false);

  const set     = (k, v) => setF(f => ({ ...f, [k]: v }));
  const on      = (k) => (e) => set(k, e.target.value);
  const setFile = (k, v) => setFiles(f => ({ ...f, [k]: v }));
  const depts    = DEPTS[form.college_id] || [];
  const normalizedOutputType = normalizeOutputType(form.output_type);
  const showPres = ["Local Presentation","International Presentation"].includes(normalizedOutputType);
  const showPub  = ["Local Publication","International Publication"].includes(normalizedOutputType);

  const handleSubmit = async () => {
    for (const [k, lbl] of REQUIRED_FIELDS) {
      if (!form[k]) { setStatus({ type:"error", msg:`"${lbl}" is required.` }); return; }
    }
    for (const k of FILE_FIELDS) {
      if (!files[k]) {
        setStatus({ type:"error", msg:`Please upload the research file.` }); return;
      }
    }
    setLoading(true); setStatus({ type:"", msg:"" });
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      FILE_FIELDS.forEach(k => { if (files[k]) fd.append(k, files[k]); });
      const res = await fetch(`${API}/research-database`, { method:"POST", body:fd });
      if (!res.ok) throw new Error((await res.json()).detail);
      setStatus({ type:"success", msg:"Research record submitted successfully!" });
      setF({
        school_year_id:"", semester_id:"", output_type:"",
        title:"", research_type:"", authors:"",
        campus_id:"", college_id:"", department_id:"",
        presentation_venue:"", conference_name:"",
        presentation_abstract:"", presentation_keywords:"",
        doi:"", manuscript_link:"", journal_publisher:"",
        volume:"", issue_number:"", page_number:"",
        publication_date:"", indexing:"",
        cite_score:"", impact_factor:"",
        editorial_board:"", journal_website:"",
        apa_format:"", publication_abstract:"", publication_keywords:"",
        funding_source:"", remarks:"",
      });
      setFiles({ research_file: null });
      setTimeout(() => onNavigate("db-dashboard"), 1200);
    } catch (e) {
      setStatus({ type:"error", msg: e.message || "Submission failed." });
    } finally { setLoading(false); }
  };

  return (
    // ── Shell: sidebar + main ──
    <div style={{ display:"flex", minHeight:"100vh" }}>

      {/* ── Sidebar ── */}
      <Sidebar onNavigate={onNavigate} activePage="db-form" />

      {/* ── Main content ── */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
        <div style={{ background:"#f5f5f5", minHeight:"100%" }}>

          {/* Page Header */}
          <div style={{
            background:"#0d0d0d", padding:"24px 40px",
            borderBottom:"3px solid #60a5fa",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", color:"#60a5fa",
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
          <div style={{ padding:"18px 28px 60px" }}>

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
                    opts={SCHOOL_YEARS} placeholder="Select school year" />
                </F>
                <F label="Semester" req>
                  <Sel val={form.semester_id} onChange={on("semester_id")}
                    opts={SEMESTERS} placeholder="Select semester" />
                </F>
              </Row>
              <F label="Research Output Type" req>
                <Sel val={form.output_type} onChange={on("output_type")}
                  opts={OUTPUT_TYPES} placeholder="Select output type" />
              </F>
              <F label="Research Title" req>
                <Textarea value={form.title} onChange={on("title")}
                  placeholder="Enter the full research title…" />
              </F>
            </Card>

            {/* ── Card 2: Research Type & Authorship ── */}
            <Card title="Research Type & Authorship">
              <F label="Research Type" req>
                <Sel val={form.research_type} onChange={on("research_type")}
                  opts={RESEARCH_TYPES} placeholder="Select research type" />
              </F>
              <F label="Authors" req>
                <AuthorInput value={form.authors} onChange={v => set("authors", v)} />
              </F>
              <Row cols={3}>
                <F label="Campus" req>
                  <Sel val={form.campus_id} onChange={on("campus_id")}
                    opts={CAMPUSES} placeholder="Select campus" />
                </F>
                <F label="College" req>
                  <Sel val={form.college_id}
                    onChange={e => { set("college_id", e.target.value); set("department_id",""); }}
                    opts={COLLEGES} placeholder="Select college" />
                </F>
                <F label="Department / Program" req>
                  <Sel val={form.department_id} onChange={on("department_id")}
                    opts={depts} disabled={!form.college_id}
                    placeholder={form.college_id ? "Select department" : "Select college first"} />
                </F>
              </Row>
            </Card>

            {/* ── Card 3: Presentation Details (only for Presentation / Intl Presentation) ── */}
            {showPres && (
              <Card title="Presentation Details">
                <Row>
                  <F label="Venue (optional)">
                    <Input type="text" value={form.presentation_venue} onChange={on("presentation_venue")}
                      placeholder="e.g. SMX Convention Center" />
                  </F>
                  <F label="Conference Name (optional)">
                    <Input type="text" value={form.conference_name} onChange={on("conference_name")}
                      placeholder="e.g. IEEE ICCV 2025" />
                  </F>
                </Row>
                <F label="Abstract (optional)">
                  <TA value={form.presentation_abstract} onChange={on("presentation_abstract")}
                    placeholder="Enter the presentation abstract…" rows={4} />
                </F>
                <F label="Keywords (optional)">
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
                  <F label="DOI (optional)">
                    <Input type="text" value={form.doi} onChange={on("doi")}
                      placeholder="e.g. 10.1016/j.xxx.2025" />
                  </F>
                  <F label="Manuscript Link (optional)">
                    <Input type="url" value={form.manuscript_link} onChange={on("manuscript_link")}
                      placeholder="https://..." />
                  </F>
                </Row>

                {/* Row 2: Journal / Publisher */}
                <F label="Journal / Publisher (optional)">
                  <Input type="text" value={form.journal_publisher} onChange={on("journal_publisher")}
                    placeholder="e.g. Elsevier, IEEE, Springer" />
                </F>

                {/* Row 3: Volume + Issue No. + Page Number */}
                <Row cols={3}>
                  <F label="Volume (optional)">
                    <Input type="text" value={form.volume} onChange={on("volume")}
                      placeholder="e.g. 12" />
                  </F>
                  <F label="Issue No. (optional)">
                    <Input type="text" value={form.issue_number} onChange={on("issue_number")}
                      placeholder="e.g. 3" />
                  </F>
                  <F label="Page Number (optional)">
                    <Input type="text" value={form.page_number} onChange={on("page_number")}
                      placeholder="e.g. 45-58" />
                  </F>
                </Row>

                {/* Row 4: Publication Date + Indexing */}
                <Row>
                  <F label="Publication Date (optional)">
                    <Input type="date" value={form.publication_date} onChange={on("publication_date")} />
                  </F>
                  <F label="Indexing (optional)">
                    <Sel val={form.indexing} onChange={on("indexing")}
                      opts={INDEXING} placeholder="Select indexing" />
                  </F>
                </Row>

                {/* Row 5: Cite Score + Impact Factor */}
                <Row>
                  <F label="Cite Score (optional)">
                    <Input type="number" step="0.01" value={form.cite_score} onChange={on("cite_score")}
                      placeholder="e.g. 4.20" />
                  </F>
                  <F label="Impact Factor (optional)">
                    <Input type="number" step="0.01" value={form.impact_factor} onChange={on("impact_factor")}
                      placeholder="e.g. 3.75" />
                  </F>
                </Row>

                {/* Row 6: Editorial Board */}
                <F label="Editorial Board (optional)">
                  <TA value={form.editorial_board} onChange={on("editorial_board")}
                    placeholder="Board members…" />
                </F>

                {/* Row 7: Journal Website */}
                <F label="Journal Website (optional)">
                  <Input type="url" value={form.journal_website} onChange={on("journal_website")}
                    placeholder="https://..." />
                </F>

                {/* Row 8: APA Format Citation */}
                <F label="APA Format Citation (optional)">
                  <TA value={form.apa_format} onChange={on("apa_format")}
                    placeholder="Author, A. A. (Year). Title. Journal, Vol(Issue), pages. DOI" />
                </F>

                {/* Row 9: Abstract */}
                <F label="Abstract (optional)">
                  <TA value={form.publication_abstract} onChange={on("publication_abstract")}
                    placeholder="Enter abstract…" rows={4} />
                </F>

                {/* Row 10: Keywords */}
                <F label="Keywords (optional)">
                  <Input type="text" value={form.publication_keywords} onChange={on("publication_keywords")}
                    placeholder="e.g. deep learning, image segmentation" />
                </F>

              </Card>
            )}

            {/* ── Funding + Remarks (always visible) ── */}
            <Card title="Additional Information">
              <Row>
                <F label="Funding Source (optional)">
                  <Input type="text" value={form.funding_source} onChange={on("funding_source")}
                    placeholder="e.g. DOST, TIP Research Fund…" />
                </F>
                <F label="Remarks (optional)">
                  <Input type="text" value={form.remarks} onChange={on("remarks")}
                    placeholder="Any additional notes…" />
                </F>
              </Row>
            </Card>

            {/* ── Card 4: File Upload ── */}
            <Card title="Document Upload">
              <FileUploadField
                label="Research File" fieldKey="research_file"
                file={files.research_file} onFileChange={setFile} req
              />
            </Card>

            {/* Submit */}
            <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
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