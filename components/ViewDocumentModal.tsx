import React from 'react';
import { Document } from '../types';
import { DocumentIcon } from './icons/DocumentIcon';

interface ViewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

const ViewDocumentModal: React.FC<ViewDocumentModalProps> = ({ isOpen, onClose, document }) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-primary flex items-center">
            <DocumentIcon className="w-5 h-5 mr-2" />
            {document.name}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="flex-1 p-6 bg-background text-center flex flex-col items-center justify-center">
            <div className="text-text-secondary">
                <DocumentIcon className="w-24 h-24 mx-auto text-gray-300" />
                <h3 className="text-xl font-semibold mt-4 text-text-main">Pré-visualização de Documento</h3>
                <p className="mt-2">Esta é uma simulação da visualização do documento.</p>
                <p className="text-sm mt-1">Numa aplicação real, o conteúdo do ficheiro (PDF, Imagem, etc.) seria exibido aqui.</p>
            </div>
        </main>
      </div>
    </div>
  );
};

export default ViewDocumentModal;
