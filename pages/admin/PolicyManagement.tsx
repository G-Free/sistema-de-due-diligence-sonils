import React, { useState, useEffect } from 'react';
import { DocumentItem } from '../../types';
import { internalPolicies, angolanLaws, internationalNorms } from '../../data/mockData';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { EditIcon } from '../../components/icons/EditIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';

type PolicyListId = 'internal' | 'angolan' | 'international';

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (policy: DocumentItem, listId: PolicyListId) => void;
    policyToEdit: { policy: DocumentItem, listId: PolicyListId } | null;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, onSave, policyToEdit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const isEditMode = !!(policyToEdit && policyToEdit.policy.id);

    useEffect(() => {
        if (isOpen) {
            setTitle(policyToEdit?.policy.title || '');
            setDescription(policyToEdit?.policy.description || '');
        }
    }, [isOpen, policyToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const policyData: DocumentItem = {
            id: policyToEdit?.policy.id || `p${Date.now()}`,
            title,
            description,
        };
        onSave(policyData, policyToEdit!.listId);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-primary mb-4">{isEditMode ? 'Editar Item' : 'Adicionar Novo Item'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">Título</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-background border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required className="w-full bg-background border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg">{isEditMode ? 'Salvar' : 'Adicionar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PolicyManagement: React.FC = () => {
    const [policies, setPolicies] = useState({
        internal: internalPolicies,
        angolan: angolanLaws,
        international: internationalNorms
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [policyToEdit, setPolicyToEdit] = useState<{ policy: DocumentItem, listId: PolicyListId } | null>(null);

    const handleOpenModal = (policy: DocumentItem | null, listId: PolicyListId) => {
        setPolicyToEdit(policy ? { policy, listId } : { policy: { id: '', title: '', description: '' }, listId });
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPolicyToEdit(null);
    };
    
    const handleSavePolicy = (policy: DocumentItem, listId: PolicyListId) => {
        const list = policies[listId];
        const isEditing = list.some(p => p.id === policy.id);
        
        let newList;
        if (isEditing) {
            newList = list.map(p => p.id === policy.id ? policy : p);
        } else {
            newList = [...list, policy];
        }

        // Simulate update in mockData
        if (listId === 'internal') internalPolicies.splice(0, internalPolicies.length, ...newList);
        else if (listId === 'angolan') angolanLaws.splice(0, angolanLaws.length, ...newList);
        else internationalNorms.splice(0, internationalNorms.length, ...newList);

        setPolicies(prev => ({...prev, [listId]: newList}));
        handleCloseModal();
    };

    const handleDeletePolicy = (policyId: string, listId: PolicyListId) => {
        if(window.confirm('Tem a certeza que deseja apagar este item?')) {
            const list = policies[listId];
            const newList = list.filter(p => p.id !== policyId);
            
            if (listId === 'internal') internalPolicies.splice(0, internalPolicies.length, ...newList);
            else if (listId === 'angolan') angolanLaws.splice(0, angolanLaws.length, ...newList);
            else internationalNorms.splice(0, internationalNorms.length, ...newList);

            setPolicies(prev => ({...prev, [listId]: newList}));
        }
    };
    
    const renderPolicySection = (title: string, listId: PolicyListId, list: DocumentItem[]) => (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary">{title}</h3>
                <button onClick={() => handleOpenModal(null, listId)} className="bg-secondary/20 hover:bg-secondary/40 text-secondary-hover font-semibold py-1.5 px-3 rounded-md text-xs flex items-center gap-1">
                    <PlusIcon className="w-3 h-3"/> Adicionar
                </button>
            </div>
            <div className="space-y-3">
                {list.map(doc => (
                    <div key={doc.id} className="bg-background p-3 rounded-lg border border-border flex justify-between items-center">
                        <div>
                            <h4 className="font-semibold text-text-main text-sm">{doc.title}</h4>
                            <p className="text-xs text-text-secondary mt-1">{doc.description}</p>
                        </div>
                        <div className="flex items-center shrink-0 ml-4 gap-2">
                            <button onClick={() => handleOpenModal(doc, listId)} className="text-text-secondary hover:text-primary p-1"><EditIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleDeletePolicy(doc.id, listId)} className="text-text-secondary hover:text-danger p-1"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <PolicyModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSavePolicy} policyToEdit={policyToEdit} />
            {renderPolicySection('Políticas Internas SONILS', 'internal', policies.internal)}
            {renderPolicySection('Legislação Angolana', 'angolan', policies.angolan)}
            {renderPolicySection('Normas Internacionais', 'international', policies.international)}
        </div>
    );
};

export default PolicyManagement;