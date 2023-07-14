export enum TransactionType {
  AccountCreateContract = 'AccountCreateContract',
  TransferContract = 'TransferContract',
  TransferAssetContract = 'TransferAssetContract',
  VoteAssetContract = 'VoteAssetContract',
  VoteWitnessContract = 'VoteWitnessContract',
  WitnessCreateContract = 'WitnessCreateContract',
  AssetIssueContract = 'AssetIssueContract',
  WitnessUpdateContract = 'WitnessUpdateContract',
  ParticipateAssetIssueContract = 'ParticipateAssetIssueContract',
  AccountUpdateContract = 'AccountUpdateContract',
  FreezeBalanceContract = 'FreezeBalanceContract',
  UnfreezeBalanceContract = 'UnfreezeBalanceContract',
  WithdrawBalanceContract = 'WithdrawBalanceContract',
  UnfreezeAssetContract = 'UnfreezeAssetContract',
  UpdateAssetContract = 'UpdateAssetContract',
  ProposalCreateContract = 'ProposalCreateContract',
  ProposalApproveContract = 'ProposalApproveContract',
  ProposalDeleteContract = 'ProposalDeleteContract',
  SetAccountIdContract = 'SetAccountIdContract',
  CustomContract = 'CustomContract',
  CreateSmartContract = 'CreateSmartContract',
  TriggerSmartContract = 'TriggerSmartContract',
  GetContract = 'GetContract',
  UpdateSettingContract = 'UpdateSettingContract',
  ExchangeCreateContract = 'ExchangeCreateContract',
  ExchangeInjectContract = 'ExchangeInjectContract',
  ExchangeWithdrawContract = 'ExchangeWithdrawContract',
  ExchangeTransactionContract = 'ExchangeTransactionContract',
  UpdateKandyLimitContract = 'UpdateKandyLimitContract',
  AccountPermissionUpdateContract = 'AccountPermissionUpdateContract',
  ClearABIContract = 'ClearABIContract',
  UpdateBrokerageContract = 'UpdateBrokerageContract',
  ShieldedTransferContract = 'ShieldedTransferContract',
  MarketSellAssetContract = 'MarketSellAssetContract',
  MarketCancelOrderContract = 'MarketCancelOrderContract',
  UNRECOGNIZED = 'UNRECOGNIZED',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TransactionType {
  export function valueOf(str: string) {
    return TransactionType[str as keyof typeof TransactionType];
  }
}
