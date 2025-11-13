import React, { useState, useMemo, useEffect, useRef } from 'react';
import { generateSupplierEvaluationSummary } from '../services/geminiService';
import { Entity, HistoryItem, EntityType, ModuleChangeProps, ApprovalQueueItem } from '../types';
import { mockEntities, mockHistory, mockApprovalQueue } from '../data/mockData';
import HistoryDetailModal from '../components/HistoryDetailModal';
import { criteriaMatrix } from '../data/matrixData'; // Import the dynamic matrix
import { WarningIcon } from '../components/icons/WarningIcon';
import { useToast } from '../components/useToast';
import AddEntityModal from '../components/AddEntityModal';
import { PlusIcon } from '../components/icons/PlusIcon';

const evaluationOptions = ['A - Favorável', 'C - Não Favorável', 'D - Pendente'];

const scoreMap: Record<string, number> = {
  'A - Favorável': 5,
  'C - Não Favorável': 1,
  'D - Pendente': 1,
};

const classificationConfig: Record<string, { text: string, color: string, badge: string }> = {
  'A - Favorável': { text: 'A - Favorável', color: 'text-success', badge: 'bg-success/20 text-success' },
  'B - Favorável com Ressalvas': { text: 'B - Favorável com Ressalvas', color: 'text-warning', badge: 'bg-warning/20 text-warning' },
  'C - Não Favorável': { text: 'C - Não Favorável', color: 'text-danger', badge: 'bg-danger/20 text-danger' },
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-text-secondary">{label}</dt>
        <dd className="mt-1 text-sm text-text-main font-semibold">{value}</dd>
    </div>
);

