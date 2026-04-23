import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface ZentriDB extends DBSchema {
  progress: {
    key: string
    value: {
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
  }
  syncQueue: {
    key: string
    value: {
      action: 'upsert' | 'delete'
      table: string
      data: any
      createdAt: string
    }
  }
}

let db: IDBPDatabase<ZentriDB> | null = null

async function getDB() {
  if (!db) {
    db = await openDB<ZentriDB>('zentri', 1, {
      upgrade(db) {
        // Progress store
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'userId' })
          progressStore.createIndex('conceptId', 'conceptId')
          progressStore.createIndex('updatedAt', 'updatedAt')
        }

        // Sync queue
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'createdAt' })
        }
      },
    })
  }
  return db
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
  const key = `${userId}:${conceptId}`

  await db.put('progress', {
    userId,
    conceptId,
    curriculumId,
    masteryLevel,
    attempts,
    correct,
    lastPracticed: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    synced: false,
  })

  // Add to sync queue
  await db.add('syncQueue', {
    action: 'upsert',
    table: 'progress',
    data: { userId, conceptId, masteryLevel, attempts, correct },
    createdAt: new Date().toISOString(),
  })
}

export async function getProgress(userId: string, conceptId: string) {
  const db = await getDB()
  const allProgress = await db.getAll('progress')
  return allProgress.find(
    (p) => p.userId === userId && p.conceptId === conceptId
  )
}

export async function getAllProgress(userId: string) {
  const db = await getDB()
  const allProgress = await db.getAll('progress')
  return allProgress.filter((p) => p.userId === userId)
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
