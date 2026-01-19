import React, { useState } from 'react';
import { ModuleChangeProps, Entity, RiskLevel, Document, DocumentStatus, EntityType, LegalStatus } from '../types';
import { WarningIcon } from '../components/icons/WarningIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { useToast } from '../components/useToast';
import ViewDocumentModal from '../components/ViewDocumentModal';
import { mockEntities } from '../data/mockData';


interface EntityReportProps extends ModuleChangeProps {
  entity: Entity;
}

const InfoItem: React.FC<{label: string, value: React.ReactNode}> = ({label, value}) => (
    <div>
        <h4 className="text-sm text-text-secondary font-medium">{label}</h4>
        <p className="text-md text-text-main font-semibold">{value || '-'}</p>
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

const EntityReportPage: React.FC<EntityReportProps> = ({ onModuleChange, entity }) => {
  const { addToast } = useToast();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [legalStatusComment, setLegalStatusComment] = useState(entity.legalStatusComment || '');
  const [isCommentDirty, setIsCommentDirty] = useState(false);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLegalStatusComment(e.target.value);
    setIsCommentDirty(true);
  };

  const handleSaveComment = () => {
    const entityIndex = mockEntities.findIndex(e => e.id === entity.id);
    if (entityIndex > -1) {
        mockEntities[entityIndex].legalStatusComment = legalStatusComment;
        addToast('Observação salva com sucesso!', 'success');
        setIsCommentDirty(false);
    } else {
        addToast('Erro ao salvar observação: Entidade não encontrada.', 'error');
    }
  };


  const handleDownloadDocument = (doc: Document) => {
    addToast(`A simular o download do documento: ${doc.name}`, 'info', 'Download');
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsViewModalOpen(true);
  };
  
  const renderSpecificDetails = () => {
    switch (entity.entityType) {
      case EntityType.Individual:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoItem label="Data de Nascimento" value={entity.birthDate} />
            <InfoItem label="Nacionalidade" value={entity.nationality} />
            <InfoItem label="País de Residência Fiscal" value={entity.taxResidencyCountry} />
            <InfoItem label="Profissão" value={entity.profession} />
            <InfoItem label="Entidade Empregadora" value={entity.employer} />
            <InfoItem label="Estado Civil" value={entity.maritalStatus} />
          </div>
        );
      case EntityType.PrivateCompany:
         return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoItem label="Tipo Jurídico" value={entity.legalEntityType} />
            <InfoItem label="Data de Constituição" value={entity.incorporationDate} />
            <InfoItem label="CAE / Ramo de Atividade" value={entity.cae} />
            <InfoItem label="Nº de Colaboradores" value={entity.employeeCount} />
            <InfoItem label="Volume de Negócios (Últ. Ano)" value={entity.lastYearTurnover ? `${entity.lastYearTurnover.toLocaleString()} Kz` : '-'} />
            <InfoItem label="Representante Legal" value={`${entity.legalRepresentativeName || ''} (${entity.legalRepresentativeDocument || 'N/A'})`} />
          </div>
        );
      case EntityType.PublicEntity:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoItem label="Data do Diploma Legal" value={entity.incorporationDate} />
            <InfoItem label="Nº de Registo Legal" value={entity.officialRegistrationNumber} />
            <InfoItem label="Ministério Supervisor" value={entity.supervisingMinistry} />
            <InfoItem label="Responsável Institucional" value={`${entity.institutionalHeadName || ''} (${entity.institutionalHeadPosition || ''})`} />
            <InfoItem label="Natureza da Atividade Pública" value={entity.publicActivityNature} />
          </div>
        );
      case EntityType.NGO:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoItem label="Data de Constituição" value={entity.incorporationDate} />
            <InfoItem label="Nº de Registo" value={entity.ngoRegistrationNumber} />
            <InfoItem label="Finalidade Social" value={entity.socialPurpose} />
            <InfoItem label="Escopo Territorial" value={entity.territorialScope} />
            <InfoItem label="Fontes de Financiamento" value={entity.sourceOfFunds} />
          </div>
        );
      default:
        return null;
    }
  }

  const renderDdqDetails = () => {
    // A simplified view of DDQ answers
    return (
      <div className="space-y-4">
        <InfoItem label="É Pessoa Politicamente Exposta (PEP)?" value={entity.isPep} />
        <InfoItem label="Origem dos Fundos" value={entity.sourceOfFunds} />
        {entity.entityType === EntityType.Individual && <>
          <InfoItem label="Origem do Património" value={entity.sourceOfWealth} />
          <InfoItem label="Envolvido em processos criminais/financeiros?" value={entity.criminalRecordDetails} />
          <InfoItem label="Mantém atividade empresarial própria?" value={entity.hasOwnBusiness} />
        </>}
         {entity.entityType === EntityType.PrivateCompany && <>
          <InfoItem label="Beneficiário efetivo é PEP?" value={entity.uboIsPep} />
          <InfoItem label="A empresa tem atividade econômica real?" value={entity.hasRealEconomicActivity} />
           <InfoItem label="Tem histórico de sanções ou processos?" value={entity.sanctionsHistory} />
           <InfoItem label="Tem operações internacionais?" value={entity.hasInternationalOperations} />
           <InfoItem label="É usada como 'shell company'?" value={entity.isShellCompany} />
        </>}
      </div>
    )
  }

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
    <>
    <ViewDocumentModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        document={selectedDocument}
        onDownload={handleDownloadDocument}
    />
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
            <div className={`p-4 rounded-lg mt-6 ${entity.status !== LegalStatus.Active ? 'bg-yellow-50 border border-yellow-200' : 'bg-background border border-border'}`}>
                <h4 className={`text-sm font-semibold flex items-center ${entity.status !== LegalStatus.Active ? 'text-yellow-800' : 'text-text-main'}`}>
                    <WarningIcon className={`w-5 h-5 mr-2 shrink-0 ${entity.status !== LegalStatus.Active ? 'text-yellow-600' : 'text-text-secondary'}`} />
                    Observação sobre o Estado Legal
                </h4>
                <textarea
                    value={legalStatusComment}
                    onChange={handleCommentChange}
                    rows={3}
                    className="w-full mt-2 bg-card border border-border rounded-lg p-2.5 text-text-main focus:ring-secondary focus:outline-none focus:ring-2"
                    placeholder="Adicione observações sobre o estado legal da entidade..."
                />
                {isCommentDirty && (
                    <div className="text-right mt-2">
                        <button
                            onClick={handleSaveComment}
                            className="bg-primary hover:bg-primary-hover text-white font-semibold py-1.5 px-4 rounded-lg text-sm transition-colors"
                        >
                            Salvar Observação
                        </button>
                    </div>
                )}
            </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-primary mb-4">Informação Geral e de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoItem label="NIF" value={entity.nif} />
                <InfoItem label="Registo Comercial" value={entity.commercialRegistration} />
                <InfoItem label="Beneficiário Efetivo (UBO)" value={entity.beneficialOwner} />
                <InfoItem label="Nome do Contacto Principal" value={entity.contact.name} />
                <InfoItem label="Email" value={<a href={`mailto:${entity.contact.email}`} className="text-primary hover:underline">{entity.contact.email}</a>} />
                <InfoItem label="Telefone" value={entity.contact.phone} />
                {entity.contact.website && <InfoItem label="Website" value={<a href={entity.contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{entity.contact.website}</a>} />}
                {entity.contact.linkedIn && <InfoItem label="LinkedIn" value={<a href={entity.contact.linkedIn} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver Perfil</a>} />}
            </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-primary mb-4">Dados Específicos da Entidade</h3>
            {renderSpecificDetails()}
        </div>

         <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold text-primary mb-4">Respostas de Due Diligence</h3>
            {renderDdqDetails()}
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
                                <th scope="col" className="px-6 py-4 font-semibold text-right">Ações</th>
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
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <button type="button" onClick={() => handleViewDocument(doc)} className="text-text-secondary hover:text-primary" aria-label="Visualizar"><EyeIcon className="w-5 h-5"/></button>
                                            <button type="button" onClick={() => handleDownloadDocument(doc)} className="text-text-secondary hover:text-primary" aria-label="Baixar"><DownloadIcon className="w-5 h-5"/></button>
                                        </div>
                                    </td>
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
    </>
  );
};

export default EntityReportPage;