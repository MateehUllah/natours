class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    //Build Query
    //1A) Filtering
    const QueryObj = { ...this.queryString };
    const exclude = ['page', 'sort', 'limit', 'fields'];
    exclude.forEach((el) => delete QueryObj[el]);
    //1B) Advance filtering
    let queryStr = JSON.stringify(QueryObj);
    queryStr = queryStr.replace(/\b(gte|lt|gt|lte)\b/g, (match) => `$${match}`);
    //  console.log(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      //sort('price ratingAverage')
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitfields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  Pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    //page=2&limit=10
    //page=3&limit=10,1-10-page 1, 11-20-page 2, 21-30-page3
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
