import { QueryBuilder } from './QueryBuilder';

type Job = {
    id: number;
    title: string;
    status: 'pending' | 'completed';
    priority: number;
};


const qb = new QueryBuilder<Job>();

const result = qb
    .select('id', 'title')
    .where('id', 'eq', 1)
    .orderBy('title', 'asc')
    .limit(10)
    .build();

console.log(result);


const qb2 = new QueryBuilder<Job>()
    .select('id', 'title');

// permitido
qb2.where('id', 'eq', 1);

// NO permitido (debe fallar en compile-time)
// @ts-expect-error
qb2.where('status', 'eq', 'pending');


const qb3 = new QueryBuilder<Job>()
    .select('id');

// tipo incorrecto
// @ts-expect-error
qb3.where('id', 'eq', 'string');

// correcto
qb3.where('id', 'eq', 123);

const qb4 = new QueryBuilder<Job>();

const result2 = qb4
    .select('id', 'title', 'status')
    .where('status', 'eq', 'pending')     // OK
    .orderBy('id', 'asc')                   //  OK (porque 'id' está en selected)
    .build();

// type inference en acción
type ResultType = typeof result2;
// ResultType = { query: "SELECT id, title, status WHERE status eq ? ORDER BY id asc", params: ["pending", "asc"] }

// si cambiamos el orden de los métodos:

const result3 = qb4
    // @ts-expect-error
    .where('status', 'eq', 'pending')     //   ERROR: 'status' NO está en selected
    .select('id', 'title', 'status');

const qb5 = new QueryBuilder<Job>()
    .select('id')
    .select('title');


// debería permitir ambos pero tu implementación hace intersección
qb5.where('id', 'eq', 1);     // puede fallar
qb5.where('title', 'eq', 'x'); // puede fallar