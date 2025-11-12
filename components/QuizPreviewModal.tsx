import React from 'react';
import { QuizQuestion } from '../types';
import TakeQuiz from '../pages/TakeQuiz';

interface QuizPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizQuestion[];
}

const QuizPreviewModal: React.FC<QuizPreviewModalProps> = ({ isOpen, onClose, quiz }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-2xl" onClick={e => e.stopPropagation()}>
         <div className="absolute -top-4 -right-4">
             <button 
                onClick={onClose} 
                className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-200 transition-colors"
                aria-label="Fechar pré-visualização"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
         </div>
        <div className="animate-fade-in-up">
            <TakeQuiz quiz={quiz} onModuleChange={onClose} />
        </div>
      </div>
    </div>
  );
};

export default QuizPreviewModal;