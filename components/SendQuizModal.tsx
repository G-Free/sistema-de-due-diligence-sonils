import React, { useState, useEffect } from 'react';

interface SendQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (title: string, recipients: { type: 'group' | 'specific', value: string }) => void;
}

const emailGroups = [
    { id: 'all', name: 'Todos os Colaboradores' },
    { id: 'finance', name: 'Departamento de Finanças' },
    { id: 'logistics', name: 'Equipa de Logística' },
    { id: 'hr', name: 'Recursos Humanos' },
];

const SendQuizModal: React.FC<SendQuizModalProps> = ({ isOpen, onClose, onSend }) => {
  const [title, setTitle] = useState('');
  const [recipientType, setRecipientType] = useState<'group' | 'specific'>('group');
  const [selectedGroup, setSelectedGroup] = useState(emailGroups[0].id);
  const [specificEmails, setSpecificEmails] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setRecipientType('group');
      setSelectedGroup(emailGroups[0].id);
      setSpecificEmails('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!title.trim()) return;
    const recipients = {
      type: recipientType,
      value: recipientType === 'group' ? selectedGroup : specificEmails
    };
    if (recipientType === 'specific' && !specificEmails.trim()) return;

    onSend(title, recipients);
  };

  const isSendDisabled = !title.trim() || (recipientType === 'specific' && !specificEmails.trim());

  const TabButton: React.FC<{ type: 'group' | 'specific', label: string }> = ({ type, label }) => (
    <button
      onClick={() => setRecipientType(type)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        recipientType === type 
          ? 'bg-primary text-white' 
          : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl p-8 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-primary mb-4">Enviar Quiz</h2>
        <p className="text-text-secondary mb-6">Defina um título e escolha os destinatários para esta campanha de quiz.</p>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="quizTitle" className="block text-sm font-medium text-text-secondary mb-1">Título do Quiz</label>
            <input
              type="text"
              id="quizTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
              placeholder="Ex: Treinamento de Compliance Q3"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Destinatários</label>
            <div className="flex space-x-2 mb-3 p-1 bg-background rounded-lg">
                <TabButton type="group" label="Grupos Pré-definidos" />
                <TabButton type="specific" label="Emails Específicos" />
            </div>

            {recipientType === 'group' ? (
                <select 
                    value={selectedGroup} 
                    onChange={e => setSelectedGroup(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
                >
                    {emailGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                </select>
            ) : (
                <textarea
                  id="quizEmails"
                  value={specificEmails}
                  onChange={(e) => setSpecificEmails(e.target.value)}
                  rows={5}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
                  placeholder="colaborador1@sonils.co.ao&#10;colaborador2@sonils.co.ao"
                />
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={isSendDisabled}
            className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendQuizModal;