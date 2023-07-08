/*
Most of the code in this file is copied from Turf.js, 
with some modifications to make it work with GEOS instead of JSTS.

The MIT License (MIT)

Copyright (c) 2017 TurfJS

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import { GEOSFunctions } from "../allCFunctions.mjs";
import GEOSGeomToWKB from "./GeomToWKB.mjs";
import GEOSGeomFromWKB from "./GeomFromWKB.mjs";
import center from "@turf/center";
import { geomEach, featureEach } from "@turf/meta";
import { geoAzimuthalEquidistant } from "d3-geo";
import {
  feature,
  featureCollection,
  radiansToLength,
  lengthToRadians,
  earthRadius,
} from "@turf/helpers";
import { Geometry } from "@syncpoint/wkx"

/**
 * Calculates a buffer for input features for a given radius. Units supported are miles, kilometers, and degrees.
 *
 * When using a negative radius, the resulting geometry may be invalid if
 * it's too small compared to the radius magnitude. If the input is a
 * FeatureCollection, only valid members will be returned in the output
 * FeatureCollection - i.e., the output collection may have fewer members than
 * the input, or even be empty.
 *
 * @name buffer
 * @param {FeatureCollection|Geometry|Feature<any>} geojson input to be buffered
 * @param {number} radius distance to draw the buffer (negative values are allowed)
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units="kilometers"] any of the options supported by turf units
 * @param {number} [options.steps=8] number of steps
 * @param {number} [options.endCapStyle=1] end cap style (1 = round, 2 = flat, 3 = square)
 * @param {number} [options.joinStyle=1] join style (1 = round, 2 = mitre, 3 = bevel)
 * @param {number} [options.mitreLimit=5] mitre limit
 * @param {boolean} [options.singleSided=false] whether to generate a single-sided or double-sided buffer
 * @returns {FeatureCollection|Feature<Polygon|MultiPolygon>|undefined} buffered features
 * @example
 * const point = turf.point([-90.548630, 14.616599]);
 * const buffered = turf.buffer(point, 500, {units: 'miles'});
 *
 */
function buffer(geojson, radius, options) {
  // Optional params
  options = options || {};

  // use user supplied options or default values
  const units = options.units || "kilometers";
  const steps = options.steps || 8;
  const endCapStyle = options.endCapStyle || 1;
  const joinStyle = options.joinStyle || 1;
  const mitreLimit = options.mitreLimit || 5;
  const singleSided = options.singleSided || false;

  // validation
  if (!geojson) throw new Error("geojson is required");
  if (typeof options !== "object") throw new Error("options must be an object");
  if (typeof steps !== "number") throw new Error("steps must be an number");

  // Allow negative buffers ("erosion") or zero-sized buffers ("repair geometry")
  if (radius === undefined) throw new Error("radius is required");
  if (steps <= 0) throw new Error("steps must be greater than 0");

  const results = [];
  switch (geojson.type) {
    case "GeometryCollection":
      geomEach(geojson, function (geometry) {
        const buffered = bufferFeature(
          geometry,
          radius,
          units,
          steps,
          endCapStyle,
          joinStyle,
          mitreLimit,
          singleSided
        );
        if (buffered) results.push(buffered);
      });
      return featureCollection(results);
    case "FeatureCollection":
      featureEach(geojson, function (feature) {
        const multiBuffered = bufferFeature(
          feature,
          radius,
          units,
          steps,
          endCapStyle,
          joinStyle,
          mitreLimit,
          singleSided
        );
        if (multiBuffered) {
          featureEach(multiBuffered, function (buffered) {
            if (buffered) results.push(buffered);
          });
        }
      });
      return featureCollection(results);
  }
  return bufferFeature(
    geojson,
    radius,
    units,
    steps,
    endCapStyle,
    joinStyle,
    mitreLimit,
    singleSided
  );
}

/**
 * Buffer single Feature/Geometry
 *
 * @private
 * @param {Feature<any>} geojson input to be buffered
 * @param {number} radius distance to draw the buffer
 * @param {string} [units='kilometers'] any of the options supported by turf units
 * @param {number} [steps=8] number of steps
 * @param {number} [endCapStyle=1] end cap style (1 = round, 2 = flat, 3 = square)
 * @param {number} [joinStyle=1] join style (1 = round, 2 = mitre, 3 = bevel)
 * @param {number} [mitreLimit=5] mitre limit ratio
 * @param {boolean} [singleSided=false] whether to buffer just one side of the input line
 * @returns {Feature<Polygon|MultiPolygon>} buffered feature
 */
