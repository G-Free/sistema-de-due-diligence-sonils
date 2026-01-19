import { Script } from '../types';

export let mockScripts: Script[] = [
  {
    id: 'script1',
    name: 'Cálculo de Risco Ponderado',
    description: 'Script que define a lógica e os pesos para o cálculo da pontuação final de risco.',
    version: '1.3.0',
    content: `
function calculateRiskScore(answers, matrix) {
  let finalScore = 0;
  // This is a simplified representation.
  // The actual logic is more complex and handles various scoring maps.
  const scoreMap = {
    'A - Favorável': 5,
    'C - Não Favorável': 1,
    'D - Pendente': 1,
  };

  for (const criterionKey in matrix) {
      const criterion = matrix[criterionKey];
      const questionKeys = Object.keys(criterion.items);
      if (questionKeys.length === 0) continue;

      const totalScore = questionKeys.reduce((acc, key) => acc + (scoreMap[answers[key]] || 0), 0);
      const averageScore = totalScore / questionKeys.length;
      finalScore += (averageScore / 5) * criterion.weight;
  }
  return finalScore * 100;
}
    `,
  },
  {
    id: 'script2',
    name: 'Geração de Notificação de Vencimento',
    description: 'Controla a lógica para gerar notificações de documentos próximos do vencimento.',
    version: '1.0.1',
    content: `
const NOTIFICATION_DAYS_THRESHOLD = 7;

function checkExpiringDocuments(entities) {
  const newNotifications = [];
  const today = new Date();

  entities.forEach(entity => {
      entity.documents?.forEach(doc => {
          if (doc.expiryDate) {
              const expiryDate = new Date(doc.expiryDate);
              const diffTime = expiryDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays >= 0 && diffDays <= NOTIFICATION_DAYS_THRESHOLD) {
                  // ... logic to create and push notification object
              }
          }
      });
  });
  return newNotifications;
}
    `,
  },
  {
    id: 'script3',
    name: 'Validação de NIF (Simulado)',
    description: 'Script que simula a validação de NIF contra uma base de dados externa.',
    version: '2.2.0',
    content: `import { EntityType } from '../types';

interface NifData {
    name: string;
    commercialRegistration: string;
    category: string;
    address: string;
    entityType: EntityType;
    country: string;
    beneficialOwner?: string;
}

// Simulated database of NIFs.
const nifDatabase = {
    // --- NIFs Nacionais (Fictícios, 9 dígitos) ---
    '500012345': { name: 'SocoOil, Lda.', commercialRegistration: 'CRC-LUAN-2011-111', category: 'Serviços Petrolíferos', address: 'Rua da Amizade, 1, Luanda', entityType: 'Entidade Particular (Empresa Privada)', country: 'Angola', beneficialOwner: 'Manuel Vicente' },
    '501987654': { name: 'Tech Solutions, SA', commercialRegistration: 'CRC-LUAN-2012-222', category: 'Tecnologia da Informação', address: 'Av. Revolução, 2, Luanda', entityType: 'Entidade Particular (Empresa Privada)', country: 'Angola', beneficialOwner: 'Ana Dias' },
    '502345678': { name: 'Comércio Local Unipessoal', commercialRegistration: 'N/A', category: 'Comércio a Retalho', address: 'Largo da Independência, 3, Luanda', entityType: 'Pessoa Individual', country: 'Angola', beneficialOwner: 'João Mendes' },
    '503876543': { name: 'Restaurante O Lusitano', commercialRegistration: 'CRC-LUAN-2014-444', category: 'Restauração', address: 'Rua dos Sabores, 4, Luanda', entityType: 'Entidade Particular (Empresa Privada)', country: 'Angola', beneficialOwner: 'Maria Fernandes' },
    '504789012': { name: 'Imobiliária Central, Lda.', commercialRegistration: 'CRC-LUAN-2015-555', category: 'Imobiliário', address: 'Av. Central, 5, Luanda', entityType: 'Entidade Particular (Empresa Privada)', country: 'Angola', beneficialOwner: 'Pedro Santos' },
    '505678901': { name: 'Serviços de Contabilidade Alfa', commercialRegistration: 'N/A', category: 'Serviços Financeiros', address: 'Rua das Contas, 6, Luanda', entityType: 'Pessoa Individual', country: 'Angola', beneficialOwner: 'Carlos Gomes' },
    '506543210': { name: 'Clínica Médica Bem-Estar', commercialRegistration: 'CRC-LUAN-2017-777', category: 'Saúde', address: 'Av. da Saúde, 7, Luanda', entityType: 'Entidade Particular (Empresa Privada)', country: 'Angola', beneficialOwner: 'Helena Costa' },
    '507112233': { name: 'Distribuição Rápida Express', commercialRegistration: 'CRC-LUAN-2018-888', category: 'Logística', address: 'Rua da Entrega, 8, Luanda', entityType: 'Entidade Particular (Empresa Privada)', country: 'Angola', beneficialOwner: 'Rui Andrade' },
    '508334455': { name: 'Agência de Viagens Horizonte', commercialRegistration: 'CRC-LUAN-2019-999', category: 'Turismo', address: 'Largo das Viagens, 9, Luanda', entityType: 'Entidade Particular (Empresa Privada)', country: 'Angola', beneficialOwner: 'Sofia Pereira' },
    '509998877': { name: 'Software Developer Group', commercialRegistration: 'N/A', category: 'Tecnologia da Informação', address: 'Rua do Código, 10, Luanda', entityType: 'Entidade Particular (Empresa Privada)', country: 'Angola', beneficialOwner: 'Miguel Ferreira' },
    
    // --- NIFs Internacionais/Estrangeiros (Fictícios, diferentes formatos) ---
    '9800000001': { name: 'Global Corp Ireland', commercialRegistration: 'IE-REG-11', category: 'Consultoria', address: '1 OConnell Street, Dublin', entityType: 'Entidade Particular (Empresa Privada)', country: 'Irlanda', beneficialOwner: 'Sean OMalley' },
    '12345678901': { name: 'Euro Trading GmbH (Alemanha)', commercialRegistration: 'DE-REG-22', category: 'Comércio Internacional', address: 'Hauptstrasse 2, Berlin', entityType: 'Entidade Particular (Empresa Privada)', country: 'Alemanha', beneficialOwner: 'Klaus Schmidt' },
    '999888777': { name: 'Entidade Não Residente A', commercialRegistration: 'FR-REG-33', category: 'Serviços Financeiros', address: 'Rue de la Paix 3, Paris', entityType: 'Entidade Particular (Empresa Privada)', country: 'França', beneficialOwner: 'Jean Dupont' },
    '9012345678': { name: 'International Holdings LLC', commercialRegistration: 'US-REG-44', category: 'Investimentos', address: '1 Wall Street, New York', entityType: 'Entidade Particular (Empresa Privada)', country: 'Estados Unidos', beneficialOwner: 'John Smith' },
    '9123456789': { name: 'Foreign Services Ltd', commercialRegistration: 'UK-REG-55', category: 'Serviços', address: '1 Baker Street, London', entityType: 'Entidade Particular (Empresa Privada)', country: 'Reino Unido', beneficialOwner: 'Emily Jones' },
    '9234567800': { name: 'Overseas Group, Inc.', commercialRegistration: 'CA-REG-66', category: 'Comércio', address: '1 Yonge Street, Toronto', entityType: 'Entidade Particular (Empresa Privada)', country: 'Canadá', beneficialOwner: 'Michael Tremblay' },
    '9345678901': { name: 'Non-Resident Test Entity', commercialRegistration: 'AU-REG-77', category: 'Tecnologia', address: '1 George Street, Sydney', entityType: 'Entidade Particular (Empresa Privada)', country: 'Austrália', beneficialOwner: 'David Williams' },
    '9456789012': { name: 'Export & Import Partners', commercialRegistration: 'CN-REG-88', category: 'Comércio Internacional', address: '1 Nanjing Road, Shanghai', entityType: 'Entidade Particular (Empresa Privada)', country: 'China', beneficialOwner: 'Li Wei' },
    '9567890123': { name: 'Offshore Ventures', commercialRegistration: 'BS-REG-99', category: 'Investimentos', address: '1 Bay Street, Nassau', entityType: 'Entidade Particular (Empresa Privada)', country: 'Bahamas', beneficialOwner: 'James Miller' },
    '9678901234': { name: 'Cross-Border Solutions', commercialRegistration: 'CH-REG-10', category: 'Consultoria', address: 'Bahnhofstrasse 1, Zurich', entityType: 'Entidade Particular (Empresa Privada)', country: 'Suiça', beneficialOwner: 'Thomas Müller' }
};

function validateNifExternally(nif) {
    console.log('Simulating external validation for NIF: ' + nif);
    
    return new Promise(resolve => {
        setTimeout(() => {
            const entity = nifDatabase[nif];
            if (entity) {
                resolve({ 
                    success: true, 
                    data: entity, 
                    message: 'NIF válido e encontrado.' 
                });
            } else {
                resolve({ 
                    success: false, 
                    message: 'NIF inválido ou não encontrado.' 
                });
            }
        }, 1500); // 1.5 segundos de atraso na simulação
    });
}
    `,
  },
  {
    id: 'script4',
    name: 'Processador de Lista de Sanções (OFAC/UN)',
    description: 'Script para carregar e processar as listas de sanções da OFAC e ONU.',
    version: '1.0.0',
    content: `
function parseCsv(csvText) {
  // Dummy CSV parser for demonstration
  const lines = csvText.split('\\n');
  const headers = lines[0].split(',');
  const result = lines.slice(1).map(line => {
    const obj = {};
    const values = line.split(',');
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
  return result;
}

async function checkOfacList(entityName) {
  // In a real scenario, fetch would be used here with proper CORS handling on a server.
  // const response = await fetch('https://www.treasury.gov/ofac/downloads/sdn.csv');
  // const csvText = await response.text();
  console.log('Simulating OFAC check for: ' + entityName);
  const dummyCsv = "id,name,type\\n1,BAD GUY,individual\\n2,TERRIBLE COMPANY,entity";
  const parsedData = parseCsv(dummyCsv);
  return parsedData.filter(item => item.name.toLowerCase().includes(entityName.toLowerCase()));
}

// Dummy function for UN XML list parsing
async function checkUnList(entityName) {
    console.log('Simulating UN Sanctions XML check for: ' + entityName);
    // Logic to fetch and parse XML would go here.
    return [];
}
    `
  },
  {
    id: 'script5',
    name: 'Verificador Global de PEP',
    description: 'Script para consultar a API da roaring.io para verificar o status de Pessoa Politicamente Exposta (PEP).',
    version: '1.0.0',
    content: `
async function checkPepStatus(name, countryCode = 'AO') {
  // This is a simulation of the roaring.io Global PEP API.
  // In a real scenario, an authenticated API call would be made.
  console.log('Simulating PEP check for: ' + name);
  
  const PEP_DATABASE = {
    'isabel dos santos': { isPep: true, reason: 'Ex-diretora da Sonangol, filha do ex-presidente.' },
    'josé eduardo': { isPep: true, reason: 'Mencionado em listas de PEPs por associações familiares.' },
    'cyril ramaphosa': { isPep: true, reason: 'Presidente da África do Sul.' },
    'antónio costa': { isPep: true, reason: 'Ex-Primeiro Ministro de Portugal.' }
  };
  
  const lowerCaseName = name.toLowerCase();
  const result = PEP_DATABASE[lowerCaseName];

  return new Promise(resolve => {
    setTimeout(() => {
      if (result) {
        resolve({
          matches: [{
            name: name,
            isPep: true,
            details: result.reason
          }]
        });
      } else {
        resolve({ matches: [] });
      }
    }, 1200);
  });
}
    `
  },
  {
    id: 'script6',
    name: 'Serviço Gemini AI',
    description: 'Integração com a API da Google Gemini para funcionalidades de IA.',
    version: '1.0.0',
    content: `
import { GoogleGenAI, Type } from "@google/genai";
import { Entity, QuizQuestion } from '../types';
import { angolanLaws, internationalNorms } from "../data/mockData";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateRiskSummary = async (entity: Entity): Promise<string> => {
  const prompt = \`
    Analyze the following third-party entity and generate a concise risk summary in markdown format. 
    Focus on potential risks based on the provided data. Highlight areas like geopolitical, operational, financial, and compliance risks.
    
    Entity Information:
    - Name: \${entity.name}
    - Industry/Category: \${entity.category}
    - Country: \${entity.country}
    - Services Provided: \${entity.services.join(', ')}
    - Current Risk Level Assessed: \${entity.riskLevel}

    Based on this information, provide a professional risk summary. The summary should be easy to understand for a risk management professional.
    Structure the output with the following sections:
    - **Overall Summary:** A brief overview of the risk profile.
    - **Key Risk Areas:** A bulleted list of potential risks.
    - **Recommendations:** A short, actionable recommendation.
  \`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text ?? "No summary generated.";
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
        if (criterion && criterion.items) {
            detailedCriteriaMarkdown += \`**\${criterionName} (Peso: \${criterion.weight * 100}%):**\\n\`;
            
            for (const questionKey in criterion.items) {
                const questionText = criterion.items[questionKey];
                const answer = formState[questionKey] || 'Não Avaliado';
                detailedCriteriaMarkdown += \`- \${questionText}: \${answer}\\n\`;
            }
            detailedCriteriaMarkdown += '\\n';
        }
    }
    
    const regulatoryContextMarkdown = \`
    **Leis Angolanas Relevantes:**
    \${angolanLaws.map(law => \`- **\${law.title}:** \${law.description}\`).join('\\n')}

    **Normas Internacionais Relevantes:**
    \${internationalNorms.map(norm => \`- **\${norm.title}:** \${norm.description}\`).join('\\n')}
    \`;


    const prompt = \`
    Aja como um especialista em compliance e risco de terceiros. Analise os seguintes dados de avaliação de fornecedor e gere um resumo profissional em Português e em formato markdown.

    **Informações do Fornecedor:**
    - NIF: \${evaluationData.generalInfo.nif}
    - Nome: \${evaluationData.generalInfo.name}
    - Endereço: \${evaluationData.generalInfo.address}
    - Tipo de Serviço: \${evaluationData.generalInfo.serviceType}
    - Tipo de Entidade: \${evaluationData.generalInfo.entityType}

    **Resultados da Avaliação Detalhada (Baseado na Nova Matriz):**
    \${detailedCriteriaMarkdown}

    **Contexto Regulatório e de Compliance:**
    \${regulatoryContextMarkdown}

    **Instruções:**
    Com base em TODOS os dados fornecidos (informações do fornecedor, resultados da avaliação e o contexto regulatório), especialmente nos itens marcados como 'C - Não Favorável' ou 'D - Pendente', forneça um resumo conciso e acionável. A sua análise deve ser adaptada especificamente para o tipo de entidade avaliada.

    **Importante:** A sua resposta final NÃO DEVE incluir a pontuação percentual, nem as classificações literais como 'A - Favorável', 'C - Não Favorável' ou 'D - Pendente'. Em vez disso, descreva as conclusões de forma narrativa.

    Estruture a sua resposta com as seguintes secções:
    - **Resumo da Avaliação:** Uma visão geral do perfil de risco do fornecedor, baseada nas respostas da avaliação e no cenário regulatório.
    - **Principais Pontos de Risco (incluindo Riscos Regulatórios):** Uma lista com marcadores, destacando as perguntas específicas com avaliações problemáticas. Para cada ponto, explique o risco potencial que ele representa, correlacionando-o com a lei e artigo/secção aplicável (e.g., uma falha na identificação de beneficiários efetivos representa um risco sob a Lei de Prevenção e Combate ao Branqueamento de Capitais, Art. 15º e 16º).
    - **Recomendação:** Uma recomendação clara e justificada sobre como proceder (ex: aprovar, aprovar com condições, rejeitar, solicitar mais informações), fundamentada nos riscos identificados.
  \`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const summaryText = response.text;
    if (!summaryText || summaryText.trim() === '') {
        console.warn("Gemini API returned an empty summary for supplier evaluation.");
        return "Erro: A análise de IA retornou uma resposta vazia. Isto pode dever-se a filtros de segurança ou a um problema temporário. Por favor, tente novamente ou ajuste os dados da avaliação.";
    }
    return summaryText;

  } catch (error) {
    console.error("Error generating supplier evaluation summary:", error);
    return "Erro: Não foi possível gerar a análise com IA. Verifique a consola para detalhes.";
  }
};
    `,
  }
];
