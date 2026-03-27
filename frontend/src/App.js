import "antd/dist/reset.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import LoginPage from "./Pages/Authentication/login-page";
import { useAuthContext } from "./contexts/auth-context";

function App() {
  const { accessToken } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("accessToken is updated");
    if (accessToken) {
      navigate("/mainSearch");
    } else {
      navigate("/login");
    }
  }, [accessToken]);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <LoginPage />
    </div>
  );
}

export default App;
