import { Code } from './code';
import { QuickAccess } from './quickaccess';
export declare const enum ProblemSeverity {
    WARNING = 0,
    ERROR = 1
}
export declare class Problems {
    private code;
    private quickAccess;
    static PROBLEMS_VIEW_SELECTOR: string;
    constructor(code: Code, quickAccess: QuickAccess);
    showProblemsView(): Promise<any>;
    hideProblemsView(): Promise<any>;
    waitForProblemsView(): Promise<void>;
    static getSelectorInProblemsView(problemType: ProblemSeverity): string;
    static getSelectorInEditor(problemType: ProblemSeverity): string;
}
