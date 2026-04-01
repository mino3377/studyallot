export const title = {
    min: 1,
    max: 50
}

export const unitCount = {
    min: 1,
    max: 1000
}

export const rounds = {
    min: 1,
    max: 100
}


// checksheet

export const taskCount = {
    min: 1,
    max: unitCount.max * rounds.max
}

export const studyTime = {
    min: 1,
    max: 60 * 24
}

export const content = {
    max: 300
}