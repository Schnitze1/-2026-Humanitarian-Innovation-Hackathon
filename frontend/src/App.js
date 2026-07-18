import { NavLink, Route, Routes } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Setup from "./pages/Setup";
import Upload from "./pages/Upload";
import Generate from "./pages/Generate";
import Review from "./pages/Review";
import Disclosure from "./pages/Disclosure";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="app-brand">
          Aiga
        </NavLink>
        <nav className="app-nav" aria-label="Workflow">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/setup">Setup</NavLink>
          <NavLink to="/upload">Upload</NavLink>
          <NavLink to="/generate">Generate</NavLink>
          <NavLink to="/review">Review</NavLink>
          <NavLink to="/disclosure">Disclosure</NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/review" element={<Review />} />
          <Route path="/disclosure" element={<Disclosure />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