const EditableInfoItem: React.FC<{ label: string; value: string; name: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: 'text' | 'date' }> = ({ label, value, name, onChange, type = 'text' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary">{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            className="mt-1 w-full bg-background border border-border rounded-md py-1.5 px-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary transition"
        />
    </div>
);

const DetailRow: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, name, value, onChange }) => (
  <tr className="hover:bg-gray-50">
    <td className="p-3 text-sm text-text-main">{label}</td>
    <td className="p-3 w-56">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-background border border-border rounded-md py-1.5 px-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary transition"
        aria-label={`Avaliação para ${label}`}
      >
        {evaluationOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </td>
  </tr>
);

interface RiskAssessmentProps extends ModuleChangeProps {
  initialView?: 'history' | 'form';
  selectedId?: string;
  setIsFormDirty?: (isDirty: boolean) => void;
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ onModuleChange, setIsFormDirty, initialView, selectedId }) => {
  const [view, setView] = useState<'history' | 'form'>(initialView || 'history');
  const [selectedEntityId, setSelectedEntityId] = useState<string>(selectedId || '1');
  const selectedEntity = useMemo(() => mockEntities.find(e => e.id === selectedEntityId)!, [selectedEntityId]);

  const [nameQuery, setNameQuery] = useState('');
  const [nifQuery, setNifQuery] = useState('');
  
  const [nameSearchResults, setNameSearchResults] = useState<Entity[]>([]);
  const [nifSearchResults, setNifSearchResults] = useState<Entity[]>([]);
  const [isNameDropdownOpen, setIsNameDropdownOpen] = useState(false);
  const [isNifDropdownOpen, setIsNifDropdownOpen] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  
  const pristineState = useRef<string | null>(null);

  const [serviceType, setServiceType] = useState('');
  const [startDate, setStartDate] = useState('2025-10-20');
  const [endDate, setEndDate] = useState('2025-11-20');

  const [formState, setFormState] = useState<Record<string, string>>({});
  const [observacoes, setObservacoes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // History states
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);
  const [historySearch, setHistorySearch] = useState('');
  const [historyClassificationFilter, setHistoryClassificationFilter] = useState('all');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  
  // Add Entity Modal State
  const [isAddEntityModalOpen, setIsAddEntityModalOpen] = useState(false);

  const problematicDocuments = useMemo(() => {
    if (!selectedEntity?.documents) return [];
    return selectedEntity.documents.filter(doc => doc.status === 'Pendente' || doc.status === 'Expirado');
  }, [selectedEntity]);
  
  const infoNeededRequest = useMemo(() => {
    if (!selectedEntity) return null;
    return mockApprovalQueue.find(item => 
        item.entityId === selectedEntity.id && 
        item.status === 'Mais Informação Necessária'
    );
  }, [selectedEntity]);

    // Effect to initialize the form when the entity changes
    useEffect(() => {
        if (selectedEntity) {
            setNameQuery(selectedEntity.name);
            setNifQuery(selectedEntity.nif);

            const initialServiceType = selectedEntity.services.join(', ');
            const initialStartDate = '2025-10-20';
            const initialEndDate = '2025-11-20';
            const initialObservacoes = '';
            
            setServiceType(initialServiceType);
            setStartDate(initialStartDate);
            setEndDate(initialEndDate);
            setObservacoes(initialObservacoes);

            const initialQuestionsState: Record<string, string> = {};
            const currentCriteria = criteriaMatrix[selectedEntity.entityType];
            if (currentCriteria) {
                for (const key in currentCriteria) {
                    const criterion = currentCriteria[key];
                    for (const itemKey of Object.keys(criterion.items)) {
                        initialQuestionsState[itemKey] = 'D - Pendente';
                    }
                }
            }
            setFormState(initialQuestionsState);

            pristineState.current = JSON.stringify({
                formState: initialQuestionsState,
                observacoes: initialObservacoes,
                serviceType: initialServiceType,
                startDate: initialStartDate,
                endDate: initialEndDate,
            });

            if (setIsFormDirty) {
                setIsFormDirty(false);
            }
        }
    }, [selectedEntityId, selectedEntity, setIsFormDirty]);

    // Effect to check for dirtiness by comparing current state to pristine state
    useEffect(() => {
        if (!pristineState.current || !setIsFormDirty) {
            return;
        }

        const currentState = JSON.stringify({
            formState,
            observacoes,
            serviceType,
            startDate,
            endDate,
        });
        
        setIsFormDirty(currentState !== pristineState.current);

    }, [formState, observacoes, serviceType, startDate, endDate, setIsFormDirty]);

  // Cleanup effect on unmount
  useEffect(() => {
    return () => {
      if (setIsFormDirty) {
        setIsFormDirty(false);
      }
    };
  }, [setIsFormDirty]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsNameDropdownOpen(false);
        setIsNifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const calculatedScores = useMemo(() => {
    const scores: Record<string, number> = {};
    let finalScore = 0;
    const currentMatrix = criteriaMatrix[selectedEntity.entityType];

    if (!currentMatrix) {
      return { scores: {}, finalScore: 0, finalClassification: 'C - Não Favorável' };
    }
    
    for (const criterionKey in currentMatrix) {
        const criterion = currentMatrix[criterionKey];
        const questionKeys = Object.keys(criterion.items);
        if (questionKeys.length === 0) continue;

        const totalScore = questionKeys.reduce((acc, key) => acc + (scoreMap[formState[key]] || 0), 0);
        const averageScore = totalScore / questionKeys.length;
        scores[criterionKey] = averageScore;
        finalScore += (averageScore / 5) * criterion.weight;
    }
    
    const finalScorePercentage = finalScore * 100;
    
    let finalClassification: keyof typeof classificationConfig = 'C - Não Favorável';
    if (finalScorePercentage >= 80) {
      finalClassification = 'A - Favorável';
    } else if (finalScorePercentage >= 60) {
      finalClassification = 'B - Favorável com Ressalvas';
    }

    return { scores, finalScore: finalScorePercentage, finalClassification };
  }, [formState, selectedEntity.entityType]);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
        const matchesSearch = item.entityName.toLowerCase().includes(historySearch.toLowerCase());
        const matchesClassification = historyClassificationFilter === 'all' || item.classification === historyClassificationFilter;
        return matchesSearch && matchesClassification;
    });
  }, [historySearch, historyClassificationFilter, history]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleNameSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setNameQuery(query);
    if (query.trim() === '') {
      setNameSearchResults([]);
      setIsNameDropdownOpen(false);
    } else {
      const results = mockEntities.filter(entity =>
        entity.name.toLowerCase().includes(query.toLowerCase())
      );
      setNameSearchResults(results);
      setIsNameDropdownOpen(true);
      setIsNifDropdownOpen(false); // Explicitly close the other dropdown
    }
  };

  const handleNifSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setNifQuery(query);
    if (query.trim() === '') {
      setNifSearchResults([]);
      setIsNifDropdownOpen(false);
    } else {
      const results = mockEntities.filter(entity =>
        entity.nif.includes(query)
      );
      setNifSearchResults(results);
      setIsNifDropdownOpen(true);
      setIsNameDropdownOpen(false); // Explicitly close the other dropdown
    }
  };

  const handleSelectEntity = (entity: Entity) => {
    setSelectedEntityId(entity.id);
    setNameQuery(entity.name);
    setNifQuery(entity.nif);
    setIsNameDropdownOpen(false);
    setIsNifDropdownOpen(false);
  };
  
  const handleSaveNewEntity = (newEntity: Entity) => {
      mockEntities.unshift(newEntity); // Add to mock data
      addToast(`Entidade "${newEntity.name}" adicionada com sucesso!`, 'success');
      setIsAddEntityModalOpen(false);
      // Automatically select the new entity
      handleSelectEntity(newEntity);
  };

  const getInitialValueForModal = () => {
      if (isNameDropdownOpen) return { name: nameQuery, nif: '' };
      if (isNifDropdownOpen) return { name: '', nif: nifQuery };
      return { name: nameQuery, nif: nifQuery };
  }

  
  const handleGenerateAISummary = async () => {
    setIsGenerating(true);
    setObservacoes('A gerar análise de risco com IA...');
    const payload = {
      generalInfo: {
        nif: selectedEntity.nif,
        name: selectedEntity.name,
        address: selectedEntity.address,
        serviceType: serviceType,
        entityType: selectedEntity.entityType,
      },
      criteriaMatrix: criteriaMatrix[selectedEntity.entityType],
      formState: formState,
      finalScore: calculatedScores.finalScore,
      finalClassification: calculatedScores.finalClassification,
    };
    try {
        const summary = await generateSupplierEvaluationSummary(payload);
        setObservacoes(summary);
    } catch(e) {
        setObservacoes("Ocorreu um erro ao gerar a análise. Por favor, tente novamente.");
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleViewDetails = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setIsHistoryModalOpen(true);
  };

    const handleBackToHistory = () => {
        if (setIsFormDirty && onModuleChange) {
            setIsFormDirty(false);
            setTimeout(() => {
                setView('history');
            }, 0);
        }
    };

  const handleSaveAssessment = () => {
    const newId = `h${history.length + 1}`;
    const newSequenceNumber = `AVR-${new Date().getFullYear()}-00${history.length + 1}`;
    
    const newAssessment: HistoryItem = {
        id: newId,
        sequenceNumber: newSequenceNumber,
        entityName: selectedEntity.name,
        assessmentDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        finalScore: calculatedScores.finalScore,
        classification: calculatedScores.finalClassification,
        user: 'Utilizador Atual', // This would come from logged in user in a real app
        formState: formState,
        observations: observacoes,
    };
    // Update local state for immediate UI feedback
    setHistory(prevHistory => [newAssessment, ...prevHistory]);
    // Update mock data for persistence across navigation
    mockHistory.unshift(newAssessment);

    // Create a new approval request
    const newApprovalId = `aq${mockApprovalQueue.length + 1}`;
    const newApprovalRequest: ApprovalQueueItem = {
        id: newApprovalId,
        entityId: selectedEntity.id,
        entityName: selectedEntity.name,
        requestType: 'Avaliação de Risco',
        requester: 'Utilizador Atual',
        requestDate: new Date().toISOString().split('T')[0],
        status: 'Aguardando Revisão de Compliance',
        log: [{
            step: 'Submissão',
            user: 'Utilizador Atual',
            date: new Date().toISOString().split('T')[0],
            action: 'Submetido',
            comments: 'Avaliação de risco inicial submetida.'
        }]
    };
    mockApprovalQueue.unshift(newApprovalRequest);

    if (setIsFormDirty) setIsFormDirty(false);
    addToast('Avaliação salva e submetida para aprovação!', 'success');
    if (onModuleChange) onModuleChange('approval-queue');
};


  const renderDetailSection = (criterionKey: string, criterionData: { name?: string, weight: number, items: Record<string, string> }) => {
    const itemsToRender = Object.entries(criterionData.items);
    if (itemsToRender.length === 0) return null;

    return (
        <div key={criterionKey}>
            <h3 className="text-lg font-semibold text-primary mb-3">{criterionKey}</h3>
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <tbody className="divide-y divide-border">
                        {itemsToRender.map(([key, label]) => (
                            <DetailRow 
                                key={key}
                                label={label} 
                                name={key}
                                value={formState[key] || 'D - Pendente'} 
                                onChange={handleSelectChange} 
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-6">
        <HistoryDetailModal 
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            item={selectedHistoryItem}
        />
        <AddEntityModal 
            isOpen={isAddEntityModalOpen}
            onClose={() => setIsAddEntityModalOpen(false)}
            onSave={handleSaveNewEntity}
            initialName={getInitialValueForModal().name}
            initialNif={getInitialValueForModal().nif}
        />

        {view === 'history' && (
            <div className="bg-card p-6 rounded-xl shadow-md space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Avaliações de Risco</h1>
                        <p className="text-text-secondary mt-1">Consulte o histórico ou inicie uma nova avaliação de risco.</p>
                    </div>
                    <button onClick={() => setView('form')} className="bg-secondary hover:bg-secondary-hover text-primary font-semibold py-2 px-4 rounded-lg transition-colors mt-4 sm:mt-0">
                        Nova Avaliação
                    </button>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Pesquisar por nome da entidade..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="w-full md:w-1/3 bg-background border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
                    />
                    <select
                        value={historyClassificationFilter}
                        onChange={(e) => setHistoryClassificationFilter(e.target.value)}
                        className="w-full md:w-auto bg-background border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
                    >
                        <option value="all">Todas as Classificações</option>
                        {Object.keys(classificationConfig).map(key => <option key={key} value={key}>{key}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-main uppercase bg-background">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nº Avaliação</th>
                                <th scope="col" className="px-6 py-3">Nome da Entidade</th>
                                <th scope="col" className="px-6 py-3">Data da Avaliação</th>
                                <th scope="col" className="px-6 py-3">Pontuação</th>
                                <th scope="col" className="px-6 py-3">Classificação</th>
                                <th scope="col" className="px-6 py-3">Responsável pela Avaliação</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHistory.map((item) => (
                                <tr key={item.id} className="border-b border-border hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-xs text-text-main">{item.sequenceNumber}</td>
                                    <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">{item.entityName}</td>
                                    <td className="px-6 py-4">{item.assessmentDate}</td>
                                    <td className="px-6 py-4 font-semibold">{item.finalScore.toFixed(1)}%</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classificationConfig[item.classification as keyof typeof classificationConfig]?.badge}`}>
                                            {item.classification}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{item.user}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleViewDetails(item)} className="font-medium text-primary hover:underline">Ver Detalhes</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredHistory.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-text-secondary">Nenhuma avaliação encontrada com os filtros atuais.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {view === 'form' && (
            <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Nova Avaliação de Risco do Fornecedor</h1>
                        <p className="text-text-secondary mt-1">Realize uma nova avaliação de risco preenchendo os campos abaixo.</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0 shrink-0">
                        <button onClick={handleBackToHistory} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg transition-colors">
                            &larr; Voltar ao Histórico
                        </button>
                        <button onClick={() => onModuleChange('menu-dashboard')} className="bg-danger/10 hover:bg-danger/20 text-danger font-semibold py-2 px-4 rounded-lg transition-colors">
                            Sair sem Salvar
                        </button>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold text-primary mb-4">Informações Gerais do Fornecedor</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4" ref={searchContainerRef}>

                        <div className="relative">
                            <label htmlFor="name-search" className="block text-sm font-medium text-text-secondary">Nome da Entidade</label>
                            <div className="relative">
                            <input id="name-search" type="text" value={nameQuery} onChange={handleNameSearch} onFocus={handleNameSearch} placeholder="Digite para procurar..." autoComplete="off"
                                className="mt-1 w-full bg-background border border-border rounded-md py-1.5 px-2 pl-8 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary transition" />
                            <svg className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                            </svg>
                            </div>
                            {isNameDropdownOpen && (
                                <ul className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                                    {nameSearchResults.length > 0 ? (
                                        nameSearchResults.map(entity => (
                                            <li key={entity.id} onClick={() => handleSelectEntity(entity)} className="cursor-pointer select-none relative p-2 text-sm text-text-secondary hover:bg-secondary hover:text-primary">{entity.name}</li>
                                        ))
                                    ) : (
                                        <li>
                                            <button onClick={() => setIsAddEntityModalOpen(true)} className="w-full text-left p-3 text-sm text-primary font-semibold hover:bg-background flex items-center gap-2">
                                                <PlusIcon className="w-4 h-4" />
                                                Adicionar nova entidade
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div className="relative">
                            <label htmlFor="nif-search" className="block text-sm font-medium text-text-secondary">NIF</label>
                            <div className="relative">
                            <input id="nif-search" type="text" value={nifQuery} onChange={handleNifSearch} onFocus={handleNifSearch} placeholder="Digite para procurar..." autoComplete="off"
                                className="mt-1 w-full bg-background border border-border rounded-md py-1.5 px-2 pl-8 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-secondary transition" />
                            <svg className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                            </svg>
                            </div>
                            {isNifDropdownOpen && (
                                <ul className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                                    {nifSearchResults.length > 0 ? (
                                        nifSearchResults.map(entity => (
                                            <li key={entity.id} onClick={() => handleSelectEntity(entity)} className="cursor-pointer select-none relative p-2 text-sm text-text-secondary hover:bg-secondary hover:text-primary">{entity.nif} - {entity.name}</li>
                                        ))
                                    ) : (
                                         <li>
                                            <button onClick={() => setIsAddEntityModalOpen(true)} className="w-full text-left p-3 text-sm text-primary font-semibold hover:bg-background flex items-center gap-2">
                                                <PlusIcon className="w-4 h-4" />
                                                Adicionar nova entidade
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                        
                        <InfoItem label="Tipo de Entidade" value={selectedEntity.entityType} />
                        <div className="lg:col-span-3"><InfoItem label="Endereço" value={selectedEntity.address} /></div>
                        <InfoItem label="Categoria" value={selectedEntity.category} />
                         <EditableInfoItem label="Tipo de Serviço" name="serviceType" value={serviceType} onChange={(e) => setServiceType(e.target.value)} />
                        <EditableInfoItem label="Data de Início" name="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <EditableInfoItem label="Data de Fim" name="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>

                {problematicDocuments.length > 0 && (
                    <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-r-lg" role="alert">
                        <div className="flex items-start">
                            <div className="shrink-0 pt-0.5">
                                <WarningIcon className="h-5 w-5 text-warning" />
                            </div>
                            <div className="ml-3">
                                <p className="font-bold text-yellow-800">Atenção: Documentação Crítica Pendente ou Expirada</p>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>A entidade selecionada possui os seguintes documentos que requerem atenção. Recomenda-se a regularização antes de prosseguir com a avaliação.</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        {problematicDocuments.map((doc, index) => (
                                            <li key={index}>
                                                <strong>{doc.name}</strong> (Estado: 
                                                <span className={`font-semibold ${doc.status === 'Expirado' ? 'text-danger' : 'text-warning'}`}>
                                                    {` ${doc.status}`}
                                                </span>
                                                )
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {infoNeededRequest && (
                    <div className="bg-purple-500/10 border-l-4 border-purple-500 p-4 rounded-r-lg" role="alert">
                        <div className="flex items-start">
                            <div className="shrink-0 pt-0.5">
                                <WarningIcon className="h-5 w-5 text-purple-500" />
                            </div>
                            <div className="ml-3">
                                <p className="font-bold text-purple-800">Pendência na Aprovação</p>
                                <div className="mt-2 text-sm text-purple-700">
                                    <p>Foi solicitada mais informação para esta entidade. Por favor, resolva a seguinte pendência antes de submeter uma nova avaliação:</p>
                                    <blockquote className="mt-2 pl-4 border-l-2 border-purple-300 italic">
                                        "{infoNeededRequest.log?.[infoNeededRequest.log.length - 1]?.comments || 'Nenhum comentário fornecido.'}"
                                        <footer className="text-xs not-italic mt-1">— {infoNeededRequest.log?.[infoNeededRequest.log.length - 1]?.user || 'Desconhecido'} em {infoNeededRequest.log?.[infoNeededRequest.log.length - 1]?.date || ''}</footer>
                                    </blockquote>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                <div className="bg-card p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold text-primary mb-4">Critérios de Avaliação e Ponderação</h2>
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-text-secondary uppercase">
                        <tr>
                            <th scope="col" className="px-3 py-3 text-left font-medium">Critério</th>
                            <th scope="col" className="px-3 py-3 text-center font-medium w-28">Peso (%)</th>
                            <th scope="col" className="px-3 py-3 text-center font-medium w-28">Nota (1-5)</th>
                            <th scope="col" className="px-3 py-3 text-center font-medium w-32">Nota Por Critério</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                        {Object.keys(criteriaMatrix[selectedEntity.entityType] || {}).map((key, index) => {
                            const config = (criteriaMatrix[selectedEntity.entityType] || {})[key];
                            return (
                                <tr key={key} className={index % 2 !== 0 ? '' : 'bg-background'}>
                                <td className="px-3 py-3 font-medium text-text-main">{key}</td>
                                <td className="px-3 py-3 text-center text-text-secondary">{config.weight * 100}%</td>
                                <td className="px-3 py-3 text-center text-text-secondary">{calculatedScores.scores[key]?.toFixed(2) || '0.00'}</td>
                                <td className="px-3 py-3 text-center font-semibold text-text-main">{(((calculatedScores.scores[key] || 0) / 5) * 100).toFixed(0)}%</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    </div>
                </div>
                
                <div className="space-y-6">
                    {Object.keys(criteriaMatrix[selectedEntity.entityType] || {}).map((criterionKey) => {
                        const criterionData = (criteriaMatrix[selectedEntity.entityType] || {})[criterionKey];
                        return renderDetailSection(criterionKey, criterionData)
                    })}
                </div>

                <div className="bg-card p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-semibold text-primary mb-4">Observações</h2>
                    <textarea className="w-full h-36 p-3 bg-background border border-border rounded-lg text-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-secondary whitespace-pre-wrap transition" value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Clique em 'Gerar Análise com IA' para preencher este campo ou insira as suas observações manualmente." />
                </div>

                <div className="bg-card border border-border rounded-xl p-5 shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <h2 className="text-lg font-semibold text-primary mb-2 sm:mb-0">Classificação Final do Fornecedor</h2>
                        <div className="text-left sm:text-right">
                            <p className={`font-bold text-2xl ${classificationConfig[calculatedScores.finalClassification].color}`}>{classificationConfig[calculatedScores.finalClassification].text}</p>
                            <p className="text-lg text-text-secondary font-semibold">{calculatedScores.finalScore.toFixed(0)}%</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-border">
                        <button onClick={handleGenerateAISummary} disabled={isGenerating}
                            className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center" >
                            {isGenerating && (<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>)}
                            {isGenerating ? 'A Analisar...' : 'Gerar Análise com IA'}
                        </button>
                        <button onClick={handleSaveAssessment} className="w-full sm:w-auto bg-success hover:bg-green-600 px-8 py-2.5 rounded-lg font-semibold text-white transition-colors"> Salvar e Submeter </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default RiskAssessment;