import React, { useState } from 'react';
import { ModuleChangeProps, Entity, EntityType, RiskLevel, LegalStatus, AssessmentRequest } from '../types';
import { mockAssessmentRequests, mockEntities } from '../data/mockData';
import { useToast } from '../components/useToast';
import { EyeIcon } from '../components/icons/EyeIcon';

const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <h4 className="text-sm text-text-secondary font-medium">{label}</h4>
        <p className="text-md text-text-main font-semibold">{value || '-'}</p>
    </div>
);

const RequestDetailModal: React.FC<{ request: AssessmentRequest | null; onClose: () => void }> = ({ request, onClose }) => {
    if (!request) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
                        <h2 className="text-xl font-bold text-primary">Detalhes da Solicitação</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        <div>
                            <h3 className="text-lg font-semibold text-text-main mb-3">Detalhes do Requerente</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background p-4 rounded-lg">
                                <InfoItem label="Email do Requerente" value={request.requesterEmail} />
                                <InfoItem label="Data da Solicitação" value={request.requestDate} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-text-main mb-3">Dados do Fornecedor Proposto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background p-4 rounded-lg">
                                <InfoItem label="Nome" value={request.supplierData.name} />
                                <InfoItem label="NIF" value={request.supplierData.nif} />
                                <InfoItem label="Email de Contacto" value={<a href={`mailto:${request.supplierData.email}`} className="text-primary hover:underline">{request.supplierData.email}</a>} />
                                <InfoItem label="Telefone" value={request.supplierData.phone} />
                                <div className="md:col-span-2">
                                    {/* FIX: Use .join() to correctly display the array of services as a string. */}
                                    <InfoItem label="Serviços Solicitados" value={request.supplierData.services.join(', ')} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-text-main mb-3">Conteúdo do Email Original</h3>
                            <div className="bg-background p-4 rounded-lg border border-border text-sm text-text-secondary whitespace-pre-wrap font-mono">
                                {request.emailBody}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-2 p-4 bg-background border-t border-border rounded-b-lg">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-6 rounded-lg transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};


const AssessmentRequests: React.FC<ModuleChangeProps> = ({ onModuleChange }) => {
  const [requests, setRequests] = useState(mockAssessmentRequests);
  const { addToast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<AssessmentRequest | null>(null);

  const handleViewDetails = (request: AssessmentRequest) => {
    setSelectedRequest(request);
  };
  
  const handleStartAssessment = (request: AssessmentRequest) => {
    let entity = mockEntities.find(e => e.nif === request.supplierData.nif);
    
    if (!entity) {
      const newEntity: Entity = {
        id: String(Date.now()),
        entityType: EntityType.PrivateCompany,
        name: request.supplierData.name,
        category: 'A classificar',
        riskLevel: RiskLevel.Medium,
        status: LegalStatus.Active,
        onboardingDate: new Date().toISOString().split('T')[0],
        nif: request.supplierData.nif,
        commercialRegistration: '',
        beneficialOwner: '',
        address: 'A preencher',
        country: 'Angola',
        // FIX: Directly assign the services array as the type has been updated to string[].
        services: request.supplierData.services,
        contact: {
          name: 'A preencher',
          email: request.supplierData.email,
          phone: request.supplierData.phone,
        },
        documents: [],
      };
      mockEntities.unshift(newEntity);
      entity = newEntity;
      addToast(`Nova entidade "${entity.name}" criada a partir da solicitação.`, 'success');
    }

    const requestIndex = mockAssessmentRequests.findIndex(r => r.id === request.id);
    if (requestIndex > -1 && mockAssessmentRequests[requestIndex].status === 'Pendente') {
      mockAssessmentRequests[requestIndex].status = 'Em Processo';
      setRequests([...mockAssessmentRequests]);
    }

    onModuleChange('risk-assessment', { initialView: 'form', selectedId: entity.id });
  };

  return (
    <div className="animate-fade-in">
      <RequestDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      <div className="bg-card p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-bold text-primary">Fila de Solicitações de Avaliação</h1>
        <p className="text-text-secondary mt-1">Consulte as solicitações pendentes e inicie o processo de avaliação de risco.</p>
        <div className="mt-6 overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm text-left text-text-secondary">
            <thead className="text-xs text-text-main uppercase bg-background">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold">Data</th>
                <th scope="col" className="px-6 py-3 font-semibold">Requerente</th>
                <th scope="col" className="px-6 py-3 font-semibold">Fornecedor Proposto</th>
                <th scope="col" className="px-6 py-3 font-semibold">NIF</th>
                <th scope="col" className="px-6 py-3 font-semibold">Estado</th>
                <th scope="col" className="px-6 py-3 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{request.requestDate}</td>
                  <td className="px-6 py-4">{request.requesterEmail}</td>
                  <td className="px-6 py-4 font-medium text-text-main">{request.supplierData.name}</td>
                  <td className="px-6 py-4">{request.supplierData.nif}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      request.status === 'Pendente' ? 'bg-warning/20 text-warning' : 'bg-info/20 text-info'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-4">
                        <button onClick={() => handleViewDetails(request)} className="text-text-secondary hover:text-primary" aria-label="Ver Detalhes">
                            <EyeIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => handleStartAssessment(request)} className="font-medium text-primary hover:underline">
                          {request.status === 'Pendente' ? 'Iniciar Avaliação' : 'Ver Avaliação'}
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                  <tr>
                      <td colSpan={6} className="text-center py-8 text-text-secondary">Nenhuma solicitação pendente.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssessmentRequests;