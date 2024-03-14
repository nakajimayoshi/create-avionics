"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const figlet_1 = __importDefault(require("figlet"));
const prompts_1 = __importDefault(require("prompts"));
const fs_1 = __importDefault(require("fs"));
const kolorist_1 = require("kolorist");
function init() {
    (0, figlet_1.default)('Create Avionics', async (err, data) => {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(data);
        try {
            const responses = await (0, prompts_1.default)([
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
                        { title: (0, kolorist_1.red)('Rollup'), value: 'rollup' },
                        { title: (0, kolorist_1.green)('Mach'), value: 'mach' },
                    ]
                },
                {
                    type: 'confirm',
                    name: 'multiInstrument',
                    message: 'Will your project have multiple instruments?'
                },
                {
                    type: (prev) => prev ? 'list' : null,
                    name: 'instruments',
                    message: 'Type instrument names separated by commas, e.g. "Instrument1, Instrument2, Instrument3...',
                    separator: ',',
                    initial: '',
                    format: (value) => console.log(value)
                }
            ]);
            const project = {
                name: responses.name.trim(),
                buildSystem: responses.buildSystem,
                multiInstrument: responses.multiInstrument
            };
            await createProject(project);
        }
        catch (error) {
            console.log(error);
        }
    });
}
async function createProject(project) {
    console.log('Creating project...');
    const builder = new AvionicsProjectFactory(project);
    builder.createProject();
}
class AvionicsProjectFactory {
    projectName;
    buildSystem;
    multiInstrument;
    instruments;
    tsConfig = {
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
    };
    constructor(project) {
        this.projectName = project.name;
        this.buildSystem = project.buildSystem;
        this.multiInstrument = project.multiInstrument;
        this.instruments = project.instruments;
        console.log('INSTRUMENTS: ', this.instruments);
    }
    async generateHtml(instrumentName) {
        const template = fs_1.default.readFileSync('templates/template.html', 'utf-8');
        const regex = /{{ instrumentName }}/g;
        const body = template.replace(regex, instrumentName);
        fs_1.default.writeFileSync(`${this.projectName}/${instrumentName}.html`, body);
    }
    createProject() {
        if (this.multiInstrument) {
            this.createMultiInstrumentProject();
        }
        else {
            this.createSingleInstrumentProject();
        }
    }
    createProjectFolder() {
        fs_1.default.mkdirSync(this.projectName);
    }
    createReadme() {
        fs_1.default.writeFileSync(`${this.projectName}/README.md`, `# ${this.projectName}`);
    }
    generateSrcFiles() {
        fs_1.default.mkdirSync(`${this.projectName}/src`);
        const componentTemplate = fs_1.default.readFileSync('templates/Component.ts', 'utf-8');
    }
    createPackageJson() {
        const packageJson = {
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
        };
        if (this.buildSystem === 'rollup') {
            packageJson.devDependencies['rollup'] = '^2.79.1';
            packageJson.devDependencies['rollup-plugin-import-css'] = '^3.5.0';
            packageJson.devDependencies['rollup-plugin-node-resolve'] = '^15.2.3';
            packageJson.devDependencies['@rollup/plugin-typescript'] = '^11.1.6';
            packageJson.devDependencies['tslib'] = '^2.6.2';
            packageJson.scripts['build'] = 'npx rollup -c';
        }
        fs_1.default.writeFileSync(`${this.projectName}/package.json`, JSON.stringify(packageJson, null, 2));
    }
    generateRollupConfig() {
        const template = fs_1.default.readFileSync('templates/rollup.config.js', 'utf-8');
        const regex = /{{ projectName }}/g;
        const body = template.replace(regex, this.projectName);
        fs_1.default.writeFileSync(`${this.projectName}/rollup.config.js`, body);
    }
    createSingleInstrumentProject() {
        this.createProjectFolder();
        this.createReadme();
        this.generateSrcFiles();
        this.createPackageJson();
        this.generateHtml(this.projectName);
        this.generateRollupConfig();
        fs_1.default.writeFileSync(`${this.projectName}/tsconfig.json`, JSON.stringify(this.tsConfig, null, 2));
    }
    createMultiInstrumentProject() {
        if (!this.instruments)
            return;
        console.log(this.instruments);
    }
}
init();
