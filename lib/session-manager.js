"use client";

import { supabaseBrowser } from "@/utils/supabase/client";

const SESSION_KEY = "futsal_hub_session";
const SESSION_BACKUP_KEY = "futsal_hub_session_backup";

export class SessionManager {
  // Store session in multiple places for iOS reliability
  static async persistSession(session) {
    try {
      const sessionData = JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: session.user,
        timestamp: Date.now(),
      });

      // 1. LocalStorage (primary)
      localStorage.setItem(SESSION_KEY, sessionData);

      // 2. IndexedDB (backup for iOS)
      const db = await this.openSessionDB();
      await this.saveToIndexedDB(db, sessionData);

      // 3. SessionStorage (for tab-specific backup)
      sessionStorage.setItem(SESSION_BACKUP_KEY, sessionData);

      return true;
    } catch (error) {
      console.error("Error persisting session:", error);
      return false;
    }
  }

  static async getSession() {
    try {
      // Try localStorage first
      let sessionData = localStorage.getItem(SESSION_KEY);

      // Fallback to IndexedDB
      if (!sessionData) {
        const db = await this.openSessionDB();
        sessionData = await this.getFromIndexedDB(db);
      }

      // Fallback to sessionStorage
      if (!sessionData) {
        sessionData = sessionStorage.getItem(SESSION_BACKUP_KEY);
      }

      if (sessionData) {
        const parsed = JSON.parse(sessionData);

        // Check if session is expired (with 5 min buffer)
        const expiresAt = parsed.expires_at * 1000;
        const now = Date.now();
        const buffer = 5 * 60 * 1000; // 5 minutes

        if (expiresAt - now < buffer) {
          // Session expired or about to expire, try refresh
          return await this.refreshSession(parsed.refresh_token);
        }

        return parsed;
      }

      return null;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  }

  static async refreshSession(refreshToken) {
    try {
      const { data, error } = await supabaseBrowser.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) throw error;

      if (data.session) {
        await this.persistSession(data.session);
        return data.session;
      }

      return null;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return null;
    }
  }

  static async clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_BACKUP_KEY);

      const db = await this.openSessionDB();
      await this.clearIndexedDB(db);
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  }

  static openSessionDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("futsal_hub_sessions", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("sessions")) {
          db.createObjectStore("sessions");
        }
      };
    });
  }

  static async saveToIndexedDB(db, data) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sessions"], "readwrite");
      const store = transaction.objectStore("sessions");
      const request = store.put(data, SESSION_KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  static async getFromIndexedDB(db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sessions"], "readonly");
      const store = transaction.objectStore("sessions");
      const request = store.get(SESSION_KEY);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  static async clearIndexedDB(db) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sessions"], "readwrite");
      const store = transaction.objectStore("sessions");
      const request = store.delete(SESSION_KEY);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
