// IndexedDB wrapper for offline data storage
const DB_NAME = "futsal_hub_offline";
const DB_VERSION = 2;

const STORES = {
  MATCHES: "matches",
  PLAYERS: "players",
  STATS: "stats",
  IMAGES: "images",
  SETTINGS: "settings",
  SYNC_QUEUE: "sync_queue",
};

class OfflineDB {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains(STORES.MATCHES)) {
          const matchStore = db.createObjectStore(STORES.MATCHES, { keyPath: "id" });
          matchStore.createIndex("date", "date", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.PLAYERS)) {
          const playerStore = db.createObjectStore(STORES.PLAYERS, { keyPath: "id" });
          playerStore.createIndex("full_name", "full_name", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.STATS)) {
          db.createObjectStore(STORES.STATS, { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains(STORES.IMAGES)) {
          const imageStore = db.createObjectStore(STORES.IMAGES, { keyPath: "id" });
          imageStore.createIndex("created_at", "created_at", { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: "key" });
        }

        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: "id" });
          syncStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  async set(storeName, data) {
    if (!this.db) await this.init();
    const transaction = this.db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    return store.put(data);
  }

  async setMany(storeName, dataArray) {
    if (!this.db) await this.init();
    const transaction = this.db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    return Promise.all(dataArray.map(item => store.put(item)));
  }

  async get(storeName, key) {
    if (!this.db) await this.init();
    const transaction = this.db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    if (!this.db) await this.init();
    const transaction = this.db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    if (!this.db) await this.init();
    const transaction = this.db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    return store.delete(key);
  }

  async clear(storeName) {
    if (!this.db) await this.init();
    const transaction = this.db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    return store.clear();
  }
}

export const offlineDB = new OfflineDB();
export { STORES };
