import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Voa — Operação de vendas',description:'Operação semanal simples para equipes de venda direta',applicationName:'Voa'};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#14231d'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
