import React from 'react';
import { HistoryItem } from '../types';

const criteriaConfig = {
  legal: {
    name: 'Conformidade Legal e Regulatória',
    items: {
        alvara: 'Alvará Comercial e Licenças',
        certidaoComercial: 'Certidão do Registo Comercial',
        estatutos: 'Estatutos da empresa',
        documentoPoderes: 'Documento de Poderes do Representante',
        biAccionistas: 'BI dos Acionistas',
        apolicesSeguro: 'Apólices de Seguro',
    },
  },
  financeira: {
    name: 'Capacidade Financeira',
    items: {
        certidaoINSS: 'Certidão Contributiva (INSS)',
        certidaoTributaria: 'Certidão de Conformidade Tributária',
        relatorioContas: 'Relatório de Contas (Últimos 3 anos)',
        solvenciaFinanceira: 'Solvência financeira',
    },
  },
  operacional: {
    name: 'Critérios Operacionais e Ética',
    items: {
        certificadoANPG: 'Certificado da ANPG',
        possuiPEP: 'Possui PEP no quadro?',
        certificacaoISO: 'Certificação ISO',
        outroCertificado: 'Outro tipo de Certificado',
        politicasCompliance: 'Políticas de Compliance',
    },
  },
};

const classificationConfig: Record<string, { badge: string }> = {
  'A - Favorável': { badge: 'bg-success/20 text-success' },
  'B - Favorável com Ressalvas': { badge: 'bg-warning/20 text-warning' },
  'C - Não Favorável': { badge: 'bg-danger/20 text-danger' },
};


const HistoryDetailModal: React.FC<{isOpen: boolean; onClose: () => void; item: HistoryItem | null;}> = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const renderDetailSection = (categoryKey: 'legal' | 'financeira' | 'operacional') => {
      const category = criteriaConfig[categoryKey];
      return (
          <div key={category.name} className="mb-4">
              <h4 className="text-md font-semibold text-primary mb-2">{category.name}</h4>
              <ul className="space-y-1 text-sm">
                  {Object.entries(category.items).map(([key, label]) => (
                      <li key={key} className="flex justify-between items-center bg-background p-2 rounded">
                          <span className="text-text-secondary">{label}</span>
                          <span className="font-semibold text-text-main">{item.formState[key] || 'N/A'}</span>
                      </li>
                  ))}
              </ul>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-2xl animate-fade-in-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-primary">Detalhes da Avaliação ({item.sequenceNumber})</h2>
            <p className="text-text-secondary text-sm">{item.entityName} - {item.assessmentDate}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto pr-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-background p-4 rounded-lg">
                <div>
                    <dt className="text-xs font-medium text-text-secondary">Pontuação</dt>
                    <dd className="mt-1 text-lg text-primary font-bold">{item.finalScore.toFixed(1)}%</dd>
                </div>
                <div>
                    <dt className="text-xs font-medium text-text-secondary">Classificação</dt>
                    <dd className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classificationConfig[item.classification]?.badge}`}>
                            {item.classification}
                        </span>
                    </dd>
                </div>
                <div>
                    <dt className="text-xs font-medium text-text-secondary">Avaliador</dt>
                    <dd className="mt-1 text-sm text-text-main font-semibold">{item.user}</dd>
                </div>
            </div>
            
            {item.observations && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-text-main mb-2">Observações</h3>
                    <div className="bg-background p-4 rounded-lg border border-border text-sm text-text-secondary whitespace-pre-wrap">
                        {item.observations}
                    </div>
                </div>
            )}

            <h3 className="text-lg font-semibold text-text-main mb-3">Resumo das Respostas</h3>
            {renderDetailSection('legal')}
            {renderDetailSection('financeira')}
            {renderDetailSection('operacional')}
        </div>

      </div>
    </div>
  );
};

export default HistoryDetailModal;