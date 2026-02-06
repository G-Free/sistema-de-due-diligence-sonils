import React, { ReactNode, useState, useEffect, useRef } from "react";
import { BellIcon } from "./icons/BellIcon";
import { mockNotifications, mockEntities } from "../data/mockData";
import { Notification, User } from "../types";
import { AdminIcon } from "./icons/AdminIcon";
import { LogoutIcon } from "./icons/LogoutIcon";
import { MenuIcon } from "./icons/MenuIcon";
import headerlogo from "/components/image/SONILS_login.png";

const pageTitles: Record<string, string> = {
  "menu-dashboard": "Painel Principal",
  dashboard: "Dashboard de Análise",
  entities: "Gestão de Entidades",
  "new-entity": "Cadastrar/Editar Entidade",
  "risk-assessment": "Avaliação de Risco",
  "new-risk-assessment": "Nova Avaliação de Risco",
  training: "Treinamento & Quiz",
  documents: "Gestão Documental",
  "approval-queue": "Fila de Aprovação",
  workflow: "Fluxo de Aprovação",
  reports: "Relatórios",
  compliance: "Conformidade",
  offline: "Módulo Offline",
  report: "Relatório da Entidade",
  "create-quiz": "Criar Novo Quiz",
  "take-quiz": "Realizar Quiz",
  "create-module": "Criar Módulo de Treinamento",
  "view-module": "Visualizar Módulo",
  policies: "Políticas e Normas",
  "user-management": "Gestão de Utilizadores",
  "assessment-template-builder": "Templates de Avaliação",
  "policy-management": "Gestão de Políticas e Normas",
  "integration-management": "Gestão de Integrações",
  "audit-log": "Log de Auditoria",
  "entity-history": "Histórico de Alterações",
  settings: "Configurações do Sistema",
};

const Header: React.FC<{
  user: User;
  onLogout: () => void;
  activeModule: string;
  onModuleChange: (module: string) => void;
  pageTitle: string;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
}> = ({
  user,
  onLogout,
  activeModule,
  onModuleChange,
  pageTitle,
  notifications,
  onMarkAllAsRead,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserMenuClick = (module: string) => {
    onModuleChange(module);
    setShowUserMenu(false);
  };

  return (
    <header className="h-20 flex items-center justify-between px-8 shrink-0 bg-card border-b-4 border-secondary shadow-md">
      <div className="flex items-center gap-6">
        <div className="h-12 w-32  flex items-center justify-center rounded-lg">
          <img
            src={headerlogo}
            alt="SONILS Logo"
            className="h-8"
          />
        </div>
        <div className="text-sm font-semibold text-text-secondary">
          {activeModule !== "menu-dashboard" ? (
            <>
              <button
                onClick={() => onModuleChange("menu-dashboard")}
                className="hover:text-primary transition-colors"
              >
                Painel Principal
              </button>
              <span className="mx-2">/</span>
              <span className="text-text-main">{pageTitle}</span>
            </>
          ) : (
            <h1 className="text-lg font-bold text-text-main">{pageTitle}</h1>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-text-secondary hover:text-primary focus:outline-none"
          >
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-danger border-2 border-card"></span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-card rounded-xl shadow-lg border border-border animate-fade-in-up origin-top-right z-10">
              <div className="p-3 flex justify-between items-center border-b border-border">
                <h4 className="font-semibold text-text-main">Notificações</h4>
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Marcar como lidas
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 border-b border-border hover:bg-background ${!n.read ? "bg-blue-50" : ""}`}
                  >
                    <p className="font-semibold text-sm text-text-main">
                      {n.title}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {n.description}
                    </p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="p-4 text-center text-sm text-text-secondary">
                    Nenhuma notificação.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-primary">
              {user.name.charAt(0)}
            </div>
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-text-main text-sm">
                {user.name}
              </p>
              <p className="text-xs text-text-secondary">{user.role}</p>
            </div>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-card rounded-xl shadow-lg border border-border animate-fade-in-up origin-top-right z-10">
              <div className="p-2">
                <button
                  onClick={() => handleUserMenuClick("user-management")}
                  className="flex items-center w-full px-3 py-2 text-sm rounded-md text-text-secondary hover:bg-background hover:text-primary"
                >
                  <AdminIcon className="w-4 h-4 mr-3" />
                  <span>Administração</span>
                </button>
                <div className="my-1 h-px bg-border"></div>
                <button
                  onClick={onLogout}
                  className="flex items-center w-full px-3 py-2 text-sm rounded-md text-text-secondary hover:bg-background hover:text-primary"
                >
                  <LogoutIcon className="w-4 h-4 mr-3" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const Layout: React.FC<{
  children: ReactNode;
  activeModule: string;
  onModuleChange: (module: string, context?: any) => void;
  user: User;
  onLogout: () => void;
}> = ({ children, activeModule, onModuleChange, user, onLogout }) => {
  const currentPageTitle =
    pageTitles[activeModule] || "Sistema de Due Diligence";
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="flex flex-col h-screen bg-background text-text-main font-sans overflow-hidden">
      <Header
        user={user}
        onLogout={onLogout}
        activeModule={activeModule}
        onModuleChange={onModuleChange}
        pageTitle={currentPageTitle}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
