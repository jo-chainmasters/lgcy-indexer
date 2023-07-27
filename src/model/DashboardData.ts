import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ContractCall } from './ContractCall';

export type DashboardDataSchema = HydratedDocument<DashboardData>;
@Schema()
export class DashboardData {
  @Prop()
  public currentBlock: number;
  @Prop()
  public totalAccounts: string;
  @Prop()
  public totalNodes: string;
  @Prop()
  public totalTransactions: string;
  @Prop()
  public frozenLgcy: string;
  @Prop()
  public burntUsdl: string;

  @Prop([String])
  public labelsHours24: string[];

  @Prop([String])
  public dataHours24: number[];

  @Prop([String])
  public labelsDays7: string[];

  @Prop([String])
  public dataDays7: number[];

  constructor(
    currentBlock: number,
    totalAccounts: string,
    totalNodes: string,
    totalTransactions: string,
    frozenLgcy: string,
    burntUsdl: string,
    labelsHours24: string[],
    dataHours24: number[],
    labelsDays7: string[],
    dataDays7: number[],
  ) {
    this.currentBlock = currentBlock;
    this.totalAccounts = totalAccounts;
    this.totalNodes = totalNodes;
    this.totalTransactions = totalTransactions;
    this.frozenLgcy = frozenLgcy;
    this.burntUsdl = burntUsdl;
    this.labelsHours24 = labelsHours24;
    this.dataHours24 = dataHours24;
    this.labelsDays7 = labelsDays7;
    this.dataDays7 = dataDays7;
  }
}

export const DashboardDataSchema = SchemaFactory.createForClass(DashboardData);
