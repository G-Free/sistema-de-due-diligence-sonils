import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie, TooltipProps } from 'recharts';
import { ModuleChangeProps, Entity, RiskLevel, ApprovalStatus, EntityType } from '../types';
import { mockEntities, mockApprovalQueue, mockCampaigns } from '../data/mockData';
import { WarningIcon } from '../components/icons/WarningIcon';

// --- Sub-componente Modal ---
interface ActionableAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: Entity | null;
  onModuleChange: (module: string, context?: any) => void;
}

const ActionableAlertModal: React.FC<ActionableAlertModalProps> = ({ isOpen, onClose, entity, onModuleChange }) => {
  if (!isOpen || !entity) return null;

  const problematicDocuments = entity.documents?.filter(d => d.status === 'Pendente' || d.status === 'Expirado') || [];

  const handleNavigation = (module: string, context?: any) => {
    onModuleChange(module, context);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6">
            <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-danger/10 sm:mx-0 sm:h-10 sm:w-10">
                    <WarningIcon className="h-6 w-6 text-danger" aria-hidden="true" />
                </div>
                <div className="ml-4 text-left">
                    <h3 className="text-lg leading-6 font-bold text-primary" id="modal-title">
                        Alerta de Documentação Crítica
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-text-secondary">
                            A entidade <strong className="text-text-main">{entity.name}</strong> possui documentos pendentes ou expirados que requerem atenção imediata.
                        </p>
                        <ul className="list-disc list-inside mt-2 text-sm text-text-secondary space-y-1">
                            {problematicDocuments.map(doc => (
                                <li key={doc.name}>
                                    {doc.name} (<span className={`font-semibold ${doc.status === 'Expirado' ? 'text-danger' : 'text-warning'}`}>{doc.status}</span>)
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div className="bg-background px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary sm:w-auto sm:text-sm"
            onClick={() => handleNavigation('report', entity)}
          >
            Ver Relatório Completo
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-border shadow-sm px-4 py-2 bg-card text-base font-medium text-text-main hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary sm:mt-0 sm:w-auto sm:text-sm"
            onClick={() => handleNavigation('documents')}
          >
            Gerir Documentos
          </button>
           <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-card text-base font-medium text-text-secondary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={() => handleNavigation('risk-assessment')}
          >
            Avaliar Risco
          </button>
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-card text-base font-medium text-text-secondary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 sm:mt-0 sm:w-auto sm:text-sm sm:mr-auto"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};


const PIE_COLORS = ['#FFDC00', '#111827', '#DA291C', '#6B7280', '#f59e0b', '#0EA5E9', '#8b5cf6'];

const approvalStatusMap: Record<ApprovalStatus, { label: string, color: string }> = {
    'Aguardando Revisão de Compliance': { label: 'Revisão Compliance', color: '#f59e0b' },
    'Aguardando Validação Técnica': { label: 'Validação Técnica', color: '#06b6d4' },
    'Aguardando Validação de Gestor': { label: 'Validação Gestor', color: '#f97316' },
    'Aguardando Aprovação Final': { label: 'Aprovação Final', color: '#0ea5e9' },
    'Aprovado': { label: 'Aprovado', color: '#16a34a' },
    'Rejeitado': { label: 'Rejeitado', color: '#DA291C' },
    'Mais Informação Necessária': { label: 'Info Pendente', color: '#8b5cf6' },
};

const CustomPieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-card p-2 border border-border rounded-md shadow-lg">
                <p className="text-sm text-text-main">{`${data.name}: ${data.value}`}</p>
            </div>
        );
    }
    return null;
};


const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-card p-5 rounded-lg shadow-sm border border-border">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        <p className="text-3xl font-bold mt-2 text-primary">{value}</p>
    </div>
);

const riskFillColor: Record<RiskLevel, string> = {
  [RiskLevel.Low]: '#16a34a',
  [RiskLevel.Medium]: '#f97316',
  [RiskLevel.High]: '#DA291C',
  [RiskLevel.Critical]: '#A91F16',
  [RiskLevel.Informational]: '#4ade80',
};

const riskEvolutionData = [
    { month: 'Jan', 'Alto Risco': 4, 'Risco Crítico': 1 },
    { month: 'Fev', 'Alto Risco': 5, 'Risco Crítico': 1 },
    { month: 'Mar', 'Alto Risco': 5, 'Risco Crítico': 2 },
    { month: 'Abr', 'Alto Risco': 6, 'Risco Crítico': 1 },
    { month: 'Mai', 'Alto Risco': 5, 'Risco Crítico': 1 },
    { month: 'Jun', 'Alto Risco': 4, 'Risco Crítico': 2 },
    { month: 'Jul', 'Alto Risco': 4, 'Risco Crítico': 1 },
];

const Reports: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
    
    const [alertModalEntity, setAlertModalEntity] = useState<Entity | null>(null);

    const handleOpenAlertModal = (entity: Entity) => {
        setAlertModalEntity(entity);
    };
    
    const riskByCountryData = useMemo(() => {
        const dataByCountry: Record<string, any> = {};

        mockEntities.forEach(entity => {
            if (!dataByCountry[entity.country]) {
                dataByCountry[entity.country] = { 
                    name: entity.country, 
                    [RiskLevel.Low]: 0,
                    [RiskLevel.Medium]: 0,
                    [RiskLevel.High]: 0,
                    [RiskLevel.Critical]: 0,
                    [RiskLevel.Informational]: 0,
                };
            }
            dataByCountry[entity.country][entity.riskLevel]++;
        });
        
        return Object.values(dataByCountry);
    }, [mockEntities]);

    const entitiesWithProblematicDocs = useMemo(() => {
        return mockEntities.map(entity => ({
                id: entity.id,
                entity: entity,
                name: entity.name,
                country: entity.country,
                count: entity.documents?.filter(d => d.status === 'Pendente' || d.status === 'Expirado').length || 0
            }))
            .filter(e => e.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [mockEntities]);
    
    const approvalStatusData = useMemo(() => {
        const counts = mockApprovalQueue.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {} as Record<ApprovalStatus, number>);

        return Object.entries(counts).map(([status, value]) => ({
            name: approvalStatusMap[status as ApprovalStatus].label,
            value,
            fill: approvalStatusMap[status as ApprovalStatus].color,
        }));
    }, []);
    
    const campaignEffectivenessData = useMemo(() => {
        return mockCampaigns.map(c => ({
            name: c.title.substring(0, 15) + (c.title.length > 15 ? '...' : ''),
            'Conclusão (%)': c.completion,
            'Aprovados (%)': c.passed,
        }));
    }, []);

    const entityTypeData = useMemo(() => {
        const counts = mockEntities.reduce((acc, entity) => {
            acc[entity.entityType] = (acc[entity.entityType] || 0) + 1;
            return acc;
        }, {} as Record<EntityType, number>);

        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
        }));
    }, []);


  return (
    <>
    <ActionableAlertModal
        isOpen={!!alertModalEntity}
        onClose={() => setAlertModalEntity(null)}
        entity={alertModalEntity}
        onModuleChange={onModuleChange}
    />
    <div className="space-y-8 animate-fade-in">
        <div>
            <h1 className="text-2xl font-bold text-text-main">Relatórios e Análises</h1>
            <p className="text-text-secondary mt-1">Visualizações de dados para apoiar a tomada de decisão estratégica.</p>
        </div>
        
        <section>
            <h2 className="text-xl font-semibold text-primary mb-4">Indicadores Chave</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Risco Médio (Global)" value="Médio" />
                <StatCard title="Entidades por Reavaliar" value="12" />
                <StatCard title="Tempo Médio de Aprovação" value="3.5 dias" />
                <StatCard title="Taxa de Rejeição" value="8%" />
            </div>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-primary mb-4">Análise de Operações e Compliance</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                    <h3 className="text-lg font-semibold text-text-main mb-4">Estado Atual da Fila de Aprovação</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={approvalStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110}>
                                    {approvalStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                                <Legend iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                    <h3 className="text-lg font-semibold text-text-main mb-4">Eficácia das Campanhas de Treinamento</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={campaignEffectivenessData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                                <YAxis stroke="#6B7280" fontSize={12} unit="%" />
                                <Tooltip wrapperClassName="!border-border !bg-card !shadow-lg" cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}/>
                                <Legend iconSize={10} />
                                <Bar dataKey="Conclusão (%)" fill="#111827" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Aprovados (%)" fill="#FFDC00" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </section>

        <section>
             <h2 className="text-xl font-semibold text-primary mb-4">Perfil da Base de Entidades e Risco</h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                    <h3 className="text-lg font-semibold text-text-main mb-4">Distribuição de Entidades por Tipo</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={entityTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110}>
                                    {entityTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                                <Legend iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                    <h3 className="text-lg font-semibold text-text-main mb-4">Distribuição de Risco por País</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={riskByCountryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                                <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} />
                                <Tooltip wrapperClassName="!border-border !bg-card !shadow-lg" cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}/>
                                <Legend iconSize={10} />
                                <Bar dataKey={RiskLevel.Low} stackId="a" name="Baixo" fill={riskFillColor.Baixo} />
                                <Bar dataKey={RiskLevel.Medium} stackId="a" name="Médio" fill={riskFillColor.Médio} />
                                <Bar dataKey={RiskLevel.High} stackId="a" name="Alto" fill={riskFillColor.Alto} />
                                <Bar dataKey={RiskLevel.Critical} stackId="a" name="Crítico" fill={riskFillColor.Crítico} />
                                <Bar dataKey={RiskLevel.Informational} stackId="a" name="Informativo" fill={riskFillColor.Informativo} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
             </div>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-primary mb-4">Análise Temporal e Alertas</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                    <h3 className="text-lg font-semibold text-text-main mb-4">Evolução do Risco (Últimos 7 Meses)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                        <AreaChart data={riskEvolutionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                                <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} />
                                <Tooltip wrapperClassName="!border-border !bg-card !shadow-lg" />
                                <Legend iconSize={10} />
                                <defs>
                                    <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={riskFillColor.Alto} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={riskFillColor.Alto} stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={riskFillColor.Crítico} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={riskFillColor.Crítico} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="Alto Risco" stroke={riskFillColor.Alto} fill="url(#colorHigh)" strokeWidth={2} />
                                <Area type="monotone" dataKey="Risco Crítico" stroke={riskFillColor.Crítico} fill="url(#colorCritical)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                    <h3 className="text-lg font-semibold text-text-main mb-4">Top 5 Entidades com Documentos Pendentes/Expirados</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs text-text-secondary uppercase bg-background">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-semibold">Nome da Entidade</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">País</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Nº de Documentos</th>
                                    <th scope="col" className="px-6 py-4 font-semibold text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {entitiesWithProblematicDocs.map((item) => (
                                    <tr key={item.id} className="hover:bg-background">
                                        <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">{item.name}</td>
                                        <td className="px-6 py-4">{item.country}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-danger">{item.count}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleOpenAlertModal(item.entity)} className="font-medium text-primary hover:underline">
                                                Analisar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {entitiesWithProblematicDocs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center p-6 text-text-secondary">Nenhuma entidade com documentos pendentes.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>

    </div>
    </>
  );
};

export default Reports;