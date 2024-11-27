import { Writer } from "./src/v1/writer";

const writer = new Writer(new ArrayBuffer(1000));

var data = writer.encode({
	id: 0,
	parentId: 0,
	goals: [],
	children: [
		{
			id: 1,
			parentId: 0,
			goals: [],
			children: [],
			isRoot: false,
		},
	],
	isRoot: true,
});

await Bun.write("./data.bin", data);
