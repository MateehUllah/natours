module.exports = (fn) => {
  //catch async will return new function
  //which will be assign to create tour
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
