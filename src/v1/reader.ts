import type { XGraphHeader } from "./meta";
import { BaseEndianReader } from "../endian/reader";

export class Reader extends BaseEndianReader {
	public header?: XGraphHeader;

	public readData() {
		this.readInt32();
	}
}
