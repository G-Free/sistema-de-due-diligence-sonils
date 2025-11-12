// Simulated database of NIFs. In a real application, this would be an API call.
const nifDatabase: Record<string, { name: string }> = {
    '5000123456': { name: 'SocoOil, Lda.' },
    '5000654321': { name: 'AngoPort Services' },
    '5000789012': { name: 'Luanda Legal Consultores' },
    '9876543210': { name: 'Construções Horizonte, SA' },
};

/**
 * Simulates calling an external API to validate a NIF.
 * @param nif The 10-digit NIF to validate.
 * @returns A promise that resolves with the validation result.
 */
export const validateNifExternally = (nif: string): Promise<{ success: boolean; data?: { name: string }; message: string }> => {
    console.log(`Simulating external validation for NIF: ${nif}`);
    
    return new Promise(resolve => {
        // Simulate network delay
        setTimeout(() => {
            if (nifDatabase[nif]) {
                const entity = nifDatabase[nif];
                resolve({ 
                    success: true, 
                    data: entity, 
                    message: `NIF válido e encontrado: ${entity.name}` 
                });
            } else {
                resolve({ 
                    success: false, 
                    message: 'NIF inválido ou não encontrado na base de dados externa.' 
                });
            }
        }, 1500); 
    });
};
