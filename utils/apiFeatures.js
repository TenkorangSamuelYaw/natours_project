class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // A method for filtering
    filter() {
      const queryObject = { ...this.queryString }; // Copy all fields in the req.query to a new var
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach((el) => delete queryObject[el]);

      // 1.2) Advanced filtering
      let queryStr = JSON.stringify(queryObject);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`,
      );

      this.query = this.query.find(JSON.parse(queryStr));  
      return this;  // Returns the entire object
    }

    sort() {
        if (this.queryString.sort) {
          const sortBy = this.queryString.sort.split(',').join(' ');
          this.query.sort(sortBy); // By default ASC
        } else {
          // I implemented this block because I want to sort the results even if the user doesn't specify a sort parameter
          this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitfields() {
        if (this.queryString.fields) {
          const fields = this.queryString.fields.split(',').join(' ');
          this.query.select(fields);
        } else {
          // If user doesn't limit the fields to receive
          this.query.select('-__v'); // The - sign means exclude this field in the returned query
        }
        return this;
    }

    paginate() {
        // Let's assume page 1 has results 1 -10 & page 2 has 11 - 20 and so on
        const page = parseInt(this.queryString.page) || 1; // Default 1
        const limit = parseInt(this.queryString.limit) || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit); // The number of results to return happens here
        return this;
    }
}

export default APIFeatures;