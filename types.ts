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
  PublicEntity = 'Entidade Pública / Estatal',
  NGO = 'ONG / Fundação / Associação',
}

export type DocumentStatus = 'Verificado' | 'Pendente' | 'Expirado' | 'Recebido';

export interface Document {
  name: string;
  status: DocumentStatus;
  submissionDate: string;
  expiryDate?: string; // Optional as not all documents expire
}

export interface StatusLog {
  user: string;
  date: string;
  previousStatus: LegalStatus;
  newStatus: LegalStatus;
  justification: string;
}


export interface Entity {
  id: string;
  entityType: EntityType;
  name: string;
  category: string;
  riskLevel: RiskLevel;
  status: LegalStatus;
  onboardingDate: string;
  nif: string;
  commercialRegistration: string;
  beneficialOwner: string;
  address: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    website?: string;
    linkedIn?: string;
  };
  country: string;
  services: string[];
  documents?: Document[];
  legalStatusComment?: string;
  statusLog?: StatusLog[];
}

export interface ModuleChangeProps {
  onModuleChange: (module: string, context?: any) => void;
  setIsFormDirty?: (isDirty: boolean) => void;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export type ApprovalStatus = 
  | 'Aguardando Revisão de Compliance'
  | 'Aguardando Validação Técnica'
  | 'Aguardando Validação de Gestor'
  | 'Aguardando Aprovação Final'
  | 'Aprovado'
  | 'Rejeitado'
  | 'Mais Informação Necessária';


export interface ApprovalLog {
  step: string;
  user: string;
  date: string;
  comments?: string;
  action: 'Submetido' | 'Aprovado' | 'Rejeitado' | 'Mais Informação Solicitada';
}


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

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Gestor/Director da Area' | 'Tecnico' | 'Director Geral';
  password?: string; // Only for mock data simulation
}

export interface HistoryItem {
  id: string;
  entityName: string;
  assessmentDate: string;
  finalScore: number;
  classification: string;
  user: string;
  formState: Record<string, string>;
  sequenceNumber: string;
  observations: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: Array<{ type: 'quiz' | 'document'; title: string; }>;
  targetAudience: string;
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
  status: 'Em Progresso' | 'Pendente';
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}