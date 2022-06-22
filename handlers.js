
require('dotenv').config();

const players = ['Idris', 'Zach', 'Akmal', 'Rumel', 'Bodrul', 'bob', 'jimmy', 'clyde', 'ramsheed']

const sliceChunks = (arr, chunkSize) => {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}


const minGroupSize = 2
let maxGroupSize = 4

const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const randIndex = Math.floor(Math.random() * (i + 1))
        const temp = arr[i]
        arr[i] = arr[randIndex]
        arr[randIndex] = temp
    }
    return arr
}

const formatArray = (arr) => {
    let string = []

    for (let i = 0; i < arr.length; i++) {
        let teamString = `Team ${i + 1}:\n${arr[i].join(', ')}\n\n`
        string.push(teamString)
    }
    console.log(string.join(''))
    return string
}

const lfgxup = (playerList) => {
    playerList = shuffleArray(playerList)
    if (playerList.length >= 5) {
        maxGroupSize = 3
    } else if (playerList.length <= 4) {
        return "There's less than four people ready. Try again when more people are ready!"
    } else {
        // const slicedGroup = sliceChunks(playerList, maxGroupSize)
        // let listPos = 2

        // while (slicedGroup[slicedGroup.length - 1].length < maxGroupSize - 1) {
        //     const moveItem = slicedGroup[slicedGroup.length - listPos].pop()
        //     slicedGroup[slicedGroup.length - 1].push(moveItem)
        //     listPos++
        // }
        // console.log(slicedGroup)
        // const formattedTeams = formatArray(slicedGroup)
        // return formattedTeams
    }
    const slicedGroup = sliceChunks(playerList, maxGroupSize)
        let listPos = 2

        while (slicedGroup[slicedGroup.length - 1].length < maxGroupSize - 1) {
            const moveItem = slicedGroup[slicedGroup.length - listPos].pop()
            slicedGroup[slicedGroup.length - 1].push(moveItem)
            listPos++
        }
        // console.log(slicedGroup)
        const formattedTeams = formatArray(slicedGroup)
        return formattedTeams
}

const waitFor = (time) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), time);
    });
};

// lfgxup(players)

module.exports = { lfgxup, waitFor }
