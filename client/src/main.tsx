import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add dark mode class to document initially (default is dark mode)
document.documentElement.classList.add('dark');

createRoot(document.getElementById("root")!).render(<App />);
