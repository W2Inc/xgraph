// ============================================================================
// W2Inc, Amsterdam 2023-2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

/** LE Writer */
export class BaseEndianWriter {
	protected position = 0;
	protected buffer = Buffer.alloc(1024);

	constructor() {}

	/**
	 * Write a an array of bytes.
	 * @param data The data to write.
	 */
	protected writeBytes(data: Uint8Array): void {
		this.ensureCapacity(data.byteLength);
		this.buffer.set(data, this.position);
		this.position += data.byteLength;
	}

	/**
	 * Writes a JS UTF-16 Encoded string into a UTF-8 CString.
	 * @param value The string to write.
	 */
	protected writeCString(value: string): void {
		const utf8Bytes = new TextEncoder().encode(value);
		const cString = new Uint8Array(utf8Bytes.length + 1);

		cString.set(utf8Bytes);
		cString[utf8Bytes.length] = 0; // Null terminator
		this.writeBytes(cString);
	}

	/**
	 * Ensure an alignment of n bytes
	 * @param alignment The amount of bytes for ensuring the alignment.
	 */
	protected writePadding(alignment: number): void {
		const alignedPosition =
			(this.position + (alignment - 1)) & ~(alignment - 1);
		const padding = alignedPosition - this.position;
		if (padding > 0) {
			this.ensureCapacity(padding);
			this.buffer.fill(0x00, this.position, alignedPosition);
			this.position = alignedPosition;
		}
	}

	/**
	 * Write a boolean, encoded as a UInt8 byte.
	 * @param value The boolean
	 */
	protected writeBool(value: boolean): void {
		this.ensureCapacity(1);
		this.buffer.writeUInt8(value ? 1 : 0, this.position);
		this.position += 1;
	}

	/**
	 * Write a 16-bit signed integer.
	 * @param value The number to write.
	 */
	protected writeInt16(value: number): void {
		this.ensureCapacity(2);
		this.buffer.writeInt16LE(value, this.position);
		this.position += 2;
	}

	/**
	 * Write a 16-bit unsigned integer.
	 * @param value The number to write.
	 */
	protected writeUInt16(value: number): void {
		this.ensureCapacity(2);
		this.buffer.writeUInt16LE(value, this.position);
		this.position += 2;
	}

	/**
	 * Write a 32-bit signed integer.
	 * @param value The number to write.
	 */
	protected writeInt32(value: number): void {
		this.ensureCapacity(4);
		this.buffer.writeInt32LE(value, this.position);
		this.position += 4;
	}

	/**
	 * Write a 32-bit unsigned integer.
	 * @param value The number to write.
	 */
	protected writeUInt32(value: number): void {
		this.ensureCapacity(4);
		this.buffer.writeUInt32LE(value, this.position);
		this.position += 4;
	}

	/**
	 * Write a 64-bit signed integer.
	 * @param value The bigint to write.
	 */
	protected writeLong(value: bigint): void {
		this.ensureCapacity(8);
		this.buffer.writeBigInt64LE(value, this.position);
		this.position += 8;
	}

	/**
	 * Write a 64-bit unsigned integer.
	 * @param value The bigint to write.
	 */
	protected writeULong(value: bigint): void {
		this.ensureCapacity(8);
		this.buffer.writeBigUInt64LE(value, this.position);
		this.position += 8;
	}

	/**
	 * Write a 32-bit float.
	 * @param value The number to write.
	 */
	protected writeFloat(value: number): void {
		this.ensureCapacity(4);
		this.buffer.writeFloatLE(value, this.position);
		this.position += 4;
	}

	/**
	 * Write a 64-bit double.
	 * @param value The number to write.
	 */
	protected writeDouble(value: number): void {
		this.ensureCapacity(8);
		this.buffer.writeDoubleLE(value, this.position);
		this.position += 8;
	}

	/**
	 * Write a GUID (UUID) as a 16-byte array.
	 * @param value The GUID string to write.
	 */
	protected writeGuid(value: string): void {
		// Convert GUID to byte array
		const hexGroups = value
			.split("-")
			.map((group) => group.match(/.{1,2}/g) || []);
		const bytes = new Uint8Array(
			hexGroups.flat().map((hex) => parseInt(hex, 16))
		);

		// Write the 16-byte GUID
		this.writeBytes(bytes);
	}

	/**
	 * Ensure the buffer has enough capacity for the requested size.
	 * Grows the buffer if needed.
	 * @param size The required additional size.
	 */
	private ensureCapacity(size: number): void {
		const requiredSize = this.position + size;
		if (requiredSize > this.buffer.length) {
			const newSize = Math.max(this.buffer.length * 2, requiredSize);
			const newBuffer = Buffer.alloc(newSize);
			// @ts-ignore No idea why this errors, works on node and bun.
			this.buffer = Buffer.concat([this.buffer, newBuffer]);
		}
	}

	/**
	 * Get the actual written portion of the buffer as a new Buffer instance.
	 */
	public toArrayBuffer() {
		return new Uint8Array(this.buffer.subarray(0, this.position)).buffer
	}
}
