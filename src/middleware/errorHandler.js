const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
};

module.exports = errorHandler;
