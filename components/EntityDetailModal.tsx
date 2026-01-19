import React, { useState } from 'react';
import { Entity, RiskLevel, Document, DocumentStatus } from '../types';
import { WarningIcon } from './icons/WarningIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { EyeIcon } from './icons/EyeIcon';
import { useToast } from './useToast';
import ViewDocumentModal from './ViewDocumentModal';

const InfoItem: React.FC<{label: string, value: React.ReactNode}> = ({label, value}) => (
    <div className="bg-background p-3 rounded-md">
        <h4 className="text-xs text-text-secondary font-medium uppercase tracking-wider">{label}</h4>
        <p className="text-md text-text-main font-semibold mt-1">{value || '-'}</p>
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


interface EntityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: Entity | null;
}

const EntityDetailModal: React.FC<EntityDetailModalProps> = ({ isOpen, onClose, entity }) => {
  const { addToast } = useToast();
  const [isViewDocModalOpen, setIsViewDocModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleDownloadDocument = (doc: Document) => {
    addToast(`A simular o download do documento: ${doc.name}`, 'info', 'Download');
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsViewDocModalOpen(true);
  };

  if (!isOpen || !entity) return null;
  
  return (
    <>
      <ViewDocumentModal
        isOpen={isViewDocModalOpen}
        onClose={() => setIsViewDocModalOpen(false)}
        document={selectedDocument}
        onDownload={handleDownloadDocument}
      />
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
          <header className="flex items-center justify-between p-4 border-b border-border shrink-0">
            <div>
              <h2 className="text-xl font-bold text-primary">{entity.name}</h2>
              <p className="text-text-secondary text-sm">{entity.category}</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>
          <main className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Overview Section */}
              <div>
                  <h3 className="text-lg font-semibold text-text-main mb-3">Visão Geral</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                          <h4 className="text-sm text-yellow-800 font-semibold flex items-center">
                              <WarningIcon className="w-5 h-5 mr-2 text-yellow-600 shrink-0" />
                              Observação sobre o Estado Legal
                          </h4>
                          <p className="text-md text-yellow-700 mt-1 italic">"{entity.legalStatusComment}"</p>
                      </div>
                  )}
              </div>

              {/* Legal & Contact Section */}
              <div>
                  <h3 className="text-lg font-semibold text-text-main mb-3">Informação Legal e de Contacto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              
              {/* Services Section */}
              <div>
                  <h3 className="text-lg font-semibold text-text-main mb-3">Serviços Prestados</h3>
                  <div className="flex flex-wrap gap-2">
                      {entity.services.map(service => (
                          <span key={service} className="bg-background border border-border text-text-secondary text-sm font-medium px-3 py-1 rounded-full">{service}</span>
                      ))}
                  </div>
              </div>

              {/* Documents Section */}
              <div>
                  <h3 className="text-lg font-semibold text-text-main mb-3">Documentos</h3>
                  {entity.documents && entity.documents.length > 0 ? (
                      <div className="overflow-x-auto border border-border rounded-lg">
                          <table className="w-full text-sm text-left">
                              <thead className="text-xs text-text-secondary uppercase bg-background">
                                  <tr>
                                      <th scope="col" className="px-4 py-3 font-semibold">Documento</th>
                                      <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
                                      <th scope="col" className="px-4 py-3 font-semibold">Submissão</th>
                                      <th scope="col" className="px-4 py-3 font-semibold">Vencimento</th>
                                      <th scope="col" className="px-4 py-3 font-semibold text-right">Ações</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                  {entity.documents.map((doc, index) => (
                                      <tr key={index} className="hover:bg-background/50">
                                          <td className="px-4 py-2 font-medium text-text-main whitespace-nowrap">{doc.name}</td>
                                          <td className="px-4 py-2">
                                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[doc.status].classes}`}>
                                                  {doc.status}
                                              </span>
                                          </td>
                                          <td className="px-4 py-2 text-text-secondary">{doc.submissionDate}</td>
                                          <td className={`px-4 py-2 font-medium ${doc.status === 'Expirado' ? 'text-danger' : 'text-text-secondary'}`}>{doc.expiryDate || 'N/A'}</td>
                                          <td className="px-4 py-2 text-right">
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
                      <div className="bg-background p-4 rounded-lg text-center text-text-secondary text-sm">
                          Nenhum documento registado para esta entidade.
                      </div>
                  )}
              </div>
              
              {/* Status Log Section */}
              <div>
                  <h3 className="text-lg font-semibold text-text-main mb-3">Histórico de Estado</h3>
                  {entity.statusLog && entity.statusLog.length > 0 ? (
                      <div className="overflow-x-auto border border-border rounded-lg max-h-48 overflow-y-auto">
                          <table className="w-full text-sm text-left">
                              <thead className="text-xs text-text-secondary uppercase bg-background sticky top-0">
                                  <tr>
                                      <th scope="col" className="px-4 py-3 font-semibold">Data</th>
                                      <th scope="col" className="px-4 py-3 font-semibold">De</th>
                                      <th scope="col" className="px-4 py-3 font-semibold">Para</th>
                                      <th scope="col" className="px-4 py-3 font-semibold">Utilizador</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                  {entity.statusLog.slice().reverse().map((log, index) => (
                                      <tr key={index} className="hover:bg-background/50 group relative">
                                          <td className="px-4 py-2 text-text-secondary">{new Date(log.date).toLocaleDateString('pt-PT')}</td>
                                          <td className="px-4 py-2 font-medium text-text-secondary">{log.previousStatus}</td>
                                          <td className="px-4 py-2 font-medium text-text-main">{log.newStatus}</td>
                                          <td className="px-4 py-2 text-text-secondary">{log.user}</td>
                                          <div className="absolute left-4 top-full mt-1 w-72 p-3 bg-card border border-border text-text-main text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none transform">
                                              <p className="font-semibold mb-1 text-primary">Justificação:</p>
                                              <p className="text-text-secondary">{log.justification}</p>
                                          </div>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  ) : (
                      <div className="bg-background p-4 rounded-lg text-center text-text-secondary text-sm">
                          Nenhum histórico de alterações de estado.
                      </div>
                  )}
              </div>
          </main>
           <footer className="p-4 bg-background border-t border-border flex justify-end">
              <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-6 rounded-lg transition-colors">
                  Fechar
              </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default EntityDetailModal;