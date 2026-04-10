import { useState } from "react";

export default function SidebarNav({
  sectionTitle,
  items,
  activePage,
  onNavigate,
  defaultOpen = true,
  width = 190,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const navItem = (item) => {
    const isActive = activePage === item.page;
    return (
      <button
        key={item.page}
        onClick={() => onNavigate(item.page)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px",
          fontFamily: "'Barlow',sans-serif",
          fontSize: 12,
          fontWeight: isActive ? 600 : 500,
          color: isActive ? "#b8860b" : "#3a3a3a",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          background: isActive ? "#fffbea" : "none",
          border: "none",
          borderLeft: isActive ? "3px solid #F5C400" : "3px solid transparent",
          transition: "background 0.12s, color 0.12s",
          boxSizing: "border-box",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = "#f5f5f5";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = "none";
        }}
      >
        <span style={{ fontSize: 14, opacity: isActive ? 1 : 0.55, flexShrink: 0 }}>{item.icon}</span>
        {item.label}
        {isActive && (
          <span
            style={{
              width: 6,
              height: 6,
              background: "#F5C400",
              borderRadius: "50%",
              marginLeft: "auto",
              flexShrink: 0,
            }}
          />
        )}
      </button>
    );
  };

  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        background: "#ffffff",
        borderRight: "2px solid #0d0d0d",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <nav style={{ flex: 1, padding: "12px 0" }}>
        <div style={{ marginBottom: 4 }}>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            style={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "'Barlow Condensed',sans-serif",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: "#b0b0b0",
              padding: "10px 18px 4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{sectionTitle}</span>
            <span style={{ fontSize: 10 }}>{isOpen ? "▾" : "▸"}</span>
          </button>
          {isOpen && items.map(navItem)}
        </div>
      </nav>

      <div
        style={{
          padding: "12px 18px",
          borderTop: "1px solid #e8e8e8",
          fontSize: 10,
          color: "#c0c0c0",
          fontFamily: "'Barlow',sans-serif",
        }}
      >
        Scholar Sphere v1.0
      </div>
    </aside>
  );
}
