import React, { useMemo } from 'react';
import { ModuleChangeProps, User } from '../types';
import { DashboardIcon } from '../components/icons/DashboardIcon';
import { EntityIcon } from '../components/icons/EntityIcon';
import { RiskAssessmentIcon } from '../components/icons/RiskAssessmentIcon';
import { ApprovalQueueIcon } from '../components/icons/ApprovalQueueIcon';
import { DocumentIcon } from '../components/icons/DocumentIcon';
import { TrainingIcon } from '../components/icons/TrainingIcon';
import { ReportIcon } from '../components/icons/ReportIcon';
import { AdminIcon } from '../components/icons/AdminIcon';
import { GavelIcon } from '../components/icons/GavelIcon';
import { FilePlusIcon } from '../components/icons/FilePlusIcon';

interface MenuDashboardProps extends ModuleChangeProps {
    user: User;
}

const NavCard: React.FC<{ 
    title: string; 
    description: string; 
    icon: React.FC<any>; 
    onClick: () => void; 
    color: 'yellow' | 'black';
}> = ({ title, description, icon: Icon, onClick, color }) => {
    
    const isYellow = color === 'yellow';

    const cardClasses = isYellow 
        ? 'bg-secondary hover:bg-secondary-hover' 
        : 'bg-primary hover:bg-primary-hover';
    
    const iconColor = isYellow ? 'text-primary' : 'text-secondary';
    const titleColor = isYellow ? 'text-primary' : 'text-white';
    const descriptionColor = isYellow ? 'text-gray-800' : 'text-gray-300';
    const linkColor = isYellow ? 'text-primary' : 'text-secondary';

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
        id: 'admin', 
        title: 'Administração', 
        description: 'Configure o sistema, gira utilizadores, e personalize a matriz de risco.',
        icon: AdminIcon
    }
];

const cardColors: ('yellow' | 'black')[] = ['yellow', 'yellow', 'yellow', 'black', 'black', 'black', 'yellow', 'yellow', 'black', 'black'];


const MenuDashboard: React.FC<MenuDashboardProps> = ({ onModuleChange, user }) => {

    const visibleModules = useMemo(() => {
        return modules.filter(module => {
            if (user.role === 'Administrador') {
                return true;
            }
            if (user.role === 'Director Geral') {
                return ['reports', 'dashboard'].includes(module.id);
            }
            if (user.role === 'Gestor/Director da Area') {
                return module.id !== 'admin';
            }
            if (user.role === 'Tecnico') {
                const allowedModules = ['dashboard', 'entities', 'risk-assessment', 'new-risk-assessment', 'documents', 'training', 'policies'];
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
                        key={module.id + '-' + index} // Add index to key to ensure uniqueness due to duplicate IDs
                        title={module.title}
                        description={module.description}
                        icon={module.icon}
                        onClick={() => onModuleChange(module.id)}
                        color={cardColors[index % cardColors.length]}
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