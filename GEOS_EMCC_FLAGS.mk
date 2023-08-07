GEOS_EMCC_FLAGS :=

ifeq ($(type), debug)
GEOS_EMCC_FLAGS += -gsource-map -fsanitize=address
else
GEOS_EMCC_FLAGS += -O3
endif

# GEOS_EMCC_FLAGS += -gsource-map -fsanitize=leak
# output a single js file instead of a .js and .wasm file
# this is ~33% larger than the two file output, but it's easier to use
# in different environments...
GEOS_EMCC_FLAGS += -s SINGLE_FILE=1 -s ALLOW_TABLE_GROWTH=1
GEOS_EMCC_FLAGS += -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s FORCE_FILESYSTEM=0
GEOS_EMCC_FLAGS += -s ALLOW_MEMORY_GROWTH=1 -s DISABLE_EXCEPTION_CATCHING=0
GEOS_EMCC_FLAGS += -s WASM=1 -s EXPORT_ES6=1 -s MODULARIZE=1 -s 'EXPORT_NAME="CModule"'

# export all functions
# GEOS_EMCC_FLAGS += -s LINKABLE=1 -s EXPORT_ALL=1 
GEOS_EMCC_FLAGS += -s EXPORTED_FUNCTIONS="[\
  '_free',\
  '_malloc',\
	'_GEOSContext_setNoticeHandler_r',\
  '_GEOSContext_setErrorHandler_r',\
  '_GEOSFree_r',\
  '_GEOSDisjoint_r',\
  '_GEOSTouches_r',\
  '_GEOSIntersects_r',\
  '_GEOSCrosses_r',\
  '_GEOSWithin_r',\
  '_GEOSContains_r',\
  '_GEOSOverlaps_r',\
  '_GEOSCovers_r',\
  '_GEOSCoveredBy_r',\
  '_GEOSRelatePattern_r',\
  '_GEOSRelatePatternMatch_r',\
  '_GEOSRelate_r',\
  '_GEOSRelateBoundaryNodeRule_r',\
  '_GEOSisValid_r',\
  '_GEOSisValidReason_r',\
  '_GEOSisValidDetail_r',\
  '_GEOSEquals_r',\
  '_GEOSEqualsExact_r',\
  '_GEOSDistance_r',\
  '_GEOSDistanceIndexed_r',\
  '_GEOSHausdorffDistance_r',\
  '_GEOSHausdorffDistanceDensify_r',\
  '_GEOSFrechetDistance_r',\
  '_GEOSFrechetDistanceDensify_r',\
  '_GEOSArea_r',\
  '_GEOSLength_r',\
  '_GEOSNearestPoints_r',\
  '_GEOSGeomFromWKT_r',\
  '_GEOSGeomToWKT_r',\
  '_GEOSGeomToWKB_buf_r',\
  '_GEOSGeomFromWKB_buf_r',\
  '_GEOSGeomToHEX_buf_r',\
  '_GEOSGeomFromHEX_buf_r',\
  '_GEOSisEmpty_r',\
  '_GEOSisSimple_r',\
  '_GEOSisRing_r',\
  '_GEOSGeomType_r',\
  '_GEOSGeomTypeId_r',\
  '_GEOSEnvelope_r',\
  '_GEOSIntersection_r',\
  '_GEOSIntersectionPrec_r',\
  '_GEOSBuffer_r',\
  '_GEOSBufferWithStyle_r',\
  '_GEOSSingleSidedBuffer_r',\
  '_GEOSOffsetCurve_r',\
  '_GEOSConvexHull_r',\
  '_GEOSMinimumRotatedRectangle_r',\
  '_GEOSMaximumInscribedCircle_r',\
  '_GEOSLargestEmptyCircle_r',\
  '_GEOSMinimumWidth_r',\
  '_GEOSMinimumClearanceLine_r',\
  '_GEOSMinimumClearance_r',\
  '_GEOSDifference_r',\
  '_GEOSDifferencePrec_r',\
  '_GEOSBoundary_r',\
  '_GEOSSymDifference_r',\
  '_GEOSSymDifferencePrec_r',\
  '_GEOSUnion_r',\
  '_GEOSUnionPrec_r',\
  '_GEOSUnaryUnion_r',\
  '_GEOSUnaryUnionPrec_r',\
  '_GEOSCoverageUnion_r',\
  '_GEOSNode_r',\
  '_GEOSUnionCascaded_r',\
  '_GEOSPointOnSurface_r',\
  '_GEOSClipByRect_r',\
  '_GEOSGeom_destroy_r',\
  '_GEOSGetNumCoordinates_r',\
  '_GEOSNormalize_r',\
  '_GEOSGetNumInteriorRings_r',\
  '_GEOSGetNumGeometries_r',\
  '_GEOSGetGeometryN_r',\
  '_GEOSGeomGetPointN_r',\
  '_GEOSGeomGetStartPoint_r',\
  '_GEOSGeomGetEndPoint_r',\
  '_GEOSisClosed_r',\
  '_GEOSGeomGetLength_r',\
  '_GEOSGeomGetNumPoints_r',\
  '_GEOSGeomGetX_r',\
  '_GEOSGeomGetY_r',\
  '_GEOSGeomGetZ_r',\
  '_GEOSGetExteriorRing_r',\
  '_GEOSGetInteriorRingN_r',\
  '_GEOSGetCentroid_r',\
  '_GEOSMinimumBoundingCircle_r',\
  '_GEOSGeom_createCollection_r',\
  '_GEOSGeom_releaseCollection_r',\
  '_GEOSPolygonize_r',\
  '_GEOSPolygonize_valid_r',\
  '_GEOSPolygonizer_getCutEdges_r',\
  '_GEOSPolygonize_full_r',\
  '_GEOSBuildArea_r',\
  '_GEOSMakeValid_r',\
  '_GEOSLineMerge_r',\
  '_GEOSReverse_r',\
  '_GEOSGetSRID_r',\
  '_GEOSSetSRID_r',\
  '_GEOSGeom_getUserData_r',\
  '_GEOSGeom_setUserData_r',\
  '_GEOSHasZ_r',\
  '_GEOS_getWKBOutputDims_r',\
  '_GEOS_setWKBOutputDims_r',\
  '_GEOS_getWKBByteOrder_r',\
  '_GEOS_setWKBByteOrder_r',\
  '_GEOSCoordSeq_create_r',\
  '_GEOSCoordSeq_setOrdinate_r',\
  '_GEOSCoordSeq_setXY_r',\
  '_GEOSCoordSeq_setXYZ_r',\
  '_GEOSCoordSeq_clone_r',\
  '_GEOSCoordSeq_getOrdinate_r',\
  '_GEOSCoordSeq_getXY_r',\
  '_GEOSCoordSeq_getXYZ_r',\
  '_GEOSCoordSeq_getSize_r',\
  '_GEOSCoordSeq_getDimensions_r',\
  '_GEOSCoordSeq_isCCW_r',\
  '_GEOSCoordSeq_destroy_r',\
  '_GEOSGeom_getCoordSeq_r',\
  '_GEOSGeom_createPoint_r',\
  '_GEOSGeom_createPointFromXY_r',\
  '_GEOSGeom_createLinearRing_r',\
  '_GEOSGeom_createLineString_r',\
  '_GEOSGeom_createPolygon_r',\
  '_GEOSGeom_clone_r',\
  '_GEOSGeom_setPrecision_r',\
  '_GEOSGeom_getPrecision_r',\
  '_GEOSGeom_getDimensions_r',\
  '_GEOSGeom_getCoordinateDimension_r',\
  '_GEOSGeom_getXMin_r',\
  '_GEOSGeom_getYMin_r',\
  '_GEOSGeom_getXMax_r',\
  '_GEOSGeom_getYMax_r',\
  '_GEOSSimplify_r',\
  '_GEOSTopologyPreserveSimplify_r',\
  '_GEOSWKTReader_create_r',\
  '_GEOSWKTReader_destroy_r',\
  '_GEOSWKTReader_read_r',\
  '_GEOSWKTWriter_create_r',\
  '_GEOSWKTWriter_destroy_r',\
  '_GEOSWKTWriter_write_r',\
  '_GEOSWKTWriter_setTrim_r',\
  '_GEOSWKTWriter_setRoundingPrecision_r',\
  '_GEOSWKTWriter_setOutputDimension_r',\
  '_GEOSWKTWriter_getOutputDimension_r',\
  '_GEOSWKTWriter_setOld3D_r',\
  '_GEOSWKBReader_create_r',\
  '_GEOSWKBReader_destroy_r',\
  '_GEOSWKBReader_read_r',\
  '_GEOSWKBReader_readHEX_r',\
  '_GEOSWKBWriter_create_r',\
  '_GEOSWKBWriter_destroy_r',\
  '_GEOSWKBWriter_write_r',\
  '_GEOSWKBWriter_writeHEX_r',\
  '_GEOSWKBWriter_getOutputDimension_r',\
  '_GEOSWKBWriter_setOutputDimension_r',\
  '_GEOSWKBWriter_getByteOrder_r',\
  '_GEOSWKBWriter_setByteOrder_r',\
  '_GEOSWKBWriter_getIncludeSRID_r',\
  '_GEOSWKBWriter_setIncludeSRID_r',\
  '_GEOSPrepare_r',\
  '_GEOSPreparedGeom_destroy_r',\
  '_GEOSPreparedContains_r',\
  '_GEOSPreparedContainsProperly_r',\
  '_GEOSPreparedCoveredBy_r',\
  '_GEOSPreparedCovers_r',\
  '_GEOSPreparedCrosses_r',\
  '_GEOSPreparedDisjoint_r',\
  '_GEOSPreparedIntersects_r',\
  '_GEOSPreparedOverlaps_r',\
  '_GEOSPreparedTouches_r',\
  '_GEOSPreparedWithin_r',\
  '_GEOSPreparedNearestPoints_r',\
  '_GEOSPreparedDistance_r',\
  '_GEOSSTRtree_create_r',\
  '_GEOSSTRtree_insert_r',\
  '_GEOSSTRtree_query_r',\
  '_GEOSSTRtree_nearest_r',\
  '_GEOSSTRtree_nearest_generic_r',\
  '_GEOSSTRtree_iterate_r',\
  '_GEOSSTRtree_remove_r',\
  '_GEOSSTRtree_destroy_r',\
  '_GEOSProject_r',\
  '_GEOSInterpolate_r',\
  '_GEOSProjectNormalized_r',\
  '_GEOSInterpolateNormalized_r',\
  '_GEOSGeom_extractUniquePoints_r',\
  '_GEOSGeom_createEmptyCollection_r',\
  '_GEOSGeom_createEmptyPoint_r',\
  '_GEOSGeom_createEmptyLineString_r',\
  '_GEOSGeom_createEmptyPolygon_r',\
  '_GEOSOrientationIndex_r',\
  '_GEOSSharedPaths_r',\
  '_GEOSSnap_r',\
  '_GEOSBufferParams_create_r',\
  '_GEOSBufferParams_destroy_r',\
  '_GEOSBufferParams_setEndCapStyle_r',\
  '_GEOSBufferParams_setJoinStyle_r',\
  '_GEOSBufferParams_setMitreLimit_r',\
  '_GEOSBufferParams_setQuadrantSegments_r',\
  '_GEOSBufferParams_setSingleSided_r',\
  '_GEOSBufferWithParams_r',\
  '_GEOSDelaunayTriangulation_r',\
  '_GEOSVoronoiDiagram_r',\
  '_GEOSSegmentIntersection_r',\
  '_GEOS_init_r',\
  '_GEOSContext_setNoticeMessageHandler_r',\
  '_GEOSContext_setErrorMessageHandler_r',\
  '_GEOS_finish_r',\
  '_GEOSCoordSeq_setX_r',\
  '_GEOSCoordSeq_setY_r',\
  '_GEOSCoordSeq_setZ_r',\
  '_GEOSCoordSeq_getX_r',\
  '_GEOSCoordSeq_getY_r',\
  '_GEOSCoordSeq_getZ_r',\
  '_GEOSConstrainedDelaunayTriangulation_r',\
  '_GEOSCoordSeq_copyFromArrays_r',\
  '_GEOSCoordSeq_copyFromBuffer_r',\
  '_GEOSCoordSeq_copyToArrays_r',\
  '_GEOSCoordSeq_copyToBuffer_r',\
  '_GEOSDensify_r',\
  '_GEOSDistanceWithin_r',\
  '_GEOSGeoJSONReader_create_r',\
  '_GEOSGeoJSONReader_destroy_r',\
  '_GEOSGeoJSONReader_readGeometry_r',\
  '_GEOSGeoJSONWriter_create_r',\
  '_GEOSGeoJSONWriter_destroy_r',\
  '_GEOSGeoJSONWriter_writeGeometry_r',\
  '_GEOSMakeValidParams_create_r',\
  '_GEOSMakeValidParams_destroy_r',\
  '_GEOSMakeValidParams_setKeepCollapsed_r',\
  '_GEOSMakeValidParams_setMethod_r',\
  '_GEOSMakeValidWithParams_r',\
  '_GEOSPreparedDistanceWithin_r',\
  '_GEOSWKBWriter_getFlavor_r',\
  '_GEOSWKBWriter_setFlavor_r'\
]"

GEOS_EMCC_FLAGS += -s EXPORTED_RUNTIME_METHODS="[\
  'addFunction',\
  'removeFunction',\
  'setValue',\
  'getValue',\
  'ccall',\
  'cwrap',\
  'UTF8ToString',\
  'stringToUTF8'\
]"