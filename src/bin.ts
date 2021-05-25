
export var Buffer = require('buffer/').Buffer

export function delimitedBuffer(b: Buffer) {
    const newb = Buffer.alloc(b.length + 4)
    newb.writeUInt32LE(b.length)
    b.copy(newb, 4)
    return newb;
}

export function readDelimited(b_in: Buffer, offset: number) {
    const length = b_in.readUInt32LE(offset)
    const payload = b_in.slice(offset + 4, offset + 4 + length)
    return payload
}

export function delimitedStringBuffer(s:string){
    const conts = Buffer.from(s,"utf8")
    const out = Buffer.alloc(conts.length+5,0)
    out.writeUInt32LE(conts.length+1,0)
    conts.copy(out,4)
    return out
}