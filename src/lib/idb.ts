/// <reference types="vite/client" />
import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface ProgressRecord {
  key: string // composite: `${userId}:${conceptId}`
  userId: string
  conceptId: string
  curriculumId: string
  masteryLevel: number
  attempts: number
  correct: number
  lastPracticed: string
  updatedAt: string
  synced?: boolean
}

interface SyncQueueRecord {
  createdAt: string
  action: 'upsert' | 'delete'
  table: string
  data: Record<string, unknown>
}

interface ZentriDB extends DBSchema {
  progress: {
    key: string
    value: ProgressRecord
    indexes: { byUser: string; byUpdatedAt: string }
  }
  syncQueue: {
    key: string
    value: SyncQueueRecord
  }
}

let dbPromise: Promise<IDBPDatabase<ZentriDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ZentriDB>('zentri', 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('progress')) {
          const store = database.createObjectStore('progress', { keyPath: 'key' })
          store.createIndex('byUser', 'userId')
          store.createIndex('byUpdatedAt', 'updatedAt')
        }
        if (!database.objectStoreNames.contains('syncQueue')) {
          database.createObjectStore('syncQueue', { keyPath: 'createdAt' })
        }
      },
    })
  }
  return dbPromise
}

export async function saveProgress(
  userId: string,
  conceptId: string,
  curriculumId: string,
  masteryLevel: number,
  correct: number,
  attempts: number
) {
  const db = await getDB()
  const compositeKey = `${userId}:${conceptId}`

  const record: ProgressRecord = {
    key: compositeKey,
    userId,
    conceptId,
    curriculumId,
    masteryLevel,
    attempts,
    correct,
    lastPracticed: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    synced: false,
  }

  await db.put('progress', record)

  const queueRecord: SyncQueueRecord = {
    action: 'upsert',
    table: 'progress',
    data: { userId, conceptId, masteryLevel, attempts, correct },
    createdAt: new Date().toISOString() + Math.random(),
  }
  await db.add('syncQueue', queueRecord)
}

export async function getProgress(userId: string, conceptId: string) {
  const db = await getDB()
  return db.get('progress', `${userId}:${conceptId}`)
}

export async function getAllProgress(userId: string) {
  const db = await getDB()
  const index = db.transaction('progress').store.index('byUser')
  return index.getAll(userId)
}

export async function getSyncQueue() {
  const db = await getDB()
  return db.getAll('syncQueue')
}

export async function clearSyncQueue() {
  const db = await getDB()
  const tx = db.transaction('syncQueue', 'readwrite')
  await tx.objectStore('syncQueue').clear()
  await tx.done
}

export async function removeFromSyncQueue(createdAt: string) {
  const db = await getDB()
  await db.delete('syncQueue', createdAt)
}
