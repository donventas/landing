'use strict';
// Loopback QA adapter only. Single-process transactions, atomic file replacement.
// Not a production/distributed database and never used by the deployed API.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { Fault, DAY } = require('./service.cjs');
class LocalStore {
  constructor(file = null) { this.file = file; this.tail = Promise.resolve(); this.state = null; }
  transaction(work) {
    const result = this.tail.then(async () => {
      if (!this.state) {
        try { this.state = JSON.parse(await fs.readFile(this.file, 'utf8')); }
        catch (e) { if (this.file && e.code !== 'ENOENT') throw e; this.state = { messages: [], outbox: [], intents: [], buckets: {}, events: [] }; }
      }
      const next = structuredClone(this.state); const value = await work(next);
      if (this.file && JSON.stringify(next) !== JSON.stringify(this.state)) {
        await fs.mkdir(path.dirname(this.file), { recursive: true });
        const temp = this.file + '.tmp';
        const handle = await fs.open(temp, 'w', 0o600);
        try { await handle.writeFile(JSON.stringify(next)); await handle.sync(); } finally { await handle.close(); }
        await fs.rename(temp, this.file);
      }
      this.state = next; return value;
    });
    this.tail = result.catch(() => {}); return result;
  }
  receive(record, keys, time, optIn) {
    return this.transaction(s => {
      const existing = s.messages.find(m => m.submission_key === record.submission_key);
      if (existing) { if (existing.payload_hash !== record.payload_hash) throw new Fault(409, 'key_reused'); return { duplicate: true }; }
      for (const [key, bucket] of Object.entries(s.buckets)) if (bucket.until <= time) delete s.buckets[key];
      for (const [key, max, window] of [['ip:' + keys.ip, 5, 900000], ['email:' + keys.email, 10, DAY], ['global', 200, DAY]]) {
        const b = s.buckets[key] || { count: 0, until: time + window };
        if (b.count >= max) throw new Fault(429, 'rate_limited'); b.count++; s.buckets[key] = b;
      }
      s.messages.push(record);
      s.outbox.push({ id: record.id, state: 'pending', attempts: 0, next_at: time, first_attempt_at: null, lease: null });
      if (record.newsletter) s.intents.push({ message_id: record.id, email: record.email, state: 'pending_confirmation', requested_at: time, ...optIn });
      return { duplicate: false };
    });
  }
  claim(time) {
    return this.transaction(s => {
      const job = s.outbox.find(j => (['pending', 'retry'].includes(j.state) && j.next_at <= time) || (j.state === 'sending' && j.lease_until <= time));
      if (!job) return null;
      const message = s.messages.find(m => m.id === job.id);
      if (!message || message.expires_at <= time) { job.state = 'expired'; return null; }
      if (job.first_attempt_at !== null && time - job.first_attempt_at >= DAY) { job.state = 'delivery_unknown'; return null; }
      job.first_attempt_at ??= time; job.attempts++; job.state = 'sending'; job.lease = crypto.randomUUID(); job.lease_until = time + 600000;
      return { ...structuredClone(job), message: structuredClone(message) };
    });
  }
  finish(id, lease, patch) { return this.transaction(s => { const j = s.outbox.find(j => j.id === id); if (j?.lease === lease && j.state === 'sending') Object.assign(j, patch, { lease: null }); }); }
  event(event) {
    return this.transaction(s => {
      if (s.events.some(e => e.id === event.id)) return false;
      const job = s.outbox.find(j => j.provider_id === event.provider_id); if (!job) return false;
      s.events.push({ ...event });
      const terminal = ['bounced', 'complained', 'failed'];
      if ((!job.event_at || event.at >= job.event_at) && !(terminal.includes(job.state) && !terminal.includes(event.state))) Object.assign(job, { state: event.state, event_at: event.at });
      return true;
    });
  }
  purge(time) {
    return this.transaction(s => {
      const expired = new Set(s.messages.filter(m => m.expires_at <= time).map(m => m.id));
      const providerIds = new Set(s.outbox.filter(j => expired.has(j.id)).map(j => j.provider_id));
      s.messages = s.messages.filter(m => !expired.has(m.id)); s.outbox = s.outbox.filter(j => !expired.has(j.id));
      s.intents = s.intents.filter(i => i.expires_at > time && !expired.has(i.message_id));
      s.events = s.events.filter(e => !providerIds.has(e.provider_id) && e.at > time - 30 * DAY);
      for (const [key, b] of Object.entries(s.buckets)) if (b.until <= time) delete s.buckets[key];
      return expired.size;
    });
  }
  snapshot() { return this.transaction(s => structuredClone(s)); }
}
module.exports = { LocalStore };
