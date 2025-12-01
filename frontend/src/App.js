import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import "@/App.css";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import WebsiteDetail from "@/pages/WebsiteDetail";
import PageDetail from "@/pages/PageDetail";
import SectionDetail from "@/pages/SectionDetail";
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
          </Routes>
        </BrowserRouter>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;