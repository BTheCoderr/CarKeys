// Lightweight production-safe integrity audit for the 25-level adventure.
// Keeps progression mistakes visible while CarKeys grows.
export const EXPECTED_LEVELS=25
export const WORLD_RANGES={city:[1,10],forest:[11,15],mountain:[16,20],space:[21,25]}
export const BOSSES=[10,15,20,25]
export function auditProgression(levels){
 const issues=[]
 if(!Array.isArray(levels)||levels.length!==EXPECTED_LEVELS)issues.push(`Expected ${EXPECTED_LEVELS} levels, found ${levels?.length??0}`)
 levels?.forEach((l,i)=>{if(!l?.name)issues.push(`Level ${i+1} missing name`);if(!l?.world)issues.push(`Level ${i+1} missing world`);if(!Array.isArray(l?.pattern)||!l.pattern.length)issues.push(`Level ${i+1} missing playable pattern`);if(l?.pattern?.some(n=>n<0||n>3))issues.push(`Level ${i+1} uses an unavailable key`)})
 Object.entries(WORLD_RANGES).forEach(([world,[a,b]])=>{for(let n=a;n<=b;n++)if(levels?.[n-1]?.world!==world)issues.push(`Level ${n} should belong to ${world}`)})
 BOSSES.forEach(n=>{if(!levels?.[n-1])issues.push(`Boss level ${n} missing`)})
 return {ok:issues.length===0,issues}
}
