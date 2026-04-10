function ts() {
  return new Date().toISOString();
}

function format(level, scope, msg) {
  return `[${ts()}] ${level} [${scope}] ${msg}`;
}

function create(scope) {
  return {
    info: (msg) => console.log(format('INFO ', scope, msg)),
    warn: (msg) => console.warn(format('WARN ', scope, msg)),
    error: (msg) => console.error(format('ERROR', scope, msg)),
  };
}

module.exports = { create };
