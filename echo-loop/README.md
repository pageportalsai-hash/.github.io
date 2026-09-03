# ECHO//LOOP

A browser-playable 3D first-person sci-fi survival game built around one core mechanic: every 90 seconds, your previous actions become a physical Echo.

## Play

Open `index.html` through a web server (GitHub Pages works automatically).

## Controls

- WASD — move
- Mouse — look
- Left click — fire
- Shift — sprint
- Space — jump
- C — crouch
- R — reload
- E — interact
- F — temporal grenade
- ESC — release mouse / pause

## Editing the game

The main gameplay code is in `game.js`.

At the top of `game.js` is the `CONFIG` object. Change values there to tune:

- `loopDuration` — seconds per Echo loop (default 90)
- `playerSpeed`
- `sprintSpeed`
- `jumpVelocity`
- `maxEchoes`
- `enemyCount`
- `mouseSensitivity`
- `fov`

## Core systems implemented

- 3D first-person movement
- Pointer lock with ESC release
- Pistol combat, ammo and reload
- Enemy pursuit with line-of-sight checks
- 90-second recording loop
- Echo playback of movement and gunfire
- Corrupted Echo system
- Temporal grenade slow field
- Sci-fi facility environment
- Reactor objective flow
- Menus, pause screen, HUD and graphics settings
- Basic responsive performance scaling

## Hosting

This folder is designed to run directly from GitHub Pages with no build step.
