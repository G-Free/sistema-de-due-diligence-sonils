
import React, { useState, useEffect, useRef } from 'react';
import { ModuleChangeProps, QuizQuestion } from '../types';
// Fix: Import from unified gemini service instead of removed geminiService.ts
import { generateQuizFromText } from '../services/gemini';
import SendQuizModal from '../components/SendQuizModal';
import QuizPreviewModal from '../components/QuizPreviewModal';

const CreateQuiz: React.FC<ModuleChangeProps> = ({ onModuleChange, setIsFormDirty }) => {
    const [sourceText, setSourceText] = useState('A Política de Compliance da SONILS, alinhada com a norma ISO 37001 e a Lei Anticorrupção de Angola, proíbe estritamente o suborno e a corrupção em todas as suas operações. Nenhum colaborador pode oferecer, prometer ou receber vantagens indevidas. Uma "Pessoa Politicamente Exposta" (PEP) requer uma análise de risco acrescida. Violações desta política resultarão em medidas disciplinares severas, incluindo o despedimento.');
    const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (!setIsFormDirty) return;
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            // The form is dirty if there is text and no quiz has been sent yet
            setIsFormDirty(sourceText.trim().length > 0);
        }
    }, [sourceText, setIsFormDirty]);
    
    useEffect(() => {
        return () => {
            if (setIsFormDirty) setIsFormDirty(false);
        };
    }, [setIsFormDirty]);


    const handleGenerateQuiz = async () => {
        if (!sourceText.trim()) {
            setError('Por favor, insira algum texto para gerar um questionário.');
            return;
        }
        setIsLoading(true);
        setError('');
        setQuiz(null);
        try {
            const generatedQuiz = await generateQuizFromText(sourceText, 3);
            setQuiz(generatedQuiz);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateAgain = () => {
        setQuiz(null);
    }

    const handleSendQuiz = () => {
        setIsSendModalOpen(true);
    };
    
    const handleCloseSendModal = () => {
        setIsSendModalOpen(false);
    };

    const handleModalSend = (title: string, recipients: { type: 'group' | 'specific', value: string }) => {
        console.log("Enviando quiz:", { title, recipients, quiz });
        if(setIsFormDirty) setIsFormDirty(false);
        setIsSendModalOpen(false);
        onModuleChange('training');
    };

    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">Criador de Quiz com IA</h2>
                        <p className="text-text-secondary">Cole um texto sobre políticas, procedimentos ou leis, e a IA criará um quiz de avaliação.</p>
                    </div>
                     <button onClick={() => onModuleChange('training')} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-4 rounded-lg transition-colors text-sm shrink-0">
                        &larr; Voltar
                    </button>
                </div>

                {!quiz ? (
                    <div>
                        <textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="Cole o seu texto aqui..."
                            className="w-full h-64 bg-background border border-border rounded-lg p-4 text-text-main focus:ring-2 focus:ring-secondary focus:outline-none mb-4"
                            disabled={isLoading}
                        />
                        <div className="flex justify-between items-center mt-4">
                            <button type="button" onClick={() => onModuleChange('menu-dashboard', undefined, true)} className="text-sm text-danger hover:underline">Sair sem Salvar</button>
                            <button
                                onClick={handleGenerateQuiz}
                                disabled={isLoading || !sourceText.trim()}
                                className="bg-secondary hover:bg-secondary-hover text-primary font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    A Gerar Quiz...
                                </>
                                ) : 'Gerar Quiz'}
                            </button>
                        </div>
                        {error && <p className="text-danger mt-4 text-center">{error}</p>}
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <h3 className="text-xl font-semibold text-primary mb-4">Quiz Gerado com Sucesso!</h3>
                        <div className="space-y-4 bg-background p-4 rounded-lg border border-border">
                            {quiz.map((q, index) => (
                                <div key={index}>
                                    <p className="font-semibold text-text-main">{index + 1}. {q.question}</p>
                                    <ul className="list-disc list-inside pl-4 text-text-secondary text-sm">
                                        {q.options.map((opt, i) => (
                                            <li key={i} className={opt === q.answer ? 'text-success font-medium' : ''}>{opt}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                         <div className="mt-6 flex justify-between items-center">
                            <button type="button" onClick={() => onModuleChange('menu-dashboard', undefined, true)} className="text-sm text-danger hover:underline">Sair sem Salvar</button>
                            <div className="flex flex-col sm:flex-row justify-end gap-4">
                                <button onClick={handleGenerateAgain} className="bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-2 px-6 rounded-lg transition-colors">
                                    Gerar Novamente
                                </button>
                                <button onClick={() => setIsPreviewModalOpen(true)} className="bg-secondary hover:bg-secondary-hover text-primary font-semibold py-2 px-6 rounded-lg transition-colors">
                                    Pré-visualizar Quiz
                                </button>
                                <button onClick={handleSendQuiz} className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                                    Enviar Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <SendQuizModal 
                isOpen={isSendModalOpen}
                onClose={handleCloseSendModal}
                onSend={handleModalSend}
            />
            {quiz && (
                 <QuizPreviewModal
                    isOpen={isPreviewModalOpen}
                    onClose={() => setIsPreviewModalOpen(false)}
                    quiz={quiz}
                />
            )}
        </>
    );
};

export default CreateQuiz;
