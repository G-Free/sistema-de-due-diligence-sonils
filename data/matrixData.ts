import { EntityType } from "../types";

// This structure allows the matrix to be managed dynamically.
// In a real application, this would be fetched from and saved to a backend API.
export let criteriaMatrix: Record<EntityType, Record<string, { weight: number; items: Record<string, string> }>> = {
  [EntityType.Individual]: {
    'Identificação e Verificação': {
      weight: 0.20,
      items: {
        ind_docValido: 'Documento de identidade válido, original e autêntico?',
        ind_comprovanteResidencia: 'Comprovante de residência recente disponível?',
        ind_nacionalidadeConsistente: 'Nacionalidade confirmada e consistente com outros documentos?',
        ind_historicoFraude: 'Histórico de mudança de identidade ou fraudes documentais?',
        ind_baseOficial: 'Presença em bases oficiais de registro de pessoas?',
      },
    },
    'Origem dos Fundos e Atividade Econômica': {
      weight: 0.25,
      items: {
        ind_fonteRenda: 'Fonte de renda principal identificada e comprovada?',
        ind_atividadeCompativel: 'Atividade profissional atual e anterior compatível com renda declarada?',
        ind_patrimonioConsistente: 'Patrimônio pessoal consistente com renda declarada?',
        ind_vinculoAltoRisco: 'Existe vínculo com empresas ou setores de alto risco?',
        ind_movimentacoesSuspeitas: 'Movimentações financeiras suspeitas ou padrões incomuns?',
      },
    },
    'PEP e Conflito de Interesses': {
      weight: 0.20,
      items: {
        ind_isPep: 'É pessoa politicamente exposta (PEP)?',
        ind_parentesPep: 'Possui parentes ou sócios PEP?',
        ind_atividadePolitica: 'Atividade política ou pública relevante?',
        ind_conflitoInteresse: 'Possíveis conflitos de interesse com empresas ou governo?',
        ind_participacaoConselhos: 'Participação em conselhos ou órgãos públicos?',
      },
    },
    'Reputação e Antecedentes': {
      weight: 0.20,
      items: {
        ind_historicoJudicial: 'Histórico judicial, processos criminais ou cíveis?',
        ind_listasSancoes: 'Inclusão em listas de sanções nacionais e internacionais?',
        ind_participacaoEscandalos: 'Participação em escândalos ou processos de corrupção?',
        ind_midiaNegativa: 'Notícias negativas em mídia confiável?',
        ind_reputacaoSetor: 'Reputação geral no setor de atuação?',
      },
    },
    'Integridade Financeira': {
      weight: 0.15,
      items: {
        ind_solvencia: 'Situação de solvência e liquidez pessoal?',
        ind_historicoInadimplencia: 'Histórico de inadimplência ou falências?',
        ind_paraisosFiscais: 'Presença de contas ou ativos em paraísos fiscais?',
        ind_obrigacoesFiscais: 'Cumprimento de obrigações fiscais e bancárias?',
        ind_negociosRiscoReputacional: 'Participação em negócios com risco reputacional?',
      },
    },
  },
  [EntityType.PrivateCompany]: {
    'Conformidade Legal e Regulatória': {
      weight: 0.20,
      items: {
        priv_alvaraValido: 'Alvará comercial válido e atualizado?',
        priv_licencasSetoriais: 'Licenças setoriais específicas (ex.: ANPG, INE, ENSA)?',
        priv_certidoesFiscais: 'Certidões fiscais, contributivas e de não dívida disponíveis?',
        priv_cumpreNormas: 'Cumpre normas e regulamentos do setor?',
        priv_historicoAutuacoes: 'Histórico de autuações ou penalidades administrativas?',
      },
    },
    'Estrutura Societária e Beneficiários Efetivos': {
      weight: 0.15,
      items: {
        priv_estruturaAcionaria: 'Estrutura acionária documentada e transparente?',
        priv_idBeneficiarios: 'Identificação completa de sócios e beneficiários finais?',
        priv_participacaoOffshores: 'Participação em offshores ou jurisdições de risco?',
        priv_registrosAlteracoes: 'Registros de alterações societárias consistentes?',
        priv_participacaoPeps: 'Participação de PEPs ou sócios de risco?',
      },
    },
    'Capacidade Financeira': {
      weight: 0.20,
      items: {
        priv_demonstracoesAuditadas: 'Demonstrações financeiras auditadas disponíveis?',
        priv_indicadoresLiquidez: 'Indicadores de liquidez, solvência e endividamento?',
        priv_processosInsolvencia: 'Existência de processos de insolvência ou execução fiscal?',
        priv_historicoAdimplemento: 'Histórico de adimplemento de contratos e obrigações?',
        priv_capacidadeSuporte: 'Capacidade de suportar novos contratos ou compromissos financeiros?',
      },
    },
    'Governança, Ética e Controles Internos': {
      weight: 0.15,
      items: {
        priv_codigoConduta: 'Código de conduta e políticas anticorrupção implementadas?',
        priv_mecanismosCompliance: 'Mecanismos internos de compliance ativos e eficazes?',
        priv_auditoriaRegular: 'Procedimentos de auditoria interna e externa regulares?',
        priv_canalDenuncias: 'Sistema de denúncias e canal de ética funcional?',
        priv_certificacoesIso: 'Certificações ISO ou equivalentes aplicáveis?',
      },
    },
    'Reputação e Histórico Operacional': {
      weight: 0.15,
      items: {
        priv_historicoIrregularidades: 'Histórico de irregularidades ou litígios relevantes?',
        priv_reclamacoes: 'Reclamações de clientes, fornecedores ou parceiros?',
        priv_midiaNegativa: 'Presença negativa em mídia e redes de mercado?',
        priv_praticasQuestionaveis: 'Participação em práticas comerciais questionáveis?',
        priv_referenciasMercado: 'Referências de mercado ou histórico de prêmios e reconhecimento?',
      },
    },
    'Cibersegurança': {
        weight: 0.15,
        items: {
            priv_politicaCiberseguranca: 'Possui política de cibersegurança formalizada e atualizada?',
            priv_certificacaoSeguranca: 'Possui certificações de segurança (ex: ISO 27001)?',
            priv_testesInvasao: 'Realiza testes de invasão (pentests) periodicamente?',
            priv_gestaoIncidentes: 'Plano de resposta a incidentes de segurança definido?',
            priv_protecaoDados: 'Medidas de proteção de dados sensíveis implementadas (LGPD/GDPR)?',
        }
    }
  },
  [EntityType.PublicEntity]: {
    'Conformidade Institucional': {
      weight: 0.20,
      items: {
        pub_criadaPorLei: 'Criada por lei, decreto ou instrumento válido?',
        pub_estruturaFormalizada: 'Estrutura organizacional formalizada e funcional?',
        pub_competenciasDefinidas: 'Competências legais bem definidas e públicas?',
        pub_mandatosAtualizados: 'Mandatos de dirigentes legais e atualizados?',
        pub_registroOrgaosOficiais: 'Registro em órgãos oficiais de controle e fiscalização?',
      },
    },
    'Governança e Transparência': {
      weight: 0.25,
      items: {
        pub_publicacaoRelatorios: 'Publicação de relatórios financeiros, auditorias e contas públicas?',
        pub_transparenciaOrcamentaria: 'Transparência orçamentária e contratos públicos?',
        pub_cumpreLicitacao: 'Cumpre normas de licitação e contratação pública?',
        pub_disponibilidadeAuditoria: 'Disponibilidade para auditorias externas?',
        pub_controleInterno: 'Controle interno e gestão de riscos estruturados?',
      },
    },
    'Integridade e Ética Institucional': {
      weight: 0.25,
      items: {
        pub_politicasAnticorrupcao: 'Políticas anticorrupção e ética implementadas?',
        pub_historicoDenuncias: 'Histórico de denúncias, escândalos ou sanções?',
        pub_programasCompliance: 'Existência de programas de compliance ativo?',
        pub_participacaoConflitoInteresses: 'Participação em esquemas de conflito de interesses?',
        pub_cumprimentoLegislacaoIntegridade: 'Cumprimento da legislação de integridade pública?',
      },
    },
    'Risco Político e de Imagem': {
      weight: 0.20,
      items: {
        pub_influenciaPolitica: 'Influência partidária ou política na gestão?',
        pub_envolvimentoMidiaNegativa: 'Envolvimento em casos de mídia negativa ou escândalos?',
        pub_relacaoGruposPressao: 'Relação com grupos de pressão ou interesses privados?',
        pub_historicoInstabilidade: 'Histórico de instabilidade política ou administrativa?',
        pub_impactoReputacao: 'Impacto da reputação em contratos e parcerias?',
      },
    },
    'Relacionamento e Histórico Institucional': {
      weight: 0.10,
      items: {
        pub_cumprimentoContratos: 'Cumprimento de contratos anteriores?',
        pub_grauCooperacao: 'Grau de cooperação com parceiros e fornecedores?',
        pub_participacaoInvestigacoes: 'Participação em investigações anticorrupção?',
        pub_relacaoEntidadesRisco: 'Relação com outras entidades públicas ou privadas de risco?',
        pub_historicoLitigios: 'Histórico de litígios relevantes?',
      },
    },
  },
  [EntityType.NGO]: {
    'Registro e Legalidade': {
      weight: 0.25,
      items: {
        ngo_estatutosAtualizados: 'Estatutos e licenças atualizados?',
        ngo_registroOficial: 'Registro oficial em órgãos competentes?',
        ngo_cumpreLegislacao: 'Cumpre legislação específica para ONGs?',
        ngo_nifAtivo: 'Número fiscal ativo e contabilidade organizada?',
        ngo_alteracoesDocumentadas: 'Alterações estatutárias documentadas?',
      },
    },
    'Transparência Financeira': {
      weight: 0.25,
      items: {
        ngo_relatoriosAuditados: 'Relatórios financeiros auditados disponíveis?',
        ngo_fontesFinanciamento: 'Fontes de financiamento claras e documentadas?',
        ngo_cumprimentoRegrasReporte: 'Cumprimento de regras de reporte de doações e despesas?',
        ngo_fundosPaisRisco: 'Recebe fundos de países de alto risco?',
        ngo_prestacaoContasPublica: 'Prestação de contas acessível ao público?',
      },
    },
    'Finalidade e Impacto Social': {
      weight: 0.20,
      items: {
        ngo_missaoCompativel: 'Missão e objetivos compatíveis com atividades?',
        ngo_resultadosDocumentados: 'Resultados documentados e mensuráveis?',
        ngo_beneficiariosIdentificaveis: 'Beneficiários identificáveis e acompanhamento de impacto?',
        ngo_alinhamentoObjetivos: 'Alinhamento com objetivos estratégicos e sociais?',
        ngo_evidenciasProjetos: 'Evidências de projetos e atividades consistentes?',
      },
    },
    'Governança e Estrutura Interna': {
      weight: 0.15,
      items: {
        ngo_conselhoConstituido: 'Conselho e direção formalmente constituídos?',
        ngo_politicasIntegridade: 'Políticas internas de integridade e gestão de risco?',
        ngo_controleGastos: 'Procedimentos de controle de gastos e projetos?',
        ngo_auditoriasPeriodicas: 'Auditorias internas ou externas periódicas?',
        ngo_estruturaDecisao: 'Estrutura de tomada de decisão documentada?',
      },
    },
    'Reputação e Ética': {
      weight: 0.15,
      items: {
        ngo_historicoControversias: 'Histórico de controvérsias ou fraudes?',
        ngo_sancoesParceiros: 'Recebeu sanções de parceiros ou financiadores?',
        ngo_boaReputacao: 'Boa reputação junto a comunidades e stakeholders?',
        ngo_transparenciaProcessos: 'Transparência em processos decisórios?',
        ngo_parceriasCredibilidade: 'Parcerias e projetos com credibilidade comprovada?',
      },
    },
  },
};

