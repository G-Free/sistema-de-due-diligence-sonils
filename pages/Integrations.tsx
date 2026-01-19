import React, { useState, useMemo } from 'react';
import { ModuleChangeProps, EntityHistoryLog, ChangeType } from '../types';
import { mockEntityHistory, mockEntities } from '../data/mockData';
import { EyeIcon } from '../components/icons/EyeIcon';

const changeTypeColors: Record<ChangeType, string> = {
    'Criação': 'bg-success/20 text-success',
    'Alteração de Estado': 'bg-warning/20 text-warning',
    'Edição de Dados': 'bg-info/20 text-info',
    'Documento Adicionado': 'bg-blue-500/10 text-blue-600',
    'Documento Removido': 'bg-danger/20 text-danger',
};


const Integrations: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const users = useMemo(() => [...new Set(mockEntityHistory.map(log => log.user))], []);
    const changeTypes = useMemo(() => [...new Set(Object.values(ChangeType) as ChangeType[])], []);

    const filteredHistory = useMemo(() => {
        return mockEntityHistory
            .filter(log => {
                const matchesSearch = searchTerm === '' || 
                                      log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      log.summary.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesUser = userFilter === 'all' || log.user === userFilter;
                const matchesType = typeFilter === 'all' || log.changeType === typeFilter;
                return matchesSearch && matchesUser && matchesType;
            })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [searchTerm, userFilter, typeFilter]);
    
    const handleViewEntity = (entityId: string) => {
        const entity = mockEntities.find(e => e.id === entityId);
        if (entity) {
            onModuleChange('report', entity);
        }
    };

    return (
        <div className="bg-card p-6 rounded-xl shadow-md animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Histórico de Alterações de Entidades</h2>
                    <p className="text-text-secondary mt-1">Rastreie todas as modificações feitas nos registos das entidades.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-background p-4 rounded-lg border border-border">
                <div className="md:col-span-3">
                    <input
                        type="text"
                        placeholder="Pesquisar por entidade ou resumo da alteração..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
                    />
                </div>
                <div>
                    <select
                        value={userFilter}
                        onChange={e => setUserFilter(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg p-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="all">Todos os Utilizadores</option>
                        {users.map(user => <option key={user} value={user}>{user}</option>)}
                    </select>
                </div>
                <div>
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg p-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="all">Todos os Tipos de Alteração</option>
                        {changeTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs text-text-secondary uppercase bg-background">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Entidade</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Data e Hora</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Utilizador</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Tipo de Alteração</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Resumo</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredHistory.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">{log.entityName}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{new Date(log.timestamp).toLocaleString('pt-PT')}</td>
                                <td className="px-6 py-4">{log.user}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${changeTypeColors[log.changeType]}`}>
                                        {log.changeType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs max-w-sm">{log.summary}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleViewEntity(log.entityId)} className="group relative text-text-secondary hover:text-primary transition-colors" aria-label="Ver Entidade">
                                        <EyeIcon className="w-5 h-5" />
                                         <span className="absolute bottom-full mb-2 right-0 whitespace-nowrap bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                            Ver Entidade
                                        </span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {filteredHistory.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center p-6 text-text-secondary">Nenhum registo de histórico encontrado com os filtros atuais.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Integrations;