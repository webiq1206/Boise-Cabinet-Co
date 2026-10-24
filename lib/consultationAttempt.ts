/** Mounted-form state only. Bodies and field values are never written to storage. */
export class ConsultationAttempt {
  private attempt: { id: string; input: string; body: string } | null = null;
  busy = false;
  constructor(private key: () => string | null, private clear: (id: string) => unknown) {}
  begin(input: unknown, payload: (id: string) => unknown) {
    if (this.busy) throw new Error("Your request is already sending.");
    const fingerprint = JSON.stringify(input);
    if (this.attempt && this.attempt.input !== fingerprint) {
      throw new Error("Your earlier request is still unconfirmed. Restore the original details to retry, or call or text us before sending changed details.");
    }
    if (!this.attempt) {
      const id = this.key();
      if (!id) throw new Error("We could not prepare a request reference. Please call or text us.");
      this.attempt = { id, input: fingerprint, body: JSON.stringify(payload(id)) };
    }
    this.busy = true;
    return this.attempt;
  }
  finish() { this.busy = false; }
  /** Only a pre-persistence validation rejection or a durable receipt releases identity. */
  confirmed() {
    if (this.attempt) this.clear(this.attempt.id);
    this.attempt = null;
  }
}
