import React, { useEffect, useState } from 'react';
import { ClassRocket, FunctionalRocket } from './Rocket';
import '../styles/_launchpad.scss';

// memoize the rocket components
const MemoizedFunctionalRocket = React.memo(FunctionalRocket);
const MemoizedClassRocket = React.memo(ClassRocket);

export default function LaunchPad() {
  const [, triggerRerender] = useState(Date.now());

  useEffect(() => {
    setInterval(() => { triggerRerender(Date.now()); }, 500);
  }, [])

  return (
    <div className="launchpad">
        <MemoizedClassRocket />
    </div>
  );
}
