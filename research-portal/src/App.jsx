import { useState } from "react";
 
// ── Page Components ────────────────────────────────────────────────────────────
// Page keys:
//   "eval-dashboard"  → EvaluationDashboard  (Evaluation Records)
//   "eval-form"       → ResearchEvaluation   (Submit Evaluation)
//   "db-dashboard"    → DatabaseDashboard    (Research Records)
//   "db-form"         → ResearchRepository   (Submit Research)
//   "tracking"        → EvaluationTracking   (Tracking)
 
import EvaluationDashboard from "./EvaluationDashboard";
import DatabaseDashboard   from "./DatabaseDashboard";
import ResearchEvaluation  from "./ResearchEvalForm";
import ResearchRepository  from "./ResearchRepository";
import EvaluationTracking  from "./Evaluationtracking";
 
// ── Page map ───────────────────────────────────────────────────────────────────
const PAGES = {
  "eval-dashboard": EvaluationDashboard,
  "eval-form":      ResearchEvaluation,
  "db-dashboard":   DatabaseDashboard,
  "db-form":        ResearchRepository,
  "tracking":       EvaluationTracking,
};
 
// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("eval-dashboard");
  const PageComponent = PAGES[page] ?? EvaluationDashboard;
  return <PageComponent onNavigate={setPage} />;
}