/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/enums.js":
/*!**********************!*\
  !*** ./src/enums.js ***!
  \**********************/
/***/ (function(module) {

eval("const TILE_SIZE = 16;\n\nmodule.exports = { TILE_SIZE };\n\n\n//# sourceURL=webpack://coral-island-planner/./src/enums.js?");

/***/ }),

/***/ "./src/js/index.js":
/*!*************************!*\
  !*** ./src/js/index.js ***!
  \*************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _enums__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../enums */ \"./src/enums.js\");\n/* harmony import */ var _enums__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_enums__WEBPACK_IMPORTED_MODULE_0__);\n\n\n/* eslint-disable implicit-arrow-linebreak */\n/* eslint-disable operator-linebreak */\n// Data to be set later\nlet TILLABLE_DATA;\nlet BUILDABLE_DATA;\nlet FARM_EQUIPMENT_DATA;\n// Enum values\nconst svgNamespace = 'http://www.w3.org/2000/svg';\nconst DEFAULT_SPRITE = 'crop';\n\n// Variables to keep track of\nconst state = {\n  isPaintbrush: true,\n  objectTiles: {},\n  objects: {},\n  isDragging: false,\n  currentItem: {\n    sprite: DEFAULT_SPRITE,\n    isCrop: true,\n    tileCoverage: null,\n  },\n};\n\n// Fetch json data for restriction checking\nconst fetchJsonData = async (uri) => {\n  try {\n    const response = await fetch(uri);\n    const json = await response.json();\n    return json;\n  } catch (error) {\n    return { Error: error.stack };\n  }\n};\n\n// Make copy of object\nconst makeDeepCopy = (objToCopy) => JSON.parse(JSON.stringify(objToCopy));\n\n// Simulate \"snap to grid\" behavior\nconst normalizePositionWithSnap = (e, newTarget, snap) => {\n  const target = newTarget || e.currentTarget;\n  const rect = target.getBoundingClientRect();\n  let offsetX = e.clientX - rect.left;\n  let offsetY = e.clientY - rect.top;\n\n  if (snap) {\n    offsetX = Math.floor(offsetX / snap) * snap;\n    offsetY = Math.floor(offsetY / snap) * snap;\n  }\n  return {\n    x: offsetX,\n    y: offsetY,\n  };\n};\n\n// Check if the tile is tillable\nconst isTillable = (x, y) =>\n  TILLABLE_DATA.positions[x] && TILLABLE_DATA.positions[x].includes(y);\n\n// Check if the tile is buildable\nconst isBuildable = (x, y) =>\n  BUILDABLE_DATA.positions[x] && BUILDABLE_DATA.positions[x].includes(y);\n\n// Check if item is placeable\nconst isPlaceable = (x, y) =>\n  (state.currentItem.isCrop && isTillable(x, y)) ||\n  (!state.currentItem.isCrop && isBuildable(x, y));\n\n// Check if item is removable\nconst isRemovable = (x, y) =>\n  state.objectTiles[x] && state.objectTiles[x].includes(y);\n\n// Create svg element to add to editor\nconst createAndAddSvgElementWithAttributes = (\n  svgType,\n  x,\n  y,\n  width,\n  height,\n  fill = null,\n  href = null,\n  textContent = null,\n  id = null,\n  classes = null,\n) => {\n  const plannerCanvasSvg = document.getElementById('planner-canvas__svg');\n\n  const svgElement = document.createElementNS(svgNamespace, svgType);\n  svgElement.setAttribute('x', x);\n  svgElement.setAttribute('y', y);\n  svgElement.setAttribute('width', width);\n  svgElement.setAttribute('height', height);\n  if (fill) {\n    svgElement.setAttribute('fill', fill);\n  }\n  if (href) {\n    svgElement.setAttribute('href', href);\n  }\n  if (textContent) {\n    svgElement.textContent = textContent;\n  }\n  if (id) {\n    svgElement.setAttribute('id', id);\n  }\n  if (classes) {\n    svgElement.setAttribute('class', classes);\n  }\n  plannerCanvasSvg.appendChild(svgElement);\n};\n\nconst updatePointerImage = (href) => {\n  const pointer = document.getElementById('pointer');\n  if (!pointer) {\n    createAndAddSvgElementWithAttributes(\n      'image',\n      0,\n      0,\n      _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n      _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n      null,\n      href,\n      null,\n      'pointer',\n    );\n    return;\n  }\n  pointer.setAttribute('href', href);\n};\n\nconst setupEditorListeners = () => {\n  const plannerCanvasSvg = document.getElementById('planner-canvas__svg');\n\n  // Follow the cursor movement\n  plannerCanvasSvg.addEventListener('mousemove', (e) => {\n    const normalizedPosition = normalizePositionWithSnap(e, null, _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE);\n    const oldPointer = document.getElementById('pointer');\n    const oldPointerText = document.getElementById('pointer-text');\n    const oldTileCoverage = document.getElementById('pointer-tile-coverage');\n    if (oldPointer) {\n      oldPointer.remove();\n    }\n    if (oldPointerText) {\n      oldPointerText.remove();\n    }\n    if (oldTileCoverage) {\n      oldTileCoverage.remove();\n    }\n    const isPlaceableItem = isPlaceable(\n      normalizedPosition.x,\n      normalizedPosition.y,\n    );\n    const svgType = isPlaceableItem ? 'image' : 'rect';\n    const fill = isPlaceableItem ? null : 'red';\n    const href = isPlaceableItem\n      ? `./img/sprites/${state.currentItem.sprite}.png`\n      : null;\n    // Place tile coverage if applicable\n    if (state.currentItem.tileCoverage) {\n      createAndAddSvgElementWithAttributes(\n        'rect',\n        normalizedPosition.x -\n          Math.floor(state.currentItem.tileCoverage.width / 2) * _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n        normalizedPosition.y -\n          Math.floor(state.currentItem.tileCoverage.height / 2) * _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n        state.currentItem.tileCoverage.width * _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n        state.currentItem.tileCoverage.height * _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n        null,\n        null,\n        null,\n        'pointer-tile-coverage',\n        `${state.currentItem.sprite}-tile-coverage`,\n      );\n    }\n    // Place hover tile\n    if (state.isPaintbrush) {\n      createAndAddSvgElementWithAttributes(\n        svgType,\n        normalizedPosition.x,\n        normalizedPosition.y,\n        _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n        _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n        fill,\n        href,\n        null,\n        'pointer',\n      );\n    } else {\n      createAndAddSvgElementWithAttributes(\n        'rect',\n        normalizedPosition.x,\n        normalizedPosition.y,\n        _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n        _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n        '#ff2200',\n        null,\n        null,\n        'pointer',\n      );\n    }\n\n    // Place position text\n    createAndAddSvgElementWithAttributes(\n      'text',\n      normalizedPosition.x,\n      normalizedPosition.y,\n      _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE * 5,\n      _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n      '#fff',\n      null,\n      `X: ${normalizedPosition.x}, Y: ${normalizedPosition.y} | \n      Tile: ${normalizedPosition.x / 16}, ${normalizedPosition.y / 16}`,\n      'pointer-text',\n    );\n  });\n\n  // Place/Remote item\n  plannerCanvasSvg.addEventListener('click', (e) => {\n    if (!state.isDragging) {\n      if (state.isPaintbrush) {\n        const normalizedPosition = normalizePositionWithSnap(\n          e,\n          null,\n          _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n        );\n        const isPlaceableItem = isPlaceable(\n          normalizedPosition.x,\n          normalizedPosition.y,\n        );\n        if (!isPlaceableItem) {\n          console.log('not allowed to place that here');\n          return;\n        }\n        if (\n          !state.objectTiles[normalizedPosition.x] ||\n          !state.objectTiles[normalizedPosition.x].includes(\n            normalizedPosition.y,\n          )\n        ) {\n          if (!state.objectTiles[normalizedPosition.x]) {\n            state.objectTiles[normalizedPosition.x] = [];\n          }\n          state.objectTiles[normalizedPosition.x].push(normalizedPosition.y);\n          state.objects[\n            `${normalizedPosition.x}-${normalizedPosition.y}`\n          ] = `${state.currentItem.sprite}-${normalizedPosition.x}-${normalizedPosition.y}`;\n          // Place tile coverage if applicable\n          if (state.currentItem.tileCoverage) {\n            createAndAddSvgElementWithAttributes(\n              'rect',\n              normalizedPosition.x -\n                Math.floor(state.currentItem.tileCoverage.width / 2) *\n                  _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n              normalizedPosition.y -\n                Math.floor(state.currentItem.tileCoverage.height / 2) *\n                  _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n              state.currentItem.tileCoverage.width * _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n              state.currentItem.tileCoverage.height * _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n              null,\n              null,\n              null,\n              `${state.currentItem.sprite}-${normalizedPosition.x}-${normalizedPosition.y}-tile-coverage`,\n              `${state.currentItem.sprite}-tile-coverage`,\n            );\n          }\n          createAndAddSvgElementWithAttributes(\n            'image',\n            normalizedPosition.x,\n            normalizedPosition.y,\n            _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n            _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n            null,\n            `./img/sprites/${state.currentItem.sprite}.png`,\n            null,\n            `${state.currentItem.sprite}-${normalizedPosition.x}-${normalizedPosition.y}`,\n          );\n        } else {\n          console.log('there is already something here');\n        }\n      } else {\n        const normalizedPosition = normalizePositionWithSnap(\n          e,\n          null,\n          _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n        );\n        if (isRemovable(normalizedPosition.x, normalizedPosition.y)) {\n          const itemToBeDeleted =\n            state.objects[`${normalizedPosition.x}-${normalizedPosition.y}`];\n          // Delete item from state.objectTiles\n          const copyOfObjectTiles = makeDeepCopy(state.objectTiles);\n          const tilesInThisRow = copyOfObjectTiles[normalizedPosition.x];\n          const indexOfItemToBeRemoved = tilesInThisRow.indexOf(\n            normalizedPosition.y,\n          );\n          if (indexOfItemToBeRemoved > -1) {\n            tilesInThisRow.splice(indexOfItemToBeRemoved, 1);\n          }\n          state.objectTiles[normalizedPosition.x] = tilesInThisRow;\n          // Delete item from DOM\n          const svgItemToBeDeleted = document.getElementById(itemToBeDeleted);\n          const svgTileCoverageToBeDeleted = document.getElementById(\n            `${itemToBeDeleted}-tile-coverage`,\n          );\n          if (svgItemToBeDeleted) {\n            svgItemToBeDeleted.remove();\n          }\n          if (svgTileCoverageToBeDeleted) {\n            svgTileCoverageToBeDeleted.remove();\n          }\n          // Delete item from objects\n          const copyOfObjects = makeDeepCopy(state.objects);\n          delete copyOfObjects[\n            `${normalizedPosition.x}-${normalizedPosition.y}`\n          ];\n          state.objects = copyOfObjects;\n        } else {\n          console.log('nothing to delete here');\n        }\n      }\n    }\n  });\n};\n\nconst setupFormListeners = () => {\n  const editorMenu = document.getElementById('editor-menu');\n  const editorMenuInputs = editorMenu.querySelectorAll('input');\n  editorMenuInputs.forEach((formInput) => {\n    formInput.onclick = (e) => {\n      console.log(e);\n      console.log(e.target.value);\n      console.log(e.target.name);\n      if (e.target.name === 'editor-tool') {\n        if (\n          state.isPaintbrush ===\n          (e.target.value.toLowerCase() === 'paintbrush')\n        ) {\n          console.log('already on this tool');\n          return;\n        }\n        state.isPaintbrush = e.target.value.toLowerCase() === 'paintbrush';\n        document.getElementById('eraser').classList.toggle('selected');\n        document.getElementById('paintbrush').classList.toggle('selected');\n        if (state.isPaintbrush) {\n          state.currentItem.sprite = DEFAULT_SPRITE;\n          state.currentItem.isCrop = true;\n          state.currentItem.tileCoverage = null;\n        } else {\n          const oldPointer = document.getElementById('pointer');\n          const oldTileCoverage = document.getElementById(\n            'pointer-tile-coverage',\n          );\n          if (oldPointer) {\n            oldPointer.remove();\n          }\n          if (oldTileCoverage) {\n            oldTileCoverage.remove();\n          }\n          state.currentItem.tileCoverage = null;\n          const normalizedPosition = normalizePositionWithSnap(\n            e,\n            null,\n            _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n          );\n          createAndAddSvgElementWithAttributes(\n            'rect',\n            normalizedPosition.x,\n            normalizedPosition.y,\n            _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n            _enums__WEBPACK_IMPORTED_MODULE_0__.TILE_SIZE,\n            '#ff2200',\n            null,\n            null,\n            'pointer',\n          );\n        }\n      }\n    };\n  });\n  const editorMenuSelects = document.querySelectorAll('select');\n  editorMenuSelects.forEach((formSelect) => {\n    formSelect.onchange = (e) => {\n      if (!state.isPaintbrush) {\n        console.log('hi');\n        state.isPaintbrush = true;\n        document.getElementById('eraser').classList.toggle('selected');\n        document.getElementById('paintbrush').classList.toggle('selected');\n      }\n      const formSelectType = e.target.id;\n      state.currentItem.sprite = e.target.value || DEFAULT_SPRITE;\n      state.currentItem.isCrop = e.target.value\n        ? formSelectType.startsWith('crops')\n        : true;\n      state.currentItem.tileCoverage =\n        e.target.value && formSelectType.startsWith('farm-equipment')\n          ? FARM_EQUIPMENT_DATA[e.target.value].tileCoverage\n          : null;\n      console.log(state.currentItem);\n      const href = `./img/sprites/${state.currentItem.sprite}.png`;\n      updatePointerImage(href);\n    };\n  });\n};\n\nconst getJsonData = async () => {\n  TILLABLE_DATA = await fetchJsonData(\n    'https://raw.githubusercontent.com/geraldiner/coral-island-planner/main/public/js/data/regular_tillable.json',\n  );\n  BUILDABLE_DATA = await fetchJsonData(\n    'https://raw.githubusercontent.com/geraldiner/coral-island-planner/main/public/js/data/regular_buildable.json',\n  );\n  FARM_EQUIPMENT_DATA = await fetchJsonData(\n    'https://raw.githubusercontent.com/geraldiner/coral-island-planner/main/public/js/data/farm_equipment.json',\n  );\n  setupEditorListeners();\n  setupFormListeners();\n};\nwindow.addEventListener('load', () => {\n  console.log('window onload says hi');\n  getJsonData();\n});\n\n\n//# sourceURL=webpack://coral-island-planner/./src/js/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/js/index.js");
/******/ 	
/******/ })()
;