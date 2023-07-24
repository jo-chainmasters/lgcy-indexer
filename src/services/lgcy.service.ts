import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Transaction } from '../model/Transaction';
import { TriggerSmartContract } from '../model/contracts/TriggerSmartContract';
import bigDecimal = require('js-big-decimal');
import { ContractCall } from '../model/ContractCall';

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

  public async getContractCallData(transaction: Transaction) {
    const contract = await this.lgcyWeb
      .contract()
      .at(
        (transaction.transactionValue as TriggerSmartContract).contractAddress,
      );

    try {
      const decoded: {
        name: string;
        abi: any;
        functionSelector: string;
        params: { [key: string]: any };
      } = await contract.decodeInput(
        (transaction.transactionValue as TriggerSmartContract).data,
      );

      decoded.functionSelector = decoded.name + '(';

      for (const entry of contract.abi) {
        if (entry.name === decoded.name) {
          decoded.abi = entry;
        }
      }

      if (decoded.abi.inputs) {
        for (const input of decoded.abi.inputs) {
          decoded.functionSelector += input.type + ',';
        }
        decoded.functionSelector = decoded.functionSelector.substring(
          0,
          decoded.functionSelector.length - 1,
        );
      }

      decoded.functionSelector += ')';

      for (const paramsKey in decoded.params) {
        if (this.lgcyWeb.utils.isBigNumber(decoded.params[paramsKey])) {
          decoded.params[paramsKey] = new bigDecimal(
            decoded.params[paramsKey].toString(16),
          );
        }
      }

      return decoded;
    } catch (e) {
      this.logger.warn(
        'Found TriggerSmartContract of an unknown Function: ' +
          (transaction.transactionValue as TriggerSmartContract)
            .contractAddress,
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
