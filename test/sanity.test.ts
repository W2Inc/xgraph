// ============================================================================
// W2Inc, Amsterdam 2023-2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { expect, test } from "bun:test";
import { XGraphV1 } from "../src/v1/index";

// ============================================================================

const node: XGraphV1.Node = {
	id: 0,
	parentId: -1,
	goals: [],
	children: [
		{
			id: 1,
			parentId: 0,
			goals: [],
			children: [],
		},
		{
			id: 2,
			parentId: 0,
			goals: [
				{
					goalGUID: "502721f4-48cd-4379-821f-df0f0ba089ae",
					description: "Goal about yoru mom",
					state: XGraphV1.GoalState.Completed,
					name: "Leaflet 1"
				},
				{
					goalGUID: "502721f4-48cd-4379-821f-df0f0ba089ae",
					description: "iqwdjoiqwjdiojqwd",
					state: XGraphV1.GoalState.NotStarted,
					name: "Leaflet 2"
				},
				{
					goalGUID: "502721f4-48cd-4379-821f-df0f0ba089ae",
					description: "weqffewqfweqfweqfwe",
					state: XGraphV1.GoalState.Failed,
					name: "Leaflet 3"
				}
			],
			children: [],
		},
	],
};

test("Serializes", async () => {
	const writer = new XGraphV1.Writer();
	writer.serialize(node);
});

test("Serializes then deserializes", () => {
	const writer = new XGraphV1.Writer();
	writer.serialize(node);

	const reader = new XGraphV1.Reader(writer.toArrayBuffer());
	reader.deserialize();

	expect(reader.root).toBeDefined()
	expect(node).toEqual(reader.root!);
});
