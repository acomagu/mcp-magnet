import "@mcp-magnet/styles/global.css";
import React from "react";
import ReactDOM from "react-dom/client";
import DeepLinkTesterPage from "../features/deepLinkTester/page";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DeepLinkTesterPage />
  </React.StrictMode>,
);
