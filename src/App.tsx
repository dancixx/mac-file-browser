import { pdfjs } from "react-pdf";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";
import { useHiddenFiles } from "./hooks/useHiddenFiles";
import Folder from "./pages/folder";
import Home from "./pages/home";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

function App() {
  useHiddenFiles();

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
