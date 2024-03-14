import fs from "fs";
import {componentBody} from "../templates/Component";
import {toKebabCase, toPascalCase} from "./utils";
import {instrumentBody} from "../templates/Instrument";
import {PackageJson} from "./packageJson";
import {MachConfig} from "./machConfig";
import {AvionicsProjectConfig} from "./AvionicsProjectConfig";

export class AvionicsProject {
    private readonly projectName: string;
    private readonly buildSystem: string;
    private readonly instruments: string[] = []
    private readonly packageManager: string;

    private readonly tsConfig = {
        "compilerOptions": {
            "incremental": true,
            "target": "es2017",
            "module": "es2015",
            "strict": true,
            "esModuleInterop": true,
            "skipLibCheck": true,
            "forceConsistentCasingInFileNames": true,
            "outDir": "build",
            "moduleResolution": "node",
            "jsxFactory": "FSComponent.buildComponent",
            "jsxFragmentFactory": "FSComponent.Fragment",
            "jsx": "react"
        }
    }

    constructor(project: AvionicsProjectConfig) {
        this.projectName = project.name;
        this.buildSystem = project.buildSystem;
        this.instruments = project.instruments;
        this.packageManager = project.packageManager || 'npm';

        console.log('INSTRUMENTS: ', this.instruments)
    }

    private async generateHtml(instrumentName: string) {
        const template = fs.readFileSync('templates/template.html', 'utf-8');

        const regex = /{{ instrumentName }}/g;
        const body = template.replace(regex, instrumentName);

        fs.writeFileSync(`${this.projectName}/${instrumentName}.html`, body);
    }

    async createProject() {
        this.createProjectFolder();
        this.createReadme();
        this.generateSrcFiles();
        this.createPackageJson();
        await this.generateHtml(this.projectName);
        this.generateBundlerConfig();
        fs.writeFileSync(`${this.projectName}/tsconfig.json`, JSON.stringify(this.tsConfig, null, 2));

    }

    private createProjectFolder() {
        fs.mkdirSync(this.projectName);
    }

    private createReadme() {
        fs.writeFileSync(`${this.projectName}/README.md`, `# ${this.projectName}`);
    }

    private generateInstrumentFiles(instrument: string) {
        const instrumentDir = `${this.projectName}/src/${instrument}`;

        fs.mkdirSync(instrumentDir);

        const instrumentName = instrument.trim();
        const componentName = `${instrumentName}-component`;

        const newComponentBody = componentBody
            .replace(/{{ componentNameUpper }}/g, componentName.toUpperCase())
            .replace(/{{ componentNamePascal }}/g, toPascalCase(componentName))
            .replace(/{{ componentNameKebab }}/g, toKebabCase(componentName))
            .trim();


        const newInstrumentBody = instrumentBody
            .replace(/{{ componentNamePascal }}/g, toPascalCase(componentName))
            .replace(/{{ projectNameLower }}/g, this.projectName.toLowerCase())
            .replace(/{{ instrumentNameLower }}/g, instrumentName.toLowerCase())
            .replace(/{{ projectNameUpper }}/g, this.projectName.toUpperCase())
            .replace(/{{ instrumentNameUpper }}/g, instrumentName.toUpperCase())
            .trim();

        fs.writeFileSync(`${instrumentDir}/Component.tsx`, newComponentBody);
        fs.writeFileSync(`${instrumentDir}/index.tsx`, newInstrumentBody);

        const cssTemplate = fs.readFileSync('templates/template.css', 'utf-8')
            .replace(/{{ componentName }}/g, componentName);

        fs.writeFileSync(`${instrumentDir}/${instrument}.css`, cssTemplate);
    }

    private generateSrcFiles() {
        fs.mkdirSync(`${this.projectName}/src`);

        this.instruments.forEach((instrument) => {
            this.generateInstrumentFiles(instrument);
        })

    }

    private createPackageJson() {
        const packageJson: PackageJson = {
            name: this.projectName,
            version: '0.1.0',
            description: '',
            scripts: {
                test: 'echo "Error: no test specified" && exit 1',
            },
            keywords: [],
            dependencies: {
                "@microsoft/msfs-sdk": "^0.7.0"
            },
            devDependencies: {
                "typescript": "^5.3.3",
                "@microsoft/msfs-types": "^1.14.0",
            },
        }

        if (this.buildSystem === 'rollup') {
            packageJson.devDependencies['rollup'] = '^2.79.1';
            packageJson.devDependencies['rollup-plugin-import-css'] = '^3.5.0';
            packageJson.devDependencies['rollup-plugin-node-resolve'] = '^15.2.3';
            packageJson.devDependencies['@rollup/plugin-typescript'] = '^11.1.6';
            packageJson.devDependencies['tslib'] = '^2.6.2';
            packageJson.scripts['build'] = 'npx rollup -c';
        }

        if (this.buildSystem === 'mach') {
            packageJson.devDependencies['@synaptic-simulations/mach'] = '^1.0.0';
            packageJson.scripts['dev'] = 'mach watch';
            packageJson.scripts['build'] = 'mach build';
        }

        fs.writeFileSync(`${this.projectName}/package.json`, JSON.stringify(packageJson, null, 2));
    }

    private generateBundlerConfig() {

        if (this.buildSystem === 'rollup') {
            const template = fs.readFileSync('templates/rollup.config.js', 'utf-8');

            const regex = /{{ projectName }}/g;
            const body = template.replace(regex, this.projectName);

            fs.writeFileSync(`${this.projectName}/rollup.config.js`, body);
        }

        if (this.buildSystem === 'mach') {
            const template = fs.readFileSync('templates/mach.config.js', 'utf-8');

            const projectName = /{{ projectName }}/g;

            const machConfig: MachConfig = {
                packageName: `Airliners/${this.projectName}`,
                packageDir: `dist/${this.projectName}`,
                plugins: [],
                instruments: []
            }

            machConfig.instruments = this.instruments.map((instrument) => {
                return this.msfsAvionicsInstrumentString(instrument);
            })

            const body = template
                .replace(projectName, this.projectName)
                .replace('{{ machConfig }}', this.serializeMachConfigToJSON(machConfig));


            fs.writeFileSync(`${this.projectName}/mach.config.js`, body);
        }
    }

    private msfsAvionicsInstrumentString(instrumentName: string): string {
        return `msfsAvionicsInstrument('${instrumentName}')`
    }

    private serializeMachConfigToJSON(config: MachConfig): string {
        const entries = Object.entries(config).map(([key, value]) => {
            const formattedValue = Array.isArray(value) ? `[${value.join(', ')}]` : JSON.stringify(value);
            return `    ${key}: ${formattedValue}`;
        });

        return `{\n${entries.join(',\n')}\n}`;
    }


}