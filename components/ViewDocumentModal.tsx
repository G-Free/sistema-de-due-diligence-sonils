import React from 'react';
import { Document } from '../types';
import { DocumentIcon } from './icons/DocumentIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ViewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onDownload: (doc: Document) => void;
}

const ViewDocumentModal: React.FC<ViewDocumentModalProps> = ({ isOpen, onClose, document, onDownload }) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-primary flex items-center">
            <DocumentIcon className="w-5 h-5 mr-2" />
            {document.name}
          </h2>
          <div className="flex items-center gap-4">
            <button onClick={() => onDownload(document)} className="flex items-center gap-2 bg-secondary text-primary font-semibold py-1.5 px-3 rounded-lg text-sm hover:bg-secondary-hover transition-colors">
                <DownloadIcon className="w-4 h-4" />
                <span>Baixar</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
          </div>
        </header>
        <main className="flex-1 p-2 bg-gray-200 overflow-hidden">
            <div className="w-full h-full bg-white shadow-inner border border-gray-300 p-8 overflow-y-auto">
                <h3 className="text-2xl font-bold text-left text-gray-800 border-b pb-2 mb-4">Visualização Simulada de Documento</h3>
                <p className="text-sm text-left text-gray-500 mb-6">Ficheiro: {document.name}</p>
                <div className="text-left text-gray-700 space-y-4 text-base leading-relaxed prose">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi.</p>
                    <div className="h-64 bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center my-6 rounded-md">
                        <p className="text-gray-400">[ Espaço para imagem ou conteúdo do documento ]</p>
                    </div>
                    <p>Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim.</p>
                    <p>Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam. Proin condimentum fermentum nunc. Etiam pharetra, erat sed fermentum feugiat, velit mauris egestas quam, ut aliquam massa nisl quis neque. Suspendisse in orci enim.</p>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default ViewDocumentModal;