// --- Helper functions to mutate the matrix ---

export function addCriterion(entityType: EntityType, name: string, weight: number) {
    if (!criteriaMatrix[entityType][name]) {
        criteriaMatrix[entityType][name] = { weight, items: {} };
    }
}

export function deleteCriterion(entityType: EntityType, name: string) {
    delete criteriaMatrix[entityType][name];
}

export function updateCriterion(entityType: EntityType, name: string, newWeight: number) {
    if (criteriaMatrix[entityType][name]) {
        criteriaMatrix[entityType][name].weight = newWeight;
    }
}

export function addQuestion(entityType: EntityType, criterionName: string, questionText: string) {
    const key = `${criterionName.substring(0, 3).toLowerCase()}_q${Date.now()}`; // Generate a unique key
    criteriaMatrix[entityType][criterionName].items[key] = questionText;
}

export function deleteQuestion(entityType: EntityType, criterionName: string, questionKey: string) {
    delete criteriaMatrix[entityType][criterionName].items[questionKey];
}

export function editQuestion(entityType: EntityType, criterionName: string, questionKey: string, newText: string) {
    if (criteriaMatrix[entityType]?.[criterionName]?.items[questionKey] !== undefined) {
        criteriaMatrix[entityType][criterionName].items[questionKey] = newText;
    }
}