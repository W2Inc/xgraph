import { BaseEndianWriter } from "../endian/writer";
import {
	C_MAGIC,
	C_MAX_DEPTH,
	C_MAX_GOALS,
	C_MAX_NODES,
	C_VERSION,
	type XGraphHeader,
	type XGraphNode,
} from "./meta";

export class Writer extends BaseEndianWriter {
	/**
	 * Encode the Graph into binary data
	 * @param node The graph to encode
	 */
	public encode(node: XGraphNode): ArrayBuffer {
		this.writeHeader({
			version: C_VERSION,
			magic: C_MAGIC,
			nodeCount: this.getTotalNodeCount(node),
			goalCount: this.getTotalGoalCount(node),
		});

		this.writeNode(node.id, node, 0);
		for (const child of node.children) {
			this.writeNode(node.id, child, 1);
		}

		return this.buffer;
	}

	private writeNode(id: number, node: XGraphNode, depth: number) {
		if (depth > C_MAX_DEPTH)
			throw new Error(`Graph with a depth of: ${depth} is too large!`);

		this.writeInt16(id);
		this.writeInt16(node.parentId);
		this.writeBool(node.parentId == 0);

		if (node.goals.length > C_MAX_GOALS)
			throw new Error(`Node can't have more than ${C_MAX_GOALS} goals.`);
		if (node.children.length > C_MAX_NODES)
			throw new Error(`Node can't have more than ${C_MAX_NODES} children.`);

		this.writeInt16(node.goals.length);
		this.writeInt16(node.children.length);

		for (const goal of node.goals) {
			this.writeCString(goal.name);
			this.writeGuid(goal.goalId);
		}

		this.writePadding(8);
		// for (const child of node.children) {
		// 	this.writeNode(node.id, child, depth++);
		// }
	}

	private writeHeader(header: XGraphHeader) {
		this.writeInt32(header.version);
		this.writePadding(16);
		this.writeULong(BigInt(header.magic));
		this.writeInt16(header.nodeCount);
		this.writeInt16(header.goalCount);
		this.writePadding(16);
	}

	private getTotalNodeCount(node: XGraphNode): number {
		return (
			1 +
			node.children.reduce(
				(sum, child) => sum + this.getTotalNodeCount(child),
				0
			)
		);
	}

	private getTotalGoalCount(node: XGraphNode): number {
		return (
			node.goals.length +
			node.children.reduce(
				(sum, child) => sum + this.getTotalGoalCount(child),
				0
			)
		);
	}
}
