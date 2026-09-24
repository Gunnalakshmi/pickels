import { Pool } from 'pg';
import { config } from '../config/env';
import fs from 'fs';
import path from 'path';

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

class DatabaseService {
  private pgPool: Pool | null = null;
  public isPostgresConnected: boolean = false;
  private memoryStore: Map<string, any[]> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.initTables();
  }

  private initTables() {
    const tableNames = [
      'users',
      'admins',
      'addresses',
      'categories',
      'seller_information',
      'products',
      'product_variants',
      'product_images',
      'inventory',
      'compliance_information',
      'cart',
      'cart_items',
      'wishlist',
      'wishlist_items',
      'coupons',
      'coupon_usage',
      'orders',
      'order_items',
      'payments',
      'reviews',
      'notifications',
      'banners',
      'referrals',
      'refunds',
      'support_tickets',
      'delivery_settings',
      'serviceable_pincodes',
      'tax_settings',
    ];
    for (const tbl of tableNames) {
      if (!this.memoryStore.has(tbl)) {
        this.memoryStore.set(tbl, []);
      }
    }
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    if (config.databaseUrl && config.databaseUrl.startsWith('postgres')) {
      try {
        this.pgPool = new Pool({
          connectionString: config.databaseUrl,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
          connectionTimeoutMillis: 3000,
        });

        // Test connection
        const client = await this.pgPool.connect();
        client.release();
        this.isPostgresConnected = true;
        console.log('✅ Connected to PostgreSQL Database.');

        // Run schema.sql
        const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
        if (fs.existsSync(schemaPath)) {
          const sql = fs.readFileSync(schemaPath, 'utf-8');
          await this.pgPool.query(sql);
          console.log('✅ PostgreSQL Schema initialized.');
        }
      } catch (err: any) {
        console.warn('⚠️ PostgreSQL connection failed or unavailable:', err.message);
        console.log('⚡ Switching to PickleMart Zero-Config Embedded Engine.');
        this.isPostgresConnected = false;
        this.pgPool = null;
      }
    } else {
      console.log('⚡ Using PickleMart Zero-Config Embedded Engine.');
    }

    this.initialized = true;
  }

  public getStore(tableName: string): any[] {
    if (!this.memoryStore.has(tableName)) {
      this.memoryStore.set(tableName, []);
    }
    return this.memoryStore.get(tableName)!;
  }

  public setStore(tableName: string, data: any[]) {
    this.memoryStore.set(tableName, data);
  }

  public async query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    if (this.isPostgresConnected && this.pgPool) {
      try {
        const res = await this.pgPool.query(text, params);
        return { rows: res.rows as T[], rowCount: res.rowCount || 0 };
      } catch (err) {
        console.error('PostgreSQL Query Error:', err);
        throw err;
      }
    }

    // Embedded SQL-like query processor for development
    return this.processEmbeddedQuery<T>(text, params);
  }

  private processEmbeddedQuery<T>(text: string, params: any[] = []): QueryResult<T> {
    const trimmed = text.trim();
    const upper = trimmed.toUpperCase();

    // SELECT
    if (upper.startsWith('SELECT')) {
      const fromMatch = trimmed.match(/FROM\s+([a-zA-Z0-9_]+)/i);
      if (!fromMatch) return { rows: [], rowCount: 0 };
      const tableName = fromMatch[1].toLowerCase();
      let records = [...this.getStore(tableName)];

      // Parameter replacement for simple WHERE clauses
      // e.g. WHERE id = $1 or WHERE email = $1 or WHERE is_active = true
      if (/WHERE/i.test(trimmed)) {
        const whereClause = trimmed.split(/WHERE/i)[1].split(/ORDER BY|LIMIT|GROUP BY/i)[0].trim();
        records = records.filter(item => this.matchCondition(item, whereClause, params));
      }

      // ORDER BY
      if (/ORDER BY/i.test(trimmed)) {
        const orderPart = trimmed.split(/ORDER BY/i)[1].split(/LIMIT/i)[0].trim();
        const [field, dir] = orderPart.split(/\s+/);
        const isDesc = dir && dir.toUpperCase() === 'DESC';
        const cleanField = field.replace(/[^a-zA-Z0-9_]/g, '');
        records.sort((a, b) => {
          const valA = a[cleanField];
          const valB = b[cleanField];
          if (valA === valB) return 0;
          if (valA > valB) return isDesc ? -1 : 1;
          return isDesc ? 1 : -1;
        });
      }

      // LIMIT
      if (/LIMIT/i.test(trimmed)) {
        const limitPart = trimmed.split(/LIMIT/i)[1].trim();
        const limitVal = parseInt(limitPart, 10);
        if (!isNaN(limitVal)) {
          records = records.slice(0, limitVal);
        }
      }

      return { rows: records as T[], rowCount: records.length };
    }

    // INSERT INTO table (c1, c2) VALUES ($1, $2)
    if (upper.startsWith('INSERT INTO')) {
      const match = trimmed.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)/i);
      if (match) {
        const tableName = match[1].toLowerCase();
        const columns = match[2].split(',').map(c => c.trim().toLowerCase());
        const store = this.getStore(tableName);

        const newRecord: any = {};
        columns.forEach((col, idx) => {
          newRecord[col] = params[idx];
        });

        if (!newRecord.created_at) newRecord.created_at = new Date().toISOString();
        if (!newRecord.updated_at) newRecord.updated_at = new Date().toISOString();

        store.push(newRecord);
        return { rows: [newRecord as T], rowCount: 1 };
      }
    }

    // UPDATE table SET c1 = $1, c2 = $2 WHERE id = $3
    if (upper.startsWith('UPDATE')) {
      const tableMatch = trimmed.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET/i);
      if (tableMatch) {
        const tableName = tableMatch[1].toLowerCase();
        const store = this.getStore(tableName);
        let updatedCount = 0;

        // Extract WHERE
        let targetRecords = store;
        if (/WHERE/i.test(trimmed)) {
          const whereClause = trimmed.split(/WHERE/i)[1].trim();
          targetRecords = store.filter(item => this.matchCondition(item, whereClause, params));
        }

        targetRecords.forEach(record => {
          // parse SET parts e.g. status = $1, updated_at = $2
          const setClause = trimmed.split(/SET/i)[1].split(/WHERE/i)[0].trim();
          const setStatements = setClause.split(',');
          setStatements.forEach(stmt => {
            const [colRaw, valRaw] = stmt.split('=').map(s => s.trim());
            const col = colRaw.toLowerCase();
            const paramMatch = valRaw.match(/\$(\d+)/);
            if (paramMatch) {
              const paramIdx = parseInt(paramMatch[1], 10) - 1;
              record[col] = params[paramIdx];
            } else if (valRaw.toUpperCase() === 'CURRENT_TIMESTAMP' || valRaw.toUpperCase() === 'NOW()') {
              record[col] = new Date().toISOString();
            } else if (valRaw.startsWith("'") && valRaw.endsWith("'")) {
              record[col] = valRaw.slice(1, -1);
            } else if (!isNaN(Number(valRaw))) {
              record[col] = Number(valRaw);
            }
          });
          record.updated_at = new Date().toISOString();
          updatedCount++;
        });

        return { rows: targetRecords as T[], rowCount: updatedCount };
      }
    }

    // DELETE FROM table WHERE id = $1
    if (upper.startsWith('DELETE FROM')) {
      const match = trimmed.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)/i);
      if (match) {
        const tableName = match[1].toLowerCase();
        const store = this.getStore(tableName);
        let initialLen = store.length;
        if (/WHERE/i.test(trimmed)) {
          const whereClause = trimmed.split(/WHERE/i)[1].trim();
          const kept = store.filter(item => !this.matchCondition(item, whereClause, params));
          this.setStore(tableName, kept);
          return { rows: [], rowCount: initialLen - kept.length };
        } else {
          this.setStore(tableName, []);
          return { rows: [], rowCount: initialLen };
        }
      }
    }

    return { rows: [], rowCount: 0 };
  }

  private matchCondition(item: any, whereClause: string, params: any[]): boolean {
    const andParts = whereClause.split(/\s+AND\s+/i);
    return andParts.every(part => {
      const match = part.match(/([a-zA-Z0-9_]+)\s*(=|!=|<>|>|<|>=|<=|ILIKE|LIKE)\s*(\$?\d+|'[^']*'|true|false|null)/i);
      if (!match) return true;
      const [, col, op, val] = match;
      const cleanCol = col.toLowerCase();
      let compareVal: any;

      if (val.startsWith('$')) {
        const pIndex = parseInt(val.slice(1), 10) - 1;
        compareVal = params[pIndex];
      } else if (val.startsWith("'") && val.endsWith("'")) {
        compareVal = val.slice(1, -1);
      } else if (val.toLowerCase() === 'true') {
        compareVal = true;
      } else if (val.toLowerCase() === 'false') {
        compareVal = false;
      } else if (val.toLowerCase() === 'null') {
        compareVal = null;
      } else {
        compareVal = Number(val);
      }

      const itemVal = item[cleanCol];
      if (op === '=' || op.toUpperCase() === 'IS') {
        return itemVal == compareVal;
      }
      if (op === '!=' || op === '<>') {
        return itemVal != compareVal;
      }
      if (op.toUpperCase() === 'LIKE' || op.toUpperCase() === 'ILIKE') {
        if (typeof itemVal !== 'string' || typeof compareVal !== 'string') return false;
        const regexStr = compareVal.replace(/%/g, '.*');
        return new RegExp(regexStr, 'i').test(itemVal);
      }
      if (op === '>') return itemVal > compareVal;
      if (op === '<') return itemVal < compareVal;
      if (op === '>=') return itemVal >= compareVal;
      if (op === '<=') return itemVal <= compareVal;

      return true;
    });
  }
}

export const db = new DatabaseService();
