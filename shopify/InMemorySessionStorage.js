// shopify/InMemorySessionStorage.js

class InMemorySessionStorage {
  constructor() {
    this.sessions = new Map();
  }

  async storeSession(session) {
    this.sessions.set(session.id, session);
    return true;
  }

  async loadSession(id) {
    return this.sessions.get(id) || undefined;
  }

  async deleteSession(id) {
    return this.sessions.delete(id);
  }

  async deleteSessions(ids) {
    ids.forEach((id) => this.sessions.delete(id));
    return true;
  }

  async findSessionsByShop(shop) {
    return [...this.sessions.values()].filter((session) => session.shop === shop);
  }

  async findSessionsByUser(userId) {
    return [...this.sessions.values()].filter((session) => session.userId === userId);
  }
}

module.exports = InMemorySessionStorage;