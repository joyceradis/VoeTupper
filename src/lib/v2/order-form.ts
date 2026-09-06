import type { SourceChannel } from '../domain/types';
import type { Person, V2Order } from './model';
import { parseBRL } from './validation';

export type OrderFormInput = {
  consultantId: string;
  source: SourceChannel;
  summary: string;
  amount: string;
  quantity: string;
  payment: string;
  note: string;
};

export type OrderFormField = keyof OrderFormInput;
export type OrderFormFieldErrors = Partial<Record<OrderFormField, string>>;

export type OrderFormContext = {
  weekId: string;
  now: string;
  id: string;
  people: Person[];
};

export class OrderFormValidationError extends Error {
  constructor(public readonly fieldErrors: OrderFormFieldErrors) {
    super('Revise os campos destacados.');
    this.name = 'OrderFormValidationError';
  }
}

function parseQuantity(raw: string) {
  const value = raw.trim();
  if (!value) return undefined;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function createOrderFromForm(input: OrderFormInput, context: OrderFormContext): V2Order {
  const errors: OrderFormFieldErrors = {};
  const person = context.people.find(candidate => candidate.id === input.consultantId);
  if (!person || person.role !== 'CONSULTANT' || (person.status !== 'ACTIVE' && person.status !== 'NEW')) {
    errors.consultantId = 'Escolha uma consultora ativa da sua rede.';
  }

  const summary = input.summary.trim();
  if (!summary) errors.summary = 'Conte quais produtos fazem parte do pedido.';

  const amount = parseBRL(input.amount);
  if (amount === null) errors.amount = 'Digite um valor válido, como 199,90.';

  const quantity = parseQuantity(input.quantity);
  if (quantity === null) errors.quantity = 'Digite uma quantidade inteira maior que zero.';

  if (!['AUDIO', 'PHOTO', 'TEXT', 'OTHER'].includes(input.source)) {
    errors.source = 'Escolha como o pedido chegou.';
  }

  if (Object.keys(errors).length > 0) throw new OrderFormValidationError(errors);

  const payment = input.payment.trim();
  const note = input.note.trim();
  return {
    id: context.id,
    consultantId: input.consultantId,
    weekId: context.weekId,
    source: input.source,
    summary,
    ...(typeof quantity === 'number' ? { quantity } : {}),
    ...(typeof amount === 'number' ? { amount } : {}),
    ...(payment ? { payment } : {}),
    ...(note ? { note } : {}),
    stage: 'RECEIVED',
    createdAt: context.now,
  };
}
