import React, { useState } from "react";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Entities from "./pages/Entities";
import NewEntity from "./pages/NewEntity";
import DDQQuestionnaire from "./pages/DDQQuestionnaire";
import RiskAssessment from "./pages/RiskAssessment";
import DocumentManagement from "./pages/DocumentManagement";
import WorkflowApproval from "./pages/WorkflowApproval";
import IndividualReport from "./pages/IndividualReport";
import Admin from "./pages/Admin";
import Integrations from "./pages/Integrations";
import Offline from "./pages/Offline";
import Compliance from "./pages/Compliance";
import TrainingDashboard from "./pages/TrainingDashboard";
import CreateQuiz from "./pages/CreateQuiz";
import TakeQuiz from "./pages/TakeQuiz";
import { mockQuiz, mockUsers } from "./data/mockData";
import ApprovalQueue from "./pages/ApprovalQueue";
import Login from "./pages/Login";
import { User } from "./types";
import Reports from "./pages/Reports";
import CreateModule from "./pages/CreateModule";
import ViewModule from "./pages/ViewModule";
import AssessmentTemplateBuilder from "./pages/AssessmentTemplateBuilder";
import MenuDashboard from "./pages/MenuDashboard";
import Policies from "./pages/Policies";


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
  
  const handleModuleChange = (module: string, newContext?: any) => {
    if (isFormDirty) {
      if (!window.confirm("Tem alterações não guardadas. Deseja mesmo sair? A sua informação será perdida.")) {
        return; // Stop navigation if user cancels
      }
    }
    // If confirmed or not dirty, proceed
    setIsFormDirty(false); // Reset for the next module
    setActiveModule(module);
    setContext(newContext || null);
  };

  const renderModule = () => {
    if (!loggedInUser) return null;

    switch (activeModule) {
      case "menu-dashboard":
        return <MenuDashboard onModuleChange={handleModuleChange} user={loggedInUser} />;
      case "dashboard":
        return <Dashboard onModuleChange={handleModuleChange} />;
      case "admin":
        return <Admin onModuleChange={handleModuleChange} />;
      case "entities":
        return <Entities onModuleChange={handleModuleChange} />;
      case "new-entity":
        return <NewEntity onModuleChange={handleModuleChange} entityToEdit={context} setIsFormDirty={setIsFormDirty} />;
      case "questionnaire":
        return <DDQQuestionnaire onModuleChange={handleModuleChange} />;
      case "risk-assessment":
        return <RiskAssessment onModuleChange={handleModuleChange} setIsFormDirty={setIsFormDirty} />;
      case "documents":
        return <DocumentManagement onModuleChange={handleModuleChange} />;
      case "approval-queue":
        return <ApprovalQueue onModuleChange={handleModuleChange} />;
      case "workflow":
        return <WorkflowApproval onModuleChange={handleModuleChange} approvalItem={context} />;
      case "reports":
        return <Reports onModuleChange={handleModuleChange} />;
      case "report": // Individual report
        return <IndividualReport onModuleChange={handleModuleChange} entity={context} />;
      case "integrations":
        return <Integrations onModuleChange={handleModuleChange} />;
      case "offline":
        return <Offline onModuleChange={handleModuleChange} />;
      case "compliance":
        return <Compliance onModuleChange={handleModuleChange} />;
      case "training":
        return <TrainingDashboard onModuleChange={handleModuleChange} />;
      case "create-quiz":
        return <CreateQuiz onModuleChange={handleModuleChange} setIsFormDirty={setIsFormDirty} />;
      case "take-quiz":
        return <TakeQuiz onModuleChange={handleModuleChange} quiz={context || mockQuiz} />;
      case "create-module":
        return <CreateModule onModuleChange={handleModuleChange} setIsFormDirty={setIsFormDirty} />;
      case "view-module":
        return <ViewModule onModuleChange={handleModuleChange} module={context} />;
      case "assessment-template-builder":
        return <AssessmentTemplateBuilder onModuleChange={handleModuleChange} setIsFormDirty={setIsFormDirty} />;
      case "policies":
        return <Policies onModuleChange={handleModuleChange} />;
      default:
        return <MenuDashboard onModuleChange={handleModuleChange} user={loggedInUser} />;
    }
  };

  if (!loggedInUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout activeModule={activeModule} onModuleChange={handleModuleChange} user={loggedInUser} onLogout={handleLogout}>
      {renderModule()}
    </Layout>
  );
};

export default App;