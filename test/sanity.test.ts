import { expect, test } from "bun:test";
import { XGraphV1 } from "../src/v1";

test("Serializes", async () => {
	const writer = new XGraphV1.Writer();
	const node: XGraphV1.Node = {
		id: 0,
		parentId: 0,
		isRoot: true,
		goals: [],
		children: [
			{
				id: 1,
				parentId: 0,
				isRoot: false,
				goals: [],
				children: [],
			},
		],
	};

	writer.serialize(node);
});

test("Serializes then deserializes", async () => {
	const writer = new XGraphV1.Writer();
	const node: XGraphV1.Node = {
		id: 0,
		parentId: 0,
		isRoot: true,
		goals: [],
		children: [
			{
				id: 1,
				parentId: 0,
				isRoot: false,
				goals: [],
				children: [],
			},
		],
	};

	writer.serialize(node);
	const reader = new XGraphV1.Reader(writer.toArrayBuffer());
	expect(node === reader.root);
	reader.deserialize();
});
