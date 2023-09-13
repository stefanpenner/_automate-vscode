"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuildVersion = exports.getBuildElectronPath = exports.getDevElectronPath = void 0;
__exportStar(require("./activityBar"), exports);
__exportStar(require("./application"), exports);
__exportStar(require("./code"), exports);
__exportStar(require("./debug"), exports);
__exportStar(require("./editor"), exports);
__exportStar(require("./editors"), exports);
__exportStar(require("./explorer"), exports);
__exportStar(require("./extensions"), exports);
__exportStar(require("./keybindings"), exports);
__exportStar(require("./logger"), exports);
__exportStar(require("./peek"), exports);
__exportStar(require("./problems"), exports);
__exportStar(require("./quickinput"), exports);
__exportStar(require("./quickaccess"), exports);
__exportStar(require("./scm"), exports);
__exportStar(require("./search"), exports);
__exportStar(require("./settings"), exports);
__exportStar(require("./statusbar"), exports);
__exportStar(require("./terminal"), exports);
__exportStar(require("./viewlet"), exports);
__exportStar(require("./localization"), exports);
__exportStar(require("./workbench"), exports);
__exportStar(require("./task"), exports);
var electron_1 = require("./electron");
Object.defineProperty(exports, "getDevElectronPath", { enumerable: true, get: function () { return electron_1.getDevElectronPath; } });
Object.defineProperty(exports, "getBuildElectronPath", { enumerable: true, get: function () { return electron_1.getBuildElectronPath; } });
Object.defineProperty(exports, "getBuildVersion", { enumerable: true, get: function () { return electron_1.getBuildVersion; } });
//# sourceMappingURL=index.js.map