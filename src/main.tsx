import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { supabase } from "./lib/supabase";

console.log("🔥 main loaded");

(async () => {
  const { data, error } = await supabase.from("profiles").select("*");
  console.log("DATA:", data);
  console.log("ERROR:", error);
})();

createRoot(document.getElementById("root")!).render(<App />);
  