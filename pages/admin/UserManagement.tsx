import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { mockUsers } from '../../data/mockData';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { EditIcon } from '../../components/icons/EditIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  userToEdit: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('Tecnico');
  const isEditMode = !!userToEdit;

  useEffect(() => {
    if (isOpen) {
        setName(userToEdit?.name || '');
        setEmail(userToEdit?.email || '');
        setRole(userToEdit?.role || 'Tecnico');
    }
  }, [isOpen, userToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: userToEdit?.id || `u${Date.now()}`,
      name,
      email,
      role,
    };
    onSave(user);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-primary mb-4">{isEditMode ? 'Editar Utilizador' : 'Adicionar Utilizador'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Nome Completo</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-background border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email</label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-background border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none" />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-1">Função</label>
            <select id="role" value={role} onChange={e => setRole(e.target.value as User['role'])} className="w-full bg-background border border-border rounded-lg p-2 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none">
              <option>Administrador</option>
              <option>Gestor/Director da Area</option>
              <option>Tecnico</option>
              <option>Director Geral</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg">Cancelar</button>
            <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg">{isEditMode ? 'Salvar Alterações' : 'Adicionar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const handleOpenModal = (user?: User) => {
        setUserToEdit(user || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setUserToEdit(null);
    };

    const handleSaveUser = (user: User) => {
        const isEditing = users.some(u => u.id === user.id);
        if (isEditing) {
            setUsers(users.map(u => u.id === user.id ? user : u));
        } else {
            setUsers([...users, user]);
        }
        // This is where we would update the mockData file, but for simulation, we update local state
        const mockIndex = mockUsers.findIndex(u => u.id === user.id);
        if (mockIndex > -1) {
            mockUsers[mockIndex] = user;
        } else {
            mockUsers.push(user);
        }
        handleCloseModal();
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm('Tem a certeza que deseja apagar este utilizador?')) {
            setUsers(users.filter(u => u.id !== userId));
            const mockIndex = mockUsers.findIndex(u => u.id === userId);
            if (mockIndex > -1) {
                mockUsers.splice(mockIndex, 1);
            }
        }
    };

    return (
        <div className="animate-fade-in">
            <UserModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveUser} userToEdit={userToEdit} />
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-primary">Utilizadores do Sistema</h3>
                    <p className="text-sm text-text-secondary mt-1">Gira os perfis e permissões de acesso.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-secondary hover:bg-secondary-hover text-primary font-semibold py-2 px-4 rounded-lg text-sm flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" /> Adicionar Utilizador
                </button>
            </div>
            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs text-text-secondary uppercase bg-background">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Nome</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Email</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Função</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-4">
                                        <button onClick={() => handleOpenModal(user)} className="text-text-secondary hover:text-primary" aria-label="Editar">
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="text-text-secondary hover:text-danger" aria-label="Apagar">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;