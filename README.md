# CarKeys

**CarKeys is a kid-first music, driving, and learning game where playing notes powers the car and changes the world.** The goal is simple: make the player feel like they are playing a car game while note recognition, rhythm, listening, memory, sequencing, spelling, and vocabulary develop underneath the fun.

## Product rule

**Fun first. Learning through play.** CarKeys should never stop the adventure to feel like a worksheet. See or hear something, play it, make the car react, and get an immediate satisfying result.

## Current playable experience

The web build now includes a 25-level adventure with themed worlds, multiple cars and upgrades, Free Drive, short missions, musical C/D/E/F controls, progressive note difficulty, word collection, rhythm timing, and listen-and-play-back memory challenges.

### Learning progression

| Stage | Game feeling | Learning underneath |
| --- | --- | --- |
| Music City | Drive, explore, hit targets | Note recognition + simple words |
| Rhythm Forest | Race to the beat | Timing + sequencing + vocabulary |
| Melody Mountain | Hear and copy musical routes | Listening + musical memory |
| Space Beat | Bigger musical adventures | Combined notes, rhythm, memory and patterns |

## Design principles

- The car is part of the lesson, not decoration around it.
- One obvious action at a time for younger players.
- Immediate visual, audio, movement, and haptic feedback.
- Mistakes should feel recoverable and playful rather than punitive.
- Difficulty grows gradually by adding notes, timing, memory, and reduced assistance.
- New cars, places, effects, and mission moments keep progression rewarding.
- Learning UI stays contextual so the road remains the star of the screen.

## Controls

The current beginner musical controls use **C, D, E, and F**. Levels introduce complexity gradually instead of presenting every challenge at once.

## Tech

- React 18
- Vite
- Browser Web Audio
- Responsive web/PWA-oriented interface
- Local progression for fast, account-free play

## Status

CarKeys is an active playable prototype. The current focus is consolidating the game and learning systems into a clean shared gameplay loop, polishing all 25 levels on mobile, improving world-specific mechanics, and adding automated progression/regression tests before expanding the mechanic set further.
