import React from 'react';
import { ModuleChangeProps } from '../types';
import { AuditIcon as SocIcon } from '../components/icons/AuditIcon';

const DDQEvaluation: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
  return (
    <div className="bg-card p-8 rounded-xl shadow-md max-w-4xl mx-auto animate-fade-in text-center">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-danger/10 mb-6">
        <SocIcon className="h-10 w-10 text-danger" />
      </div>
      <h2 className="text-2xl font-bold text-primary mb-3">Área de Acesso Restrito</h2>
      <h3 className="text-xl font-semibold text-danger mb-4">Security Operations Center (SOC)</h3>
      <div className="bg-background p-6 rounded-lg border border-border text-left space-y-4 text-text-secondary">
        <p>
          Esta área é responsável pela monitoração contínua da segurança da informação da plataforma. O acesso é estritamente controlado e limitado a pessoal autorizado do SOC.
        </p>
        <p className="font-semibold text-text-main">
          Por tratar informações sensíveis e confidenciais sobre ameaças, vulnerabilidades e incidentes de segurança, a presença de visitantes é proibida sem autorização formal da Direção de Segurança.
        </p>
        <p>
          Todas as atividades nesta área são registadas e auditadas.
        </p>
      </div>
       <div className="mt-8">
            <button onClick={() => onModuleChange('menu-dashboard')} className="mt-4 bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                Voltar ao Painel Principal
            </button>
        </div>
    </div>
  );
};

export default DDQEvaluation;
