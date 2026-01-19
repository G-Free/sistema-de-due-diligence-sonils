import { Entity, RiskLevel, LegalStatus, EntityType, QuizQuestion, ApprovalQueueItem, Notification, Document, ApprovalStatus, User, HistoryItem, TrainingModule, DocumentItem, Integration, Campaign, ActionPlan, AuditLog, AssessmentRequest, EntityHistoryLog, ChangeType } from '../types';

export let mockUsers: User[] = [
  { id: 'u1', name: 'Administrador SONILS', email: 'admin@sonils.co.ao', role: 'Administrador', password: 'sonils2024' },
  { id: 'u2', name: 'Técnico de Compliance', email: 'tecnico@sonils.co.ao', role: 'Tecnico', password: 'sonils2024' },
  { id: 'u3', name: 'Gestor de Área', email: 'gestor@sonils.co.ao', role: 'Gestor/Director da Area', password: 'sonils2024' },
  { id: 'u4', name: 'Director Geral', email: 'director.geral@sonils.co.ao', role: 'Director Geral', password: 'sonils2024' },
];

export const mockEntities: Entity[] = [
  { id: '1', entityType: EntityType.PrivateCompany, name: 'SocoOil, Lda.', category: 'Serviços Petrolíferos', riskLevel: RiskLevel.High, status: LegalStatus.Active, onboardingDate: '2024-07-15', country: 'Angola', nif: '500012345', commercialRegistration: 'CRC-LUAN-2010-101', beneficialOwner: 'José Eduardo', address: 'Rua da Liberdade, 123, Luanda', services: ['Manutenção de Plataformas', 'Logística de Equipamentos'], 
    contact: { 
      name: 'Armando Teixeira', 
      email: 'armando.t@socooil.co.ao', 
      phone: '+244 923 123 456',
      website: 'https://socooil.co.ao'
    },
    documents: [
      { name: 'Alvará Comercial', status: 'Verificado', submissionDate: '2024-07-01', expiryDate: '2025-06-30' },
      { name: 'Certidão Comercial', status: 'Verificado', submissionDate: '2024-07-01' },
      { name: 'Declaração Fiscal AGT', status: 'Pendente', submissionDate: '2024-07-15' },
    ],
    statusLog: [],
    shareholders: [], sourceOfFunds: ''
  },
  { id: '2', entityType: EntityType.PrivateCompany, name: 'AngoPort Services', category: 'Logística Portuária', riskLevel: RiskLevel.Medium, status: LegalStatus.Active, onboardingDate: '2024-06-20', country: 'Angola', nif: '5000654321', commercialRegistration: 'CRC-LUAN-2015-202', beneficialOwner: 'Isabel dos Santos', address: 'Avenida 4 de Fevereiro, 456, Luanda', services: ['Gestão de Carga', 'Armazenagem'], 
    contact: { 
      name: 'Catarina Miguel', 
      email: 'catarina.m@angoport.co.ao', 
      phone: '+244 912 987 654'
    },
    documents: [
      { name: 'Alvará Comercial', status: 'Verificado', submissionDate: '2024-06-10', expiryDate: '2024-08-15' },
      { name: 'Apólices de Seguro', status: 'Expirado', submissionDate: '2023-08-01', expiryDate: '2024-07-31' },
    ],
    statusLog: [],
    shareholders: [], sourceOfFunds: ''
  },
  { id: '3', entityType: EntityType.Individual, name: 'Diogo Costa - Consultoria', category: 'Consultoria Jurídica', riskLevel: RiskLevel.Low, status: LegalStatus.Suspended, onboardingDate: '2024-05-10', country: 'Angola', nif: '502345678', commercialRegistration: 'N/A', beneficialOwner: 'N/A', address: 'Largo do Kinaxixi, 789, Luanda', services: ['Due Diligence Legal', 'Compliance Regulatório'], 
    contact: { 
      name: 'Diogo Costa', 
      email: 'diogo.c@llc.co.ao', 
      phone: '+244 933 456 789',
      website: 'https://llc-legal.co.ao',
      linkedIn: 'https://linkedin.com/company/llc-legal'
    },
    documents: [
      { name: 'Certidão de Não Dívida (INSS)', status: 'Recebido', submissionDate: '2024-05-01', expiryDate: '2024-10-31' },
      { name: 'Alvará Comercial', status: 'Expirado', submissionDate: '2023-01-01', expiryDate: '2023-12-31' },
    ],
    legalStatusComment: 'Status suspenso devido a pendências fiscais. Reavaliação agendada para 30/09/2024.',
    statusLog: [
        {
            user: 'Administrador SONILS',
            date: '2024-05-10',
            previousStatus: LegalStatus.Active,
            newStatus: LegalStatus.Suspended,
            justification: 'Status suspenso devido a pendências fiscais. Reavaliação agendada para 30/09/2024.'
        }
    ],
    shareholders: [], sourceOfFunds: ''
  },
  { id: '4', entityType: EntityType.PrivateCompany, name: 'TecnoServ Angola, S.A.', category: 'Tecnologia da Informação', riskLevel: RiskLevel.Low, status: LegalStatus.Active, onboardingDate: '2023-08-01', country: 'Portugal', nif: '501987654', commercialRegistration: 'LIS-2019-404', beneficialOwner: 'António Costa', address: 'Avenida da República, 101, Lisboa', services: ['Infraestrutura de IT', 'Cibersegurança'], 
    contact: { 
      name: 'Sofia Rodrigues', 
      email: 'sofia.r@tecnoserv.pt', 
      phone: '+351 910 123 456',
      website: 'https://tecnoserv.pt'
    },
    documents: [
      { name: 'Certificação ISO 9001', status: 'Verificado', submissionDate: '2023-07-20', expiryDate: '2026-07-19' },
      { name: 'Relatório de Contas', status: 'Verificado', submissionDate: '2023-07-20' },
    ],
    statusLog: [],
    shareholders: [], sourceOfFunds: ''
  },
  { id: '5', entityType: EntityType.PrivateCompany, name: 'GlobalTrans Logística', category: 'Transporte e Frete', riskLevel: RiskLevel.Medium, status: LegalStatus.InLiquidation, onboardingDate: '2023-02-25', country: 'África do Sul', nif: 'ZA4801234567', commercialRegistration: 'JNB-2017-505', beneficialOwner: 'Cyril Ramaphosa', address: 'Mandela Square, 202, Joanesburgo', services: ['Transporte Internacional', 'Desembaraço Aduaneiro'], 
    contact: { 
      name: 'Nelson Mandla', 
      email: 'nelson.m@globaltrans.co.za', 
      phone: '+27 82 123 4567' 
    },
    documents: [
        { name: 'Licença de Operador', status: 'Verificado', submissionDate: '2023-02-15', expiryDate: '2024-09-30' },
        { name: 'Certificado Ambiental', status: 'Expirado', submissionDate: '2022-06-01', expiryDate: '2024-05-31' },
    ],
    statusLog: [],
    shareholders: [], sourceOfFunds: ''
  },
  { id: '6', entityType: EntityType.PrivateCompany, name: 'ABREU ANGOLA- CARGA E TRÂNSITO, LIMITADA', category: 'Logística Portuária', riskLevel: RiskLevel.Low, status: LegalStatus.Active, onboardingDate: '2022-10-10', country: 'Angola', nif: '987654321', commercialRegistration: 'CRC-LUAN-2019-707', beneficialOwner: 'Carlos Abreu', address: 'Av. das Nações, 456, Luanda', services: ['Auditoria', 'Trânsito'], 
    contact: { 
      name: 'Pedro Mota', 
      email: 'pedro.mota@abreu.co.ao', 
      phone: '+244 945 123 789'
    },
    documents: [
      { name: 'Certidão Comercial', status: 'Verificado', submissionDate: '2022-10-01', expiryDate: '2025-04-01' },
      { name: 'Apólices de Seguro', status: 'Pendente', submissionDate: '2024-08-01' },
    ],
    statusLog: [],
    shareholders: [], sourceOfFunds: ''
  },
  { id: '7', entityType: EntityType.PrivateCompany, name: 'Critical Risk Inc.', category: 'Segurança Cibernética', riskLevel: RiskLevel.Critical, status: LegalStatus.Active, onboardingDate: '2024-08-20', country: 'Estados Unidos', nif: 'US89234567', commercialRegistration: 'DEL-2020-909', beneficialOwner: 'John Doe', address: '1 Hacker Way, Menlo Park, CA', services: ['Pentesting', 'Análise de Vulnerabilidades'], 
    contact: { 
      name: 'Jane Smith', 
      email: 'jane.s@critical.com', 
      phone: '+1 650 123 4567'
    },
    documents: [
      { name: 'Relatório de Contas', status: 'Pendente', submissionDate: '2024-08-20' },
    ],
    statusLog: [],
    shareholders: [], sourceOfFunds: ''
  },
  { id: '8', entityType: EntityType.PublicEntity, name: 'Ministério das Finanças', category: 'Governamental', riskLevel: RiskLevel.Medium, status: LegalStatus.Active, onboardingDate: '2024-01-01', country: 'Angola', nif: '7301000018', commercialRegistration: 'N/A', beneficialOwner: 'N/A', address: 'Largo da Mutamba, Luanda', services: ['Regulação Fiscal'], 
    contact: { 
      name: 'Gabinete do Ministro', 
      email: 'geral@minfin.gv.ao', 
      phone: '+244 222 000 000'
    },
    documents: [
      { name: 'Diário da República (Criação)', status: 'Verificado', submissionDate: '2024-01-01' },
    ],
    statusLog: [],
    shareholders: [], sourceOfFunds: ''
  },
   { id: '9', entityType: EntityType.NGO, name: 'Fundação Criança Feliz', category: 'Ação Social', riskLevel: RiskLevel.Low, status: LegalStatus.Active, onboardingDate: '2023-03-15', country: 'Angola', nif: '7302000019', commercialRegistration: 'ONG-2015-015', beneficialOwner: 'Conselho de Administração', address: 'Bairro Azul, Luanda', services: ['Apoio à Infância'], 
    contact: { 
      name: 'Ana Piedade', 
      email: 'ana.p@fcf.org.ao', 
      phone: '+244 923 111 222'
    },
    documents: [
      { name: 'Estatutos da Fundação', status: 'Verificado', submissionDate: '2023-03-01' },
      { name: 'Relatório de Contas Anual', status: 'Pendente', submissionDate: '2024-04-01' },
    ],
    statusLog: [],
    shareholders: [], sourceOfFunds: ''
  },
  { id: '10', entityType: EntityType.PrivateCompany, name: 'Green Tech Solutions', category: 'Consultoria Ambiental', riskLevel: RiskLevel.Informational, status: LegalStatus.Active, onboardingDate: '2024-08-10', country: 'Angola', nif: '5000999888', commercialRegistration: 'CRC-LUAN-2024-110', beneficialOwner: 'Maria Fernandes', address: 'Talatona, Luanda', services: ['Relatórios de Impacto Ambiental'], 
    contact: { 
      name: 'Sérgio Lopes', 
      email: 'sergio.l@greentech.co.ao', 
      phone: '+244 923 555 444'
    },
    documents: [
      { name: 'Alvará Comercial', status: 'Verificado', submissionDate: '2024-08-01', expiryDate: '2025-07-31' },
      { name: 'Certificado Ambiental', status: 'Verificado', submissionDate: '2024-08-01', expiryDate: '2026-07-31' },
    ],
    statusLog: [],
    shareholders: [], sourceOfFunds: ''
  },
];

