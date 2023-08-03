import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Transaction } from '../model/Transaction';
import { TriggerSmartContract } from '../model/contracts/TriggerSmartContract';
import bigDecimal = require('js-big-decimal');
import { ContractCall } from '../model/ContractCall';
import { SmartContract } from '../model/SmartContract';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Weblgcy = require('weblgcy');

@Injectable()
export class LgcyService {
  private lgcyWeb: typeof Weblgcy;
  private readonly logger = new Logger(LgcyService.name);

  constructor(private readonly httpService: HttpService) {
    this.lgcyWeb = new Weblgcy({
      fullNode: 'https://fullnode.legacy.chainmasters.ninja',
      solidityNode: 'https://fullnode.legacy.chainmasters.ninja',
    });
  }

  // public async getCurrentBlock() {
  //   const block: any = await this.lgcyWeb.legacy.getCurrentBlock();
  //   return this.mapBlock(block);
  // }

  public async callContract(
    address: string,
    functionName: string,
    params: any[],
  ) {
    const contract = await this.lgcyWeb.contract().at(address);
    if (contract[functionName]) {
      const result = await contract[functionName](...params).call({
        from: address,
      });
      return result;
    } else {
      console.log(
        'Contract ' + address + ' does not have function ' + functionName,
      );
      throw new Error('Contract does not have function');
    }
  }

  public async getBlockByNumber(num: number) {
    const blockHttp: any = await this.lgcyWeb.legacy.getBlockByNumber(num);
    return blockHttp;
  }

  public async getBlockRange(start: number, count: number): Promise<any[]> {
    const blocks: any[] = await this.lgcyWeb.legacy.getBlockRange(
      start,
      start + count,
    );
    return blocks;
  }

  public async getContractCallData(
    smartContract: SmartContract,
    transaction: Transaction,
  ) {
    const contract = await this.lgcyWeb
      .contract()
      .at(
        (transaction.transactionValue as TriggerSmartContract).contractAddress,
      );
    let decoded: {
      name: string;
      params: { [key: string]: any };
    };

    try {
      decoded = await contract.decodeInput(
        (transaction.transactionValue as TriggerSmartContract).data,
      );

      // convert BigNumber to bigDecimal
      for (const paramsKey in decoded.params) {
        if (this.lgcyWeb.utils.isBigNumber(decoded.params[paramsKey])) {
          decoded.params[paramsKey] = new bigDecimal(
            decoded.params[paramsKey].toString(16),
          );
        }

        if (smartContract.parsedAbi.functions[decoded.name].inputParams) {
          for (const inputParam of smartContract.parsedAbi.functions[
            decoded.name
          ].inputParams) {
            if (
              inputParam.name === paramsKey &&
              inputParam.type === 'address'
            ) {
              decoded.params[paramsKey] = this.hexToBase58(
                decoded.params[paramsKey],
              );
            }
          }
        }

        if (this.lgcyWeb.utils.isArray(decoded.params[paramsKey])) {
          for (let i = 0; i <= decoded.params[paramsKey].length - 1; i++) {
            if (this.lgcyWeb.utils.isBigNumber(decoded.params[paramsKey][i])) {
              decoded.params[paramsKey][i] = new bigDecimal(
                (decoded.params[paramsKey][i] as any).toString(16),
              );
            }

            if (
              smartContract.parsedAbi.functions[decoded.name].inputParams
            ) {
              for (const inputParam of smartContract.parsedAbi.functions[
                decoded.name
              ].inputParams) {
                if (
                  inputParam.name === decoded.params[paramsKey].name &&
                  inputParam.type === 'address[]'
                ) {
                  decoded.params[paramsKey][i] = this.hexToBase58(
                    decoded.params[paramsKey][i],
                  );
                }
              }
            }
          }
        }
      }

      return decoded;
    } catch (e) {
      this.logger.warn(
        'Found TriggerSmartContract of an unknown Function: ' +
          (transaction.transactionValue as TriggerSmartContract)
            .contractAddress +
          ' tx: ' +
          transaction.hash +
          ', functionSignature: ' +
          (transaction.transactionValue as TriggerSmartContract).data.substring(
            0,
            8,
          ),
      );

      return {
        transactionHash: transaction.hash,
        blockNumber: transaction.blockNumber,
        contractAddress: (transaction.transactionValue as TriggerSmartContract)
          .contractAddress,
        sender: transaction.sender,
      };
    }
  }

  public async getTransactionInfo(hash: string) {
    return await this.lgcyWeb.legacy.getTransactionInfo(hash);
  }

  public async getTransactionInfoFromHttp(hash: string) {
    // return await this.httpService
    //   .post(
    //     'https://fullnode.legacy.chainmasters.ninja/wallet/gettransactioninfobyid',
    //     {
    //       value: hash,
    //     },
    //   )
    //   .toPromise();

    const { data } = await firstValueFrom(
      this.httpService
        .post(
          'https://fullnode.legacy.chainmasters.ninja/wallet/gettransactioninfobyid',
          {
            value: hash,
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    return data;
  }

  public hexToBase58(hex: string): string {
    return this.lgcyWeb.address.fromHex(hex);
  }

  public hexToUtf8(hex: string): string {
    return this.lgcyWeb.toUtf8(hex);
  }
}
