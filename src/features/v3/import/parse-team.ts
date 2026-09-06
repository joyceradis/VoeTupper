import type { NetworkRole } from '../domain/model';

export type ImportedPerson = { name: string; role: NetworkRole; businessCode: string; group: string; phone: string };
export type ImportError = { row: number; code: 'MISSING_NAME' | 'UNKNOWN_ROLE' | 'DUPLICATE_CODE' | 'UNKNOWN_GROUP'; message: string };

function normalize(value: string) {
  return value.trim().replace(/^"|"$/g, '');
}

function roleFrom(value: string): NetworkRole | null {
  const role = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
  if (role === 'distribuicao') return 'DISTRIBUTION';
  if (role === 'empresaria') return 'BUSINESS_OWNER';
  if (role === 'lider') return 'LEADER';
  if (role === 'consultora') return 'CONSULTANT';
  return null;
}

export function parseTeamCsv(content: string, knownGroups: string[]) {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim());
  const delimiter = (lines[0]?.match(/;/g)?.length ?? 0) >= (lines[0]?.match(/,/g)?.length ?? 0) ? ';' : ',';
  const headers = (lines.shift() ?? '').split(delimiter).map(item => normalize(item).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());
  const index = (names: string[]) => headers.findIndex(header => names.includes(header));
  const nameIndex = index(['nome', 'name']);
  const roleIndex = index(['funcao', 'papel', 'role']);
  const codeIndex = index(['codigo', 'code']);
  const groupIndex = index(['grupo', 'group']);
  const phoneIndex = index(['telefone', 'celular', 'phone']);
  const errors: ImportError[] = [];
  const seenCodes = new Set<string>();
  const rows = lines.map((line, lineIndex) => {
    const cells = line.split(delimiter).map(normalize);
    const name = cells[nameIndex] ?? '';
    const role = roleFrom(cells[roleIndex] ?? '');
    const businessCode = cells[codeIndex] ?? '';
    const group = cells[groupIndex] ?? '';
    const phone = (cells[phoneIndex] ?? '').replace(/\D/g, '');
    const row = lineIndex + 2;
    if (!name) errors.push({ row, code: 'MISSING_NAME', message: 'Nome não informado.' });
    if (!role) errors.push({ row, code: 'UNKNOWN_ROLE', message: 'Função não reconhecida.' });
    if (businessCode && seenCodes.has(businessCode)) errors.push({ row, code: 'DUPLICATE_CODE', message: `Código ${businessCode} repetido.` });
    if (businessCode) seenCodes.add(businessCode);
    if (group && !knownGroups.includes(group)) errors.push({ row, code: 'UNKNOWN_GROUP', message: `Grupo ${group} não existe nesta rede.` });
    return { name, role: role ?? 'CONSULTANT', businessCode, group, phone } satisfies ImportedPerson;
  });
  return { rows, errors };
}