export const mockQuiz: QuizQuestion[] = [
    {
        question: "Qual é o principal objetivo de uma política de Due Diligence?",
        options: [
            "Apenas para cumprir uma formalidade legal.",
            "Para identificar e mitigar riscos associados a terceiros.",
            "Para aumentar os lucros da empresa a qualquer custo.",
            "Para acelerar o processo de contratação de fornecedores."
        ],
        answer: "Para identificar e mitigar riscos associados a terceiros."
    },
    {
        question: "O que significa a sigla 'PEP' no contexto de compliance?",
        options: [
            "Pessoa Extremamente Profissional",
            "Plano Estratégico de Pagamentos",
            "Pessoa Politicamente Exposta",
            "Protocolo de Ética Profissional"
        ],
        answer: "Pessoa Politicamente Exposta"
    },
    {
        question: "Qual destes documentos é crucial para a validação da capacidade financeira de um fornecedor em Angola?",
        options: [
            "Certificado de Habilitações do Diretor",
            "Certidão de Conformidade Tributária (AGT)",
            "Registo de Propriedade do Veículo",
            "Fatura de Energia Elétrica"
        ],
        answer: "Certidão de Conformidade Tributária (AGT)"
    }
];

export let mockApprovalQueue: ApprovalQueueItem[] = [
  { 
    id: 'aq1', 
    entityId: '1', 
    entityName: 'SocoOil, Lda.', 
    requestType: 'Revisão de Risco Anual', 
    requester: 'Sistema Automático', 
    requestDate: '2024-07-30', 
    status: 'Aguardando Validação de Gestor',
    log: [
      { step: 'Submissão', user: 'Sistema Automático', date: '2024-07-30', action: 'Submetido' },
      { step: 'Revisão de Compliance', user: 'Oficial de Compliance', date: '2024-07-31', action: 'Aprovado', comments: 'Documentação inicial validada.' },
      { step: 'Validação Técnica', user: 'Técnico Avaliador', date: '2024-08-01', action: 'Aprovado', comments: 'Análise técnica favorável.' }
    ] 
  },
  { 
    id: 'aq7', 
    entityId: '3', 
    entityName: 'Diogo Costa - Consultoria', 
    requestType: 'Revisão de Risco Periódica', 
    requester: 'Sistema Automático', 
    requestDate: '2024-08-01', 
    status: 'Aguardando Validação Técnica',
    log: [
      { step: 'Submissão', user: 'Sistema Automático', date: '2024-08-01', action: 'Submetido' },
      { step: 'Revisão de Compliance', user: 'Oficial de Compliance', date: '2024-08-02', action: 'Aprovado' }
    ]
  },
  { 
    id: 'aq2', 
    entityId: '7', 
    entityName: 'Critical Risk Inc.', 
    requestType: 'Cadastro de Nova Entidade', 
    requester: 'Oficial de Compliance', 
    requestDate: '2024-07-29', 
    status: 'Aguardando Revisão de Compliance',
    log: [
      { step: 'Submissão', user: 'Oficial de Compliance', date: '2024-07-29', action: 'Submetido' }
    ]
  },
  { 
    id: 'aq3', 
    entityId: '4', 
    entityName: 'TecnoServ Angola, S.A.', 
    requestType: 'Atualização de Documentos', 
    requester: 'Gestor de Contrato', 
    requestDate: '2024-07-28', 
    status: 'Mais Informação Necessária',
    log: [
       { step: 'Submissão', user: 'Gestor de Contrato', date: '2024-07-28', action: 'Submetido' },
       { step: 'Revisão de Compliance', user: 'Oficial de Compliance', date: '2024-07-29', action: 'Mais Informação Solicitada', comments: 'Falta o relatório de contas de 2023.' }
    ]
  },
  { 
    id: 'aq4', 
    entityId: '2', 
    entityName: 'AngoPort Services', 
    requestType: 'Revisão de Risco Anual', 
    requester: 'Sistema Automático', 
    requestDate: '2024-07-27', 
    status: 'Aguardando Aprovação Final',
    log: [
      { step: 'Submissão', user: 'Sistema Automático', date: '2024-07-27', action: 'Submetido' },
      { step: 'Revisão de Compliance', user: 'Oficial de Compliance', date: '2024-07-28', action: 'Aprovado' },
      { step: 'Validação Técnica', user: 'Técnico Avaliador', date: '2024-07-29', action: 'Aprovado' },
      { step: 'Validação de Gestão', user: 'Gestor de Contrato', date: '2024-07-29', action: 'Aprovado' }
    ]
  },
  { 
    id: 'aq5', 
    entityId: '6', 
    entityName: 'ABREU ANGOLA- CARGA E TRÂNSITO, LIMITADA', 
    requestType: 'Cadastro de Nova Entidade', 
    requester: 'Consultor Externo', 
    requestDate: '2024-07-26', 
    status: 'Aprovado',
    log: [
      { step: 'Submissão', user: 'Consultor Externo', date: '2024-07-26', action: 'Submetido' },
      { step: 'Revisão de Compliance', user: 'Oficial de Compliance', date: '2024-07-27', action: 'Aprovado' },
      { step: 'Validação Técnica', user: 'Técnico Avaliador', date: '2024-07-28', action: 'Aprovado' },
      { step: 'Validação de Gestão', user: 'Gestor de Contrato', date: '2024-07-28', action: 'Aprovado' },
      { step: 'Aprovação Final', user: 'Diretor', date: '2024-07-29', action: 'Aprovado' }
    ]
  },
  { 
    id: 'aq6', 
    entityId: '5', 
    entityName: 'GlobalTrans Logística', 
    requestType: 'Revisão de Risco Anual', 
    requester: 'Sistema Automático', 
    requestDate: '2024-07-25', 
    status: 'Rejeitado',
    log: [
      { step: 'Submissão', user: 'Sistema Automático', date: '2024-07-25', action: 'Submetido' },
      { step: 'Revisão de Compliance', user: 'Oficial de Compliance', date: '2024-07-26', action: 'Rejeitado', comments: 'Empresa em processo de liquidação.' }
    ]
  },
];

