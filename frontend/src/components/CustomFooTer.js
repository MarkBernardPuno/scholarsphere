import Card from "react-bootstrap/Card";

function Foot() {
  return (
    <div
      style={{
        height: "10vh",
        backgroundColor: "#FBC505",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        fontSize: "16px",
      }}
    >
      <a
        href="/terms"
        style={{
          color: "black",
          marginRight: "24px",
          textDecoration: "none",
        }}
      >
        Terms and Conditions
      </a>
      <a
        href="/privacy"
        style={{
          color: "black",
          marginRight: "24px",
          textDecoration: "none",
        }}
      >
        Privacy Policy
      </a>
    </div>
  );
}

export default Foot;
