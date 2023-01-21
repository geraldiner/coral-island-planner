const svgNamespace = 'http://www.w3.org/2000/svg';
const TILE_SIZE = 16;
const currentSprite = 'crop';
const objectTiles = {};

const plannerCanvasSvg = document.querySelector('#planner-canvas__svg');

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

// Create svg element to add to editor
const createSvgElementWithAttributes = (
  svgType,
  x,
  y,
  width,
  height,
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
  if (style) {
    svgElement.setAttributeNS(null, 'style', 'opacity: 0.5;');
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

window.addEventListener('load', () => {
  console.log('window onload says hi');
  // Follow the cursor movement
  plannerCanvasSvg.addEventListener('mousemove', (e) => {
    const normalizedPosition = normalizePositionWithSnap(e, null, TILE_SIZE);
    console.log(normalizedPosition);
    const oldPointer = document.getElementById('pointer');
    if (oldPointer) {
      oldPointer.remove();
    }
    const pointer = createSvgElementWithAttributes(
      'image',
      normalizedPosition.x,
      normalizedPosition.y,
      TILE_SIZE,
      TILE_SIZE,
      'opacity: 0.5;',
      `./img/sprites/crops/${currentSprite}.png`,
      'pointer',
    );
    plannerCanvasSvg.appendChild(pointer);
  });

  // Place current sprite
  plannerCanvasSvg.addEventListener('click', (e) => {
    const normalizedPosition = normalizePositionWithSnap(e, null, TILE_SIZE);
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
        `./img/sprites/crops/${currentSprite}.png`,
      );
      plannerCanvasSvg.appendChild(sprite);
    } else {
      console.log('there is already something here');
    }
  });
});
