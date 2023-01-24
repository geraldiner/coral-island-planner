/* eslint-disable implicit-arrow-linebreak */
import { DEFAULT_SPRITE, SVG_NAMESPACE, TILE_SIZE } from './enums';
import { FARM_EQUIPMENT_DATA } from './data/farm_equipment';
import { BUILDABLE_DATA } from './data/regular_buildable';
import { TILLABLE_DATA } from './data/regular_tillable';

// Make copy of object
const makeDeepCopy = (objToCopy) => JSON.parse(JSON.stringify(objToCopy));

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
const isTillable = (x, y) =>
  TILLABLE_DATA.positions[x] && TILLABLE_DATA.positions[x].includes(y);

// Check if the tile is buildable
const isBuildable = (x, y) =>
  BUILDABLE_DATA.positions[x] && BUILDABLE_DATA.positions[x].includes(y);

// Check if item is placeable
const isPlaceable = (item, x, y) =>
  (item.isCrop && isTillable(x, y)) || (!item.isCrop && isBuildable(x, y));

// Check if item is removable
const isRemovable = (objectTiles, x, y) =>
  objectTiles[x] && objectTiles[x].includes(y);

// Create svg element to add to editor
const createAndAddSvgElementWithAttributes = (
  svgType,
  x,
  y,
  width,
  height,
  fill = null,
  href = null,
  textContent = null,
  id = null,
  classes = null,
) => {
  const plannerCanvasSvg = document.getElementById('planner-canvas__svg');

  const svgElement = document.createElementNS(SVG_NAMESPACE, svgType);
  svgElement.setAttribute('x', x);
  svgElement.setAttribute('y', y);
  svgElement.setAttribute('width', width);
  svgElement.setAttribute('height', height);
  if (fill) {
    svgElement.setAttribute('fill', fill);
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
  plannerCanvasSvg.appendChild(svgElement);
};

const updatePointerImage = (href) => {
  const pointer = document.getElementById('pointer');
  if (!pointer) {
    createAndAddSvgElementWithAttributes(
      'image',
      0,
      0,
      TILE_SIZE,
      TILE_SIZE,
      null,
      href,
      null,
      'pointer',
    );
    return;
  }
  pointer.setAttribute('href', href);
};

export {
  createAndAddSvgElementWithAttributes,
  isBuildable,
  isPlaceable,
  isRemovable,
  isTillable,
  normalizePositionWithSnap,
  makeDeepCopy,
  updatePointerImage,
};
