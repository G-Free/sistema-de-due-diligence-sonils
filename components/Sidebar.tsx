import React from "react";
import { EntityIcon } from "./icons/EntityIcon";
import { DocumentIcon } from "./icons/DocumentIcon";
import { ReportIcon } from "./icons/ReportIcon";
import { AdminIcon } from "./icons/AdminIcon";
import { RiskAssessmentIcon } from "./icons/RiskAssessmentIcon";
import { WorkflowIcon } from "./icons/WorkflowIcon";
import { IntegrationIcon } from "./icons/IntegrationIcon";
import { OfflineIcon } from "./icons/OfflineIcon";
import { ComplianceIcon } from "./icons/ComplianceIcon";
import { DashboardIcon } from "./icons/DashboardIcon";
import { TrainingIcon } from "./icons/TrainingIcon";
import { ApprovalQueueIcon } from "./icons/ApprovalQueueIcon";
import { LogoutIcon } from "./icons/LogoutIcon";
import { SettingsIcon } from "./icons/SettingsIcon";
import { DocumentAlertIcon } from "./icons/DocumentAlertIcon";
import { User } from "../types";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
  { id: "entities", label: "Entidades", icon: EntityIcon },
  {
    id: "risk-assessment",
    label: "Avaliação de Risco",
    icon: RiskAssessmentIcon,
  },
  { id: "approval-queue", label: "Fila de Aprovação", icon: ApprovalQueueIcon },
  { id: "documents", label: "Documentos", icon: DocumentIcon },
  { id: "training", label: "Treinamento", icon: TrainingIcon },
];

const secondaryNavItems = [
  { id: "workflow", label: "Workflows", icon: WorkflowIcon },
  { id: "reports", label: "Relatórios", icon: ReportIcon },
  { id: "compliance", label: "Conformidade", icon: ComplianceIcon },
  { id: "integrations", label: "Integrações", icon: IntegrationIcon },
];

const NavItem: React.FC<{
  id: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  isActive: boolean;
  onClick: (id: string) => void;
}> = ({ id, label, icon: Icon, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick(id);
      }}
      className={`flex items-center p-2.5 rounded-lg transition-colors group ${
        isActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-text-secondary hover:bg-gray-100 hover:text-text-main"
      }`}
    >
      <Icon
        className={`w-5 h-5 mr-3 shrink-0 ${isActive ? "text-primary" : "text-text-secondary group-hover:text-text-main"}`}
      />
      <span className="text-sm">{label}</span>
    </a>
  </li>
);

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  user: User;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onModuleChange,
  isOpen,
  setIsOpen,
  onLogout,
  user,
}) => {
  const handleNavigation = (module: string) => {
    onModuleChange(module);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-20 transition-opacity lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside
        className={`absolute lg:relative z-30 w-64 bg-card text-text-main h-full flex flex-col shrink-0 transition-transform transform border-r border-border ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="h-20 flex items-center justify-center px-4 border-b border-border shrink-0">
          <img
            src="../../components/image/SONILS_login.png"
            alt="SONILS Logo"
            className="h-8"
          />
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={activeModule === item.id}
                onClick={handleNavigation}
              />
            ))}
          </ul>

          <hr className="my-4 border-border" />

          <h3 className="px-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Sistema
          </h3>
          <ul className="space-y-1.5">
            {secondaryNavItems.map((item) => (
              <NavItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={activeModule === item.id}
                onClick={handleNavigation}
              />
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="p-2 rounded-lg hover:bg-background">
            <div className="flex items-center">
              <img
                className="w-10 h-10 rounded-full"
                src="https://picsum.photos/100"
                alt="User Avatar"
              />
              <div className="ml-3">
                <p className="font-semibold text-text-main text-sm">
                  {user.name}
                </p>
                <p className="text-xs text-text-secondary">{user.role}</p>
              </div>
            </div>
          </div>
          <ul className="space-y-1 mt-2">
            <NavItem
              id="admin"
              label="Administração"
              icon={AdminIcon}
              isActive={activeModule === "admin"}
              onClick={handleNavigation}
            />
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onLogout();
                }}
                className="flex items-center p-2.5 rounded-lg text-text-secondary hover:bg-gray-100 hover:text-text-main group"
              >
                <LogoutIcon className="w-5 h-5 mr-3 text-text-secondary group-hover:text-text-main" />
                <span className="text-sm">Sair</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};
