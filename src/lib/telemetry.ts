export type ProductEvent =
 | {name:'order_created';workspaceId:string;weekId:string}
 | {name:'order_stage_advanced';workspaceId:string;weekId:string;from:string;to:string}
 | {name:'order_completed';workspaceId:string;weekId:string;elapsedMinutes:number}
 | {name:'closing_opened';workspaceId:string;weekId:string;pendingCount:number}
 | {name:'weekly_return';workspaceId:string;weekId:string};

/** Adapter boundary only. Never add names, phones, notes, summaries or message contents here. */
export function safeEvent(event:ProductEvent){return event;}
