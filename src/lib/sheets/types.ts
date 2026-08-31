export type SheetOrderFlags={checked:boolean;portal:boolean;print:boolean;finalized:boolean;cancelled:boolean};
export type SheetOrder={vitrine:string;week:string;consultantName:string;date:string;source:string;summary:string;qty:number;amount:number;payment:string;note:string;status:string;nextAction:string}&SheetOrderFlags;
export type SheetConsultant={name:string;code:string;phone:string;status:string;leader:string};
export type SheetWeek={vitrine:string;week:string;start:string;end:string;status:string;goal:number};
