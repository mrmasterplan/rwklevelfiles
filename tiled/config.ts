

export const config = {
    debug: false,
    base_tiles: {
        vertical_pairs: [
            [14,15], //red door
            [16,17], //green door
            [18,19], //blue door
            [51,52], //yellow door
            [68,69], //spikes
        ],
        horizontal_pairs:[
            [54,55], //one way
            [59,60], //conveyors
        ],
        parity_pairs:[
            [38,43] // teleport controllers
        ],
        elevated: [20,11,12,13,50,4,5,6,7,8,9,10,42,72,25,26,65,27,21,22,23,53,56,71,36,24,41,40,31,28,38,43,39,44,45,46,48,57,62,73,70],

    },
}