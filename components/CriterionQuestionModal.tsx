import React, { useState, useEffect } from 'react';

export interface ModalConfig {
  mode: 'addCriterion' | 'editCriterion' | 'addQuestion' | 'editQuestion';
  initialData?: { name?: string; weight?: number; text?: string };
}

interface CriterionQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name?: string; weight?: number; text?: string }) => void;
  config: ModalConfig | null;
}

const CriterionQuestionModal: React.FC<CriterionQuestionModalProps> = ({ isOpen, onClose, onSave, config }) => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState(0.1);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && config) {
      setName(config.initialData?.name || '');
      setWeight(config.initialData?.weight || 0.1);
      setText(config.initialData?.text || '');
      setError('');
    }
  }, [isOpen, config]);

  if (!isOpen || !config) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (config.mode === 'addCriterion' || config.mode === 'editCriterion') {
        const weightValue = weight * 100;
        if (weightValue < 1 || weightValue > 100) {
            setError('O peso deve ser um valor entre 1 e 100.');
            return;
        }
        // The weight state is already in decimal form (e.g., 0.1 for 10%). Pass it directly.
        onSave({ name, weight });
    } else {
        if (!text.trim()) {
            setError('O texto da questão não pode estar vazio.');
            return;
        }
        onSave({ text });
    }
    onClose();
  };

  const titles = {
    addCriterion: 'Adicionar Novo Critério',
    editCriterion: 'Editar Critério',
    addQuestion: 'Adicionar Nova Questão',
    editQuestion: 'Editar Questão',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-primary mb-4">{titles[config.mode]}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(config.mode === 'addCriterion' || config.mode === 'editCriterion') && (
            <>
              <div>
                <label htmlFor="criterionName" className="block text-sm font-medium text-text-secondary mb-1">Nome do Critério</label>
                <input type="text" id="criterionName" value={name} onChange={e => setName(e.target.value)} required disabled={config.mode === 'editCriterion'} className="w-full bg-background border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none disabled:bg-gray-200 disabled:cursor-not-allowed" />
                {config.mode === 'editCriterion' && <p className="text-xs text-text-secondary mt-1">O nome do critério não pode ser alterado.</p>}
              </div>
              <div>
                <label htmlFor="criterionWeight" className="block text-sm font-medium text-text-secondary mb-1">Peso (%)</label>
                {/* FIX: Use Math.round to prevent floating point issues when converting decimal to percentage for display. */}
                <input type="number" step="1" id="criterionWeight" value={Math.round(weight * 100)} onChange={e => setWeight(parseFloat(e.target.value) / 100)} required className="w-full bg-background border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none" />
              </div>
            </>
          )}
          {(config.mode === 'addQuestion' || config.mode === 'editQuestion') && (
            <div>
              <label htmlFor="questionText" className="block text-sm font-medium text-text-secondary mb-1">Texto da Questão</label>
              <textarea id="questionText" value={text} onChange={e => setText(e.target.value)} rows={4} required className="w-full bg-background border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none" />
            </div>
          )}
          {error && <p className="text-danger text-sm mt-2">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg">Cancelar</button>
            <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriterionQuestionModal;