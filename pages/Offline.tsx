import React from 'react';
import { ModuleChangeProps } from '../types';
import { useToast } from '../components/useToast';

const Offline: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
  const { addToast } = useToast();

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-primary mb-2">Módulo Offline / Contingência</h2>
      <p className="text-text-secondary mb-6">Garanta a continuidade da operação em locais com baixa conectividade através de sincronização com planilhas Excel.</p>
      
      <div className="bg-background p-8 rounded-lg border border-border text-center">
        <h3 className="text-xl font-semibold text-primary">Operação Contínua, Onde Quer Que Esteja</h3>
        <p className="text-text-secondary mt-2 max-w-2xl mx-auto">Este módulo permite descarregar um template Excel (.xlsm) com os dados essenciais das entidades e questionários. Pode preencher a informação offline e, quando a conexão for restabelecida, fazer o upload para sincronizar automaticamente com o sistema central.</p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => addToast('A iniciar o download do template offline...', 'info')} className="bg-secondary hover:bg-secondary-hover text-primary font-semibold py-2 px-6 rounded-lg transition-colors">
                Descarregar Template
            </button>
            <button onClick={() => addToast('Funcionalidade de upload em desenvolvimento.', 'info')} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-6 rounded-lg transition-colors">
                Carregar Ficheiro
            </button>
        </div>
      </div>
    </div>
  );
};

export default Offline;
