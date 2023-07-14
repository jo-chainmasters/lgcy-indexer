export class DashboardData {
  constructor(
    public currentBlock: string,
    public totalTransactions: string,
    public totalAccounts: string,
    public totalNodes: string,
    public frozenLgcy: string,

    public labelsHours12: string[],
    public labelsHours24: string[],
    public labelsHours36: string[],
    public labelsHours48: string[],

    public dataHours12: number[],
    public dataHours24: number[],
    public dataHours36: number[],
    public dataHours48: number[],

    public labelsDays7: string[],
    public labelsDays14: string[],
    public labelsDays21: string[],
    public labelsDays28: string[],

    public dataDays7: number[],
    public dataDays14: number[],
    public dataDays21: number[],
    public dataDays28: number[],
  ) {}
}
