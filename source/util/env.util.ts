export function isProductionEnv(): boolean {
    const {NODE_ENV} = process.env;
    return NODE_ENV === undefined || /^(prod|production)$/i.test(NODE_ENV);
}
