import { Code } from './code';
export declare class KeybindingsEditor {
    private code;
    constructor(code: Code);
    updateKeybinding(command: string, commandName: string | undefined, keybinding: string, keybindingTitle: string): Promise<any>;
}
