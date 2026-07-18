import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Welcome from "./pages/Welcome";
import Setup from "./pages/Setup";
import Upload from "./pages/Upload";
import Generate from "./pages/Generate";
import Review from "./pages/Review";
import Disclosure from "./pages/Disclosure";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Welcome />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/review" element={<Review />} />
        <Route path="/disclosure" element={<Disclosure />} />
      </Route>
    </Routes>
  );
}

export default App;
