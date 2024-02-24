"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyComponent = void 0;
const msfs_sdk_1 = require("@microsoft/msfs-sdk");
class MyComponent extends msfs_sdk_1.DisplayComponent {
    render() {
        return (<div class='my-component'>Hello World!</div>);
    }
}
exports.MyComponent = MyComponent;
