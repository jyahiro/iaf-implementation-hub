export interface StorageProvider {
  write(path: string, contents: string): Promise<void>;
  read(path: string): Promise<string>;
  exists(path: string): Promise<boolean>;
}

export interface IdentityProvider {
  resolveUser(token: string): Promise<{userId: string; roles: string[]}>;
}

export interface QueueProvider {
  enqueue(topic: string, message: Record<string, unknown>): Promise<void>;
}

export interface ConnectorProvider {
  pull(config: Record<string, unknown>): Promise<{
    records: Record<string, unknown>[];
    metadata: Record<string, unknown>;
  }>;
}

export interface AuditProvider {
  append(event: {
    projectId: string;
    actorId: string;
    actorRole: string;
    eventType: string;
    payload: Record<string, unknown>;
  }): Promise<void>;
}
