import React, { useMemo } from 'react';
import { ModuleChangeProps, User } from '../types';
import { DashboardIcon } from '../components/icons/DashboardIcon';
import { EntityIcon } from '../components/icons/EntityIcon';
import { RiskAssessmentIcon } from '../components/icons/RiskAssessmentIcon';
import { ApprovalQueueIcon } from '../components/icons/ApprovalQueueIcon';
import { DocumentIcon } from '../components/icons/DocumentIcon';
import { TrainingIcon } from '../components/icons/TrainingIcon';
import { ReportIcon } from '../components/icons/ReportIcon';
import { GavelIcon } from '../components/icons/GavelIcon';
import { FilePlusIcon } from '../components/icons/FilePlusIcon';
import { UserIcon } from '../components/icons/UserIcon';
import { IntegrationIcon } from '../components/icons/IntegrationIcon';
import { TemplateIcon } from '../components/icons/TemplateIcon';
import { AuditLogIcon } from '../components/icons/AuditLogIcon';
import { SettingsIcon } from '../components/icons/SettingsIcon';
import { AuditIcon as SocIcon } from '../components/icons/AuditIcon';


interface MenuDashboardProps extends ModuleChangeProps {
    user: User;
}

const NavCard: React.FC<{ 
    title: string; 
    description: string; 
    icon: React.FC<any>; 
    onClick: () => void; 
    color: 'yellow' | 'black' | 'red';
}> = ({ title, description, icon: Icon, onClick, color }) => {
    
    let cardClasses = '';
    let iconColor = '';
    let titleColor = '';
    let descriptionColor = '';
    let linkColor = '';

    switch (color) {
        case 'yellow':
            cardClasses = 'bg-secondary hover:bg-secondary-hover';
            iconColor = 'text-primary';
            titleColor = 'text-primary';
            descriptionColor = 'text-gray-800';
            linkColor = 'text-primary';
            break;
        case 'red':
            cardClasses = 'bg-danger hover:bg-danger-hover';
            iconColor = 'text-white';
            titleColor = 'text-white';
            descriptionColor = 'text-red-100';
            linkColor = 'text-white';
            break;
        case 'black':
        default:
            cardClasses = 'bg-primary hover:bg-primary-hover';
            iconColor = 'text-secondary';
            titleColor = 'text-white';
            descriptionColor = 'text-gray-300';
            linkColor = 'text-secondary';
            break;
    }

    return (
        <article 
            onClick={onClick} 
            className={`${cardClasses} p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full`}
        >
            <div>
                <Icon className={`w-10 h-10 mb-4 ${iconColor}`} />
                <h3 className={`text-xl font-bold mb-2 ${titleColor}`}>{title}</h3>
                <p className={`text-sm ${descriptionColor}`}>{description}</p>
            </div>
            <div className={`mt-5 text-sm font-bold ${linkColor} flex items-center group`}>
                Aceder <span className="ml-2 transition-transform group-hover:translate-x-1">&rarr;</span>
            </div>
        </article>
    );
};


