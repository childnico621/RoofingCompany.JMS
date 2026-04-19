
type Handler<E> = (payload: E) => void;

export function createTypedEventEmitter<Events extends Record<string, unknown>>() {

    const handlers: {
        [K in keyof Events]?: Array<(payload: Events[K]) => void>
    } = {};

    return {
        on<K extends keyof Events>(event: K, handler: Handler<Events[K]>) {
            if (!handlers[event]) {
                handlers[event] = [];
            }
            handlers[event]?.push(handler);
        },
        off<K extends keyof Events>(event: K, handler: Handler<Events[K]>) {
            const eventHandlers = handlers[event];
            if (!eventHandlers) return;

            handlers[event] = eventHandlers.filter(h => h !== handler);
        },
        emit<K extends keyof Events>(event: K, payload: Events[K]) {
            const eventHandlers = handlers[event];
            if (!eventHandlers) return;

            for (const handler of eventHandlers) {
                handler(payload);
            }
        }
    };
}