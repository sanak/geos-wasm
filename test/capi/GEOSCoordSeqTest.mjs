import test from 'node:test';
import assert from 'node:assert';
import initGeosJs from '../../src/index.mjs';
// import initGeosJs from '../../build/package/geos.esm.js';

const geos = await initGeosJs();

test('1: Test construction and fill of a 3D CoordinateSequence', (t) => {

  const cs_ = geos.capi.CoordSeq_create(5, 3);

  const size = [];
  const dims = [];

  assert(0 !== geos.capi.CoordSeq_getSize(cs_, size));
  assert.strictEqual(size[0], 5);

  assert(0 !== geos.capi.CoordSeq_getDimensions(cs_, dims));
  assert.strictEqual(dims[0], 3);

  for (let i = 0; i < 5; ++i) {
    const x = i * 10;
    const y = i * 10 + 1;
    const z = i * 10 + 2;

    geos.capi.CoordSeq_setX(cs_, i, x);
    geos.capi.CoordSeq_setY(cs_, i, y);
    geos.capi.CoordSeq_setZ(cs_, i, z);

    const xcheck = [], ycheck = [], zcheck = [];
    assert(0 !== geos.capi.CoordSeq_getX(cs_, i, xcheck));
    assert(0 !== geos.capi.CoordSeq_getY(cs_, i, ycheck));
    assert(0 !== geos.capi.CoordSeq_getZ(cs_, i, zcheck));

    assert.strictEqual(xcheck[0], x);
    assert.strictEqual(ycheck[0], y);
    assert.strictEqual(zcheck[0], z);
  }
});

test('2: Test not swapped setX/setY calls (see bug #133, fixed)', (t) => {

  const cs_ = geos.capi.CoordSeq_create(1, 3);

  const size = [];
  const dims = [];

  assert(0 !== geos.capi.CoordSeq_getSize(cs_, size));
  assert.strictEqual(size[0], 1);

  assert(0 !== geos.capi.CoordSeq_getDimensions(cs_, dims));
  assert.strictEqual(dims[0], 3);

  const x = 10;
  const y = 11;
  const z = 12;

  // X, Y, Z
  geos.capi.CoordSeq_setX(cs_, 0, x);
  geos.capi.CoordSeq_setY(cs_, 0, y);
  geos.capi.CoordSeq_setZ(cs_, 0, z);

  const xcheck = [], ycheck = [], zcheck = [];
  assert(0 !== geos.capi.CoordSeq_getY(cs_, 0, ycheck));
  assert(0 !== geos.capi.CoordSeq_getX(cs_, 0, xcheck));
  assert(0 !== geos.capi.CoordSeq_getZ(cs_, 0, zcheck));

  assert.strictEqual(xcheck[0], x);
  assert.strictEqual(ycheck[0], y);
  assert.strictEqual(zcheck[0], z);
});

test('3: Test not swapped setOrdinate calls (see bug #133, fixed)', (t) => {

  const cs_ = geos.capi.CoordSeq_create(1, 3);

  const size = [];
  const dims = [];

  assert(0 !== geos.capi.CoordSeq_getSize(cs_, size));
  assert.strictEqual(size[0], 1);

  assert(0 !== geos.capi.CoordSeq_getDimensions(cs_, dims));
  assert.strictEqual(dims[0], 3);

  const x = 10;
  const y = 11;
  const z = 12;

  // X, Y, Z
  geos.capi.CoordSeq_setOrdinate(cs_, 0, 0, x);
  geos.capi.CoordSeq_setOrdinate(cs_, 0, 1, y);
  geos.capi.CoordSeq_setOrdinate(cs_, 0, 2, z);

  const xcheck = [], ycheck = [], zcheck = [];
  assert(0 !== geos.capi.CoordSeq_getOrdinate(cs_, 0, 1, ycheck));
  assert(0 !== geos.capi.CoordSeq_getOrdinate(cs_, 0, 0, xcheck));
  assert(0 !== geos.capi.CoordSeq_getOrdinate(cs_, 0, 2, zcheck));

  assert.strictEqual(xcheck[0], x);
  assert.strictEqual(ycheck[0], y);
  assert.strictEqual(zcheck[0], z);

  // correct error on wrong ordinate index
  assert(0 === geos.capi.CoordSeq_setOrdinate(cs_, 0, 37, z));
});

