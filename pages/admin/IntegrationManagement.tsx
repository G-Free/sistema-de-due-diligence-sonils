import React, { useState, useRef } from 'react';
import { Integration, Script } from '../../types';
import { mockIntegrations } from '../../data/mockData';
import { mockScripts } from '../../data/mockScripts';
import { useToast } from '../../components/useToast';
import { ExportIcon } from '../../components/icons/ExportIcon';
import { UploadIcon } from '../../components/icons/UploadIcon';
import { ImageIcon } from '../../components/icons/ImageIcon';
import { RefreshCwIcon } from '../../components/icons/RefreshCwIcon';
import { CodeIcon } from '../../components/icons/CodeIcon';
import ScriptEditorModal from '../../components/ScriptEditorModal';

const SyncCheckModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [result, setResult] = useState('');
    const { addToast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult('');
        }
    };

    const handleCheck = () => {
        if (!file) {
            addToast('Por favor, selecione um ficheiro de resumo.', 'warning');
            return;
        }
        setIsChecking(true);
        setResult('');
        setTimeout(() => {
            setResult(`Ficheiro "${file.name}" processado com sucesso.
- 5 integrações atualizadas.
- 1 integração sem alterações.`);
            setIsChecking(false);
        }, 1500);
    };

    const handleClose = () => {
        setFile(null);
        setResult('');
        setIsChecking(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleClose}>
            <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-primary mb-4">Verificar Sincronização de Integrações</h2>
                <p className="text-text-secondary text-sm mb-4">Carregue um ficheiro de resumo (.log, .txt, .json) para verificar o estado da última sincronização de dados.</p>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md bg-background">
                    <div className="space-y-1 text-center">
                         <svg className="mx-auto h-12 w-12 text-text-secondary" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <div className="flex text-sm text-text-secondary"><label htmlFor="file-upload" className="relative cursor-pointer bg-card rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-secondary"><span>Selecione um ficheiro</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} /></label></div>
                        {file ? <p className="text-xs text-success font-semibold">{file.name}</p> : <p className="text-xs text-text-secondary">.log, .txt, .json</p>}
                    </div>
                </div>

                {result && (
                    <div className="mt-4 bg-success/10 border-l-4 border-success text-success p-4 rounded-r-lg">
                        <p className="font-bold text-sm">Verificação Concluída</p>
                        <pre className="text-xs whitespace-pre-wrap mt-1">{result}</pre>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 mt-4">
                    <button type="button" onClick={handleClose} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg">Fechar</button>
                    <button type="button" onClick={handleCheck} disabled={isChecking || !file} className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400">
                        {isChecking ? 'A verificar...' : 'Verificar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const IntegrationManagement: React.FC = () => {
    const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
    const { addToast } = useToast();
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);

    const handleToggleStatus = (integrationId: string) => {
        const updatedIntegrations = integrations.map(int => {
            if (int.id === integrationId) {
                // FIX: Explicitly type `newStatus` to prevent it from being inferred as a generic `string`, which caused a type mismatch with the `Integration` type.
                const newStatus: "Ativa" | "Inativa" = int.status === 'Ativa' ? 'Inativa' : 'Ativa';
                addToast(`Integração "${int.name}" foi ${newStatus.toLowerCase()}.`, 'info');
                return { ...int, status: newStatus };
            }
            return int;
        });
        setIntegrations(updatedIntegrations);
        
        const mockIndex = mockIntegrations.findIndex(i => i.id === integrationId);
        if (mockIndex > -1) {
            mockIntegrations[mockIndex].status = mockIntegrations[mockIndex].status === 'Ativa' ? 'Inativa' : 'Ativa';
        }
    };
    
    const handleEditScript = (scriptId: string) => {
        const script = mockScripts.find(s => s.id === scriptId);
        if (script) {
            setSelectedScript(script);
            setIsScriptModalOpen(true);
        } else {
            addToast('Script associado não encontrado.', 'error');
        }
    };

    const handleSaveScript = (scriptId: string, newContent: string) => {
        const scriptIndex = mockScripts.findIndex(s => s.id === scriptId);
        if (scriptIndex > -1) {
            mockScripts[scriptIndex].content = newContent;
        }
    };

    return (
        <div className="animate-fade-in">
            <SyncCheckModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
            <ScriptEditorModal
                isOpen={isScriptModalOpen}
                onClose={() => setIsScriptModalOpen(false)}
                script={selectedScript}
                onSave={handleSaveScript}
            />
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-primary">Configuração de Integrações</h3>
                    <p className="text-sm text-text-secondary mt-1">Ative, desative e monitorize as fontes de dados externas.</p>
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                     <button onClick={() => addToast('Simulando exportação para Excel...', 'info')} className="flex items-center gap-2 bg-card border border-border text-text-main font-semibold py-2 px-3 rounded-lg text-sm hover:bg-background transition-colors">
                        <ExportIcon className="w-4 h-4" /> Excel
                    </button>
                    <button onClick={() => setIsSyncModalOpen(true)} className="flex items-center gap-2 bg-card border border-border text-text-main font-semibold py-2 px-3 rounded-lg text-sm hover:bg-background transition-colors">
                        <RefreshCwIcon className="w-4 h-4" /> Verificar Atualizações
                    </button>
                    <button onClick={() => addToast('Funcionalidade em desenvolvimento.', 'info')} className="flex items-center gap-2 bg-card border border-border text-text-main font-semibold py-2 px-3 rounded-lg text-sm hover:bg-background transition-colors">
                        <ImageIcon className="w-4 h-4" /> Importar Logo
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs text-text-secondary uppercase bg-background">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Nome</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Tipo</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Versão</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Última Atualização</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Script</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {integrations.map(integration => (
                             <tr key={integration.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">{integration.name}</td>
                                <td className="px-6 py-4">{integration.type}</td>
                                <td className="px-6 py-4 font-mono text-xs">{integration.version}</td>
                                <td className="px-6 py-4 font-mono text-xs">{integration.lastUpdate}</td>
                                <td className="px-6 py-4">
                                    {integration.scriptId ? (
                                        <button onClick={() => handleEditScript(integration.scriptId)} className="flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                                            <CodeIcon className="w-4 h-4" />
                                            <span>Editar Script</span>
                                        </button>
                                    ) : (
                                        <span className="text-xs text-text-secondary">N/A</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                     <div className="flex items-center justify-center gap-3">
                                        <span className={`text-sm font-semibold ${integration.status === 'Ativa' ? 'text-success' : 'text-text-secondary'}`}>{integration.status}</span>
                                        <label htmlFor={`toggle-${integration.id}`} className="flex items-center cursor-pointer">
                                            <div className="relative">
                                                <input type="checkbox" id={`toggle-${integration.id}`} className="sr-only" checked={integration.status === 'Ativa'} onChange={() => handleToggleStatus(integration.id)} />
                                                <div className="block bg-gray-300 w-12 h-6 rounded-full"></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${integration.status === 'Ativa' ? 'translate-x-6 !bg-primary' : ''}`}></div>
                                            </div>
                                        </label>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IntegrationManagement;