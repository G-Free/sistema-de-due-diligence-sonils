import React, { useState } from 'react';
import { Integration } from '../../types';
import { mockIntegrations } from '../../data/mockData';

const IntegrationManagement: React.FC = () => {
    const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);

    const handleToggleStatus = (integrationId: string) => {
        const updatedIntegrations = integrations.map(int => {
            if (int.id === integrationId) {
                return { ...int, status: int.status === 'Ativa' ? 'Inativa' : 'Ativa' };
            }
            return int;
        });
        setIntegrations(updatedIntegrations);
        
        // Simulate update in mockData
        const mockIndex = mockIntegrations.findIndex(i => i.id === integrationId);
        if (mockIndex > -1) {
            mockIntegrations[mockIndex].status = mockIntegrations[mockIndex].status === 'Ativa' ? 'Inativa' : 'Ativa';
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-primary">Configuração de Integrações</h3>
                <p className="text-sm text-text-secondary mt-1">Ative ou desative as integrações com fontes de dados externas.</p>
            </div>
            <div className="space-y-4">
                {integrations.map(integration => (
                    <div key={integration.id} className="bg-background p-4 rounded-lg border border-border flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-text-main">{integration.name}</h4>
                            <p className="text-sm text-text-secondary">{integration.type}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-semibold ${integration.status === 'Ativa' ? 'text-success' : 'text-text-secondary'}`}>
                                {integration.status}
                            </span>
                            <label htmlFor={`toggle-${integration.id}`} className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        id={`toggle-${integration.id}`} 
                                        className="sr-only" 
                                        checked={integration.status === 'Ativa'}
                                        onChange={() => handleToggleStatus(integration.id)}
                                    />
                                    <div className="block bg-gray-300 w-12 h-6 rounded-full"></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${integration.status === 'Ativa' ? 'translate-x-6 !bg-primary' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IntegrationManagement;