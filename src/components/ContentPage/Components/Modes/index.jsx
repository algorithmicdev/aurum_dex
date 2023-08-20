import React, { useState } from 'react';
import Mode from './Components/Mode';
import Sweep from './Components/Sweep';
import {
  Title,
  WrapperContentMode,
  WrapperContentModes,
  WrapperTitle,
} from './Modes.style';
import Draggable from 'react-draggable';
import {RxDragHandleHorizontal} from 'react-icons/rx'
export default function Modes() {
  const [type, setType] = useState('sweep');

  return (
    <Draggable
    // allowAnyClick='true'
    axis="both"
    handle=".handle"
    defaultPosition={{ x: 0, y: 0 }}
    position={null}
    grid={[25, 25]}
    scale={1}
    
  >
    <WrapperContentMode>
      <WrapperTitle>
        <Title isSelect={type === 'sweep'} onClick={() => setType('sweep')}>
          Sweep Mode
        </Title>
        <Title isSelect={type === 'mode'} onClick={() => setType('mode')}>
          Pro Mode
        </Title>
        <RxDragHandleHorizontal className='handle' color='white' size={24} style={{ background:"gray", borderRadius:"5px", left:"390",top:"6",position:"fixed"}} />
      </WrapperTitle>
      <WrapperContentModes>
        {type === 'sweep' && <Sweep />}
        {type === 'mode' && <Mode />}
      </WrapperContentModes>
    </WrapperContentMode>
    </Draggable>
  );
}
