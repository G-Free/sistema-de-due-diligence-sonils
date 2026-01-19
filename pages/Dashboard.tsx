import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area, TooltipProps } from 'recharts';
import { ModuleChangeProps, RiskLevel, Entity, DocumentStatus, ApprovalStatus } from '../types';
import { mockEntities, mockApprovalQueue, mockCampaigns, mockTrainingModules, mockActionPlans } from '../data/mockData';
import { ExportIcon } from '../components/icons/ExportIcon';
import EntityDetailModal from '../components/EntityDetailModal';
import { PowerBiIcon } from '../components/icons/PowerBiIcon';
import { useToast } from '../components/useToast';
import { nifDatabase } from '../services/validationService';

const PIE_COLORS = ['#FFDC00', '#111827', '#DA291C', '#6B7280', '#f59e0b', '#0EA5E9'];

const riskColorMap: Record<RiskLevel, string> = {
  [RiskLevel.Low]: 'bg-success/10 text-success',
  [RiskLevel.Medium]: 'bg-warning/10 text-warning',
  [RiskLevel.High]: 'bg-danger/10 text-danger',
  [RiskLevel.Critical]: 'bg-red-900/20 text-red-500',
  [RiskLevel.Informational]: 'bg-info/10 text-info',
};

const riskFillColor: Record<RiskLevel, string> = {
  [RiskLevel.Low]: '#16a34a', // success
  [RiskLevel.Medium]: '#f59e0b', // warning
  [RiskLevel.High]: '#DA291C', // danger
  [RiskLevel.Critical]: '#B91C1C', // danger-hover
  [RiskLevel.Informational]: '#0ea5e9', // info
};


const documentStatusMap: Record<DocumentStatus, { label: string, color: string }> = {
    'Verificado': { label: 'Verificado', color: '#16a34a' }, // success
    'Pendente': { label: 'Pendente', color: '#f59e0b' }, // warning
    'Expirado': { label: 'Expirado', color: '#DA291C' }, // danger
    'Recebido': { label: 'Recebido', color: '#0ea5e9' }, // info
};

const approvalStatusMap: Record<ApprovalStatus, { label: string, color: string }> = {
    'Aguardando Revisão de Compliance': { label: 'Revisão Compliance', color: '#f59e0b' }, // warning
    'Aguardando Validação Técnica': { label: 'Validação Técnica', color: '#f59e0b' }, // warning
    'Aguardando Validação de Gestor': { label: 'Validação Gestor', color: '#f59e0b' }, // warning
    'Aguardando Aprovação Final': { label: 'Aprovação Final', color: '#0ea5e9' }, // info
    'Aprovado': { label: 'Aprovado', color: '#16a34a' }, // success
    'Rejeitado': { label: 'Rejeitado', color: '#DA291C' }, // danger
    'Mais Informação Necessária': { label: 'Info Pendente', color: '#6B7280' }, // text-secondary
};


const StatCard: React.FC<{ title: string; value: string | number; description?: string; }> = ({ title, value, description }) => {
    return (
        <div className="bg-card p-5 rounded-xl shadow-md">
            <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
            <p className="text-3xl font-bold mt-2 text-primary">{value}</p>
            {description && (
                <p className="text-xs text-text-secondary mt-1">{description}</p>
            )}
        </div>
    );
};

const CustomPieTooltip = ({ active, payload, total }: TooltipProps<number, string> & { total: number }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const percent = total > 0 ? ((data.value! / total) * 100).toFixed(1) : 0;
        return (
            <div className="bg-card p-2 border border-border rounded-md shadow-lg">
                <p className="text-sm text-text-main">{`${data.name}: ${data.value} (${percent}%)`}</p>
            </div>
        );
    }
    return null;
};

const Dashboard: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
  const [period, setPeriod] = useState('all');
  const [category, setCategory] = useState('all');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEntityForModal, setSelectedEntityForModal] = useState<Entity | null>(null);
  const { addToast } = useToast();

  const filteredEntities = useMemo(() => {
    const now = new Date();
    return mockEntities.filter(entity => {
      const categoryMatch = category === 'all' || entity.category === category;
      
      let periodMatch = false;
      if (period === 'all') {
        periodMatch = true;
      } else {
        const entityDate = new Date(entity.onboardingDate);
        const diffTime = Math.abs(now.getTime() - entityDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (period === '30d') periodMatch = diffDays <= 30;
        else if (period === '90d') periodMatch = diffDays <= 90;
        else if (period === '1y') periodMatch = diffDays <= 365;
      }

      return categoryMatch && periodMatch;
    });
  }, [period, category]);
  
  const handleViewDetails = (entity: Entity) => {
    setSelectedEntityForModal(entity);
    setIsDetailModalOpen(true);
  };

  const highRiskOrCriticalEntities = useMemo(() => {
      return filteredEntities
        .filter(e => e.riskLevel === RiskLevel.High || e.riskLevel === RiskLevel.Critical)
        .sort((a,b) => (a.riskLevel === RiskLevel.Critical ? -1 : 1))
        .slice(0, 10);
  }, [filteredEntities]);


  // --- DATA FOR CHARTS (OPTIMIZED WITH useMemo) ---

  const riskDistributionData = useMemo(() => [
    { name: RiskLevel.Low, count: filteredEntities.filter(e => e.riskLevel === RiskLevel.Low).length, fill: riskFillColor.Baixo },
    { name: RiskLevel.Medium, count: filteredEntities.filter(e => e.riskLevel === RiskLevel.Medium).length, fill: riskFillColor.Médio },
    { name: RiskLevel.High, count: filteredEntities.filter(e => e.riskLevel === RiskLevel.High).length, fill: riskFillColor.Alto },
    { name: RiskLevel.Critical, count: filteredEntities.filter(e => e.riskLevel === RiskLevel.Critical).length, fill: riskFillColor.Crítico },
    { name: RiskLevel.Informational, count: filteredEntities.filter(e => e.riskLevel === RiskLevel.Informational).length, fill: riskFillColor.Informativo },
  ], [filteredEntities]);

  const entitiesByCategory = useMemo(() => filteredEntities.reduce((acc, entity) => {
    acc[entity.category] = (acc[entity.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>), [filteredEntities]);

  const categoryPieData = useMemo(() => Object.entries(entitiesByCategory).map(([name, value]) => ({ name, value })), [entitiesByCategory]);
  
  const allDocuments = useMemo(() => filteredEntities.flatMap(e => e.documents || []), [filteredEntities]);
  
  const documentStatusCounts = useMemo(() => allDocuments.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
  }, {} as Record<DocumentStatus, number>), [allDocuments]);
  
  const documentPieData = useMemo(() => Object.entries(documentStatusCounts).map(([status, count]) => ({
      name: documentStatusMap[status as DocumentStatus].label,
      value: count,
      fill: documentStatusMap[status as DocumentStatus].color,
  })), [documentStatusCounts]);

  const riskBySectorData = useMemo(() => {
    return Object.entries(entitiesByCategory).map(([sector, _]) => {
      const sectorEntities = filteredEntities.filter(e => e.category === sector);
      return {
          name: sector,
          [RiskLevel.Low]: sectorEntities.filter(e => e.riskLevel === RiskLevel.Low).length,
          [RiskLevel.Medium]: sectorEntities.filter(e => e.riskLevel === RiskLevel.Medium).length,
          [RiskLevel.High]: sectorEntities.filter(e => e.riskLevel === RiskLevel.High).length,
          [RiskLevel.Critical]: sectorEntities.filter(e => e.riskLevel === RiskLevel.Critical).length,
          [RiskLevel.Informational]: sectorEntities.filter(e => e.riskLevel === RiskLevel.Informational).length,
      }
    });
  }, [entitiesByCategory, filteredEntities]);

  const expiringDocsData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() + i);
        return d;
    });
    return months.map(month => {
        const monthStr = month.toLocaleString('default', { month: 'short' });
        const count = allDocuments.filter(doc => {
            if (!doc.expiryDate) return false;
            const expiry = new Date(doc.expiryDate);
            return expiry.getFullYear() === month.getFullYear() && expiry.getMonth() === month.getMonth();
        }).length;
        return { name: monthStr, Vencimentos: count };
    });
  }, [allDocuments]);

  const entitiesWithCriticalDocs = useMemo(() => {
    return filteredEntities.filter(e => e.documents?.some(d => d.status === 'Pendente' || d.status === 'Expirado'));
  }, [filteredEntities]);

  const approvalQueueData = useMemo(() => {
    const counts = mockApprovalQueue.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
    }, {} as Record<ApprovalStatus, number>);

    return Object.entries(counts).map(([status, count]) => ({
        name: approvalStatusMap[status as ApprovalStatus].label,
        count,
        fill: approvalStatusMap[status as ApprovalStatus].color,
    }));
  }, []);
  
  const campaignsData = useMemo(() => mockCampaigns.map(c => ({
        name: c.title.substring(0, 20) + (c.title.length > 20 ? '...' : ''),
        Conclusão: c.completion,
  })), []);
  
  const pendingActionPlans = useMemo(() => mockActionPlans.filter(p => p.status === 'Pendente' || p.status === 'Em Progresso'), []);
  
  
  // STATS & TOTALS FOR CHARTS
  const highRiskOrCriticalCount = useMemo(() => 
    (riskDistributionData.find(d => d.name === RiskLevel.High)?.count || 0) + 
    (riskDistributionData.find(d => d.name === RiskLevel.Critical)?.count || 0), 
  [riskDistributionData]);

  const ongoingAssessments = useMemo(() => mockApprovalQueue.filter(item => item.status !== 'Aprovado' && item.status !== 'Rejeitado').length, []);
    
  const validNifPercentage = useMemo(() => {
    if (filteredEntities.length === 0) {
        return 0;
    }
    const validNifCount = filteredEntities.filter(e => nifDatabase.hasOwnProperty(e.nif)).length;
    return (validNifCount / filteredEntities.length) * 100;
  }, [filteredEntities]);
  
  const totalEntities = filteredEntities.length;
  const totalDocuments = allDocuments.length;
  
  const handleExportExcel = () => {
    addToast('A gerar o seu relatório Excel...', 'info');

    const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return '';
        let str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            str = `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const arrayToCsv = (data: any[], title: string): string => {
        if (!data || data.length === 0) return `\n${title}\nNenhum dado disponível.\n`;
        const headers = Object.keys(data[0]);
        const headerRow = headers.map(escapeCSV).join(',');
        const rows = data.map(item => headers.map(header => escapeCSV(item[header])).join(','));
        return [`\n${title}`, headerRow, ...rows].join('\n');
    };

    const kpiData = [
        { Indicador: 'Total de Entidades', Valor: filteredEntities.length },
        { Indicador: 'Risco Alto & Crítico', Valor: highRiskOrCriticalCount },
        { Indicador: 'Avaliações em Andamento', Valor: ongoingAssessments },
        { Indicador: 'Documentos Pendentes', Valor: documentStatusCounts['Pendente'] || 0 },
        { Indicador: "NIFs Válidos (%)", Valor: validNifPercentage.toFixed(0) },
    ];

    let csvContent = `Relatório do Dashboard de Análise de Risco - Gerado em ${new Date().toLocaleString('pt-PT')}\n`;
    csvContent += arrayToCsv(kpiData, 'Indicadores Chave');
    csvContent += arrayToCsv(riskDistributionData.map(({fill, ...rest}) => rest), '\nDistribuição de Risco Geral');
    csvContent += arrayToCsv(categoryPieData, '\nDistribuição de Entidades por Categoria');
    csvContent += arrayToCsv(approvalQueueData.map(({fill, ...rest}) => rest), '\nEstado da Fila de Aprovação');
    csvContent += arrayToCsv(riskBySectorData, '\nDistribuição de Risco por Setor');
    csvContent += arrayToCsv(highRiskOrCriticalEntities.map(({id, name, category, country, riskLevel}) => ({id, name, category, country, riskLevel})), '\nTop 10 Entidades de Risco Alto & Crítico');
    csvContent += arrayToCsv(documentPieData.map(({fill, ...rest}) => rest), '\nEstado Geral dos Documentos');
    csvContent += arrayToCsv(expiringDocsData, '\nVencimento de Documentos (Próximos 6 meses)');
    csvContent += arrayToCsv(campaignsData, '\nProgresso das Campanhas de Treinamento');
    csvContent += arrayToCsv(pendingActionPlans, '\nPlanos de Ação Pendentes');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_dashboard_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToast('Relatório exportado com sucesso!', 'success');
};


  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-main">Dashboard de Análise de Risco</h1>
            <p className="text-text-secondary mt-1">Visão 360º sobre risco, compliance e performance.</p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <button onClick={() => addToast('Funcionalidade em desenvolvimento.', 'info', 'Power BI')} className="flex items-center gap-2 bg-secondary text-primary font-semibold py-2 px-3 rounded-lg text-sm hover:bg-secondary-hover transition-colors">
                <PowerBiIcon className="w-4 h-4" />
                <span>Ver no Power BI</span>
            </button>
             <button onClick={handleExportExcel} className="flex items-center gap-2 bg-card border border-border text-text-main font-semibold py-2 px-3 rounded-lg text-sm hover:bg-background transition-colors">
                <ExportIcon className="w-4 h-4" />
                <span>Exportar Excel</span>
            </button>
            <button onClick={() => addToast('Simulando exportação para PDF...', 'info', 'Exportar')} className="flex items-center gap-2 bg-card border border-border text-text-main font-semibold py-2 px-3 rounded-lg text-sm hover:bg-background transition-colors">
                <ExportIcon className="w-4 h-4" />
                <span>Exportar PDF</span>
            </button>
          </div>
      </div>
      
      <div className="bg-card p-4 rounded-xl shadow-md flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-text-secondary">Período:</label>
            <select value={period} onChange={e => setPeriod(e.target.value)} className="bg-background border-border border rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary">
                <option value="all">Desde Sempre</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último Ano</option>
            </select>
        </div>
         <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-text-secondary">Categoria:</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="bg-background border-border border rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary">
                <option value="all">Todas as Categorias</option>
                {[...new Set(mockEntities.map(e => e.category))].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
      </div>
      
      {/* SECTION: VISÃO GERAL */}
      <section>
        <h2 className="text-xl font-semibold text-primary mb-4">Visão Geral</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard title="Total de Entidades" value={filteredEntities.length} />
            <StatCard title="Risco Alto & Crítico" value={highRiskOrCriticalCount} />
            <StatCard title="Avaliações em Andamento" value={ongoingAssessments} />
            <StatCard title="Documentos Pendentes" value={documentStatusCounts['Pendente']?.toString() || '0'} />
            <StatCard title="NIFs Válidos" value={`${validNifPercentage.toFixed(0)}%`} description="Entidades com NIF verificado" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-card p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-text-main mb-4">Distribuição de Entidades por Categoria</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={categoryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} isAnimationActive={true}>
                                {categoryPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip total={totalEntities} />} />
                            <Legend iconSize={10} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-md">
                 <h3 className="text-lg font-semibold text-text-main mb-4">Distribuição de Risco Geral</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                    <BarChart data={riskDistributionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} />
                        <Tooltip wrapperClassName="!border-border !bg-card !shadow-lg" cursor={{fill: 'rgba(0, 0, 0, 0.05)'}} />
                        <Bar dataKey="count" name="Entidades" radius={[4, 4, 0, 0]}>
                            {riskDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} /> )}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </section>

      {/* SECTION: INDICADORES DE RISCO */}
      <section>
         <h2 className="text-xl font-semibold text-primary mb-4">Indicadores de Risco</h2>
         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-card p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-text-main mb-4">Distribuição de Risco por Setor de Atividade</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={riskBySectorData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6B7280" fontSize={10} interval={0} angle={-20} textAnchor="end" height={50} />
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
            <div className="lg:col-span-2 bg-card p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-text-main mb-4">Top 10 Entidades de Risco Alto & Crítico</h3>
                <div className="overflow-x-auto max-h-[280px]">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-background sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-2 font-semibold">Nome</th>
                                <th scope="col" className="px-4 py-2 font-semibold">Categoria</th>
                                <th scope="col" className="px-4 py-2 font-semibold">País</th>
                                <th scope="col" className="px-4 py-2 font-semibold">Risco</th>
                                <th scope="col" className="px-4 py-2 font-semibold text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {highRiskOrCriticalEntities.map((entity) => (
                                <tr key={entity.id} className="hover:bg-background">
                                    <td className="px-4 py-2 font-medium text-text-main whitespace-nowrap">{entity.name}</td>
                                    <td className="px-4 py-2">{entity.category}</td>
                                    <td className="px-4 py-2">{entity.country}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${riskColorMap[entity.riskLevel]}`}>
                                            {entity.riskLevel}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => handleViewDetails(entity)} className="font-medium text-primary hover:underline">Ver Detalhes</button>
                                    </td>
                                </tr>
                            ))}
                            {highRiskOrCriticalEntities.length === 0 && (
                                <tr><td colSpan={5} className="text-center p-4">Nenhuma entidade de risco alto ou crítico encontrada.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
         </div>
      </section>

      {/* SECTION: COMPLIANCE E DOCUMENTAÇÃO */}
      <section>
          <h2 className="text-xl font-semibold text-primary mb-4">Compliance e Documentação</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-text-main mb-4">Estado Geral dos Documentos</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={documentPieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" nameKey="name" paddingAngle={5} isAnimationActive={true}>
                                {documentPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip total={totalDocuments} />} />
                            <Legend iconSize={10} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-text-main mb-4">Vencimento de Documentos (Próximos 6 meses)</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart data={expiringDocsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorVencimentos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={'#FFDC00'} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={'#FFDC00'} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                            <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} />
                            <Tooltip wrapperClassName="!border-border !bg-card !shadow-lg" />
                            <Legend iconSize={10} />
                            <Area type="monotone" dataKey="Vencimentos" stroke={'#FFDC00'} fillOpacity={1} fill="url(#colorVencimentos)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="lg:col-span-2 bg-card p-6 rounded-xl shadow-md">
                 <h3 className="text-lg font-semibold text-text-main mb-4">Entidades com Documentos Críticos Pendentes</h3>
                 <div className="overflow-x-auto max-h-60">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-background sticky top-0">
                            <tr>
                                <th scope="col" className="px-4 py-2 font-semibold">Nome da Entidade</th>
                                <th scope="col" className="px-4 py-2 font-semibold">País</th>
                                <th scope="col" className="px-4 py-2 font-semibold">Documento</th>
                                <th scope="col" className="px-4 py-2 font-semibold">Estado</th>
                                <th scope="col" className="px-4 py-2 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {entitiesWithCriticalDocs.map((entity) => (
                                entity.documents?.filter(d => d.status === 'Pendente' || d.status === 'Expirado').map(doc => (
                                    <tr key={`${entity.id}-${doc.name}`} className="hover:bg-background">
                                        <td className="px-4 py-2 font-medium text-text-main whitespace-nowrap">{entity.name}</td>
                                        <td className="px-4 py-2">{entity.country}</td>
                                        <td className="px-4 py-2">{doc.name}</td>
                                        <td className="px-4 py-2">
                                            <span className={`font-semibold ${doc.status === 'Pendente' ? 'text-warning' : 'text-danger'}`}>{doc.status}</span>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <button onClick={() => handleViewDetails(entity)} className="font-medium text-primary hover:underline">Ver Entidade</button>
                                        </td>
                                    </tr>
                                ))
                            ))}
                            {entitiesWithCriticalDocs.length === 0 && (
                                <tr><td colSpan={5} className="text-center p-4">Nenhuma entidade com documentos pendentes ou expirados.</td></tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>
          </div>
      </section>

      {/* SECTION: OPERAÇÕES E TREINAMENTO */}
      <section>
          <h2 className="text-xl font-semibold text-primary mb-4">Operações e Treinamento</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold text-text-main mb-4">Estado da Fila de Aprovação</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={approvalQueueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6B7280" fontSize={10} interval={0} angle={-20} textAnchor="end" height={50} />
                            <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} />
                            <Tooltip wrapperClassName="!border-border !bg-card !shadow-lg" cursor={{fill: 'rgba(0, 0, 0, 0.05)'}} />
                            <Bar dataKey="count" name="Solicitações" radius={[4, 4, 0, 0]}>
                                {approvalQueueData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} /> )}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold text-text-main mb-4">Progresso das Campanhas de Treinamento</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={campaignsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                            <YAxis stroke="#6B7280" fontSize={12} unit="%" />
                            <Tooltip wrapperClassName="!border-border !bg-card !shadow-lg" cursor={{fill: 'rgba(0, 0, 0, 0.05)'}} />
                            <Legend iconSize={10} />
                            <Bar dataKey="Conclusão" fill={'#FFDC00'} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
              <div className="lg:col-span-2 bg-card p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-text-main mb-4">Módulos e Ações Pendentes de Treinamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-4">
                        <StatCard title="Módulos de Treinamento" value={mockTrainingModules.length} description="Total de módulos disponíveis." />
                    </div>
                    <div className="md:col-span-2">
                        <h4 className="font-semibold text-text-secondary mb-2">Planos de Ação Pendentes</h4>
                        <div className="overflow-x-auto max-h-40 border border-border rounded-lg">
                             <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs text-text-secondary uppercase bg-background sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 font-semibold">Colaborador</th>
                                        <th scope="col" className="px-4 py-2 font-semibold">Quiz</th>
                                        <th scope="col" className="px-4 py-2 font-semibold">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {pendingActionPlans.map((plan) => (
                                        <tr key={plan.id} className="hover:bg-background">
                                            <td className="px-4 py-2 font-medium text-text-main">{plan.user}</td>
                                            <td className="px-4 py-2">{plan.quiz}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${plan.status === 'Em Progresso' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'}`}>
                                                    {plan.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {pendingActionPlans.length === 0 && (
                                        <tr><td colSpan={3} className="text-center p-4">Nenhum plano de ação pendente.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
              </div>
          </div>
      </section>
      
      <EntityDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        entity={selectedEntityForModal}
      />
    </div>
  );
};

export default Dashboard;