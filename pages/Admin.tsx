import React, { useState } from 'react';
import { ModuleChangeProps } from '../types';
import UserManagement from './admin/UserManagement';
import PolicyManagement from './admin/PolicyManagement';
import IntegrationManagement from './admin/IntegrationManagement';
import AssessmentTemplateBuilder from './AssessmentTemplateBuilder';
import { UserIcon } from '../components/icons/UserIcon';
import { GavelIcon } from '../components/icons/GavelIcon';
import { IntegrationIcon } from '../components/icons/IntegrationIcon';
import { TemplateIcon } from '../components/icons/TemplateIcon';
import AuditLogPage from './admin/AuditLog';
import { AuditLogIcon } from '../components/icons/AuditLogIcon';

type AdminSection = 'users' | 'templates' | 'policies' | 'integrations' | 'audit-log';

const Admin: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
  const [activeSection, setActiveSection] = useState<AdminSection>('users');

  const navItems = [
    { id: 'users', label: 'Gestão de Utilizadores', icon: UserIcon },
    { id: 'templates', label: 'Templates de Avaliação', icon: TemplateIcon },
    { id: 'policies', label: 'Políticas e Normas', icon: GavelIcon },
    { id: 'integrations', label: 'Integrações', icon: IntegrationIcon },
    { id: 'audit-log', label: 'Log de Auditoria', icon: AuditLogIcon },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'templates':
        // A prop onModuleChange é necessária para o botão "Voltar" dentro deste componente
        return <AssessmentTemplateBuilder onModuleChange={onModuleChange} />;
      case 'policies':
        return <PolicyManagement />;
      case 'integrations':
        return <IntegrationManagement />;
      case 'audit-log':
        return <AuditLogPage />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in">
      <aside className="md:w-1/4 lg:w-1/5 shrink-0 bg-card p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-primary mb-6 border-b border-border pb-4">Administração</h2>
        <nav>
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id as AdminSection)}
                  className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary text-white font-semibold shadow-sm'
                      : 'text-text-secondary hover:bg-background hover:text-primary'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1">
        <div className="bg-card p-6 rounded-lg shadow-md min-h-full">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Admin;