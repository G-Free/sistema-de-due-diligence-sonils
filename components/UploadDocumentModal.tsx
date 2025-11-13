import React, { useState, useEffect } from 'react';
import { DocumentStatus } from '../types';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (document: { name: string; status: DocumentStatus }) => void;
  suggestedDocs: string[];
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose, onUpload, suggestedDocs }) => {
  const [docType, setDocType] = useState(suggestedDocs[0] || '');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [customDocName, setCustomDocName] = useState('');

  useEffect(() => {
    if (isOpen) {
        setDocType(suggestedDocs[0] || '');
        setFile(null);
        setIsUploading(false);
        setIsCustom(false);
        setCustomDocName('');
    }
  }, [isOpen, suggestedDocs]);


  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'outro') {
        setIsCustom(true);
        setDocType('');
    } else {
        setIsCustom(false);
        setDocType(value);
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    const finalDocName = isCustom ? customDocName : docType;
    if (!finalDocName.trim()) {
        alert("Por favor, especifique o nome do documento.");
        return;
    }

    setIsUploading(true);
    setTimeout(() => {
      onUpload({
        name: finalDocName,
        status: 'Recebido',
      });
      setIsUploading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl p-8 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-primary mb-4">Carregar Novo Documento</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="docType" className="block text-sm font-medium text-text-secondary mb-1">Tipo de Documento</label>
            <select
              id="docType"
              value={isCustom ? 'outro' : docType}
              onChange={handleSelectChange}
              className="w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
            >
              {suggestedDocs.map(type => <option key={type} value={type}>{type}</option>)}
              <option value="outro">Outro...</option>
            </select>
            {isCustom && (
                 <input
                    type="text"
                    value={customDocName}
                    onChange={(e) => setCustomDocName(e.target.value)}
                    placeholder="Especifique o nome do documento"
                    className="mt-2 w-full bg-background border border-border rounded-lg p-2.5 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none"
                />
            )}
          </div>
          <div>
            <label htmlFor="fileUpload" className="block text-sm font-medium text-text-secondary mb-1">Ficheiro</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md bg-background">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-text-secondary" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-text-secondary">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-card rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-secondary">
                            <span>Selecione um ficheiro</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                    </div>
                    {file ? (
                        <p className="text-xs text-success font-semibold">{file.name}</p>
                    ) : (
                        <p className="text-xs text-text-secondary">PNG, JPG, PDF até 10MB</p>
                    )}
                </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-8">
          <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg">Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={!file || isUploading || (isCustom && !customDocName.trim())}
            className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg disabled:bg-gray-400"
          >
            {isUploading ? 'A carregar...' : 'Carregar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentModal;