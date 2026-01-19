import React, { useState, lazy, Suspense } from "react";
import Layout from "./components/Layout";
import { User } from "./types";
import { mockUsers, mockQuiz } from "./data/mockData";

// Lazy loading das features para melhor performance
const MenuDashboard = lazy(() => import("./pages/MenuDashboard"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Entities = lazy(() => import("./pages/Entities"));
const NewEntity = lazy(() => import("./pages/NewEntity"));
const RiskAssessment = lazy(() => import("./pages/RiskAssessment"));
const AssessmentRequests = lazy(() => import("./pages/AssessmentRequests"));
const DocumentManagement = lazy(() => import("./pages/DocumentManagement"));
const ApprovalQueue = lazy(() => import("./pages/ApprovalQueue"));
const WorkflowApproval = lazy(() => import("./pages/WorkflowApproval"));
const Reports = lazy(() => import("./pages/Reports"));
const IndividualReport = lazy(() => import("./pages/IndividualReport"));
const Compliance = lazy(() => import("./pages/Compliance"));
const TrainingDashboard = lazy(() => import("./pages/TrainingDashboard"));
const CreateQuiz = lazy(() => import("./pages/CreateQuiz"));
const TakeQuiz = lazy(() => import("./pages/TakeQuiz"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const AssessmentTemplateBuilder = lazy(() => import("./pages/AssessmentTemplateBuilder"));
const PolicyManagement = lazy(() => import("./pages/admin/PolicyManagement"));
const IntegrationManagement = lazy(() => import("./pages/admin/IntegrationManagement"));
const AuditLogPage = lazy(() => import("./pages/admin/AuditLog"));
const EntityHistory = lazy(() => import("./pages/Integrations"));
const LoginPage = lazy(() => import("./pages/Login"));

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState("menu-dashboard");
  const [context, setContext] = useState<any>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const handleLogin = (email: string, pass: string): boolean => {
      const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
      if (user) {
          const { password, ...userWithoutPassword } = user;
          setLoggedInUser(userWithoutPassword as User);
          setActiveModule("menu-dashboard");
          return true;
      }
      return false;
  };

  const handleLogout = () => {
    if (isFormDirty) {
      if (!window.confirm("Tem alterações não guardadas. Deseja mesmo sair? A sua informação será perdida.")) {
        return;
      }
    }
    setIsFormDirty(false);
    setLoggedInUser(null);
  };
  
  const handleModuleChange = (module: string, newContext?: any, force = false) => {
    if (isFormDirty && !force) {
      if (!window.confirm("Tem alterações não guardadas. Deseja mesmo sair? A sua informação será perdida.")) {
        return;
      }
    }
    setIsFormDirty(false);
    setActiveModule(module);
    setContext(newContext || null);
  };

  if (!loggedInUser) {
    return (
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando Login...</div>}>
        <LoginPage onLogin={handleLogin} />
      </Suspense>
    );
  }

  const renderModule = () => {
    switch (activeModule) {
      case "menu-dashboard": return <MenuDashboard onModuleChange={handleModuleChange} user={loggedInUser} />;
      case "dashboard": return <Dashboard onModuleChange={handleModuleChange} />;
      case "entities": return <Entities onModuleChange={handleModuleChange} />;
      case "new-entity": return <NewEntity onModuleChange={handleModuleChange} entityToEdit={context} setIsFormDirty={setIsFormDirty} />;
      case "risk-assessment": return <RiskAssessment onModuleChange={handleModuleChange} setIsFormDirty={setIsFormDirty} initialView={context?.initialView || 'history'} selectedId={context?.selectedId} />;
      case "new-risk-assessment": return <AssessmentRequests onModuleChange={handleModuleChange} />;
      case "documents": return <DocumentManagement onModuleChange={handleModuleChange} />;
      case "approval-queue": return <ApprovalQueue onModuleChange={handleModuleChange} />;
      case "workflow": return <WorkflowApproval onModuleChange={handleModuleChange} approvalItem={context} />;
      case "reports": return <Reports onModuleChange={handleModuleChange} />;
      case "report": return <IndividualReport onModuleChange={handleModuleChange} entity={context} />;
      case "compliance": return <Compliance onModuleChange={handleModuleChange} />;
      case "training": return <TrainingDashboard onModuleChange={handleModuleChange} />;
      case "create-quiz": return <CreateQuiz onModuleChange={handleModuleChange} setIsFormDirty={setIsFormDirty} />;
      case "take-quiz": return <TakeQuiz onModuleChange={handleModuleChange} quiz={context || mockQuiz} />;
      case "user-management": return <UserManagement />;
      case "assessment-template-builder": return <AssessmentTemplateBuilder onModuleChange={handleModuleChange} setIsFormDirty={setIsFormDirty} />;
      case "policy-management": return <PolicyManagement />;
      case "integration-management": return <IntegrationManagement />;
      case "audit-log": return <AuditLogPage />;
      case "entity-history": return <EntityHistory onModuleChange={handleModuleChange} />;
      case "settings": return <ScriptEditor onModuleChange={handleModuleChange} setIsFormDirty={setIsFormDirty} />;
      // case "settings": return <ScriptEditor onModuleChange={handleModuleChange} setIsFormDirty={setIsFormDirty} />;
    }
  };

  return (
    <Layout activeModule={activeModule} onModuleChange={handleModuleChange} user={loggedInUser} onLogout={handleLogout}>
      <Suspense fallback={<div className="flex h-full items-center justify-center">Carregando Módulo...</div>}>
        {renderModule()}
      </Suspense>
    </Layout>
  );
};

export default App;
