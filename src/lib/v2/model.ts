import type { OrderStage } from '../domain/order';
import type { NetworkRole, SourceChannel, Week } from '../domain/types';

export const DEFAULT_EXTERNAL_URL = 'https://portal.tupperware.com.br/pt-BR';

export type GoalUnit = 'BRL' | 'PEOPLE' | 'ORDERS' | 'PERCENT';
export type GoalType = 'SALES' | 'RECRUITMENT' | 'ORDERS' | 'RETENTION';
export type PersonStatus = 'ACTIVE' | 'NEW' | 'PAUSED' | 'INACTIVE' | 'REVIEW';
export type NetworkEventKind = 'PERSON_JOINED' | 'GOAL_PROGRESS' | 'GOAL_REACHED' | 'ROLE_CHANGED';

export type Person = {
  id: string;
  name: string;
  role: NetworkRole;
  status: PersonStatus;
  businessCode?: string;
  phone?: string;
  distributionId: string;
  districtId?: string;
  groupId?: string;
  groupName?: string;
  leaderId?: string;
};

export type Goal = {
  id: string;
  type: GoalType;
  label: string;
  target: number;
  current: number;
  unit: GoalUnit;
  periodId: string;
};

export type V2Order = {
  id: string;
  consultantId: string;
  weekId: string;
  source: SourceChannel;
  summary: string;
  quantity?: number;
  amount?: number;
  payment?: string;
  note?: string;
  stage: OrderStage;
  createdAt: string;
};

export type NetworkEvent = {
  id: string;
  kind: NetworkEventKind;
  actorPersonId: string;
  occurredAt: string;
  title: string;
  detail: string;
};

export type V2State = {
  version: 2;
  workspace: {
    distributionId: string;
    distributionName: string;
    distributionManagerName: string;
    districtId: string;
    districtName: string;
    ownerPersonId: string;
    operationName: string;
    externalUrl: string;
    week: Week;
    campaignLabel: string;
  };
  people: Person[];
  orders: V2Order[];
  goals: Goal[];
  events: NetworkEvent[];
  updatedAt: string;
};

function basePeople(): Person[] {
  return [
    {
      id: 'person-gerusa',
      name: 'Gerusa',
      role: 'DISTRIBUTION',
      status: 'ACTIVE',
      distributionId: 'distribution-es',
    },
    {
      id: 'person-ritheli',
      name: 'Ritheli Radis',
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
      distributionId: 'distribution-es',
      districtId: 'district-serra',
    },
  ];
}

export function createEmptyState(now = new Date().toISOString()): V2State {
  const week: Week = {
    id: 'week-36-2026',
    label: 'Semana 36/2026',
    campaignId: 'campaign-09-2026',
    closesAt: '2026-09-06T20:00:00-03:00',
    teamGoal: 0,
    status: 'ACTIVE',
  };

  return {
    version: 2,
    workspace: {
      distributionId: 'distribution-es',
      distributionName: 'Distribuição Espírito Santo',
      distributionManagerName: 'Gerusa',
      districtId: 'district-serra',
      districtName: 'Serra',
      ownerPersonId: 'person-ritheli',
      operationName: 'VoeTupper',
      externalUrl: DEFAULT_EXTERNAL_URL,
      week,
      campaignLabel: 'Vitrine 09/2026',
    },
    people: basePeople(),
    orders: [],
    goals: [
      {
        id: 'sales',
        type: 'SALES',
        label: 'Vendas',
        target: 0,
        current: 0,
        unit: 'BRL',
        periodId: week.id,
      },
      {
        id: 'recruitment',
        type: 'RECRUITMENT',
        label: 'Novas consultoras',
        target: 45,
        current: 0,
        unit: 'PEOPLE',
        periodId: week.id,
      },
    ],
    events: [],
    updatedAt: now,
  };
}

export function createDemoState(now = new Date().toISOString()): V2State {
  const state = createEmptyState(now);
  state.people.push(
    {
      id: 'leader-marina',
      name: 'Líder Marina',
      role: 'LEADER',
      status: 'ACTIVE',
      businessCode: '2001',
      distributionId: state.workspace.distributionId,
      districtId: state.workspace.districtId,
      groupId: 'group-marina',
      groupName: 'Grupo Marina',
    },
    {
      id: 'leader-paula',
      name: 'Líder Paula',
      role: 'LEADER',
      status: 'ACTIVE',
      businessCode: '2002',
      distributionId: state.workspace.distributionId,
      districtId: state.workspace.districtId,
      groupId: 'group-paula',
      groupName: 'Grupo Paula',
    },
    {
      id: 'consultant-lucia',
      name: 'Consultora Lúcia',
      role: 'CONSULTANT',
      status: 'ACTIVE',
      businessCode: '1003',
      distributionId: state.workspace.distributionId,
      districtId: state.workspace.districtId,
      groupId: 'group-marina',
      groupName: 'Grupo Marina',
      leaderId: 'leader-marina',
    },
    {
      id: 'consultant-clara',
      name: 'Consultora Clara',
      role: 'CONSULTANT',
      status: 'NEW',
      businessCode: '1004',
      distributionId: state.workspace.distributionId,
      districtId: state.workspace.districtId,
      groupId: 'group-marina',
      groupName: 'Grupo Marina',
      leaderId: 'leader-marina',
    },
    {
      id: 'consultant-beatriz',
      name: 'Consultora Beatriz',
      role: 'CONSULTANT',
      status: 'ACTIVE',
      businessCode: '1005',
      distributionId: state.workspace.distributionId,
      districtId: state.workspace.districtId,
      groupId: 'group-paula',
      groupName: 'Grupo Paula',
      leaderId: 'leader-paula',
    },
  );
  state.orders = [
    {
      id: 'order-demo-1',
      consultantId: 'consultant-lucia',
      weekId: state.workspace.week.id,
      source: 'AUDIO',
      summary: '2 potes e 1 garrafa',
      quantity: 3,
      amount: 199.9,
      payment: 'PIX',
      stage: 'RECEIVED',
      createdAt: '2026-09-05T10:00:00.000Z',
    },
    {
      id: 'order-demo-2',
      consultantId: 'consultant-clara',
      weekId: state.workspace.week.id,
      source: 'PHOTO',
      summary: 'Kit de organização',
      quantity: 4,
      amount: 350,
      stage: 'PORTAL_DONE',
      createdAt: '2026-09-05T11:00:00.000Z',
    },
    {
      id: 'order-demo-3',
      consultantId: 'consultant-beatriz',
      weekId: state.workspace.week.id,
      source: 'TEXT',
      summary: 'Pedido semanal',
      quantity: 2,
      amount: 180,
      stage: 'COMPLETED',
      createdAt: '2026-09-05T09:00:00.000Z',
    },
  ];
  state.goals = state.goals.map(goal => goal.id === 'sales'
    ? { ...goal, target: 5000, current: 729.9 }
    : { ...goal, current: 3 });
  state.events = [
    {
      id: 'event-person-demo',
      kind: 'PERSON_JOINED',
      actorPersonId: 'consultant-lucia',
      occurredAt: '2026-09-04T08:00:00.000Z',
      title: 'Nova consultora na rede',
      detail: 'Consultora Lúcia entrou no Grupo Marina.',
    },
    {
      id: 'event-goal-demo',
      kind: 'GOAL_PROGRESS',
      actorPersonId: 'person-ritheli',
      occurredAt: '2026-09-05T12:00:00.000Z',
      title: 'Meta em movimento',
      detail: 'A rede registrou 3 novas consultoras de uma meta de 45.',
    },
  ];
  return state;
}
