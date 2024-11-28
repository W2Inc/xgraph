// ============================================================================
// W2Inc, Amsterdam 2023-2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

import { createHash } from "crypto";
import { BaseEndianReader, BaseEndianWriter } from "../endian";

// ============================================================================

function computeChecksum(data: Uint8Array) {
	if (Bun !== undefined)
		return Buffer.from(Bun.MD5.hash(data).buffer).toString("base64");
	return createHash("md5").update(data).digest().toString("base64");
}

/** Version 1 of XGraph */
export namespace XGraphV1 {
	export const VERSION = 0x100;
	export const MAGIC = BigInt(0x48_50_41_52_47_58); // XGRAPH
	export const MAX_NODES = 4;
	export const MAX_GOALS = 3;
	export const MAX_DEPTH = 255;

	/** Header layout of XGraph */
	export interface Header {
		version: typeof VERSION;
		magic: typeof MAGIC;
		nodeCount: number;
		goalCount: number;
	}

	export interface Goal {
		goalGUID: string;
	}

	export interface Node {
		id: number;
		parentId: number;
		goals: Goal[];
		children: Node[];
	}

	// ============================================================================
	// Reader
	// ============================================================================

	/** A XGraph v1 Deserializer */
	export class Reader extends BaseEndianReader {
		public version: number = 0;
		public magic: BigInt = BigInt(0);
		public root?: Node;

		constructor(data: ArrayBuffer) {
			super(data);
			this.validateChecksum();
		}

		public deserialize(): void {
			// Header
			this.version = this.readInt32();
			if (this.version !== XGraphV1.VERSION) throw new Error("Invalid XGraphV1 Version");

			// Verify magic
			this.readAlignment(16);
			let magic = this.readULong();
			if (magic !== XGraphV1.MAGIC) throw new Error("Invalid XGraphV1 Magic");

			// Total count for validation
			let nodeCount = this.readInt16();
			let goalCount = this.readInt16();
			if (nodeCount > MAX_NODES) throw new Error(`Invalid XGraphV1 node count of: ${nodeCount}`);
			if (goalCount > MAX_GOALS) throw new Error(`Invalid XGraphV1 goal count of: ${goalCount}`);
			this.readAlignment(16);

			// Body
			this.readNode(0);
		}

		private validateChecksum(): void {
			if (this.buffer.length < 24) throw new Error("Data is invalid, unable to compute checksum");

			// NOTE(W2): +1 NULL BYTE FROM CSTRING
			this.position = this.buffer.byteLength - (24 + 1);
			const expectedChecksum = computeChecksum(
				new Uint8Array(this.buffer.subarray(0, this.position))
			);

			const receivedChecksum = this.readCString();
			if (receivedChecksum !== expectedChecksum) {
				throw new Error(`Bad Checksum. Expected: ${expectedChecksum}, Got: ${receivedChecksum}`);
			}

			// Back to start to read the data
			this.position = 0;
		}

		private readNode(depth: number, parent?: Node) {
			if (depth > MAX_DEPTH) throw new Error(`Graph with a depth of: {depth} is too large`);

			let id = this.readInt16();
			let parentId = this.readInt16();
			let goalCount = this.readInt16();
			let childrenCount = this.readInt16();

			if (goalCount > MAX_GOALS) throw new Error(`Node can't have more than ${MAX_GOALS} goals`);
			if (childrenCount > MAX_NODES)
				throw new Error(`Node can't have more than ${MAX_NODES} children`);

			let node: Node = {
				id,
				parentId,
				goals: [],
				children: [],
			};

			for (let i = 0; i < goalCount; i++) {
				node.goals.push({
					// name: this.readCString(),
					goalGUID: this.readGuid(),
					// state: this.readUInt32(),
					// description: this.readCString(),
				});
			}

			// First node indicates root, always.
			if (depth === 0) {
				this.root = node;
			} else {
				parent?.children.push(node);
			}

			this.readAlignment(8);
			for (let i = 0; i < childrenCount; i++) {
				this.readNode(depth + 1, node);
			}
		}
	}

	// ============================================================================
	// Writer
	// ============================================================================

	/** A XGraph v1 Serializer */
	export class Writer extends BaseEndianWriter {
		public serialize(node: Node) {
			// Header
			this.writeInt32(VERSION);
			this.writePadding(16);
			this.writeULong(BigInt(MAGIC));
			this.writeUInt16(this.getTotalNodeCount(node));
			this.writeUInt16(this.getTotalGoalCount(node));
			this.writePadding(16);

			// Body
			this.writeNode(-1, node, 0);

			// Checksum
			this.finalizeChecksum();
		}

		private writeNode(parentId: number, node: Node, depth: number) {
			if (depth > MAX_DEPTH) throw new Error(`Graph with a depth of: ${depth} is too large!`);

			this.writeInt16(node.id); // Current Id
			this.writeInt16(parentId); // Parent Id

			if (node.goals.length > MAX_GOALS)
				throw new Error(`Node can't have more than ${MAX_GOALS} goals.`);
			if (node.children.length > MAX_NODES)
				throw new Error(`Node can't have more than ${MAX_NODES} children.`);

			this.writeInt16(node.goals.length); // This node is made up N Goals
			this.writeInt16(node.children.length); // This node is made up N Children nodes
			for (const goal of node.goals) {
				// this.writeCString(goal.name);
				this.writeGuid(goal.goalGUID);
				// this.writeUInt32(goal.state);
				// this.writeCString(goal.description);
			}

			this.writePadding(8);
			for (const child of node.children) {
				this.writeNode(node.id, child, depth++);
			}
		}

		private finalizeChecksum(): void {
			var data = this.buffer.subarray(0, this.position);
			this.writeCString(computeChecksum(new Uint8Array(data)));
		}

		private getTotalNodeCount(node: Node): number {
			return 1 + node.children.reduce((sum, child) => sum + this.getTotalNodeCount(child), 0);
		}

		private getTotalGoalCount(node: Node): number {
			return (
				node.goals.length +
				node.children.reduce((sum, child) => sum + this.getTotalGoalCount(child), 0)
			);
		}
	}
}
