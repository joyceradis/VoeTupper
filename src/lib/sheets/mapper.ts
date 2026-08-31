import type {SheetOrder,SheetOrderFlags} from './types';

const truthy=(v:unknown)=>v===true||String(v).toUpperCase()==='TRUE'||String(v).toUpperCase()==='SIM';
const number=(v:unknown)=>{const n=typeof v==='number'?v:Number(String(v??'').replace(/\./g,'').replace(',','.'));return Number.isFinite(n)?n:0};

export function nextSheetAction(flags:SheetOrderFlags){
 if(flags.cancelled)return'Sem ação';
 if(flags.finalized)return'Concluído';
 if(flags.print)return'Finalizar / confirmar';
 if(flags.portal)return'Enviar print';
 if(flags.checked)return'Lançar no portal';
 return'Conferir pedido';
}
export function sheetStatus(flags:SheetOrderFlags){
 if(flags.cancelled)return'CANCELADO';
 if(flags.finalized)return'FINALIZADO';
 if(flags.print)return'PRINT ENVIADO';
 if(flags.portal)return'NO PORTAL';
 if(flags.checked)return'CONFERIDO';
 return'RECEBIDO';
}
export function mapOrderRow(row:unknown[]):SheetOrder{
 const flags={checked:truthy(row[9]),portal:truthy(row[10]),print:truthy(row[11]),finalized:truthy(row[12]),cancelled:truthy(row[13])};
 return{vitrine:String(row[0]??''),week:String(row[1]??''),consultantName:String(row[2]??''),date:String(row[3]??''),source:String(row[4]??''),summary:String(row[5]??''),qty:number(row[6]),amount:number(row[7]),payment:String(row[8]??''),...flags,note:String(row[14]??''),status:sheetStatus(flags),nextAction:nextSheetAction(flags)};
}
