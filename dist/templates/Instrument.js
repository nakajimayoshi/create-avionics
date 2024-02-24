"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const msfs_sdk_1 = require("@microsoft/msfs-sdk");
const MyComponent_1 = require("./MyComponent");
class MyInstrument extends BaseInstrument {
    get templateID() {
        return 'MyInstrument';
    }
    connectedCallback() {
        super.connectedCallback();
        msfs_sdk_1.FSComponent.render(<MyComponent_1.MyComponent />, document.getElementById('InstrumentContent'));
    }
}
registerInstrument('my-instrument', MyInstrument);
