/*
* ### 1.2 Advanced Generics: Type-Safe Builder
*
* Implement a `QueryBuilder<T>` class that chains methods and infers
* the return type at each step:
* 
*   const result = new QueryBuilder<Job>()
*     .select('id', 'title', 'status')       // narrows to Pick<Job, 'id' | 'title' | 'status'>
*     .where('status', 'eq', 'completed')     // validates 'status' exists and value matches type
*     .orderBy('title', 'asc')                // validates 'title' exists in selected fields
*     .limit(10)
*     .build();                               // returns { query: string; params: unknown[] }
* 
* Requirements:
* - Each `.select()` call narrows the available fields for `.where()` and `.orderBy()`
* - `.where()` third argument must be assignable to the field's type
* - Use template literal types for the generated query string type
* - No `any` or `as unknown as X` casts
* 
*/

/* 
    Other operators: 'gt' | 'lt' | 'like' in case that I would like to validate the type of the value. 
    In this implementation I only use 'eq' and 'neq' for simplicity. 
*/

type Operator = 'eq' | 'neq';

type OrderDir = 'asc' | 'desc';

type WhereClause<K extends string, Op extends string> = `${K} ${Op} ?`;
type OrderClause<K extends string, Dir extends string> = `ORDER BY ${K} ${Dir}`;
type SelectClause<K extends string> = `SELECT ${K}`;
type LimitClause = `LIMIT ${number}`;

export class QueryBuilder<T, Selected extends keyof T = never, Query extends string = ''> {
    private _fields: string[] = [];
    private _where: string[] = [];
    private _order?: string;
    private _limit?: number;
    private _params: unknown[] = [];


    select<K extends keyof T>(...keys: K[]): QueryBuilder<T, Selected | K, Query | SelectClause<Extract<K, string>>> {
        const qb = new QueryBuilder<T, Selected | K, Query | SelectClause<Extract<K, string>>>();

        qb._fields = Array.from(new Set([...this._fields, ...keys.map(String)]));
        qb._where = this._where;
        qb._order = this._order;
        qb._limit = this._limit;
        qb._params = this._params;

        return qb;
    }


    where<K extends Selected>(field: K, op: Operator, value: T[K]): QueryBuilder<T, Selected, Query | WhereClause<Extract<K, string>, Operator>> {
        const qb = new QueryBuilder<T, Selected, Query | WhereClause<Extract<K, string>, Operator>>();

        qb._fields = this._fields;
        qb._where = [...this._where, `${String(field)} ${op} ?`];
        qb._order = this._order;
        qb._limit = this._limit;
        qb._params = [...this._params, value];

        return qb;
    }

    orderBy<K extends Selected>(field: K, direction: OrderDir): QueryBuilder<T, Selected, Query | OrderClause<Extract<K, string>, OrderDir>> {
        const qb = new QueryBuilder<T, Selected, Query | OrderClause<Extract<K, string>, OrderDir>>();

        qb._fields = this._fields;
        qb._where = this._where;
        qb._order = `ORDER BY ${String(field)} ${direction}`;
        qb._limit = this._limit;
        qb._params = this._params;

        return qb;
    }


    limit(n: number): QueryBuilder<T, Selected, Query | LimitClause> {
        const qb = new QueryBuilder<T, Selected, Query | LimitClause>();

        qb._fields = this._fields;
        qb._where = this._where;
        qb._order = this._order;
        qb._limit = n;
        qb._params = this._params;

        return qb;
    }

    build(): { query: Query; params: unknown[]; } {

        const select = this._fields.length ? `SELECT ${this._fields.join(', ')}` : 'SELECT *';

        const where = this._where.length ? ` WHERE ${this._where.join(' AND ')}` : '';

        const order = this._order ? ` ${this._order}` : '';

        const limit = this._limit ? ` LIMIT ${this._limit}` : '';

        return {
            query: `${select}${where}${order}${limit}` as Query,
            params: this._params
        };
    }
}
