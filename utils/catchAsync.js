/* 
  *** The async function is stored in the fn variable ***
  *** Understand catchAsyncError better from the decorators point of view ***
*/

const catchAsyncError = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

export default catchAsyncError;