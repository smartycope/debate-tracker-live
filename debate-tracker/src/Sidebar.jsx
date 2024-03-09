import React from 'react';
import { slide as Menu } from 'react-burger-menu';
import './Sidebar.css';
import {isMobile} from 'react-device-detect';


function Definition({data, setDef, id}){
    return(
        <section className='menu-item'>
            <input type='text' onBlur={e => setDef(id, 'word', e.target.value)} defaultValue={data.word} placeholder='Word'></input>
            <textarea onBlur={e => setDef(id, 'definition', e.target.value)} defaultValue={data.definition} placeholder='Definition'></textarea>
        </section>
    )
}

export default function Sidebar({data, setDef, newDef, ...props}){
    const defs = data.map((d, idx) => <Definition data={d} setDef={setDef} id={idx}/>)
    var style = {
        bmMenu:{
            width: isMobile ? '100%' : '150%'
        }
    }

    return (
      <Menu {...props} styles={style}>
        <h3 className='menu-item'>Definitions</h3>
        <hr className='menu-item'/>
        {defs}
        <button className='menu-item' onClick={newDef}>Add new definition</button>
      </Menu>
    );
  }
