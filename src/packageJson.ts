export interface PackageJson {
    name: string;
    version: string;
    description?: string;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
    dependencies?: Record<string, string>;
    [key: string]: any;
}