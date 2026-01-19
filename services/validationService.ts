import { EntityType } from '../types';

interface NifData {
    name: string;
    commercialRegistration: string;
    category: string;
    address: string;
    entityType: EntityType;
    country: string;
    beneficialOwner?: string;
}

// Simulated database of NIFs. In a real application, this would be an API call to AGT (for Angola) or other services.
// FIX: Export 'nifDatabase' to make it available for import in other modules.
export const nifDatabase: Record<string, NifData> = {
    // --- NIFs Nacionais (Fictícios, 9 dígitos) ---
    '500012345': { name: 'SocoOil, Lda.', commercialRegistration: 'CRC-LUAN-2011-111', category: 'Serviços Petrolíferos', address: 'Rua da Amizade, 1, Luanda', entityType: EntityType.PrivateCompany, country: 'Angola', beneficialOwner: 'Manuel Vicente' },
    '501987654': { name: 'Tech Solutions, SA', commercialRegistration: 'CRC-LUAN-2012-222', category: 'Tecnologia da Informação', address: 'Av. Revolução, 2, Luanda', entityType: EntityType.PrivateCompany, country: 'Angola', beneficialOwner: 'Ana Dias' },
    '502345678': { name: 'Comércio Local Unipessoal', commercialRegistration: 'N/A', category: 'Comércio a Retalho', address: 'Largo da Independência, 3, Luanda', entityType: EntityType.Individual, country: 'Angola', beneficialOwner: 'João Mendes' },
    '503876543': { name: 'Restaurante O Lusitano', commercialRegistration: 'CRC-LUAN-2014-444', category: 'Restauração', address: 'Rua dos Sabores, 4, Luanda', entityType: EntityType.PrivateCompany, country: 'Angola', beneficialOwner: 'Maria Fernandes' },
    '504789012': { name: 'Imobiliária Central, Lda.', commercialRegistration: 'CRC-LUAN-2015-555', category: 'Imobiliário', address: 'Av. Central, 5, Luanda', entityType: EntityType.PrivateCompany, country: 'Angola', beneficialOwner: 'Pedro Santos' },
    '505678901': { name: 'Serviços de Contabilidade Alfa', commercialRegistration: 'N/A', category: 'Serviços Financeiros', address: 'Rua das Contas, 6, Luanda', entityType: EntityType.Individual, country: 'Angola', beneficialOwner: 'Carlos Gomes' },
    '506543210': { name: 'Clínica Médica Bem-Estar', commercialRegistration: 'CRC-LUAN-2017-777', category: 'Saúde', address: 'Av. da Saúde, 7, Luanda', entityType: EntityType.PrivateCompany, country: 'Angola', beneficialOwner: 'Helena Costa' },
    '507112233': { name: 'Distribuição Rápida Express', commercialRegistration: 'CRC-LUAN-2018-888', category: 'Logística', address: 'Rua da Entrega, 8, Luanda', entityType: EntityType.PrivateCompany, country: 'Angola', beneficialOwner: 'Rui Andrade' },
    '508334455': { name: 'Agência de Viagens Horizonte', commercialRegistration: 'CRC-LUAN-2019-999', category: 'Turismo', address: 'Largo das Viagens, 9, Luanda', entityType: EntityType.PrivateCompany, country: 'Angola', beneficialOwner: 'Sofia Pereira' },
    '509998877': { name: 'Software Developer Group', commercialRegistration: 'N/A', category: 'Tecnologia da Informação', address: 'Rua do Código, 10, Luanda', entityType: EntityType.PrivateCompany, country: 'Angola', beneficialOwner: 'Miguel Ferreira' },
    
    // --- NIFs Internacionais/Estrangeiros (Fictícios, diferentes formatos) ---
    '9800000001': { name: 'Global Corp Ireland', commercialRegistration: 'IE-REG-11', category: 'Consultoria', address: '1 OConnell Street, Dublin', entityType: EntityType.PrivateCompany, country: 'Irlanda', beneficialOwner: 'Sean OMalley' },
    '12345678901': { name: 'Euro Trading GmbH (Alemanha)', commercialRegistration: 'DE-REG-22', category: 'Comércio Internacional', address: 'Hauptstrasse 2, Berlin', entityType: EntityType.PrivateCompany, country: 'Alemanha', beneficialOwner: 'Klaus Schmidt' },
    '999888777': { name: 'Entidade Não Residente A', commercialRegistration: 'FR-REG-33', category: 'Serviços Financeiros', address: 'Rue de la Paix 3, Paris', entityType: EntityType.PrivateCompany, country: 'França', beneficialOwner: 'Jean Dupont' },
    '9012345678': { name: 'International Holdings LLC', commercialRegistration: 'US-REG-44', category: 'Investimentos', address: '1 Wall Street, New York', entityType: EntityType.PrivateCompany, country: 'Estados Unidos', beneficialOwner: 'John Smith' },
    '9123456789': { name: 'Foreign Services Ltd', commercialRegistration: 'UK-REG-55', category: 'Serviços', address: '1 Baker Street, London', entityType: EntityType.PrivateCompany, country: 'Reino Unido', beneficialOwner: 'Emily Jones' },
    '9234567800': { name: 'Overseas Group, Inc.', commercialRegistration: 'CA-REG-66', category: 'Comércio', address: '1 Yonge Street, Toronto', entityType: EntityType.PrivateCompany, country: 'Canadá', beneficialOwner: 'Michael Tremblay' },
    '9345678901': { name: 'Non-Resident Test Entity', commercialRegistration: 'AU-REG-77', category: 'Tecnologia', address: '1 George Street, Sydney', entityType: EntityType.PrivateCompany, country: 'Austrália', beneficialOwner: 'David Williams' },
    '9456789012': { name: 'Export & Import Partners', commercialRegistration: 'CN-REG-88', category: 'Comércio Internacional', address: '1 Nanjing Road, Shanghai', entityType: EntityType.PrivateCompany, country: 'China', beneficialOwner: 'Li Wei' },
    '9567890123': { name: 'Offshore Ventures', commercialRegistration: 'BS-REG-99', category: 'Investimentos', address: '1 Bay Street, Nassau', entityType: EntityType.PrivateCompany, country: 'Bahamas', beneficialOwner: 'James Miller' },
    '9678901234': { name: 'Cross-Border Solutions', commercialRegistration: 'CH-REG-10', category: 'Consultoria', address: 'Bahnhofstrasse 1, Zurich', entityType: EntityType.PrivateCompany, country: 'Suiça', beneficialOwner: 'Thomas Müller' }
};

