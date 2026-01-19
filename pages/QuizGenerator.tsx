
import React, { useState } from 'react';
import { ModuleChangeProps, QuizQuestion } from '../types';
// Fix: Import from unified gemini service instead of removed geminiService.ts
import { generateQuizFromText } from '../services/gemini';

const QuizGenerator: React.FC<ModuleChangeProps> = () => {
    const [sourceText, setSourceText] = useState('');
    const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [score, setScore] = useState(0);

    const handleGenerateQuiz = async () => {
        if (!sourceText.trim()) {
            setError('Por favor, insira algum texto para gerar um questionário.');
            return;
        }
        setIsLoading(true);
        setError('');
        setQuiz(null);
        resetQuizState();
        try {
            const generatedQuiz = await generateQuizFromText(sourceText);
            setQuiz(generatedQuiz);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetQuizState = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswerChecked(false);
        setScore(0);
    }
    
    const handleStartOver = () => {
        setQuiz(null);
        resetQuizState();
    }

    const handleAnswerSelect = (option: string) => {
        if (isAnswerChecked) return;
        setSelectedAnswer(option);
    };

    const handleCheckAnswer = () => {
        if (!selectedAnswer) return;
        setIsAnswerChecked(true);
        if (selectedAnswer === quiz![currentQuestionIndex].answer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        setIsAnswerChecked(false);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const renderQuizTaker = () => {
        if (!quiz || quiz.length === 0) return null;

        if (currentQuestionIndex >= quiz.length) {
            return (
                <div className="text-center bg-background p-8 rounded-lg border border-border">
                    <h2 className="text-2xl font-bold text-white mb-4">Quiz Concluído!</h2>
                    <p className="text-4xl font-bold text-primary mb-2">
                        {score} / {quiz.length}
                    </p>
                    <p className="text-text-secondary mb-6">Você respondeu a todas as perguntas.</p>
                    <button
                        onClick={handleStartOver}
                        className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        Criar Outro Quiz
                    </button>
                </div>
            );
        }

        const question = quiz[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / quiz.length) * 100;

        return (
            <div>
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1 text-sm text-text-secondary">
                        <span>Progresso</span>
                        <span>Pergunta {currentQuestionIndex + 1} de {quiz.length}</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2.5 border border-border">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="bg-background p-6 rounded-lg border border-border">
                    <h3 className="text-xl font-semibold text-text-main mb-6">{question.question}</h3>
                    <div className="space-y-3">
                        {question.options.map((option, index) => {
                            const isCorrect = option === question.answer;
                            const isSelected = option === selectedAnswer;
                            let buttonClass = 'bg-card hover:bg-gray-800 border-border';
                            if (isAnswerChecked && isCorrect) {
                                buttonClass = 'bg-success/20 border-success text-success';
                            } else if (isAnswerChecked && isSelected && !isCorrect) {
                                buttonClass = 'bg-danger/20 border-danger text-danger';
                            } else if (isSelected) {
                                buttonClass = 'bg-primary/30 border-primary text-primary';
                            }
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={isAnswerChecked}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 font-medium ${buttonClass} ${isAnswerChecked ? 'cursor-not-allowed' : ''}`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                <div className="mt-6 text-right">
                    {!isAnswerChecked ? (
                        <button
                            onClick={handleCheckAnswer}
                            disabled={!selectedAnswer}
                            className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            Verificar
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            className="bg-success hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                        >
                            Próximo
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-card p-6 rounded-xl border border-border max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-text-main">Gerador de Quiz por IA</h2>
            <p className="text-text-secondary mb-6">Cole qualquer texto abaixo e deixe a IA criar um questionário para testar o seu conhecimento.</p>

            {!quiz ? (
                <div>
                    <textarea
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        placeholder="Cole o seu texto aqui..."
                        className="w-full h-64 bg-background border border-border rounded-lg p-4 text-text-main focus:ring-2 focus:ring-primary focus:outline-none mb-4"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerateQuiz}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg w-full flex items-center justify-center transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                           <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            A Gerar Quiz...
                           </>
                        ) : 'Gerar Quiz'}
                    </button>
                    {error && <p className="text-danger mt-4 text-center">{error}</p>}
                </div>
            ) : (
                renderQuizTaker()
            )}
        </div>
    );
};

export default QuizGenerator;
