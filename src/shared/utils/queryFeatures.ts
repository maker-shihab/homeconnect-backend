import mongoose from 'mongoose';
import { ParsedQs } from 'qs';

export class QueryFeatures<T> {
  public query: mongoose.Query<T[], T>;
  private queryString: ParsedQs;

  constructor(query: mongoose.Query<T[], T>, queryString: ParsedQs) {
    this.query = query;
    this.queryString = queryString;
  }

  public filter(): this {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  public sort(): this {
    if (this.queryString.sort) {
      const sortBy = (this.queryString.sort as string).split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  public limitFields(): this {
    if (this.queryString.fields) {
      const fields = (this.queryString.fields as string).split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  public paginate(): this {
    const page = parseInt(this.queryString.page as string, 10) || 1;
    const limit = parseInt(this.queryString.limit as string, 10) || 12;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}