/**
 * Simulates calling an external API to validate a NIF.
 * @param nif The NIF to validate.
 * @returns A promise that resolves with the validation result.
 */
export const validateNifExternally = (nif: string): Promise<{ success: boolean; data?: NifData; message: string }> => {
    console.log(`Simulating external validation for NIF: ${nif}`);
    
    return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
            const entity = nifDatabase[nif];
            if (entity) {
                let message = `NIF válido. Dados de "${entity.name}" preenchidos.`;
                if (entity.country === 'Angola') {
                    message += ' (Validação simulada junto da AGT)';
                } else {
                    message += ` (Validação simulada junto do orgão de ${entity.country})`;
                }
                resolve({ 
                    success: true, 
                    data: entity, 
                    message: message 
                });
            } else {
                resolve({ 
                    success: false, 
                    message: 'NIF inválido ou não encontrado nas nossas bases de dados de simulação.' 
                });
            }
        }, 1500); 
    });
};

const sanctionedEntities = [
    { name: 'GlobalTrans Logística', list: 'OFAC', reason: 'Sanções económicas' },
    { name: 'Isabel dos Santos', list: 'OFAC', reason: 'Corrupção' },
    { name: 'Critical Risk Inc.', list: 'UN', reason: 'Atividades cibernéticas maliciosas' }
];

export const checkSanctionsLists = (name: string): Promise<{ matches: { list: string, reason: string, name: string }[] }> => {
    console.log(`Simulating sanctions check for: ${name}`);
    return new Promise(resolve => {
        setTimeout(() => {
            if (!name) {
                resolve({ matches: [] });
                return;
            }
            const lowerCaseName = name.toLowerCase();
            const matches = sanctionedEntities.filter(entity => 
                lowerCaseName.includes(entity.name.toLowerCase()) || 
                entity.name.toLowerCase().includes(lowerCaseName)
            );
            resolve({ matches });
        }, 2000);
    });
};


export const pepDatabase = [
    { name: 'isabel dos santos', reason: 'Ex-diretora da Sonangol, filha do ex-presidente.' },
    { name: 'josé eduardo', reason: 'Mencionado em listas de PEPs por associações familiares.' },
    { name: 'cyril ramaphosa', reason: 'Presidente da África do Sul.' },
    { name: 'antónio costa', reason: 'Ex-Primeiro Ministro de Portugal.' },
    { name: 'john doe', reason: 'Associado a senador dos EUA.' },
];

export const checkPepStatus = (name: string): Promise<{ isPep: boolean; details?: string }> => {
    console.log(`Simulating PEP status check for: ${name}`);
    return new Promise(resolve => {
        setTimeout(() => {
            if (!name) {
                resolve({ isPep: false });
                return;
            }
            const lowerCaseName = name.toLowerCase();
            const match = pepDatabase.find(person => 
                lowerCaseName.includes(person.name) || 
                person.name.toLowerCase().includes(lowerCaseName)
            );

            if (match) {
                resolve({ isPep: true, details: match.reason });
            } else {
                resolve({ isPep: false });
            }
        }, 1800); // slightly different delay to distinguish from sanctions check
    });
};
