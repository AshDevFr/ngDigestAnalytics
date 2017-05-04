import Timer from '../services/timer';
import logger from '../services/logger';

function $rootScope($delegate) {
  let digestInProgress;
  const proto = Object.getPrototypeOf($delegate),
      originalDigest = proto.$digest;

  proto.$digest = instrumentedDigest;

  let watchTiming;

  function instrumentedDigest() {
    const start = Date.now();
    digestInProgress = true;
    try {
      originalDigest.call(this);
    } finally {
      digestInProgress = false;
    }
    const duration = Date.now() - start;
    logger.add({
      type: 'digest',
      value: duration
    });
  }

  return $delegate;
}

$rootScope.$inject = ['$delegate'];

export default $rootScope;
