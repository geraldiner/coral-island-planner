/* eslint-disable operator-linebreak */
// Data to be set later
let TILLABLE_DATA;
let BUILDABLE_DATA;
let FARM_EQUIPMENT_DATA;

// Enum values
const svgNamespace = 'http://www.w3.org/2000/svg';
const TILE_SIZE = 16;
const DEFAULT_SPRITE = 'crop';
const EDITOR_MENU_SELECT_TO_DATA_MAP = {
  'farm-equipment-select': FARM_EQUIPMENT_DATA,
};

// Variables to keep track of
let currentSprite = 'crop';
let isCrop = true;
const objectTiles = {};
const isDrag = false;

// Fetch json data for restriction checking
const fetchJsonData = async (uri) => {
  try {
    const response = await fetch(uri);
    const json = await response.json();
    return json;
  } catch (error) {
    return { Error: error.stack };
  }
};

// Simulate "snap to grid" behavior
const normalizePositionWithSnap = (e, newTarget, snap) => {
  const target = newTarget || e.currentTarget;
  const rect = target.getBoundingClientRect();
  let offsetX = e.clientX - rect.left;
  let offsetY = e.clientY - rect.top;

  if (snap) {
    offsetX = Math.floor(offsetX / snap) * snap;
    offsetY = Math.floor(offsetY / snap) * snap;
  }
  return {
    x: offsetX,
    y: offsetY,
  };
};

// Check if the tile is tillable
const isTillable = (x, y) => {
  if (TILLABLE_DATA.positions[x] && TILLABLE_DATA.positions[x].includes(y)) {
    return true;
  }
  return false;
};

// Check if the tile is buildable
const isBuildable = (x, y) => {
  if (BUILDABLE_DATA.positions[x] && BUILDABLE_DATA.positions[x].includes(y)) {
    return true;
  }
  return false;
};

// Create svg element to add to editor
const createSvgElementWithAttributes = (
  svgType,
  x,
  y,
  width,
  height,
  fill = null,
  style = null,
  href = null,
  textContent = null,
  id = null,
  classes = null,
) => {
  const svgElement = document.createElementNS(svgNamespace, svgType);
  svgElement.setAttribute('x', x);
  svgElement.setAttribute('y', y);
  svgElement.setAttribute('width', width);
  svgElement.setAttribute('height', height);
  if (fill) {
    svgElement.setAttribute('fill', fill);
  }
  if (style) {
    svgElement.setAttribute('style', style);
  }
  if (href) {
    svgElement.setAttribute('href', href);
  }
  if (textContent) {
    svgElement.textContent = textContent;
  }
  if (id) {
    svgElement.setAttribute('id', id);
  }
  if (classes) {
    svgElement.setAttribute('class', classes);
  }
  return svgElement;
};

const updatePointerImage = (pointer, newImage) => {
  pointer.setAttribute('href', newImage);
};

const setupEditorListeners = () => {
  const plannerCanvasSvg = document.querySelector('#planner-canvas__svg');

  // Follow the cursor movement
  plannerCanvasSvg.addEventListener('mousemove', (e) => {
    const normalizedPosition = normalizePositionWithSnap(e, null, TILE_SIZE);
    const oldPointer = document.getElementById('pointer');
    const oldPointerText = document.getElementById('pointer-text');
    if (oldPointer) {
      oldPointer.remove();
      oldPointerText.remove();
    }
    const isPlaceableItem =
      (isCrop && isTillable(normalizedPosition.x, normalizedPosition.y)) ||
      (!isCrop && isBuildable(normalizedPosition.x, normalizedPosition.y));
    const svgType = isPlaceableItem ? 'image' : 'rect';
    const fill = isPlaceableItem ? null : 'red';
    const href = isPlaceableItem ? `./img/sprites/${currentSprite}.png` : null;
    const pointer = createSvgElementWithAttributes(
      svgType,
      normalizedPosition.x,
      normalizedPosition.y,
      TILE_SIZE,
      TILE_SIZE,
      fill,
      'opacity: 0.5;',
      href,
      null,
      'pointer',
    );
    const text = createSvgElementWithAttributes(
      'text',
      normalizedPosition.x,
      normalizedPosition.y,
      TILE_SIZE * 5,
      TILE_SIZE,
      '#fff',
      null,
      null,
      `X: ${normalizedPosition.x}, Y: ${normalizedPosition.y} | 
      Tile: ${normalizedPosition.x / 16}, ${normalizedPosition.y / 16}`,
      'pointer-text',
    );
    plannerCanvasSvg.appendChild(pointer);
    plannerCanvasSvg.appendChild(text);
  });

  // Place current sprite
  plannerCanvasSvg.addEventListener('click', (e) => {
    if (!isDrag) {
      const normalizedPosition = normalizePositionWithSnap(e, null, TILE_SIZE);
      if (!isTillable(normalizedPosition.x, normalizedPosition.y)) {
        console.log('this tile is not tillable');
        return;
      }
      if (
        !objectTiles[normalizedPosition.x] ||
        !objectTiles[normalizedPosition.x].includes(normalizedPosition.y)
      ) {
        if (!objectTiles[normalizedPosition.x]) {
          objectTiles[normalizedPosition.x] = [];
        }
        objectTiles[normalizedPosition.x].push(normalizedPosition.y);
        const sprite = createSvgElementWithAttributes(
          'image',
          normalizedPosition.x,
          normalizedPosition.y,
          TILE_SIZE,
          TILE_SIZE,
          null,
          null,
          `./img/sprites/${currentSprite}.png`,
        );
        plannerCanvasSvg.appendChild(sprite);
      } else {
        console.log('there is already something here');
      }
    }
  });
};

const setupFormListeners = () => {
  const editorMenu = document.getElementById('editor-menu');
  const editorMenuSelects = document.querySelectorAll('select');
  editorMenuSelects.forEach((formSelect) => {
    formSelect.onchange = (e) => {
      console.log(e);
      const formSelectType = e.target.id;
      console.log(formSelectType);
      currentSprite = e.target.value || DEFAULT_SPRITE;
      isCrop =
        EDITOR_MENU_SELECT_TO_DATA_MAP[formSelectType][currentSprite].isCrop;
      const pointer = document.getElementById('pointer');
      updatePointerImage(pointer, `./img/sprites/${currentSprite}.png`);
    };
  });
};

const getJsonData = async () => {
  TILLABLE_DATA = await fetchJsonData(
    'https://raw.githubusercontent.com/geraldiner/coral-island-planner/main/public/js/data/regular_tillable.json',
  );
  BUILDABLE_DATA = await fetchJsonData(
    'https://raw.githubusercontent.com/geraldiner/coral-island-planner/main/public/js/data/regular_buildable.json',
  );
  FARM_EQUIPMENT_DATA = await fetchJsonData(
    'https://raw.githubusercontent.com/geraldiner/coral-island-planner/main/public/js/data/farm_equipment.json',
  );
  setupEditorListeners();
  setupFormListeners();
};
window.addEventListener('load', () => {
  console.log('window onload says hi');
  getJsonData();
});
