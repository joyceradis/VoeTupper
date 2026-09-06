type SignInAuth = {
  signInWithPassword(credentials: { email: string; password: string }): Promise<{ error: { message: string } | null }>;
};

type ResetAuth = {
  resetPasswordForEmail(email: string, options: { redirectTo: string }): Promise<{ error: { message: string } | null }>;
};

export type SessionActionResult = { ok: true } | { ok: false; message: string };

export async function signInVoeTupper(
  auth: SignInAuth,
  email: string,
  password: string,
): Promise<SessionActionResult> {
  const { error } = await auth.signInWithPassword({ email: email.trim(), password });
  if (error) return { ok: false, message: 'E-mail ou senha do VoeTupper não conferem.' };
  return { ok: true };
}

export async function requestPasswordReset(
  auth: ResetAuth,
  email: string,
  redirectTo: string,
): Promise<SessionActionResult> {
  if (!email.trim()) return { ok: false, message: 'Digite seu e-mail para receber o link.' };
  const { error } = await auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) return { ok: false, message: 'Não foi possível enviar o link agora. Tente novamente.' };
  return { ok: true };
}
