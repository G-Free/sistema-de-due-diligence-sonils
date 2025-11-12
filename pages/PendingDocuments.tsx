import React, { useState, useMemo } from 'react';
import { ModuleChangeProps, Entity, Document, DocumentStatus } from '../types';
import { mockEntities } from '../data/mockData';
import { WarningIcon } from '../components/icons/WarningIcon';

type FilterStatus = 'all' | 'Pendente' | 'Expirado';

const statusConfig: Record<DocumentStatus, { classes: string }> = {
    'Pendente': { classes: 'bg-warning/20 text-warning' },
    'Expirado': { classes: 'bg-danger/20 text-danger' },
    'Verificado': { classes: 'bg-success/20 text-success' },
    'Recebido': { classes: 'bg-info/20 text-info' },
};


const PendingDocuments: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const problematicDocuments = useMemo(() => {
        const results: { entity: Entity; doc: Document }[] = [];

        mockEntities.forEach(entity => {
            const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return;

            entity.documents?.forEach(doc => {
                const isProblematic = doc.status === 'Pendente' || doc.status === 'Expirado';
                const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;

                if (isProblematic && matchesFilter) {
                    results.push({ entity, doc });
                }
            });
        });
        return results;
    }, [filterStatus, searchTerm]);

    const TabButton: React.FC<{ tabId: FilterStatus; label: string; count: number }> = ({ tabId, label, count }) => (
        <button
            onClick={() => setFilterStatus(tabId)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary ${
                filterStatus === tabId
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-gray-200 hover:text-text-main'
            }`}
        >
            {label} <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${filterStatus === tabId ? 'bg-white/20' : 'bg-gray-200'}`}>{count}</span>
        </button>
    );

    const counts = {
        all: problematicDocuments.length,
        pending: problematicDocuments.filter(item => item.doc.status === 'Pendente').length,
        expired: problematicDocuments.filter(item => item.doc.status === 'Expirado').length,
    };
    
    return (
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Documentos Pendentes e Expirados</h2>
                    <p className="text-text-secondary mt-1">Visão centralizada de toda a documentação que requer atenção imediata.</p>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                 <div className="p-1 bg-background rounded-lg flex space-x-1">
                    <TabButton tabId="all" label="Todos" count={counts.all} />
                    <TabButton tabId="Pendente" label="Pendentes" count={counts.pending} />
                    <TabButton tabId="Expirado" label="Expirados" count={counts.expired} />
                </div>
                <div className="w-full md:w-1/3">
                    <input 
                        type="text" 
                        placeholder="Pesquisar por entidade..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
                    />
                </div>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs text-text-secondary uppercase bg-background">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Nome da Entidade</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Documento</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Estado</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Data de Submissão</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Data de Vencimento</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {problematicDocuments.map(({ entity, doc }, index) => (
                            <tr key={`${entity.id}-${doc.name}-${index}`} className="hover:bg-background">
                                <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">{entity.name}</td>
                                <td className="px-6 py-4">{doc.name}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[doc.status].classes}`}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{doc.submissionDate}</td>
                                <td className="px-6 py-4">{doc.expiryDate || 'N/A'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onModuleChange('report', entity)} className="font-medium text-primary hover:underline">
                                        Ver Entidade
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {problematicDocuments.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center p-8">
                                    <div className="flex flex-col items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="mt-4 font-semibold text-text-main">Tudo em conformidade!</p>
                                        <p className="text-text-secondary">Nenhum documento pendente ou expirado encontrado.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PendingDocuments;