export let mockHistory: HistoryItem[] = [
    { 
        id: 'h1', 
        sequenceNumber: 'AVR-2024-004',
        entityName: 'SocoOil, Lda.', 
        assessmentDate: '2024-06-15', 
        finalScore: 75.5, 
        classification: 'B - Favorável com Ressalvas', 
        user: 'Oficial de Compliance',
        observations: `Análise gerada por IA:
- **Resumo da Avaliação:** O fornecedor demonstra conformidade na maioria dos critérios legais e operacionais. No entanto, apresenta ressalvas significativas na sua capacidade financeira.
- **Principais Pontos de Risco:** As certidões de INSS e Tributária em estado "Não Favorável" indicam potenciais passivos fiscais e de segurança social, representando um risco financeiro e de reputação para a SONILS.
- **Recomendação:** Aprovar com a condição de que o fornecedor apresente um plano de regularização fiscal no prazo de 60 dias.`,
        formState: {
            alvara: 'A - Favorável', certidaoComercial: 'A - Favorável', estatutos: 'A - Favorável',
            documentoPoderes: 'A - Favorável', biAccionistas: 'A - Favorável', apolicesSeguro: 'A - Favorável',
            certidaoINSS: 'C - Não Favorável', certidaoTributaria: 'C - Não Favorável', relatorioContas: 'A - Favorável',
            solvenciaFinanceira: 'A - Favorável', certificadoANPG: 'A - Favorável', possuiPEP: 'A - Favorável',
            certificacaoISO: 'A - Favorável', outroCertificado: 'A - Favorável', politicasCompliance: 'A - Favorável',
        }
    },
    { 
        id: 'h2', 
        sequenceNumber: 'AVR-2024-003',
        entityName: 'AngoPort Services', 
        assessmentDate: '2024-05-20', 
        finalScore: 92.0, 
        classification: 'A - Favorável', 
        user: 'Administrador',
        observations: 'Fornecedor em conformidade com todos os critérios. Nenhuma observação relevante a registar. Avaliação favorável para contratação imediata.',
        formState: {
            alvara: 'A - Favorável', certidaoComercial: 'A - Favorável', estatutos: 'A - Favorável',
            documentoPoderes: 'A - Favorável', biAccionistas: 'A - Favorável', apolicesSeguro: 'A - Favorável',
            certidaoINSS: 'A - Favorável', certidaoTributaria: 'A - Favorável', relatorioContas: 'A - Favorável',
            solvenciaFinanceira: 'A - Favorável', certificadoANPG: 'A - Favorável', possuiPEP: 'A - Favorável',
            certificacaoISO: 'A - Favorável', outroCertificado: 'A - Favorável', politicasCompliance: 'A - Favorável',
        }
    },
    { 
        id: 'h3', 
        sequenceNumber: 'AVR-2024-002',
        entityName: 'GlobalTrans Logística', 
        assessmentDate: '2024-04-10', 
        finalScore: 55.0, 
        classification: 'C - Não Favorável', 
        user: 'Oficial de Compliance',
        observations: `Análise gerada por IA:
- **Resumo da Avaliação:** O fornecedor foi classificado como "Não Favorável" devido a múltiplas pendências críticas em conformidade legal e financeira.
- **Principais Pontos de Risco:** Vários documentos essenciais, como a certidão comercial, BI dos acionistas, apólices de seguro e certidões fiscais, estão em estado "Não Favorável". A falta do certificado ANPG é também um ponto crítico.
- **Recomendação:** Rejeitar a parceria. O nível de risco é demasiado elevado e as pendências são estruturais.`,
        formState: {
            alvara: 'A - Favorável', certidaoComercial: 'C - Não Favorável', estatutos: 'C - Não Favorável',
            documentoPoderes: 'A - Favorável', biAccionistas: 'C - Não Favorável', apolicesSeguro: 'C - Não Favorável',
            certidaoINSS: 'C - Não Favorável', certidaoTributaria: 'C - Não Favorável', relatorioContas: 'A - Favorável',
            solvenciaFinanceira: 'A - Favorável', certificadoANPG: 'D - Pendente', possuiPEP: 'A - Favorável',
            certificacaoISO: 'D - Pendente', outroCertificado: 'A - Favorável', politicasCompliance: 'A - Favorável',
        }
    },
    { 
        id: 'h4', 
        sequenceNumber: 'AVR-2024-001',
        entityName: 'TecnoServ Angola, S.A.', 
        assessmentDate: '2024-03-22', 
        finalScore: 88.0, 
        classification: 'A - Favorável', 
        user: 'Gestor de Contrato',
        observations: 'Fornecedor robusto na maioria das áreas. A única nota desfavorável refere-se a "Outro tipo de Certificado", que não se aplica ao serviço de TI prestado. Ignorar esta pontuação negativa. Recomenda-se aprovação.',
        formState: {
            alvara: 'A - Favorável', certidaoComercial: 'A - Favorável', estatutos: 'A - Favorável',
            documentoPoderes: 'A - Favorável', biAccionistas: 'A - Favorável', apolicesSeguro: 'A - Favorável',
            certidaoINSS: 'A - Favorável', certidaoTributaria: 'A - Favorável', relatorioContas: 'A - Favorável',
            solvenciaFinanceira: 'A - Favorável', certificadoANPG: 'A - Favorável', possuiPEP: 'A - Favorável',
            certificacaoISO: 'A - Favorável', outroCertificado: 'C - Não Favorável', politicasCompliance: 'A - Favorável',
        }
    },
];

