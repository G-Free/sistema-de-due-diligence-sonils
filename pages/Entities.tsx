import React, { useState, useMemo } from 'react';
import { ModuleChangeProps, Entity, RiskLevel, LegalStatus, EntityType } from '../types';
import { mockEntities } from '../data/mockData';
import { ExportIcon } from '../components/icons/ExportIcon';
import StatusChangeModal from '../components/StatusChangeModal';
import EntityDetailModal from '../components/EntityDetailModal';
import { BuildingIcon } from '../components/icons/BuildingIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { SlidersIcon } from '../components/icons/SlidersIcon';
import { EditIcon } from '../components/icons/EditIcon';
import { useToast } from '../components/useToast';
import { AuditLogIcon } from '../components/icons/AuditLogIcon';

const riskColorMap: Record<RiskLevel, string> = {
  [RiskLevel.Low]: 'bg-success/10 text-success',
  [RiskLevel.Medium]: 'bg-warning/10 text-warning',
  [RiskLevel.High]: 'bg-danger/10 text-danger',
  [RiskLevel.Critical]: 'bg-red-900/20 text-red-500',
  [RiskLevel.Informational]: 'bg-green-100 text-green-800',
};

const statusColorMap: Record<LegalStatus, string> = {
    [LegalStatus.Active]: 'bg-success',
    [LegalStatus.Suspended]: 'bg-warning',
    [LegalStatus.InLiquidation]: 'bg-gray-500',
};

