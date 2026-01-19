import React from 'react';
import { ModuleChangeProps } from '../types';
import { mockQuiz, mockTrainingModules, mockCampaigns, mockActionPlans } from '../data/mockData';
import { useToast } from '../components/useToast';

const ProgressBar: React.FC<{ value: number, colorClass: string }> = ({ value, colorClass }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
);

const TrainingDashboard: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
    const { addToast } = useToast();

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary">Painel de Treinamento e Quiz</h1>
                    <p className="text-text-secondary mt-1">Crie, distribua e acompanhe quizzes de compliance para toda a organização.</p>
                </div>
                <button onClick={() => onModuleChange('create-quiz')} className="bg-secondary hover:bg-secondary-hover text-primary font-semibold py-2 px-6 rounded-lg transition-colors mt-4 sm:mt-0">
                    Criar Novo Quiz
                </button>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-primary mb-4">Campanhas Ativas</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-main uppercase bg-background">
                            <tr>
                                <th scope="col" className="px-6 py-3">Título do Quiz</th>
                                <th scope="col" className="px-6 py-3">Destinatários</th>
                                <th scope="col" className="px-6 py-3">Conclusão</th>
                                <th scope="col" className="px-6 py-3">Aprovados</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockCampaigns.map(c => (
                                <tr key={c.id} className="border-b border-border hover:bg-background">
                                    <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">{c.title}</td>
                                    <td className="px-6 py-4">{c.recipients}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span>{c.completion}%</span>
                                            <ProgressBar value={c.completion} colorClass="bg-blue-500" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span>{c.passed}%</span>
                                            <ProgressBar value={c.passed} colorClass="bg-success" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => onModuleChange('take-quiz', mockQuiz)} className="font-medium text-primary hover:underline">Ver Detalhes</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-primary">Módulos de Treinamento</h3>
                    <button onClick={() => onModuleChange('create-module')} className="text-sm bg-secondary hover:bg-secondary-hover text-primary font-semibold py-1.5 px-4 rounded-lg transition-colors">
                        + Criar Módulo
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-main uppercase bg-background">
                            <tr>
                                <th scope="col" className="px-6 py-3">Título do Módulo</th>
                                <th scope="col" className="px-6 py-3">Público-Alvo</th>
                                <th scope="col" className="px-6 py-3">Conteúdo</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockTrainingModules.map(m => (
                                <tr key={m.id} className="border-b border-border hover:bg-background">
                                    <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">{m.title}</td>
                                    <td className="px-6 py-4">{m.targetAudience}</td>
                                    <td className="px-6 py-4">{m.content.length} itens</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => onModuleChange('view-module', m)} className="font-medium text-primary hover:underline">Visualizar</button>
                                        <button onClick={() => addToast('Funcionalidade em desenvolvimento.', 'info')} className="font-medium text-primary hover:underline ml-4">Gerir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-primary">Planos de Ação</h3>
                    <button onClick={() => addToast('Funcionalidade em desenvolvimento.', 'info')} className="text-sm bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-1.5 px-4 rounded-lg transition-colors">
                        Criar Plano
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-main uppercase bg-background">
                            <tr>
                                <th scope="col" className="px-6 py-3">Colaborador</th>
                                <th scope="col" className="px-6 py-3">Quiz Associado</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockActionPlans.map(p => (
                                <tr key={p.id} className="border-b border-border hover:bg-background">
                                    <td className="px-6 py-4 font-medium text-text-main">{p.user}</td>
                                    <td className="px-6 py-4">{p.quiz}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.status === 'Em Progresso' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => addToast('Funcionalidade em desenvolvimento.', 'info')} className="font-medium text-primary hover:underline">Gerir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TrainingDashboard;
