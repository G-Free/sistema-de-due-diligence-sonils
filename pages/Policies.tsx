import React from 'react';
import { ModuleChangeProps, DocumentItem } from '../types';
import { internalPolicies, angolanLaws, internationalNorms } from '../data/mockData';
import { useToast } from '../components/useToast';

const DocumentCard: React.FC<{ doc: DocumentItem }> = ({ doc }) => {
    const { addToast } = useToast();
    return (
        <div className="bg-background p-4 rounded-lg border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <h4 className="font-semibold text-text-main">{doc.title}</h4>
                <p className="text-sm text-text-secondary mt-1">{doc.description}</p>
            </div>
            <button 
                onClick={() => addToast(`A simular a abertura do documento: ${doc.title}`, 'info')}
                className="mt-3 sm:mt-0 sm:ml-4 text-sm bg-secondary hover:bg-secondary-hover text-primary font-semibold py-1.5 px-4 rounded-lg transition-colors shrink-0"
            >
                Consultar
            </button>
        </div>
    );
}


const Policies: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-text-main">Políticas, Normas e Leis</h1>
                <p className="text-text-secondary mt-1">Repositório central de políticas internas da SONILS e legislação de compliance relevante.</p>
            </div>

            <section className="bg-card p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-primary mb-4">Políticas Internas SONILS</h2>
                <div className="space-y-4">
                    {internalPolicies.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                </div>
            </section>

            <section className="bg-card p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-primary mb-4">Legislação Angolana</h2>
                <div className="space-y-4">
                    {angolanLaws.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                </div>
            </section>
            
            <section className="bg-card p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-primary mb-4">Normas Internacionais</h2>
                <div className="space-y-4">
                    {internationalNorms.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                </div>
            </section>
        </div>
    );
};

export default Policies;