const Entities: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
    const [entities, setEntities] = useState(mockEntities);
    const [searchTerm, setSearchTerm] = useState('');
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedEntityForStatus, setSelectedEntityForStatus] = useState<Entity | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedEntityForModal, setSelectedEntityForModal] = useState<Entity | null>(null);
    const { addToast } = useToast();
    
    // New filter states
    const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<LegalStatus | 'all'>('all');
    const [countryFilter, setCountryFilter] = useState<string | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');


    const uniqueCountries = useMemo(() => [...new Set(mockEntities.map(e => e.country))], []);
    const uniqueCategories = useMemo(() => [...new Set(mockEntities.map(e => e.category))], []);

    const filteredEntities = useMemo(() => {
        return entities.filter(e => {
            const searchTermLower = searchTerm.toLowerCase();
            const searchMatch =
                e.name.toLowerCase().includes(searchTermLower) ||
                e.nif.toLowerCase().includes(searchTermLower);

            const riskMatch = riskFilter === 'all' || e.riskLevel === riskFilter;
            const statusMatch = statusFilter === 'all' || e.status === statusFilter;
            const countryMatch = countryFilter === 'all' || e.country === countryFilter;
            const typeMatch = typeFilter === 'all' || e.entityType === typeFilter;
            const categoryMatch = categoryFilter === 'all' || e.category === categoryFilter;


            return searchMatch && riskMatch && statusMatch && countryMatch && typeMatch && categoryMatch;
        });
    }, [entities, searchTerm, riskFilter, statusFilter, countryFilter, typeFilter, categoryFilter]);


    const handleOpenStatusModal = (entity: Entity) => {
        setSelectedEntityForStatus(entity);
        setIsStatusModalOpen(true);
    };

    const handleStatusSave = (entityId: string, newStatus: LegalStatus, justification: string) => {
        const updateUserAndState = (entitiesList: Entity[]) => {
            return entitiesList.map(entity => {
                if (entity.id === entityId) {
                    const newLogEntry = {
                        user: 'Utilizador Atual', // Hardcoded for now
                        date: new Date().toISOString().split('T')[0],
                        previousStatus: entity.status,
                        newStatus: newStatus,
                        justification: justification,
                    };
                    
                    const updatedLog = entity.statusLog ? [...entity.statusLog, newLogEntry] : [newLogEntry];
                    
                    return { 
                        ...entity, 
                        status: newStatus, 
                        legalStatusComment: justification,
                        statusLog: updatedLog 
                    };
                }
                return entity;
            });
        };
    
        setEntities(prevEntities => updateUserAndState(prevEntities));
        
        // Also update the source mock data for persistence across navigation
        const entityIndexInMock = mockEntities.findIndex(e => e.id === entityId);
        if (entityIndexInMock > -1) {
            const entityToUpdate = mockEntities[entityIndexInMock];
            const newLogEntry = {
                user: 'Utilizador Atual',
                date: new Date().toISOString().split('T')[0],
                previousStatus: entityToUpdate.status,
                newStatus: newStatus,
                justification: justification,
            };
            const updatedLog = entityToUpdate.statusLog ? [...entityToUpdate.statusLog, newLogEntry] : [newLogEntry];
    
            mockEntities[entityIndexInMock] = {
                ...entityToUpdate,
                status: newStatus,
                legalStatusComment: justification,
                statusLog: updatedLog
            };
        }
        addToast('Estado da entidade alterado com sucesso!', 'success');
    };
    
    const handleViewDetails = (entity: Entity) => {
        setSelectedEntityForModal(entity);
        setIsDetailModalOpen(true);
    };

    const handleExportCSV = () => {
        if (filteredEntities.length === 0) {
            addToast('Nenhuma entidade para exportar.', 'warning', 'Exportar CSV');
            return;
        }
        addToast('A gerar o ficheiro CSV...', 'info', 'Exportar');

        const headers = [
            "ID", "Nome da Entidade", "Tipo", "NIF", "Registo Comercial",
            "País", "Categoria", "Nível de Risco", "Estado Legal", "Data de Onboarding",
            "Beneficiário Efetivo", "Endereço", "Nome do Contacto", "Email do Contacto",
            "Telefone do Contacto", "Website", "LinkedIn", "Serviços"
        ];

        const escapeCSV = (value: any): string => {
            if (value === null || value === undefined) return '';
            let str = String(value);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                str = `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const rows = filteredEntities.map(e => [
            e.id, e.name, e.entityType, e.nif, e.commercialRegistration, e.country, e.category,
            e.riskLevel, e.status, e.onboardingDate, e.beneficialOwner, e.address, e.contact.name,
            e.contact.email, e.contact.phone, e.contact.website || '', e.contact.linkedIn || '',
            e.services.join('; ')
        ].map(escapeCSV).join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute("href", url);
        link.setAttribute("download", `export_entidades_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


  return (
    <>
    <StatusChangeModal 
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        entity={selectedEntityForStatus}
        onSave={handleStatusSave}
    />
    <EntityDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        entity={selectedEntityForModal}
    />
    <div className="bg-card p-6 rounded-xl shadow-md animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-bold text-text-main mb-4 sm:mb-0">Base de Dados de Entidades</h2>
            <div className="flex items-center gap-2">
                 <button onClick={() => onModuleChange('entity-history')} className="flex items-center gap-2 bg-card border border-border text-text-main font-semibold py-2 px-3 rounded-lg text-sm hover:bg-background transition-colors">
                    <AuditLogIcon className="w-4 h-4" />
                    <span>Histórico</span>
                </button>
                <button onClick={() => addToast('Simulando exportação para Excel...', 'info', 'Exportar')} className="flex items-center gap-2 bg-card border border-border text-text-main font-semibold py-2 px-3 rounded-lg text-sm hover:bg-background transition-colors">
                    <ExportIcon className="w-4 h-4" />
                    <span>Excel</span>
                </button>
                <button onClick={() => addToast('Simulando exportação para PDF...', 'info', 'Exportar')} className="flex items-center gap-2 bg-card border border-border text-text-main font-semibold py-2 px-3 rounded-lg text-sm hover:bg-background transition-colors">
                    <ExportIcon className="w-4 h-4" />
                    <span>PDF</span>
                </button>
                <button onClick={handleExportCSV} className="flex items-center gap-2 bg-card border border-border text-text-main font-semibold py-2 px-3 rounded-lg text-sm hover:bg-background transition-colors">
                    <ExportIcon className="w-4 h-4" />
                    <span>CSV</span>
                </button>
                <button onClick={() => onModuleChange('new-entity')} className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    + Adicionar Entidade
                </button>
            </div>
        </div>

        <div className="bg-background p-4 rounded-lg border border-border mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="sm:col-span-2">
                    <input 
                        type="text" 
                        placeholder="Pesquisar por nome ou NIF..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
                    />
                </div>
                 <div>
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value as EntityType | 'all')}
                        className="w-full bg-card border-border border rounded-lg p-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                        aria-label="Filtrar por Tipo de Entidade"
                    >
                        <option value="all">Todos os Tipos</option>
                        {Object.values(EntityType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div>
                    <select
                        value={countryFilter}
                        onChange={e => setCountryFilter(e.target.value)}
                        className="w-full bg-card border-border border rounded-lg p-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                        aria-label="Filtrar por País"
                    >
                        <option value="all">Todos os Países</option>
                        {uniqueCountries.map(country => <option key={country} value={country}>{country}</option>)}
                    </select>
                </div>
                 <div>
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="w-full bg-card border-border border rounded-lg p-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                        aria-label="Filtrar por Categoria"
                    >
                        <option value="all">Todas as Categorias</option>
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <select
                        value={riskFilter}
                        onChange={e => setRiskFilter(e.target.value as RiskLevel | 'all')}
                        className="w-full bg-card border-border border rounded-lg p-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                        aria-label="Filtrar por Nível de Risco"
                    >
                        <option value="all">Todos os Riscos</option>
                        {Object.values(RiskLevel).map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                </div>
                <div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as LegalStatus | 'all')}
                        className="w-full bg-card border-border border rounded-lg p-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary transition-colors"
                        aria-label="Filtrar por Estado Legal"
                    >
                        <option value="all">Todos os Estados</option>
                        {Object.values(LegalStatus).map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
            </div>
        </div>
       
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-text-secondary">
                <thead className="text-xs text-text-secondary uppercase bg-background">
                    <tr>
                        <th scope="col" className="px-6 py-4 font-semibold">Nome da Entidade</th>
                        <th scope="col" className="px-6 py-4 font-semibold">País</th>
                        <th scope="col" className="px-6 py-4 font-semibold">Categoria</th>
                        <th scope="col" className="px-6 py-4 font-semibold">Nível de Risco</th>
                        <th scope="col" className="px-6 py-4 font-semibold">Estado Legal</th>
                        <th scope="col" className="px-6 py-4 font-semibold text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {filteredEntities.map((entity) => (
                        <tr key={entity.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap group relative">
                                <div className="flex items-center gap-3">
                                     {entity.entityType === EntityType.PrivateCompany || entity.entityType === EntityType.PublicEntity || entity.entityType === EntityType.NGO ? (
                                        <BuildingIcon className="w-5 h-5 text-text-secondary shrink-0" />
                                    ) : (
                                        <UserIcon className="w-5 h-5 text-text-secondary shrink-0" />
                                    )}
                                    <span className="cursor-default">{entity.name}</span>
                                </div>
                                <div className="absolute left-0 top-full mt-2 w-72 p-4 bg-card border border-border text-text-main text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none transform translate-y-1">
                                    <h4 className="font-bold text-base text-primary mb-3 border-b border-border pb-2">{entity.name}</h4>
                                    <div className="space-y-1.5 text-xs">
                                        <p><strong className="font-semibold text-text-secondary">Tipo:</strong> {entity.entityType}</p>
                                        <p><strong className="font-semibold text-text-secondary">NIF:</strong> {entity.nif}</p>
                                        <p><strong className="font-semibold text-text-secondary">Email:</strong> {entity.contact.email}</p>
                                        <p><strong className="font-semibold text-text-secondary">Contacto:</strong> {entity.contact.name} ({entity.contact.phone})</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">{entity.country}</td>
                            <td className="px-6 py-4">{entity.category}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${riskColorMap[entity.riskLevel]}`}>
                                    {entity.riskLevel}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className={`h-2 w-2 rounded-full mr-2 ${statusColorMap[entity.status]}`}></div>
                                    <span>{entity.status}</span>
                                    {entity.legalStatusComment && (
                                        <div className="relative flex items-center ml-1.5 group">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-info cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            <div className="absolute bottom-full mb-2 w-64 p-3 bg-card border border-border text-text-main text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none left-1/2 -translate-x-1/2 transform">
                                                <p className="font-semibold mb-1 text-primary">Justificação:</p>
                                                <p className="text-text-secondary">{entity.legalStatusComment}</p>
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-border"></div>
                                            </div>
                                        </div>
                                    )}
                               </div>
                            </td>
                             <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-5">
                                    <button onClick={() => handleViewDetails(entity)} className="group relative text-text-secondary hover:text-primary transition-colors" aria-label="Ver Detalhes">
                                        <EyeIcon className="w-5 h-5" />
                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            Detalhes
                                        </span>
                                    </button>
                                    <button onClick={() => handleOpenStatusModal(entity)} className="group relative text-text-secondary hover:text-primary transition-colors" aria-label="Alterar Estado">
                                        <SlidersIcon className="w-5 h-5" />
                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            Alterar Estado
                                        </span>
                                    </button>
                                    <button onClick={() => onModuleChange('new-entity', entity)} className="group relative text-text-secondary hover:text-primary transition-colors" aria-label="Editar Entidade">
                                        <EditIcon className="w-5 h-5" />
                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            Editar
                                        </span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                     {filteredEntities.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center p-6 text-text-secondary">Nenhuma entidade encontrada.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
    </>
  );
};

export default Entities;