export const mockNotifications: Notification[] = [
    { id: '1', title: 'Aprovação Pendente', description: 'A entidade "SocoOil, Lda." aguarda a sua validação de gestão.', timestamp: 'há 5 minutos', read: false },
    { id: '2', title: 'Documento Expirado', description: 'O Certificado Ambiental da "GlobalTrans Logística" expirou.', timestamp: 'há 2 horas', read: false },
    { id: '3', title: 'Quiz Concluído', description: '95% da equipa de Logística completou o treinamento anti-suborno.', timestamp: 'há 6 horas', read: false },
    { id: '4', title: 'Nova Entidade Adicionada', description: '"Critical Risk Inc." foi adicionada e requer avaliação de risco.', timestamp: 'há 1 dia', read: true },
    { id: '5', title: 'Relatório Semanal Gerado', description: 'O seu relatório de risco consolidado está pronto para ser visualizado.', timestamp: 'há 2 dias', read: true },
];

export const mockTrainingModules: TrainingModule[] = [
  { 
    id: 'tm1', 
    title: 'Integração de Compliance para Novos Colaboradores', 
    description: 'Módulo obrigatório que cobre as políticas essenciais de compliance da SONILS, incluindo o código de conduta e políticas anti-suborno.',
    content: [
      { type: 'quiz', title: 'Política de Compliance (Q3 2024)' },
      { type: 'document', title: 'Código de Conduta SONILS' },
    ],
    targetAudience: 'Novos Colaboradores'
  },
  { 
    id: 'tm2', 
    title: 'Anticorrupção e Antissuborno (Avançado)', 
    description: 'Treinamento aprofundado para equipas de gestão e finanças sobre a identificação e prevenção de riscos de corrupção.',
    content: [
      { type: 'quiz', title: 'Treinamento Anti-Suborno' },
      { type: 'quiz', title: 'Conhecimento de PEPs' },
      { type: 'document', title: 'Lei Anticorrupção de Angola' },
    ],
    targetAudience: 'Gestão e Finanças'
  },
];


