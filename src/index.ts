import figlet from 'figlet';
import prompts from 'prompts';
import fs from 'fs';
import { red, green } from 'kolorist';

interface AvionicsProject {
    name: string;
    buildSystem: string;
    multiInstrument: boolean;
    instruments?: string[];
}

interface PackageJson {
    name: string;
    version: string;
    description?: string;
    devDependencies: Record<string, string>;
    scripts: Record<string, string>;
    dependencies?: Record<string, string>;
    [key: string]: any;
}


function init() {
    figlet('Create Avionics', async (err, data) => {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        
        console.log(data);
    
        try {
            const responses = await prompts([
                {
                    type: 'text',
                    name: 'name',
                    message: 'What is the name of your project?'
                },
                {
                    type: 'select',
                    name: 'buildSystem',
                    message: 'What build system would you like to use?',
                    choices: [
                        { title: red('Rollup'), value: 'rollup' },
                        { title: green('Mach'), value: 'mach' },
                    ]
                },
                {
                    type: 'confirm',
                    name: 'multiInstrument',
                    message: 'Will your project have multiple instruments?'
                },
                {
                    type: (prev: boolean) => prev ? 'list' : null,
                    name: 'instruments',
                    message: 'Type instrument names separated by commas, e.g. "Instrument1, Instrument2, Instrument3...',
                    separator: ',',
                    initial: '',
                    format: (value: string) => value.split(',').map((name: string) => name.trim())
                }
            ])

            const project: AvionicsProject = {
                name: responses.name.trim(),
                buildSystem: responses.buildSystem,
                multiInstrument: responses.multiInstrument
            }

            await createProject(project);

        } catch (error) {
            console.log(error);
        }


    


    });
}


async function createProject(project: AvionicsProject) {
    console.log('Creating project...');
    const builder = new AvionicsProjectFactory(project);

    builder.createProject();
}

class AvionicsProjectFactory {
    private projectName: string;
    private buildSystem: string;
    private multiInstrument: boolean;
    private instruments: string[] | undefined;

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

    constructor(project: AvionicsProject) {
        this.projectName = project.name;
        this.buildSystem = project.buildSystem;
        this.multiInstrument = project.multiInstrument;
        this.instruments = project.instruments;
    }

    private async generateHtml(instrumentName: string) {
        const template = fs.readFileSync('templates/template.html', 'utf-8');

        const regex = /{{ instrumentName }}/g;
        const body = template.replace(regex, instrumentName);

        fs.writeFileSync(`${this.projectName}/${instrumentName}.html`, body);
    }

    createProject() {
        if (this.multiInstrument) {
            this.createMultiInstrumentProject();
        } else {
            this.createSingleInstrumentProject();
        }
    }


    private createProjectFolder() {
        fs.mkdirSync(this.projectName);
    }

    private createReadme() {
        fs.writeFileSync(`${this.projectName}/README.md`, `# ${this.projectName}`);
    }

    private generateSrcFiles() {
        fs.mkdirSync(`${this.projectName}/src`);

        const componentTemplate = fs.readFileSync('templates/Component.tsx', 'utf-8');

    }

    private createPackageJson() {
        const packageJson: PackageJson = {
            name: this.projectName,
            version: '1.0.0',
            description: '',
            main: 'index.js',
            scripts: {
                test: 'echo "Error: no test specified" && exit 1',
                build: 'tsc',
                start: 'tsc -w',
            },
            keywords: [],
            devDependencies: {
                "typescript": "^5.3.3",
                "@microsoft/msfs-sdk": "^0.1.0",
                "@microsoft/msfs-types": "^0.1.0",
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

        fs.writeFileSync(`${this.projectName}/package.json`, JSON.stringify(packageJson, null, 2));
    }

    private generateRollupConfig() {
        const template = fs.readFileSync('templates/rollup.config.js', 'utf-8');

        const regex = /{{ projectName }}/g;
        const body = template.replace(regex, this.projectName);

        fs.writeFileSync(`${this.projectName}/rollup.config.js`, body);
    }

    private createSingleInstrumentProject() {
        this.createProjectFolder();
        this.createReadme();
        this.generateSrcFiles();
        this.createPackageJson();
        this.generateHtml(this.projectName);
        this.generateRollupConfig();

        fs.writeFileSync(`${this.projectName}/tsconfig.json`, JSON.stringify(this.tsConfig, null, 2));
     
    }

    private createMultiInstrumentProject() {
        // this.createProjectFolder();
        // this.createReadme();
        // this.createSrcFolder();
        // this.createPackageJson();
    
        console.log(this.instruments as string[]);
    }
}

init();
