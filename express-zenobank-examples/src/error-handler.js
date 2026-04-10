const { ZodError } = require('zod');
const { HttpError } = require('./lib/http-error');

function notFound(_req, res) {
  res.status(404).json({ message: 'Not found' });
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', errors: err.issues });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
}

module.exports = { notFound, errorHandler };
