import React, { useState } from 'react';
import { ModuleChangeProps, Script } from '../types';
import { mockScripts } from '../data/mockScripts';
import { EditIcon } from '../components/icons/EditIcon';
import ScriptEditorModal from '../components/ScriptEditorModal';
import { CodeIcon } from '../components/icons/CodeIcon';

const ScriptEditor: React.FC<ModuleChangeProps> = ({ setIsFormDirty }) => {
    const [scripts, setScripts] = useState<Script[]>(mockScripts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);

    const handleEdit = (script: Script) => {
        setSelectedScript(script);
        setIsModalOpen(true);
    };

    const handleSaveScript = (scriptId: string, newContent: string) => {
        const updatedScripts = scripts.map(s => s.id === scriptId ? { ...s, content: newContent } : s);
        setScripts(updatedScripts);

        const mockIndex = mockScripts.findIndex(s => s.id === scriptId);
        if (mockIndex > -1) {
            mockScripts[mockIndex].content = newContent;
        }
        if (setIsFormDirty) setIsFormDirty(true);
    };

    return (
        <>
            <ScriptEditorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                script={selectedScript}
                onSave={handleSaveScript}
            />
            <div className="bg-card p-6 rounded-xl shadow-md animate-fade-in">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-text-main">Configurações do Sistema</h2>
                        <p className="text-text-secondary mt-1">Gestão de scripts e lógicas de negócio da aplicação.</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {scripts.map(script => (
                        <div key={script.id} className="bg-background border border-border rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <CodeIcon className="w-8 h-8 text-primary mr-4 shrink-0"/>
                                <div>
                                    <h3 className="font-semibold text-primary">{script.name} <span className="text-xs font-mono bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">v{script.version}</span></h3>
                                    <p className="text-sm text-text-secondary">{script.description}</p>
                                </div>
                            </div>
                            <button onClick={() => handleEdit(script)} className="flex items-center gap-2 bg-card border border-border text-text-main font-semibold py-2 px-3 rounded-lg text-sm hover:bg-border transition-colors">
                                <EditIcon className="w-4 h-4"/>
                                <span>Editar</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ScriptEditor;
