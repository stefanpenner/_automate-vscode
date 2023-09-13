"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Localization = void 0;
class Localization {
    constructor(code) {
        this.code = code;
    }
    async getLocaleInfo() {
        return this.code.getLocaleInfo();
    }
    async getLocalizedStrings() {
        return this.code.getLocalizedStrings();
    }
}
exports.Localization = Localization;
//# sourceMappingURL=localization.js.map