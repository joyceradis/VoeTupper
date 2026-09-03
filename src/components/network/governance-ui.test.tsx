import { renderToStaticMarkup } from 'react-dom/server';
import { describe,expect,it } from 'vitest';
import NetworkTree from './NetworkTree';
import PeerRanking from './PeerRanking';
import type { ViewerContext } from '@/lib/domain/network';

const empresaria:ViewerContext={personId:'ritheli',role:'BUSINESS_OWNER',distributionId:'es',districtId:'serra'};
const lider:ViewerContext={personId:'lider-a',role:'LEADER',distributionId:'es',districtId:'serra',groupId:'g-a'};
const consultora:ViewerContext={personId:'consultora-a',role:'CONSULTANT',distributionId:'es',districtId:'serra',groupId:'g-a'};

const districts=[
  {id:'serra',name:'Serra',businessOwnerName:'Ritheli Radis'},
  {id:'vitoria',name:'Vitória',businessOwnerName:'Tatiana Madeira'}
];
const groups=[
  {id:'g-a',districtId:'serra',name:'Grupo A',leaderName:'Líder A',members:['Consultora 1','Consultora 2']},
  {id:'g-secret',districtId:'vitoria',name:'Grupo secreto Vitória',leaderName:'Líder Vitória',members:['Pessoa que não pode aparecer']}
];

describe('role-aware network UI',()=>{
  it('lets a business owner see peer district identity but not peer internal groups',()=>{
    const html=renderToStaticMarkup(<NetworkTree viewer={empresaria} districts={districts} groups={groups}/>);
    expect(html).toContain('Vitória');
    expect(html).toContain('Tatiana Madeira');
    expect(html).toContain('Grupo A');
    expect(html).not.toContain('Grupo secreto Vitória');
    expect(html).not.toContain('Pessoa que não pode aparecer');
  });

  it('limits a leader to the leader own group',()=>{
    const html=renderToStaticMarkup(<NetworkTree viewer={lider} districts={districts} groups={groups}/>);
    expect(html).toContain('Grupo A');
    expect(html).toContain('Consultora 1');
    expect(html).not.toContain('Vitória');
  });

  it('does not render management ranking for a consultant',()=>{
    const html=renderToStaticMarkup(<PeerRanking viewer={consultora} rows={[]}/>);
    expect(html).not.toContain('Ranking de Líderes');
    expect(html).not.toContain('Ranking de Empresárias');
  });

  it('renders only aggregate fields in business-owner ranking',()=>{
    const html=renderToStaticMarkup(<PeerRanking viewer={empresaria} rows={[{personId:'tatiana',name:'Tatiana Madeira',districtId:'vitoria',districtName:'Vitória',goalPercent:92,growthPercent:8,recruitmentCount:12,activeCount:40}]}/>);
    expect(html).toContain('Ranking de Empresárias');
    expect(html).toContain('92%');
    expect(html).toContain('12 novas');
    expect(html).not.toContain('faturamento');
    expect(html).not.toContain('Consultoras de Tatiana');
  });
});
