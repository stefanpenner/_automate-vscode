import { Editor } from './editor';
import { Editors } from './editors';
import { Code } from './code';
import { QuickAccess } from './quickaccess';
export declare class SettingsEditor {
    private code;
    private editors;
    private editor;
    private quickaccess;
    constructor(code: Code, editors: Editors, editor: Editor, quickaccess: QuickAccess);
    /**
     * Write a single setting key value pair.
     *
     * Warning: You may need to set `editor.wordWrap` to `"on"` if this is called with a really long
     * setting.
     */
    addUserSetting(setting: string, value: string): Promise<void>;
    /**
     * Write several settings faster than multiple calls to {@link addUserSetting}.
     *
     * Warning: You will likely also need to set `editor.wordWrap` to `"on"` if `addUserSetting` is
     * called after this in the test.
     */
    addUserSettings(settings: [key: string, value: string][]): Promise<void>;
    clearUserSettings(): Promise<void>;
    openUserSettingsFile(): Promise<void>;
    openUserSettingsUI(): Promise<void>;
    searchSettingsUI(query: string): Promise<void>;
}
