import { GEOSFunctions } from "../allCFunctions.mjs";

export default function buffer(geojson, radius, options = {}) {
  const {
    quadrantSegments = 8,
    endCapStyle,
    joinStyle,
    mitreLimit,
    singleSided
  } = options;

  const isBufferWithParams = endCapStyle || joinStyle || mitreLimit || singleSided;
  let bufferParamsPtr;
  if (isBufferWithParams) {
    bufferParamsPtr = GEOSFunctions.GEOSBufferParams_create();
    if (endCapStyle) {
      GEOSFunctions.GEOSBufferParams_setEndCapStyle(bufferParamsPtr, endCapStyle);
    }
    if (joinStyle) {
      GEOSFunctions.GEOSBufferParams_setJoinStyle(bufferParamsPtr, joinStyle);
    }
    if (mitreLimit) {
      GEOSFunctions.GEOSBufferParams_setMitreLimit(bufferParamsPtr, mitreLimit);
    }
    if (quadrantSegments) {
      GEOSFunctions.GEOSBufferParams_setQuadrantSegments(bufferParamsPtr, quadrantSegments);
    }
    if (singleSided) {
      GEOSFunctions.GEOSBufferParams_setSingleSided(bufferParamsPtr, singleSided);
    }
  }
  // create a GEOS object from the GeoJSON
  const readerPtr = GEOSFunctions.GEOSGeoJSONReader_create();
  const geomPtr = GEOSFunctions.GEOSGeoJSONReader_readGeometry(readerPtr, geojson);
  GEOSFunctions.GEOSGeoJSONReader_destroy(readerPtr);
  // create a buffer
  let bufferPtr = null
  if (isBufferWithParams) {
    bufferPtr = GEOSFunctions.GEOSBufferWithParams(geomPtr, bufferParamsPtr, radius);
  } else {
    bufferPtr = GEOSFunctions.GEOSBuffer(geomPtr, radius, quadrantSegments);
  }
  // destroy the bufferParamsPtr if it exists
  if (bufferParamsPtr) {
    GEOSFunctions.GEOSBufferParams_destroy(bufferParamsPtr);
  }
  // update the original GeoJSON with the new geometry
  const writerPtr = GEOSFunctions.GEOSGeoJSONWriter_create();
  const bufferGeojson = GEOSFunctions.GEOSGeoJSONWriter_writeGeometry(writerPtr, bufferPtr);
  GEOSFunctions.GEOSGeoJSONWriter_destroy(writerPtr);
  GEOSFunctions.GEOSGeom_destroy(bufferPtr);
  return bufferGeojson;
}
