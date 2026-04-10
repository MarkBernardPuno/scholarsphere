const iStyle = {
  width: "100%",
  background: "#fff",
  border: "1.5px solid #e0e0e0",
  borderRadius: 4,
  padding: "10px 13px",
  fontFamily: "'Barlow',sans-serif",
  fontSize: 14,
  color: "#0d0d0d",
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
  transition: "border-color .15s",
  boxSizing: "border-box",
};

export const Input = (p) => <input style={iStyle} {...p} />;
export const TA = (p) => <textarea style={{ ...iStyle, resize: "vertical", minHeight: 72, lineHeight: 1.6 }} {...p} />;
export const Textarea = (p) => <textarea style={{ ...iStyle, resize: "vertical", minHeight: 88, lineHeight: 1.6 }} {...p} />;

export const Lbl = ({ t, req }) => (
  <label
    style={{
      display: "block",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "#5a5a5a",
      marginBottom: 6,
    }}
  >
    {t}
    {req && <span style={{ color: "#d4a900" }}> *</span>}
  </label>
);

export const Sel = ({ val, onChange, opts, placeholder, disabled }) => (
  <div style={{ position: "relative" }}>
    <select
      value={val}
      onChange={onChange}
      disabled={disabled}
      style={{
        ...iStyle,
        paddingRight: 32,
        background: disabled ? "#f5f5f5" : "#fff",
        color: disabled ? "#9e9e9e" : "#0d0d0d",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <option value="">{placeholder}</option>
      {opts.map((o) => {
        const value = typeof o === "object" ? String(o.id) : String(o);
        const label = typeof o === "object" ? (o.name ?? o.label ?? String(o.id)) : o;
        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
    </select>
    <span
      style={{
        position: "absolute",
        right: 12,
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        color: "#9e9e9e",
      }}
    >
      ▾
    </span>
  </div>
);

export const F = ({ label, req, children }) => <div style={{ marginBottom: 18 }}><Lbl t={label} req={req} />{children}</div>;

export const Row = ({ children, cols = 2 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},minmax(0,1fr))`, gap: 16 }}>{children}</div>
);

export const Card = ({ title, children }) => (
  <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 6, marginBottom: 16, overflow: "hidden" }}>
    <div
      style={{
        background: "#111",
        padding: "9px 20px",
        fontFamily: "'Barlow Condensed',sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "3px",
        textTransform: "uppercase",
        color: "#F5C400",
      }}
    >
      {title}
    </div>
    <div style={{ padding: "20px 20px 8px" }}>{children}</div>
  </div>
);
