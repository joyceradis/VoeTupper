import { describe, expect, it } from 'vitest';
import type { Person } from './model';
import { createOrderFromForm, OrderFormValidationError, type OrderFormInput } from './order-form';

const activePerson: Person = {
  id: 'c1',
  name: 'Ana',
  role: 'CONSULTANT',
  status: 'ACTIVE',
  distributionId: 'distribution-es',
  districtId: 'district-serra',
};

const baseInput: OrderFormInput = {
  consultantId: 'c1',
  source: 'AUDIO',
  summary: '2 potes',
  amount: '199,90',
  quantity: '2',
  payment: 'PIX',
  note: '',
};

const context = {
  weekId: 'week-36',
  now: '2026-09-05T15:00:00.000Z',
  id: 'o1',
  people: [activePerson],
};

function fieldErrorsFor(input: OrderFormInput, people = context.people) {
  try {
    createOrderFromForm(input, { ...context, people });
    throw new Error('Expected order validation to fail');
  } catch (error) {
    expect(error).toBeInstanceOf(OrderFormValidationError);
    return (error as OrderFormValidationError).fieldErrors;
  }
}

describe('V2 order flow', () => {
  it('derives week and date and starts the order at received', () => {
    expect(createOrderFromForm(baseInput, context)).toEqual({
      id: 'o1',
      consultantId: 'c1',
      weekId: 'week-36',
      source: 'AUDIO',
      summary: '2 potes',
      amount: 199.9,
      quantity: 2,
      payment: 'PIX',
      stage: 'RECEIVED',
      createdAt: '2026-09-05T15:00:00.000Z',
    });
  });

  it('omits blank optional values', () => {
    const order = createOrderFromForm({ ...baseInput, amount: '', quantity: '', payment: '', note: '  ' }, context);

    expect(order).not.toHaveProperty('amount');
    expect(order).not.toHaveProperty('quantity');
    expect(order).not.toHaveProperty('payment');
    expect(order).not.toHaveProperty('note');
  });

  it('rejects negative money and quantity values beside their fields', () => {
    expect(fieldErrorsFor({ ...baseInput, amount: '-1', quantity: '-2' })).toMatchObject({
      amount: expect.any(String),
      quantity: expect.any(String),
    });
  });

  it('rejects a person who is missing from the current network', () => {
    expect(fieldErrorsFor({ ...baseInput, consultantId: 'missing' })).toHaveProperty('consultantId');
  });

  it('rejects a blank summary', () => {
    expect(fieldErrorsFor({ ...baseInput, summary: '   ' })).toHaveProperty('summary');
  });

  it('rejects an inactive consultant', () => {
    expect(fieldErrorsFor(baseInput, [{ ...activePerson, status: 'INACTIVE' }])).toHaveProperty('consultantId');
  });
});
