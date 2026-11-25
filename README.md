# Robotics 101

A 48-slide self-study course on how a robot arm decides where to move: kinematics, feedback
control, classical motion planning, learned policies and simulation. It has 12 running demos
(forward and inverse kinematics, PID, configuration space, A*, PRM, RRT, RRT*, trajectory
optimization, potential fields, diffusion sampling) and 6 Python labs.

Live at https://khanhnd61-vr.github.io/robotics101/

There is no build step: serve the folder with any static server.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

| Path | What it holds |
|---|---|
| `index.html` | The 48 slides, one `<section>` each on a 1920 × 1080 canvas, and the toolbar |
| `assets/deck.css` | The look of the slides: palette, type scale, cards, code panels |
| `assets/viewer.css` | The page around the slides: scaling stage, element defaults, toolbar |
| `assets/viewer.js` | Paging, scaling, connector drawing, and starting each demo when its slide is shown |

## Moving around

Arrow keys, Space, Page Up and Page Down change slide; Home and End jump to the ends; F toggles
full screen. On a touch screen, swipe left or right. The toolbar also jumps to any of the six
parts. Every slide has its own address, `#slide-N`.

## How a slide is written

- A demo is an `<x-embed>` holding a `<template>` with a small page (a canvas and a script).
  The viewer runs it in a frame while its slide is on screen and removes it afterwards, so
  every demo restarts on each visit and only one runs at a time.
- An `<x-connector>` is an arrow. With `x1 y1 x2 y2` it is drawn between those points of its
  parent box; without them it is a short arrow between two boxes in a row.
- Moving dots in drawings are SVG `<animateMotion>`; staged arrivals are the `.in` class.

## Lab code

The listings on slides 39 to 44 were run as printed with Python 3.13, numpy 2.5, mujoco 4.0,
torch 2.15, gymnasium 1.4 and stable-baselines3 2.9.
