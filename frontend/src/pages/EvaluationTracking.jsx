import { useState, useEffect, useRef } from "react";
import SidebarNav from "../components/layout/SidebarNav";
import { API_BASE_URL } from "../api/client";
import {
  fetchTrackingStatuses,
  fetchResultStatuses,
  getDefaultTrackingStatuses,
  getDefaultResultStatuses,
  findStatusConfig,
} from "../api/tracking";

const API = API_BASE_URL;
const TRACKING_API = `${API}/research-evaluations/`;

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

const StatusBadge = ({ s, statuses = [] }) => {
  const cfg = findStatusConfig(statuses, s) || statuses[0] || { key: s, label: s, color: "#666", bg: "#f5f5f5" };
  return (
    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700,
      padding: "3px 10px", borderRadius: 10, whiteSpace: "nowrap", letterSpacing: "0.5px" }}>
      {cfg.label}
    </span>
  );
};

const getRecordId = (row, fallback = 0) => row?.re_id ?? row?.evaluation_id ?? row?.id ?? fallback;

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "off", ""].includes(normalized)) return false;
  }
  return Boolean(value);
};

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
    tip_aru_result: row?.tip_aru_result ?? links?.tip_aru_result ?? "",
    tip_aru_remarks: row?.tip_aru_remarks ?? "",
    tip_aru_status: row?.tip_aru_status ?? "",
    revision_matrix_full_manuscript:
      row?.revision_matrix_full_manuscript ?? links?.revision_matrix_full_manuscript ?? "",
    full_manuscript: row?.full_manuscript ?? links?.full_manuscript ?? "",
    revision_matrix_status: row?.revision_matrix_status ?? "",
    verified_authorship_form: toBoolean(row?.verified_authorship_form),
    verified_evaluation_form: toBoolean(row?.verified_evaluation_form),
    verified_full_paper: toBoolean(row?.verified_full_paper),
    verified_turnitin_report: toBoolean(row?.verified_turnitin_report),
    verified_grammarly_report: toBoolean(row?.verified_grammarly_report),
    verified_journal_conference_info: toBoolean(row?.verified_journal_conference_info),
  };
};

const normalizeTrackingList = (payload) => {
  if (Array.isArray(payload)) return payload.map(normalizeTrackingRecord);
  if (payload && Array.isArray(payload.research_evaluations)) {
    return payload.research_evaluations.map(normalizeTrackingRecord);
  }
  return [];
};

const getApiErrorMessage = async (res, fallbackMessage) => {
  try {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;
      if (typeof data?.message === "string" && data.message.trim()) return data.message;
    } else {
      const text = await res.text();
      if (text && text.trim()) return text.trim();
    }
  } catch (_) {
    // no-op: fallback below
  }
  return `${fallbackMessage} (HTTP ${res.status})`;
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

const UploadSection = ({ inputId, selectedFileName, currentFileName, onFileChange, showDelete = false, onDelete }) => (
  <div>
    {(() => {
      const displayName = selectedFileName || currentFileName || "Click to upload file";
      const hasAnyFile = Boolean(selectedFileName || currentFileName);
      return (
    <div style={{ position: "relative" }}>
      <label
        htmlFor={inputId}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#fafafa",
          border: "2px dashed #d9d9d9",
          borderRadius: 4,
          padding: "12px 10px",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 26, lineHeight: 1 }}>{hasAnyFile ? "✅" : "📁"}</span>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ color: "#4a4a4a", fontSize: 14, fontWeight: 600 }}>
            {displayName}
          </span>
          <span style={{ color: "#9e9e9e", fontSize: 11 }}>
            {hasAnyFile ? "Click to replace file" : "PDF, Word, Excel, PowerPoint, or Image"}
          </span>
        </div>
      </label>
      <input
        id={inputId}
        type="file"
        onChange={e => onFileChange(e.target.files?.[0] || null)}
        style={{ display: "none" }}
      />
      {showDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete?.();
          }}
          title="Delete file"
          aria-label="Delete file"
          style={{
            position: "absolute",
            top: 7,
            right: 7,
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "1px solid #ef9a9a",
            background: "#fff",
            color: "#c62828",
            fontSize: 14,
            lineHeight: "18px",
            padding: 0,
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          ×
        </button>
      )}
    </div>
      );
    })()}
  </div>
);

