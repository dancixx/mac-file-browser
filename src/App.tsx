import { invoke } from "@tauri-apps/api";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { pdfjs } from "react-pdf";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";
import { useWindowEvent } from "./hooks/useWindowEvent";
import Home from "./pages/home";
import Search from "./pages/search";
import View from "./pages/view";
import { showHiddenAtom } from "./store/atoms";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

function App() {
  const [showHidden, setShowHidden] = useAtom(showHiddenAtom);
  useWindowEvent("showHidden", () => setShowHidden(!showHidden));
  useEffect(() => {
    window.addEventListener("contextmenu", async (e) => {
      e.preventDefault();

      // Show the context menu
      invoke("plugin:context_menu|show_context_menu", {
        items: [
          {
            label: "Item 1",
            disabled: false,
            event: "item1clicked",
            shortcut: "ctrl+M",
            subitems: [
              {
                label: "Subitem 1",
                disabled: true,
                event: "subitem1clicked",
              },
              {
                is_separator: true,
              },
              {
                label: "Subitem 2",
                disabled: false,
                event: "subitem2clicked",
              },
            ],
          },
        ],
      });
    });
  });
  // useAsync(async () => await invoke("index_dirs"), []);
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/disk/:name/*" element={<View />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
