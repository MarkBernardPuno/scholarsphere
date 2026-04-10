import { useMemo, useState } from "react";

export default function AuthorTagInput({
  value,
  onChange,
  suggestions = [],
  maxAuthors = null,
  placeholder = "Type author name and press Enter...",
  helperText = "Press Enter or click Add for each author.",
}) {
  const [input, setInput] = useState("");
  const [touched, setTouched] = useState(false);
  const authors = value ? value.split(",").map((a) => a.trim()).filter(Boolean) : [];
  const normalizedSuggestions = useMemo(
    () => suggestions.map((item) => String(item || "").trim()).filter(Boolean),
    [suggestions],
  );

  const filteredSuggestions = useMemo(() => {
    const query = input.trim().toLowerCase();
    if (!query) return [];
    return normalizedSuggestions
      .filter((name) => !authors.some((author) => author.toLowerCase() === name.toLowerCase()))
      .filter((name) => name.toLowerCase().startsWith(query))
      .slice(0, 8);
  }, [input, normalizedSuggestions, authors]);

  const resolveSuggestion = (token) => {
    const found = normalizedSuggestions.find(
      (name) => name.toLowerCase() === token.toLowerCase(),
    );
    return found || token;
  };

  const hasMaxAuthors = Number.isFinite(maxAuthors) && maxAuthors > 0;

  const add = () => {
    const token = input.trim();
    if (!token) return;
    if (hasMaxAuthors && authors.length >= maxAuthors) {
      setTouched(true);
      return;
    }
    const nextAuthor = resolveSuggestion(token);
    const exists = authors.some((name) => name.toLowerCase() === nextAuthor.toLowerCase());
    if (exists) {
      setInput("");
      return;
    }
    onChange([...authors, nextAuthor].join(", "));
    setInput("");
  };

  const maxReached = hasMaxAuthors && authors.length >= maxAuthors;

  const remove = (idx) => onChange(authors.filter((_, i) => i !== idx).join(", "));

  return (
    <div>
      {authors.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {authors.map((author, index) => (
            <span
              key={`${author}-${index}`}
              style={{
                background: "#fff8e1",
                color: "#d4a900",
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: "1px solid #f5c40044",
              }}
            >
              {author}
              <button
                onClick={() => remove(index)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#d4a900",
                  fontSize: 14,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, position: "relative" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setTouched(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          disabled={maxReached}
          style={{
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
          }}
        />
        {touched && filteredSuggestions.length > 0 && !maxReached && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 74,
              top: 42,
              zIndex: 20,
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: 4,
              boxShadow: "0 8px 22px rgba(0,0,0,0.12)",
              maxHeight: 180,
              overflowY: "auto",
            }}
          >
            {filteredSuggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  if (maxReached) return;
                  const exists = authors.some((author) => author.toLowerCase() === name.toLowerCase());
                  if (exists) return;
                  onChange([...authors, name].join(", "));
                  setInput("");
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "#fff",
                  border: "none",
                  borderBottom: "1px solid #f2f2f2",
                  padding: "10px 12px",
                  fontSize: 13,
                  color: "#1f2937",
                  cursor: "pointer",
                }}
              >
                {name}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={add}
          disabled={maxReached}
          style={{
            background: maxReached ? "#e0e0e0" : "#F5C400",
            color: "#0d0d0d",
            border: "none",
            padding: "0 18px",
            fontFamily: "'Barlow Condensed',sans-serif",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "1px",
            textTransform: "uppercase",
            cursor: maxReached ? "not-allowed" : "pointer",
            borderRadius: 4,
            whiteSpace: "nowrap",
          }}
        >
          Add
        </button>
      </div>

      <div style={{ fontSize: 11, color: maxReached ? "#b45309" : "#9e9e9e", marginTop: 5 }}>
        {maxReached
          ? `Maximum ${maxAuthors} authors reached.`
          : hasMaxAuthors
            ? `${helperText} (${authors.length}/${maxAuthors})`
            : `${helperText} (${authors.length})`}
      </div>
    </div>
  );
}
