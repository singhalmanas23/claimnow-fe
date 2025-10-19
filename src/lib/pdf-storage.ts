// PDF Storage using IndexedDB for large file support
// Unlike sessionStorage (5-10MB limit), IndexedDB can store much larger files

const DB_NAME = 'ClaimNowPDFStorage';
const STORE_NAME = 'pdfs';
const DB_VERSION = 1;

interface PDFData {
  id: string;
  file: File;
  dataUrl: string;
  timestamp: number;
}

class PDFStorageManager {
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB
  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('PDFStorage: Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('PDFStorage: IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('PDFStorage: Object store created');
        }
      };
    });
  }

  // Store PDF data
  async storePDF(id: string, file: File, dataUrl: string): Promise<void> {
    await this.init();
    
    if (!this.db) {
      throw new Error('PDFStorage: Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const pdfData: PDFData = {
        id,
        file,
        dataUrl,
        timestamp: Date.now()
      };

      const request = store.put(pdfData);

      request.onsuccess = () => {
        console.log('PDFStorage: PDF stored successfully with ID:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('PDFStorage: Failed to store PDF:', request.error);
        reject(request.error);
      };
    });
  }

  // Retrieve PDF data
  async getPDF(id: string): Promise<PDFData | null> {
    await this.init();
    
    if (!this.db) {
      console.error('PDFStorage: Database not initialized');
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          console.log('PDFStorage: PDF retrieved successfully:', id);
          resolve(request.result as PDFData);
        } else {
          console.warn('PDFStorage: PDF not found:', id);
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('PDFStorage: Failed to retrieve PDF:', request.error);
        reject(request.error);
      };
    });
  }

  // Get all PDF IDs
  async getAllPDFIds(): Promise<string[]> {
    await this.init();
    
    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        console.error('PDFStorage: Failed to get PDF IDs:', request.error);
        reject(request.error);
      };
    });
  }

  // Clean up old PDFs (keep only the most recent N)
  async cleanupOldPDFs(keepCount: number = 3): Promise<void> {
    await this.init();
    
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Sort by timestamp descending

      let count = 0;
      const toDelete: string[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor) {
          count++;
          if (count > keepCount) {
            toDelete.push(cursor.value.id);
          }
          cursor.continue();
        } else {
          // Delete old PDFs
          toDelete.forEach(id => {
            store.delete(id);
            console.log('PDFStorage: Deleted old PDF:', id);
          });
          resolve();
        }
      };

      request.onerror = () => {
        console.error('PDFStorage: Failed to cleanup old PDFs:', request.error);
        reject(request.error);
      };
    });
  }

  // Delete specific PDF
  async deletePDF(id: string): Promise<void> {
    await this.init();
    
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('PDFStorage: PDF deleted successfully:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('PDFStorage: Failed to delete PDF:', request.error);
        reject(request.error);
      };
    });
  }

  // Clear all PDFs
  async clearAll(): Promise<void> {
    await this.init();
    
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('PDFStorage: All PDFs cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('PDFStorage: Failed to clear PDFs:', request.error);
        reject(request.error);
      };
    });
  }
}

// Export singleton instance
export const pdfStorage = new PDFStorageManager();
