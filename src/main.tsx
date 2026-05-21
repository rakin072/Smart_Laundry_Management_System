import React from "react";
import ReactDOM from "react-dom/client";
import { globalStyles } from "@washingtonpost/wpds-ui-kit";
import App from "./App";

/*
 * ── Theme Setup ─────────────────────────────────────────────────────
 *
 * WPDS ships a light theme (default) and a dark theme.
 *
 * To enable AUTOMATIC dark mode (based on OS / browser preference):
 *   import { darkModeGlobalStyles } from "@washingtonpost/wpds-ui-kit";
 *   darkModeGlobalStyles();
 *
 * To enable MANUAL dark mode, apply the class "wpds-dark" to a container:
 *   import { darkTheme } from "@washingtonpost/wpds-ui-kit";
 *   document.body.classList.add(darkTheme.className);
 *
 * To create a CUSTOM theme:
 *   import { createTheme } from "@washingtonpost/wpds-ui-kit";
 *   const myTheme = createTheme("my-theme", {
 *     colors: { primary: "#ff0000", background: "#fefefe" },
 *   });
 *   <div className={myTheme.className}> ... </div>
 * ────────────────────────────────────────────────────────────────────
 */

// Inject WPDS global styles (fonts, resets, box-sizing)
globalStyles();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
