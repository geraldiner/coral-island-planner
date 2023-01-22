const fs = require('fs');

const tillableFilePath = './public/js/data/regular_tillable.json';
const TILE_SIZE = 16;

const tillableTiles = {};
const tillablePositions = {};

const generateTillableTilesAndPositions = (start, end, tileSize) => {
  for (let { x } = start; x <= end.x; x += tileSize) {
    for (let { y } = start; y <= end.y; y += tileSize) {
      const tileX = x / tileSize;
      const tileY = y / tileSize;
      if (!tillableTiles[tileX]) {
        tillableTiles[tileX] = [];
      }
      tillableTiles[tileX].push(tileY);
      if (!tillablePositions[x]) {
        tillablePositions[x] = [];
      }
      tillablePositions[x].push(y);
    }
  }
};
const tillableStart = { x: 112, y: 192 };
const tillableEnd = { x: 1184, y: 832 };
generateTillableTilesAndPositions(tillableStart, tillableEnd, TILE_SIZE);

const tillableSectionStart = { x: 512, y: 848 };
const tillableSectionEnd = { x: 1184, y: 1120 };
generateTillableTilesAndPositions(
  tillableSectionStart,
  tillableSectionEnd,
  TILE_SIZE,
);
const tillableSectionStart2 = { x: 1200, y: 656 };
const tillableSectionEnd2 = { x: 1312, y: 1120 };
generateTillableTilesAndPositions(
  tillableSectionStart2,
  tillableSectionEnd2,
  TILE_SIZE,
);

const data = {
  tiles: tillableTiles,
  positions: tillablePositions,
};

fs.writeFile(tillableFilePath, JSON.stringify(data), (error) => {
  if (error) {
    throw error;
  }
});
