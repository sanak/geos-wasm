export const GEOSFunctions = {
  handle: null,
  last_error: null,
  last_notice: null,
  Module: {},
};

export function initCFunctions() {
  if (GEOSFunctions.initGEOS) return;
  const Module = GEOSFunctions.Module;

  /* ========== Initialization and Cleanup ========== */
  GEOSFunctions.init = function() {
    if (GEOSFunctions.handle) {
      console.log('GEOS already initialized');
      return;
    }
    GEOSFunctions.handle = Module.ccall('GEOS_init_r', null, [null], []);
    GEOSFunctions.last_error = Module._malloc(1025);
    Module.setValue(GEOSFunctions.last_error, 0, 'i8');
    GEOSFunctions.last_notice = Module._malloc(1025);
    Module.setValue(GEOSFunctions.last_notice, 0, 'i8');
    GEOSFunctions.setNoticeMessageHandler(function(msg, userData) {
      const msgStr = Module.UTF8ToString(msg);
      console.debug('geos notice:', msgStr);
      // Module.HEAPU8.set(msg, userData); // Doesn't work
      const size = Module.lengthBytesUTF8(msgStr) + 1;
      Module.stringToUTF8(msgStr, userData, size)
    });
    GEOSFunctions.setErrorMessageHandler(function(msg, userData) {
      const msgStr = Module.UTF8ToString(msg);
      console.error('geos error:', msgStr);
      // Module.HEAPU8.set(msg, userData); // Doesn't work
      const size = Module.lengthBytesUTF8(msgStr) + 1;
      Module.stringToUTF8(msgStr, userData, size)
    });
  }
  GEOSFunctions.finish = function(handle) {
    Module.ccall('GEOS_finish_r', null, ['number'], [handle]);
    GEOSFunctions.handle = null;
    Module._free(GEOSFunctions.last_error);
    Module._free(GEOSFunctions.last_notice);
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

  /* ========== Coordinate Sequence functions ========== */
  GEOSFunctions.CoordSeq_create = function(size, dims) {
    return Module.ccall('GEOSCoordSeq_create_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, size, dims]);
  }
  GEOSFunctions.CoordSeq_copyFromBuffer = function(coordSeqPtr, bufferPtr, size, dims = 2) {
    // TODO:
    return Module.ccall('GEOSCoordSeq_copyFromBuffer_r', 'number', ['number', 'number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, bufferPtr, size, 2]);
  }
  GEOSFunctions.CoordSeq_copyFromArrays = function(coordSeqPtr, x, y, size) {
    return Module.ccall('GEOSCoordSeq_copyFromArrays_r', 'number', ['number', 'number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, x, y, size]);
  }
  GEOSFunctions.CoordSeq_copyToBuffer = function(coordSeqPtr, bufferPtr, size, dims = 2) {
    // TODO:
    return Module.ccall('GEOSCoordSeq_copyToBuffer_r', 'number', ['number', 'number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, bufferPtr, size, 2]);
  }
  GEOSFunctions.CoordSeq_copyToArrays = function(coordSeqPtr, x, y, size) {
    return Module.ccall('GEOSCoordSeq_copyToArray_r', 'number', ['number', 'number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, x, y, size]);
  }
  GEOSFunctions.CoordSeq_clone = function(coordSeqPtr) {
    return Module.ccall('GEOSCoordSeq_clone_r', 'number', ['number', 'number'], [GEOSFunctions.handle, coordSeqPtr]);
  }
  GEOSFunctions.CoordSeq_destroy = function(coordSeqPtr) {
    Module.ccall('GEOSCoordSeq_destroy_r', null, ['number', 'number'], [GEOSFunctions.handle, coordSeqPtr]);
  }
  GEOSFunctions.CoordSeq_setX = function(coordSeqPtr, index, value) {
    return Module.ccall('GEOSCoordSeq_setX_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, index, value]);
  }
  GEOSFunctions.CoordSeq_setY = function(coordSeqPtr, index, value) {
    return Module.ccall('GEOSCoordSeq_setY_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, index, value]);
  }
  GEOSFunctions.CoordSeq_setZ = function(coordSeqPtr, index, value) {
    return Module.ccall('GEOSCoordSeq_setZ_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, index, value]);
  }
  GEOSFunctions.CoordSeq_setXY = function(coordSeqPtr, index, x, y) {
    return Module.ccall('GEOSCoordSeq_setXY_r', 'number', ['number', 'number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, index, x, y]);
  }
  GEOSFunctions.CoordSeq_setXYZ = function(coordSeqPtr, index, x, y, z) {
    return Module.ccall('GEOSCoordSeq_setXYZ_r', 'number', ['number', 'number', 'number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, index, x, y, z]);
  }
  GEOSFunctions.CoordSeq_setOrdinate = function(coordSeqPtr, index, dim, value) {
    return Module.ccall('GEOSCoordSeq_setOrdinate_r', 'number', ['number', 'number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, index, dim, value]);
  }
  GEOSFunctions.CoordSeq_getX = function(coordSeqPtr, index) {
    const doublePtr = Module._malloc(8);
    Module.setValue(doublePtr, 0.0, 'double');
    const result = Module.ccall('GEOSCoordSeq_getX_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, index, doublePtr]);
    const value = Module.getValue(doublePtr, 'double');
    Module._free(doublePtr);
    return (result === 0) ? NaN : value;
  }
  GEOSFunctions.CoordSeq_getY = function(coordSeqPtr, index) {
    const doublePtr = Module._malloc(8);
    Module.setValue(doublePtr, 0.0, 'double');
    const result = Module.ccall('GEOSCoordSeq_getY_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, index, doublePtr]);
    const value = Module.getValue(doublePtr, 'double');
    Module._free(doublePtr);
    return (result === 0) ? NaN : value;
  }
  GEOSFunctions.CoordSeq_getZ = function(coordSeqPtr, index) {
    const doublePtr = Module._malloc(8);
    Module.setValue(doublePtr, 0.0, 'double');
    const result = Module.ccall('GEOSCoordSeq_getZ_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, index, doublePtr]);
    const value = Module.getValue(doublePtr, 'double');
    Module._free(doublePtr);
    return (result === 0) ? NaN : value;
  }
  GEOSFunctions.CoordSeq_getXY = function(coordSeqPtr, index) {
    return Module.ccall('GEOSCoordSeq_getXY_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, index]);
  }
  GEOSFunctions.CoordSeq_getXYZ = function(coordSeqPtr, index) {
    return Module.ccall('GEOSCoordSeq_getXYZ_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, index]);
  }
  GEOSFunctions.CoordSeq_getOrdinate = function(coordSeqPtr, index, dim) {
    return Module.ccall('GEOSCoordSeq_getOrdinate_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, index, dim]);
  }
  GEOSFunctions.CoordSeq_getSize = function(coordSeqPtr) {
    const intPtr = Module._malloc(4);
    Module.setValue(intPtr, 0, 'i32');
    const result = Module.ccall('GEOSCoordSeq_getSize_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, intPtr]);
    const size = Module.getValue(intPtr, 'i32');
    Module._free(intPtr);
    // Replace exception with -1
    return (result === 0) ? -1 : size;
  }
  GEOSFunctions.CoordSeq_getDimensions = function(coordSeqPtr) {
    const intPtr = Module._malloc(4);
    Module.setValue(intPtr, 0, 'i32');
    const result = Module.ccall('GEOSCoordSeq_getDimensions_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, intPtr]);
    const dims = Module.getValue(intPtr, 'i32');
    Module._free(intPtr);
    // Replace exception with -1
    return (result === 0) ? -1 : dims;
  }
  GEOSFunctions.CoordSeq_isCCW = function(coordSeqPtr) {
    const charPtr = Module._malloc(1);
    Module.setValue(charPtr, 0, 'i8');
    const result = Module.ccall('GEOSCoordSeq_isCCW_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, coordSeqPtr, charPtr]);
    const isCCW = Module.getValue(charPtr, 'i8');
    Module._free(charPtr);
    // Replace exception with -1
    return (result === 0) ? -1 : (isCCW === 1);
  }

  /* ========== Buffer related functions ========== */
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

  /* ========= Geometry Constructors ========= */
  GEOSFunctions.Geom_createPoint = function(coordSeqPtr) {
    return Module.ccall('GEOSGeom_createPoint_r', 'number', ['number', 'number'], [GEOSFunctions.handle, coordSeqPtr]);
  }
  GEOSFunctions.Geom_createEmptyPoint = function() {
    return Module.ccall('GEOSGeom_createEmptyPoint_r', 'number', ['number'], [GEOSFunctions.handle]);
  }
  GEOSFunctions.Geom_createLinearRing = function(coordSeqPtr) {
    return Module.ccall('GEOSGeom_createLinearRing_r', 'number', ['number', 'number'], [GEOSFunctions.handle, coordSeqPtr]);
  }
  GEOSFunctions.Geom_createLineString = function(coordSeqPtr) {
    return Module.ccall('GEOSGeom_createLineString_r', 'number', ['number', 'number'], [GEOSFunctions.handle, coordSeqPtr]);
  }
  GEOSFunctions.Geom_createEmptyPolygon = function() {
    return Module.ccall('GEOSGeom_createEmptyPolygon_r', 'number', ['number'], [GEOSFunctions.handle]);
  }
  GEOSFunctions.Geom_createPolygon = function(shellPtr, holesPtr, nholes) {
    return Module.ccall('GEOSGeom_createPolygon_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, shellPtr, holesPtr, nholes]);
  }
  GEOSFunctions.Geom_createCollection = function(type, geomsPtr, ngeoms) {
    return Module.ccall('GEOSGeom_createCollection_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, type, geomsPtr, ngeoms]);
  }
  GEOSFunctions.GEOSGeom_releaseCollection = function(collectionPtr, ngeoms) {
    return Module.ccall('GEOSGeom_releaseCollection_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, collectionPtr, ngeoms]);
  }
  GEOSFunctions.Geom_createEmptyCollection = function(type) {
    return Module.ccall('GEOSGeom_createEmptyCollection_r', 'number', ['number', 'number'], [GEOSFunctions.handle, type]);
  }
  GEOSFunctions.Geom_clone = function(geomPtr) {
    return Module.ccall('GEOSGeom_clone_r', 'number', ['number', 'number'], [GEOSFunctions.handle, geomPtr]);
  }

  /* ========= Memory management ========= */
  GEOSFunctions.Geom_destroy = function(geomPtr) {
    Module.ccall('GEOSGeom_destroy_r', null, ['number', 'number'], [GEOSFunctions.handle, geomPtr]);
  }

  /* ========= Binary predicates ========= */
  GEOSFunctions.Equals = function(geom1Ptr, geom2Ptr) {
    return Module.ccall('GEOSEquals_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, geom1Ptr, geom2Ptr]);
  }
  GEOSFunctions.EqualsExact = function(geom1Ptr, geom2Ptr, tolerance) {
    return Module.ccall('GEOSEqualsExact_r', 'number', ['number', 'number', 'number', 'number'], [GEOSFunctions.handle, geom1Ptr, geom2Ptr, tolerance]);
  }

  /* ========= Unary predicate ========= */
  GEOSFunctions.isEmpty = function(geomPtr) {
    return Module.ccall('GEOSisEmpty_r', 'number', ['number', 'number'], [GEOSFunctions.handle, geomPtr]);
  }

  /* ========= Validity checking ========= */
  GEOSFunctions.isValid = function(geomPtr) {
    return Module.ccall('GEOSisValid_r', 'number', ['number', 'number'], [GEOSFunctions.handle, geomPtr]);
  }

  /* ========== Geometry info ========== */
  GEOSFunctions.GeomTypeId = function(geomPtr) {
    return Module.ccall('GEOSGeomTypeId_r', 'number', ['number', 'number'], [GEOSFunctions.handle, geomPtr]);
  }
  GEOSFunctions.GetNumGeometries = function(geomPtr) {
    return Module.ccall('GEOSGetNumGeometries_r', 'number', ['number', 'number'], [GEOSFunctions.handle, geomPtr]);
  }
  GEOSFunctions.GetGeometryN = function(geomPtr, n) {
    return Module.ccall('GEOSGetGeometryN_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, geomPtr, n]);
  }
  GEOSFunctions.GetNumInteriorRings = function(geomPtr) {
    return Module.ccall('GEOSGetNumInteriorRings_r', 'number', ['number', 'number'], [GEOSFunctions.handle, geomPtr]);
  }
  GEOSFunctions.GetInteriorRingN = function(geomPtr, n) {
    return Module.ccall('GEOSGetInteriorRingN_r', 'number', ['number', 'number', 'number'], [GEOSFunctions.handle, geomPtr, n]);
  }
  GEOSFunctions.GetExteriorRing = function(geomPtr) {
    return Module.ccall('GEOSGetExteriorRing_r', 'number', ['number', 'number'], [GEOSFunctions.handle, geomPtr]);
  }
  GEOSFunctions.GetNumCoordinates = function(geomPtr) {
    return Module.ccall('GEOSGetNumCoordinates_r', 'number', ['number', 'number'], [GEOSFunctions.handle, geomPtr]);
  }
  GEOSFunctions.Geom_getCoordSeq = function(geomPtr) {
    return Module.ccall('GEOSGeom_getCoordSeq_r', 'number', ['number', 'number'], [GEOSFunctions.handle, geomPtr]);
  }

  /* ========== Reader and Writer APIs ========== */
  /* ========== GeoJSON Reader ========== */
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
  /* ========== GeoJSON Writer ========== */
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

  GEOSFunctions.Free = function(ptr) {
    Module.ccall('GEOSFree_r', null, ['number', 'number'], [GEOSFunctions.handle, ptr]);
  }

  /* ====================================================================== */
  /* DEPRECATIONS */
  /* ====================================================================== */
  GEOSFunctions.GeomToWKT = function(geomPtr) {
    const wktPtr = Module.ccall('GEOSGeomToWKT_r', 'number', ['number', 'number'], [GEOSFunctions.handle, geomPtr]);
    const wkt = Module.UTF8ToString(wktPtr);
    Module.ccall('GEOSFree_r', null, ['number', 'number'], [GEOSFunctions.handle, wktPtr]);
    return wkt;
  }
  GEOSFunctions.GeomFromWKT = function(wkt) {
    const size = Module.lengthBytesUTF8(wkt) + 1;
    const wktPtr = Module._malloc(size);
    Module.stringToUTF8(wkt, wktPtr, size)
    const geomPtr = Module.ccall('GEOSGeomFromWKT_r', 'number', ['number', 'number'], [GEOSFunctions.handle, wktPtr]);
    Module._free(wktPtr);
    return geomPtr;
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
}