// --- Policies and Integrations Data ---

export let internalPolicies: DocumentItem[] = [
    { id: 'ip1', title: 'Código de Conduta e Ética', description: 'Define os princípios de integridade, transparência e responsabilidade para todos os colaboradores.' },
    { id: 'ip2', title: 'Política Anticorrupção e Antissuborno', description: 'Diretrizes claras para prevenir, detetar e responder a atos de corrupção.' },
    { id: 'ip3', title: 'Política de Due Diligence de Terceiros', description: 'Procedimentos para a avaliação e monitoramento de risco de parceiros.' },
    { id: 'ip4', title: 'Política de Proteção de Dados', description: 'Normas para o tratamento de dados pessoais em conformidade com a legislação.' },
];

export let angolanLaws: DocumentItem[] = [
    { id: 'al1', title: 'Lei da Probidade Pública (Lei n.º 3/10)', description: 'Art. 25º e 28º - Define os deveres de transparência e os atos que lesam o património público, relevantes para conflitos de interesse.' },
    { id: 'al2', title: 'Lei de Prevenção e Combate ao Branqueamento de Capitais (Lei n.º 5/20)', description: 'Art. 15º e 16º - Estabelece o dever de identificação e diligência sobre clientes e beneficiários efetivos.' },
    { id: 'al3', title: 'Lei de Proteção de Dados Pessoais (Lei n.º 22/11)', description: 'Art. 6º e 7º - Define as condições para o tratamento de dados pessoais e dados sensíveis, exigindo consentimento e finalidade específica.' },
    { id: 'al4', title: 'Código Penal Angolano (artigos sobre corrupção)', description: 'Art. 319º e 320º - Criminaliza os atos de corrupção ativa e passiva no setor privado.' },
];

