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
    bufferParamsPtr = GEOSFunctions.BufferParams_create();
    if (endCapStyle) {
      GEOSFunctions.BufferParams_setEndCapStyle(bufferParamsPtr, endCapStyle);
    }
    if (joinStyle) {
      GEOSFunctions.BufferParams_setJoinStyle(bufferParamsPtr, joinStyle);
    }
    if (mitreLimit) {
      GEOSFunctions.BufferParams_setMitreLimit(bufferParamsPtr, mitreLimit);
    }
    if (quadrantSegments) {
      GEOSFunctions.BufferParams_setQuadrantSegments(bufferParamsPtr, quadrantSegments);
    }
    if (singleSided) {
      GEOSFunctions.BufferParams_setSingleSided(bufferParamsPtr, singleSided);
    }
  }
  // create a GEOS object from the GeoJSON
  const readerPtr = GEOSFunctions.GeoJSONReader_create();
  const geomPtr = GEOSFunctions.GeoJSONReader_readGeometry(readerPtr, geojson);
  GEOSFunctions.GeoJSONReader_destroy(readerPtr);
  // create a buffer
  let bufferPtr = null
  if (isBufferWithParams) {
    bufferPtr = GEOSFunctions.BufferWithParams(geomPtr, bufferParamsPtr, radius);
  } else {
    bufferPtr = GEOSFunctions.Buffer(geomPtr, radius, quadrantSegments);
  }
  // destroy the bufferParamsPtr if it exists
  if (bufferParamsPtr) {
    GEOSFunctions.BufferParams_destroy(bufferParamsPtr);
  }
  // update the original GeoJSON with the new geometry
  const writerPtr = GEOSFunctions.GeoJSONWriter_create();
  const bufferGeojson = GEOSFunctions.GeoJSONWriter_writeGeometry(writerPtr, bufferPtr);
  GEOSFunctions.GeoJSONWriter_destroy(writerPtr);
  GEOSFunctions.Geom_destroy(bufferPtr);
  return bufferGeojson;
}
