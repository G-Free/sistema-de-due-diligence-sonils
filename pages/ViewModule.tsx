import React from 'react';
import { ModuleChangeProps, TrainingModule } from '../types';
import { QuizIcon } from '../components/icons/QuizIcon';
import { DocumentIcon } from '../components/icons/DocumentIcon';

interface ViewModuleProps extends ModuleChangeProps {
  module: TrainingModule;
}

const ViewModule: React.FC<ViewModuleProps> = ({ onModuleChange, module }) => {
  if (!module) {
    return (
      <div className="bg-card p-8 rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-bold text-primary">Nenhum Módulo Selecionado</h2>
        <p className="text-text-secondary mt-2">Por favor, volte ao painel de treinamento e selecione um módulo para visualizar.</p>
        <button onClick={() => onModuleChange('training')} className="mt-4 bg-secondary hover:bg-secondary-hover text-primary font-semibold py-2 px-4 rounded-lg transition-colors">
            Voltar ao Painel
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card p-8 rounded-lg shadow-sm max-w-3xl mx-auto animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">{module.title}</h2>
          <p className="text-text-secondary mt-1">Público-Alvo: <span className="font-semibold text-text-main">{module.targetAudience}</span></p>
        </div>
        <button onClick={() => onModuleChange('training')} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
            &larr; Voltar
        </button>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-text-main mb-2">Descrição do Módulo</h3>
          <p className="text-text-secondary bg-background p-4 rounded-lg border border-border">{module.description}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-text-main mb-2">Conteúdo do Módulo</h3>
          <div className="space-y-3">
            {module.content.map((item, index) => (
              <div key={index} className="flex items-center bg-background p-3 rounded-lg border border-border">
                {item.type === 'quiz' ? <QuizIcon className="w-5 h-5 mr-3 text-secondary"/> : <DocumentIcon className="w-5 h-5 mr-3 text-secondary"/>}
                <span className="flex-1 text-text-main font-medium">{item.title}</span>
                <span className="text-xs uppercase font-bold text-text-secondary bg-card px-2 py-1 rounded-full border border-border">{item.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewModule;
