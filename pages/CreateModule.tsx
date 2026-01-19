import React, { useState, useEffect, useRef } from 'react';
import { ModuleChangeProps } from '../types';
import { useToast } from '../components/useToast';

const CreateModule: React.FC<ModuleChangeProps> = ({ onModuleChange, setIsFormDirty }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const isInitialMount = useRef(true);
    const { addToast } = useToast();

    useEffect(() => {
        if (!setIsFormDirty) return;
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setIsFormDirty(true);
        }
    }, [title, description, targetAudience, setIsFormDirty]);

    useEffect(() => {
        return () => {
            if (setIsFormDirty) setIsFormDirty(false);
        };
    }, [setIsFormDirty]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (setIsFormDirty) setIsFormDirty(false);
        // In a real app, this would save the new module
        console.log({ title, description, targetAudience });
        addToast('Módulo de treinamento criado com sucesso!', 'success');
        onModuleChange('training');
    };

    return (
        <div className="bg-card p-8 rounded-lg shadow-sm max-w-3xl mx-auto animate-fade-in">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Criar Novo Módulo de Treinamento</h2>
                    <p className="text-text-secondary">Crie um novo módulo para organizar conteúdos de treinamento.</p>
                </div>
                <button onClick={() => onModuleChange('training')} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg transition-colors text-sm shrink-0">
                    &larr; Voltar
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">Título do Módulo</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
                        placeholder="Ex: Integração de Compliance"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        required
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
                        placeholder="Uma breve descrição sobre os objetivos do módulo."
                    />
                </div>
                <div>
                    <label htmlFor="targetAudience" className="block text-sm font-medium text-text-secondary mb-1">Público-Alvo</label>
                    <input
                        type="text"
                        id="targetAudience"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        required
                        className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
                        placeholder="Ex: Novos Colaboradores, Gestão"
                    />
                </div>
                 <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-700">
                    <p><strong>Nota:</strong> A funcionalidade para adicionar conteúdos específicos (quizzes, documentos) será implementada na secção 'Gerir Módulo'.</p>
                </div>
                <div className="flex justify-between items-center pt-6 mt-6 border-t border-border">
                    <button type="button" onClick={() => onModuleChange('menu-dashboard', undefined, true)} className="text-sm text-danger hover:underline">Sair sem Salvar</button>
                    <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                        Salvar Módulo
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateModule;