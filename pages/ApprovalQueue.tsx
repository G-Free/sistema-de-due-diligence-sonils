import React from 'react';
import { ModuleChangeProps, ApprovalStatus, ApprovalQueueItem } from '../types';
import { mockApprovalQueue, mockHistory } from '../data/mockData';
import { mockEntities } from '../data/mockData';
import { EyeIcon } from '../components/icons/EyeIcon';

const approvalStatusConfig: Record<ApprovalStatus, { label: string; classes: string }> = {
    'Aguardando Revisão de Compliance': { label: 'Revisão Compliance', classes: 'bg-yellow-500/10 text-yellow-600' },
    'Aguardando Validação Técnica': { label: 'Validação Técnica', classes: 'bg-cyan-500/10 text-cyan-600' },
    'Aguardando Validação de Gestor': { label: 'Validação Gestor', classes: 'bg-warning/20 text-warning' },
    'Aguardando Aprovação Final': { label: 'Aprovação Final', classes: 'bg-info/20 text-info' },
    'Aprovado': { label: 'Aprovado', classes: 'bg-success/20 text-success' },
    'Rejeitado': { label: 'Rejeitado', classes: 'bg-danger/20 text-danger' },
    'Mais Informação Necessária': { label: 'Info Pendente', classes: 'bg-purple-500/10 text-purple-600' },
};

const classificationConfig: Record<string, { badge: string }> = {
  'A - Favorável': { badge: 'bg-success/20 text-success' },
  'B - Favorável com Ressalvas': { badge: 'bg-warning/20 text-warning' },
  'C - Não Favorável': { badge: 'bg-danger/20 text-danger' },
};


const ApprovalQueue: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
    
    const enrichedApprovalQueue = mockApprovalQueue.map(item => {
        const entityHistory = mockHistory
            .filter(h => h.entityName === item.entityName)
            .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
        
        const latestHistory = entityHistory.length > 0 ? entityHistory[0] : null;

        return {
            ...item,
            score: latestHistory ? latestHistory.finalScore : null,
            classification: latestHistory ? latestHistory.classification : null,
            sequenceNumber: latestHistory ? latestHistory.sequenceNumber : null,
        };
    }).filter(item => item.sequenceNumber);
    
    const handleReview = (item: ApprovalQueueItem) => {
        onModuleChange('workflow', item);
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-primary mb-2">Fila de Aprovação da Avaliação de Risco</h2>
            <p className="text-text-secondary mb-6">Consulte a pontuação e classificação das avaliações pendentes para tomar uma decisão informada.</p>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs text-text-main uppercase bg-background">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome da Entidade</th>
                            <th scope="col" className="px-6 py-3">Nº Avaliação</th>
                            <th scope="col" className="px-6 py-3">Pontuação</th>
                            <th scope="col" className="px-6 py-3">Classificação</th>
                            <th scope="col" className="px-6 py-3">Data</th>
                            <th scope="col" className="px-6 py-3">Estado Atual</th>
                            <th scope="col" className="px-6 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrichedApprovalQueue.map((item) => (
                            <tr key={item.id} className="border-b border-border hover:bg-background">
                                <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">{item.entityName}</td>
                                <td className="px-6 py-4 font-mono text-xs text-text-main">{item.sequenceNumber || 'N/A'}</td>
                                <td className="px-6 py-4 font-semibold">{item.score ? `${item.score.toFixed(1)}%` : 'N/A'}</td>
                                <td className="px-6 py-4">
                                     {item.classification ? (
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classificationConfig[item.classification as keyof typeof classificationConfig]?.badge || 'bg-gray-200 text-gray-800'}`}>
                                            {item.classification}
                                        </span>
                                    ) : 'N/A'}
                                </td>
                                <td className="px-6 py-4">{item.requestDate}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${approvalStatusConfig[item.status].classes}`}>
                                        {approvalStatusConfig[item.status].label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleReview(item)} className="group relative text-text-secondary hover:text-primary transition-colors" aria-label="Rever Solicitação">
                                        <EyeIcon className="w-5 h-5" />
                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            Rever
                                        </span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {enrichedApprovalQueue.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-text-secondary">A sua fila de aprovação está vazia ou não contém itens com avaliação gerada.</p>
                </div>
            )}
        </div>
    );
};

export default ApprovalQueue;