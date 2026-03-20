import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { server } from "./mocks";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.stubGlobal("fetch", globalThis.fetch);
