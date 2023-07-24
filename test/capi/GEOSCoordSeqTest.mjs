import test from 'node:test';
import assert from 'node:assert';
import initGeosJs from '../../src/index.mjs';
// import initGeosJs from '../../build/package/geos.esm.js';

const geos = await initGeosJs();

test('Test construction and fill of a 3D CoordinateSequence', (t) => {

  geos.capi.init();

  const cs_ = geos.capi.CoordSeq_create(5, 3);

  const size = geos.capi.CoordSeq_getSize(cs_);
  assert(-1 !== size);
  assert.strictEqual(size, 5);

  const dims = geos.capi.CoordSeq_getDimensions(cs_);
  assert(-1 !== dims);
  assert.strictEqual(dims, 3);

  for (let i = 0; i < 5; ++i) {
    const x = i * 10;
    const y = i * 10 + 1;
    const z = i * 10 + 2;

    geos.capi.CoordSeq_setX(cs_, i, x);
    geos.capi.CoordSeq_setY(cs_, i, y);
    geos.capi.CoordSeq_setZ(cs_, i, z);

    const xcheck = geos.capi.CoordSeq_getX(cs_, i);
    assert(!isNaN(xcheck));
    const ycheck = geos.capi.CoordSeq_getY(cs_, i);
    assert(!isNaN(ycheck));
    const zcheck = geos.capi.CoordSeq_getZ(cs_, i);
    assert(!isNaN(zcheck));

    assert.strictEqual(xcheck, x);
    assert.strictEqual(ycheck, y);
    assert.strictEqual(zcheck, z);
  }

  geos.capi.finish();
});

test('Test not swapped setX/setY calls (see bug #133, fixed)', (t) => {

  geos.capi.init();

  const cs_ = geos.capi.CoordSeq_create(1, 3);

  const size = geos.capi.CoordSeq_getSize(cs_);
  assert(-1 !== size);
  assert.strictEqual(size, 1);

  const dims = geos.capi.CoordSeq_getDimensions(cs_);
  assert(-1 !== dims);
  assert.strictEqual(dims, 3);

  const x = 10;
  const y = 11;
  const z = 12;

  geos.capi.CoordSeq_setX(cs_, 0, x);
  geos.capi.CoordSeq_setY(cs_, 0, y);
  geos.capi.CoordSeq_setZ(cs_, 0, z);

  const ycheck = geos.capi.CoordSeq_getY(cs_, 0);
  assert(!isNaN(ycheck));
  const xcheck = geos.capi.CoordSeq_getX(cs_, 0);
  assert(!isNaN(xcheck));
  const zcheck = geos.capi.CoordSeq_getZ(cs_, 0);
  assert(!isNaN(zcheck));

  assert.strictEqual(xcheck, x);
  assert.strictEqual(ycheck, y);
  assert.strictEqual(zcheck, z);

  geos.capi.finish();
});
