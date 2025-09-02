import sqlite3 from 'sqlite3';
export class DatabaseService {
    static db;
    static async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database('./descope-store.db', (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                this.createTables().then(resolve).catch(reject);
            });
        });
    }
    static async createTables() {
        const queries = [
            `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        handle TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        vendor TEXT NOT NULL,
        type TEXT NOT NULL,
        tags TEXT,
        price REAL NOT NULL,
        compare_at_price REAL,
        sku TEXT UNIQUE NOT NULL,
        inventory_qty INTEGER DEFAULT 0,
        image_url TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
            `CREATE TABLE IF NOT EXISTS product_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        option1_name TEXT,
        option1_value TEXT,
        price REAL NOT NULL,
        compare_at_price REAL,
        inventory_qty INTEGER DEFAULT 0,
        weight REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`,
            `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_email TEXT NOT NULL,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
            `CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        variant_id INTEGER,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (variant_id) REFERENCES product_variants (id)
      )`
        ];
        for (const query of queries) {
            await this.run(query);
        }
    }
    static async run(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(query, params, function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this);
            });
        });
    }
    static async get(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(query, params, (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
    static async all(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }
    static async close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}
//# sourceMappingURL=database-service.js.map