const modules = [
     { 
        id: 'new-risk-assessment', 
        title: 'Iniciar Nova Avaliação', 
        description: 'Para solicitações recebidas por email ou outros canais, inicie o processo de avaliação de risco aqui.',
        icon: FilePlusIcon
    },
    { 
        id: 'dashboard', 
        title: 'Dashboard de Análise', 
        description: 'Visualize gráficos e KPIs sobre o risco e a performance das entidades.',
        icon: DashboardIcon
    },
    { 
        id: 'entities', 
        title: 'Gestão de Entidades', 
        description: 'Consulte, adicione ou edite a base de dados de todas as entidades parceiras.',
        icon: EntityIcon
    },
    { 
        id: 'risk-assessment', 
        title: 'Avaliação de Risco', 
        description: 'Inicie novas avaliações de risco ou consulte o histórico de avaliações passadas.',
        icon: RiskAssessmentIcon
    },
    { 
        id: 'approval-queue', 
        title: 'Fila de Aprovação', 
        description: 'Reveja e processe as solicitações pendentes que requerem a sua atenção imediata.',
        icon: ApprovalQueueIcon
    },
    { 
        id: 'documents', 
        title: 'Gestão Documental', 
        description: 'Acompanhe o estado de todos os documentos, com foco nos pendentes e expirados.',
        icon: DocumentIcon
    },
    { 
        id: 'training', 
        title: 'Treinamento & Quiz', 
        description: 'Crie e gira quizzes de compliance para toda a organização, monitorizando o progresso.',
        icon: TrainingIcon
    },
    { 
        id: 'policies', 
        title: 'Políticas e Normas', 
        description: 'Consulte as políticas internas da SONILS e a legislação de compliance aplicável.',
        icon: GavelIcon
    },
    { 
        id: 'reports', 
        title: 'Relatórios', 
        description: 'Gere e visualize relatórios detalhados sobre a distribuição de risco e conformidade.',
        icon: ReportIcon
    },
    { 
        id: 'entity-history', 
        title: 'Histórico de Entidades', 
        description: 'Consulte o histórico de todas as alterações feitas nos registos das entidades.',
        icon: AuditLogIcon
    },
    // Admin modules are now separate
    { 
        id: 'user-management', 
        title: 'Gestão de Utilizadores', 
        description: 'Gira os perfis e permissões de acesso dos utilizadores do sistema.',
        icon: UserIcon
    },
    { 
        id: 'assessment-template-builder', 
        title: 'Templates de Avaliação', 
        description: 'Personalize a matriz de risco, critérios e questões para cada tipo de entidade.',
        icon: TemplateIcon
    },
    { 
        id: 'policy-management', 
        title: 'Gestão de Políticas', 
        description: 'Administre o repositório de políticas, normas e leis da empresa.',
        icon: GavelIcon
    },
    { 
        id: 'integration-management', 
        title: 'Gestão de Integrações', 
        description: 'Ative e configure integrações com fontes de dados externas.',
        icon: IntegrationIcon
    },
    { 
        id: 'audit-log', 
        title: 'Log de Auditoria', 
        description: 'Consulte o registo de todas as ações importantes realizadas no sistema.',
        icon: AuditLogIcon
    },
    { 
        id: 'settings', 
        title: 'Configurações do Sistema', 
        description: 'Edite e faça upload de scripts para personalizar funcionalidades do sistema.',
        icon: SettingsIcon
    },
    { 
        id: 'soc', 
        title: 'SOC', 
        description: 'Acesso restrito ao Security Operations Center para monitoração de segurança.',
        icon: SocIcon
    }
];

const cardColors: ('yellow' | 'black' | 'red')[] = ['yellow', 'yellow', 'yellow', 'black', 'red', 'red', 'yellow', 'yellow', 'black', 'black', 'black', 'black', 'yellow', 'black', 'red', 'black', 'red'];


const MenuDashboard: React.FC<MenuDashboardProps> = ({ onModuleChange, user }) => {

    const visibleModules = useMemo(() => {
        const adminModules = ['user-management', 'assessment-template-builder', 'policy-management', 'integration-management', 'audit-log', 'settings', 'soc'];
        
        return modules.filter(module => {
            if (user.role === 'Administrador') {
                return true;
            }
            if (user.role === 'Director Geral') {
                return ['reports', 'dashboard'].includes(module.id);
            }
            if (user.role === 'Gestor/Director da Area') {
                return !adminModules.includes(module.id);
            }
            if (user.role === 'Tecnico') {
                const allowedModules = ['dashboard', 'entities', 'risk-assessment', 'new-risk-assessment', 'documents', 'training', 'policies', 'entity-history'];
                return allowedModules.includes(module.id);
            }
            return false;
        });
    }, [user.role]);

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-text-main">Bem-vindo, {user.name.split(' ')[0]}!</h1>
            <p className="text-text-secondary mt-2 mb-8">Selecione um módulo abaixo para começar a trabalhar.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleModules.map((module, index) => (
                    <NavCard 
                        key={module.id + '-' + index}
                        title={module.title}
                        description={module.description}
                        icon={module.icon}
                        onClick={() => onModuleChange(module.id)}
                        color={cardColors[modules.findIndex(m => m.id === module.id) % cardColors.length]}
                    />
                ))}
                {visibleModules.length === 0 && (
                     <div className="col-span-full bg-card p-8 rounded-2xl shadow-lg text-center">
                        <h2 className="text-xl font-semibold text-primary">Nenhum módulo disponível</h2>
                        <p className="text-text-secondary mt-2">O seu perfil não tem acesso a módulos nesta plataforma. Por favor, contacte um administrador.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuDashboard;