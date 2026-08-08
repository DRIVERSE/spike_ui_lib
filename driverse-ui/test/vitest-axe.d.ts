// vitest-axe 0.1 still augments the legacy global `Vi` namespace, which Vitest 3 no longer reads.
// Re-declare its matcher against the `vitest` module so `expect(...).toHaveNoViolations()` type-checks.
import "vitest";

declare module "vitest" {
	interface Assertion<T = any> {
		toHaveNoViolations(): T;
	}
	interface AsymmetricMatchersContaining {
		toHaveNoViolations(): void;
	}
}
