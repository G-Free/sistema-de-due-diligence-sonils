import React, { useState } from 'react';
import { ModuleChangeProps, QuizQuestion } from '../types';

interface TakeQuizProps extends ModuleChangeProps {
    quiz: QuizQuestion[];
}

const TakeQuiz: React.FC<TakeQuizProps> = ({ onModuleChange, quiz }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [score, setScore] = useState(0);

    if (!quiz || quiz.length === 0) {
        return <div>Erro: Quiz não encontrado.</div>;
    }

    const question = quiz[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.answer;

    const handleAnswerSelect = (option: string) => {
        if (isAnswerChecked) return;
        setSelectedAnswer(option);
    };

    const handleCheckAnswer = () => {
        if (!selectedAnswer) return;
        setIsAnswerChecked(true);
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        setSelectedAnswer(null);
        setIsAnswerChecked(false);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const progress = ((currentQuestionIndex) / quiz.length) * 100;

    if (currentQuestionIndex >= quiz.length) {
        const finalPercentage = (score / quiz.length) * 100;
        const passed = finalPercentage >= 70;

        return (
            <div className="bg-card p-6 rounded-lg shadow-sm max-w-2xl mx-auto text-center animate-fade-in">
                <h2 className={`text-3xl font-bold mb-4 ${passed ? 'text-success' : 'text-danger'}`}>
                    {passed ? 'Parabéns!' : 'Tente Novamente'}
                </h2>
                <p className="text-text-secondary mb-2">Quiz Concluído</p>
                <p className="text-5xl font-bold text-primary mb-4">
                    {finalPercentage.toFixed(0)}%
                </p>
                <p className="text-text-secondary mb-6">A sua pontuação: <span className="font-bold">{score}</span> de <span className="font-bold">{quiz.length}</span> respostas corretas.</p>
                <button
                    onClick={() => onModuleChange('training')}
                    className="bg-secondary hover:bg-secondary-hover text-primary font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                    Voltar ao Painel
                </button>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-lg shadow-sm max-w-2xl mx-auto overflow-hidden">
            <div className="w-full bg-border h-2.5">
                <div className="bg-success h-2.5 rounded-r-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="p-8">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-text-secondary">Pergunta {currentQuestionIndex + 1} de {quiz.length}</span>
                    <button onClick={() => onModuleChange('training')} className="text-sm bg-gray-200 hover:bg-gray-300 text-text-main font-semibold py-1 px-3 rounded-lg transition-colors">
                        &larr; Voltar
                    </button>
                </div>
                <h2 className="text-2xl font-bold text-primary my-4">{question.question}</h2>
                <div className="space-y-3">
                    {question.options.map((option, index) => {
                        let buttonClass = 'bg-background border-border hover:bg-gray-200';
                        if (isAnswerChecked) {
                            if (option === question.answer) {
                                buttonClass = 'bg-success/20 border-success text-success';
                            } else if (option === selectedAnswer) {
                                buttonClass = 'bg-danger/20 border-danger text-danger';
                            } else {
                                buttonClass = 'bg-gray-100 border-border text-gray-400';
                            }
                        } else if (option === selectedAnswer) {
                            buttonClass = 'bg-secondary/30 border-secondary text-secondary-hover';
                        }
                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={isAnswerChecked}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 font-semibold text-lg ${buttonClass} ${isAnswerChecked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className={`transition-all duration-500 ease-in-out ${isAnswerChecked ? 'max-h-40' : 'max-h-0'}`}>
                <div className={`p-6 text-white text-center font-bold text-xl ${isCorrect ? 'bg-success' : 'bg-danger'}`}>
                    {isCorrect ? 'Resposta Correta!' : `Incorreto. A resposta certa é: "${question.answer}"`}
                </div>
            </div>
            <div className="p-6 bg-background border-t border-border">
                {!isAnswerChecked ? (
                    <button
                        onClick={handleCheckAnswer}
                        disabled={!selectedAnswer}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
                    >
                        Verificar
                    </button>
                ) : (
                    <button
                        onClick={handleNextQuestion}
                        className={`w-full text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg ${isCorrect ? 'bg-success hover:bg-green-600' : 'bg-danger hover:bg-red-700'}`}
                    >
                        Continuar
                    </button>
                )}
            </div>
        </div>
    );
};

export default TakeQuiz;