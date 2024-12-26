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
					goalGUID: "d0fd9301-e04c-e67d-865e-a075db322e13",
				},
				{
					goalGUID: "d0fd9301-e04c-e67d-865e-a075db322e13",
				},
				{
					goalGUID: "d0fd9301-e04c-e67d-865e-a075db322e13",
				}
			],
			children: [],
		},
	],
};

test("Serializes", async () => {
	const writer = new XGraphV1.Writer();
	writer.serialize(node);
	// await Bun.write("./data.bin", writer.toArrayBuffer());
});

test("Serializes then deserializes", () => {
	const writer = new XGraphV1.Writer();
	writer.serialize(node);

	const reader = new XGraphV1.Reader(writer.toArrayBuffer());
	reader.deserialize();
	expect(reader.root).toBeDefined()
	expect(node).toEqual(reader.root!);
});