// ── Status Timeline ────────────────────────────────────────────────────────────
function StatusTimeline({ current, statuses = [] }) {
  const steps = statuses
    .filter(s => s.key !== "Rejected")
    .map(s => s.key)
    .slice(0, 4);
  
  if (steps.length === 0) {
    steps.push("Submitted", "Under Review", "For Revision", "Approved");
  }
  
  const currentIdx = steps.indexOf(current);
  const isRejected = current === "Rejected";

  return (
    <div style={{ padding: "18px 0 10px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 2, background: "#e0e0e0", zIndex: 0 }} />
        {steps.map((step, i) => {
          const done   = !isRejected && i <= currentIdx;
          const active = !isRejected && i === currentIdx;
          const cfg    = findStatusConfig(statuses, step);
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
function DetailModal({ r, onClose, statuses = [] }) {
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
          <StatusBadge s={r.tracking_status || "Submitted"} statuses={statuses} />
          <StatusTimeline current={r.tracking_status || "Submitted"} statuses={statuses} />
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
function TrackingRow({ r, onUpdate, onView, statuses = [], resultStatuses = [] }) {
  const [status,  setStatus]  = useState("");  // Start empty, user selects from result statuses
  const [remarks, setRemarks] = useState(r.remarks || "");
  const [tipAruRemarks, setTipAruRemarks] = useState(r.tip_aru_remarks || "");
  const [tipAruStatus, setTipAruStatus] = useState(r.tip_aru_status || "");
  const [revisionMatrixStatus, setRevisionMatrixStatus] = useState(r.revision_matrix_status || "");
  const [tipAruFile, setTipAruFile] = useState(null);
  const [revisionMatrixFile, setRevisionMatrixFile] = useState(null);
  const [fullManuscriptFile, setFullManuscriptFile] = useState(null);
  const [removeTipAruFile, setRemoveTipAruFile] = useState(false);
  const [removeRevisionMatrixFile, setRemoveRevisionMatrixFile] = useState(false);
  const [removeFullManuscriptFile, setRemoveFullManuscriptFile] = useState(false);
  
  // Track what was sent in last save to prevent useEffect from overwriting cleared fields
  const lastSaveRef = useRef({});

  const [vAuth,     setVAuth]     = useState(r?.verified_authorship_form ?? false);
  const [vEval,     setVEval]     = useState(r?.verified_evaluation_form ?? false);
  const [vPaper,    setVPaper]    = useState(r?.verified_full_paper ?? false);
  const [vTurnitin, setVTurnitin] = useState(r?.verified_turnitin_report ?? false);
  const [vGrammarly,setVGrammarly] = useState(r?.verified_grammarly_report ?? false);
  const [vJournal,  setVJournal]  = useState(r?.verified_journal_conference_info ?? false);

  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState("");
  const [rowSuccess, setRowSuccess] = useState("");

  // Sync if parent data changes, but preserve intentionally cleared fields from last save
  useEffect(() => {
    // Only reset to record data if we didn't just clear these fields
    setStatus("");
    // Preserve remarks if we just saved it empty; otherwise sync from record
    if (lastSaveRef.current.remarksCleared !== true) {
      setRemarks(r.remarks || "");
    }
    // Preserve tipAruRemarks if we just saved it empty; otherwise sync from record
    if (lastSaveRef.current.tipAruRemarksCleared !== true) {
      setTipAruRemarks(r.tip_aru_remarks || "");
    }
    setTipAruStatus(r.tip_aru_status || "");
    setRevisionMatrixStatus(r.revision_matrix_status || "");
    setVAuth(r?.verified_authorship_form ?? false);
    setVEval(r?.verified_evaluation_form ?? false);
    setVPaper(r?.verified_full_paper ?? false);
    setVTurnitin(r?.verified_turnitin_report ?? false);
    setVGrammarly(r?.verified_grammarly_report ?? false);
    setVJournal(r?.verified_journal_conference_info ?? false);
    setTipAruFile(null);
    setRevisionMatrixFile(null);
    setFullManuscriptFile(null);
    setRemoveTipAruFile(false);
    setRemoveRevisionMatrixFile(false);
    setRemoveFullManuscriptFile(false);
    // Clear the save tracking after sync
    lastSaveRef.current = {};
  }, [r]);

  const isChanged  =
    status !== "" ||
    remarks !== (r.remarks || "") ||
    tipAruRemarks !== (r.tip_aru_remarks || "") ||
    tipAruStatus !== (r.tip_aru_status || "") ||
    revisionMatrixStatus !== (r.revision_matrix_status || "") ||
    vAuth !== (r?.verified_authorship_form ?? false) ||
    vEval !== (r?.verified_evaluation_form ?? false) ||
    vPaper !== (r?.verified_full_paper ?? false) ||
    vTurnitin !== (r?.verified_turnitin_report ?? false) ||
    vGrammarly !== (r?.verified_grammarly_report ?? false) ||
    vJournal !== (r?.verified_journal_conference_info ?? false) ||
    !!tipAruFile ||
    !!revisionMatrixFile ||
    !!fullManuscriptFile ||
    removeTipAruFile ||
    removeRevisionMatrixFile ||
    removeFullManuscriptFile;
  const tipAruChanged =
    tipAruRemarks !== (r.tip_aru_remarks || "") ||
    tipAruStatus !== (r.tip_aru_status || "") ||
    !!tipAruFile ||
    removeTipAruFile;
  const revisionMatrixChanged =
    revisionMatrixStatus !== (r.revision_matrix_status || "") ||
    !!revisionMatrixFile ||
    !!fullManuscriptFile ||
    removeRevisionMatrixFile ||
    removeFullManuscriptFile;
  const allVerified = vAuth && vEval && vPaper && vTurnitin && vGrammarly && vJournal;
  // Remove blocking - allow saves even if not all verified
  const isBlocked  = false;

  const tdStyle = { padding: "14px 14px", verticalAlign: "top", borderBottom: "1px solid #f0f0f0" };

  const save = async () => {
    setSaving(true);
    setRowError("");
    setRowSuccess("");
    try {
      const formData = new FormData();
      // Only send status_value if it's one of the valid result statuses
      if (status && resultStatuses.includes(status)) {
        formData.append("status_value", status);
      }
      // Always send remarks (even if empty, so backend can clear them)
      formData.append("remarks", remarks);
      // Always send TIP ARU remarks (even if empty, so backend can clear them)
      formData.append("tip_aru_remarks", tipAruRemarks);
      // Only send TIP ARU status if it's one of the valid result statuses
      if (tipAruStatus && resultStatuses.includes(tipAruStatus)) {
        formData.append("tip_aru_status", tipAruStatus);
      }
      // Only send revision matrix status if it's one of the valid result statuses
      if (revisionMatrixStatus && resultStatuses.includes(revisionMatrixStatus)) {
        formData.append("revision_matrix_status", revisionMatrixStatus);
      }
      // Always send verification states (even if unchecked)
      formData.append("verified_authorship_form", vAuth ? "true" : "false");
      formData.append("verified_evaluation_form", vEval ? "true" : "false");
      formData.append("verified_full_paper", vPaper ? "true" : "false");
      formData.append("verified_turnitin_report", vTurnitin ? "true" : "false");
      formData.append("verified_grammarly_report", vGrammarly ? "true" : "false");
      formData.append("verified_journal_conference_info", vJournal ? "true" : "false");
      if (removeTipAruFile) formData.append("remove_tip_aru_result", "true");
      if (removeRevisionMatrixFile) {
        formData.append("remove_revision_matrix_full_manuscript", "true");
      }
      if (removeFullManuscriptFile) {
        formData.append("remove_full_manuscript", "true");
      }
      // Append files if selected
      if (tipAruFile) formData.append("tip_aru_result", tipAruFile);
      if (revisionMatrixFile) {
        formData.append("revision_matrix_full_manuscript", revisionMatrixFile);
      }
      if (fullManuscriptFile) {
        formData.append("full_manuscript", fullManuscriptFile);
      }
      // Track what we cleared so useEffect knows not to restore old values
      lastSaveRef.current = {
        remarksCleared: remarks === "",
        tipAruRemarksCleared: tipAruRemarks === "",
      };
      
      const res = await fetch(`${TRACKING_API}${getRecordId(r)}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, "Failed to save record"));
      }
      const updated = normalizeTrackingRecord(await res.json());
      onUpdate(updated);   // FIX: pass fresh server response, not stale r
      
      // Clear local state to match what was actually sent
      // This ensures deleted remarks stay deleted even if backend still has old data
      if (remarks === "") setRemarks("");
      if (tipAruRemarks === "") setTipAruRemarks("");
      if (tipAruStatus === "") setTipAruStatus("");
      if (revisionMatrixStatus === "") setRevisionMatrixStatus("");
      
      setRemoveTipAruFile(false);
      setRemoveRevisionMatrixFile(false);
      setRemoveFullManuscriptFile(false);
      setRowSuccess("Record updated successfully.");
    } catch (err) {
      setRowError(err?.message || "Failed to save record.");
    }
    finally { setSaving(false); }
  };

  const removeTipAru = async () => {
    if (!r.tip_aru_result && !tipAruFile) {
      setTipAruFile(null);
      setTipAruRemarks("");
      setTipAruStatus("");
      return;
    }
    setSaving(true);
    setRowError("");
    setRowSuccess("");
    try {
      const formData = new FormData();
      formData.append("remove_tip_aru_result", "true");
      formData.append("tip_aru_remarks", "");
      formData.append("tip_aru_status", "");
      const res = await fetch(`${TRACKING_API}${getRecordId(r)}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, "Failed to delete TIP ARU file"));
      }
      const updated = normalizeTrackingRecord(await res.json());
      onUpdate(updated);
      setTipAruFile(null);
      setTipAruRemarks("");
      setTipAruStatus("");
      setRemoveTipAruFile(false);
      setRowSuccess("TIP ARU file deleted.");
    } catch (err) {
      setRowError(err?.message || "Failed to delete TIP ARU file.");
    } finally {
      setSaving(false);
    }
  };

  const removeRevisionMatrix = async () => {
    if (!r.revision_matrix_full_manuscript && !revisionMatrixFile) {
      setRevisionMatrixFile(null);
      return;
    }
    setSaving(true);
    setRowError("");
    setRowSuccess("");
    try {
      const formData = new FormData();
      formData.append("remove_revision_matrix_full_manuscript", "true");
      const res = await fetch(`${TRACKING_API}${getRecordId(r)}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, "Failed to delete revision matrix file"));
      }
      const updated = normalizeTrackingRecord(await res.json());
      onUpdate(updated);
      setRevisionMatrixFile(null);
      setRemoveRevisionMatrixFile(false);
      setRowSuccess("Revision matrix file deleted.");
    } catch (err) {
      setRowError(err?.message || "Failed to delete revision matrix file.");
    } finally {
      setSaving(false);
    }
  };

  const removeFullManuscript = async () => {
    if (!r.full_manuscript && !fullManuscriptFile) {
      setFullManuscriptFile(null);
      return;
    }
    setSaving(true);
    setRowError("");
    setRowSuccess("");
    try {
      const formData = new FormData();
      formData.append("remove_full_manuscript", "true");
      const res = await fetch(`${TRACKING_API}${getRecordId(r)}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, "Failed to delete full manuscript file"));
      }
      const updated = normalizeTrackingRecord(await res.json());
      onUpdate(updated);
      setFullManuscriptFile(null);
      setRemoveFullManuscriptFile(false);
      setRowSuccess("Full manuscript file deleted.");
    } catch (err) {
      setRowError(err?.message || "Failed to delete full manuscript file.");
    } finally {
      setSaving(false);
    }
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

      <td style={{ ...tdStyle, minWidth: 260 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: "#9e9e9e", marginBottom: 4 }}>Upload File</div>
            <FileLink url={r.tip_aru_result} label={r.tip_aru_result_name || "Current TIP ARU file"} />
            <UploadSection
              inputId={`tip-aru-upload-${r.re_id}`}
              selectedFileName={tipAruFile?.name || ""}
              currentFileName={r.tip_aru_result_name || ""}
              showDelete={Boolean(r.tip_aru_result || tipAruFile)}
              onFileChange={file => {
                setTipAruFile(file);
                if (file) setRemoveTipAruFile(false);
              }}
              onDelete={removeTipAru}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={save}
                disabled={!tipAruChanged || saving}
                style={{ ...btnPri, padding: "6px 12px", fontSize: 11, opacity: (!tipAruChanged || saving) ? 0.5 : 1 }}
              >
                {saving ? "..." : "Save"}
              </button>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#9e9e9e", marginBottom: 4 }}>Remarks</div>
            <textarea
              value={tipAruRemarks}
              onChange={e => setTipAruRemarks(e.target.value)}
              placeholder="Enter remarks (no limit)"
              rows={4}
              style={{
                ...iStyle,
                padding: "8px 10px",
                fontSize: 12,
                minHeight: 96,
                resize: "vertical",
                lineHeight: 1.4,
                whiteSpace: "pre-wrap",
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#9e9e9e", marginBottom: 4 }}>Status</div>
            <select
              value={tipAruStatus}
              onChange={e => setTipAruStatus(e.target.value)}
              style={{ ...iStyle, padding: "6px 8px", fontSize: 12 }}
            >
              <option value="">Select status</option>
              {resultStatuses.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </td>

      <td style={{ ...tdStyle, minWidth: 230 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: "#9e9e9e", marginBottom: 4 }}>
              Upload Revision Matrix Full Manuscript
            </div>
            <FileLink
              url={r.revision_matrix_full_manuscript}
              label={r.revision_matrix_full_manuscript_name || "Current Full Manuscript"}
            />
            <UploadSection
              inputId={`revision-matrix-upload-${r.re_id}`}
              selectedFileName={revisionMatrixFile?.name || ""}
              currentFileName={r.revision_matrix_full_manuscript_name || ""}
              showDelete={Boolean(r.revision_matrix_full_manuscript || revisionMatrixFile)}
              onFileChange={file => {
                setRevisionMatrixFile(file);
                if (file) setRemoveRevisionMatrixFile(false);
              }}
              onDelete={removeRevisionMatrix}
            />
            <div style={{ marginTop: 10, fontSize: 10, color: "#9e9e9e", marginBottom: 4 }}>
              Upload Full Manuscript
            </div>
            <FileLink
              url={r.full_manuscript}
              label={r.full_manuscript_name || "Current Full Manuscript File"}
            />
            <UploadSection
              inputId={`full-manuscript-upload-${r.re_id}`}
              selectedFileName={fullManuscriptFile?.name || ""}
              currentFileName={r.full_manuscript_name || ""}
              showDelete={Boolean(r.full_manuscript || fullManuscriptFile)}
              onFileChange={file => {
                setFullManuscriptFile(file);
                if (file) setRemoveFullManuscriptFile(false);
              }}
              onDelete={removeFullManuscript}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={save}
                disabled={!revisionMatrixChanged || saving}
                style={{ ...btnPri, padding: "6px 12px", fontSize: 11, opacity: (!revisionMatrixChanged || saving) ? 0.5 : 1 }}
              >
                {saving ? "..." : "Save "}
              </button>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#9e9e9e", marginBottom: 4 }}>Status</div>
            <select
              value={revisionMatrixStatus}
              onChange={e => setRevisionMatrixStatus(e.target.value)}
              style={{ ...iStyle, padding: "6px 8px", fontSize: 12 }}
            >
              <option value="">Select status</option>
              {resultStatuses.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </td>

      <td style={tdStyle}>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ ...iStyle, padding: "6px 8px", fontSize: 12, marginBottom: 6 }}>
          <option value="">Select status</option>
          {resultStatuses.map(s => <option key={s} value={s}>{s}</option>)}
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
          {rowError && (
            <div style={{
              fontSize: 10,
              color: "#c62828",
              border: "1px solid #ffcdd2",
              background: "#ffebee",
              padding: "6px 8px",
              borderRadius: 3,
              lineHeight: 1.3,
            }}>
              {rowError}
            </div>
          )}
          {rowSuccess && (
            <div style={{
              fontSize: 10,
              color: "#1b5e20",
              border: "1px solid #c8e6c9",
              background: "#e8f5e9",
              padding: "6px 8px",
              borderRadius: 3,
              lineHeight: 1.3,
            }}>
              {rowSuccess}
            </div>
          )}
          {isChanged && (
            <button onClick={save} disabled={saving}
              style={{ ...btnPri, padding: "6px 12px", fontSize: 11,
                opacity: saving ? 0.5 : 1 }}>
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
  const [loadError, setLoadError] = useState("");
  const [search,   setSearch]   = useState("");
  const [filterS,  setFilterS]  = useState("");
  const [viewing,  setViewing]  = useState(null);
  const [statuses, setStatuses] = useState(getDefaultTrackingStatuses());
  const [resultStatuses, setResultStatuses] = useState(getDefaultResultStatuses());
  const [statusesLoading, setStatusesLoading] = useState(true);

  const fetchStatuses = async () => {
    setStatusesLoading(true);
    try {
      const [trackingStatuses, resultSts] = await Promise.all([
        fetchTrackingStatuses(),
        fetchResultStatuses(),
      ]);
      setStatuses(trackingStatuses);
      setResultStatuses(resultSts.map(s => s.name || s.label || s.key));
    } catch (error) {
      console.error("Failed to load statuses:", error);
      // Keep defaults on error
    } finally {
      setStatusesLoading(false);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(TRACKING_API);
      if (!res.ok) {
        setLoadError(await getApiErrorMessage(res, "Failed to load tracking records"));
        setRecords([]);
      } else {
        const payload = await res.json();
        setRecords(normalizeTrackingList(payload));
      }
    }
    catch (_) {
      setLoadError("Network error while loading tracking records.");
      setRecords([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatuses();
    fetchAll();
  }, []);

  const filtered = records.filter(r => {
    const q  = search.toLowerCase();
    const ms = !q ||
      (r.title_of_research || "").toLowerCase().includes(q) ||
      (r.author_id || "").toLowerCase().includes(q) ||
      (r.college_id || "").toLowerCase().includes(q);
    const mf = !filterS || (r.tracking_status || "Submitted") === filterS;
    return ms && mf;
  });

  const counts = statuses.reduce((acc, s) => {
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
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(statuses.length, 5)}, 1fr)`, gap: 12, marginBottom: 20 }}>
              {statuses.map(cfg => (
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
                {statuses.map(s => <option key={s.key} value={s.key}>{s.key}</option>)}
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
            {loadError && (
              <div style={{
                marginBottom: 12,
                border: "1px solid #ffcdd2",
                background: "#ffebee",
                color: "#b71c1c",
                borderRadius: 4,
                padding: "10px 12px",
                fontSize: 12,
              }}>
                {loadError}
              </div>
            )}
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
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 1850 }}>
                  <thead>
                    <tr style={{ background: "#f9f9f9", borderBottom: "1.5px solid #e0e0e0" }}>
                      {[
                        "ID",
                        "Research Details",
                        "Uploaded Files",
                        "Verification",
                        "T.I.P. - ARU - 036 Research Evaluation Result",
                        "Revision Matrix",
                        "Status & Remarks",
                        "Actions",
                      ].map(h => (
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
                        statuses={statuses}
                        resultStatuses={resultStatuses}
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

      {viewing  && <DetailModal r={viewing} onClose={() => setViewing(null)} statuses={statuses} />}
    </div>
  );
}
