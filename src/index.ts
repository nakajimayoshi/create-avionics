import figlet from 'figlet';
import prompts from 'prompts';
import {red, green, lightGreen} from 'kolorist';
import {AvionicsProject, AvionicsProjectFactory} from "./AvionicsProject";

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
                    type: (prev: boolean) =>  prev ? 'list' : null,
                    name: 'instruments',
                    message: 'Type instrument names separated by commas, e.g. Instrument1, Instrument2, Instrument3...',
                    separator: ',',
                 }
            ])

            const project: AvionicsProject = {
                name: responses.name.trim(),
                buildSystem: responses.buildSystem,
                instruments: responses.instruments
            }

            console.log('Creating project...');
            const projectFactory = new AvionicsProjectFactory(project);

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
