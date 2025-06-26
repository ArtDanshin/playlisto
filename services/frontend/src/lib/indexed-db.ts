import type { ParsedPlaylist } from "./m3u-parser"

const DB_NAME = "playlisto-db"
const DB_VERSION = 1
const PLAYLISTS_STORE = "playlists"

export class PlaylistDB {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Создаем хранилище для плейлистов
        if (!db.objectStoreNames.contains(PLAYLISTS_STORE)) {
          const store = db.createObjectStore(PLAYLISTS_STORE, { keyPath: "id", autoIncrement: true })
          store.createIndex("name", "name", { unique: false })
        }
      }
    })
  }

  async addPlaylist(playlist: ParsedPlaylist): Promise<number> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PLAYLISTS_STORE], "readwrite")
      const store = transaction.objectStore(PLAYLISTS_STORE)
      
      const request = store.add({
        ...playlist,
        createdAt: new Date().toISOString()
      })

      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllPlaylists(): Promise<ParsedPlaylist[]> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PLAYLISTS_STORE], "readonly")
      const store = transaction.objectStore(PLAYLISTS_STORE)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deletePlaylist(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PLAYLISTS_STORE], "readwrite")
      const store = transaction.objectStore(PLAYLISTS_STORE)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async updatePlaylist(playlist: ParsedPlaylist): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")
    if (!playlist.id) throw new Error("Playlist must have an ID to update")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PLAYLISTS_STORE], "readwrite")
      const store = transaction.objectStore(PLAYLISTS_STORE)
      const request = store.put({
        ...playlist,
        updatedAt: new Date().toISOString()
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// Создаем глобальный экземпляр базы данных
export const playlistDB = new PlaylistDB() 