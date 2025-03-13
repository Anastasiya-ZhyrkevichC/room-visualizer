# room-visualizer

`npm start`

# Done:

- _4 Feb:_
  - Starting the basic default application
  - Form on the top + Rotating cube below
- _19 Feb:_
  - Axis for rendering
  - Camera position change to look from aside
  - Problem: the room corner is in the center of the Room -> Need to come back to RoomProvider
- _20 Feb:_
  - Added PositionAdjuster
  - prettier
  - <img src="./img_progress/2025-02-20.png" alt="Alt text" width="300" height="300">
- _12 Mar:_
  - Raycaster is now using `canvas.getBoundingClientRect()`, which is the correct usage of the Raycaster
- _13 Mar:_
  - Raycasting against the whole room, when the box is selected. Now, the nearest plan is get the render a cupboard + find the potential places for rendering the cupboard.



# Nearest plans:

- When the box is selected, then render the cupboard somewhere in the room around the wall.

- Get 2D plan.


- Current error
```
ERROR
R3F: Hooks can only be used within the Canvas component!
useStore@http://localhost:3000/static/js/bundle.js:14010:30
useThree@http://localhost:3000/static/js/bundle.js:14019:18
RotatingCubeWrapper@http://localhost:3000/static/js/bundle.js:910:60
renderWithHooks@http://localhost:3000/static/js/bundle.js:35184:31
mountIndeterminateComponent@http://localhost:3000/static/js/bundle.js:39155:32
callCallback@http://localhost:3000/static/js/bundle.js:25440:23
dispatchEvent@[native code]
invokeGuardedCallbackDev@http://localhost:3000/static/js/bundle.js:25484:33
invokeGuardedCallback@http://localhost:3000/static/js/bundle.js:25541:40
beginWork$1@http://localhost:3000/static/js/bundle.js:45439:32
performUnitOfWork@http://localhost:3000/static/js/bundle.js:44687:27
workLoopSync@http://localhost:3000/static/js/bundle.js:44610:26
renderRootSync@http://localhost:3000/static/js/bundle.js:44583:23
performConcurrentWorkOnRoot@http://localhost:3000/static/js/bundle.js:43978:92
performConcurrentWorkOnRoot@[native code]
workLoop@http://localhost:3000/static/js/bundle.js:47806:46
flushWork@http://localhost:3000/static/js/bundle.js:47784:26
performWorkUntilDeadline@http://localhost:3000/static/js/bundle.js:48021:46
```


# Comments:

1. This is fine:

```
Search for the keywords to learn more about each warning.
To ignore, add // eslint-disable-next-line to the line before.

WARNING in ./node_modules/@react-three/drei/node_modules/@mediapipe/tasks-vision/vision_bundle.mjs
Module Warning (from ./node_modules/source-map-loader/dist/cjs.js):
Failed to parse source map from '/Users/anast/Documents/codesignal/room-visualizer/node_modules/@react-three/drei/node_modules/@mediapipe/tasks-vision/vision_bundle_mjs.js.map' file: Error: ENOENT: no such file or directory, open '/Users/anast/Documents/codesignal/room-visualizer/node_modules/@react-three/drei/node_modules/@mediapipe/tasks-vision/vision_bundle_mjs.js.map'
```
