export interface WaitlistEntry {
  id: string
  email: string
  createdAt: string
}

/** Implement this interface with a D1 adapter when persistence is enabled. */
export interface WaitlistRepository {
  add(email: string): Promise<WaitlistEntry>
}

/** Demo only: does not store data, even in memory. */
export class MockWaitlistRepository implements WaitlistRepository {
  async add(email: string): Promise<WaitlistEntry> {
    return { id: crypto.randomUUID(), email, createdAt: new Date().toISOString() }
  }
}

export class WaitlistService {
  constructor(private readonly repository: WaitlistRepository) {}

  join(email: string): Promise<WaitlistEntry> {
    return this.repository.add(email)
  }
}
