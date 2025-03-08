import { BrowserRouter as Router, Routes, Route } from "react-router";

import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Home";
import Aleart from "./pages/Aleart";
import Repairs from "./pages/Repairs";
 
import Sensor from "./pages/Sensor";
import NotFound from "./pages/OtherPage/NotFound";
import Analytic from "./pages/Analytic";
import RiskHeatMap from "./pages/RiskHeatMap";
import SignIn from "./pages/AuthPages/SignIn";
 import Register from "./pages/Register";


export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route   path="/Aleart" element={<Aleart />} />
            <Route   path="/Repairs" element={< Repairs/>} />
            <Route   path="/Analytic" element={< Analytic />} />
            <Route   path="/Sensor" element={<Sensor />} />
            <Route   path="/RiskHeatMap" element={<RiskHeatMap />} />
            <Route   path="/Register"    element={<Register />} />
 

            {/* Others Page */}
 
          </Route>

          <Route path="/signin" element={<SignIn />} />
          <Route   path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
