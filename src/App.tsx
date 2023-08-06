import { useAtom } from "jotai";
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
