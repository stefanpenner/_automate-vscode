"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityBar = void 0;
class ActivityBar {
    constructor(code) {
        this.code = code;
    }
    async waitForActivityBar(position) {
        let positionClass;
        if (position === 0 /* ActivityBarPosition.LEFT */) {
            positionClass = 'left';
        }
        else if (position === 1 /* ActivityBarPosition.RIGHT */) {
            positionClass = 'right';
        }
        else {
            throw new Error('No such position for activity bar defined.');
        }
        await this.code.waitForElement(`.part.activitybar.${positionClass}`);
    }
}
exports.ActivityBar = ActivityBar;
//# sourceMappingURL=activityBar.js.map