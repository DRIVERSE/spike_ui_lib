/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 types/entity.ts (ChipVariant)
 *   B: Driverse_FE_Business   @ b96eda3 types/entity.ts (ChipVariant)
 * @status merged
 * @notes Both apps declare ChipVariant inside a 600-line app entity file that the library cannot depend
 *        on, so the union is redeclared here — the chip is the only consumer. The union is A ∪ B:
 *        A contributes the three telematics states (moving/parked/offline), B contributes the document
 *        workflow states (upcoming, overdue, rejected, approved, reported, under_review, OCR_REVIEW,
 *        PROCESSING, CONFIRMATION_PENDING, IN_PROGRESS, CONFIRMED, READY, FAILED, CANCELLED).
 */

export type ChipVariant =
	// shared by both apps
	| "default"
	| "success"
	| "danger"
	| "warning"
	| "active"
	| "ACTIVE"
	| "INACTIVE"
	| "completed"
	| "COMPLETED"
	| "cancelled"
	| "suspended"
	| "reassigned"
	| "EXPIRING"
	| "expiring"
	| "COMPLIANT"
	| "compliant"
	| "EXPIRED"
	| "expired"
	| "EXEMPT"
	| "exempt"
	| "MISSING_PAYMENT"
	| "MISSING"
	| "missing"
	| "PAID"
	| "NO_PAYMENT"
	| "IMMEDIATE_ACTION"
	| "NEEDS_ATTENTION"
	// Autocredit only — telematics movement states
	| "moving"
	| "parked"
	| "offline"
	// Business only — document and payment workflow states
	| "CANCELLED"
	| "upcoming"
	| "UPCOMING"
	| "overdue"
	| "OVERDUE"
	| "OCR_REVIEW"
	| "CONFIRMED"
	| "FAILED"
	| "READY"
	| "PROCESSING"
	| "CONFIRMATION_PENDING"
	| "IN_PROGRESS"
	| "in_progress"
	| "REJECTED"
	| "rejected"
	| "APPROVED"
	| "approved"
	| "REPORTED"
	| "reported"
	| "UNDER_REVIEW"
	| "under_review";
