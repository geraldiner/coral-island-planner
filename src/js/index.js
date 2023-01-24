/* eslint-disable operator-linebreak */
import { DEFAULT_ITEM, TILE_SIZE } from './enums';
import { FARM_EQUIPMENT_DATA } from './data/farm_equipment';
import {
  createAndAddSvgElementWithAttributes,
  isPlaceable,
  isRemovable,
  makeDeepCopy,
  normalizePositionWithSnap,
  updatePointerImage,
} from './utils';
// Variables to keep track of
const state = {
  isPaintbrush: true,
  objectTiles: {},
  objects: {},
  isDragging: false,
  currentItem: DEFAULT_ITEM,
};

const setupEditorListeners = () => {
  const plannerCanvasSvg = document.getElementById('planner-canvas__svg');

  // Follow the cursor movement
  plannerCanvasSvg.addEventListener('mousemove', (e) => {
    const normalizedPosition = normalizePositionWithSnap(e, null, TILE_SIZE);
    const oldPointer = document.getElementById('pointer');
    const oldPointerText = document.getElementById('pointer-text');
    const oldTileCoverage = document.getElementById('pointer-tile-coverage');
    if (oldPointer) {
      oldPointer.remove();
    }
    if (oldPointerText) {
      oldPointerText.remove();
    }
    if (oldTileCoverage) {
      oldTileCoverage.remove();
    }
    const isPlaceableItem = isPlaceable(
      state.currentItem,
      normalizedPosition.x,
      normalizedPosition.y,
    );
    const svgType = isPlaceableItem ? 'image' : 'rect';
    const fill = isPlaceableItem ? null : 'red';
    const href = isPlaceableItem
      ? `./img/sprites/${state.currentItem.sprite}.png`
      : null;
    // Place tile coverage if applicable
    if (state.currentItem.tileCoverage) {
      createAndAddSvgElementWithAttributes(
        'rect',
        normalizedPosition.x -
          Math.floor(state.currentItem.tileCoverage.width / 2) * TILE_SIZE,
        normalizedPosition.y -
          Math.floor(state.currentItem.tileCoverage.height / 2) * TILE_SIZE,
        state.currentItem.tileCoverage.width * TILE_SIZE,
        state.currentItem.tileCoverage.height * TILE_SIZE,
        null,
        null,
        null,
        'pointer-tile-coverage',
        `${state.currentItem.sprite}-tile-coverage`,
      );
    }
    // Place hover tile
    if (state.isPaintbrush) {
      createAndAddSvgElementWithAttributes(
        svgType,
        normalizedPosition.x,
        normalizedPosition.y,
        TILE_SIZE,
        TILE_SIZE,
        fill,
        href,
        null,
        'pointer',
      );
    } else {
      createAndAddSvgElementWithAttributes(
        'rect',
        normalizedPosition.x,
        normalizedPosition.y,
        TILE_SIZE,
        TILE_SIZE,
        '#ff2200',
        null,
        null,
        'pointer',
      );
    }

    // Place position text
    createAndAddSvgElementWithAttributes(
      'text',
      normalizedPosition.x,
      normalizedPosition.y,
      TILE_SIZE * 5,
      TILE_SIZE,
      '#fff',
      null,
      `X: ${normalizedPosition.x}, Y: ${normalizedPosition.y} | 
      Tile: ${normalizedPosition.x / 16}, ${normalizedPosition.y / 16}`,
      'pointer-text',
    );
  });

  // Place/Remote item
  plannerCanvasSvg.addEventListener('click', (e) => {
    if (!state.isDragging) {
      if (state.isPaintbrush) {
        const normalizedPosition = normalizePositionWithSnap(
          e,
          null,
          TILE_SIZE,
        );
        const isPlaceableItem = isPlaceable(
          state.currentItem,
          normalizedPosition.x,
          normalizedPosition.y,
        );
        if (!isPlaceableItem) {
          console.log('not allowed to place that here');
          return;
        }
        if (
          !state.objectTiles[normalizedPosition.x] ||
          !state.objectTiles[normalizedPosition.x].includes(
            normalizedPosition.y,
          )
        ) {
          if (!state.objectTiles[normalizedPosition.x]) {
            state.objectTiles[normalizedPosition.x] = [];
          }
          state.objectTiles[normalizedPosition.x].push(normalizedPosition.y);
          state.objects[
            `${normalizedPosition.x}-${normalizedPosition.y}`
          ] = `${state.currentItem.sprite}-${normalizedPosition.x}-${normalizedPosition.y}`;
          // Place tile coverage if applicable
          if (state.currentItem.tileCoverage) {
            createAndAddSvgElementWithAttributes(
              'rect',
              normalizedPosition.x -
                Math.floor(state.currentItem.tileCoverage.width / 2) *
                  TILE_SIZE,
              normalizedPosition.y -
                Math.floor(state.currentItem.tileCoverage.height / 2) *
                  TILE_SIZE,
              state.currentItem.tileCoverage.width * TILE_SIZE,
              state.currentItem.tileCoverage.height * TILE_SIZE,
              null,
              null,
              null,
              `${state.currentItem.sprite}-${normalizedPosition.x}-${normalizedPosition.y}-tile-coverage`,
              `${state.currentItem.sprite}-tile-coverage`,
            );
          }
          createAndAddSvgElementWithAttributes(
            'image',
            normalizedPosition.x,
            normalizedPosition.y,
            TILE_SIZE,
            TILE_SIZE,
            null,
            `./img/sprites/${state.currentItem.sprite}.png`,
            null,
            `${state.currentItem.sprite}-${normalizedPosition.x}-${normalizedPosition.y}`,
          );
        } else {
          console.log('there is already something here');
        }
      } else {
        const normalizedPosition = normalizePositionWithSnap(
          e,
          null,
          TILE_SIZE,
        );
        if (
          isRemovable(
            state.objectTiles,
            normalizedPosition.x,
            normalizedPosition.y,
          )
        ) {
          const itemToBeDeleted =
            state.objects[`${normalizedPosition.x}-${normalizedPosition.y}`];
          // Delete item from state.objectTiles
          const copyOfObjectTiles = makeDeepCopy(state.objectTiles);
          const tilesInThisRow = copyOfObjectTiles[normalizedPosition.x];
          const indexOfItemToBeRemoved = tilesInThisRow.indexOf(
            normalizedPosition.y,
          );
          if (indexOfItemToBeRemoved > -1) {
            tilesInThisRow.splice(indexOfItemToBeRemoved, 1);
          }
          state.objectTiles[normalizedPosition.x] = tilesInThisRow;
          // Delete item from DOM
          const svgItemToBeDeleted = document.getElementById(itemToBeDeleted);
          const svgTileCoverageToBeDeleted = document.getElementById(
            `${itemToBeDeleted}-tile-coverage`,
          );
          if (svgItemToBeDeleted) {
            svgItemToBeDeleted.remove();
          }
          if (svgTileCoverageToBeDeleted) {
            svgTileCoverageToBeDeleted.remove();
          }
          // Delete item from objects
          const copyOfObjects = makeDeepCopy(state.objects);
          delete copyOfObjects[
            `${normalizedPosition.x}-${normalizedPosition.y}`
          ];
          state.objects = copyOfObjects;
        } else {
          console.log('nothing to delete here');
        }
      }
    }
  });
};

