export const instrumentBody = `
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />

import { FSComponent } from '@microsoft/msfs-sdk';
import { {{ componentNamePascal }} } from './Component';
import './{{ instrumentNameLower }}.css';

class {{ instrumentNameUpper }} extends BaseInstrument {
  get templateID(): string {
    return '{{ projectNameUpper }}_{{ instrumentNameUpper }}';
  }

  public connectedCallback(): void {
    super.connectedCallback();

    FSComponent.render(<{{ componentNamePascal }}/>, document.getElementById('InstrumentContent'));
  }
}

registerInstrument('{{ projectNameLower }}-{{ instrumentNameLower }}', {{ instrumentNameUpper }});
`;