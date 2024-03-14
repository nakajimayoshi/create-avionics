export interface AvionicsProjectConfig {
    name: string;
    buildSystem: string;
    instruments: string[];
    // TODO: add bun as a bundler and package manager
    packageManager?: 'npm' | 'pnpm' | 'yarn';
}