const setupFormListeners = () => {
  const editorMenu = document.getElementById('editor-menu');
  const editorMenuInputs = editorMenu.querySelectorAll('input');
  editorMenuInputs.forEach((formInput) => {
    formInput.onclick = (e) => {
      console.log(e);
      console.log(e.target.value);
      console.log(e.target.name);
      if (e.target.name === 'editor-tool') {
        if (
          state.isPaintbrush ===
          (e.target.value.toLowerCase() === 'paintbrush')
        ) {
          console.log('already on this tool');
          return;
        }
        state.isPaintbrush = e.target.value.toLowerCase() === 'paintbrush';
        document.getElementById('eraser').classList.toggle('selected');
        document.getElementById('paintbrush').classList.toggle('selected');
        if (state.isPaintbrush) {
          state.currentItem = DEFAULT_ITEM;
        } else {
          const oldPointer = document.getElementById('pointer');
          const oldTileCoverage = document.getElementById(
            'pointer-tile-coverage',
          );
          if (oldPointer) {
            oldPointer.remove();
          }
          if (oldTileCoverage) {
            oldTileCoverage.remove();
          }
          state.currentItem.tileCoverage = null;
          const normalizedPosition = normalizePositionWithSnap(
            e,
            null,
            TILE_SIZE,
          );
          createAndAddSvgElementWithAttributes(
            'rect',
            normalizedPosition.x,
            normalizedPosition.y,
            TILE_SIZE,
            TILE_SIZE,
            '#ff2200',
            null,
            null,
            'pointer',
          );
        }
        document.getElementById('current-tool').innerText = `Current tool: ${
          e.target.value
        }${state.isPaintbrush ? ` - ${state.currentItem.displayName}` : ''}`;
      }
    };
  });
  const editorMenuSelects = document.querySelectorAll('select');
  editorMenuSelects.forEach((formSelect) => {
    formSelect.onchange = (e) => {
      if (!state.isPaintbrush) {
        state.isPaintbrush = true;
        document.getElementById('eraser').classList.toggle('selected');
        document.getElementById('paintbrush').classList.toggle('selected');
      }
      state.currentItem =
        e.target.value === 'crop'
          ? DEFAULT_ITEM
          : FARM_EQUIPMENT_DATA[e.target.value];
      const href = `./img/sprites/${state.currentItem.sprite}.png`;
      updatePointerImage(href);
      document.getElementById('current-tool').innerText = `Current tool: ${
        state.isPaintbrush ? 'Paintbrush' : 'Eraser'
      }${state.isPaintbrush ? ` - ${state.currentItem.displayName}` : ''}`;
    };
  });
};

window.addEventListener('load', () => {
  console.log('window.onload says hi');
  setupFormListeners();
  setupEditorListeners();
});
