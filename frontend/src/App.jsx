import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import HariChat from "./components/HariChat";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import FoodDrives from "./pages/FoodDrives";
import Donate from "./pages/Donate";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/dashboards/AdminDashboard";
import DonorDashboard from "./pages/dashboards/DonorDashboard";
import VolunteerDashboard from "./pages/dashboards/VolunteerDashboard";
import PartnerDashboard from "./pages/dashboards/PartnerDashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/food-drives" element={<FoodDrives />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard/admin/*"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/donor"
            element={
              <ProtectedRoute role="donor">
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/volunteer"
            element={
              <ProtectedRoute role="volunteer">
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/partner"
            element={
              <ProtectedRoute role="partner">
                <PartnerDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Landing />} />
        </Routes>
      </main>
      <Footer />
      <HariChat />
    </div>
  );
}
