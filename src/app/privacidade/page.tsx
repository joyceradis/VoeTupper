export default function Privacy() {
  const contact = process.env.NEXT_PUBLIC_PRIVACY_CONTACT || 'canal de privacidade a definir antes do piloto';
  return (
    <main className="v2-legal-page">
      <a href="/" className="v2-legal-back">← Voltar ao VoeTupper</a>
      <header><img src="/logo-192.png" width="64" height="64" alt="" /><div><p className="v2-eyebrow">VoeTupper</p><h1>Privacidade</h1></div></header>
      <article>
        <p>Este produto coleta somente dados operacionais necessários para organizar equipes, ciclos e pedidos. Senhas de portais de terceiros não fazem parte do produto.</p>
        <h2>Dados e finalidade</h2>
        <p>Nome da consultora, código comercial opcional, telefone opcional, status, notas operacionais e histórico de pedidos são usados para organizar a equipe. Dados de uso podem ser medidos sem conteúdo de mensagens para avaliar eficiência.</p>
        <h2>Direitos e contato</h2>
        <p>Solicitações de acesso, correção, exportação ou exclusão serão atendidas pelo responsável pelo espaço. Contato: {contact}.</p>
        <p className="v2-legal-note">Este texto é uma base para o piloto e deve ser revisado para identificar controlador, operador, bases legais, retenção e fornecedores antes de oferta comercial.</p>
      </article>
    </main>
  );
}
