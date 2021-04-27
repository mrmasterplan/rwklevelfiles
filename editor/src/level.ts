import bitwise from "bitwise";


const level_defaults ={
    // header : Buffer.from('000000000500000026000000ffffffff','hex'),
    header_1 : Buffer.from('0000000005000000','hex'),
    header_2 : Buffer.from('ffffffff','hex'),

    footer_head: Buffer.from('0100000000010000000000000000000000000000000000000000000000006666663f0000000000000000b800bc000000000000000000000000000000','hex'),
    footer: Buffer.from('0100000000010000000000000000000000000000000000000000000000006666663f0000000000000000b800bc0000000000000000000000000000000000003f0000003f010000000001000000000100000000','hex')
}

function delimitedBuffer(b:Buffer){
    const newb = Buffer.alloc(b.length+4)
    newb.writeUInt32LE(b.length)
    b.copy(newb,4)
    return newb;
}
function readDelimited(b_in:Buffer,offset:number){
    const length = b_in.readUInt32LE(offset)
    const payload = b_in.slice(offset+4,offset+4+length)
    return payload
}

class Tags {
    length = 19;
    buf:Buffer;
    tag_names_BE=[
         "kids",
         "easy",
         "hard",
         "insane",
         "tricky",
         "silly",
         "arcade",
         "prank",
         "unfair",
         "evil",
         "rpg",
         "tiny",
         "huge",
         "glitchy",
    ]
    tag_names=[
        "prank",//7
        "arcade",//6
        "silly",//5
        "tricky",//4
        "insane",//3
        "hard",//2
        "easy",//1
        "kids",//0
        undefined,//15
        undefined,//14
        "glitchy",//13
        "huge",//12
        "tiny",//11
        "rpg",//10
        "evil",//9
        "unfair",//8
    ]
    tag_index:{[tag:string]:number}

    constructor() {
        this.buf = Buffer.alloc(this.length,0)
        this.tag_index={}
        for(let i =0; i<this.tag_names.length; i++){
            const tag_name = this.tag_names[i]
            if(typeof tag_name == 'string')
                {
                    this.tag_index[tag_name]=i
                }
        }
    }

    deserialize(buf:Buffer,offset:number){
        this.buf = buf.slice(offset,offset+19)
        offset+=19
        return offset
    }

    set_tag(tag:string){

        const index = this.tag_index[tag]
        if(typeof index == 'undefined') throw Error(`Given tag "${tag}" is unknown.`)

        const bits = bitwise.buffer.read(this.buf,0,this.tag_names.length)
        bits[index]=1
        bitwise.buffer.modify(this.buf,bits)
        // console.log(this.buf)
    }

    serialize(){
        return this.buf
    }

}

class Grid {
    size_x: number
    size_y: number
    celldata:number[][]
    mapgrid:number[][]
    constructor(x:number=10,y:number=7,default_cell:number=0) {
        this.size_x=0
        this.size_y=0
        this.celldata=[]
        this.mapgrid=[]
        this.setSize(x,y,default_cell)
    }

    getCellID(x:number,y:number){
        return (y * this.size_x + x);
    }

    serialize() {
        const buf = Buffer.alloc(this.size_x * this.size_y * (4 + 1) + 8)
        let offset = 0

        buf.writeUInt32LE(this.size_x,offset)
        offset+=4

        buf.writeUInt32LE(this.size_y,offset)
        offset+=4

        //write main grid
        for (let j = 0; j < this.size_y; j++) {
            for (let i = 0; i < this.size_x; i++) {
                buf.writeUInt32LE(normalizedTileValue(this.celldata[j][i]),offset)
                offset+=4
            }
        }
        // write map grid
        for (let j = 0; j < this.size_y; j++) {
            for (let i = 0; i < this.size_x; i++) {
                buf.writeUInt8(this.mapgrid[j][i],offset)
                offset+=1
            }
        }


        return delimitedBuffer(buf)
    }

