import React, { useState, useEffect } from 'react';
import { Entity, LegalStatus } from '../types';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: Entity | null;
  onSave: (entityId: string, newStatus: LegalStatus, justification: string) => void;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({ isOpen, onClose, entity, onSave }) => {
  const [newStatus, setNewStatus] = useState<LegalStatus>(LegalStatus.Active);
  const [justification, setJustification] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (entity) {
      setNewStatus(entity.status);
      setJustification(''); // Reset justification on new entity
      setError('');
    }
  }, [entity]);

  if (!isOpen || !entity) return null;

  const handleSave = () => {
    if (!justification.trim() && newStatus !== entity.status) {
      setError('A justificação é obrigatória para alterar o estado.');
      return;
    }
    onSave(entity.id, newStatus, justification);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-border pb-3 mb-4">
          <h2 className="text-xl font-bold text-primary">Alterar Estado Legal</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
            <p className="text-text-secondary">Entidade: <span className="font-semibold text-text-main">{entity.name}</span></p>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-1">Novo Estado</label>
                <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as LegalStatus)}
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
                >
                    {Object.values(LegalStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="justification" className="block text-sm font-medium text-text-secondary mb-1">Justificação</label>
                <textarea
                    id="justification"
                    rows={4}
                    value={justification}
                    onChange={(e) => {
                        setJustification(e.target.value);
                        if (e.target.value.trim()) setError('');
                    }}
                    placeholder="Descreva o motivo da alteração do estado..."
                    className={`w-full bg-background border rounded-lg p-2.5 text-text-main focus:ring-2 focus:outline-none ${error ? 'border-danger focus:ring-danger' : 'border-border focus:ring-secondary'}`}
                />
                {error && <p className="text-danger text-xs mt-1">{error}</p>}
            </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-border">
          <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;