test('4: Test swapped setX calls (see bug #133, fixed)', (t) => {

  const cs_ = geos.capi.CoordSeq_create(1, 3);

  const size = [];
  const dims = [];

  assert(0 !== geos.capi.CoordSeq_getSize(cs_, size));
  assert.strictEqual(size[0], 1);

  assert(0 !== geos.capi.CoordSeq_getDimensions(cs_, dims));
  assert.strictEqual(dims[0], 3);

  const x = 10;
  const y = 11;
  const z = 12;

  // X, Y, Z
  geos.capi.CoordSeq_setY(cs_, 0, y);
  geos.capi.CoordSeq_setX(cs_, 0, x);
  geos.capi.CoordSeq_setZ(cs_, 0, z);

  const xcheck = [], ycheck = [], zcheck = [];
  assert(0 !== geos.capi.CoordSeq_getY(cs_, 0, ycheck));
  assert(0 !== geos.capi.CoordSeq_getX(cs_, 0, xcheck));
  assert(0 !== geos.capi.CoordSeq_getZ(cs_, 0, zcheck));

  assert.strictEqual(xcheck[0], x);
  assert.strictEqual(ycheck[0], y);
  assert.strictEqual(zcheck[0], z);
});

test('5: Test swapped setOrdinate calls (see bug #133, fixed)', (t) => {

  const cs_ = geos.capi.CoordSeq_create(1, 3);

  const size = [];
  const dims = [];

  assert(0 !== geos.capi.CoordSeq_getSize(cs_, size));
  assert.strictEqual(size[0], 1);

  assert(0 !== geos.capi.CoordSeq_getDimensions(cs_, dims));
  assert.strictEqual(dims[0], 3);

  const x = 10;
  const y = 11;
  const z = 12;

  // X, Y, Z
  geos.capi.CoordSeq_setOrdinate(cs_, 0, 1, y);
  geos.capi.CoordSeq_setOrdinate(cs_, 0, 0, x);
  geos.capi.CoordSeq_setOrdinate(cs_, 0, 2, z);

  const xcheck = [], ycheck = [], zcheck = [];
  assert(0 !== geos.capi.CoordSeq_getOrdinate(cs_, 0, 1, ycheck));
  assert(0 !== geos.capi.CoordSeq_getOrdinate(cs_, 0, 0, xcheck));
  assert(0 !== geos.capi.CoordSeq_getOrdinate(cs_, 0, 2, zcheck));

  assert.strictEqual(xcheck[0], x);
  assert.strictEqual(ycheck[0], y);
  assert.strictEqual(zcheck[0], z);
});

test('6: Test getDimensions call (see bug #135)', (t) => {

  const cs_ = geos.capi.CoordSeq_create(1, 2);

  const size = [];
  const dims = [];

  assert(0 !== geos.capi.CoordSeq_getSize(cs_, size));
  assert.strictEqual(size[0], 1);

  assert(0 !== geos.capi.CoordSeq_getDimensions(cs_, dims));

  // The dimension passed to GEOSCoordSeq_create()
  // is a request for a minimum, not a strict mandate
  // for changing actual size.
  //
  assert(dims[0] >= 2);

});

test('7: ccw orientation', (t) => {

  // ccw orientation
  const cs_ = geos.capi.CoordSeq_create(4, 2);
  const ccw = [];

  geos.capi.CoordSeq_setX(cs_, 0, 0);
  geos.capi.CoordSeq_setY(cs_, 0, 0);

  geos.capi.CoordSeq_setX(cs_, 1, 1);
  geos.capi.CoordSeq_setY(cs_, 1, 0);

  geos.capi.CoordSeq_setX(cs_, 2, 1);
  geos.capi.CoordSeq_setY(cs_, 2, 1);

  geos.capi.CoordSeq_setX(cs_, 3, 0);
  geos.capi.CoordSeq_setY(cs_, 3, 0);

  assert.strictEqual(geos.capi.CoordSeq_isCCW(cs_, ccw), 1);
  assert(ccw[0] != 0);
});

test('8: cw orientation', (t) => {

  // cw orientation
  const cs_ = geos.capi.CoordSeq_create(4, 2);
  const ccw = [];

  geos.capi.CoordSeq_setX(cs_, 0, 0);
  geos.capi.CoordSeq_setY(cs_, 0, 0);

  geos.capi.CoordSeq_setX(cs_, 1, 1);
  geos.capi.CoordSeq_setY(cs_, 1, 1);

  geos.capi.CoordSeq_setX(cs_, 2, 1);
  geos.capi.CoordSeq_setY(cs_, 2, 0);

  geos.capi.CoordSeq_setX(cs_, 3, 0);
  geos.capi.CoordSeq_setY(cs_, 3, 0);

  assert.strictEqual(geos.capi.CoordSeq_isCCW(cs_, ccw), 1);
  assert(!ccw[0]);
});

test('9: no orientation', (t) => {

  // no orientation
  const cs_ = geos.capi.CoordSeq_create(3, 2);
  const ccw = [];

  geos.capi.CoordSeq_setX(cs_, 0, 0);
  geos.capi.CoordSeq_setY(cs_, 0, 0);

  geos.capi.CoordSeq_setX(cs_, 1, 1);
  geos.capi.CoordSeq_setY(cs_, 1, 1);

  geos.capi.CoordSeq_setX(cs_, 2, 1);
  geos.capi.CoordSeq_setY(cs_, 2, 0);

  assert.strictEqual(geos.capi.CoordSeq_isCCW(cs_, ccw), 1);
  assert(!ccw[0]);
});

test('10: no orientation', (t) => {

  // no orientation
  const cs_ = geos.capi.CoordSeq_create(0, 0);
  const ccw = [];

  assert.strictEqual(geos.capi.CoordSeq_isCCW(cs_, ccw), 1);
  assert(!ccw[0]);
});

test('11: ', (t) => {

  const cs_ = geos.capi.CoordSeq_create(1, 2);

  const size = [];
  const dims = [];

  assert(0 !== geos.capi.CoordSeq_getSize(cs_, size));
  assert.strictEqual(size[0], 1, 'Seq has expected size');

  assert(0 !== geos.capi.CoordSeq_getDimensions(cs_, dims));
  assert.strictEqual(dims[0], 2, 'seq has expected dim');

  const x = 10;
  const y = 11;

  geos.capi.CoordSeq_setXY(cs_, 0, x, y);

  const xcheck = [], ycheck = [], zcheck = [];
  assert(0 != geos.capi.CoordSeq_getXY(cs_, 0, xcheck, ycheck));

  assert.strictEqual(xcheck[0], x);
  assert.strictEqual(ycheck[0], y);

  // Calling getXYZ on a 2D seq gets you NaN for Z
  assert(0 != geos.capi.CoordSeq_getXYZ(cs_, 0, xcheck, ycheck, zcheck));

  assert.strictEqual(xcheck[0], x);
  assert.strictEqual(ycheck[0], y);
  assert("z is NaN on 2D seq", isNaN(zcheck[0]));

  // Calling setXYZ on a 2D seq coerces to 3D
  const z = 12;
  geos.capi.CoordSeq_setXYZ(cs_, 0, x, y, z);

  assert(0 != geos.capi.CoordSeq_getXYZ(cs_, 0, xcheck, ycheck, zcheck));

  assert.strictEqual(xcheck[0], x);
  assert.strictEqual(ycheck[0], y);
  assert.strictEqual(zcheck[0], z);
});
