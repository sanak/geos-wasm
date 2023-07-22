GEOS_EMCC_FLAGS :=

ifeq ($(type), debug)
GEOS_EMCC_FLAGS += -g4 --source-map-base http://localhost:8080/dist/ -fsanitize=address
else
GEOS_EMCC_FLAGS += -O3
endif

# output a single js file instead of a .js and .wasm file
# this is ~33% larger than the two file output, but it's easier to use
# in different environments...
GEOS_EMCC_FLAGS += -s SINGLE_FILE=1
GEOS_EMCC_FLAGS += -s ERROR_ON_UNDEFINED_SYMBOLS=0 -s FORCE_FILESYSTEM=1
GEOS_EMCC_FLAGS += -lworkerfs.js
GEOS_EMCC_FLAGS += -lnodefs.js
GEOS_EMCC_FLAGS += -s TOTAL_MEMORY=512MB -s ALLOW_MEMORY_GROWTH=1 -s DISABLE_EXCEPTION_CATCHING=0
GEOS_EMCC_FLAGS += -s WASM=1 -s EXPORT_ES6=1 -s MODULARIZE=1 -s 'EXPORT_NAME="CModule"'
GEOS_EMCC_FLAGS += -s RESERVED_FUNCTION_POINTERS=200 -s ALLOW_TABLE_GROWTH=1

# Enable the next line to export all functions,
# make sure to disable the EXPORTED_FUNCTIONS array below
# when doing so.
# GEOS_EMCC_FLAGS += -s LINKABLE=1 -s EXPORT_ALL=1
GEOS_EMCC_FLAGS += -s EXPORTED_FUNCTIONS="[\
	'_malloc',\
	'_free',\
	'_GEOS_init_r',\
	'_GEOSContext_setNoticeMessageHandler_r',\
	'_GEOSContext_setErrorMessageHandler_r',\
	'_GEOS_finish_r',\
	'_GEOSFree_r', \
	'_GEOSGeomFromWKB_buf_r',\
	'_GEOSGeomToWKB_buf_r',\
	'_GEOSGeomFromWKT_r',\
	'_GEOSGeomToWKT_r',\
	'_GEOSGeoJSONReader_create_r',\
	'_GEOSGeoJSONReader_destroy_r',\
	'_GEOSGeoJSONReader_readGeometry_r',\
	'_GEOSGeoJSONWriter_create_r',\
	'_GEOSGeoJSONWriter_destroy_r',\
	'_GEOSGeoJSONWriter_writeGeometry_r',\
	'_GEOSBuffer_r',\
	'_GEOSBufferParams_create_r',\
	'_GEOSBufferParams_destroy_r',\
	'_GEOSBufferParams_setEndCapStyle_r',\
	'_GEOSBufferParams_setJoinStyle_r',\
	'_GEOSBufferParams_setMitreLimit_r',\
	'_GEOSBufferParams_setQuadrantSegments_r',\
	'_GEOSBufferParams_setSingleSided_r',\
	'_GEOSBufferWithParams_r',\
	'_GEOSGeom_destroy_r'\
]"

GEOS_EMCC_FLAGS += -s EXPORTED_RUNTIME_METHODS="[\
	'setValue',\
	'getValue',\
	'ccall',\
	'cwrap',\
	'UTF8ToString',\
	'stringToUTF8',\
	'lengthBytesUTF8',\
	'addFunction',\
	'removeFunction'\
]"
