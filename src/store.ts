import { createD1Store } from "./d1-store";
import { createMockStore } from "./mock-store";
import type { AppStore } from "./types";

type AppEnv = Env & {
	DB?: D1Database;
};

let mockStore: AppStore | null = null;

type GetStoreOptions = {
	allowMock?: boolean;
};

export function getStore(env: AppEnv, options: GetStoreOptions = {}): AppStore {
	if (env.DB) {
		return createD1Store(env.DB);
	}
	if (!options.allowMock) {
		throw new Error("D1 binding is required for remote use.");
	}
	if (!mockStore) {
		mockStore = createMockStore();
	}
	return mockStore;
}
