export const GEOSFunctions = {
  handle: null,
  last_error: null,
  last_notice: null,
  Module: {},
};

export function initCFunctions() {
  if (GEOSFunctions.initGEOS) return;
  const Module = GEOSFunctions.Module;

  GEOSFunctions.init = function() {
    GEOSFunctions.handle = Module.ccall('GEOS_init_r', null, [null], []);
    GEOSFunctions.last_error = Module._malloc(1025);
    Module.setValue(GEOSFunctions.last_error, 0, 'i8');
    GEOSFunctions.last_notice = Module._malloc(1025);
    Module.setValue(GEOSFunctions.last_notice, 0, 'i8');
  }
  GEOSFunctions.setErrorMessageHandler = function(errorFunc) {
    const funcPtr = Module.addFunction(errorFunc, 'vii');
    return Module.ccall('GEOSContext_setErrorMessageHandler_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, funcPtr, GEOSFunctions.last_error]);
  }
  GEOSFunctions.setNoticeMessageHandler = function(noticeFunc) {
    const funcPtr = Module.addFunction(noticeFunc, 'vii');
    return Module.ccall('GEOSContext_setNoticeMessageHandler_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, funcPtr, GEOSFunctions.last_notice]);
  }
  GEOSFunctions.getLastErrorMessage = function() {
    return Module.UTF8ToString(GEOSFunctions.last_error);
  }
  GEOSFunctions.getLastNoticeMessage = function() {
    return Module.UTF8ToString(GEOSFunctions.last_notice);
  }
  GEOSFunctions.finish = function(handle) {
    Module.ccall('GEOS_finish_r', null, ['number'], [handle]);
    GEOSFunctions.handle = null;
    Module._free(GEOSFunctions.last_error);
    Module._free(GEOSFunctions.last_notice);
  }
  GEOSFunctions.Free = function(ptr) {
    Module.ccall('GEOSFree_r', null, ['number', 'number'], [GEOSFunctions.handle, ptr]);
  }
  GEOSFunctions.GeomFromWKB = function(wkb) {
    const wkbPtr = Module._malloc(wkb.length);
    Module.HEAPU8.set(wkb, wkbPtr);
    const geomPtr = Module.ccall('GEOSGeomFromWKB_buf_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, wkbPtr, wkb.length]);
    Module.ccall('GEOSFree_r', null, ['number', 'number'], [GEOSFunctions.handle, wkbPtr]);
    Module._free(wkbPtr);
    return geomPtr;
  }
  GEOSFunctions.GeomToWKB = function(geomPtr) {
    // create a pointer that stores the GEOSGeomToWKB_buf length
    const wkbPtrLength = Module._malloc(4);
    // set it to 0
    Module.setValue(wkbPtrLength, 0, 'i32');
    // get the wkbPtr and store its length in wkbPtrLength
    const wkbPtr = Module.ccall('GEOSGeomToWKB_buf_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, geomPtr, wkbPtrLength]);
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
    Module.ccall('GEOSFree_r', null, ['number', 'number'], [GEOSFunctions.handle, wkbPtr]);
    Module._free(wkbPtrLength);
    const buffer = Buffer.from(wkb);
    return buffer;
  }
  GEOSFunctions.GeomToWKT = function(geomPtr) {
    const wktPtr = Module.ccall('GEOSGeomToWKT_r', 'number', ['number', 'number'], [GEOSFunctions.handle, geomPtr]);
    const wkt = Module.UTF8ToString(wktPtr);
    Module.ccall('GEOSFree_r', null, ['number', 'number'], [GEOSFunctions.handle, wktPtr]);
    return wkt;
  }
  GEOSFunctions.GEOSGeomFromWKT = function(wkt) {
    const size = Module.lengthBytesUTF8(wkt) + 1;
    const wktPtr = Module._malloc(size);
    Module.stringToUTF8(wkt, wktPtr, size)
    const geomPtr = Module.ccall('GEOSGeomFromWKT_r', 'number', ['number', 'number'], [GEOSFunctions.handle, wktPtr]);
    Module._free(wktPtr);
    return geomPtr;
  }
  GEOSFunctions.GeoJSONReader_create = function() {
    return Module.ccall('GEOSGeoJSONReader_create_r', 'number', ['number'], [GEOSFunctions.handle]);
  }
  GEOSFunctions.GeoJSONReader_destroy = function(readerPtr) {
    Module.ccall('GEOSGeoJSONReader_destroy_r', null, ['number', 'number'], [GEOSFunctions.handle, readerPtr]);
  }
  GEOSFunctions.GeoJSONReader_readGeometry = function(readerPtr, geojson) {
    if (typeof geojson === 'object') {
      geojson = JSON.stringify(geojson);
    } else if (typeof geojson !== 'string') {
      console.error('Invalid geojson');
      return null;
    }
    const size = Module.lengthBytesUTF8(geojson) + 1;
    const geojsonPtr = Module._malloc(size);
    Module.stringToUTF8(geojson, geojsonPtr, size)
    const geomPtr = Module.ccall('GEOSGeoJSONReader_readGeometry_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, readerPtr, geojsonPtr]);
    Module._free(geojsonPtr);
    return geomPtr;
  }
  GEOSFunctions.GeoJSONWriter_create = function() {
    return Module.ccall('GEOSGeoJSONWriter_create_r', 'number', ['number'], [GEOSFunctions.handle]);
  }
  GEOSFunctions.GeoJSONWriter_destroy = function(writerPtr) {
    Module.ccall('GEOSGeoJSONWriter_destroy_r', null, ['number', 'number'], [GEOSFunctions.handle, writerPtr]);
  }
  GEOSFunctions.GeoJSONWriter_writeGeometry = function(writerPtr, geomPtr, indent = -1) {
    const geojsonPtr = Module.ccall('GEOSGeoJSONWriter_writeGeometry_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, writerPtr, geomPtr, indent]);
    const geojson = Module.UTF8ToString(geojsonPtr);
    Module.ccall('GEOSFree_r', null, ['number', 'number'], [GEOSFunctions.handle, geojsonPtr]);
    return JSON.parse(geojson);
  }

  GEOSFunctions.Buffer = function(geomPtr, width, quadsegs) {
    return Module.ccall('GEOSBuffer_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, geomPtr, width, quadsegs]);
  }
  GEOSFunctions.BufferWithParams = function(geomPtr, paramsPtr, width) {
    return Module.ccall('GEOSBufferWithParams_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, geomPtr, paramsPtr, width]);
  }
  GEOSFunctions.BufferParams_create = function() {
    return Module.ccall('GEOSBufferParams_create_r', 'number', ['number'], [GEOSFunctions.handle]);
  }
  GEOSFunctions.BufferParams_destroy = function(paramsPtr) {
    Module.ccall('GEOSBufferParams_destroy_r', 'number', ['number', 'number'], [GEOSFunctions.handle, paramsPtr]);
  }
  GEOSFunctions.BufferParams_setEndCapStyle = function(paramsPtr, style) {
    return Module.ccall('GEOSBufferParams_setEndCapStyle_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, paramsPtr, style]);
  }
  GEOSFunctions.BufferParams_setJoinStyle = function(paramsPtr, joinStyle) {
    return Module.ccall('GEOSBufferParams_setJoinStyle_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, paramsPtr, joinStyle]);
  }
  GEOSFunctions.BufferParams_setMitreLimit = function(paramsPtr, mitreLimit) {
    return Module.ccall('GEOSBufferParams_setMitreLimit_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, paramsPtr, mitreLimit]);
  }
  GEOSFunctions.BufferParams_setQuadrantSegments = function(paramsPtr, quadSegs) {
    return Module.ccall('GEOSBufferParams_setQuadrantSegments_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, paramsPtr, quadSegs]);
  }
  GEOSFunctions.BufferParams_setSingleSided = function(paramsPtr, singleSided) {
    return Module.ccall('GEOSBufferParams_setSingleSided_r', 'number', ['number', 'number', 'boolean'], [GEOSFunctions.handle, paramsPtr, singleSided]);
  }
  GEOSFunctions.Geom_destroy = function(geomPtr) {
    Module.ccall('GEOSGeom_destroy_r', null, ['number', 'number'], [GEOSFunctions.handle, geomPtr]);
  }
}
