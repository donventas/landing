'use strict';
// Server-only transport. Credentials must be supplied by the deployment, never
// by a request body. No environment fallback and no redirect to another host.
function createResendMailer({ key, fetchImpl = globalThis.fetch } = {}) {
  if (typeof key !== 'string' || !/^re_[A-Za-z0-9_-]+$/.test(key) || typeof fetchImpl !== 'function') throw Error('mail_configuration');
  return {
    async send(envelope, idempotencyKey) {
      if (typeof idempotencyKey !== 'string' || !/^article-comment\/[0-9a-f-]{36}$/.test(idempotencyKey)) throw Error('mail_configuration');
      try {
        const response = await fetchImpl('https://api.resend.com/emails', {
          method: 'POST', redirect: 'error', signal: AbortSignal.timeout(8000),
          headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
          body: JSON.stringify(envelope)
        });
        // Do not leak provider bodies, email content or API keys into errors/logs.
        if (!response.ok) throw Error('mail_unavailable');
        const result = await response.json();
        if (typeof result.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(result.id)) throw Error('mail_unavailable');
        return { id: result.id };
      } catch { throw Error('mail_unavailable'); }
    }
  };
}
module.exports = { createResendMailer };
