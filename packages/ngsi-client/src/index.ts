export type NgsiClientOptions = {
  brokerUrl: string;
  contextUrl: string;
};

export class NgsiClient {
  constructor(private opt: NgsiClientOptions) {}

  private linkHeader() {
    return `<${this.opt.contextUrl}>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`;
  }

  // ✅ GET/QUERY 用 Link（OK）
  private headersForGet(extra?: Record<string, string>) {
    return {
      Accept: "application/ld+json",
      Link: this.linkHeader(),
      ...extra,
    };
  }

  // ✅ POST/写入：不要 Link；Content-Type 保持 application/ld+json
  private headersForWrite(extra?: Record<string, string>) {
    return {
      Accept: "application/ld+json",
      "Content-Type": "application/ld+json",
      ...extra,
    };
  }

  async createEntity(entity: any): Promise<void> {
    // ✅ 写入时，把 context 内联进去（Orion-LD 接受）
    const payload = {
      "@context": [this.opt.contextUrl],
      ...entity,
    };

    const res = await fetch(`${this.opt.brokerUrl}/ngsi-ld/v1/entities`, {
      method: "POST",
      headers: this.headersForWrite(),
      body: JSON.stringify(payload),
    });

    if (res.status === 201) return;
    throw new Error(`createEntity failed: ${res.status} ${await res.text()}`);
  }

  async queryEntities(params: Record<string, string>): Promise<any> {
    const usp = new URLSearchParams(params);
    const res = await fetch(`${this.opt.brokerUrl}/ngsi-ld/v1/entities?${usp.toString()}`, {
      method: "GET",
      headers: this.headersForGet(),
    });

    if (!res.ok) throw new Error(`queryEntities failed: ${res.status} ${await res.text()}`);
    return res.json();
  }
}
