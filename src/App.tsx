import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";
import Folder from "./pages/folder";
import Home from "./pages/home";

function App() {
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
