import React, { useState, useMemo } from 'react';
import { ModuleChangeProps, ApprovalQueueItem, HistoryItem, ApprovalStatus, ApprovalLog } from '../types';
import { mockHistory, mockEntities, mockApprovalQueue } from '../data/mockData';
import { useToast } from '../components/useToast';

interface WorkflowApprovalProps extends ModuleChangeProps {
  approvalItem?: ApprovalQueueItem;
}


const Step: React.FC<{ number: number, title: string, status: 'completed' | 'current' | 'pending' | 'rejected', user?: string, date?: string, comments?: string }> = ({ number, title, status, user, date, comments }) => {
    const statusClasses = {
        completed: { bg: 'bg-success', border: 'border-success', text: 'text-success' },
        current: { bg: 'bg-primary', border: 'border-primary', text: 'text-primary' },
        pending: { bg: 'bg-gray-300', border: 'border-gray-300', text: 'text-text-secondary' },
        rejected: { bg: 'bg-danger', border: 'border-danger', text: 'text-danger' },
    };
    const currentStatus = statusClasses[status] || statusClasses.pending;
    const isFinalStep = number === 5;

    return (
        <div className="flex items-start">
            <div className="flex flex-col items-center mr-4 shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 text-white ${currentStatus.bg} ${currentStatus.border}`}>
                    {status === 'completed' ? '✓' : (status === 'rejected' ? '✕' : number)}
                </div>
                {!isFinalStep && <div className={`w-0.5 h-24 mt-2 ${status === 'completed' ? 'bg-success' : 'bg-border'}`}></div>}
            </div>
            <div className="pt-1">
                <h4 className={`font-semibold ${status !== 'pending' ? 'text-text-main' : 'text-text-secondary'}`}>{title}</h4>
                <p className="text-sm text-text-secondary">{user ? `Por: ${user}` : 'Aguardando ação'}</p>
                <p className="text-xs text-text-secondary">{date}</p>
                {comments && (
                     <div className="mt-2 text-xs p-2 bg-card rounded border border-border italic text-text-secondary">
                        "{comments}"
                    </div>
                )}
            </div>
        </div>
    );
}

const classificationConfig: Record<string, { badge: string }> = {
  'A - Favorável': { badge: 'bg-success/20 text-success' },
  'B - Favorável com Ressalvas': { badge: 'bg-warning/20 text-warning' },
  'C - Não Favorável': { badge: 'bg-danger/20 text-danger' },
};

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const renderables = [];
    let currentList: string[] = [];

    const processLine = (line: string) => {
        return line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-text-main">$1</strong>');
    };

    for (const line of text.split('\n')) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('- ')) {
            currentList.push(trimmedLine.substring(2));
        } else {
            if (currentList.length > 0) {
                renderables.push({ type: 'ul', items: currentList });
                currentList = [];
            }
            if (trimmedLine) {
                renderables.push({ type: 'p', content: trimmedLine });
            }
        }
    }
    if (currentList.length > 0) {
        renderables.push({ type: 'ul', items: currentList });
    }

    return (
        <>
            {renderables.map((item, index) => {
                if (item.type === 'ul') {
                    return (
                        <ul key={index} className="list-disc list-inside space-y-1.5 text-text-secondary">
                            {item.items.map((li, i) => (
                                <li key={i} dangerouslySetInnerHTML={{ __html: processLine(li) }} />
                            ))}
                        </ul>
                    );
                }
                return <p key={index} className="text-text-secondary mb-2" dangerouslySetInnerHTML={{ __html: processLine(item.content) }} />;
            })}
        </>
    );
};

const workflowSteps = [
    { title: 'Submissão', responsible: 'Requerente' },
    { title: 'Revisão de Compliance', responsible: 'Oficial de Compliance' },
    { title: 'Validação Técnica', responsible: 'Técnico Avaliador' },
    { title: 'Validação de Gestão', responsible: 'Gestor de Contrato (Superior)' },
    { title: 'Aprovação Final (Direção)', responsible: 'Diretor' },
];

const statusOrder: ApprovalStatus[] = [
    'Aguardando Revisão de Compliance',
    'Aguardando Validação Técnica',
    'Aguardando Validação de Gestor',
    'Aguardando Aprovação Final',
    'Aprovado'
];

