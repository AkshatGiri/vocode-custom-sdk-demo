import "./polyfill";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import globalStyles from "./globals.css?inline";

/**
 * Setting up web component.
 * We're using web component to avoid any conflicts with the host page.
 * This will allow us to keep our styles isolated from any page that might
 * use our widget. This will also allows us to keep our logic isolated from
 * the host page.
 */
class FineTunerAiWidget extends HTMLElement {
  constructor() {
    super();
    this.shoadowRoot = this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(document.createElement("style")).textContent =
      globalStyles;

    ReactDOM.createRoot(this.shoadowRoot).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

// INSERTING WEB COMPONENT INTO THE HOST PAGE ON LOAD
customElements.define("fine-tuner-ai-widget", FineTunerAiWidget);
