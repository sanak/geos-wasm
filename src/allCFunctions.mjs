export const GEOSFunctions = {
  Module: {},
};

export function initCFunctions() {
  if (GEOSFunctions.initGEOS) return;
  const Module = GEOSFunctions.Module;

  Module.ccall('initGEOS', null, ['string', 'string'], ['GEOS_INIT_NOTICE=NO', 'GEOS_ENABLE_TESTS=NO']);

  GEOSFunctions.initGEOS = Module.cwrap('initGEOS', null, ['string', 'string']);
  GEOSFunctions.finishGEOS = Module.cwrap('finishGEOS', null, [null]);
  GEOSFunctions.GEOSFree = Module.cwrap('GEOSFree', null, ['number']);
  GEOSFunctions.GEOSGeomFromWKB = function(wkb) {
    const wkbPtr = Module._malloc(wkb.length);
    Module.HEAPU8.set(wkb, wkbPtr);
    const geomPtr = Module.ccall('GEOSGeomFromWKB_buf', 'number', ['number', 'number'], [wkbPtr, wkb.length]);
    Module.ccall('GEOSFree', null, ['number'], [wkbPtr]);
    Module._free(wkbPtr);
    return geomPtr;
  }
  GEOSFunctions.GEOSGeomToWKB = function(geomPtr) {
    // create a pointer that stores the GEOSGeomToWKB_buf length
    const wkbPtrLength = Module._malloc(4);
    // set it to 0
    Module.setValue(wkbPtrLength, 0, 'i32');
    // get the wkbPtr and store its length in wkbPtrLength
    const wkbPtr = Module.ccall('GEOSGeomToWKB_buf', 'number', ['number', 'number'], [geomPtr, wkbPtrLength]);
    // get the actual length from wkbPtrLength
    const size = Module.getValue(wkbPtrLength, 'i32');
    // create a Uint8Array from the wkbPtr and the size
    const wkbView = new Uint8Array(
      Module.HEAPU8.buffer,
      wkbPtr,
      size
    );
    const wkb = new Uint8Array(wkbView);

    // free the memory
    Module.ccall('GEOSFree', null, ['number'], [wkbPtr]);
    Module._free(wkbPtrLength);
    const buffer = Buffer.from(wkb);
    return buffer;
  }
  GEOSFunctions.GEOSGeomToWKT = function(geomPtr) {
    const wktPtr = Module.ccall('GEOSGeomToWKT', 'number', ['number'], [geomPtr]);
    const wkt = Module.UTF8ToString(wktPtr);
    Module.ccall('GEOSFree', null, ['number'], [wktPtr]);
    return wkt;
  }
  GEOSFunctions.GEOSGeomFromWKT = function(wkt) {
    const size = Module.lengthBytesUTF8(wkt) + 1;
    const wktPtr = Module._malloc(size);
    Module.stringToUTF8(wkt, wktPtr, size)
    const geomPtr = Module.ccall('GEOSGeomFromWKT', 'number', ['number'], [wktPtr]);
    Module._free(wktPtr);
    return geomPtr;
  }
  GEOSFunctions.GEOSGeoJSONReader_create = Module.cwrap('GEOSGeoJSONReader_create', 'number', [null]);
  GEOSFunctions.GEOSGeoJSONReader_destroy = Module.cwrap('GEOSGeoJSONReader_destroy', null, ['number']);
  GEOSFunctions.GEOSGeoJSONReader_readGeometry = function(readerPtr, geojson) {
    if (typeof geojson === 'object') {
      geojson = JSON.stringify(geojson);
    } else if (typeof geojson !== 'string') {
      console.error('Invalid geojson');
      return null;
    }
    const size = Module.lengthBytesUTF8(geojson) + 1;
    const geojsonPtr = Module._malloc(size);
    Module.stringToUTF8(geojson, geojsonPtr, size)
    const geomPtr = Module.ccall('GEOSGeoJSONReader_readGeometry', 'number', ['number', 'number'], [readerPtr, geojsonPtr]);
    Module._free(geojsonPtr);
    return geomPtr;
  }
  GEOSFunctions.GEOSGeoJSONWriter_create = Module.cwrap('GEOSGeoJSONWriter_create', 'number', [null]);
  GEOSFunctions.GEOSGeoJSONWriter_destroy = Module.cwrap('GEOSGeoJSONWriter_destroy', null, ['number']);
  GEOSFunctions.GEOSGeoJSONWriter_writeGeometry = function(writerPtr, geomPtr, indent = -1) {
    const geojsonPtr = Module.ccall('GEOSGeoJSONWriter_writeGeometry', 'number', ['number', 'number', 'number'], [writerPtr, geomPtr, indent]);
    const geojson = Module.UTF8ToString(geojsonPtr);
    Module.ccall('GEOSFree', null, ['number'], [geojsonPtr]);
    return JSON.parse(geojson);
  }

  GEOSFunctions.GEOSBuffer = Module.cwrap('GEOSBuffer', 'number', ['number', 'number', 'number']);
  GEOSFunctions.GEOSBufferWithParams = Module.cwrap('GEOSBufferWithParams', 'number', ['number', 'number', 'number']);
  GEOSFunctions.GEOSBufferParams_create = Module.cwrap('GEOSBufferParams_create', 'number', [null]);
  GEOSFunctions.GEOSBufferParams_destroy = Module.cwrap('GEOSBufferParams_create', 'number', ['number']);
  GEOSFunctions.GEOSBufferParams_setEndCapStyle = Module.cwrap('GEOSBufferParams_setEndCapStyle', null, ["number"]);
  GEOSFunctions.GEOSBufferParams_setJoinStyle = Module.cwrap('GEOSBufferParams_setJoinStyle', null, ["number"]);
  GEOSFunctions.GEOSBufferParams_setMitreLimit = Module.cwrap('GEOSBufferParams_setMitreLimit', null, ["number"]);
  GEOSFunctions.GEOSBufferParams_setQuadrantSegments = Module.cwrap('GEOSBufferParams_setQuadrantSegments', null, ["number"]);
  GEOSFunctions.GEOSBufferParams_setSingleSided = Module.cwrap('GEOSBufferParams_setSingleSided', null, ["boolean"]);
  GEOSFunctions.GEOSGeom_destroy = Module.cwrap('GEOSGeom_destroy', null, ['number']);
}
