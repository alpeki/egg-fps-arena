import { quantizeFloat, dequantizeFloat } from './math.js';
import type { InputCmd } from './types.js';
export class BinaryProtocol {
  static encodeInput(input: InputCmd): Uint8Array {
    const buffer = new ArrayBuffer(12);
    const view = new DataView(buffer);
    let offset = 0;

    view.setUint16(offset, input.seq, true);
    offset += 2;

    view.setUint32(offset, input.timestamp, true);
    offset += 4;

    view.setInt8(offset, Math.round(input.moveX * 127));
    offset += 1;
    view.setInt8(offset, Math.round(input.moveY * 127));
    offset += 1;

    const angleQuantized = quantizeFloat(input.aimAngle, 0, Math.PI * 2, 10);
    view.setUint16(offset, angleQuantized, true);
    offset += 2;

    const flags = (input.fire ? 1 : 0) | (input.dash ? 2 : 0);
    view.setUint8(offset, flags);

    return new Uint8Array(buffer);
  }

  static decodeInput(buffer: Uint8Array): InputCmd {
    const view = new DataView(buffer.buffer);
    let offset = 0;

    const seq = view.getUint16(offset, true);
    offset += 2;

    const timestamp = view.getUint32(offset, true);
    offset += 4;

    const moveX = view.getInt8(offset) / 127;
    offset += 1;
    const moveY = view.getInt8(offset) / 127;
    offset += 1;

    const angleQuantized = view.getUint16(offset, true);
    offset += 2;
    const aimAngle = dequantizeFloat(angleQuantized, 0, Math.PI * 2, 10);

    const flags = view.getUint8(offset);
    offset += 1;

    return {
      seq,
      timestamp,
      moveX,
      moveY,
      aimAngle,
      fire: (flags & 1) === 1,
      dash: (flags & 2) === 2,
    };
  }
}
