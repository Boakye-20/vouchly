type Validator = (value: any) => boolean;

export function validate(fields: Record<string, { required?: boolean; type?: 'string' | 'number' | 'boolean' }>, data: any): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    for (const key in fields) {
        const { required, type } = fields[key];
        const value = data[key];
        if (required && (value === undefined || value === null || value === '')) {
            errors[key] = 'Required';
        } else if (type && value !== undefined && typeof value !== type) {
            errors[key] = `Expected type ${type}`;
        }
    }
    return { valid: Object.keys(errors).length === 0, errors };
} 