export let internationalNorms: DocumentItem[] = [
    { id: 'in1', title: 'ISO 37001 (Sistemas de Gestão Antissuborno)', description: 'Secção 8.2 - Exige a realização de due diligence em transações e projetos para avaliar os riscos de suborno.' },
    { id: 'in2', title: 'Foreign Corrupt Practices Act (FCPA - EUA)', description: 'Disposições antissuborno - Proíbe o pagamento de subornos a funcionários estrangeiros para obter ou reter negócios.' },
    { id: 'in3', title: 'UK Bribery Act 2010 (Reino Unido)', description: 'Secção 7 - Introduz a responsabilidade corporativa por "falha na prevenção do suborno".' },
    { id: 'in4', title: 'Recomendações do GAFI/FATF', description: 'Recomendação 10 e 24 - Foca na devida diligência para clientes (CDD) e na transparência dos beneficiários efetivos.' },
];

export let mockIntegrations: Integration[] = [
    { id: 'int1', name: "OFAC Sanctions List", type: "Lista de Sanções Internacional", status: "Ativa", version: '2.1.0', lastUpdate: '2024-08-02 08:00:00', scriptId: 'script4' },
    { id: 'int2', name: "United Nations (UN) List", type: "Lista de Sanções Internacional", status: "Ativa", version: '1.8.2', lastUpdate: '2024-08-02 08:00:00', scriptId: 'script4' },
    { id: 'int7', name: "Global PEP API (roaring.io)", type: "Verificação de PEP", status: "Ativa", version: '1.0', lastUpdate: '2024-08-03 10:00:00', scriptId: 'script5' },
    { id: 'int3', name: "European Union (EU) List", type: "Lista de Sanções Internacional", status: "Ativa", version: '3.0.1', lastUpdate: '2024-08-01 22:00:00' },
    { id: 'int4', name: "African Union (AU) List", type: "Lista de Sanções Regional", status: "Inativa", version: '1.0.0', lastUpdate: '2024-07-20 10:00:00' },
    { id: 'int5', name: "AGT (NIF Validation)", type: "Validação Local (Angola)", status: "Ativa", version: '4.5.0', lastUpdate: '2024-08-02 11:30:00', scriptId: 'script3' },
    { id: 'int6', name: "Power BI", type: "Business Intelligence", status: "Ativa", version: '2.120.963.0', lastUpdate: '2024-07-31 18:00:00' },
];

