/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 types/fleet.ts (TrackingRecord)
 *   B: Driverse_FE_Business   @ b96eda3 types/fleet.ts (TrackingRecord)
 * @status identical
 * @notes The record shape a tracker emits. Redeclared here because both apps keep it in a root-level
 *        `types/fleet.ts` the library cannot import. Identical in both apps; the open index signature
 *        is preserved, so app records with extra fields still satisfy it.
 */

export type TrackingRecord = {
	id: string;
	tracking_id: string;
	vehicle_id: string;
	plate_number: string;
	alias: string;
	make: string;
	latitude: number;
	longitude: number;
	speed: number;
	status: string;
	acc_status: string;
	tracker_oil: string;
	gps_time: string;
	hb_time: string;
	imei: string;
	direction: string;
	customer_name: string | null;
	[key: string]: any;
};
