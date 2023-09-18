"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Viewlet = void 0;
class Viewlet {
    constructor(code) {
        this.code = code;
    }
    async waitForTitle(fn) {
        await this.code.waitForTextContent('.monaco-workbench .part.sidebar > .title > .title-label > h2', undefined, fn);
    }
}
exports.Viewlet = Viewlet;
//# sourceMappingURL=viewlet.js.map