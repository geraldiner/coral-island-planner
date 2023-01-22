const svgNamespace = 'http://www.w3.org/2000/svg';
const TILE_SIZE = 16;
// variables to keep track of
const currentSprite = 'crop';
const objectTiles = {};
const isDrag = false;
let TILLABLE_DATA;

const plannerCanvasSvg = document.querySelector('#planner-canvas__svg');

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
  id = null,
  classes = null,
) => {
  const svgElement = document.createElementNS(svgNamespace, svgType);
  svgElement.setAttributeNS(null, 'x', x);
  svgElement.setAttributeNS(null, 'y', y);
  svgElement.setAttributeNS(null, 'width', width);
  svgElement.setAttributeNS(null, 'height', height);
  if (fill) {
    svgElement.setAttributeNS(null, 'fill', fill);
  }
  if (style) {
    svgElement.setAttributeNS(null, 'style', style);
  }
  if (href) {
    svgElement.setAttributeNS(null, 'href', href);
  }

  if (id) {
    svgElement.setAttributeNS(null, 'id', id);
  }
  if (classes) {
    svgElement.setAttributeNS(null, 'class', classes);
  }
  return svgElement;
};

const setupListeners = () => {
  // Follow the cursor movement
  plannerCanvasSvg.addEventListener('mousemove', (e) => {
    const normalizedPosition = normalizePositionWithSnap(e, null, TILE_SIZE);
    console.log(normalizedPosition);
    const oldPointer = document.getElementById('pointer');
    if (oldPointer) {
      oldPointer.remove();
    }
    const isTillableTile = isTillable(
      normalizedPosition.x,
      normalizedPosition.y,
    );
    const svgType = isTillableTile ? 'image' : 'rect';
    const fill = isTillableTile ? null : 'red';
    const href = isTillableTile
      ? `./img/sprites/crops/${currentSprite}.png`
      : null;
    const pointer = createSvgElementWithAttributes(
      svgType,
      normalizedPosition.x,
      normalizedPosition.y,
      TILE_SIZE,
      TILE_SIZE,
      fill,
      'opacity: 0.5;',
      href,
      'pointer',
    );
    plannerCanvasSvg.appendChild(pointer);
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
        !objectTiles[normalizedPosition.x]
        || !objectTiles[normalizedPosition.x].includes(normalizedPosition.y)
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
          `./img/sprites/crops/${currentSprite}.png`,
        );
        plannerCanvasSvg.appendChild(sprite);
      } else {
        console.log('there is already something here');
      }
    }
  });
};

const getJsonData = async () => {
  TILLABLE_DATA = await fetchJsonData(
    'https://raw.githubusercontent.com/geraldiner/coral-island-planner/main/public/js/data/regular_tillable.json',
  );
  setupListeners();
};
window.addEventListener('load', () => {
  console.log('window onload says hi');
  getJsonData();
});
