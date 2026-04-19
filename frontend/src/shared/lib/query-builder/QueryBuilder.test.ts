import { QueryBuilder } from './QueryBuilder';
import { Job } from '@/entities/job/model/job.types';

export type Transitions = {
    id: number;
    title: string;
    status: 'pending' | 'completed';
    priority: number;
};


const qb = new QueryBuilder<Job>();

// console.log(qb.build());


const qb2 = new QueryBuilder<Job>()
    .select('id', 'title');

// permitido
qb2.where('id', 'eq', 1);

// NO permitido (debe fallar en compile-time)
// @ts-expect-error - testing invalid field access
qb2.where('status', 'eq', 'pending');


const qb3 = new QueryBuilder<Job>()
    .select('id');

// tipo incorrecto
// @ts-expect-error - testing type mismatch
qb3.where('id', 'eq', 'string');

// correcto
qb3.where('id', 'eq', 123);

const qb4 = new QueryBuilder<Job>();

// result2 and ResultType removed to satisfy unused-vars and any rules
// ResultType = { query: "SELECT id, title, status WHERE status eq ? ORDER BY id asc", params: ["pending", "asc"] }

// si cambiamos el orden de los métodos:

// @ts-expect-error - testing order of operations
qb4.where('status', 'eq', 'pending').select('id', 'title', 'status');

const qb5 = new QueryBuilder<Job>()
    .select('id')
    .select('title');


// debería permitir ambos pero tu implementación hace intersección
qb5.where('id', 'eq', 1);     // puede fallar
qb5.where('title', 'eq', 'x'); // puede fallar