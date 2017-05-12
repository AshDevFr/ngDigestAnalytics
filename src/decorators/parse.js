function $parser($delegate) {
  return function(expression) {
    var result = $delegate.apply(this, arguments);
    if (typeof expression === 'string') {
      result.exp = expression;
    }
    return result;
  };
}

$parser.$inject = ['$delegate'];

export default $parser;
