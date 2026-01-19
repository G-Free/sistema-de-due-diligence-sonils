/**
 * @file NewEntityPage.tsx
 * @description
 * Refatorei o formulário para um fluxo de 4 passos (Informações Básicas, Detalhes KYC/KYB, Análise DDQ, Revisão), 
 * adicionei campos específicos e validação para cada tipo de entidade (Pessoa Individual, Empresa, Entidade Pública, ONG), 
 * e implementei as novas questões de DDQ no passo 3.
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ModuleChangeProps, Entity, EntityType, Document, DocumentStatus, RiskLevel, LegalStatus, Shareholder } from '../types';
import { validateNifExternally, checkSanctionsLists, checkPepStatus, pepDatabase } from '../services/validationService';
import { CheckIcon } from '../components/icons/CheckIcon';
import { AlertCircleIcon } from '../components/icons/AlertCircleIcon';
import ViewDocumentModal from '../components/ViewDocumentModal';
import { mockEntities } from '../data/mockData';
import { EyeIcon } from '../components/icons/EyeIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { useToast } from '../components/useToast';
import { countrySpecificDocuments, supportedCountries } from '../data/documentData';
import { ShieldAlertIcon } from '../components/icons/ShieldAlertIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { InfoIcon } from '../components/icons/InfoIcon';
import { SpinnerIcon } from '../components/icons/SparklesIcon';
import { EditIcon } from '../components/icons/EditIcon';

// FIX: Defined locally as data/servicesData.ts is missing from provided files.
const predefinedServices = [
  'Manutenção de Plataformas',
  'Logística de Equipamentos',
  'Gestão de Carga',
  'Armazenagem',
  'Due Diligence Legal',
  'Compliance Regulatório',
  'Infraestrutura de IT',
  'Cibersegurança',
  'Transporte Internacional',
  'Desembaraço Aduaneiro',
  'Auditoria',
  'Trânsito',
  'Pentesting',
  'Análise de Vulnerabilidades',
  'Regulação Fiscal',
  'Apoio à Infância',
  'Relatórios de Impacto Ambiental',
  'Serviços de Catering',
  'Consultoria de Gestão',
  'Recursos Humanos',
  'Serviços de Limpeza Industrial',
];


interface NewEntityProps extends ModuleChangeProps {
    entityToEdit?: Entity;
}

const Step: React.FC<{ number: number; title: string; isActive: boolean; isCompleted: boolean }> = ({ number, title, isActive, isCompleted }) => (
    <div className="flex flex-col items-center text-center w-32 sm:w-40">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2 transition-all
            ${isCompleted ? 'bg-success border-success text-white' : isActive ? 'bg-primary border-primary text-white' : 'bg-card border-border text-text-secondary'}`}>
            {isCompleted ? '✓' : number}
        </div>
        <div className={`mt-2 font-semibold text-xs sm:text-sm ${isActive || isCompleted ? 'text-primary' : 'text-text-secondary'}`}>{title}</div>
    </div>
);

const statusConfig: Record<DocumentStatus, { classes: string }> = {
    'Pendente': { classes: 'bg-warning/20 text-warning' },
    'Expirado': { classes: 'bg-danger/20 text-danger' },
    'Verificado': { classes: 'bg-success/20 text-success' },
    'Recebido': { classes: 'bg-info/20 text-info' },
};

const SanctionCheckResult: React.FC<{isChecking: boolean, result: {matches: any[]} | null}> = ({ isChecking, result }) => (
    <div className="mt-2 min-h-[4rem] bg-background p-3 rounded-lg border border-border flex items-start">
        {isChecking ? (
            <>
                <SpinnerIcon className="w-5 h-5 text-primary mr-3 shrink-0" />
                <div>
                    <p className="font-semibold text-text-main text-sm">A verificar em listas de sanções...</p>
                    <p className="text-xs text-text-secondary">A consultar OFAC, ONU e outras (simulado).</p>
                </div>
            </>
        ) : result ? (
            result.matches.length > 0 ? (
                <>
                    <ShieldAlertIcon className="w-5 h-5 text-danger mr-3 shrink-0" />
                    <div>
                        <p className="font-semibold text-danger text-sm">Alerta de Sanção</p>
                        <p className="text-xs text-text-secondary">
                            Potencial correspondência na lista {result.matches[0].list}: 
                            <strong> {result.matches[0].name}</strong> ({result.matches[0].reason}).
                        </p>
                    </div>
                </>
            ) : (
                <>
                    <ShieldCheckIcon className="w-5 h-5 text-success mr-3 shrink-0" />
                    <div>
                        <p className="font-semibold text-success text-sm">Verificação Concluída</p>
                        <p className="text-xs text-text-secondary">Nenhuma correspondência encontrada.</p>
                    </div>
                </>
            )
        ) : (
             <>
                <InfoIcon className="w-5 h-5 text-text-secondary mr-3 shrink-0" />
                <div>
                    <p className="font-semibold text-text-main text-sm">Verificação de Sanções</p>
                    <p className="text-xs text-text-secondary">O sistema verifica o nome em listas de sanções.</p>
                </div>
            </>
        )}
    </div>
);

const PepCheckResult: React.FC<{ isChecking: boolean, result: { isPep: boolean, details?: string } | null }> = ({ isChecking, result }) => (
    <div className="mt-2 min-h-[4rem] bg-background p-3 rounded-lg border border-border flex items-start">
        {isChecking ? (
            <>
                <SpinnerIcon className="w-5 h-5 text-primary mr-3 shrink-0" />
                <div>
                    <p className="font-semibold text-text-main text-sm">A verificar status de PEP...</p>
                    <p className="text-xs text-text-secondary">A consultar bases de dados globais (simulado).</p>
                </div>
            </>
        ) : result ? (
            result.isPep ? (
                <>
                    <ShieldAlertIcon className="w-5 h-5 text-warning mr-3 shrink-0" />
                    <div>
                        <p className="font-semibold text-warning text-sm">Alerta de PEP</p>
                        <p className="text-xs text-text-secondary">
                            Potencial correspondência: <strong>Pessoa Politicamente Exposta.</strong>
                            {result.details && ` Detalhes: ${result.details}`}
                        </p>
                    </div>
                </>
            ) : (
                <>
                    <ShieldCheckIcon className="w-5 h-5 text-success mr-3 shrink-0" />
                    <div>
                        <p className="font-semibold text-success text-sm">Verificação PEP Concluída</p>
                        <p className="text-xs text-text-secondary">Nenhuma correspondência PEP encontrada.</p>
                    </div>
                </>
            )
        ) : (
            <>
                <InfoIcon className="w-5 h-5 text-text-secondary mr-3 shrink-0" />
                <div>
                    <p className="font-semibold text-text-main text-sm">Verificação de PEP</p>
                    <p className="text-xs text-text-secondary">Verifica se o nome corresponde a uma Pessoa Politicamente Exposta.</p>
                </div>
            </>
        )}
    </div>
);

const ReviewItem: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth = false }) => (
    <div className={fullWidth ? "sm:col-span-2 lg:col-span-3" : ""}>
        <dt className="text-sm font-medium text-text-secondary">{label}</dt>
        <dd className="mt-1 text-sm text-text-main font-semibold break-words">{children || <span className="text-text-secondary italic">Não preenchido</span>}</dd>
    </div>
);

const ReviewSection: React.FC<{ title: string; onEdit: () => void; children: React.ReactNode }> = ({ title, onEdit, children }) => (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-border">
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
            <h3 className="text-lg font-semibold text-primary">{title}</h3>
            <button type="button" onClick={onEdit} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5">
                <EditIcon className="w-4 h-4" />
                Editar
            </button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
            {children}
        </dl>
    </div>
);


const NewEntityPage: React.FC<NewEntityProps> = ({ onModuleChange, entityToEdit, setIsFormDirty }) => {
    const [step, setStep] = useState(1);
    const isEditMode = Boolean(entityToEdit);

    // Form states
    const [entityType, setEntityType] = useState<EntityType>(EntityType.PrivateCompany);
    const [entityName, setEntityName] = useState('');
    const [nif, setNif] = useState('');
    const [commercialRegistration, setCommercialRegistration] = useState('');
    const [category, setCategory] = useState('Serviços Petrolíferos');
    const [riskLevel, setRiskLevel] = useState<RiskLevel>(RiskLevel.Medium);
    const [country, setCountry] = useState('Angola');
    const [address, setAddress] = useState('');
    const [beneficialOwner, setBeneficialOwner] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [linkedIn, setLinkedIn] = useState('');
    const [services, setServices] = useState<string[]>([]);
    const [legalStatusComment, setLegalStatusComment] = useState('');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [incorporationDate, setIncorporationDate] = useState('');
    
    // KYC Fields
    const [kycFields, setKycFields] = useState<Partial<Entity>>({});

    // DDQ States
    const [shareholders, setShareholders] = useState<Shareholder[]>([]);

    // Control states
    const [nifError, setNifError] = useState('');
    const [nifSuccess, setNifSuccess] = useState('');
    const [isNifValidating, setIsNifValidating] = useState(false);
    const [beneficialOwnerError, setBeneficialOwnerError] = useState('');
    const [addressError, setAddressError] = useState('');
    const [incorporationDateError, setIncorporationDateError] = useState('');

    // KYC Error states
    const [contactPhoneError, setContactPhoneError] = useState('');
    const [birthDateError, setBirthDateError] = useState('');
    const [entityNationalityError, setEntityNationalityError] = useState('');
    const [taxResidencyCountryError, setTaxResidencyCountryError] = useState('');
    const [professionError, setProfessionError] = useState('');
    const [maritalStatusError, setMaritalStatusError] = useState('');

    // KYB Error states
    const [legalEntityTypeError, setLegalEntityTypeError] = useState('');
    const [caeError, setCaeError] = useState('');
    const [employeeCountError, setEmployeeCountError] = useState('');
    const [lastYearTurnoverError, setLastYearTurnoverError] = useState('');
    const [legalRepNameError, setLegalRepNameError] = useState('');
    const [legalRepDocError, setLegalRepDocError] = useState('');

    // Public Entity Error States
    const [officialRegistrationNumberError, setOfficialRegistrationNumberError] = useState('');
    const [supervisingMinistryError, setSupervisingMinistryError] = useState('');
    const [institutionalHeadNameError, setInstitutionalHeadNameError] = useState('');
    const [publicActivityNatureError, setPublicActivityNatureError] = useState('');

    // NGO Error States
    const [ngoRegistrationNumberError, setNgoRegistrationNumberError] = useState('');
    const [socialPurposeError, setSocialPurposeError] = useState('');
    const [territorialScopeError, setTerritorialScopeError] = useState('');
    const [sourceOfFundsError, setSourceOfFundsError] = useState('');

    
    // Sanctions Check State
    const [isNameSanctionChecking, setIsNameSanctionChecking] = useState(false);
    const [nameSanctionResult, setNameSanctionResult] = useState<{ matches: any[] } | null>(null);
    const [isOwnerSanctionChecking, setIsOwnerSanctionChecking] = useState(false);
    const [ownerSanctionResult, setOwnerSanctionResult] = useState<{ matches: any[] } | null>(null);
    
    // PEP Check State
    const [isNamePepChecking, setIsNamePepChecking] = useState(false);
    const [namePepResult, setNamePepResult] = useState<{ isPep: boolean; details?: string; } | null>(null);
    const [isOwnerPepChecking, setIsOwnerPepChecking] = useState(false);
    const [ownerPepResult, setOwnerPepResult] = useState<{ isPep: boolean; details?: string; } | null>(null);

    const [debouncedName, setDebouncedName] = useState(entityName);
    const [debouncedOwner, setDebouncedOwner] = useState(beneficialOwner);

    // Autocomplete states
    const [uboSuggestions, setUboSuggestions] = useState<string[]>([]);
    const [showUboSuggestions, setShowUboSuggestions] = useState(false);
    const uboInputRef = useRef<HTMLDivElement>(null);
    const [shareholderSuggestions, setShareholderSuggestions] = useState<string[]>([]);
    const [activeShareholderIndex, setActiveShareholderIndex] = useState<number | null>(null);
    const shareholderContainerRef = useRef<HTMLDivElement>(null);

    
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const { addToast } = useToast();

    const isInitialMount = useRef(true);

    // New state for inline document form
    const [newDocType, setNewDocType] = useState('');
    const [isCustomDoc, setIsCustomDoc] = useState(false);
    const [customDocName, setCustomDocName] = useState('');
    const [newDocFile, setNewDocFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Multiselect states for services
    const [serviceInput, setServiceInput] = useState('');
    const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
    const servicesInputRef = useRef<HTMLDivElement>(null);

    const isNifRequired = useMemo(() => entityType === EntityType.PrivateCompany || entityType === EntityType.PublicEntity || entityType === EntityType.Individual, [entityType]);
    
    // Click outside handlers
    const useClickOutside = (ref: React.RefObject<any>, callback: () => void) => {
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (ref.current && !ref.current.contains(event.target as Node)) {
                    callback();
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [ref, callback]);
    };
    
    useClickOutside(uboInputRef, () => setShowUboSuggestions(false));
    useClickOutside(servicesInputRef, () => setShowServiceSuggestions(false));
    useClickOutside(shareholderContainerRef, () => {
        setActiveShareholderIndex(null);
    });

    const suggestedDocsForCountry = useMemo(() => {
        const countryDocs = countrySpecificDocuments[country as keyof typeof countrySpecificDocuments] || countrySpecificDocuments['Angola'];
        const standardDocs = [
            'Apólices de Seguro',
            'Relatório de Contas',
            'Certificação ISO 9001',
            'Licença de Operador',
        ];
        return [...new Set([...Object.values(countryDocs), ...standardDocs])];
    }, [country]);
    
    useEffect(() => {
        if (!isCustomDoc) {
            setNewDocType(suggestedDocsForCountry[0] || '');
        }
    }, [suggestedDocsForCountry, isCustomDoc]);


    useEffect(() => {
        if (isEditMode && entityToEdit) {
            setEntityType(entityToEdit.entityType);
            setEntityName(entityToEdit.name);
            setNif(entityToEdit.nif);
            setCommercialRegistration(entityToEdit.commercialRegistration);
            setCategory(entityToEdit.category);
            setRiskLevel(entityToEdit.riskLevel);
            setCountry(entityToEdit.country);
            setAddress(entityToEdit.address);
            setBeneficialOwner(entityToEdit.beneficialOwner);
            setContactName(entityToEdit.contact.name || '');
            setContactEmail(entityToEdit.contact.email);
            setContactPhone(entityToEdit.contact.phone || '');
            setWebsite(entityToEdit.contact.website || '');
            setLinkedIn(entityToEdit.contact.linkedIn || '');
            setServices(entityToEdit.services || []);
            setLegalStatusComment(entityToEdit.legalStatusComment || '');
            setDocuments(entityToEdit.documents || []);
            setShareholders(entityToEdit.shareholders || []);
            setIncorporationDate(entityToEdit.incorporationDate || '');
            setNifSuccess(`NIF ${entityToEdit.nif} validado previamente.`);
            // Set KYC fields
            const existingKyc = (({ 
                sourceOfFunds, maritalStatus, birthDate, nationality, taxResidencyCountry, profession, employer, isPep, sourceOfWealth, criminalRecordDetails, hasOwnBusiness, legalEntityType, cae, employeeCount, lastYearTurnover, legalRepresentativeName, legalRepresentativeDocument, uboIsPep, hasRealEconomicActivity, sanctionsHistory, hasInternationalOperations, isShellCompany, officialRegistrationNumber, supervisingMinistry, institutionalHeadName, institutionalHeadPosition, isRepresentativeFormallyAppointed, publicActivityNature, ngoRegistrationNumber, socialPurpose, territorialScope, receivesInternationalFunding, operatesInConflictZones, illicitFinancingHistory 
            }) => ({ 
                sourceOfFunds, maritalStatus, birthDate, nationality, taxResidencyCountry, profession, employer, isPep, sourceOfWealth, criminalRecordDetails, hasOwnBusiness, legalEntityType, cae, employeeCount, lastYearTurnover, legalRepresentativeName, legalRepresentativeDocument, uboIsPep, hasRealEconomicActivity, sanctionsHistory, hasInternationalOperations, isShellCompany, officialRegistrationNumber, supervisingMinistry, institutionalHeadName, institutionalHeadPosition, isRepresentativeFormallyAppointed, publicActivityNature, ngoRegistrationNumber, socialPurpose, territorialScope, receivesInternationalFunding, operatesInConflictZones, illicitFinancingHistory 
            }))(entityToEdit);
            setKycFields(existingKyc);
        }
    }, [isEditMode, entityToEdit]);

    useEffect(() => {
        if (!setIsFormDirty) return;
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setIsFormDirty(true);
        }
    }, [entityType, entityName, nif, commercialRegistration, category, country, address, beneficialOwner, contactName, contactEmail, contactPhone, website, linkedIn, services, legalStatusComment, documents, shareholders, kycFields, incorporationDate, riskLevel, setIsFormDirty]);

    useEffect(() => {
        return () => { if (setIsFormDirty) setIsFormDirty(false); };
    }, [setIsFormDirty]);
    
    // Debounce for entity name checks
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedName(entityName), 500);
        return () => clearTimeout(handler);
    }, [entityName]);

    useEffect(() => {
        const doChecks = (name: string) => {
            if (!name.trim()) {
                setNameSanctionResult(null);
                setNamePepResult(null);
                return;
            }
            
            setIsNameSanctionChecking(true);
            checkSanctionsLists(name).then(result => {
                setNameSanctionResult(result);
                setIsNameSanctionChecking(false);
            });

            if (country === 'Portugal') {
                setIsNamePepChecking(true);
                checkPepStatus(name).then(result => {
                    setNamePepResult(result);
                    setIsNamePepChecking(false);
                });
            } else {
                setNamePepResult(null);
            }
        };
        doChecks(debouncedName);
    }, [debouncedName, country]);
    
    // Debounce for beneficial owner checks
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedOwner(beneficialOwner), 500);
        return () => clearTimeout(handler);
    }, [beneficialOwner]);

    useEffect(() => {
        const doChecks = (name: string) => {
            if (!name.trim()) {
                setOwnerSanctionResult(null);
                setOwnerPepResult(null);
                setIsOwnerSanctionChecking(false); 
                setIsOwnerPepChecking(false);
                return;
            }
            
            setIsOwnerSanctionChecking(true);
            setIsOwnerPepChecking(true); // Assume we check both if applicable

            checkSanctionsLists(name).then(result => {
                setOwnerSanctionResult(result);
                setIsOwnerSanctionChecking(false);
            });

            if (country === 'Portugal') {
                checkPepStatus(name).then(result => {
                    setOwnerPepResult(result);
                    setIsOwnerPepChecking(false);
                });
            } else {
                setOwnerPepResult(null);
                setIsOwnerPepChecking(false);
            }
        };
        doChecks(debouncedOwner);
    }, [debouncedOwner, country]);


    const validateNifLocally = (value: string): boolean => {
        if (isNifRequired && !value.trim()) {
            setNifError('Este campo é obrigatório para este tipo de entidade.');
            setNifSuccess('');
            return false;
        }
        
        if (!value.trim()) {
            setNifError('');
            setNifSuccess('');
            return true;
        }
    
        let formatError = '';
        switch (entityType) {
            case EntityType.Individual:
                if (!/^\d{9}[A-Z]{2}\d{3}$/i.test(value)) {
                    formatError = 'Formato incorreto. Ex: 001234567LA038.';
                }
                break;
            case EntityType.PrivateCompany:
            case EntityType.PublicEntity:
                if (!/^\d{9}$/.test(value)) {
                    formatError = 'Formato incorreto. O NIF deve ter 9 dígitos.';
                }
                break;
            case EntityType.NGO:
                 if (!/^[A-Za-z0-9/-]+$/.test(value)) {
                    formatError = 'Formato incorreto. Use apenas letras, números, hífens e barras.';
                }
                break;
            default:
                break;
        }
        
        if (formatError) {
            setNifError(formatError);
            setNifSuccess('');
            return false;
        }
    
        setNifError('');
        setNifSuccess('Formato de NIF correto.');
        return true;
    };


    const handleNifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNif(value);
        validateNifLocally(value);
    };
    
    const handleNifBlur = async () => {
        if (isEditMode) return;
        if (!nif.trim()) {
            setNifError('');
            setNifSuccess('');
            return;
        }

        if (!validateNifLocally(nif)) {
            return;
        }
        
        // Don't do external validation for Individual BI or NGO number format
        if (entityType === EntityType.Individual || entityType === EntityType.NGO) {
            return;
        }

        setIsNifValidating(true);
        setNifError('');
        setNifSuccess('');
        setNameSanctionResult(null);
        setNamePepResult(null);
        const result = await validateNifExternally(nif);
        if (result.success && result.data) {
            setNifSuccess(result.message);
            setEntityName(result.data.name);
            setEntityType(result.data.entityType);
            setCommercialRegistration(result.data.commercialRegistration);
            setCategory(result.data.category);
            setAddress(result.data.address);
            setCountry(result.data.country);
            setBeneficialOwner(result.data.beneficialOwner || '');
        } else {
            setNifError(result.message);
            setNifSuccess('');
        }
        setIsNifValidating(false);
    };

    const handleViewDocument = (doc: Document) => { setSelectedDocument(doc); setIsViewModalOpen(true); };
    const handleDownloadDocument = (doc: Document) => { addToast(`A simular o download do documento: ${doc.name}`, 'info', 'Download'); };
    const handleDeleteDocument = (docNameToDelete: string) => { if (window.confirm(`Tem a certeza que deseja apagar o documento "${docNameToDelete}"?`)) { setDocuments(prev => prev.filter(d => d.name !== docNameToDelete)); } };

    // --- DDQ Dynamic List Handlers ---
    const addShareholder = () => setShareholders([...shareholders, { id: crypto.randomUUID(), name: '', nationality: '', participation: 0, position: '', isInternal: false }]);
    const updateShareholder = (index: number, field: keyof Shareholder, value: any) => {
        const updated = [...shareholders];
        (updated[index] as any)[field] = value;
        setShareholders(updated);
    };
    const removeShareholder = (id: string) => setShareholders(shareholders.filter(s => s.id !== id));
    
    const handleShareholderNameChange = (index: number, value: string) => {
        updateShareholder(index, 'name', value);
        setActiveShareholderIndex(index);

        if (value.trim()) {
            const lowerCaseValue = value.toLowerCase();
            const pepNames = pepDatabase.map(p => p.name.replace(/\b\w/g, l => l.toUpperCase()));
            const existingShareholderNames = mockEntities.flatMap(e => e.shareholders?.map(s => s.name) || []);
            const combinedNames = [...new Set([...pepNames, ...existingShareholderNames])].filter(Boolean);
            const filtered = combinedNames.filter(name => 
                name.toLowerCase().includes(lowerCaseValue) && name.toLowerCase() !== value.toLowerCase()
            );
            setShareholderSuggestions(filtered.slice(0, 5));
        } else {
            setShareholderSuggestions([]);
        }
    };

    const handleSuggestionClick = (index: number, name: string) => {
        updateShareholder(index, 'name', name);
        setActiveShareholderIndex(null);
        setShareholderSuggestions([]);
    };
    
    const handleShareholderNameBlur = async (index: number) => {
      const nameToCheck = shareholders[index]?.name;
      if (!nameToCheck || !nameToCheck.trim()) {
          setShareholders(prev => {
              const updated = [...prev];
              if (updated[index]) {
                  updated[index].sanctionResult = null;
                  updated[index].pepResult = null;
              }
              return updated;
          });
          return;
      }

      setShareholders(prev => {
          const updated = [...prev];
          if (updated[index]) updated[index].isChecking = true;
          return updated;
      });

      const [sanctionResult, pepResult] = await Promise.all([
          checkSanctionsLists(nameToCheck),
          country === 'Portugal' ? checkPepStatus(nameToCheck) : Promise.resolve(null),
      ]);

      setShareholders(prev => {
          const updated = [...prev];
          if (updated[index] && updated[index].name === nameToCheck) {
              updated[index] = { ...updated[index], isChecking: false, sanctionResult, pepResult };
          }
          return updated;
      });
    };
    
    const showBeneficialOwner = [EntityType.PrivateCompany, EntityType.NGO].includes(entityType);
    const showIncorporationDate = [EntityType.PrivateCompany, EntityType.NGO, EntityType.PublicEntity].includes(entityType);
    const showCommercialRegistration = [EntityType.PrivateCompany, EntityType.NGO].includes(entityType);
    
    const validateStep2 = () => {
        let isValid = true;
        // Reset all errors
        setAddressError('');
        setIncorporationDateError('');
        setContactPhoneError('');
        setBirthDateError('');
        setEntityNationalityError('');
        setTaxResidencyCountryError('');
        setProfessionError('');
        setMaritalStatusError('');
        setLegalEntityTypeError('');
        setCaeError('');
        setEmployeeCountError('');
        setLastYearTurnoverError('');
        setLegalRepNameError('');
        setLegalRepDocError('');
        setOfficialRegistrationNumberError('');
        setSupervisingMinistryError('');
        setInstitutionalHeadNameError('');
        setPublicActivityNatureError('');
        setNgoRegistrationNumberError('');
        setSocialPurposeError('');
        setTerritorialScopeError('');
        setSourceOfFundsError('');


        if (!address.trim()) { setAddressError('O Endereço é obrigatório.'); isValid = false; }
        if (!contactEmail.trim()) { addToast('Email de Contacto é obrigatório.', 'warning'); isValid = false; }
        if (!contactPhone.trim()) { setContactPhoneError('O Telefone é obrigatório.'); isValid = false; }
        
        if (showIncorporationDate && !incorporationDate.trim()) { setIncorporationDateError('A Data de Constituição é obrigatória.'); isValid = false; }
        
        if (entityType === EntityType.Individual) {
            if (!kycFields.birthDate) { setBirthDateError('A Data de Nascimento é obrigatória.'); isValid = false; }
            if (!kycFields.nationality?.trim()) { setEntityNationalityError('A Nacionalidade é obrigatória.'); isValid = false; }
            if (!kycFields.taxResidencyCountry?.trim()) { setTaxResidencyCountryError('O País de residência fiscal é obrigatório.'); isValid = false; }
            if (!kycFields.profession?.trim()) { setProfessionError('A Profissão é obrigatória.'); isValid = false; }
            if (!kycFields.maritalStatus?.trim()) { setMaritalStatusError('O Estado Civil é obrigatório.'); isValid = false; }
        }

        if (entityType === EntityType.PrivateCompany) {
            if (!kycFields.legalEntityType?.trim()) { setLegalEntityTypeError('O Tipo Jurídico é obrigatório.'); isValid = false; }
            if (!kycFields.cae?.trim()) { setCaeError('O CAE / Ramo de Atividade é obrigatório.'); isValid = false; }
            if (!kycFields.employeeCount) { setEmployeeCountError('O Número de Colaboradores é obrigatório.'); isValid = false; }
            if (!kycFields.lastYearTurnover) { setLastYearTurnoverError('O Volume de Negócios é obrigatório.'); isValid = false; }
            if (!kycFields.legalRepresentativeName?.trim()) { setLegalRepNameError('O Nome do Representante Legal é obrigatório.'); isValid = false; }
            if (!kycFields.legalRepresentativeDocument?.trim()) { setLegalRepDocError('O Documento do Representante Legal é obrigatório.'); isValid = false; }
        }

        if (entityType === EntityType.PublicEntity) {
            if (!kycFields.officialRegistrationNumber?.trim()) { setOfficialRegistrationNumberError('O Número de Registo Legal é obrigatório.'); isValid = false; }
            if (!kycFields.supervisingMinistry?.trim()) { setSupervisingMinistryError('O Ministério Supervisor é obrigatório.'); isValid = false; }
            if (!kycFields.institutionalHeadName?.trim()) { setInstitutionalHeadNameError('O Responsável Institucional é obrigatório.'); isValid = false; }
            if (!kycFields.publicActivityNature?.trim()) { setPublicActivityNatureError('A Natureza da Atividade é obrigatória.'); isValid = false; }
        }
        
        if (entityType === EntityType.NGO) {
            if (!kycFields.ngoRegistrationNumber?.trim()) { setNgoRegistrationNumberError('O Nº de Registo é obrigatório.'); isValid = false; }
            if (!kycFields.legalRepresentativeName?.trim()) { setLegalRepNameError('O Representante Legal é obrigatório.'); isValid = false; }
            if (!kycFields.socialPurpose?.trim()) { setSocialPurposeError('A Finalidade Social é obrigatória.'); isValid = false; }
            if (!kycFields.territorialScope?.trim()) { setTerritorialScopeError('O Escopo Territorial é obrigatório.'); isValid = false; }
            if (!kycFields.sourceOfFunds?.trim()) { setSourceOfFundsError('As Fontes de Financiamento são obrigatórias.'); isValid = false; }
        }

        return isValid;
    };

    const validateStep3 = () => {
        let isValid = true;
        setBeneficialOwnerError('');

        if (showBeneficialOwner && !beneficialOwner.trim()) {
            setBeneficialOwnerError('O Beneficiário Efetivo é obrigatório.');
            isValid = false;
        }
        
        return isValid;
    };


    const nextStep = () => {
        if (step === 1 && !isStep1Valid) {
            addToast('Por favor, preencha os campos obrigatórios e valide o formato do NIF.', 'warning');
            return;
        }
        if (step === 2) {
            if (!validateStep2()) {
                addToast('Por favor, preencha todos os campos obrigatórios na Etapa 2.', 'warning');
                return;
            }
        }
        if (step === 3) {
            if (!validateStep3()) {
                addToast('Por favor, preencha todos os campos obrigatórios na Etapa 3.', 'warning');
                return;
            }
        }
        setStep(s => Math.min(s + 1, 4));
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    
    const submit = () => {
        if (!validateStep2()) {
            addToast('Existem erros na Etapa 2. Por favor, reveja os campos.', 'error');
            setStep(2);
            return;
        }

        if (!validateStep3()) {
            addToast('Existem erros na Etapa 3. Por favor, reveja os campos.', 'error');
            setStep(3);
            return;
        }


        const newEntityData: Partial<Entity> = {
            entityType, name: entityName, nif, commercialRegistration, category, country, address,
            riskLevel,
            services, legalStatusComment, documents, shareholders, 
            incorporationDate: showIncorporationDate ? incorporationDate : undefined,
            beneficialOwner: showBeneficialOwner ? beneficialOwner : 'N/A',
            ...kycFields,
        };
    
        if (isEditMode && entityToEdit) {
            const entityIndex = mockEntities.findIndex(e => e.id === entityToEdit.id);
            if (entityIndex > -1) {
                const nifExists = mockEntities.some(e => e.id !== entityToEdit.id && e.nif === nif && nif.trim() !== '');
                if (nifExists) {
                    addToast('Erro: Já existe outra entidade com este NIF.', 'error');
                    return;
                }
                const nameExists = mockEntities.some(e => e.id !== entityToEdit.id && e.name.toLowerCase() === entityName.toLowerCase());
                if (nameExists) {
                    addToast('Erro: Já existe outra entidade com este nome.', 'error');
                    return;
                }

                mockEntities[entityIndex] = {
                    ...mockEntities[entityIndex],
                    contact: { ...mockEntities[entityIndex].contact, name: contactName, phone: contactPhone, email: contactEmail, website: website || undefined, linkedIn: linkedIn || undefined, },
                    ...newEntityData
                } as Entity;
            }
        } else {
             const nifExists = mockEntities.some(e => e.nif === nif && nif.trim() !== '');
            if (nifExists && isNifRequired) {
                addToast('Erro: Já existe uma entidade com este NIF.', 'error');
                return;
            }
            const nameExists = mockEntities.some(e => e.name.toLowerCase() === entityName.toLowerCase());
            if (nameExists) {
                addToast('Erro: Já existe uma entidade com este nome.', 'error');
                return;
            }
            const newEntity: Entity = {
                id: String(Date.now()), 
                riskLevel: RiskLevel.Medium, 
                status: LegalStatus.Active, 
                onboardingDate: new Date().toISOString().split('T')[0], 
                contact: { name: contactName, email: contactEmail, phone: contactPhone, website: website || undefined, linkedIn: linkedIn || undefined, },
                ...newEntityData
            } as Entity;
            mockEntities.unshift(newEntity);
        }
    
        if(setIsFormDirty) setIsFormDirty(false);
        addToast(`Entidade "${entityName}" ${isEditMode ? 'atualizada' : 'salva'} com sucesso!`, 'success');
        onModuleChange('entities');
    }

    const handleKycFieldChange = (field: keyof Entity, value: any) => {
        setKycFields(prev => ({...prev, [field]: value}));
    };
    
    // Autocomplete logic for UBO
    useEffect(() => {
        const shareholderNames = shareholders.map(s => s.name).filter(Boolean);
        const pepNames = pepDatabase.map(p => p.name).filter(Boolean);
        const combined = [...new Set([...shareholderNames, ...pepNames])];
        
        if (beneficialOwner.trim()) {
            const lowerCaseOwner = beneficialOwner.toLowerCase();
            const filtered = combined.filter(name => name.toLowerCase().includes(lowerCaseOwner));
            setUboSuggestions(filtered);
            setShowUboSuggestions(true);
        } else {
            setShowUboSuggestions(false);
        }
    }, [beneficialOwner, shareholders]);


    // Services multiselect logic
    const serviceSuggestions = useMemo(() => {
        if (!serviceInput) return [];
        const lowercasedInput = serviceInput.toLowerCase();
        const filtered = predefinedServices.filter(
            s => !services.includes(s) && s.toLowerCase().includes(lowercasedInput)
        );
        const isExactMatch = services.includes(serviceInput) || predefinedServices.some(s => s.toLowerCase() === lowercasedInput);
        
        if (serviceInput && !isExactMatch) {
            return [`Adicionar: "${serviceInput}"`, ...filtered];
        }
        return filtered;
    }, [serviceInput, services]);

    const handleServiceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setServiceInput(e.target.value);
        setShowServiceSuggestions(true);
    };

    const handleServiceSelect = (service: string) => {
        let serviceToAdd = service;
        if (service.startsWith('Adicionar: "')) {
            serviceToAdd = service.match(/Adicionar: "(.*)"/)?.[1] || '';
        }
        
        if (serviceToAdd && !services.includes(serviceToAdd)) {
            setServices([...services, serviceToAdd]);
        }
        
        setServiceInput('');
        setShowServiceSuggestions(false);
    };

    const handleServiceRemove = (serviceToRemove: string) => {
        setServices(services.filter(s => s !== serviceToRemove));
    };

    const handleServiceInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && serviceInput.trim()) {
            e.preventDefault();
            const serviceToAdd = serviceInput.trim();
            handleServiceSelect(`Adicionar: "${serviceToAdd}"`);
        } else if (e.key === 'Backspace' && !serviceInput && services.length > 0) {
            handleServiceRemove(services[services.length - 1]);
        }
    };
    
    const handleAddDocumentToList = () => {
        const finalDocName = isCustomDoc ? customDocName : newDocType;
        if (!finalDocName.trim()) {
            addToast('Por favor, especifique o nome do documento.', 'warning');
            return;
        }

        const newStatus: DocumentStatus = newDocFile ? 'Recebido' : 'Pendente';
        const newDoc: Document = {
            name: finalDocName,
            status: newStatus,
            submissionDate: new Date().toISOString().split('T')[0],
        };

        setDocuments(prev => [...prev, newDoc]);
        addToast(`Documento "${finalDocName}" adicionado à lista como '${newStatus}'.`, 'success');

        // Reset form
        setNewDocType(suggestedDocsForCountry[0] || '');
        setNewDocFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsCustomDoc(false);
        setCustomDocName('');
    };
    
    const handleDocTypeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'outro') {
            setIsCustomDoc(true);
            setNewDocType('');
        } else {
            setIsCustomDoc(false);
            setNewDocType(value);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewDocFile(e.target.files[0]);
        } else {
            setNewDocFile(null);
        }
    };

    const isStep1Valid = useMemo(() => {
        if (entityName.trim() === '') return false;
        if (nifError && nifError !== '') return false;
        if (isNifRequired && nif.trim() === '') return false;

        return true;
    }, [entityName, nif, isNifRequired, nifError]);
    
    const nifLabel = useMemo(() => {
        switch (entityType) {
            case EntityType.Individual:
                return 'Nº do Bilhete de Identidade';
            case EntityType.NGO:
                return 'Nº de Registo da ONG';
            default:
                return 'NIF / VAT / Tax ID';
        }
    }, [entityType]);
    
    const nifPlaceholder = useMemo(() => {
        switch (entityType) {
            case EntityType.Individual:
                return 'Ex: 001234567LA038';
            case EntityType.NGO:
                return 'Ex: 123/ONG/2024';
            default:
                return 'Insira o NIF da entidade';
        }
    }, [entityType]);

    return (
        <>
        <ViewDocumentModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} document={selectedDocument} onDownload={handleDownloadDocument} />

        <div className="bg-card p-6 sm:p-8 rounded-xl shadow-md max-w-5xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-primary mb-2">{isEditMode ? 'Editar Entidade' : 'Cadastrar Nova Entidade'}</h2>
            <p className="text-text-secondary mb-8">{isEditMode ? 'Atualize as informações da entidade abaixo.' : 'Siga os passos para adicionar um novo terceiro ao sistema.'}</p>

            <div className="flex justify-center items-start mb-12 p-4">
                <Step number={1} title="Informações Básicas" isActive={step === 1} isCompleted={step > 1} />
                <div className="flex-1 h-1 bg-border mt-5 mx-2 rounded-full"></div>
                <Step number={2} title="Detalhes (KYC/KYB)" isActive={step === 2} isCompleted={step > 2} />
                 <div className="flex-1 h-1 bg-border mt-5 mx-2 rounded-full"></div>
                <Step number={3} title="Análise DDQ" isActive={step === 3} isCompleted={step > 3} />
                <div className="flex-1 h-1 bg-border mt-5 mx-2 rounded-full"></div>
                <Step number={4} title="Revisar e Submeter" isActive={step === 4} isCompleted={false} />
            </div>

            <div className="animate-fade-in">
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Tipo de Entidade</label>
                             <select value={entityType} onChange={(e) => setEntityType(e.target.value as EntityType)} disabled={isEditMode} className={`w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none ${isEditMode ? 'cursor-not-allowed bg-gray-200' : ''}`}>
                                {Object.values(EntityType).map(type => (<option key={type} value={type}>{type}</option>))}
                            </select>
                             {isEditMode && <p className="text-xs text-text-secondary mt-1">O tipo de entidade não pode ser alterado após o registo.</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Nome da Entidade / Nome Completo <span className="text-danger">*</span></label>
                            <input type="text" value={entityName} onChange={(e) => setEntityName(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none" placeholder="Ex: SocoOil, Lda. ou João Silva" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <SanctionCheckResult isChecking={isNameSanctionChecking} result={nameSanctionResult} />
                                {country === 'Portugal' && <PepCheckResult isChecking={isNamePepChecking} result={namePepResult} />}
                            </div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1">País de Constituição / Residência</label>
                            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none">
                                {supportedCountries.map(c => (<option key={c} value={c}>{c}</option>))}
                            </select>
                        </div>
                        
                        <div className={showCommercialRegistration ? 'md:col-span-1' : 'md:col-span-2'}>
                            <label className="block text-sm font-medium text-text-secondary mb-1">{nifLabel} {isNifRequired && <span className="text-danger">*</span>}</label>
                             <div className="relative">
                                <input type="text" value={nif} onChange={handleNifChange} onBlur={handleNifBlur} readOnly={isEditMode} className={`w-full bg-background border rounded-lg p-2.5 text-text-main focus:ring-2 focus:outline-none ${isEditMode ? 'cursor-not-allowed bg-gray-200' : ''} ${nifError ? 'border-danger focus:ring-danger' : nifSuccess ? 'border-success focus:ring-success' : 'border-border focus:ring-secondary'}`} placeholder={nifPlaceholder} />
                                {nifSuccess && !isNifValidating && (<div className="absolute inset-y-0 right-0 flex items-center pr-3"><CheckIcon className="h-5 w-5 text-success" /></div>)}
                                {nifError && !isNifValidating && (<div className="absolute inset-y-0 right-0 flex items-center pr-3"><AlertCircleIcon className="h-5 w-5 text-danger" /></div>)}
                                {isNifValidating && (<div className="absolute inset-y-0 right-0 flex items-center pr-3"><SpinnerIcon className="w-5 h-5"/></div>)}
                             </div>
                            {nifError && <p className="text-danger text-xs mt-1">{nifError}</p>}
                            {nifSuccess && <p className="text-success text-xs mt-1">{nifSuccess}</p>}
                             {!nifError && !nifSuccess && !isEditMode && !isNifValidating && (<p className="text-text-secondary text-xs mt-1">O sistema valida o formato do NIF de acordo com o tipo de entidade.</p>)}
                        </div>

                        {showCommercialRegistration && (<div><label className="block text-sm font-medium text-text-secondary mb-1">Nº de Registo Comercial</label><input type="text" value={commercialRegistration} onChange={e => setCommercialRegistration(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none" placeholder="Ex: CRC-LUAN-2010-101" /></div>)}
                        
                        <div>
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

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Nível de Risco</label>
                            <select 
                                value={riskLevel} 
                                onChange={e => setRiskLevel(e.target.value as RiskLevel)} 
                                className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
                            >
                                {Object.values(RiskLevel).map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-8">
                        <section className="bg-white p-6 rounded-xl border border-border">
                            <h3 className="text-xl font-semibold text-text-main mb-4">📍 Dados de Contacto e Localização</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="md:col-span-2 lg:col-span-3">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Endereço Completo <span className="text-danger">*</span></label>
                                    <input type="text" value={address} onChange={e => { setAddress(e.target.value); if (e.target.value.trim()) setAddressError(''); }} onBlur={() => !address.trim() && setAddressError('O Endereço é obrigatório.')} className={`w-full bg-background border rounded-lg p-2.5 text-text-main focus:ring-2 focus:outline-none ${addressError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                    {addressError && <p className="text-danger text-xs mt-1">{addressError}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Contacto Principal</label>
                                    <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Telefone <span className="text-danger">*</span></label>
                                    <input type="tel" value={contactPhone} onChange={e => { setContactPhone(e.target.value); if (e.target.value) setContactPhoneError(''); }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${contactPhoneError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                    {contactPhoneError && <p className="text-danger text-xs mt-1">{contactPhoneError}</p>}
                                </div>
                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Email de Contacto <span className="text-danger">*</span></label>
                                    <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" />
                                </div>
                                <div><label className="block text-sm font-medium text-text-secondary mb-1">Website</label><input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" /></div>
                                <div><label className="block text-sm font-medium text-text-secondary mb-1">LinkedIn</label><input type="url" value={linkedIn} onChange={e => setLinkedIn(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" /></div>
                                
                                <div className="md:col-span-2 lg:col-span-3">
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Serviços Prestados</label>
                                    <div ref={servicesInputRef} className="relative">
                                        <div className="w-full flex flex-wrap gap-2 items-center bg-background border border-border rounded-lg p-2 min-h-[44px] text-text-main focus-within:ring-2 focus-within:ring-secondary">
                                            {services.map(service => (
                                                <span key={service} className="bg-primary/10 text-primary font-medium px-2 py-1 rounded-full flex items-center gap-2 text-sm">
                                                    {service}
                                                    <button type="button" onClick={() => handleServiceRemove(service)} className="text-primary hover:text-danger">&times;</button>
                                                </span>
                                            ))}
                                            <input type="text" value={serviceInput} onChange={handleServiceInputChange} onKeyDown={handleServiceInputKeyDown} onFocus={() => setShowServiceSuggestions(true)} className="flex-1 bg-transparent outline-none p-1" placeholder={services.length === 0 ? "Selecione ou adicione serviços..." : ""} />
                                        </div>
                                        {showServiceSuggestions && serviceSuggestions.length > 0 && (
                                            <ul className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                                                {serviceSuggestions.map(suggestion => (
                                                    <li key={suggestion} onMouseDown={() => handleServiceSelect(suggestion)} className="cursor-pointer select-none relative p-2 text-sm text-text-secondary hover:bg-background">
                                                        {suggestion.startsWith('Adicionar: "') ? <span className="italic">{suggestion}</span> : <span>{suggestion}</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                {showIncorporationDate && (
                                    <div className="animate-fade-in">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Data de Constituição / Criação <span className="text-danger">*</span></label>
                                        <input type="date" value={incorporationDate} onChange={e => { setIncorporationDate(e.target.value); if (e.target.value) setIncorporationDateError(''); }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main focus:ring-2 focus:outline-none ${incorporationDateError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {incorporationDateError && <p className="text-danger text-xs mt-1">{incorporationDateError}</p>}
                                    </div>
                                )}
                            </div>
                        </section>
                        
                        {entityType === EntityType.Individual && (
                            <section className="bg-white p-6 rounded-xl border border-border animate-fade-in">
                                <h3 className="text-xl font-semibold text-text-main mb-4">👤 Dados Pessoais (KYC)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Data de Nascimento <span className="text-danger">*</span></label>
                                        <input type="date" value={kycFields.birthDate || ''} onChange={e => { handleKycFieldChange('birthDate', e.target.value); if (e.target.value) setBirthDateError(''); }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${birthDateError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {birthDateError && <p className="text-danger text-xs mt-1">{birthDateError}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Nacionalidade <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.nationality || ''} onChange={e => { handleKycFieldChange('nationality', e.target.value); if (e.target.value.trim()) setEntityNationalityError(''); }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${entityNationalityError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {entityNationalityError && <p className="text-danger text-xs mt-1">{entityNationalityError}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Estado Civil <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.maritalStatus || ''} onChange={e => { handleKycFieldChange('maritalStatus', e.target.value); if (e.target.value.trim()) setMaritalStatusError(''); }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${maritalStatusError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {maritalStatusError && <p className="text-danger text-xs mt-1">{maritalStatusError}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Profissão / Ocupação <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.profession || ''} onChange={e => { handleKycFieldChange('profession', e.target.value); if (e.target.value.trim()) setProfessionError(''); }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${professionError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {professionError && <p className="text-danger text-xs mt-1">{professionError}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Entidade Empregadora</label>
                                        <input type="text" value={kycFields.employer || ''} onChange={e => handleKycFieldChange('employer', e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" placeholder="Se aplicável" />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">País de Residência Fiscal <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.taxResidencyCountry || ''} onChange={e => { handleKycFieldChange('taxResidencyCountry', e.target.value); if (e.target.value.trim()) setTaxResidencyCountryError(''); }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${taxResidencyCountryError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {taxResidencyCountryError && <p className="text-danger text-xs mt-1">{taxResidencyCountryError}</p>}
                                    </div>
                                </div>
                            </section>
                        )}
                        
                        {entityType === EntityType.PrivateCompany && (
                            <section className="bg-white p-6 rounded-xl border border-border animate-fade-in">
                                <h3 className="text-xl font-semibold text-text-main mb-4">🏢 Dados da Empresa (KYB)</h3>
                                
                                <h4 className="text-md font-semibold text-primary mb-3">Dados da Empresa</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Tipo Jurídico (Lda, SA, etc.) <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.legalEntityType || ''} onChange={e => { handleKycFieldChange('legalEntityType', e.target.value); if(e.target.value.trim()) setLegalEntityTypeError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${legalEntityTypeError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {legalEntityTypeError && <p className="text-danger text-xs mt-1">{legalEntityTypeError}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">CAE / Ramo de Atividade <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.cae || ''} onChange={e => { handleKycFieldChange('cae', e.target.value); if(e.target.value.trim()) setCaeError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${caeError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {caeError && <p className="text-danger text-xs mt-1">{caeError}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Número de Colaboradores <span className="text-danger">*</span></label>
                                        <input type="number" value={kycFields.employeeCount || ''} onChange={e => { handleKycFieldChange('employeeCount', e.target.value); if(e.target.value) setEmployeeCountError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${employeeCountError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {employeeCountError && <p className="text-danger text-xs mt-1">{employeeCountError}</p>}
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-3">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Volume de Negócios (último ano) <span className="text-danger">*</span></label>
                                        <input type="number" value={kycFields.lastYearTurnover || ''} onChange={e => { handleKycFieldChange('lastYearTurnover', e.target.value); if(e.target.value) setLastYearTurnoverError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${lastYearTurnoverError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} placeholder="Ex: 50000000" />
                                        {lastYearTurnoverError && <p className="text-danger text-xs mt-1">{lastYearTurnoverError}</p>}
                                    </div>
                                </div>
                                
                                <h4 className="text-md font-semibold text-primary mb-3 mt-6 pt-4 border-t border-border">Dados do Representante Legal (KYC)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Representante Legal (Nome) <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.legalRepresentativeName || ''} onChange={e => { handleKycFieldChange('legalRepresentativeName', e.target.value); if(e.target.value.trim()) setLegalRepNameError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${legalRepNameError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {legalRepNameError && <p className="text-danger text-xs mt-1">{legalRepNameError}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Representante Legal (Documento) <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.legalRepresentativeDocument || ''} onChange={e => { handleKycFieldChange('legalRepresentativeDocument', e.target.value); if(e.target.value.trim()) setLegalRepDocError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${legalRepDocError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {legalRepDocError && <p className="text-danger text-xs mt-1">{legalRepDocError}</p>}
                                    </div>
                                </div>
                            </section>
                        )}
                        
                        {entityType === EntityType.PublicEntity && (
                            <section className="bg-white p-6 rounded-xl border border-border animate-fade-in">
                                <h3 className="text-xl font-semibold text-text-main mb-4">🏛️ Dados da Entidade Pública (KYB)</h3>
                                
                                <h4 className="text-md font-semibold text-primary mb-3">Dados Institucionais</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Nº de Registo Legal <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.officialRegistrationNumber || ''} onChange={e => { handleKycFieldChange('officialRegistrationNumber', e.target.value); if(e.target.value.trim()) setOfficialRegistrationNumberError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${officialRegistrationNumberError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {officialRegistrationNumberError && <p className="text-danger text-xs mt-1">{officialRegistrationNumberError}</p>}
                                    </div>
                                    <div className="lg:col-span-2">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Ministério / Entidade Supervisora <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.supervisingMinistry || ''} onChange={e => { handleKycFieldChange('supervisingMinistry', e.target.value); if(e.target.value.trim()) setSupervisingMinistryError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${supervisingMinistryError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {supervisingMinistryError && <p className="text-danger text-xs mt-1">{supervisingMinistryError}</p>}
                                    </div>
                                     <div className="md:col-span-2 lg:col-span-3">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Natureza da Atividade Pública <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.publicActivityNature || ''} onChange={e => { handleKycFieldChange('publicActivityNature', e.target.value); if(e.target.value.trim()) setPublicActivityNatureError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${publicActivityNatureError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {publicActivityNatureError && <p className="text-danger text-xs mt-1">{publicActivityNatureError}</p>}
                                    </div>
                                </div>

                                <h4 className="text-md font-semibold text-primary mb-3 mt-6 pt-4 border-t border-border">Dados do Responsável Institucional (KYC)</h4>
                                <div className="grid grid-cols-1">
                                    <div className="md:col-span-2 lg:col-span-3">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Responsável Institucional (Nome + Cargo) <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.institutionalHeadName || ''} onChange={e => { handleKycFieldChange('institutionalHeadName', e.target.value); if(e.target.value.trim()) setInstitutionalHeadNameError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${institutionalHeadNameError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {institutionalHeadNameError && <p className="text-danger text-xs mt-1">{institutionalHeadNameError}</p>}
                                    </div>
                                </div>
                            </section>
                        )}
                            
                        {entityType === EntityType.NGO && (
                            <section className="bg-white p-6 rounded-xl border border-border animate-fade-in">
                                <h3 className="text-xl font-semibold text-text-main mb-4">🤝 Dados da ONG (KYB)</h3>
                                
                                <h4 className="text-md font-semibold text-primary mb-3">Dados da Organização</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Nº de Registo de ONG <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.ngoRegistrationNumber || ''} onChange={e => { handleKycFieldChange('ngoRegistrationNumber', e.target.value); if(e.target.value.trim()) setNgoRegistrationNumberError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${ngoRegistrationNumberError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {ngoRegistrationNumberError && <p className="text-danger text-xs mt-1">{ngoRegistrationNumberError}</p>}
                                    </div>
                                    <div className="lg:col-span-2">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Finalidade Social <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.socialPurpose || ''} onChange={e => { handleKycFieldChange('socialPurpose', e.target.value); if(e.target.value.trim()) setSocialPurposeError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${socialPurposeError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {socialPurposeError && <p className="text-danger text-xs mt-1">{socialPurposeError}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Escopo Territorial <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.territorialScope || ''} onChange={e => { handleKycFieldChange('territorialScope', e.target.value); if(e.target.value.trim()) setTerritorialScopeError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${territorialScopeError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {territorialScopeError && <p className="text-danger text-xs mt-1">{territorialScopeError}</p>}
                                    </div>
                                     <div className="md:col-span-2 lg:col-span-3">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Fontes de Financiamento (Ver Detalhe) <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.sourceOfFunds || ''} onChange={e => { handleKycFieldChange('sourceOfFunds', e.target.value); if(e.target.value.trim()) setSourceOfFundsError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${sourceOfFundsError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {sourceOfFundsError && <p className="text-danger text-xs mt-1">{sourceOfFundsError}</p>}
                                    </div>
                                </div>
                                
                                <h4 className="text-md font-semibold text-primary mb-3 mt-6 pt-4 border-t border-border">Dados do Representante Legal (KYC)</h4>
                                <div className="grid grid-cols-1">
                                    <div className="lg:col-span-3">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Representante Legal <span className="text-danger">*</span></label>
                                        <input type="text" value={kycFields.legalRepresentativeName || ''} onChange={e => { handleKycFieldChange('legalRepresentativeName', e.target.value); if(e.target.value.trim()) setLegalRepNameError('') }} className={`w-full bg-background border rounded-lg p-2.5 text-text-main ${legalRepNameError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} />
                                        {legalRepNameError && <p className="text-danger text-xs mt-1">{legalRepNameError}</p>}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-8">
                       {/* DDQ Section */}
                        <section>
                             <h3 className="text-xl font-bold text-primary mb-4 border-b border-border pb-2">Análise de Due Diligence Aprofundada (DDQ)</h3>
                             
                             {/* DDQ Questions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {entityType === EntityType.Individual && (
                                    <>
                                        <DDQSelect question="É Pessoa Politicamente Exposta (PEP)?" field="isPep" value={kycFields.isPep} onChange={handleKycFieldChange} />
                                        <DDQSelect question="Tem ou teve envolvimento em processos criminais/financeiros?" field="criminalRecordDetails" value={kycFields.criminalRecordDetails} onChange={handleKycFieldChange} />
                                        <DDQSelect question="Mantém atividade empresarial própria para além da declarada?" field="hasOwnBusiness" value={kycFields.hasOwnBusiness} onChange={handleKycFieldChange} />
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm font-medium text-text-secondary mb-1">Origem do Património (Detalhe)</label>
                                            <input type="text" value={kycFields.sourceOfWealth || ''} onChange={e => handleKycFieldChange('sourceOfWealth', e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main" />
                                        </div>
                                    </>
                                )}
                                 {entityType === EntityType.PrivateCompany && (
                                    <>
                                        <DDQSelect question="O Beneficiário Efetivo (UBO) é uma PEP?" field="uboIsPep" value={kycFields.uboIsPep} onChange={handleKycFieldChange} />
                                        <DDQSelect question="A empresa demonstra ter atividade económica real?" field="hasRealEconomicActivity" value={kycFields.hasRealEconomicActivity} onChange={handleKycFieldChange} />
                                        <DDQSelect question="Tem histórico de sanções ou processos relevantes?" field="sanctionsHistory" value={kycFields.sanctionsHistory} onChange={handleKycFieldChange} />
                                        <DDQSelect question="Tem operações em países de alto risco?" field="hasInternationalOperations" value={kycFields.hasInternationalOperations} onChange={handleKycFieldChange} />
                                        <DDQSelect question="A estrutura societária sugere o uso como 'shell company'?" field="isShellCompany" value={kycFields.isShellCompany} onChange={handleKycFieldChange} />
                                    </>
                                )}
                                {entityType === EntityType.PublicEntity && (
                                    <DDQSelect question="O representante institucional foi formalmente nomeado?" field="isRepresentativeFormallyAppointed" value={kycFields.isRepresentativeFormallyAppointed} onChange={handleKycFieldChange} />
                                )}
                                {entityType === EntityType.NGO && (
                                    <>
                                        <DDQSelect question="Recebe financiamento internacional significativo?" field="receivesInternationalFunding" value={kycFields.receivesInternationalFunding} onChange={handleKycFieldChange} />
                                        <DDQSelect question="Opera em zonas de conflito ou de alto risco?" field="operatesInConflictZones" value={kycFields.operatesInConflictZones} onChange={handleKycFieldChange} />
                                        <DDQSelect question="Tem histórico associado a financiamento ilícito?" field="illicitFinancingHistory" value={kycFields.illicitFinancingHistory} onChange={handleKycFieldChange} />
                                    </>
                                )}
                            </div>


                             {showBeneficialOwner && (
                                <div className="mb-6" ref={uboInputRef}>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Beneficiário Efetivo (UBO) <span className="text-danger">*</span></label>
                                    <div className="relative">
                                    <input type="text" value={beneficialOwner} onChange={e => { setBeneficialOwner(e.target.value); if (e.target.value.trim()) setBeneficialOwnerError(''); }} onFocus={() => setShowUboSuggestions(true)} className={`w-full bg-background border rounded-lg p-2.5 text-text-main focus:ring-2 focus:outline-none ${beneficialOwnerError ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`} autoComplete="off" />
                                     {showUboSuggestions && uboSuggestions.length > 0 && (
                                        <ul className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-40 overflow-auto">
                                            {uboSuggestions.map(name => (
                                                <li key={name} onMouseDown={() => { setBeneficialOwner(name); setShowUboSuggestions(false); }}
                                                    className="cursor-pointer select-none relative p-2 text-sm text-text-secondary hover:bg-background">
                                                    {name}
                                                </li>
                                            ))}
                                        </ul>
                                     )}
                                    </div>
                                    {beneficialOwnerError && <p className="text-danger text-xs mt-1">{beneficialOwnerError}</p>}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <SanctionCheckResult isChecking={isOwnerSanctionChecking} result={ownerSanctionResult} />
                                        {country === 'Portugal' && <PepCheckResult isChecking={isOwnerPepChecking} result={ownerPepResult} />}
                                    </div>
                                </div>
                             )}
                             <div className="mb-6" ref={shareholderContainerRef}>
                                <h4 className="font-semibold text-text-main mb-3">Acionistas e Diretores</h4>
                                <div className="space-y-4">
                                    {shareholders.map((s, i) => (
                                    <div key={s.id} className="p-4 bg-gray-50 border border-border rounded-lg relative">
                                        <button type="button" onClick={() => removeShareholder(s.id)} className="absolute top-2 right-2 text-text-secondary hover:text-danger p-1 z-10"><TrashIcon className="w-4 h-4"/></button>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="sm:col-span-2 lg:col-span-4 relative">
                                            <label className="text-xs font-medium text-text-secondary">Nome Completo</label>
                                            <input
                                                type="text"
                                                value={s.name}
                                                onChange={e => handleShareholderNameChange(i, e.target.value)}
                                                onFocus={() => setActiveShareholderIndex(i)}
                                                onBlur={() => handleShareholderNameBlur(i)}
                                                className="w-full bg-white border border-border rounded p-1.5 text-sm"
                                                autoComplete="off"
                                            />
                                            {activeShareholderIndex === i && shareholderSuggestions.length > 0 && (
                                                <ul className="absolute z-20 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-40 overflow-auto">
                                                    {shareholderSuggestions.map(name => (
                                                        <li
                                                            key={name}
                                                            onMouseDown={() => handleSuggestionClick(i, name)}
                                                            className="cursor-pointer select-none relative p-2 text-sm text-text-secondary hover:bg-background"
                                                        >
                                                            {name}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div><label className="text-xs font-medium text-text-secondary">Nacionalidade</label><input type="text" value={s.nationality} onChange={e => updateShareholder(i, 'nationality', e.target.value)} className="w-full bg-white border border-border rounded p-1.5 text-sm"/></div>
                                        <div><label className="text-xs font-medium text-text-secondary">Participação (%)</label><input type="number" value={s.participation} onChange={e => updateShareholder(i, 'participation', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-border rounded p-1.5 text-sm"/></div>
                                        <div className="lg:col-span-2"><label className="text-xs font-medium text-text-secondary">Cargo</label><input type="text" value={s.position} onChange={e => updateShareholder(i, 'position', e.target.value)} className="w-full bg-white border border-border rounded p-1.5 text-sm"/></div>
                                        </div>
                                        <div className="flex items-center mt-4"><input type="checkbox" id={`isInternal-${s.id}`} checked={s.isInternal} onChange={e => updateShareholder(i, 'isInternal', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/> <label htmlFor={`isInternal-${s.id}`} className="ml-2 text-sm text-text-secondary">Colaborador/Familiar Interno?</label></div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                                        <SanctionCheckResult isChecking={s.isChecking || false} result={s.sanctionResult || null}/>
                                        {country === 'Portugal' && <PepCheckResult isChecking={s.isChecking || false} result={s.pepResult || null} />}
                                        </div>
                                    </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addShareholder} className="mt-4 text-sm font-semibold text-primary hover:underline">+ Adicionar Acionista/Diretor</button>
                            </div>
                        </section>

                        <section className="border-t-2 border-dashed border-border pt-6 mt-6">
                            <h3 className="text-lg font-semibold text-text-main mb-3">Gestão de Documentos</h3>
                            
                            {/* Inline Form to Add Document */}
                            <div className="bg-background border border-border p-4 rounded-lg mb-4">
                                <h4 className="font-semibold text-text-main mb-3">Adicionar Novo Documento</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Tipo de Documento</label>
                                        <select
                                            value={isCustomDoc ? 'outro' : newDocType}
                                            onChange={handleDocTypeSelectChange}
                                            className="w-full bg-card border border-border rounded-lg p-2.5 text-text-main"
                                        >
                                            {suggestedDocsForCountry.map(type => <option key={type} value={type}>{type}</option>)}
                                            <option value="outro">Outro (especificar)</option>
                                        </select>
                                        {isCustomDoc && (
                                            <input
                                                type="text"
                                                value={customDocName}
                                                onChange={(e) => setCustomDocName(e.target.value)}
                                                placeholder="Especifique o nome do documento"
                                                className="mt-2 w-full bg-card border border-border rounded-lg p-2.5 text-text-main"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Ficheiro (Opcional)</label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        />
                                        <p className="text-xs text-text-secondary mt-1">Se não carregar um ficheiro, o documento será adicionado como 'Pendente'.</p>
                                    </div>
                                    <div className="md:col-span-2 text-right">
                                        <button 
                                            type="button" 
                                            onClick={handleAddDocumentToList} 
                                            className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg text-sm"
                                        >
                                            Adicionar à Lista
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Document List */}
                            <div className="overflow-x-auto border border-border rounded-lg">
                                <table className="w-full text-sm text-left text-text-secondary">
                                    <thead className="text-xs text-text-secondary uppercase bg-background"><tr><th scope="col" className="px-4 py-3 font-semibold">Documento</th><th scope="col" className="px-4 py-3 font-semibold">Estado</th><th scope="col" className="px-4 py-3 font-semibold">Vencimento</th><th scope="col" className="px-4 py-3 font-semibold text-right">Ações</th></tr></thead>
                                    <tbody className="divide-y divide-border">
                                        {documents.map((doc, index) => (<tr key={index} className="hover:bg-gray-50"><td className="px-4 py-2 font-medium text-text-main">{doc.name}</td><td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[doc.status].classes}`}>{doc.status}</span></td><td className="px-4 py-2">{doc.expiryDate || 'N/A'}</td><td className="px-4 py-2 text-right"><div className="flex items-center justify-end gap-4"><button type="button" onClick={() => handleViewDocument(doc)} className="text-text-secondary hover:text-primary" aria-label="Visualizar"><EyeIcon className="w-5 h-5"/></button><button type="button" onClick={() => handleDownloadDocument(doc)} className="text-text-secondary hover:text-primary" aria-label="Baixar"><DownloadIcon className="w-5 h-5"/></button><button type="button" onClick={() => handleDeleteDocument(doc.name)} className="text-text-secondary hover:text-danger" aria-label="Apagar"><TrashIcon className="w-5 h-5"/></button></div></td></tr>))}
                                        {documents.length === 0 && (<tr><td colSpan={4} className="text-center p-4">Nenhum documento adicionado.</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}
                {step === 4 && (
                    <div className="space-y-6 animate-fade-in">
                        <ReviewSection title="Etapa 1: Informações Básicas" onEdit={() => setStep(1)}>
                            <ReviewItem label="Tipo de Entidade">{entityType}</ReviewItem>
                            <ReviewItem label="Nome da Entidade / Nome Completo" fullWidth>{entityName}</ReviewItem>
                            <ReviewItem label="País">{country}</ReviewItem>
                            <ReviewItem label={nifLabel}>{nif}</ReviewItem>
                            {showCommercialRegistration && <ReviewItem label="Nº de Registo Comercial">{commercialRegistration}</ReviewItem>}
                            <ReviewItem label="Categoria">{category}</ReviewItem>
                            <ReviewItem label="Nível de Risco">{riskLevel}</ReviewItem>
                        </ReviewSection>

                        <ReviewSection title="Etapa 2: Detalhes (KYC/KYB)" onEdit={() => setStep(2)}>
                            <ReviewItem label="Endereço Completo" fullWidth>{address}</ReviewItem>
                            <ReviewItem label="Nome do Contacto">{contactName}</ReviewItem>
                            <ReviewItem label="Email de Contacto">{contactEmail}</ReviewItem>
                            <ReviewItem label="Telefone">{contactPhone}</ReviewItem>
                            <ReviewItem label="Website">{website}</ReviewItem>
                            <ReviewItem label="LinkedIn">{linkedIn}</ReviewItem>
                            <ReviewItem label="Serviços Prestados" fullWidth>{services.join(', ')}</ReviewItem>
                            
                            {showIncorporationDate && <ReviewItem label="Data de Constituição / Criação">{incorporationDate}</ReviewItem>}

                            {/* KYC/KYB Specifics */}
                            {entityType === EntityType.Individual && (
                                <>
                                    <ReviewItem label="Data de Nascimento">{kycFields.birthDate}</ReviewItem>
                                    <ReviewItem label="Nacionalidade">{kycFields.nationality}</ReviewItem>
                                    <ReviewItem label="País de Residência Fiscal">{kycFields.taxResidencyCountry}</ReviewItem>
                                    <ReviewItem label="Profissão">{kycFields.profession}</ReviewItem>
                                    <ReviewItem label="Entidade Empregadora">{kycFields.employer}</ReviewItem>
                                    <ReviewItem label="Estado Civil">{kycFields.maritalStatus}</ReviewItem>
                                </>
                            )}
                            {entityType === EntityType.PrivateCompany && (
                                <>
                                    <ReviewItem label="Tipo Jurídico">{kycFields.legalEntityType}</ReviewItem>
                                    <ReviewItem label="CAE / Ramo de Atividade">{kycFields.cae}</ReviewItem>
                                    <ReviewItem label="Número de Colaboradores">{kycFields.employeeCount}</ReviewItem>
                                    <ReviewItem label="Volume de Negócios (último ano)">{kycFields.lastYearTurnover?.toLocaleString()} Kz</ReviewItem>
                                    <ReviewItem label="Representante Legal (Nome)">{kycFields.legalRepresentativeName}</ReviewItem>
                                    <ReviewItem label="Representante Legal (Documento)">{kycFields.legalRepresentativeDocument}</ReviewItem>
                                </>
                            )}
                             {entityType === EntityType.PublicEntity && (
                                <>
                                    <ReviewItem label="Nº de Registo Legal">{kycFields.officialRegistrationNumber}</ReviewItem>
                                    <ReviewItem label="Ministério Supervisor">{kycFields.supervisingMinistry}</ReviewItem>
                                    <ReviewItem label="Responsável Institucional (Nome + Cargo)">{kycFields.institutionalHeadName}</ReviewItem>
                                    <ReviewItem label="Natureza da Atividade Pública">{kycFields.publicActivityNature}</ReviewItem>
                                </>
                            )}
                            {entityType === EntityType.NGO && (
                                <>
                                    <ReviewItem label="Nº de Registo de ONG">{kycFields.ngoRegistrationNumber}</ReviewItem>
                                    <ReviewItem label="Finalidade Social">{kycFields.socialPurpose}</ReviewItem>
                                    <ReviewItem label="Escopo Territorial">{kycFields.territorialScope}</ReviewItem>
                                    <ReviewItem label="Fontes de Financiamento" fullWidth>{kycFields.sourceOfFunds}</ReviewItem>
                                    <ReviewItem label="Representante Legal">{kycFields.legalRepresentativeName}</ReviewItem>
                                </>
                            )}
                        </ReviewSection>

                        <ReviewSection title="Etapa 3: Análise DDQ e Documentos" onEdit={() => setStep(3)}>
                            {/* DDQ Questions */}
                            {entityType === EntityType.Individual && (
                                <>
                                    <ReviewItem label="É Pessoa Politicamente Exposta (PEP)?">{kycFields.isPep}</ReviewItem>
                                    <ReviewItem label="Processos criminais/financeiros?">{kycFields.criminalRecordDetails}</ReviewItem>
                                    <ReviewItem label="Mantém atividade empresarial própria?">{kycFields.hasOwnBusiness}</ReviewItem>
                                    <ReviewItem label="Origem do Património (Detalhe)" fullWidth>{kycFields.sourceOfWealth}</ReviewItem>
                                </>
                            )}
                            {entityType === EntityType.PrivateCompany && (
                                <>
                                    {showBeneficialOwner && <ReviewItem label="Beneficiário Efetivo (UBO)">{beneficialOwner}</ReviewItem>}
                                    <ReviewItem label="O UBO é uma PEP?">{kycFields.uboIsPep}</ReviewItem>
                                    <ReviewItem label="Atividade económica real?">{kycFields.hasRealEconomicActivity}</ReviewItem>
                                    <ReviewItem label="Histórico de sanções?">{kycFields.sanctionsHistory}</ReviewItem>
                                    <ReviewItem label="Operações em países de alto risco?">{kycFields.hasInternationalOperations}</ReviewItem>
                                    <ReviewItem label="Sugere ser 'shell company'?">{kycFields.isShellCompany}</ReviewItem>
                                </>
                            )}
                            {entityType === EntityType.PublicEntity && (
                                <ReviewItem label="Representante formalmente nomeado?">{kycFields.isRepresentativeFormallyAppointed}</ReviewItem>
                            )}
                            {entityType === EntityType.NGO && (
                                <>
                                    {showBeneficialOwner && <ReviewItem label="Beneficiário Efetivo (UBO)">{beneficialOwner}</ReviewItem>}
                                    <ReviewItem label="Recebe financiamento internacional?">{kycFields.receivesInternationalFunding}</ReviewItem>
                                    <ReviewItem label="Opera em zonas de conflito?">{kycFields.operatesInConflictZones}</ReviewItem>
                                    <ReviewItem label="Histórico associado a financiamento ilícito?">{kycFields.illicitFinancingHistory}</ReviewItem>
                                </>
                            )}

                             {/* Shareholders */}
                            {shareholders.length > 0 && (
                                <div className="sm:col-span-2 lg:col-span-3 pt-4 mt-4 border-t border-dashed border-border">
                                    <h4 className="text-sm font-medium text-text-secondary mb-2">Acionistas e Diretores</h4>
                                    <div className="space-y-2">
                                    {shareholders.map(s => (
                                        <div key={s.id} className="text-sm p-2 bg-background rounded-md">
                                            <p className="font-semibold text-text-main">{s.name}</p>
                                            <p className="text-xs text-text-secondary">{s.position} • {s.nationality} • {s.participation}%</p>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            )}

                             {/* Documents */}
                            {documents.length > 0 && (
                                <div className="sm:col-span-2 lg:col-span-3 pt-4 mt-4 border-t border-dashed border-border">
                                    <h4 className="text-sm font-medium text-text-secondary mb-2">Documentos Anexados</h4>
                                    <div className="space-y-2">
                                        {documents.map(d => (
                                            <div key={d.name} className="text-sm p-2 bg-background rounded-md flex justify-between items-center">
                                                <p className="font-semibold text-text-main">{d.name}</p>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[d.status].classes}`}>{d.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </ReviewSection>
                    </div>
                )}
            </div>
            
            <div className="flex justify-between items-center mt-12 border-t-2 border-border pt-6">
                <div>
                    {step === 1 ? (
                        <button 
                            type="button" 
                            onClick={() => onModuleChange('entities')} 
                            className="bg-transparent border-2 border-border hover:bg-gray-100 text-text-main font-bold py-3 px-6 rounded-xl transition-colors text-base"
                        >
                            &larr; Voltar à Lista
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            onClick={prevStep} 
                            className="bg-transparent border-2 border-border hover:bg-gray-100 text-text-main font-bold py-3 px-6 rounded-xl transition-colors text-base"
                        >
                            &larr; Anterior
                        </button>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    <button 
                        type="button" 
                        onClick={() => onModuleChange('entities', undefined, true)} 
                        className="text-danger hover:underline font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Sair sem Salvar
                    </button>
                    {step < 4 ? (
                        <button 
                            type="button" 
                            onClick={nextStep} 
                            disabled={(step === 1 && !isStep1Valid)} 
                            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-base"
                        >
                            Próximo &rarr;
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            onClick={submit} 
                            className="bg-success hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-base"
                        >
                            {isEditMode ? 'Salvar Alterações' : 'Submeter Entidade'}
                        </button>
                    )}
                </div>
            </div>
        </div>
        </>
    );
};


const DDQSelect: React.FC<{
    question: string;
    field: keyof Entity;
    value?: string;
    onChange: (field: keyof Entity, value: string) => void;
}> = ({ question, field, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">{question}</label>
        <select value={value || 'Não Verificado'} onChange={e => onChange(field, e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main">
            <option>Não Verificado</option>
            <option>Sim</option>
            <option>Não</option>
        </select>
    </div>
);


export default NewEntityPage;