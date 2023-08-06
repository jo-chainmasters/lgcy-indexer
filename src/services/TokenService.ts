import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from '../model/Token';
import { Model } from 'mongoose';
import { SmartContract } from '../model/SmartContract';
import { ContractType } from '../model/ContractType';
import { LgcyService } from './lgcy.service';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<Token>,
    private lgcyService: LgcyService,
  ) {}

  public async createToken(smartContract: SmartContract) {
    const symbol = await this.lgcyService.callContract(
      smartContract.address,
      'symbol',
    );
    const decimals = await this.lgcyService.callContract(
      smartContract.address,
      'decimals',
    );

    const token = new Token();
    token.type = ContractType._20;
    token.name = smartContract.name;
    token.tokenId = smartContract.address;
    token.symbol = symbol;
    token.decimals = decimals;
    return token;
  }

  public async save(token: Token) {
    return await this.tokenModel.insertMany([token]);
  }

  public async findAll() {
    return await this.tokenModel.find({}).exec();
  }

  public async getPage(
    skip: number,
    pageSize: number,
    sortField: string,
    sortOrder: number,
  ) {
    const totalRecords = await this.tokenModel.count().exec();

    const sort = {};
    sort[sortField] = sortOrder;

    const tokens = await this.tokenModel
      .find()
      .skip(skip)
      .sort(sort)
      .limit(pageSize)
      .exec();

    return { totalRecords, tokens };
  }
}
