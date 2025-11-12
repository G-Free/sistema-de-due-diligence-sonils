import { GoogleGenAI, Type } from "@google/genai";
import { Entity, QuizQuestion } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateRiskSummary = async (entity: Entity): Promise<string> => {
  const prompt = `
    Analyze the following third-party entity and generate a concise risk summary in markdown format. 
    Focus on potential risks based on the provided data. Highlight areas like geopolitical, operational, financial, and compliance risks.
    
    Entity Information:
    - Name: ${entity.name}
    - Industry/Category: ${entity.category}
    - Country: ${entity.country}
    - Services Provided: ${entity.services.join(', ')}
    - Current Risk Level Assessed: ${entity.riskLevel}

    Based on this information, provide a professional risk summary. The summary should be easy to understand for a risk management professional.
    Structure the output with the following sections:
    - **Overall Summary:** A brief overview of the risk profile.
    - **Key Risk Areas:** A bulleted list of potential risks.
    - **Recommendations:** A short, actionable recommendation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating risk summary:", error);
    return "Erro: Não foi possível gerar o resumo de risco com IA. Por favor, verifique a consola para mais detalhes.";
  }
};

export const generateSupplierEvaluationSummary = async (evaluationData: any): Promise<string> => {
    const { criteriaMatrix, formState } = evaluationData;

    let detailedCriteriaMarkdown = '';

    for (const criterionName in criteriaMatrix) {
        const criterion = criteriaMatrix[criterionName];
        detailedCriteriaMarkdown += `**${criterionName} (Peso: ${criterion.weight * 100}%):**\n`;
        
        for (const questionKey in criterion.items) {
            const questionText = criterion.items[questionKey];
            const answer = formState[questionKey] || 'Não Avaliado';
            detailedCriteriaMarkdown += `- ${questionText}: ${answer}\n`;
        }
        detailedCriteriaMarkdown += '\n';
    }

    const prompt = `
    Aja como um especialista em compliance e risco de terceiros. Analise os seguintes dados de avaliação de fornecedor e gere um resumo profissional em Português e em formato markdown.

    **Informações do Fornecedor:**
    - NIF: ${evaluationData.generalInfo.nif}
    - Nome: ${evaluationData.generalInfo.name}
    - Endereço: ${evaluationData.generalInfo.address}
    - Tipo de Serviço: ${evaluationData.generalInfo.serviceType}
    - Tipo de Entidade: ${evaluationData.generalInfo.entityType}

    **Resultados da Avaliação Detalhada (Baseado na Nova Matriz):**
    ${detailedCriteriaMarkdown}

    **Pontuação Final Calculada:**
    - Pontuação: ${evaluationData.finalScore.toFixed(2)}%
    - Classificação: ${evaluationData.finalClassification}

    **Instruções:**
    Com base nos dados da nova matriz de avaliação, especialmente nos itens marcados como 'C - Não Favorável' ou 'D - Pendente', forneça um resumo conciso e acionável. A sua análise deve ser adaptada especificamente para o tipo de entidade avaliada. Estruture a sua resposta com as seguintes secções:
    - **Resumo da Avaliação:** Uma visão geral do perfil do fornecedor, interpretando a pontuação final no contexto do tipo de entidade (${evaluationData.generalInfo.entityType}).
    - **Principais Pontos de Risco:** Uma lista com marcadores, destacando as perguntas específicas com avaliações negativas ou pendentes. Para cada ponto, explique o risco potencial que ele representa, considerando a natureza da entidade (e.g., o risco de 'PEP' é diferente para uma 'Pessoa Individual' vs. uma 'Empresa Privada').
    - **Recomendação:** Uma recomendação clara e justificada sobre como proceder (ex: aprovar, aprovar com condições para resolver pendências em 30 dias, rejeitar, solicitar mais informações sobre pontos específicos).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating supplier evaluation summary:", error);
    return "Erro: Não foi possível gerar a análise com IA. Verifique a consola para detalhes.";
  }
};


export const generateQuizFromText = async (text: string, numQuestions: number = 5): Promise<QuizQuestion[]> => {
  const prompt = `
    Based on the following text, generate a multiple-choice quiz with exactly ${numQuestions} questions to test comprehension.
    For each question, provide 4 distinct options, and identify the correct answer. The difficulty should be suitable for someone who has just read the text.
    Ensure the questions cover different aspects of the text.

    Text to analyze:
    ---
    ${text}
    ---

    Return the output as a JSON object that matches the provided schema. The 'answer' field must be one of the strings from the 'options' array.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
        quiz: {
            type: Type.ARRAY,
            description: `An array of ${numQuestions} quiz questions.`,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                      type: Type.STRING,
                      description: 'The question text.'
                    },
                    options: {
                        type: Type.ARRAY,
                        description: 'An array of 4 possible answers.',
                        items: { type: Type.STRING }
                    },
                    answer: { 
                      type: Type.STRING,
                      description: 'The correct answer, which must exactly match one of the items in the options array.'
                    }
                },
                required: ['question', 'options', 'answer']
            }
        }
    },
    required: ['quiz']
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          responseMimeType: "application/json",
          responseSchema: schema
      }
    });

    const quizData = JSON.parse(response.text);
    return quizData.quiz;

  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Falha ao gerar o questionário a partir do texto. O modelo de IA pode estar indisponível ou a solicitação falhou.");
  }
};