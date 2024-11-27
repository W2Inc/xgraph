import { EndianType } from "./meta";

export abstract class BaseEndianReader {
	private position: number;
	private view: DataView;
	protected buffer: ArrayBuffer;

	constructor(buffer: ArrayBuffer) {
		this.buffer = buffer;
		this.view = new DataView(buffer);
		this.position = 0;
	}

	private advancePosition(bytes: number): number {
		const currentPosition = this.position;
		this.position += bytes;
		if (this.position > this.buffer.byteLength)
			throw new Error("Attempt to read beyond buffer length");
		return currentPosition;
	}

	protected readCString(): string | null {
		const bytes: number[] = [];
		while (this.position < this.buffer.byteLength) {
			const byte = this.view.getUint8(this.advancePosition(1));
			if (byte === 0) break; // Null terminator
			bytes.push(byte);
		}
		return new TextDecoder().decode(new Uint8Array(bytes));
	}

	protected readAlignment(alignment: number): void {
		const alignedPosition =
			(this.position + (alignment - 1)) & ~(alignment - 1);
		this.position = alignedPosition;
	}

	protected readBool(): boolean {
		return this.view.getUint8(this.advancePosition(1)) !== 0;
	}

	protected readInt16(endian: EndianType = EndianType.LITTLE): number {
		return this.view.getInt16(
			this.advancePosition(2),
			endian === EndianType.LITTLE
		);
	}

	protected readUInt16(endian: EndianType = EndianType.LITTLE): number {
		return this.view.getUint16(
			this.advancePosition(2),
			endian === EndianType.LITTLE
		);
	}

	protected readInt32(endian: EndianType = EndianType.LITTLE): number {
		return this.view.getInt32(
			this.advancePosition(4),
			endian === EndianType.LITTLE
		);
	}

	protected readUInt32(endian: EndianType = EndianType.LITTLE): number {
		return this.view.getUint32(
			this.advancePosition(4),
			endian === EndianType.LITTLE
		);
	}

	protected readLong(endian: EndianType = EndianType.LITTLE): bigint {
		return this.view.getBigInt64(
			this.advancePosition(8),
			endian === EndianType.LITTLE
		);
	}

	protected readULong(endian: EndianType = EndianType.LITTLE): bigint {
		return this.view.getBigUint64(
			this.advancePosition(8),
			endian === EndianType.LITTLE
		);
	}

	protected readFloat(endian: EndianType = EndianType.LITTLE): number {
		return this.view.getFloat32(
			this.advancePosition(4),
			endian === EndianType.LITTLE
		);
	}

	protected readDouble(endian: EndianType = EndianType.LITTLE): number {
		return this.view.getFloat64(
			this.advancePosition(8),
			endian === EndianType.LITTLE
		);
	}

	protected readGuid(endian: EndianType = EndianType.LITTLE): string {
		const bytes = new Uint8Array(16);
		for (let i = 0; i < 16; i++) {
			bytes[i] = this.view.getUint8(this.advancePosition(1));
		}
		if (endian === EndianType.BIG) {
			// Swap byte order for big-endian
			bytes.set(bytes.slice(0, 4).reverse(), 0);
			bytes.set(bytes.slice(4, 6).reverse(), 4);
			bytes.set(bytes.slice(6, 8).reverse(), 6);
		}
		// Convert to GUID string format
		return [
			this.toHex(bytes.slice(0, 4)),
			this.toHex(bytes.slice(4, 6)),
			this.toHex(bytes.slice(6, 8)),
			this.toHex(bytes.slice(8, 10)),
			this.toHex(bytes.slice(10, 16)),
		].join("-");
	}

	private toHex(bytes: Uint8Array): string {
		return Array.from(bytes)
			.map((byte) => byte.toString(16).padStart(2, "0"))
			.join("");
	}
}
