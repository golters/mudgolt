import { DatabaseSync } from "node:sqlite"
import type { SQLInputValue } from "node:sqlite"

type Parameter = SQLInputValue | boolean | undefined

// Retain the service API and SQL while using Node's synchronous SQLite engine.
export class Database {
  private connection: DatabaseSync

  constructor(filename: string) {
    this.connection = new DatabaseSync(filename, {
      enableForeignKeyConstraints: false,
      enableDoubleQuotedStringLiterals: true,
      timeout: 1000,
    })
  }

  private parameters(values: readonly Parameter[]) {
    return Object.fromEntries(values.map((value, index) => [
      `$${index + 1}`,
      typeof value === "boolean" ? Number(value) : value ?? null,
    ]))
  }

  async exec(sql: string): Promise<void> {
    this.connection.exec(sql)
  }

  // Node 26.9 supports statement disposal; @types/node does not yet declare it.
  async run(sql: string, values: readonly Parameter[] = []) {
    using statement = this.connection.prepare(sql) as ReturnType<DatabaseSync["prepare"]> & Disposable
    const result = statement.run(this.parameters(values))
    return { lastID: Number(result.lastInsertRowid), changes: Number(result.changes) }
  }

  async get<T = any>(sql: string, values: readonly Parameter[] = []): Promise<T | undefined> {
    using statement = this.connection.prepare(sql) as ReturnType<DatabaseSync["prepare"]> & Disposable
    const row = statement.get(this.parameters(values))
    return row === undefined ? undefined : { ...row } as T
  }

  async all<T = Record<string, unknown>[]>(sql: string, values: readonly Parameter[] = []): Promise<T> {
    using statement = this.connection.prepare(sql) as ReturnType<DatabaseSync["prepare"]> & Disposable
    return statement.all(this.parameters(values)).map(row => ({ ...row })) as T
  }

  async close(): Promise<void> {
    this.connection.close()
  }
}
