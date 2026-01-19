import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ModuleChangeProps, EntityType } from '../types';
import { criteriaMatrix, addCriterion, deleteCriterion, updateCriterion, addQuestion, deleteQuestion, editQuestion } from '../data/matrixData';
import { EditIcon } from '../components/icons/EditIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import CriterionQuestionModal from '../components/CriterionQuestionModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../components/useToast';

type ModalMode = 'addCriterion' | 'editCriterion' | 'addQuestion' | 'editQuestion';
type DeletionMode = 'criterion' | 'question';

const TabButton: React.FC<{
  entityType: EntityType;
  label: string;
  isActive: boolean;
  onClick: (type: EntityType) => void;
}> = ({ entityType, label, isActive, onClick }) => (
  <button
    onClick={() => onClick(entityType)}
    className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors focus:outline-none ${
      isActive
        ? 'border-primary text-primary'
        : 'border-transparent text-text-secondary hover:border-gray-300 hover:text-text-main'
    }`}
  >
    {label}
  </button>
);

const AssessmentTemplateBuilder: React.FC<ModuleChangeProps> = ({ onModuleChange, setIsFormDirty }) => {
  const [matrix, setMatrix] = useState(criteriaMatrix);
  const [activeTab, setActiveTab] = useState<EntityType>(EntityType.PrivateCompany);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    mode: ModalMode;
    criterionName?: string;
    questionKey?: string;
    initialData?: { name?: string; weight?: number; text?: string };
  } | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
      mode: DeletionMode,
      title: string;
      message: string;
      onConfirm: () => void;
  } | null>(null);
  
  const pristineMatrix = useRef<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    // Set initial state for dirty check
    pristineMatrix.current = JSON.stringify(criteriaMatrix);
    if (setIsFormDirty) {
        setIsFormDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // on mount

  useEffect(() => {
      if (pristineMatrix.current && setIsFormDirty) {
          setIsFormDirty(JSON.stringify(matrix) !== pristineMatrix.current);
      }
  }, [matrix, setIsFormDirty]);

  // Cleanup effect
  useEffect(() => {
    return () => {
        if (setIsFormDirty) {
            setIsFormDirty(false);
        }
    };
  }, [setIsFormDirty]);

  const forceUpdate = () => {
    setMatrix({ ...criteriaMatrix });
  };

  const totalWeight = useMemo(() => {
    // FIX: Explicitly type the accumulator `sum` as a number and criterion to resolve arithmetic operation error.
    return Object.values(matrix[activeTab]).reduce((sum: number, criterion: { weight: number }) => sum + criterion.weight, 0);
  }, [matrix, activeTab]);

  const handleSaveChanges = () => {
      pristineMatrix.current = JSON.stringify(matrix);
      if (setIsFormDirty) {
          setIsFormDirty(false);
      }
      addToast('Template de avaliação salvo com sucesso!', 'success');
  }

  // --- Modal Handlers ---

  const handleOpenModal = (config: typeof modalConfig) => {
    setModalConfig(config);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalConfig(null);
  };

  const handleSaveModal = (data: { name?: string; weight?: number; text?: string }) => {
    if (!modalConfig) return;

    switch (modalConfig.mode) {
      case 'addCriterion':
        if (data.name && data.weight) {
            addCriterion(activeTab, data.name, data.weight);
        }
        break;
      case 'editCriterion':
        if (modalConfig.criterionName && data.weight) {
            updateCriterion(activeTab, modalConfig.criterionName, data.weight);
        }
        break;
      case 'addQuestion':
        if (modalConfig.criterionName && data.text) {
            addQuestion(activeTab, modalConfig.criterionName, data.text);
        }
        break;
      case 'editQuestion':
        if (modalConfig.criterionName && modalConfig.questionKey && data.text) {
            editQuestion(activeTab, modalConfig.criterionName, modalConfig.questionKey, data.text);
        }
        break;
    }
    forceUpdate();
    handleCloseModal();
  };

  // --- Confirmation Handlers ---

  const handleOpenConfirmModal = (config: Omit<typeof confirmConfig, 'onConfirm'> & { onConfirm: () => void } ) => {
      setConfirmConfig(config);
      setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
      setIsConfirmModalOpen(false);
      setConfirmConfig(null);
  };

  const handleConfirmDeletion = () => {
      if (confirmConfig) {
          confirmConfig.onConfirm();
      }
      handleCloseConfirmModal();
  }


  // --- Action Triggers ---
  
  const handleDeleteCriterion = (name: string) => {
    handleOpenConfirmModal({
        mode: 'criterion',
        title: 'Apagar Critério',
        message: `Tem a certeza que deseja apagar o critério "${name}" e todas as suas questões? Esta ação é irreversível.`,
        onConfirm: () => {
            deleteCriterion(activeTab, name);
            forceUpdate();
        }
    })
  };

  const handleDeleteQuestion = (criterionName: string, questionKey: string) => {
    handleOpenConfirmModal({
        mode: 'question',
        title: 'Apagar Questão',
        message: 'Tem a certeza que deseja apagar esta questão?',
        onConfirm: () => {
            deleteQuestion(activeTab, criterionName, questionKey);
            forceUpdate();
        }
    })
  };

  return (
    <>
    <CriterionQuestionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
        config={modalConfig}
    />
    <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDeletion}
        title={confirmConfig?.title || ''}
        message={confirmConfig?.message || ''}
    />
    <div className="bg-card p-6 rounded-lg shadow-sm animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">Construtor de Templates de Avaliação</h2>
          <p className="text-text-secondary">Personalize os critérios e as questões para cada tipo de entidade.</p>
        </div>
        <button onClick={() => onModuleChange('user-management')} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
            &larr; Voltar para Admin
        </button>
      </div>

      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          {Object.values(EntityType).map(type => (
            <TabButton key={type} entityType={type} label={type} isActive={activeTab === type} onClick={setActiveTab} />
          ))}
        </nav>
      </div>

      <div className="bg-background p-4 rounded-lg border border-border mb-6 flex justify-between items-center">
        <p className="text-sm text-text-secondary">
          Personalize a matriz para: <span className="font-semibold text-primary">{activeTab}</span>
        </p>
        <div className={`text-sm font-bold p-2 rounded-md ${totalWeight !== 1 ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
          Peso Total: {(totalWeight * 100).toFixed(0)}%
          {totalWeight !== 1 && <span className="ml-2 font-normal">(Deve ser 100%)</span>}
        </div>
      </div>


      <div className="space-y-3">
        {Object.keys(matrix[activeTab]).map((criterionName) => {
          const data = matrix[activeTab][criterionName];
          return (
            <div key={criterionName} className="bg-background border border-border rounded-lg transition-all duration-300">
              <button
                onClick={() => setOpenAccordion(openAccordion === criterionName ? null : criterionName)}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50"
              >
                <h3 className="font-semibold text-primary">{criterionName} <span className="text-sm text-text-secondary font-normal">(Peso: {data.weight * 100}%)</span></h3>
                <div className="flex items-center space-x-2">
                   <button onClick={(e) => { e.stopPropagation(); handleOpenModal({ mode: 'editCriterion', criterionName, initialData: { name: criterionName, weight: data.weight } }) }} className="text-text-secondary hover:text-primary p-1" aria-label="Editar Critério">
                        <EditIcon className="w-4 h-4" />
                    </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteCriterion(criterionName); }} className="text-text-secondary hover:text-danger p-1" aria-label="Apagar Critério">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  <svg className={`w-5 h-5 text-text-secondary transition-transform ${openAccordion === criterionName ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {openAccordion === criterionName && (
                <div className="p-4 border-t border-border animate-fade-in space-y-3">
                    {/* FIX: Explicitly type `key` and `question` to resolve 'unknown' type error. */}
                    {Object.entries(data.items).map(([key, question]: [string, string]) => (
                      <div key={key} className="flex justify-between items-center p-2 rounded bg-card border border-border">
                        <p className="text-sm text-text-main flex-1">{question}</p>
                        <div className="flex items-center shrink-0 ml-4 gap-2">
                           <button onClick={() => handleOpenModal({ mode: 'editQuestion', criterionName, questionKey: key, initialData: { text: question } })} className="text-text-secondary hover:text-primary p-1" aria-label="Editar Questão">
                                <EditIcon className="w-4 h-4" />
                            </button>
                           <button onClick={() => handleDeleteQuestion(criterionName, key)} className="text-text-secondary hover:text-danger p-1" aria-label="Apagar Questão">
                                <TrashIcon className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    ))}
                  <button onClick={() => handleOpenModal({ mode: 'addQuestion', criterionName })} className="mt-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-1.5 px-3 rounded-md text-xs flex items-center gap-1">
                    <PlusIcon className="w-3 h-3"/> Adicionar Questão
                  </button>
                </div>
              )}
            </div>
          );
        })}
         <div className="pt-4 text-right">
             <button onClick={() => handleOpenModal({ mode: 'addCriterion' })} className="bg-secondary hover:bg-secondary-hover text-primary font-semibold py-2 px-4 rounded-lg text-sm flex items-center gap-2 inline-flex">
                <PlusIcon className="w-4 h-4" /> Adicionar Critério
            </button>
         </div>
      </div>
       <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
          <button type="button" onClick={() => onModuleChange('menu-dashboard', undefined, true)} className="text-sm text-danger hover:underline">Sair sem Salvar</button>
          <button onClick={handleSaveChanges} className="bg-success hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Salvar Alterações
          </button>
      </div>
    </div>
    </>
  );
};

export default AssessmentTemplateBuilder;