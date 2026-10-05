import { useEffect, useState } from 'react'
const KEY='carkeys-boss-unlocks-v1'
const EQUIPPED='carkeys-equipped-reward'
const ITEMS=[['cityRacer','🏎️','CITY RACER','Car'],['fireflyTrail','✨','FIREFLY TRAIL','Trail'],['crystalHorn','💎','CRYSTAL HORN','Horn'],['starRacer','🌟','STAR RACER','Car + Cosmic Trail']]
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}}
const hasAdventureProgress=()=>['carkeys-level','carkeys-complete','carkeys-all-complete','carkeys-mountain-complete','carkeys-space-complete','carkeys-pink','carkeys-green','carkeys-gold','carkeys-purple','carkeys-car'].some(key=>localStorage.getItem(key)!==null)
export default function GarageRewards(){
 const [items,setItems]=useState(read),[open,setOpen]=useState(false),[equipped,setEquipped]=useState(()=>localStorage.getItem(EQUIPPED)||'')
 useEffect(()=>{const sync=e=>setItems(e.detail||read());window.addEventListener('carkeys-unlocks',sync);return()=>window.removeEventListener('carkeys-unlocks',sync)},[])
 useEffect(()=>{const syncReset=()=>{if(hasAdventureProgress())return;if(!localStorage.getItem(KEY)&&!localStorage.getItem(EQUIPPED))return;localStorage.removeItem(KEY);localStorage.removeItem(EQUIPPED);setItems({});setEquipped('');setOpen(false);window.dispatchEvent(new CustomEvent('carkeys-unlocks',{detail:{}}));window.dispatchEvent(new CustomEvent('carkeys-equip',{detail:''}))};const id=window.setInterval(syncReset,250);return()=>window.clearInterval(id)},[])
 const owned=ITEMS.filter(([id])=>items[id]);if(!owned.length)return null
 const equip=id=>{setEquipped(id);localStorage.setItem(EQUIPPED,id);window.dispatchEvent(new CustomEvent('carkeys-equip',{detail:id}))}
 return <div className="reward-garage"><button className="garage-tab" onClick={()=>setOpen(v=>!v)}>🏁 GARAGE <b>{owned.length}</b></button>{open&&<div className="garage-panel"><strong>YOUR BOSS REWARDS</strong>{ITEMS.map(([id,icon,name,type])=><button key={id} disabled={!items[id]} className={equipped===id?'equipped':''} onClick={()=>items[id]&&equip(id)}><span>{items[id]?icon:'🔒'}</span><div><b>{name}</b><small>{items[id]?(equipped===id?'EQUIPPED ✓':type+' • TAP TO EQUIP'):'BEAT THE WORLD FINALE'}</small></div></button>)}</div>}</div>
}
