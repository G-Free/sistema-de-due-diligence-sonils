import React from 'react';
import { ModuleChangeProps } from '../types';

const DDQEvaluation: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <h2 className="text-2xl font-bold mb-4">Avaliação de DDQ</h2>
      <p className="text-text-secondary mb-6">Rever e avaliar os questionários submetidos para avaliar a conformidade e o risco de terceiros.</p>
      
      <div className="bg-background p-6 rounded-lg text-center">
        <h3 className="text-xl font-semibold">Funcionalidade em Desenvolvimento</h3>
        <p className="text-text-secondary mt-2">Este módulo fornecerá ferramentas para pontuar respostas, sinalizar problemas e colaborar em avaliações.</p>
        <button onClick={() => onModuleChange('dashboard')} className="mt-4 bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
};

export default DDQEvaluation;