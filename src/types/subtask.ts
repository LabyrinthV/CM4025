export type subtaskForm = {
    ongoingCosts: {
        ongoingCostsAmount: number,
        frequency: string
    },
    oneOffCosts: number,
    time: number,
    period: string,
    paygrade: string,
    payGradeAmount: number,
    fudgeCheckmark: boolean
}
