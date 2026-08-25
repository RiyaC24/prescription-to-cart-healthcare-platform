import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { store } from "@/app/store";
import { AuthBootstrap } from "@/routes/AuthBootstrap";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <BrowserRouter>
          <AuthBootstrap>
            <App />
          </AuthBootstrap>
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </StrictMode>
);