export const mockCampaigns: Campaign[] = [
    { id: 1, title: 'Política de Compliance (Q3 2024)', recipients: 50, completion: 80, passed: 90 },
    { id: 2, title: 'Treinamento Anti-Suborno', recipients: 48, completion: 95, passed: 92 },
    { id: 3, title: 'Conhecimento de PEPs', recipients: 12, completion: 50, passed: 67 },
];

export const mockActionPlans: ActionPlan[] = [
    { id: 1, user: 'Colaborador A', quiz: 'Conhecimento de PEPs', status: 'Em Progresso' },
    { id: 2, user: 'Colaborador B', quiz: 'Conhecimento de PEPs', status: 'Pendente' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'log1', user: 'Administrador SONILS', action: 'Alteração de Template', timestamp: '2024-08-02 10:15:23', details: "Alterou o peso do critério 'Capacidade Financeira' de 25% para 30% no template 'Entidade Particular'." },
  { id: 'log2', user: 'Administrador SONILS', action: 'Gestão de Utilizadores', timestamp: '2024-08-01 15:45:10', details: "Adicionou o novo utilizador 'novo.tecnico@sonils.co.ao' com a função 'Tecnico'." },
  { id: 'log3', user: 'Administrador SONILS', action: 'Gestão de Políticas', timestamp: '2024-07-31 09:30:00', details: "Atualizou o documento 'Código de Conduta e Ética'." },
  { id: 'log4', user: 'Administrador SONILS', action: 'Gestão de Integrações', timestamp: '2024-07-30 11:20:05', details: "Desativou a integração 'African Union (AU) List'." },
  { id: 'log5', user: 'Técnico de Compliance', action: 'Login', timestamp: '2024-08-02 09:00:12', details: 'Login bem-sucedido no sistema.' },
  { id: 'log6', user: 'Administrador SONILS', action: 'Alteração de Template', timestamp: '2024-07-29 14:05:45', details: "Adicionou a questão 'A empresa possui certificação de segurança?' ao critério 'Governança' no template 'Entidade Particular'." },
];

