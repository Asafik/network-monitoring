import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StandaloneWidget } from "./views/StandaloneWidget";

const isWidgetWindow =
  typeof window !== "undefined" &&
  (window.location.search.includes("widget=true") ||
    window.location.pathname.includes("widget"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {isWidgetWindow ? <StandaloneWidget /> : <App />}
  </React.StrictMode>,
);
