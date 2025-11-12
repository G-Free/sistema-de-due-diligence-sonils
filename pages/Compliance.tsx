import React from 'react';
import { ModuleChangeProps } from '../types';

const ComplianceItem: React.FC<{ title: string, description: string }> = ({ title, description }) => (
    <div className="bg-background p-5 rounded-lg border border-border">
        <h3 className="font-semibold text-primary">{title}</h3>
        <p className="text-sm text-text-secondary mt-1">{description}</p>
    </div>
);

const Compliance: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-primary mb-2">Conformidade Internacional & Local</h2>
      <p className="text-text-secondary mb-6">O sistema foi desenhado para garantir a conformidade com as seguintes leis, práticas e normas regulatórias:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ComplianceItem 
            title="Lei Anticorrupção de Angola (Lei n.º 3/10)"
            description="Assegura que os processos de due diligence cumprem os requisitos legais angolanos de combate à corrupção."
        />
        <ComplianceItem 
            title="Recomendações FATF/GAFI"
            description="Alinhamento com as diretrizes do Grupo de Ação Financeira contra a Lavagem de Dinheiro e Financiamento do Terrorismo."
        />
        <ComplianceItem 
            title="ISO 37001 (Antissuborno)"
            description="Os questionários e processos são baseados nas melhores práticas internacionais para sistemas de gestão antissuborno."
        />
         <ComplianceItem 
            title="ISO 31000 (Gestão de Risco)"
            description="A metodologia de avaliação de risco segue os princípios e diretrizes da norma para a gestão de riscos corporativos."
        />
        <ComplianceItem 
            title="Lei de Proteção de Dados de Angola (Lei n.º 22/11)"
            description="Garante a proteção e o tratamento adequado dos dados pessoais e sensíveis recolhidos durante o processo de DDQ."
        />
        <ComplianceItem 
            title="FCPA & UK Bribery Act"
            description="Ajuda a mitigar riscos relacionados com a legislação anticorrupção dos EUA e do Reino Unido em transações internacionais."
        />
      </div>
    </div>
  );
};

export default Compliance;