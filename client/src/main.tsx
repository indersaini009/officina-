import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const backgroundImageUrl = "https://images.unsplash.com/photo-1589648751789-c8f1c4bf8a85?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1920&h=1080&fit=crop&ixid=eyJhcHBfaWQiOjF9";

// Set the background image
document.body.style.backgroundImage = `url(${backgroundImageUrl})`;
document.body.style.backgroundSize = "cover";
document.body.style.backgroundPosition = "center";
document.body.style.backgroundAttachment = "fixed";

createRoot(document.getElementById("root")!).render(<App />);
