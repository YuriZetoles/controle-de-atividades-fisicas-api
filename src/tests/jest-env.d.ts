// Declarações de tipo globais para o ambiente Jest.
// Reusa os tipos de @jest/globals sem instalar @types/jest.
import type { jest as JestObject } from '@jest/globals';

declare global {
    const jest: typeof JestObject;
    const afterEach: typeof import('@jest/globals').afterEach;
    const beforeEach: typeof import('@jest/globals').beforeEach;
    const afterAll: typeof import('@jest/globals').afterAll;
    const beforeAll: typeof import('@jest/globals').beforeAll;
    const describe: typeof import('@jest/globals').describe;
    const it: typeof import('@jest/globals').it;
    const test: typeof import('@jest/globals').test;
    const expect: typeof import('@jest/globals').expect;
}
