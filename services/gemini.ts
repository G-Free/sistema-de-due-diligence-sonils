
import { GoogleGenAI, Type } from "@google/genai";
import { Entity, QuizQuestion, RiskLevel } from "../types";
import { angolanLaws } from "../data/mockData";

/**
 * MOTOR HEURÍSTICO (OFFLINE/SAFE FALLBACK)
 * Gera resumos baseados em lógica de código quando a IA não está disponível ou process falha.
 */
const generateHeuristicSummary = (entity: Entity): string => {
  const issues = [];
  if (entity.riskLevel === RiskLevel.Critical || entity.riskLevel === RiskLevel.High) {
    issues.push(`A entidade apresenta um nível de risco ${entity.riskLevel.toUpperCase()}, exigindo monitoramento rigoroso.`);
  }
  if (!entity.nif) issues.push("Falta de identificação fiscal (NIF).");
  if (entity.documents?.some(d => d.status === 'Expirado')) issues.push("Presença de documentação mandatória expirada.");
  
  return `
### Resumo de Risco (Análise de Sistema - Local)
**Visão Geral:** Análise automatizada baseada nos dados cadastrais. A entidade ${entity.name} opera no setor de ${entity.category} em ${entity.country}.

**Pontos de Atenção:**
${issues.map(i => `- ${i}`).join('\n') || "- Nenhum risco crítico identificado nos dados básicos."}

**Recomendação:**
Proceder com a verificação manual dos documentos pendentes antes de qualquer transação financeira.
  `;
};

const generateHeuristicEvaluation = (evaluationData: any): string => {
  const { generalInfo, finalClassification } = evaluationData;
  return `
### Resumo da Avaliação (Modo de Segurança Local)
**Fornecedor:** ${generalInfo.name} (${generalInfo.nif})
**Classificação:** ${finalClassification}

**Análise Heurística:**
O sistema concluiu a avaliação com o estado "${finalClassification}". Por razões técnicas ou de conectividade, a análise detalhada por IA está temporariamente indisponível.

**Próximos Passos:**
- Verifique manualmente os itens marcados como 'Não Favorável'.
- Valide as certidões de conformidade fiscal e segurança social.
  `;
};

/**
 * SERVIÇOS PÚBLICOS COM INICIALIZAÇÃO RESILIENTE
 */

export const generateRiskSummary = async (entity: Entity): Promise<string> => {
  try {
    // Inicialização dentro da função para evitar crash no load time
    // A sintaxe segue estritamente as diretrizes obrigatórias
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise a entidade de risco: ${JSON.stringify({
        nome: entity.name,
        setor: entity.category,
        pais: entity.country,
        risco: entity.riskLevel,
        servicos: entity.services
      })}. Gere um resumo executivo em markdown em Português.`,
    });
    
    return response.text || generateHeuristicSummary(entity);
  } catch (error) {
    console.warn("AI initialization or execution failed. Falling back to heuristics.", error);
    return generateHeuristicSummary(entity);
  }
};

export const generateSupplierEvaluationSummary = async (evaluationData: any): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const { criteriaMatrix, formState } = evaluationData;
        let detailedCriteriaMarkdown = '';

        for (const criterionName in criteriaMatrix) {
            const criterion = criteriaMatrix[criterionName];
            if (criterion?.items) {
                detailedCriteriaMarkdown += `**${criterionName}:**\n`;
                for (const questionKey in criterion.items) {
                    const answer = formState[questionKey] || 'Não Avaliado';
                    detailedCriteriaMarkdown += `- ${criterion.items[questionKey]}: ${answer}\n`;
                }
            }
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: `Aja como especialista em Compliance SONILS. Analise:
            Fornecedor: ${evaluationData.generalInfo.name}
            Tipo: ${evaluationData.generalInfo.entityType}
            Critérios: ${detailedCriteriaMarkdown}
            Leis: ${angolanLaws.map(l => l.title).join(', ')}
            Forneça: Resumo da Avaliação, Pontos de Risco e Recomendação Final.`,
        });
        
        return response.text || generateHeuristicEvaluation(evaluationData);
    } catch (error) {
        console.warn("AI service unavailable, using system heuristics.", error);
        return generateHeuristicEvaluation(evaluationData);
    }
};

export const generateQuizFromText = async (text: string, numQuestions: number = 3): Promise<QuizQuestion[]> => {
  const staticFallback = [
    {
      question: "Qual a importância da Due Diligence segundo as normas locais?",
      options: ["Nenhuma", "Formalidade", "Mitigação de Risco", "Aumento de burocracia"],
      answer: "Mitigação de Risco"
    }
  ];

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um quiz de ${numQuestions} perguntas sobre este texto: ${text}. Retorne apenas JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING }
                },
                required: ['question', 'options', 'answer']
              }
            }
          },
          required: ['quiz']
        }
      }
    });
    
    const result = JSON.parse(response.text || '{}');
    return result.quiz || staticFallback;
  } catch (error) {
    console.error("AI Quiz generation failed:", error);
    return staticFallback;
  }
};
