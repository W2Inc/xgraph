// ============================================================================
// W2Inc, Amsterdam 2023-2024, All Rights Reserved.
// See README in the root project for more information.
// ============================================================================

/** LE Reader */
export class BaseEndianReader {
	protected position = 0;
	protected buffer: Buffer;

	/**
	 * Initialize the reader with a buffer.
	 * @param buffer The buffer to read from.
	 */
	constructor(buffer: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>) {
		this.buffer = Buffer.from(buffer);
	}

	/**
	 * Read a boolean encoded as a UInt8.
	 * @returns The boolean value.
	 */
	protected readBool(): boolean {
		this.ensureAvailable(1);
		const value = this.buffer.readUInt8(this.position);
		this.position += 1;
		return value !== 0;
	}

	/**
	 * Read a 16-bit signed integer.
	 * @returns The number value.
	 */
	protected readInt16(): number {
		this.ensureAvailable(2);
		const value = this.buffer.readInt16LE(this.position);
		this.position += 2;
		return value;
	}

	/**
	 * Read a 16-bit unsigned integer.
	 * @returns The number value.
	 */
	protected readUInt16(): number {
		this.ensureAvailable(2);
		const value = this.buffer.readUInt16LE(this.position);
		this.position += 2;
		return value;
	}

	/**
	 * Read a 32-bit signed integer.
	 * @returns The number value.
	 */
	protected readInt32(): number {
		this.ensureAvailable(4);
		const value = this.buffer.readInt32LE(this.position);
		this.position += 4;
		return value;
	}

	/**
	 * Read a 32-bit unsigned integer.
	 * @returns The number value.
	 */
	protected readUInt32(): number {
		this.ensureAvailable(4);
		const value = this.buffer.readUInt32LE(this.position);
		this.position += 4;
		return value;
	}

	/**
	 * Read a 64-bit signed integer.
	 * @returns The bigint value.
	 */
	protected readLong(): bigint {
		this.ensureAvailable(8);
		const value = this.buffer.readBigInt64LE(this.position);
		this.position += 8;
		return value;
	}

	/**
	 * Read a 64-bit unsigned integer.
	 * @returns The bigint value.
	 */
	protected readULong(): bigint {
		this.ensureAvailable(8);
		const value = this.buffer.readBigUInt64LE(this.position);
		this.position += 8;
		return value;
	}

	/**
	 * Read a 32-bit floating-point number.
	 * @returns The number value.
	 */
	protected readFloat(): number {
		this.ensureAvailable(4);
		const value = this.buffer.readFloatLE(this.position);
		this.position += 4;
		return value;
	}

	/**
	 * Read a 64-bit double-precision number.
	 * @returns The number value.
	 */
	protected readDouble(): number {
		this.ensureAvailable(8);
		const value = this.buffer.readDoubleLE(this.position);
		this.position += 8;
		return value;
	}

	/**
	 * Read a UTF-8 null-terminated string.
	 * @returns The string value.
	 */
	protected readCString(): string {
		const start = this.position;
		while (this.position < this.buffer.length && this.buffer[this.position] !== 0) {
			this.position++;
		}
		if (this.position >= this.buffer.length) {
			throw new Error("CString terminator not found.");
		}
		// Read string bytes and skip the null terminator
		const value = this.buffer.toString("utf8", start, this.position);
		this.position++;
		return value;
	}

	/**
	 * Read a GUID (UUID) as a string.
	 * @returns The GUID string.
	 */
	protected readGuid(): string {
		this.ensureAvailable(16);
		const bytes = this.buffer.subarray(this.position, this.position + 16);
		this.position += 16;

		// Convert bytes to GUID string format
		const guid = [
			bytes.toString("hex", 0, 4),
			bytes.toString("hex", 4, 6),
			bytes.toString("hex", 6, 8),
			bytes.toString("hex", 8, 10),
			bytes.toString("hex", 10, 16),
		].join("-");
		return guid;
	}

	/**
	 * Skip a specified number of bytes.
	 * @param byteCount The number of bytes to skip.
	 */
	protected readAlignment(alignment: number): void {
		this.position = (this.position + (alignment - 1)) & -alignment;
	}

	/**
	 * Ensure that a specified number of bytes is available to read.
	 * @param size The required number of bytes.
	 */
	private ensureAvailable(size: number): void {
		if (this.position + size > this.buffer.length) {
			throw new Error("Attempt to read beyond buffer length.");
		}
	}
}
