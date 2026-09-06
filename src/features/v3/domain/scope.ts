import type { Person, Viewer } from './model';

export function canViewPerson(viewer: Viewer, target: Viewer) {
  if (viewer.personId === target.personId) return true;
  if (viewer.distributionId !== target.distributionId) return false;

  if (viewer.role === 'DISTRIBUTION') return true;
  if (viewer.role === 'BUSINESS_OWNER') return viewer.districtId === target.districtId;
  if (viewer.role === 'LEADER') {
    return target.role === 'CONSULTANT'
      && Boolean(viewer.groupId)
      && viewer.groupId === target.groupId;
  }

  return false;
}

export function filterPeopleForViewer(viewer: Viewer, people: Person[]) {
  return people.filter(person => canViewPerson(viewer, person));
}
