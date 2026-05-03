import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/clone/AppLayout";
import Landing from "@/pages/clone/Landing";
import Login from "@/pages/clone/Login";
import Dashboard from "@/pages/clone/Dashboard";
import CRM from "@/pages/clone/CRM";
import Processes from "@/pages/clone/Processes";
import Finance from "@/pages/clone/Finance";
import Creatives from "@/pages/clone/Creatives";
import ImageFusion from "@/pages/clone/ImageFusion";
import Analytics from "@/pages/clone/Analytics";
import WhatsAppSettings from "@/pages/clone/WhatsAppSettings";
import WhatsAppLogs from "@/pages/clone/WhatsAppLogs";
import Agenda from "@/pages/clone/Agenda";
import Onboarding from "@/pages/clone/Onboarding";
import Consulta from "@/pages/clone/Consulta";
import Settings from "@/pages/clone/Settings";
import DebugTool from "@/pages/clone/DebugTool";
import ChatIA from "@/pages/clone/ChatIA";
import AdminCases from "@/pages/clone/AdminCases";

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/clone/login" replace />;
  return <AppLayout />;
}

export default function CloneApp() {
  return (
    <div className="theme-boutique">
      <AuthProvider>
        <Routes>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="consulta" element={<Consulta />} />
          <Route path="app" element={<Protected />}>
            <Route index element={<Dashboard />} />
            <Route path="chat-ia" element={<ChatIA />} />
            <Route path="admin" element={<AdminCases />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="crm" element={<CRM />} />
            <Route path="processes" element={<Processes />} />
            <Route path="finance" element={<Finance />} />
            <Route path="creatives" element={<Creatives />} />
            <Route path="image-fusion" element={<ImageFusion />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="whatsapp" element={<WhatsAppSettings />} />
            <Route path="whatsapp-logs" element={<WhatsAppLogs />} />
            <Route path="settings" element={<Settings />} />
            <Route path="debug" element={<DebugTool />} />
          </Route>
        </Routes>
      </AuthProvider>
    </div>
  );
}
