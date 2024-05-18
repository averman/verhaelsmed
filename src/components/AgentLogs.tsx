import React, { ReactElement } from 'react';
import {BorderedBox} from "./Deco"

export type AgentLog = {
    id: string,
    type: "info" | "error" | "warning",
    log: string,
    title?: string
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
    log(logText: string, type: "info" | "error" | "warning" = "info", logId?: string, title?: string){
        let log = {
            id: logId || this.log.length.toString(),
            type: type,
            log: logText,
            title
        }
        this.logs.push(log);
        this.updateLog();
    }
    info(logText: string, logId?: string, title?: string){
        this.log(logText, "info", logId, title);
    }
    error(logText: string, logId?: string, title?: string){
        this.log(logText, "error", logId, title);
    }
    warning(logText: string, logId?: string, title?: string){
        this.log(logText, "warning", logId, title);
    }
    id: string = '';
    logs: AgentLog[] = [];
    open: number = 0;
    close: number = 0;
    updateLog: ()=>void = ()=>{};
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
        return <div style={{ whiteSpace: 'pre-wrap' }}>{log.log}</div>
    }
    toJSX(): ReactElement {
        return <div>
            {this.logs.map((log, idx) => <BorderedBox key={idx} title={`[${log.type.toUpperCase()}] ${log.id}` 
                + (log.title?": "+log.title:"")} collapsible>
                {this.renderLog(log)}
            </BorderedBox>)}
        </div>
    }
    isClosed(): boolean {
        return this.open == 0? false: this.open == this.close;
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