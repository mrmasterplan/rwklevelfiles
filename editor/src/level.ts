import bitwise from "bitwise";


const level_defaults ={
    header : Buffer.from('00000000050000001c000000ffffffff','hex'),
    footer: Buffer.from('0100000000010000000000000000000000000000000000000000000000006666663f0000000000000000b800bc0000000000000000000000000000000000003f0000003f010000000001000000000100000000','hex')
}

function delimitedBuffer(b:Buffer){
    const newb = Buffer.alloc(b.length+4)
    newb.writeUInt32LE(b.length)
    b.copy(newb,4)
    return newb;
}

class Tags {
    length = 19;
    buf:Buffer;
    tag_names=[
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
    tag_index:{[tag:string]:number}

    constructor() {
        this.buf = Buffer.alloc(this.length,0)
        this.tag_index={}
        for(let i =0; i<this.tag_names.length; i++){
            this.tag_index[this.tag_names[i]]=i
        }
    }

    set_tag(tag:string){

        const index = this.tag_index[tag]
        if(typeof index == 'undefined') throw Error("Given tag is unknown.")

        const bits = bitwise.buffer.read(this.buf,0,this.tag_names.length)
        bits[index]=1
        bitwise.buffer.modify(this.buf,bits)
    }

    serialize(){
        return this.buf
    }

}

class Grid {
    size_x: number
    size_y: number
    celldata:number[][]
    postgrid:number[][]
    constructor(x:number=10,y:number=7,default_cell:number=0) {
        this.size_x=x
        this.size_y=y
        this.celldata=Array.from(Array(y),row=>Array.from(Array(x),cell=>default_cell))
        // console.log(this.celldata)
        this.postgrid=Array.from(Array(y),row=>Array.from(Array(x),cell=>0))
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
                buf.writeUInt32LE(this.celldata[j][i],offset)
                offset+=4
            }
        }
        // write post-grid
        for (let j = 0; j < this.size_y; j++) {
            for (let i = 0; i < this.size_x; i++) {
                buf.writeUInt8(this.postgrid[j][i],offset)
                offset+=1
            }
        }


        return delimitedBuffer(buf)
    }
    setCell(x:number,y:number,val:number){
        if(x>=this.size_x || y>=this.size_y || x<0 || y<0) throw new Error('invalid grid index')

        this.celldata[y][x]=val
    }
    getCell(x:number,y:number){
        if(x>=this.size_x || y>=this.size_y || x<0 || y<0) throw new Error('invalid grid index')

        return this.celldata[y][x]
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
        const callout_bufs:Buffer[] = []
        for(let call of this.callouts){
            const textbuf = Buffer.from(call.text,'utf-8')
            const buf = Buffer.alloc(textbuf.length+9,0)
            buf.writeUInt32LE(call.x,0)
            buf.writeUInt32LE(call.y,4)
            textbuf.copy(buf,8)
            // the terminating zero of the string is already present from the zeroed buffer.
            callout_bufs.push(buf)
        }

        const combined_callout_buf = Buffer.concat(callout_bufs)

        const magic_one = Buffer.alloc(4)
        magic_one.writeUInt32LE(1)

        const n_callouts = Buffer.alloc(4)
        n_callouts.writeUInt32LE(this.callouts.length)

        return Buffer.concat([magic_one,delimitedBuffer(Buffer.concat([n_callouts,combined_callout_buf]))])
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
}



class Footer {
    serialize(){
        return delimitedBuffer(level_defaults.footer)
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

export class Level {
    header:Buffer|undefined
    name:string
    tags: Tags
    grid:Grid
    callouts:CalloutList
    robot:floatXY
    kitty:floatXY
    footer: Footer

    constructor(options?:level_options) {
        this.name = options?.name||''
        this.tags = new Tags()
        this.grid = new Grid(options?.grid?.x,options?.grid?.y,options?.grid?.val)
        this.callouts = new CalloutList()
        this.robot = new floatXY(options?.robot?.x||50,options?.robot?.y||60)
        this.kitty = new floatXY(options?.kitty?.x||70,options?.kitty?.y||80)
        this.footer = new Footer()
    }
    check_issues(){
        const issues:string[]=[]
        // checks for the presence of necessary parts.
        if(!this.name || !this.name.length){
            issues.push('No name defined for level.')
        }

        if(!this.grid || !this.grid.size_x || !this.grid.size_y){
            issues.push("cell grid has size zero")
        }

        if(!this.robot){
            issues.push("No robot position defined")
        }
        if(!this.kitty){
            issues.push("No kitty position defined")
        }
        return issues
    }

    changeGridSize(x_size:number,y_size:number){
        this.grid = new Grid(x_size,y_size)
    }

    serialize(){
        if(this.check_issues().length) throw new Error("Attempted to serialize level with remaining issues.")

        const parts:Buffer[]=[]

        parts.push(delimitedBuffer(this.header || level_defaults.header))
        parts.push(delimitedBuffer(Buffer.from(this.name+'\x00','utf-8')))
        parts.push(this.tags.serialize())

        parts.push(this.grid.serialize())
        parts.push(this.callouts.serialize())

        parts.push(Buffer.alloc(4,0)) //unknown zero block
        parts.push(this.robot.serialize())
        parts.push(Buffer.alloc(4,0)) //unknown zero block
        parts.push(this.kitty.serialize())
        parts.push(Buffer.alloc(4,0)) //unknown zero block

        parts.push(this.footer.serialize())
        parts.push(Buffer.alloc(8,0)) //unknown zero block

        return Buffer.concat(parts)
    }
}