    deserialize(buf:Buffer,offset:number){
        const total_size = buf.readUInt32LE(offset)
        offset+=4
        const size_x = buf.readUInt32LE(offset)
        offset+=4
        const size_y = buf.readUInt32LE(offset)
        offset+=4
        if(total_size != size_x*size_y*5+8) throw new Error("Grid size mismatch detected.")

        this.setSize(size_x,size_y,0)
        //write main grid
        for (let j = 0; j < this.size_y; j++) {
            for (let i = 0; i < this.size_x; i++) {
                this.setCell(i,j,normalizedTileValue(buf.readUInt32LE(offset)))
                offset+=4
            }
        }
        // write post-grid
        for (let j = 0; j < this.size_y; j++) {
            for (let i = 0; i < this.size_x; i++) {
                this.setMapCell(i,j,buf.readUInt8(offset))
                offset+=1
            }
        }
        return offset
    }

    setSize(x:number=10,y:number=7,default_cell:number=0) {
        this.size_x=x
        this.size_y=y
        this.celldata=Array.from(Array(y),row=>Array.from(Array(x),cell=>default_cell))
        // console.log(this.celldata)
        this.mapgrid=Array.from(Array(y), row=>Array.from(Array(x), cell=>0))
    }

    setCell(x:number,y:number,val:number){
        if(x>=this.size_x || y>=this.size_y || x<0 || y<0) throw new Error('invalid grid index')

        this.celldata[y][x]=normalizedTileValue(val)
    }
    getCell(x:number,y:number){
        if(x>=this.size_x || y>=this.size_y || x<0 || y<0) return 0;

        return normalizedTileValue(this.celldata[y][x])
    }
    setMapCell(x:number,y:number,val:number){
        if(x>=this.size_x || y>=this.size_y || x<0 || y<0) throw new Error('invalid grid index')

        this.mapgrid[y][x]=val
    }

    getMapCell(x:number,y:number){
        if(x>=this.size_x || y>=this.size_y || x<0 || y<0) return 0;

        return this.mapgrid[y][x]
    }


}

class CalloutList{
    callouts:{x:number,y:number,text:string}[]
    constructor() {
        this.callouts=[]
    }
    addCallout(x:number,y:number,text:string){
        this.callouts.push({x,y,text})
    }

    serialize(){
        const parts:Buffer[] = []
        for(let call of this.callouts){
            // console.log(`serializing ${call.text},${call.x},${call.y}`)
            const textbuf = Buffer.from(call.text,'utf-8')
            const buf = Buffer.alloc(textbuf.length+13,0)
            buf.writeUInt32LE(call.x,0)
            buf.writeUInt32LE(call.y,4)
            buf.writeUInt32LE(textbuf.length+1,8)
            textbuf.copy(buf,12)
            // the terminating zero of the string is already present from the zeroed buffer.
            parts.push(buf)
        }

        const combined_callout_buf = Buffer.concat(parts)
        // console.log(combined_callout_buf)

        const n_callouts = Buffer.alloc(4)
        n_callouts.writeUInt32LE(this.callouts.length)

        return delimitedBuffer(Buffer.concat([n_callouts,combined_callout_buf]))
    }

    deserialize(buf:Buffer, offset:number){
        this.callouts=[]
        const final_offset = offset+4+buf.readUInt32LE(offset); // we can check when we are done
        offset+=4

        const n_callouts = buf.readUInt32LE(offset)
        offset+=4
        for(let i=0;i<n_callouts;i++){
            const x = buf.readUInt32LE(offset)
            offset+=4
            const y = buf.readUInt32LE(offset)
            offset+=4
            const n = buf.readUInt32LE(offset)
            offset+=4
            const text = buf.slice(offset,offset+n).toString('utf-8').trim()
            offset+=n
            this.callouts.push({x,y,text})
        }
        if(offset!=final_offset){
            throw new Error("Deserialization problem in callout section. Unexpected final size.")
        }
        return offset
    }
}

class floatXY {
    x:number
    y:number
    constructor(x:number,y:number) {
        [this.x,this.y] = [x,y]
    }
    serialize(){
        const buf = Buffer.alloc(8)
        buf.writeFloatLE(this.x,0)
        buf.writeFloatLE(this.y,4)
        return delimitedBuffer(buf)
    }
    deserialize(buf:Buffer,offset:number){
        const should_be_8 = buf.readUInt32LE(offset)
        offset+=4
        this.x = buf.readFloatLE(offset)
        offset+=4
        this.y = buf.readFloatLE(offset)
        offset+=4
        return offset
    }
}



class Footer {
    header:Buffer
    belt_speed:number
    music:string[]

    constructor() {
        this.header = level_defaults.footer_head
        this.belt_speed = 0.6
        this.music=["","",""]
    }


    serialize(){
        const parts:Buffer[]=[]
        parts.push(level_defaults.footer_head)
        const beltbuf = Buffer.alloc(4,0)
        beltbuf.writeFloatLE(this.belt_speed)
        parts.push(beltbuf)
        parts.push(beltbuf) // no idea why it is doubled.
        for(let i=0;i<3;i++){
            parts.push(delimitedBuffer(Buffer.from(this.music[i]+"\x00",'utf-8')))
        }
        return delimitedBuffer(Buffer.concat(parts))
    }
    deserialize(buf:Buffer,offset:number){
        const final_offset = offset+4+ buf.readUInt32LE(offset) //check at the end
        offset+=4
        this.header = Buffer.from(buf.slice(offset,offset+level_defaults.footer_head.length))
        offset+=level_defaults.footer_head.length
        this.belt_speed = buf.readFloatLE(offset)
        offset += 8 //the value is doubled for some reason

        for(let i=0;i<3;i++){
            const length = buf.readUInt32LE(offset)
            offset+=4
            this.music[i] = buf.slice(offset,offset+length-1).toString('utf-8')
            offset+=length
        }

        if(offset!=final_offset) throw new Error("Final offset in footer is not as expected.")
        return offset
    }
}

class Header {

    // buf:Buffer
    name:string
    constructor() {
        this.name = ''
        // this.buf = Buffer.from(level_defaults.header)
    }

    // setBuf(buf:Buffer){
    //     this.buf = Buffer.from(buf)
    // }

    serialize(){
        const namebuf = Buffer.from(this.name,'utf-8')
        const parts1:Buffer[]=[]
        parts1.push(level_defaults.header_1)
        parts1.push(new ExpectValue(4+level_defaults.header_1.length+4+level_defaults.header_2.length+4+namebuf.length).serialize())
        parts1.push(level_defaults.header_2)

        const name_part = Buffer.alloc(5+namebuf.length,0)
        name_part.writeUInt32LE(namebuf.length+1)
        namebuf.copy(name_part,4)

        return Buffer.concat([
            delimitedBuffer(Buffer.concat(parts1)),
            name_part])
    }

    deserialize(buf:Buffer,offset:number){
        // console.log(`Deserializing header from offset ${offset}`)
        const length = buf.readUInt32LE(offset)
        offset+=4+length

        const name_length = buf.readUInt32LE(offset)
        offset+=4
        // console.log(`Deserializing name from offset ${offset}, lenght ${name_length-1}`)
        this.name = buf.slice(offset,offset+name_length-1).toString('utf-8')
        offset+=name_length

        // console.log(`name is ${this.name}`)
        return offset
    }
}

interface level_options {
    grid?:{
        x?:number;
        y?:number;
        val?:number;
    }
    name?:string
    robot?:{x:number;y:number}
    kitty?:{x:number;y:number}
}

class ExpectValue {
    val:number
    buf:Buffer
    constructor(val:number) {
        this.val = val
        this.buf = Buffer.alloc(4,0)
        this.buf.writeUInt32LE(val)
    }

    serialize(){
        return this.buf
    }
    deserialize(buf:Buffer,offset:number){
        const seen = buf.readUInt32LE(offset)
        if(seen!=this.val) throw new Error(`Deserialization. Unexpected value. Expected ${this.val}, got ${seen}`)
        return offset+4
    }
}



export class Level {
    header:Header
    tags: Tags
    grid:Grid
    callouts:CalloutList
    robot:floatXY
    kitty:floatXY
    footer: Footer
    zero:ExpectValue
    one:ExpectValue

    constructor(options?:level_options) {
        this.header = new Header()
        this.header.name = options?.name||''
        this.tags = new Tags()
        this.grid = new Grid(options?.grid?.x,options?.grid?.y,options?.grid?.val)
        this.callouts = new CalloutList()
        this.robot = new floatXY(options?.robot?.x||50,options?.robot?.y||60)
        this.kitty = new floatXY(options?.kitty?.x||70,options?.kitty?.y||80)
        this.footer = new Footer()
        this.zero = new ExpectValue(0)
        this.one = new ExpectValue(1)
    }
    set name(s:string){
        this.header.name = s
    }
    get name(){
        return this.header.name
    }

    static from(buf:Buffer){
        const lvl = new Level()
        lvl.deserialize(buf)
        return lvl
    }

    changeGridSize(x_size:number,y_size:number){
        this.grid = new Grid(x_size,y_size)
    }

    serialize(){

        const parts:Buffer[]=[]

        parts.push(this.header.serialize())
        // parts.push(delimitedBuffer(Buffer.from(this.name+'\x00','utf-8'))) # name now in header
        parts.push(this.tags.serialize())

        parts.push(this.grid.serialize())
        parts.push(this.one.serialize()) //unknown one
        parts.push(this.callouts.serialize())

        parts.push(this.zero.serialize()) //unknown zero block
        parts.push(this.robot.serialize())
        parts.push(this.zero.serialize()) //unknown zero block
        parts.push(this.kitty.serialize())
        parts.push(this.zero.serialize()) //unknown zero block

        parts.push(this.footer.serialize())
        parts.push(this.zero.serialize()) //unknown zero block
        parts.push(this.zero.serialize()) //unknown zero block

        return Buffer.concat(parts)
    }

    deserialize(buf:Buffer){
        let offset = this.header.deserialize(buf,0)

        // name now in header
        // const namebuf = readDelimited(buf,offset)
        // offset+=4+namebuf.length
        // this.name = namebuf.slice(0,namebuf.length-1).toString('utf-8').trim()

        offset = this.tags.deserialize(buf,offset)

        offset = this.grid.deserialize(buf,offset)

        offset = this.one.deserialize(buf,offset) // magic one. reason unknown.


        offset = this.callouts.deserialize(buf,offset)

        offset = this.zero.deserialize(buf,offset)
        offset = this.robot.deserialize(buf,offset)
        offset = this.zero.deserialize(buf,offset)
        offset = this.kitty.deserialize(buf,offset)
        offset = this.zero.deserialize(buf,offset)

        offset = this.footer.deserialize(buf, offset)
        offset = this.zero.deserialize(buf,offset)
        offset = this.zero.deserialize(buf,offset)

    }


}

export function normalizedTileValue(val:number){
    // only touch the high two bytes if there are any values set there.
    if(val<65536) return val;

    const buf=Buffer.alloc(4)
    buf.writeUInt32LE(val)
    Buffer.from('8000','hex').copy(buf,2)
    return buf.readUInt32LE()
}

export function extractLevelName(buf:Buffer){
    let offset = 0
    offset+=4+buf.readUInt32LE(offset)
    const length = buf.readUInt32LE(offset)
    offset+=4
    return buf.slice(offset,offset+length-1).toString('utf-8').trim()
}
