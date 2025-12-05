import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "@/App.css";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Websites from "@/pages/Websites";
import WebsiteDetail from "@/pages/WebsiteDetail";
import PageDetail from "@/pages/PageDetail";
import SectionDetail from "@/pages/SectionDetail";
import Settings from "@/pages/Settings";
import Analytics from "@/pages/Analytics";
import InstallationGuide from "@/pages/InstallationGuide";
import AddOnServices from "@/pages/AddOnServices";
import TestPage from "@/pages/TestPage";
import DDSPage from "@/pages/DDSPage";
import PDFPage from "@/pages/PDFPage";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/websites"
              element={
                <PrivateRoute>
                  <Websites />
                </PrivateRoute>
              }
            />
            <Route
              path="/websites/:websiteId"
              element={
                <PrivateRoute>
                  <WebsiteDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/pages/:pageId"
              element={
                <PrivateRoute>
                  <PageDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/sections/:sectionId"
              element={
                <PrivateRoute>
                  <SectionDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <Analytics />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-on-services"
              element={
                <PrivateRoute>
                  <AddOnServices />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/installation-guides"
              element={
                <PrivateRoute>
                  <InstallationGuide />
                </PrivateRoute>
              }
            />
            <Route
              path="/test"
              element={
                <PrivateRoute>
                  <TestPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;