import React, { useState, useEffect, useRef } from 'react';
import { ModuleChangeProps, Entity, EntityType } from '../types';
import { validateNifExternally } from '../services/validationService';
import { CheckIcon } from '../components/icons/CheckIcon';
import { AlertCircleIcon } from '../components/icons/AlertCircleIcon';

interface NewEntityProps extends ModuleChangeProps {
    entityToEdit?: Entity;
}

const Step: React.FC<{ number: number; title: string; isActive: boolean; isCompleted: boolean }> = ({ number, title, isActive, isCompleted }) => (
    <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0
            ${isCompleted ? 'bg-success text-white' : isActive ? 'bg-primary text-white' : 'bg-border text-text-secondary'}`}>
            {isCompleted ? '✓' : number}
        </div>
        <div className={`font-semibold ${isActive || isCompleted ? 'text-primary' : 'text-text-secondary'}`}>{title}</div>
    </div>
);

const NewEntity: React.FC<NewEntityProps> = ({ onModuleChange, entityToEdit, setIsFormDirty }) => {
    const [step, setStep] = useState(1);
    const isEditMode = Boolean(entityToEdit);

    // State for all fields
    const [entityType, setEntityType] = useState<EntityType>(EntityType.PrivateCompany);
    const [entityName, setEntityName] = useState('');
    const [nif, setNif] = useState('');
    const [commercialRegistration, setCommercialRegistration] = useState('');
    const [category, setCategory] = useState('Serviços Petrolíferos');
    const [beneficialOwner, setBeneficialOwner] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [linkedIn, setLinkedIn] = useState('');
    const [services, setServices] = useState('');
    const [legalStatusComment, setLegalStatusComment] = useState('');

    const [nifError, setNifError] = useState('');
    const [nifSuccess, setNifSuccess] = useState('');
    const [isNifValidating, setIsNifValidating] = useState(false);
    
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isEditMode && entityToEdit) {
            setEntityType(entityToEdit.entityType);
            setEntityName(entityToEdit.name);
            setNif(entityToEdit.nif);
            setCommercialRegistration(entityToEdit.commercialRegistration);
            setCategory(entityToEdit.category);
            setBeneficialOwner(entityToEdit.beneficialOwner);
            setContactEmail(entityToEdit.contact.email);
            setWebsite(entityToEdit.contact.website || '');
            setLinkedIn(entityToEdit.contact.linkedIn || '');
            setServices(entityToEdit.services.join(', '));
            setLegalStatusComment(entityToEdit.legalStatusComment || '');
            setNifSuccess(`NIF ${entityToEdit.nif} validado previamente.`);
        }
    }, [isEditMode, entityToEdit]);

    // Effect to set form as dirty
    useEffect(() => {
        if (!setIsFormDirty) return;

        if (isInitialMount.current) {
            // After initial data load, any subsequent change is a user action.
            isInitialMount.current = false;
        } else {
            setIsFormDirty(true);
        }
    }, [entityType, entityName, nif, commercialRegistration, category, beneficialOwner, contactEmail, website, linkedIn, services, legalStatusComment, setIsFormDirty]);

    // Cleanup effect on unmount
    useEffect(() => {
        return () => {
            if (setIsFormDirty) {
                setIsFormDirty(false);
            }
        };
    }, [setIsFormDirty]);


    const validateNifLocally = (value: string): boolean => {
        if (!value) {
            setNifError('O NIF é obrigatório.');
            return false;
        }
        setNifError('');
        return true;
    };

    const handleNifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Allow only digits
        setNif(value);
        setNifSuccess('');
        validateNifLocally(value);
    };

    const handleNifBlur = async () => {
        if (isEditMode) return; // Don't re-validate in edit mode
        if (!validateNifLocally(nif)) {
            return;
        }
        setIsNifValidating(true);
        setNifError('');
        setNifSuccess('');
        
        const result = await validateNifExternally(nif);
        
        if (result.success && result.data) {
            setNifSuccess(result.message);
            setEntityName(result.data.name);
        } else {
            setNifError(result.message);
        }
        setIsNifValidating(false);
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    const submit = () => {
        if(setIsFormDirty) setIsFormDirty(false);
        onModuleChange('entities');
    }
    
    const isStep1Valid = entityName.trim() !== '' && nif.trim() !== '' && nifError === '' && nifSuccess !== '' && !isNifValidating;

    const showCommercialRegistration = [EntityType.PrivateCompany, EntityType.NGO].includes(entityType);
    const showBeneficialOwner = [EntityType.PrivateCompany, EntityType.NGO].includes(entityType);

    return (
        <div className="bg-card p-8 rounded-xl shadow-md max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-primary mb-2">{isEditMode ? 'Editar Entidade' : 'Cadastrar Nova Entidade'}</h2>
            <p className="text-text-secondary mb-8">{isEditMode ? 'Atualize as informações da entidade abaixo.' : 'Siga os passos para adicionar um novo terceiro ao sistema.'}</p>

            <div className="flex justify-between items-center mb-10 p-4 bg-background rounded-lg">
                <Step number={1} title="Informações Básicas" isActive={step === 1} isCompleted={step > 1} />
                <div className="flex-1 h-0.5 bg-border mx-4"></div>
                <Step number={2} title="Detalhes Adicionais" isActive={step === 2} isCompleted={step > 2} />
                <div className="flex-1 h-0.5 bg-border mx-4"></div>
                <Step number={3} title="Revisar e Submeter" isActive={step === 3} isCompleted={false} />
            </div>

            <div className="animate-fade-in">
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Tipo de Entidade</label>
                             <select
                                value={entityType}
                                onChange={(e) => setEntityType(e.target.value as EntityType)}
                                disabled={isEditMode}
                                className={`w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none ${isEditMode ? 'cursor-not-allowed bg-gray-200' : ''}`}
                            >
                                {Object.values(EntityType).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                             {isEditMode && <p className="text-xs text-text-secondary mt-1">O tipo de entidade não pode ser alterado após o registo.</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Nome da Entidade</label>
                            <input 
                                type="text" 
                                value={entityName}
                                onChange={(e) => setEntityName(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none" 
                                placeholder="Ex: SocoOil, Lda." 
                            />
                        </div>
                        
                        <div className={showCommercialRegistration ? 'md:col-span-1' : 'md:col-span-2'}>
                            <label className="block text-sm font-medium text-text-secondary mb-1">NIF (Número de Identificação Fiscal)</label>
                             <div className="relative">
                                <input 
                                    type="text" 
                                    value={nif}
                                    onChange={handleNifChange}
                                    onBlur={handleNifBlur}
                                    readOnly={isEditMode}
                                    className={`w-full bg-background border rounded-lg p-2.5 text-text-main focus:ring-2 focus:outline-none ${isEditMode ? 'cursor-not-allowed bg-gray-200' : ''} ${nifError ? 'border-danger focus:ring-danger' : nifSuccess ? 'border-success focus:ring-success' : 'border-border focus:ring-secondary'}`} 
                                    placeholder="Ex: 5000123456" 
                                />
                                {isNifValidating && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                )}
                                {nifSuccess && !isNifValidating && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3"><CheckIcon className="h-5 w-5 text-success" /></div>
                                )}
                                {nifError && !isNifValidating && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3"><AlertCircleIcon className="h-5 w-5 text-danger" /></div>
                                )}
                             </div>
                            {isNifValidating && <p className="text-info text-xs mt-1">A validar NIF...</p>}
                            {nifError && <p className="text-danger text-xs mt-1">{nifError}</p>}
                            {nifSuccess && <p className="text-success text-xs mt-1">{nifSuccess}</p>}
                        </div>

                        {showCommercialRegistration && (
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Nº de Registo Comercial</label>
                                <input type="text" value={commercialRegistration} onChange={e => setCommercialRegistration(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none" placeholder="Ex: CRC-LUAN-2010-101" />
                            </div>
                        )}
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Categoria da Entidade</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none">
                                <option>Serviços Petrolíferos</option>
                                <option>Logística Portuária</option>
                                <option>Consultoria Jurídica</option>
                                <option>Tecnologia da Informação</option>
                                <option>Transporte e Frete</option>
                                <option>Auditoria</option>
                                <option>Segurança Cibernética</option>
                                <option>Governamental</option>
                                <option>Ação Social</option>
                            </select>
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Observações sobre o Estado Legal</label>
                            <textarea 
                                value={legalStatusComment} 
                                onChange={e => setLegalStatusComment(e.target.value)} 
                                rows={3}
                                className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" 
                                placeholder="Adicione observações se o estado legal não for 'Ativo' (ex: justificação para estado suspenso)." 
                            />
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {showBeneficialOwner && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text-secondary mb-1">Beneficiário Efetivo</label>
                                <input type="text" value={beneficialOwner} onChange={e => setBeneficialOwner(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" placeholder="Ex: José Eduardo" />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Email de Contacto</label>
                            <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" placeholder="Ex: contacto@socooil.co.ao" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Website</label>
                            <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" placeholder="https://www.exemplo.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">LinkedIn</label>
                            <input type="url" value={linkedIn} onChange={e => setLinkedIn(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" placeholder="https://linkedin.com/company/exemplo" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Serviços Prestados (separados por vírgula)</label>
                            <input type="text" value={services} onChange={e => setServices(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" placeholder="Ex: Manutenção de Plataformas, Logística de Equipamentos" />
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="bg-background p-6 rounded-lg border border-border">
                        <h3 className="font-semibold text-text-main mb-4">Rever Detalhes</h3>
                        <p className="text-text-secondary">Por favor, reveja toda a informação antes de submeter.</p>
                        <p className="mt-4 text-sm text-yellow-600">Esta é uma UI simplificada. Uma aplicação real mostraria aqui um resumo de todos os dados introduzidos.</p>
                    </div>
                )}
            </div>
            
            <div className="flex justify-between items-center mt-10 border-t border-border pt-6">
                <button onClick={() => onModuleChange('menu-dashboard')} className="bg-danger/10 hover:bg-danger/20 text-danger font-semibold py-2 px-4 rounded-lg transition-colors">
                    Sair sem Salvar
                </button>
                <div className="flex items-center space-x-4">
                    {step > 1 && (
                        <button onClick={prevStep} className="bg-background border border-border hover:bg-border text-text-main font-semibold py-2 px-4 rounded-lg">
                            Anterior
                        </button>
                    )}
                    {step < 3 ? (
                        <button 
                            onClick={nextStep} 
                            disabled={step === 1 && !isStep1Valid}
                            className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            Próximo &rarr;
                        </button>
                    ) : (
                         <button onClick={submit} className="bg-success hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">
                            {isEditMode ? 'Salvar Alterações' : 'Submeter'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewEntity;