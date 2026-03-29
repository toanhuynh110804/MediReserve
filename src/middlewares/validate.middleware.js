const formatJoiErrors = (error) => {
  return error.details.map((d) => ({
    field: d.path.join('.') || d.context?.key,
    message: d.message.replace(/"/g, ''),
  }));
};

/**
 * @param {{ body?: import('joi').ObjectSchema, query?: import('joi').ObjectSchema, params?: import('joi').ObjectSchema }} schemas
 */
const validate = (schemas) => {
  return (req, res, next) => {
    if (schemas.body) {
      const { error, value } = schemas.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        return res.status(400).json({
          message: 'Dữ liệu không hợp lệ',
          errors: formatJoiErrors(error),
        });
      }
      req.body = value;
    }
    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        return res.status(400).json({
          message: 'Query không hợp lệ',
          errors: formatJoiErrors(error),
        });
      }
      Object.assign(req.query, value);
    }
    if (schemas.params) {
      const { error, value } = schemas.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        return res.status(400).json({
          message: 'Tham số URL không hợp lệ',
          errors: formatJoiErrors(error),
        });
      }
      Object.assign(req.params, value);
    }
    next();
  };
};

module.exports = { validate };
