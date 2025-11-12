import React from 'react';
import { ModuleChangeProps } from '../types';
import { mockIntegrations } from '../data/mockData';

const IntegrationCard: React.FC<{ name: string, type: string, status: 'Ativa' | 'Inativa' }> = ({ name, type, status }) => (
    <div className="bg-background p-5 rounded-lg border border-border flex items-center justify-between">
        <div>
            <h3 className="font-semibold text-text-main">{name}</h3>
            <p className="text-sm text-text-secondary">{type}</p>
        </div>
        <div className="flex items-center">
            <span className={`h-2.5 w-2.5 rounded-full mr-2 ${status === 'Ativa' ? 'bg-success' : 'bg-danger'}`}></span>
            <span className="text-sm font-semibold">{status}</span>
        </div>
    </div>
);

const Integrations: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-primary mb-2">Integrações Internacionais e Locais</h2>
      <p className="text-text-secondary mb-6">Conecte o sistema a fontes de dados externas para validações automáticas e enriquecimento de dados de risco.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockIntegrations.map(integration => (
          <IntegrationCard key={integration.id} name={integration.name} type={integration.type} status={integration.status} />
        ))}
      </div>

      <div className="mt-8 p-4 bg-background rounded-lg text-center">
        <p className="text-text-secondary text-sm">O cross-checking automático em listas de sanções é executado durante o cadastro e reavaliações periódicas.</p>
      </div>
    </div>
  );
};

export default Integrations;