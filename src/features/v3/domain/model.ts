export type NetworkRole = 'DISTRIBUTION' | 'BUSINESS_OWNER' | 'LEADER' | 'CONSULTANT';

export type PersonStatus =
  | 'NEW'
  | 'ACTIVE'
  | 'PAUSED'
  | 'INACTIVE'
  | 'REACTIVATION_ELIGIBLE'
  | 'REACTIVATED';

export type DataMode = 'REAL' | 'DEMO';

export type Viewer = {
  personId: string;
  role: NetworkRole;
  distributionId: string;
  districtId?: string;
  groupId?: string;
};

export type Person = Viewer & {
  displayName: string;
  status: PersonStatus;
  businessCode: string | null;
  phone: string | null;
};

export type Membership = Viewer & {
  id: string;
  startedAt: string;
  endedAt: string | null;
};

export type Vitrine = {
  id: string;
  label: string;
  opensAt: string;
  closesAt: string;
  timezone: 'America/Sao_Paulo';
};

export type GoalType = 'SALES' | 'RECRUITMENT' | 'ACTIVITY';

export type Goal = {
  id: string;
  vitrineId: string;
  personId: string;
  type: GoalType;
  target: number;
  current: number;
};

export type Group = {
  id: string;
  name: string;
  distributionId: string;
  districtId: string;
};

export type District = {
  id: string;
  name: string;
  distributionId: string;
  ownerPersonId: string | null;
};

export type V3Snapshot = {
  mode: DataMode;
  viewer: Person;
  membership: Membership;
  vitrine: Vitrine;
  people: Person[];
  groups: Group[];
  districts: District[];
  goals: Goal[];
};
