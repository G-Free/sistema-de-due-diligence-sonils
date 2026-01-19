import React from 'react';
import { ModuleChangeProps } from '../types';

const categories = [
    { name: 'Compliance', description: 'Questões sobre políticas anti-corrupção, sanções e conformidade legal.' },
    { name: 'Financeiro', description: 'Análise de saúde financeira, fontes de rendimento e estrutura de capital.' },
    { name: 'Operacional', description: 'Avaliação de capacidade técnica, processos e qualidade do serviço.' },
    { name: 'Reputacional', description: 'Verificação de histórico, media negativa e afiliações a PEPs.' },
    { name: 'Ambiental', description: 'Conformidade com normas ambientais, licenças e impacto ecológico.' },
    { name: 'Jurídico', description: 'Análise de estrutura societária, litígios e contratos.' }
];

const DDQQuestionnaire: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
  return (
    <div className="bg-card p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">Questionário Due Diligence (DDQ)</h2>
            <p className="text-text-secondary">Baseado nas normas ISO 37001, FATF e OCDE.</p>
          </div>
          <button className="bg-secondary hover:bg-secondary-hover text-primary font-semibold py-2 px-4 rounded-lg transition-colors mt-4 sm:mt-0">
            Importar Perguntas
          </button>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
            <div key={category.name} className="bg-background p-5 rounded-lg border border-border">
                <h3 className="font-semibold text-primary">{category.name}</h3>
                <p className="text-sm text-text-secondary mt-1">{category.description}</p>
                <div className="mt-3 text-xs text-text-secondary">
                    <span className="font-semibold text-text-main">Status:</span> Completo
                </div>
            </div>
        ))}
      </div>
       <div className="mt-8 bg-background p-4 rounded-lg text-center">
            <p className="text-text-secondary">Este módulo permite a aplicação de questionários digitais para uma avaliação de risco completa e auditável.</p>
        </div>
    </div>
  );
};

export default DDQQuestionnaire;