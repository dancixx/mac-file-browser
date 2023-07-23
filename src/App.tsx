import { useAtom } from "jotai";
import { pdfjs } from "react-pdf";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";
import { useWindowEvent } from "./hooks/useWindowEvent";
import Folder from "./pages/folder";
import Home from "./pages/home";
import { showHiddenAtom } from "./utils/atoms";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

function App() {
  const [showHidden, setShowHidden] = useAtom(showHiddenAtom);
  useWindowEvent("showHidden", () => setShowHidden(!showHidden));

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/disk/:name/*" element={<Folder />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