export let mockAssessmentRequests: AssessmentRequest[] = [
  {
    id: 'req1',
    requesterEmail: 'gestor.projetos@sonils.co.ao',
    requestDate: '2024-08-05',
    status: 'Pendente',
    emailBody: `De: gestor.projetos@sonils.co.ao
Para: compliance@sonils.co.ao
Assunto: Solicitação de Due Diligence - DrillTech Angola

Prezados,

Gostaria de solicitar o início do processo de due diligence para um novo fornecedor potencial, a DrillTech Angola.

Recebemos uma proposta para serviços de perfuração e manutenção de poços e eles parecem promissores.

Dados do fornecedor:
- Nome: DrillTech Angola
- NIF: 5000987654
- Email: comercial@drilltech.co.ao
- Telefone: +244 923 111 222

Agradeço a vossa atenção.

Cumprimentos,
Gestor de Projetos`,
    supplierData: {
      name: 'DrillTech Angola',
      nif: '5000987654',
      email: 'comercial@drilltech.co.ao',
      phone: '+244 923 111 222',
      // FIX: Changed services from string to string[] to match the type definition.
      services: ['Perfuração e Manutenção de Poços'],
    }
  },
  {
    id: 'req2',
    requesterEmail: 'compras@sonils.co.ao',
    requestDate: '2024-08-03',
    status: 'Pendente',
    emailBody: `De: compras@sonils.co.ao
Para: compliance@sonils.co.ao
Assunto: Novo Fornecedor para Avaliação - Luanda Catering Services

Bom dia,

Por favor, iniciar a avaliação de risco para a empresa Luanda Catering Services, que estamos a considerar para fornecer serviços de catering para as nossas plataformas.

Informações de contacto:
- Nome: Luanda Catering Services
- NIF: 5000112233
- Email: info@lcs.co.ao
- Telefone: +244 912 333 444

Obrigado,
Departamento de Compras`,
    supplierData: {
      name: 'Luanda Catering Services',
      nif: '5000112233',
      email: 'info@lcs.co.ao',
      phone: '+244 912 333 444',
      // FIX: Changed services from string to string[] to match the type definition.
      services: ['Serviços de Catering para Plataformas'],
    }
  },
  {
    id: 'req3',
    requesterEmail: 'ti@sonils.co.ao',
    requestDate: '2024-08-01',
    status: 'Em Processo',
    emailBody: `De: ti@sonils.co.ao
Para: compliance@sonils.co.ao
Assunto: URGENTE: Avaliação de Fornecedor de Cibersegurança

Caros Colegas,

Necessitamos de uma avaliação urgente para a CyberSec Lda. Estamos a ponderar contratá-los para uma consultoria crítica em cibersegurança.

Seguem os dados:
- Nome: CyberSec Lda
- NIF: 5000445566
- Email: contact@cybersec.co.ao
- Telefone: +244 934 555 666

Obrigado pela vossa celeridade.

Atenciosamente,
Departamento de TI`,
    supplierData: {
      name: 'CyberSec Lda',
      nif: '5000445566',
      email: 'contact@cybersec.co.ao',
      phone: '+244 934 555 666',
      // FIX: Changed services from string to string[] to match the type definition.
      services: ['Consultoria em Cibersegurança'],
    }
  },
];

export let mockEntityHistory: EntityHistoryLog[] = [
  {
    id: 'eh1',
    entityId: '1',
    entityName: 'SocoOil, Lda.',
    timestamp: '2024-08-05T10:00:00Z',
    user: 'Técnico de Compliance',
    changeType: ChangeType.DocumentoAdicionado,
    summary: 'Adicionado novo documento: Declaração Fiscal AGT.',
    details: [
      { field: 'documents', oldValue: '2 documentos', newValue: '3 documentos' }
    ]
  },
  {
    id: 'eh2',
    entityId: '3',
    entityName: 'Diogo Costa - Consultoria',
    timestamp: '2024-08-04T15:30:00Z',
    user: 'Administrador SONILS',
    changeType: ChangeType.AlteracaoEstado,
    summary: "Estado alterado de 'Ativo' para 'Suspenso'.",
    details: [
      { field: 'status', oldValue: 'Ativo', newValue: 'Suspenso' },
      { field: 'legalStatusComment', oldValue: '', newValue: 'Status suspenso devido a pendências fiscais.' }
    ]
  },
  {
    id: 'eh3',
    entityId: '2',
    entityName: 'AngoPort Services',
    timestamp: '2024-08-02T11:20:00Z',
    user: 'Sistema Automático',
    changeType: ChangeType.EdicaoDados,
    summary: 'Documento "Apólices de Seguro" passou para o estado "Expirado".',
    details: [
      { field: 'documents.Apólices de Seguro.status', oldValue: 'Verificado', newValue: 'Expirado' }
    ]
  },
    {
    id: 'eh4',
    entityId: '7',
    entityName: 'Critical Risk Inc.',
    timestamp: '2024-08-01T09:05:00Z',
    user: 'Técnico de Compliance',
    changeType: ChangeType.Criacao,
    summary: 'Nova entidade "Critical Risk Inc." criada no sistema.',
    details: [
      { field: 'all', oldValue: null, newValue: 'Objeto da entidade' }
    ]
  },
   {
    id: 'eh5',
    entityId: '4',
    entityName: 'TecnoServ Angola, S.A.',
    timestamp: '2024-07-30T14:00:00Z',
    user: 'Gestor de Área',
    changeType: ChangeType.EdicaoDados,
    summary: 'Informação de contacto atualizada.',
    details: [
      { field: 'contact.name', oldValue: 'Ana Silva', newValue: 'Sofia Rodrigues' }
    ]
  },
];