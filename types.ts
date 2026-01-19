export enum RiskLevel {
  Low = 'Baixo',
  Medium = 'Médio',
  High = 'Alto',
  Critical = 'Crítico',
  Informational = 'Informativo',
}

export enum LegalStatus {
  Active = 'Ativo',
  Suspended = 'Suspenso',
  InLiquidation = 'Em Liquidação',
}

export enum EntityType {
  Individual = 'Pessoa Individual',
  PrivateCompany = 'Entidade Particular (Empresa Privada)',
  PublicEntity = 'Entidade Pública',
  NGO = 'ONG',
}

export type DocumentStatus = 'Verificado' | 'Pendente' | 'Expirado' | 'Recebido';

export interface Document {
  name: string;
  status: DocumentStatus;
  submissionDate: string;
  expiryDate?: string;
}

export interface Shareholder {
  id: string;
  name: string;
  nationality: string;
  participation: number;
  position: string;
  isInternal: boolean;
  isChecking?: boolean;
  sanctionResult?: any;
  pepResult?: any;
}

export interface StatusLogEntry {
  user: string;
  date: string;
  previousStatus: LegalStatus;
  newStatus: LegalStatus;
  justification: string;
}

export interface Entity {
  id: string;
  name: string;
  entityType: EntityType;
  category: string;
  riskLevel: RiskLevel;
  status: LegalStatus;
  onboardingDate: string;
  country: string;
  nif: string;
  commercialRegistration: string;
  beneficialOwner: string;
  address: string;
  services: string[];
  contact: {
    name: string;
    email: string;
    phone: string;
    website?: string;
    linkedIn?: string;
  };
  documents?: Document[];
  statusLog?: StatusLogEntry[];
  legalStatusComment?: string;
  shareholders?: Shareholder[];
  incorporationDate?: string;
  // KYC/KYB fields
  birthDate?: string;
  nationality?: string;
  taxResidencyCountry?: string;
  profession?: string;
  employer?: string;
  maritalStatus?: string;
  isPep?: string;
  sourceOfWealth?: string;
  criminalRecordDetails?: string;
  hasOwnBusiness?: string;
  legalEntityType?: string;
  cae?: string;
  employeeCount?: number;
  lastYearTurnover?: number;
  legalRepresentativeName?: string;
  legalRepresentativeDocument?: string;
  uboIsPep?: string;
  hasRealEconomicActivity?: string;
  sanctionsHistory?: string;
  hasInternationalOperations?: string;
  isShellCompany?: string;
  officialRegistrationNumber?: string;
  supervisingMinistry?: string;
  institutionalHeadName?: string;
  institutionalHeadPosition?: string;
  isRepresentativeFormallyAppointed?: string;
  publicActivityNature?: string;
  ngoRegistrationNumber?: string;
  socialPurpose?: string;
  territorialScope?: string;
  receivesInternationalFunding?: string;
  operatesInConflictZones?: string;
  illicitFinancingHistory?: string;
  sourceOfFunds?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Gestor/Director da Area' | 'Tecnico' | 'Director Geral';
  password?: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface ApprovalLog {
  step: string;
  user: string;
  date: string;
  action: 'Submetido' | 'Aprovado' | 'Rejeitado' | 'Mais Informação Solicitada';
  comments?: string;
}

export type ApprovalStatus = 
  | 'Aguardando Revisão de Compliance'
  | 'Aguardando Validação Técnica'
  | 'Aguardando Validação de Gestor'
  | 'Aguardando Aprovação Final'
  | 'Aprovado'
  | 'Rejeitado'
  | 'Mais Informação Necessária';

export interface ApprovalQueueItem {
  id: string;
  entityId: string;
  entityName: string;
  requestType: string;
  requester: string;
  requestDate: string;
  status: ApprovalStatus;
  log?: ApprovalLog[];
}

export interface HistoryItem {
  id: string;
  sequenceNumber: string;
  entityName: string;
  assessmentDate: string;
  finalScore: number;
  classification: string;
  user: string;
  observations: string;
  formState: Record<string, string>;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  content: { type: 'quiz' | 'document'; title: string }[];
}

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'Ativa' | 'Inativa';
  version: string;
  lastUpdate: string;
  scriptId?: string;
}

export interface Campaign {
  id: number;
  title: string;
  recipients: number;
  completion: number;
  passed: number;
}

export interface ActionPlan {
  id: number;
  user: string;
  quiz: string;
  status: 'Pendente' | 'Em Progresso' | 'Concluído';
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface AssessmentRequest {
  id: string;
  requesterEmail: string;
  requestDate: string;
  status: 'Pendente' | 'Em Processo' | 'Concluído';
  emailBody: string;
  supplierData: {
    name: string;
    nif: string;
    email: string;
    phone: string;
    services: string[];
  };
}

export enum ChangeType {
  Criacao = 'Criação',
  AlteracaoEstado = 'Alteração de Estado',
  EdicaoDados = 'Edição de Dados',
  DocumentoAdicionado = 'Documento Adicionado',
  DocumentoRemovido = 'Documento Removido',
}

export interface EntityHistoryLog {
  id: string;
  entityId: string;
  entityName: string;
  timestamp: string;
  user: string;
  changeType: ChangeType;
  summary: string;
  details: { field: string; oldValue: any; newValue: any }[];
}

export interface Script {
  id: string;
  name: string;
  description: string;
  version: string;
  content: string;
}

export interface ModuleChangeProps {
  onModuleChange: (module: string, context?: any, force?: boolean) => void;
  setIsFormDirty?: (isDirty: boolean) => void;
}