function bufferFeature(geojson, radius, units, steps, endCapStyle, joinStyle, mitreLimit, singleSided) {
  const properties = geojson.properties || {};
  const geometry = geojson.type === "Feature" ? geojson.geometry : geojson;

  // Geometry Types faster than jsts
  if (geometry.type === "GeometryCollection") {
    const results = [];
    geomEach(geojson, function (geometry) {
      const buffered = bufferFeature(
        geometry,
        radius,
        units,
        steps,
        endCapStyle,
        joinStyle,
        mitreLimit,
        singleSided
      );
      if (buffered) results.push(buffered);
    });
    return featureCollection(results);
  }

  // Project GeoJSON to Azimuthal Equidistant projection (convert to Meters)
  const projection = defineProjection(geometry);

  const projected = {
    type: geometry.type,
    coordinates: projectCoords(geometry.coordinates, projection),
  };

  // GEOS buffer operation
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
    if (steps) {
      GEOSFunctions.GEOSBufferParams_setQuadrantSegments(bufferParamsPtr, steps);
    }
    if (singleSided) {
      GEOSFunctions.GEOSBufferParams_setSingleSided(bufferParamsPtr, singleSided);
    }
  }
  // create a GEOS object from the GeoJSON
  // geojsonToPointers always returns an array of pointers  
  // const geomPtr = GEOSGeomFromWKT(stringify(projected));
  const wkb = Geometry.parseGeoJSON(projected).toWkb()
  const geomPtr = GEOSGeomFromWKB(wkb);
  const distance = radiansToLength(lengthToRadians(radius, units), "meters");
  let bufferPtr;
  if (isBufferWithParams) {
    bufferPtr = GEOSFunctions.GEOSBufferWithParams(geomPtr, bufferParamsPtr, distance);
  } else {
    bufferPtr = GEOSFunctions.GEOSBuffer(geomPtr, distance, steps);
  }  
  // destroy the bufferParamsPtr if it exists
  if (bufferParamsPtr) {
    GEOSFunctions.GEOSBufferParams_destroy(bufferParamsPtr);
  }
  // update the original GeoJSON with the new geometry
  const bufferedWkb = GEOSGeomToWKB(bufferPtr);  
  const buffered = Geometry.parse(bufferedWkb).toGeoJSON();
  // destroy the GEOS objects
  GEOSFunctions.GEOSGeom_destroy(geomPtr);
  GEOSFunctions.GEOSGeom_destroy(bufferPtr);  

  // Detect if empty geometries
  if (coordsIsNaN(buffered.coordinates)) return undefined;

  // Unproject coordinates (convert to Degrees)
  const result = {
    type: buffered.type,
    coordinates: unprojectCoords(buffered.coordinates, projection),
  };

  return feature(result, properties);
}

/**
 * Coordinates isNaN
 *
 * @private
 * @param {Array<any>} coords GeoJSON Coordinates
 * @returns {boolean} if NaN exists
 */
function coordsIsNaN(coords) {
  if (Array.isArray(coords[0])) return coordsIsNaN(coords[0]);
  return isNaN(coords[0]);
}

/**
 * Project coordinates to projection
 *
 * @private
 * @param {Array<any>} coords to project
 * @param {GeoProjection} proj D3 Geo Projection
 * @returns {Array<any>} projected coordinates
 */
function projectCoords(coords, proj) {
  if (typeof coords[0] !== "object") return proj(coords);
  return coords.map(function (coord) {
    return projectCoords(coord, proj);
  });
}

/**
 * Un-Project coordinates to projection
 *
 * @private
 * @param {Array<any>} coords to un-project
 * @param {GeoProjection} proj D3 Geo Projection
 * @returns {Array<any>} un-projected coordinates
 */
function unprojectCoords(coords, proj) {
  if (typeof coords[0] !== "object") return proj.invert(coords);
  return coords.map(function (coord) {
    return unprojectCoords(coord, proj);
  });
}

/**
 * Define Azimuthal Equidistant projection
 *
 * @private
 * @param {Geometry|Feature<any>} geojson Base projection on center of GeoJSON
 * @returns {GeoProjection} D3 Geo Azimuthal Equidistant Projection
 */
function defineProjection(geojson) {
  const coords = center(geojson).geometry.coordinates;
  const rotation = [-coords[0], -coords[1]];
  return geoAzimuthalEquidistant().rotate(rotation).scale(earthRadius);
}

export default buffer;