import React from 'react';
import { ModuleChangeProps, Entity, RiskLevel, LegalStatus, DocumentStatus } from '../types';
import { WarningIcon } from '../components/icons/WarningIcon';


interface IndividualReportProps extends ModuleChangeProps {
  entity: Entity;
}

const InfoItem: React.FC<{label: string, value: React.ReactNode}> = ({label, value}) => (
    <div>
        <h4 className="text-sm text-text-secondary font-medium">{label}</h4>
        <p className="text-md text-text-main font-semibold">{value}</p>
    </div>
)

const riskColorMap: Record<RiskLevel, string> = {
  [RiskLevel.Low]: 'bg-success/20 text-success',
  [RiskLevel.Medium]: 'bg-warning/20 text-warning',
  [RiskLevel.High]: 'bg-danger/20 text-danger',
  [RiskLevel.Critical]: 'bg-red-900/40 text-red-400',
  [RiskLevel.Informational]: 'bg-green-100 text-green-800',
};

const statusConfig: Record<DocumentStatus, { classes: string }> = {
    'Pendente': { classes: 'bg-warning/20 text-warning' },
    'Expirado': { classes: 'bg-danger/20 text-danger' },
    'Verificado': { classes: 'bg-success/20 text-success' },
    'Recebido': { classes: 'bg-info/20 text-info' },
};

const IndividualReport: React.FC<IndividualReportProps> = ({ onModuleChange, entity }) => {
  if (!entity) {
    return (
      <div className="bg-card p-8 rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-bold text-primary">Nenhuma Entidade Selecionada</h2>
        <p className="text-text-secondary mt-2">Por favor, volte à lista de entidades e selecione uma para ver o seu relatório.</p>
        <button onClick={() => onModuleChange('entities')} className="mt-4 bg-secondary hover:bg-secondary-hover text-primary font-semibold py-2 px-4 rounded-lg transition-colors">
            Ver Entidades
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <h2 className="text-3xl font-bold text-primary">{entity.name}</h2>
                <p className="text-text-secondary">{entity.category}</p>
            </div>
            <button onClick={() => onModuleChange('entities')} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg transition-colors mt-4 sm:mt-0">
                &larr; Voltar para Entidades
            </button>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-primary mb-4">Visão Geral da Entidade</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <InfoItem label="Nível de Risco" value={
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${riskColorMap[entity.riskLevel]}`}>
                        {entity.riskLevel}
                    </span>
                } />
                <InfoItem label="Estado Legal" value={entity.status} />
                <InfoItem label="Data de Integração" value={entity.onboardingDate} />
                <InfoItem label="País" value={entity.country} />
            </div>
            {entity.legalStatusComment && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-6">
                    <h4 className="text-sm text-yellow-800 font-semibold flex items-center">
                        <WarningIcon className="w-5 h-5 mr-2 text-yellow-600 shrink-0" />
                        Observação sobre o Estado Legal
                    </h4>
                    <p className="text-md text-yellow-700 mt-1 italic">"{entity.legalStatusComment}"</p>
                </div>
            )}
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-primary mb-4">Informação Legal e de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoItem label="NIF" value={entity.nif} />
                <InfoItem label="Registo Comercial" value={entity.commercialRegistration} />
                <InfoItem label="Beneficiário Efetivo" value={entity.beneficialOwner} />
                <InfoItem label="Nome do Contacto" value={entity.contact.name} />
                <InfoItem label="Email" value={<a href={`mailto:${entity.contact.email}`} className="text-primary hover:underline">{entity.contact.email}</a>} />
                <InfoItem label="Telefone" value={entity.contact.phone} />
                {entity.contact.website && <InfoItem label="Website" value={<a href={entity.contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{entity.contact.website}</a>} />}
                {entity.contact.linkedIn && <InfoItem label="LinkedIn" value={<a href={entity.contact.linkedIn} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver Perfil</a>} />}
            </div>
        </div>
        
         <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-primary mb-4">Serviços Prestados</h3>
            <div className="flex flex-wrap gap-2">
                {entity.services.map(service => (
                    <span key={service} className="bg-background border border-border text-text-secondary text-sm font-medium px-3 py-1 rounded-full">{service}</span>
                ))}
            </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-primary mb-4">Documentos da Entidade</h3>
            {entity.documents && entity.documents.length > 0 ? (
                <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-background">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Nome do Documento</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Estado</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Data de Submissão</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Data de Vencimento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {entity.documents.map((doc, index) => (
                                <tr key={index} className="hover:bg-background">
                                    <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">{doc.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[doc.status].classes}`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{doc.submissionDate}</td>
                                    <td className="px-6 py-4 font-medium text-danger">{doc.expiryDate || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-background p-4 rounded-lg text-center text-text-secondary">
                    Nenhum documento registado para esta entidade.
                </div>
            )}
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-primary mb-4">Histórico de Alterações de Estado</h3>
            {entity.statusLog && entity.statusLog.length > 0 ? (
                <div className="space-y-4">
                    {entity.statusLog.slice().reverse().map((log, index) => (
                        <div key={index} className="bg-background p-4 rounded-lg border border-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-text-main">
                                        De <span className="font-bold">{log.previousStatus}</span> para <span className="font-bold">{log.newStatus}</span>
                                    </p>
                                    <p className="text-xs text-text-secondary">
                                        Por {log.user} em {new Date(log.date).toLocaleDateString('pt-PT')}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-text-secondary mt-2 italic">"{log.justification}"</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-background p-4 rounded-lg text-center text-text-secondary">
                    Nenhum histórico de alterações de estado registado.
                </div>
            )}
        </div>
    </div>
  );
};

export default IndividualReport;