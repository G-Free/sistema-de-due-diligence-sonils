import React, { useState, useMemo } from 'react';
import { AuditLog } from '../../types';
import { mockAuditLogs } from '../../data/mockData';

const AuditLogPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');

    const users = useMemo(() => [...new Set(mockAuditLogs.map(log => log.user))], []);
    const actions = useMemo(() => [...new Set(mockAuditLogs.map(log => log.action))], []);

    const filteredLogs = useMemo(() => {
        return mockAuditLogs.filter(log => {
            const matchesSearch = searchTerm === '' || 
                                  log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  log.user.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesUser = userFilter === 'all' || log.user === userFilter;
            const matchesAction = actionFilter === 'all' || log.action === actionFilter;
            return matchesSearch && matchesUser && matchesAction;
        });
    }, [searchTerm, userFilter, actionFilter]);

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-primary">Log de Auditoria</h3>
                <p className="text-sm text-text-secondary mt-1">Rastreie as atividades e alterações importantes no sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-background p-4 rounded-lg border border-border">
                <div className="md:col-span-3">
                    <input
                        type="text"
                        placeholder="Pesquisar nos detalhes ou utilizador..."
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
                        value={actionFilter}
                        onChange={e => setActionFilter(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg p-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary"
                    >
                        <option value="all">Todas as Ações</option>
                        {actions.map(action => <option key={action} value={action}>{action}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs text-text-secondary uppercase bg-background">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Data e Hora</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Utilizador</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Ação</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">{log.timestamp}</td>
                                <td className="px-6 py-4 font-medium text-text-main">{log.user}</td>
                                <td className="px-6 py-4">
                                     <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs">{log.details}</td>
                            </tr>
                        ))}
                         {filteredLogs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center p-6 text-text-secondary">Nenhum log encontrado com os filtros atuais.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogPage;
