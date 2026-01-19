import React, { useState, useEffect } from 'react';
import { Entity, EntityType, RiskLevel, LegalStatus, Document, DocumentStatus } from '../types';
import { useToast } from './useToast';
import UploadDocumentModal from './UploadDocumentModal';
import ViewDocumentModal from './ViewDocumentModal';
import { EyeIcon } from './icons/EyeIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { countrySpecificDocuments, supportedCountries } from '../data/documentData';
import { mockEntities } from '../data/mockData';

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newEntity: Entity) => void;
  initialName?: string;
  initialNif?: string;
}

const statusConfig: Record<DocumentStatus, { classes: string }> = {
    'Pendente': { classes: 'bg-warning/20 text-warning' },
    'Expirado': { classes: 'bg-danger/20 text-danger' },
    'Verificado': { classes: 'bg-success/20 text-success' },
    'Recebido': { classes: 'bg-info/20 text-info' },
};

const AddEntityModal: React.FC<AddEntityModalProps> = ({ isOpen, onClose, onSave, initialName = '', initialNif = '' }) => {
    const [entityType, setEntityType] = useState<EntityType>(EntityType.PrivateCompany);
    const [name, setName] = useState(initialName);
    const [nif, setNif] = useState(initialNif);
    const [commercialRegistration, setCommercialRegistration] = useState('');
    const [category, setCategory] = useState('Serviços Petrolíferos');
    const [beneficialOwner, setBeneficialOwner] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [address, setAddress] = useState('');
    const [country, setCountry] = useState('Angola');
    const [services, setServices] = useState('');
    const [documents, setDocuments] = useState<Document[]>([]);
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setNif(initialNif);
            setEntityType(EntityType.PrivateCompany);
            setCommercialRegistration('');
            setCategory('Serviços Petrolíferos');
            setBeneficialOwner('');
            setContactEmail('');
            setContactName('');
            setContactPhone('');
            setAddress('');
            setCountry('Angola');
            setServices('');
            setDocuments([]);
        }
    }, [isOpen, initialName, initialNif]);
    
    const suggestedDocsForCountry = React.useMemo(() => {
        const countryDocs = countrySpecificDocuments[country as keyof typeof countrySpecificDocuments] || countrySpecificDocuments['Angola'];
        const standardDocs = [
            'Apólices de Seguro',
            'Relatório de Contas',
            'Certificação ISO 9001',
            'Licença de Operador',
        ];
        return [...new Set([...Object.values(countryDocs), ...standardDocs])];
    }, [country]);


    if (!isOpen) return null;
    
    const handleUploadDocument = (newDocData: { name: string; status: DocumentStatus }) => {
        const newDoc: Document = { ...newDocData, submissionDate: new Date().toISOString().split('T')[0] };
        setDocuments(prev => [...prev, newDoc]);
    };

    const handleViewDocument = (doc: Document) => {
        setSelectedDocument(doc);
        setIsViewModalOpen(true);
    };
    
    const handleDownloadDocument = (doc: Document) => {
        addToast(`A simular o download do documento: ${doc.name}`, 'info', 'Download');
    };

    const handleDeleteDocument = (docNameToDelete: string) => {
        if (window.confirm(`Tem a certeza que deseja apagar o documento "${docNameToDelete}"?`)) {
            setDocuments(prev => prev.filter(d => d.name !== docNameToDelete));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !nif.trim()) {
            addToast('Nome e NIF são obrigatórios.', 'error');
            return;
        }

        const nifExists = mockEntities.some(e => e.nif === nif && nif.trim() !== '');
        if (nifExists) {
            addToast('Erro: Já existe uma entidade com este NIF.', 'error');
            return;
        }
        const nameExists = mockEntities.some(e => e.name.toLowerCase() === name.toLowerCase());
        if (nameExists) {
            addToast('Erro: Já existe uma entidade com este nome.', 'error');
            return;
        }

        const newEntity: Entity = {
            id: String(Date.now()),
            entityType, name, category, nif, country,
            riskLevel: RiskLevel.Medium,
            status: LegalStatus.Active,
            onboardingDate: new Date().toISOString().split('T')[0],
            commercialRegistration,
            beneficialOwner,
            address,
            services: services.split(',').map(s => s.trim()).filter(Boolean),
            contact: {
                name: contactName,
                email: contactEmail,
                phone: contactPhone,
            },
            documents,
        };
        onSave(newEntity);
    };
    
    const showCommercialRegistration = [EntityType.PrivateCompany, EntityType.NGO].includes(entityType);
    const showBeneficialOwner = [EntityType.PrivateCompany, EntityType.NGO].includes(entityType);

    return (
        <>
        <UploadDocumentModal 
            isOpen={isUploadModalOpen} 
            onClose={() => setIsUploadModalOpen(false)} 
            onUpload={handleUploadDocument}
            suggestedDocs={suggestedDocsForCountry} 
        />
        <ViewDocumentModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} document={selectedDocument} onDownload={handleDownloadDocument} />

        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-border shrink-0">
                    <h2 className="text-xl font-bold text-primary">Adicionar Nova Entidade</h2>
                </header>
                <main className="p-6 overflow-y-auto">
                    <form id="add-entity-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <section>
                            <h3 className="text-lg font-semibold text-text-main mb-3">Informações Básicas</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Tipo de Entidade</label>
                                    <select value={entityType} onChange={(e) => setEntityType(e.target.value as EntityType)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none">
                                        {Object.values(EntityType).map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">País</label>
                                    <select value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none">
                                        {supportedCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Nome da Entidade</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">NIF / VAT / Tax ID</label>
                                    <input type="text" value={nif} onChange={e => setNif(e.target.value)} required className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" />
                                </div>
                                 {showCommercialRegistration && (
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Nº de Registo Comercial</label>
                                        <input type="text" value={commercialRegistration} onChange={e => setCommercialRegistration(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Categoria</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main">
                                        <option>Serviços Petrolíferos</option>
                                        <option>Logística Portuária</option>
                                        <option>Consultoria Jurídica</option>
                                    </select>
                                </div>
                               
                            </div>
                        </section>

                        {/* Contact Info */}
                        <section className="border-t border-border pt-6">
                            <h3 className="text-lg font-semibold text-text-main mb-3">Detalhes de Contacto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Contacto</label>
                                    <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Telefone</label>
                                    <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                                    <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Endereço</label>
                                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" />
                                </div>
                            </div>
                        </section>

                        {/* Additional Details */}
                        <section className="border-t border-border pt-6">
                            <h3 className="text-lg font-semibold text-text-main mb-3">Detalhes Adicionais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {showBeneficialOwner && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Beneficiário Efetivo</label>
                                        <input type="text" value={beneficialOwner} onChange={e => setBeneficialOwner(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" />
                                    </div>
                                )}
                                 <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Serviços Prestados (separados por vírgula)</label>
                                    <input type="text" value={services} onChange={e => setServices(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" />
                                </div>
                            </div>
                        </section>

                        {/* Document Management */}
                         <section className="border-t border-border pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-text-main">Gestão de Documentos</h3>
                                <button type="button" onClick={() => setIsUploadModalOpen(true)} className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg text-sm">
                                    + Adicionar Documento
                                </button>
                            </div>
                            <div className="overflow-x-auto border border-border rounded-lg">
                                <table className="w-full text-sm text-left text-text-secondary">
                                    <thead className="text-xs text-text-secondary uppercase bg-background">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 font-semibold">Documento</th>
                                            <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
                                            <th scope="col" className="px-4 py-3 font-semibold text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {documents.map((doc, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium text-text-main">{doc.name}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[doc.status].classes}`}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <div className="flex items-center justify-end gap-4">
                                                        <button type="button" onClick={() => handleViewDocument(doc)} className="text-text-secondary hover:text-primary"><EyeIcon className="w-5 h-5"/></button>
                                                        <button type="button" onClick={() => handleDownloadDocument(doc)} className="text-text-secondary hover:text-primary"><DownloadIcon className="w-5 h-5"/></button>
                                                        <button type="button" onClick={() => handleDeleteDocument(doc.name)} className="text-text-secondary hover:text-danger"><TrashIcon className="w-5 h-5"/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {documents.length === 0 && (
                                            <tr><td colSpan={3} className="text-center p-4">Nenhum documento adicionado.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </form>
                </main>
                <footer className="p-4 bg-background border-t border-border flex justify-end gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg">Cancelar</button>
                    <button type="submit" form="add-entity-form" className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg">Salvar Entidade</button>
                </footer>
            </div>
        </div>
        </>
    );
};

export default AddEntityModal;