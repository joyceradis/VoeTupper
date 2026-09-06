import React, { useMemo, useState, type FormEvent } from 'react';
import type { V2Order, V2State } from '../../lib/v2/model';
import { createOrderFromForm, OrderFormValidationError, type OrderFormFieldErrors, type OrderFormInput } from '../../lib/v2/order-form';
import { Icon, IconButton } from './ui';

type OrderDialogProps = {
  open: boolean;
  state: V2State;
  onClose: () => void;
  onCreate: (order: V2Order) => void;
};

const emptyForm: OrderFormInput = {
  consultantId: '',
  source: 'AUDIO',
  summary: '',
  amount: '',
  quantity: '',
  payment: '',
  note: '',
};

function createId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return `order-${globalThis.crypto.randomUUID()}`;
  return `order-${Date.now().toString(36)}`;
}

export function OrderDialog({ open, state, onClose, onCreate }: OrderDialogProps) {
  const [form, setForm] = useState<OrderFormInput>(emptyForm);
  const [errors, setErrors] = useState<OrderFormFieldErrors>({});
  const consultants = useMemo(() => state.people
    .filter(person => person.role === 'CONSULTANT' && (person.status === 'ACTIVE' || person.status === 'NEW'))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), [state.people]);

  if (!open) return null;

  function update<K extends keyof OrderFormInput>(field: K, value: OrderFormInput[K]) {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: undefined }));
  }

  function close() {
    setForm(emptyForm);
    setErrors({});
    onClose();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const order = createOrderFromForm(form, {
        weekId: state.workspace.week.id,
        now: new Date().toISOString(),
        id: createId(),
        people: state.people,
      });
      onCreate(order);
      close();
    } catch (error) {
      if (error instanceof OrderFormValidationError) setErrors(error.fieldErrors);
    }
  }

  return (
    <div className="v2-dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
      <section className="v2-dialog" role="dialog" aria-modal="true" aria-labelledby="order-dialog-title">
        <header className="v2-dialog-header">
          <div><p className="v2-eyebrow">Registro rápido</p><h2 id="order-dialog-title">Novo pedido</h2><p>Guarde o essencial agora. Você pode avançar as etapas depois.</p></div>
          <IconButton icon="close" label="Fechar novo pedido" onClick={close} />
        </header>

        {consultants.length === 0 ? (
          <div className="v2-form-empty"><span><Icon name="users" /></span><div><strong>Cadastre uma consultora primeiro</strong><p>Assim o pedido fica ligado à pessoa certa na Rede.</p></div></div>
        ) : null}

        <form className="v2-order-form" onSubmit={submit} noValidate>
          <div className="v2-field v2-field-wide">
            <label htmlFor="order-consultant">Consultora</label>
            <select id="order-consultant" value={form.consultantId} onChange={event => update('consultantId', event.target.value)} aria-invalid={Boolean(errors.consultantId)} aria-describedby={errors.consultantId ? 'order-consultant-error' : undefined}>
              <option value="">Selecione uma pessoa</option>
              {consultants.map(person => <option value={person.id} key={person.id}>{person.name}</option>)}
            </select>
            {errors.consultantId ? <small className="v2-field-error" id="order-consultant-error">{errors.consultantId}</small> : null}
          </div>

          <div className="v2-field v2-field-wide">
            <label htmlFor="order-source">Recebi por</label>
            <select id="order-source" value={form.source} onChange={event => update('source', event.target.value as OrderFormInput['source'])}>
              <option value="AUDIO">Áudio</option><option value="PHOTO">Foto</option><option value="TEXT">Texto</option><option value="OTHER">Outro</option>
            </select>
          </div>

          <div className="v2-field v2-field-wide">
            <label htmlFor="order-summary">Resumo / itens</label>
            <textarea id="order-summary" rows={3} value={form.summary} onChange={event => update('summary', event.target.value)} placeholder="Ex.: 2 potes e 1 garrafa" aria-invalid={Boolean(errors.summary)} aria-describedby={errors.summary ? 'order-summary-error' : undefined} />
            {errors.summary ? <small className="v2-field-error" id="order-summary-error">{errors.summary}</small> : null}
          </div>

          <div className="v2-field">
            <label htmlFor="order-amount">Valor</label>
            <div className="v2-input-prefix"><span>R$</span><input id="order-amount" inputMode="decimal" value={form.amount} onChange={event => update('amount', event.target.value)} placeholder="0,00" aria-invalid={Boolean(errors.amount)} aria-describedby={errors.amount ? 'order-amount-error' : undefined} /></div>
            {errors.amount ? <small className="v2-field-error" id="order-amount-error">{errors.amount}</small> : null}
          </div>

          <div className="v2-field">
            <label htmlFor="order-quantity">Quantidade</label>
            <input id="order-quantity" inputMode="numeric" value={form.quantity} onChange={event => update('quantity', event.target.value)} placeholder="Ex.: 3" aria-invalid={Boolean(errors.quantity)} aria-describedby={errors.quantity ? 'order-quantity-error' : undefined} />
            {errors.quantity ? <small className="v2-field-error" id="order-quantity-error">{errors.quantity}</small> : null}
          </div>

          <div className="v2-field v2-field-wide">
            <label htmlFor="order-payment">Pagamento <span>opcional</span></label>
            <select id="order-payment" value={form.payment} onChange={event => update('payment', event.target.value)}><option value="">Não informado</option><option value="PIX">Pix</option><option value="DINHEIRO">Dinheiro</option><option value="CARTAO">Cartão</option><option value="OUTRO">Outro</option></select>
          </div>

          <div className="v2-field v2-field-wide">
            <label htmlFor="order-note">Observação <span>opcional</span></label>
            <input id="order-note" value={form.note} onChange={event => update('note', event.target.value)} placeholder="Algo importante para lembrar" />
          </div>

          <div className="v2-dialog-actions">
            <button className="v2-secondary-button" type="button" onClick={close}>Cancelar</button>
            <button className="v2-primary-button" type="submit" disabled={consultants.length === 0}><Icon name="check" />Salvar pedido</button>
          </div>
        </form>
      </section>
    </div>
  );
}
