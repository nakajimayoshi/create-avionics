/** @type { import('@synaptic-simulations/mach').MachConfig } */

module.exports = {{ machConfig }}

function msfsAvionicsInstrument(name, additionalImports) {
    return {
        name,
        index: `src/${name}/index.tsx`,
        simulatorPackage: {
            type: 'baseInstrument',
            templateId: `{{ projectName }}_${name}`,
            mountElementId: `${name}_CONTENT_MOUNT`,
            fileName: name.toLowerCase(),
            imports: [...(additionalImports ?? [])],
        },
    };
}