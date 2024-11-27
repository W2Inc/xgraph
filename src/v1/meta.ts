/** Different indetifying version of the XGraph */
export const C_VERSION = 0x22446688;
export const C_MAGIC = 0xB0B0BEBAFECA;
export const C_MAX_NODES = 4;
export const C_MAX_GOALS = 3;
export const C_MAX_DEPTH = 255;

/** Header layout of XGraph */
export interface XGraphHeader {
	version: typeof C_VERSION;
	magic: typeof C_MAGIC;
	nodeCount: number;
	goalCount: number;
}

export interface XGraphGoal {
	name: string;
	goalId: string; /** @type GUID */
}

export interface XGraphNode {
	id: number;
	parentId: number;
	isRoot: boolean;
	goals: XGraphGoal[];
	children: XGraphNode[]
}
