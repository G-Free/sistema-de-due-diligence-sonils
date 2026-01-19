import React, { useState, useEffect, useRef } from 'react';
import { Script } from '../types';
import { useToast } from './useToast';
import { DownloadIcon } from './icons/DownloadIcon';
import { UploadIcon } from './icons/UploadIcon';
import { SaveIcon } from './icons/SaveIcon'; // Assuming this icon exists or will be created

const ScriptEditorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  script: Script | null;
  onSave: (scriptId: string, newContent: string) => void;
}> = ({ isOpen, onClose, script, onSave }) => {
  const [content, setContent] = useState('');
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (script) {
      setContent(script.content);
    }
  }, [script]);

  if (!isOpen || !script) return null;

  const handleSave = () => {
    onSave(script.id, content);
    addToast(`Script "${script.name}" salvo com sucesso!`, 'success');
    onClose();
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/javascript;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${script.name.replace(/\s/g, '_')}_v${script.version}.js`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Script exportado.', 'info');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        setContent(text as string);
        addToast(`Script "${file.name}" carregado para o editor.`, 'success');
      };
      reader.readAsText(file);
    }
     // Reset file input value to allow uploading the same file again
    if(event.target) event.target.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-primary">{script.name}</h2>
            <p className="text-xs text-text-secondary">Versão: {script.version}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="flex-1 p-2 overflow-hidden">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
            spellCheck="false"
          />
        </main>
        <div className="bg-yellow-50 border-t border-b border-yellow-200 p-3 text-xs text-yellow-800 text-center">
            <strong>Atenção:</strong> A alteração destes scripts pode impactar funcionalidades críticas do sistema. Proceda com cautela.
        </div>
        <footer className="p-4 bg-background border-t border-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={handleUploadClick} className="flex items-center gap-2 text-sm bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg transition-colors">
              <UploadIcon className="w-4 h-4" /> Carregar Script
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".js,.json,.txt" />
            
            <button onClick={handleExport} className="flex items-center gap-2 text-sm bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg transition-colors">
              <DownloadIcon className="w-4 h-4" /> Exportar
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-sm bg-card border border-border hover:bg-border text-text-main font-semibold py-2 px-4 rounded-lg transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 text-sm bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Salvar Alterações
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ScriptEditorModal;
