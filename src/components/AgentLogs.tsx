import React, { ReactElement } from 'react';
import {BorderedBox} from "./Deco"

export type AgentLog = {
    id: string,
    type: "info" | "error" | "warning",
    log: string
}

export class AgentLogs {
    constructor(logText?: string, type: "info" | "error" | "warning" = "info", logId?: string){
        this.id = `Log-${(new Date().toISOString())}`
        if(!logText) return;
        let log = {
            id: logId || this.log.length.toString(),
            type: type,
            log: logText
        }
        this.logs.push(log);
    }
    log(logText: string, type: "info" | "error" | "warning" = "info", logId?: string){
        let log = {
            id: logId || this.log.length.toString(),
            type: type,
            log: logText
        }
        this.logs.push(log);
    }
    info(logText: string, logId?: string){
        this.log(logText, "info", logId);
    }
    error(logText: string, logId?: string){
        this.log(logText, "error", logId);
    }
    warning(logText: string, logId?: string){
        this.log(logText, "warning", logId);
    }
    id: string = '';
    logs: AgentLog[] = [];
    renderLog(log: AgentLog): ReactElement {
        try{
            let obj = JSON.parse(log.log);
            let rootFields = Object.keys(obj);
            return <>
                {rootFields.map((field, idx) => {
                    if(typeof obj[field] === 'object'){
                        return <BorderedBox key={idx} title={field} collapsible>
                            <a style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(obj[field], null, 2)}{console.log(JSON.stringify(obj[field]))}</a>
                        </BorderedBox>
                    }
                    return <BorderedBox key={idx} title={field} collapsible>
                        {obj[field]}
                    </BorderedBox>
                })}
            </>
        }catch(e){
            // console.error(e);
        }
        return <>{log.log}</>
    }
    toJSX(): ReactElement {
        return <div>
            {this.logs.map((log, idx) => <BorderedBox key={idx} title={`[${log.type.toUpperCase()}] ${log.id}`} collapsible>
                {this.renderLog(log)}
            </BorderedBox>)}
        </div>
    }
}

const AgentLogWindow: React.FC<{log: AgentLogs | undefined}> = ({log}) => {
    return <>
        {log && (<BorderedBox title={log.id} collapsible>
            {log.toJSX()}
        </BorderedBox>)}
    </>
}

export default AgentLogWindow;