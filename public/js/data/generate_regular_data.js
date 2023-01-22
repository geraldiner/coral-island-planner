const fs = require('fs');

const tiledMapDataFilePath = './public/js/data/coral_island_planner.json';
const tillableOutputFilePath = './public/js/data/regular_tillable.json';
const buildableOutputFilePath = './public/js/data/regular_buildable.json';
const TILE_SIZE = 16;
const TILED_LAYER_KEYS = {
  BUILDABLE: 'Buildable area',
  TILLABLE: 'Tillable area (field)',
  NON_BUILDABLE_WATER: 'Non-Buildable area (water)',
  NON_BUILDABLE_GRASS: 'Non-Buildable area (grass)',
  NON_BUILDABLE_BUILDING: 'Non-Buildable area (building)',
};
const TILED_WIDTH = 90;
const TILED_HEIGHT = 72;

const makeDeepCopy = (objToCopy) => JSON.parse(JSON.stringify(objToCopy));

const writeToFile = (filePath, dataToWrite) => {
  fs.writeFile(filePath, JSON.stringify(dataToWrite), (error) => {
    if (error) {
      throw error;
    }
  });
};

const generateTillableTilesAndPositionsJson = (writeDataToFile = false) => {
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

  const tillableData = {
    tiles: tillableTiles,
    positions: tillablePositions,
  };

  if (writeDataToFile) {
    writeToFile(tillableOutputFilePath, tillableData);
  }
  return tillableData;
};

const tillableData = generateTillableTilesAndPositionsJson();

const generateBuildableTilesAndPositionsJson = (writeDataToFile = false) => {
  const buildableTiles = makeDeepCopy(tillableData.tiles);
  const buildablePositions = makeDeepCopy(tillableData.positions);
  fs.readFile(tiledMapDataFilePath, (err, json) => {
    if (err) {
      throw err;
    }
    const data = JSON.parse(json);
    const { layers } = data;
    const layersDict = layers.reduce((prevDict, layer) => {
      prevDict[layer.name] = layer;
      return prevDict;
    }, {});
    const buildableLayer = layersDict[TILED_LAYER_KEYS.BUILDABLE];
    const buildableDataTiles = buildableLayer.data;
    console.log(buildableDataTiles);
    for (let tile = 0; tile < buildableDataTiles.length; tile++) {
      if (buildableDataTiles[tile] > 0) {
        console.log(tile);
        const tileY = Math.floor(tile / TILED_WIDTH);
        const tileX = tile % TILED_WIDTH;
        const positionX = tileX * TILE_SIZE;
        const positionY = tileY * TILE_SIZE;
        if (!buildableTiles[tileX]) {
          buildableTiles[tileX] = [];
        }
        buildableTiles[tileX].push(tileY);
        if (!buildablePositions[positionX]) {
          buildablePositions[positionX] = [];
        }
        buildablePositions[positionX].push(positionY);
      }
    }
    const buildableData = {
      tiles: buildableTiles,
      positions: buildablePositions,
    };
    if (writeDataToFile) {
      writeToFile(buildableOutputFilePath, buildableData);
    }
    return buildableData;
  });
};

const buildableData = generateBuildableTilesAndPositionsJson(true);
