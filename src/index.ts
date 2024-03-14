import figlet from 'figlet';
import prompts from 'prompts';
import {red, green, lightGreen, lightRed, lightCyan, lightBlue} from 'kolorist';
import {AvionicsProjectConfig} from "./AvionicsProjectConfig";
import {AvionicsProject} from "./AvionicsProject";

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
                    message: 'Which bundler would you like to use?',
                    choices: [
                        { title: lightRed('Rollup'), value: 'rollup' },
                        { title: lightBlue('Mach'), value: 'mach' },
                    ]
                },
                {
                    type: 'select',
                    name: 'packageManager',
                    message: 'What package manager would you like to use?',
                    choices: [
                        { title: lightRed('npm'), value: 'npm' },
                        { title: lightGreen('pnpm'), value: 'pnpm' },
                        { title: lightCyan('yarn'), value: 'yarn' },
                    ]
                },
                {
                    type: 'list',
                    name: 'instruments',
                    message: 'Type instrument names separated by commas, e.g. Instrument1, Instrument2, Instrument3...',
                    separator: ',',
                 }
            ])

            const project: AvionicsProjectConfig = {
                name: responses.name.trim(),
                buildSystem: responses.buildSystem,
                instruments: responses.instruments
            }

            console.log('Creating project...');
            const projectFactory = new AvionicsProject(project);

            await projectFactory.createProject();

            console.log(lightGreen('Project created successfully!'));
            console.log('cd', project.name);
            console.log('npm install');
            console.log('npm run dev');

        } catch (error) {
            console.log(error);
        }

    });
}

init();
