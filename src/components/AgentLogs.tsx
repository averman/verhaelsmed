import React, { ReactElement } from 'react';
import {BorderedBox} from "./Deco"

export class AgentLog {
    constructor(log: string){
        this.id = `Log-${(new Date().toISOString())}`
        this.logs.push(log);
    }
    log(log: string){
        this.logs.push(log);
    }
    id: string = '';
    logs: string[] = [];
    toJSX(): ReactElement {
        return <div>
            {this.logs.map((log, idx) => <div key={idx}>{log}</div>)}
        </div>
    }
}

const AgentLogWindow: React.FC<{log: AgentLog | undefined}> = ({log}) => {
    return <>
        {log && (<BorderedBox title={log.id} collapsible>
            {log.toJSX()}
        </BorderedBox>)}
    </>
}

export default AgentLogWindow;