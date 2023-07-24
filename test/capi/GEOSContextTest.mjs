import test from 'node:test';
import assert from 'node:assert';
import initGeosJs from '../../src/index.mjs';
// import initGeosJs from '../../build/package/geos.esm.js';

const geos = await initGeosJs();

const provokeError = function(geos) {
  geos.capi.Geom_createEmptyCollection(999999);
}

const provokeNotice = function(geos) {
  const g = geos.capi.GeomFromWKT('POLYGON ((0 0, 1 0, 0 1, 1 1, 0 0))');
  geos.capi.isValid(g); // Produce a notice
  geos.capi.Geom_destroy(g);
}

test('Test "new" style error and notice handlers', (t) => {

  geos.capi.init();

  provokeError(geos);
  provokeNotice(geos);

  const errorMsg = geos.capi.getLastErrorMessage();
  const noticeMsg = geos.capi.getLastNoticeMessage();

  assert.strictEqual(errorMsg, 'IllegalArgumentException: Unsupported type request for GEOSGeom_createEmptyCollection_r');
  assert.strictEqual(noticeMsg, 'Self-intersection at or near point 0.5 0.5');

  geos.capi.finish();
});
