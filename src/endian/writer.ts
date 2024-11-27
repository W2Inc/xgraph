import { EndianType } from "./meta";

export abstract class BaseEndianWriter {
	protected position: number = 0;
	protected buffer: Buffer = Buffer.alloc(1024);
	private endianess: EndianType = EndianType.LITTLE;

	constructor(endianess: EndianType) {
		this.endianess = endianess;
	}

	protected writeBytes(data: Uint8Array): void {
		if (this.endianess === EndianType.LITTLE) {
			const end = this.position + data.byteLength;
			this.buffer.fill(data, this.position, end);
			this.position += end;
		}
	}

	protected writeCString(value: string): void {}

	protected writePadding(alignment: number): void {
		const alignedPosition =
			(this.position + (alignment - 1)) & ~(alignment - 1);
		this.buffer.fill(0x0, this.position, alignedPosition);
	}

	protected writeBool(value: boolean): void {
		this.buffer.writeUInt8(value ? 1 : 0, this.position);
	}

	protected writeInt16(
		value: number,
		endian: EndianType = EndianType.LITTLE
	): void {

	}

	protected writeUInt16(
		value: number,
		endian: EndianType = EndianType.LITTLE
	): void {
		this.view.setUint16(
			this.advancePosition(2),
			value,
			endian === EndianType.LITTLE
		);
	}

	protected writeInt32(
		value: number,
		endian: EndianType = EndianType.LITTLE
	): void {
		this.view.setInt32(
			this.advancePosition(4),
			value,
			endian === EndianType.LITTLE
		);
	}

	protected writeUInt32(
		value: number,
		endian: EndianType = EndianType.LITTLE
	): void {
		this.view.setUint32(
			this.advancePosition(4),
			value,
			endian === EndianType.LITTLE
		);
	}

	protected writeLong(
		value: bigint,
		endian: EndianType = EndianType.LITTLE
	): void {
		this.view.setBigInt64(
			this.advancePosition(8),
			value,
			endian === EndianType.LITTLE
		);
	}

	protected writeULong(
		value: bigint,
		endian: EndianType = EndianType.LITTLE
	): void {
		this.view.setBigUint64(
			this.advancePosition(8),
			value,
			endian === EndianType.LITTLE
		);
	}

	protected writeFloat(
		value: number,
		endian: EndianType = EndianType.LITTLE
	): void {
		this.view.setFloat32(
			this.advancePosition(4),
			value,
			endian === EndianType.LITTLE
		);
	}

	protected writeDouble(
		value: number,
		endian: EndianType = EndianType.LITTLE
	): void {
		this.view.setFloat64(
			this.advancePosition(8),
			value,
			endian === EndianType.LITTLE
		);
	}

	protected writeGuid(
		value: string,
		endian: EndianType = EndianType.LITTLE
	): void {
		const hexGroups = value
			.split("-")
			.map((group) => group.match(/.{1,2}/g) || []);
		const bytes = new Uint8Array(
			hexGroups.flat().map((hex) => parseInt(hex, 16))
		);

		if (endian === EndianType.BIG) {
			// Reverse certain parts of the GUID for big-endian
			bytes.set(bytes.slice(0, 4).reverse(), 0);
			bytes.set(bytes.slice(4, 6).reverse(), 4);
			bytes.set(bytes.slice(6, 8).reverse(), 6);
		}

		bytes.forEach((byte) => {
			this.view.setUint8(this.advancePosition(1), byte);
		});
	}
}
