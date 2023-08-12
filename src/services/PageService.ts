import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class PageService {
  public async getPage(model: Model<any>, query: any) {
    const fixedFilters = this.getFixedFiltersFromQuery(query);
    const userFilters = this.getUserFilterFromQuery(query);
    const allFilters = this.combineFixedFiltersWithUserFilters(
      fixedFilters,
      userFilters,
    );

    const sort = {};
    if (query.sortField) sort[query.sortField] = query.sortOrder;

    const count = await model.count(allFilters).exec();

    const data = await model
      .find(allFilters)
      .skip(query.first ? query.first : 0)
      .sort(sort)
      .limit(query.rows ? query.rows : 10)
      .exec();

    return {
      count,
      data,
    };
  }

  private getFixedFiltersFromQuery(query) {
    return this.getFiltersFromQuery('fixedFilter', query);
  }

  private getUserFilterFromQuery(query) {
    return this.getFiltersFromQuery('userFilter', query);
  }

  private combineFixedFiltersWithUserFilters(fixedFilters, userFilters) {
    const filters = {};
    for (const key of Object.keys(userFilters)) {
      filters[key] = userFilters[key];
    }
    for (const key of Object.keys(fixedFilters)) {
      filters[key] = fixedFilters[key];
    }
    return filters;
  }

  private getFiltersFromQuery(prefix: string, query) {
    const filters = {};
    for (const key of Object.keys(query)) {
      const paramValue = query[key] as string;
      if (key.startsWith(prefix + '.')) {
        const paramKey = key.substring(prefix.length + 1);
        const filterMode = paramKey.substring(0, paramKey.indexOf('.'));
        const filterField = paramKey.substring(filterMode.length + 1);

        if (!paramValue || paramValue === '' || paramValue === 'null') {
          continue;
        }

        switch (filterMode) {
          case 'in':
            if (Array.isArray(paramValue)) {
              filters[filterField] = { $in: paramValue };
            } else {
              filters[filterField] = paramValue;
            }
            break;
          case 'contains':
            filters[filterField] = RegExp('.*' + paramValue + '.*', 'i');
            break;
          case 'columnOrContains':
            // fixedFileder.columnOrContains. field1|field2|field3=someValue
            const multicolumns = filterField.split('|');
            const $or = [];
            for (const multicolumn of multicolumns) {
              const orObj = {};
              orObj[multicolumn] = RegExp('.*' + paramValue + '.*', 'i');
              $or.push(orObj);
            }

            filters['$or'] = $or;
            break;
          case 'startsWith':
            filters[filterField] = RegExp('^' + paramValue + '.*', 'i');
            break;
          case 'equals':
            filters[filterField] = paramValue;
            break;
          case 'dateAfter':
            filters[filterField] = { $gt: new Date(Number(paramValue)) };
            break;
          case 'dateBefore':
            filters[filterField] = { $lt: new Date(Number(paramValue)) };
          case 'dateIs':
            break;
          case 'dateIsNot':
            break;
          case 'gt':
            break;
          case 'lt':
            break;
        }
      }
    }
    return filters;
  }
}
