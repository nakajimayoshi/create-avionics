export const componentBody = `
import { FSComponent, DisplayComponent, VNode } from '@microsoft/msfs-sdk';

export class {{ componentNamePascal }} extends DisplayComponent<any> {
  public render(): VNode {
    return (
      <div class='{{ componentNameKebab }}'>Hello World!</div>
    );
  }
}
`;