const WorkflowApproval: React.FC<WorkflowApprovalProps> = ({ onModuleChange, approvalItem }) => {
    const [comments, setComments] = useState('');
    const [actionError, setActionError] = useState('');
    const { addToast } = useToast();

    const entity = useMemo(() => {
        if (!approvalItem) return null;
        return mockEntities.find(e => e.id === approvalItem.entityId);
    }, [approvalItem]);

    const latestHistoryItem = useMemo(() => {
        if (!approvalItem) return null;
        return mockHistory
            .filter(h => h.entityName === approvalItem.entityName)
            .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime())[0] || null;
    }, [approvalItem]);


    const handleAction = (action: 'Aprovar' | 'Rejeitar' | 'Solicitar Mais Informação') => {
        if (!approvalItem) return;

        if (!comments.trim()) {
            setActionError('O comentário é obrigatório para todas as ações.');
            return;
        }
        setActionError('');

        const itemIndex = mockApprovalQueue.findIndex(i => i.id === approvalItem.id);
        if (itemIndex === -1) {
            console.error("Item de aprovação não encontrado!");
            return;
        }

        const currentStatus = approvalItem.status;
        let nextStatus: ApprovalStatus = currentStatus;
        let logAction: ApprovalLog['action'] = 'Aprovado';
        
        const currentStepIndex = statusOrder.indexOf(currentStatus);
        const stepTitle = workflowSteps[currentStepIndex + 1]?.title || 'Ação Final';

        if (action === 'Rejeitar') {
            nextStatus = 'Rejeitado';
            logAction = 'Rejeitado';
        } else if (action === 'Solicitar Mais Informação') {
            nextStatus = 'Aguardando Revisão de Compliance';
            logAction = 'Mais Informação Solicitada';
        } else { // Aprovar
            if (currentStepIndex !== -1 && currentStepIndex < statusOrder.length - 1) {
                nextStatus = statusOrder[currentStepIndex + 1];
            }
        }
        
        const newLog: ApprovalLog = {
            step: stepTitle,
            user: 'Utilizador Atual (Você)',
            date: new Date().toISOString().split('T')[0],
            action: logAction,
            comments: comments || undefined
        };

        const updatedItem = { ...approvalItem, status: nextStatus, log: [...(approvalItem.log || []), newLog] };
        mockApprovalQueue[itemIndex] = updatedItem;

        let notificationTitle = 'Ação Registada';
        let notificationMessage = `A sua ação de "${action}" foi registada com sucesso.`;
        let toastType: 'success' | 'error' | 'info' = 'success';

        if (action === 'Rejeitar') {
            notificationTitle = 'Solicitação Rejeitada';
            toastType = 'error';
        } else if (action === 'Solicitar Mais Informação') {
            notificationTitle = 'Mais Informação Solicitada';
            toastType = 'info';
        }

        addToast(notificationMessage, toastType, notificationTitle);
        onModuleChange('approval-queue');
    };
    
    if (!approvalItem) {
        // Default view if no item is passed, e.g., from the main menu
        const defaultEntityName = "SocoOil, Lda.";
        return (
             <div className="bg-card p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-primary mb-2">Fluxo de Trabalho de Aprovação</h2>
                <p className="text-text-secondary mb-6">Acompanhe o processo de aprovação para a entidade "{defaultEntityName}", garantindo transparência e rastreabilidade.</p>
                
                <div className="bg-background p-8 rounded-lg border border-border">
                    <Step number={1} title="Submissão" status="completed" user="Consultor Externo" date="2024-07-28" />
                    <Step number={2} title="Revisão de Compliance" status="completed" user="Oficial de Compliance" date="2024-07-29" comments="Documentação inicial validada." />
                    <Step number={3} title="Validação Técnica" status="current" user="Técnico Avaliador" date="" />
                    <Step number={4} title="Validação de Gestão" status="pending" user="Gestor de Contrato (Superior)" date="" />
                    <Step number={5} title="Aprovação Final (Direção)" status="pending" user="" date="" />
                </div>
                 <div className="mt-6 p-4 bg-background rounded-lg text-center">
                    <p className="text-text-secondary text-sm">Este é um exemplo de visualização. Para aprovar ou rejeitar, aceda a uma solicitação através da <button onClick={() => onModuleChange('approval-queue')} className="text-primary font-semibold hover:underline">Fila de Aprovação</button>.</p>
                </div>
            </div>
        );
    }
    
    const currentStepIndex = statusOrder.indexOf(approvalItem.status);

    return (
        <div className="bg-card p-6 rounded-lg shadow-sm animate-fade-in">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-primary mb-2">Revisar Solicitação: {approvalItem.entityName}</h2>
                    <p className="text-text-secondary">Reveja os dados da avaliação de risco e tome uma ação no fluxo de trabalho.</p>
                </div>
                <button onClick={() => onModuleChange('approval-queue')} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                    &larr; Voltar à Fila
                </button>
            </div>
        
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-background p-6 rounded-lg border border-border">
                    <h3 className="text-lg font-semibold text-primary mb-4">Estado Atual do Fluxo</h3>
                    {workflowSteps.map((step, index) => {
                        const logEntry = approvalItem.log?.[index];
                        let stepStatus: 'completed' | 'current' | 'pending' | 'rejected';

                        if (approvalItem.status === 'Aprovado') {
                            stepStatus = 'completed';
                        } else if (approvalItem.status === 'Rejeitado') {
                            const lastLog = approvalItem.log?.[approvalItem.log.length - 1];
                            const rejectedStepIndex = workflowSteps.findIndex(s => s.title === lastLog?.step);
                            if (index < rejectedStepIndex) stepStatus = 'completed';
                            else if (index === rejectedStepIndex) stepStatus = 'rejected';
                            else stepStatus = 'pending';
                        } else if (approvalItem.status === 'Mais Informação Necessária') {
                            const lastLog = approvalItem.log?.[approvalItem.log.length - 1];
                            const infoNeededStepIndex = workflowSteps.findIndex(s => s.title === lastLog?.step);
                            if (index < infoNeededStepIndex) stepStatus = 'completed';
                            else if (index === infoNeededStepIndex) stepStatus = 'current';
                            else stepStatus = 'pending';
                        } else { // Status in normal flow
                            if (index <= currentStepIndex) stepStatus = 'completed';
                            else if (index === currentStepIndex + 1) stepStatus = 'current';
                            else stepStatus = 'pending';
                        }

                        return (
                             <Step 
                                key={index}
                                number={index + 1}
                                title={step.title}
                                status={stepStatus}
                                user={logEntry?.user}
                                date={logEntry?.date}
                                comments={logEntry?.comments}
                            />
                        )
                    })}
                </div>

                <div className="space-y-6">
                     <div className="bg-background p-4 rounded-lg border border-border">
                        <h3 className="text-lg font-semibold text-primary mb-4">Resumo da Avaliação de Risco</h3>
                        {latestHistoryItem ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-text-secondary">Pontuação Final</p>
                                        <p className="font-bold text-xl text-primary">{latestHistoryItem.finalScore.toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Classificação</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classificationConfig[latestHistoryItem.classification as keyof typeof classificationConfig]?.badge}`}>
                                            {latestHistoryItem.classification}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Data da Avaliação</p>
                                        <p className="font-semibold text-text-main">{latestHistoryItem.assessmentDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary">Avaliador</p>
                                        <p className="font-semibold text-text-main">{latestHistoryItem.user}</p>
                                    </div>
                                </div>
                                {latestHistoryItem.observations && (
                                    <div>
                                        <p className="text-text-secondary text-sm font-medium">Observações da Avaliação (Análise IA)</p>
                                        <div className="mt-2 border-l-4 border-secondary pl-4 py-2 text-sm bg-card rounded-r-md">
                                            <MarkdownRenderer text={latestHistoryItem.observations} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-text-secondary text-sm">Nenhum histórico de avaliação de risco encontrado para esta entidade.</p>
                        )}
                    </div>
                    { !['Aprovado', 'Rejeitado'].includes(approvalItem.status) && (
                        <div>
                            <h3 className="text-lg font-semibold text-primary mb-4">A sua Ação é Necessária</h3>
                            <p className="text-sm text-text-secondary mb-4">
                                Por favor, reveja os detalhes da entidade e a documentação associada. Adicione comentários se necessário e tome uma decisão.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="comments" className="block text-sm font-medium text-text-secondary mb-1">Comentários (Obrigatório para todas as ações)</label>
                                    <textarea
                                        id="comments"
                                        rows={4}
                                        value={comments}
                                        onChange={(e) => {
                                            setComments(e.target.value);
                                            if (actionError) setActionError('');
                                        }}
                                        placeholder="Insira as suas observações aqui..."
                                        className={`w-full bg-background border rounded-lg p-2.5 text-text-main focus:ring-2 focus:outline-none ${actionError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`}
                                    />
                                     {actionError && <p className="text-danger text-xs mt-1">{actionError}</p>}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                    <button onClick={() => handleAction('Aprovar')} className="bg-success hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors w-full">
                                        Aprovar
                                    </button>
                                    <button onClick={() => handleAction('Rejeitar')} className="bg-danger hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors w-full">
                                        Rejeitar
                                    </button>
                                    <button onClick={() => handleAction('Solicitar Mais Informação')} className="bg-secondary hover:bg-secondary-hover text-primary font-semibold py-2.5 px-4 rounded-lg transition-colors w-full text-center">
                                        Pedir Info
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkflowApproval;
