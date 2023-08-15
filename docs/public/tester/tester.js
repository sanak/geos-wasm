// import initGeosJs from '../assets/geos.esm.js'
import initGeosJs from 'https://cdn.skypack.dev/geos-wasm'
let OpenLayers

let map, wktfmt, layerInput, layerOutput
let featureResult, featureExpected
let result, expected
let geos, xmlhttp, xmldom
let reader, writer

window.featureA = null
window.featureB = null

async function init (_OpenLayers) {
  OpenLayers = _OpenLayers
  const options = {
    units: 'm',
    maxExtent: new OpenLayers.Bounds(
      -100000000000000000000,
      -100000000000000000000,
      100000000000000000000,
      100000000000000000000
    ), // limit of number 'e' format
    controls: [
      new OpenLayers.Control.PanZoomBar(),
      new OpenLayers.Control.MousePosition()
    ],
    numZoomLevels: 16
  }
  map = new OpenLayers.Map('map', options)
  wktfmt = new OpenLayers.Format.WKT({
    externalProjection: new OpenLayers.Projection('EPSG:4326')
  })
  const graphic = new OpenLayers.Layer.Image(
    'OpenLayers Image',
    './img/blank.gif',
    new OpenLayers.Bounds(-100000, -100000, 100000, 100000), // TODO: initial scale ?
    new OpenLayers.Size(426, 426)
  )

  layerInput = new OpenLayers.Layer.Vector('Vector Layer')
  layerOutput = new OpenLayers.Layer.Vector('Vector Layer')

  map.addLayers([graphic, layerInput, layerOutput])
  map.addControl(new OpenLayers.Control.EditingToolbarExt(layerInput))

  map.zoomToExtent(new OpenLayers.Bounds(-10, -10, 416, 416))

  // init controls and variables
  result = ''
  expected = ''
  document.getElementById('radA').click()
  updateOperation('intersection')

  // load embedded objects
  const url = location.toString()
  if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
    try {
      xmlhttp = new XMLHttpRequest()
    } catch (ex) {}
  }
  if (isEmpty(xmlhttp) && isEmpty(xmldom)) {
    document.getElementById('selTestXml').disabled = true
    document.getElementById('btnLoad').disabled = true
    document.getElementById('selTestCase').disabled = true
  }

  try {
    geos = await initGeosJs()
  } catch (ex) {
    console.error(`init: ${ex}`)
    geos = null
  }
}
window.init = init

function toWkt (feature) {
  let str = ''
  if (isEmpty(feature)) {
    return str
  }

  if (feature.constructor !== Array) {
    str = wktfmt.write(feature)
    // not a good idea in general, just for this demo
    str = str.replace(/,/g, ', ')
  } else {
    str = 'GEOMETRYCOLLECTION('
    for (let i = 0; i < feature.length; i++) {
      str += wktfmt.write(feature[i])
      if (i !== feature.length - 1) {
        str += ', '
      }
    }
    str += ')'
  }
  return str
}

function fromWkt (wkt) {
  if (isEmpty(wkt)) {
    return null
  }
  // // remove 'GEOMETRYCOLLECTION('+')' for OpenLayers
  // const regexp = /GEOMETRYCOLLECTION\s*\(([\w,\s\(\)]+)\)/g
  // wkt = wkt.replace(regexp, '$1')
  const feature = wktfmt.read(wkt)
  return feature
}

function addFeatures (layer, feature) {
  if (isEmpty(feature)) {
    return
  }

  const bounds = map.getExtent()
  if (feature.constructor !== Array) {
    bounds.extend(feature.geometry.getBounds())
    layer.addFeatures([feature])
  } else {
    for (let i = 0; i < feature.length; i++) {
      bounds.extend(feature[i].geometry.getBounds())
    }
    layer.addFeatures(feature)
  }
  map.zoomToExtent(bounds)
}

function destroyFeatures (layer, feature) {
  if (isEmpty(feature)) {
    return
  }

  if (feature.constructor !== Array) {
    layer.destroyFeatures([feature])
  } else {
    layer.destroyFeatures(feature)
  }
  feature = null
}
window.destroyFeatures = destroyFeatures

function loadInput (wkt, strtype) {
  if (isEmpty(wkt)) {
    wkt = document.getElementById('txtInput').value
  }
  const feature = fromWkt(wkt)

  if (isEmpty(strtype)) {
    strtype = getInputType()
  }
  if (feature) {
    setFeatureType(feature, strtype)
    setFeatureStyle(feature, strtype)
    addFeatures(layerInput, feature)
    if (strtype === 'a') {
      destroyFeatures(layerInput, window.featureA)
      window.featureA = feature
    } else if (strtype === 'b') {
      destroyFeatures(layerInput, window.featureB)
      window.featureB = feature
    }
  }
}
window.loadInput = loadInput

function loadOutput () {
  if (!isEmpty(result)) {
    const feature = fromWkt(result)
    if (feature) {
      setFeatureStyle(feature, 'result')
      addFeatures(layerOutput, feature)
      destroyFeatures(layerOutput, featureResult)
      featureResult = feature
    }
  }
  if (!isEmpty(expected)) {
    const feature = fromWkt(expected)
    if (feature) {
      setFeatureStyle(feature, 'expected')
      addFeatures(layerOutput, feature)
      destroyFeatures(layerOutput, featureExpected)
      featureExpected = feature
    }
  }
}
window.loadOutput = loadOutput

function isEmpty (value) {
  switch (typeof value) {
    case 'undefined':
      return true
    case 'object':
      if (value == null) {
        return true
      }
      break
    case 'string':
      if (value === '') {
        return true
      }
      break
  }
  return false
}

function getInputType () {
  if (document.getElementById('radA').checked) {
    return 'a'
  } else if (document.getElementById('radB').checked) {
    return 'b'
  }
  return 'a'
}
window.getInputType = getInputType

function setInputType (strtype) {
  if (strtype === 'a') {
    document.getElementById('radA').checked = true
  } else if (strtype === 'b') {
    document.getElementById('radB').checked = true
  }
}
window.setInputType = setInputType

function getOutputType () {
  if (document.getElementById('radResult').checked) {
    return 'result'
  } else if (document.getElementById('radExpected').checked) {
    return 'expected'
  }
  return 'result'
}

function setOutputType (strtype) {
  if (strtype === 'result') {
    document.getElementById('radResult').checked = true
  } else if (strtype === 'expected') {
    document.getElementById('radExpected').checked = true
  }
}

function setDefaultStyle (strtype) {
  if (strtype === 'a') {
    OpenLayers.Feature.Vector.style.default.strokeColor = '#2929fd'
    OpenLayers.Feature.Vector.style.default.fillColor = '#dfdfff'
  } else if (strtype === 'b') {
    OpenLayers.Feature.Vector.style.default.strokeColor = '#a52929'
    OpenLayers.Feature.Vector.style.default.fillColor = '#ffdfdf'
  }
}

function setFeatureStyle (feature, strtype) {
  if (isEmpty(feature)) {
    return
  }

  const style = {
    fillColor: '#ee9900',
    fillOpacity: 0.4,
    hoverFillColor: 'white',
    hoverFillOpacity: 0.8,
    strokeColor: '#ee9900',
    strokeOpacity: 1,
    strokeWidth: 1,
    strokeLinecap: 'round',
    strokeDashstyle: 'solid',
    hoverStrokeColor: 'red',
    hoverStrokeOpacity: 1,
    hoverStrokeWidth: 0.2,
    pointRadius: 6,
    hoverPointRadius: 1,
    hoverPointUnit: '%',
    pointerEvents: 'visiblePainted',
    cursor: 'inherit'
  }
  if (strtype === 'a') {
    style.strokeColor = '#2929fd'
    style.fillColor = '#dfdfff'
  } else if (strtype === 'b') {
    style.strokeColor = '#a52929'
    style.fillColor = '#ffdfdf'
  } else if (strtype === 'result') {
    style.strokeColor = '#acd62b'
    style.fillColor = '#ffffc2'
  } else if (strtype === 'expected') {
    style.strokeColor = '#2bd656'
    style.fillColor = '#c2ffc2'
  }

  if (feature.constructor !== Array) {
    feature.style = style
  } else {
    for (let i = 0; i < feature.length; i++) {
      feature[i].style = style
    }
  }
}
window.setFeatureStyle = setFeatureStyle

function setFeatureType (feature, strtype) {
  if (isEmpty(feature)) {
    return
  }

  if (feature.constructor !== Array) {
    feature.attributes.type = strtype
  } else {
    for (let i = 0; i < feature.length; i++) {
      feature[i].attributes.type = strtype
    }
  }
}
window.setFeatureType = setFeatureType

function displayInputGeometries (visibility) {
  layerInput.setVisibility(visibility)
}
window.displayInputGeometries = displayInputGeometries

function updateInput () {
  const strtype = getInputType()
  let wkt = ''
  if (strtype === 'a' && window.featureA) {
    wkt = toWkt(window.featureA)
  } else if (strtype === 'b' && window.featureB) {
    wkt = toWkt(window.featureB)
  }
  document.getElementById('txtInput').value = wkt
  setDefaultStyle(strtype)
}
window.updateInput = updateInput

function updateOutput () {
  const strtype = getOutputType()
  const txtOutput = document.getElementById('txtOutput')
  if (strtype === 'result') {
    txtOutput.value = result
  } else if (strtype === 'expected') {
    txtOutput.value = expected
  }
  if (!isEmpty(result) && !isEmpty(expected)) {
    if (result !== expected) {
      txtOutput.style.backgroundColor = '#ffcccc'
    } else {
      txtOutput.style.backgroundColor = '#ccffcc'
    }
  } else {
    txtOutput.style.backgroundColor = '#ffffff'
  }
}
window.updateOutput = updateOutput

function clearInput (all) {
  if ((getInputType() === 'a' || all) && window.featureA) {
    destroyFeatures(layerInput, window.featureA)
  }
  if ((getInputType() === 'b' || all) && window.featureB) {
    destroyFeatures(layerInput, window.featureB)
  }
  document.getElementById('txtInput').value = ''
}
window.clearInput = clearInput

function clearOutput () {
  result = ''
  expected = ''
  destroyFeatures(layerOutput, featureResult)
  destroyFeatures(layerOutput, featureExpected)
  const txtOutput = document.getElementById('txtOutput')
  txtOutput.value = ''
  txtOutput.style.backgroundColor = '#ffffff'
}
window.clearOutput = clearOutput

function setArgument (idx, label, value, disabled) {
  const lblArg = document.getElementById('lblArg' + idx)
  const txtArg = document.getElementById('txtArg' + idx)
  lblArg.textContent = label // FireFox
  lblArg.innerText = label // IE
  txtArg.value = value
  txtArg.disabled = disabled
}

function updateOperation (opname, arg1, arg2, arg3) {
  const selOperation = document.getElementById('selOperation')
  if (selOperation.value !== opname.toLowerCase()) {
    const optsOperation = selOperation.options
    for (let i = 0; i < optsOperation.length; i++) {
      if (optsOperation[i].value === opname.toLowerCase()) {
        optsOperation[i].selected = true
        break
      }
    }
  }
  setArgument(1, 'Geometry', 'A', true)
  switch (opname.toLowerCase()) {
    // simple unary
    case 'convexhull':
    case 'getboundary':
    case 'pointonsurface':
    case 'getcentroid':
    case 'envelope':
    case 'linemerge':
    case 'isempty':
    case 'isvalid':
    case 'issimple':
    case 'isring':
    case 'hasz':
    case 'area':
    case 'length':
      setArgument(2, '', '', true)
      setArgument(3, '', '', true)
      break
    // simple binary
    case 'intersection':
    case 'difference':
    case 'symdifference':
    case 'union':
    case 'relate':
    case 'disjoint':
    case 'touches':
    case 'intersects':
    case 'crosses':
    case 'within':
    case 'contains':
    case 'overlaps':
    case 'equals':
    case 'distance':
      setArgument(2, 'Geometry', 'B', true)
      setArgument(3, '', '', true)
      break
    case 'buffer':
      setArgument(2, 'Distance', '10', false)
      setArgument(3, 'Quadrant Segs', '8', false)
      break
    case 'simplify':
    case 'topologypreservesimplify':
      setArgument(2, 'Tolerance', '10', false)
      setArgument(3, '', '', true)
      break
    case 'equalsexact':
      setArgument(2, 'Geometry', 'B', true)
      setArgument(3, 'Tolerance', '0.00001', false) // TODO: reasonable initial value
      break
    case 'relatepattern':
      setArgument(2, 'Geometry', 'B', true)
      setArgument(3, 'Pattern', 'FFFFFFFFF', false) // TODO: reasonable initial value
      break
    default:
      alert('"' + opname + '" operation not supported.')
      return false
  }
  if (!isEmpty(arg1)) {
    document.getElementById('txtArg1').value = arg1
  }
  if (!isEmpty(arg2)) {
    document.getElementById('txtArg2').value = arg2
  }
  if (!isEmpty(arg3)) {
    document.getElementById('txtArg3').value = arg3
  }
  return true
}
window.updateOperation = updateOperation

function compute (exp) {
  clearOutput()

  if (!isEmpty(exp)) {
    expected = exp
    document.getElementById('radExpected').disabled = false
    if (isEmpty(geos)) {
      setOutputType('expected')
    }
  } else {
    document.getElementById('radExpected').disabled = true
  }

  const opts = document.getElementById('selOperation').options
  const opname = opts[opts.selectedIndex].value
  let fncname = opts[opts.selectedIndex].text
  fncname = fncname.replace(/\W+/g, '')
  fncname = 'GEOS' + fncname[0].toUpperCase() + fncname.substr(1)

  if (isEmpty(window.featureA)) {
    alert('all operation needs Geometry A.')
    return
  }
  let geomA, geomB, geomResult

  if (!isEmpty(geos)) {
    if (!reader) {
      reader = geos.GEOSWKTReader_create()
    }
    if (!writer) {
      writer = geos.GEOSWKTWriter_create()
    }
    geomA = geos.GEOSWKTReader_read(reader, toWkt(window.featureA))
  }

  switch (opname.toLowerCase()) {
    // simple unary (return geometry)
    case 'convexhull':
    case 'getboundary':
    case 'pointonsurface':
    case 'getcentroid':
    case 'envelope':
    case 'linemerge':
      if (!isEmpty(geos)) {
        geomResult = geos[fncname](geomA)
        result = geos.GEOSWKTWriter_write(writer, geomResult)
        if (!isEmpty(expected)) {
          expected = geos.GEOSWKTWriter_write(writer, geos.GEOSWKTReader_read(reader, expected))
        }
      }
      updateOutput()
      loadOutput()
      break
    // simple unary (return scalar (boolean))
    case 'isempty':
    case 'isvalid':
    case 'issimple':
    case 'isring':
    case 'hasz':
      if (!isEmpty(geos)) {
        result = geos[fncname](geomA)
        result = result.toString()
      }
      updateOutput()
      break
    // simple unary (return scalar (double))
    case 'area':
    case 'length':
      if (!isEmpty(geos)) {
        const valuePtr = geos.Module._malloc(8)
        geos[fncname](geomA, valuePtr)
        const value = geos.Module.getValue(valuePtr, 'double')
        result = value.toString()
        geos.Module._free(valuePtr)
      }
      updateOutput()
      break
    // simple binary (return geometry)
    case 'intersection':
    case 'difference':
    case 'symdifference':
    case 'union':
      if (!isEmpty(geos)) {
        if (isEmpty(window.featureB)) {
          alert('"' + fncname + '" operation needs Geometry B.')
          return
        }
        geomB = geos.GEOSWKTReader_read(reader, toWkt(window.featureB))
        geomResult = geos[fncname](geomA, geomB)
        result = geos.GEOSWKTWriter_write(writer, geomResult)
        if (!isEmpty(expected)) {
          expected = geos.GEOSWKTWriter_write(writer, geos.GEOSWKTReader_read(reader, expected))
        }
      }
      updateOutput()
      loadOutput()
      break
    case 'relate':
    case 'disjoint':
    case 'touches':
    case 'intersects':
    case 'crosses':
    case 'within':
    case 'contains':
    case 'overlaps':
    case 'equals':
    case 'distance':
      if (!isEmpty(geos)) {
        if (isEmpty(window.featureB)) {
          alert('"' + fncname + '" operation needs Geometry B.')
          return
        }
        geomB = geos.GEOSWKTReader_read(reader, toWkt(window.featureB))
        result = geos[fncname](geomA, geomB)
        result = result.toString()
      }
      updateOutput()
      break
    case 'buffer':
      if (!isEmpty(geos)) {
        let distance = document.getElementById('txtArg2').value
        if (isNaN(distance)) {
          alert('Distance value must be number.')
          return
        }
        distance = parseFloat(distance)
        let quadsegs = document.getElementById('txtArg3').value
        if (isNaN(quadsegs)) {
          alert('Quadrant Segs value must be number.')
          return
        }
        quadsegs = parseInt(quadsegs)
        geomResult = geos[fncname](geomA, distance, quadsegs)
        result = geos.GEOSWKTWriter_write(writer, geomResult)
        if (!isEmpty(expected)) {
          expected = geos.GEOSWKTWriter_write(writer, geos.GEOSWKTReader_read(reader, expected))
        }
      }
      updateOutput()
      loadOutput()
      break
    case 'simplify':
    case 'topologypreservesimplify':
      if (!isEmpty(geos)) {
        let tolerance = document.getElementById('txtArg2').value
        if (isNaN(tolerance)) {
          alert('Tolerance value must be number.')
          return
        }
        tolerance = parseFloat(tolerance)
        geomResult = geos[fncname](geomA, tolerance)
        result = geos.GEOSWKTWriter_write(writer, geomResult)
        if (!isEmpty(expected)) {
          expected = geos.GEOSWKTWriter_write(writer, geos.GEOSWKTReader_read(reader, expected))
        }
      }
      updateOutput()
      loadOutput()
      break
    case 'equalsexact':
      if (!isEmpty(geos)) {
        let tolerance = document.getElementById('txtArg3').value
        if (isNaN(tolerance)) {
          alert('Tolerance value must be number.')
          return
        }
        tolerance = parseFloat(tolerance)
        if (isEmpty(window.featureB)) {
          alert('"' + fncname + '" operation needs Geometry B.')
          return
        }
        geomB = geos.GEOSWKTReader_read(reader, toWkt(window.featureB))
        result = geos[fncname](geomA, geomB, tolerance)
        result = result.toString()
      }
      updateOutput()
      break
    case 'relatepattern':
      if (!isEmpty(geos)) {
        const pattern = document.getElementById('txtArg3').value
        if (isEmpty(window.featureB)) {
          alert('"' + fncname + '" operation needs Geometry B.')
          return
        }
        geomB = geos.GEOSWKTReader_read(reader, toWkt(window.featureB))
        result = geos[fncname](geomA, geomB, pattern)
        result = result.toString()
      }
      updateOutput()
      break
  }
}
window.compute = compute

function loadTestXml () {
  const optsTestXml = document.getElementById('selTestXml').options
  const optsTestCase = document.getElementById('selTestCase').options

  optsTestCase.length = 1

  if (optsTestXml.selectedIndex === 0) {
    xmldom = null
    return
  }
  const filename = optsTestXml[optsTestXml.selectedIndex].text

  if (!isEmpty(xmlhttp)) {
    xmlhttp.open('get', filename, false)
    xmlhttp.send(null)
    xmldom = xmlhttp.responseXML
  } else if (!isEmpty(xmldom)) {
    xmldom.load(filename)
  }

  if (!isEmpty(xmldom)) {
    const nodeCases = xmldom.getElementsByTagName('case')
    optsTestCase.length = nodeCases.length + 1
    for (let i = 0; i < nodeCases.length; i++) {
      optsTestCase[i + 1].text =
        nodeCases[i].getElementsByTagName('desc')[0].firstChild.data
    }
  }
}
window.loadTestXml = loadTestXml

function loadTestCase () {
  clearInput(true)
  clearOutput()

  if (isEmpty(xmldom)) {
    return
  }
  const caseIdx =
    document.getElementById('selTestCase').options.selectedIndex
  if (caseIdx === 0) {
    return
  }

  const nodeCase = xmldom.getElementsByTagName('case')[caseIdx - 1]
  let a = nodeCase.getElementsByTagName('a')[0].firstChild.data
  a = a.replace(/^\s+|\n|\s+$/g, '')
  let b = null
  const nodeBs = nodeCase.getElementsByTagName('b')
  if (nodeBs.length > 0) {
    b = nodeBs[0].firstChild.data
    b = b.replace(/^\s+|\n|\s+$/g, '')
  }
  const nodeTest = nodeCase.getElementsByTagName('test')[0]
  const nodeOp = nodeTest.getElementsByTagName('op')[0]
  let opname = nodeOp.getAttribute('name')
  const arg1 = nodeOp.getAttribute('arg1')
  const arg2 = nodeOp.getAttribute('arg2')
  const arg3 = nodeOp.getAttribute('arg3')
  let exp = nodeOp.firstChild.data
  exp = exp.replace(/^\s+|\n|\s+$/g, '')
  switch (opname) {
    case 'relate':
      opname = 'relatepattern'
      break
    case 'getInteriorPoint':
      opname = 'pointonsurface'
      break
  }
  // alert('a:\t' + a + '\nb:\t' + b + '\nopname:\t' + opname + '\narg1:\t' + arg1 + '\narg2:\t' + arg2 + '\narg3:\t' + arg3)
  loadInput(a, 'a')
  updateInput()
  if (!isEmpty(b)) {
    loadInput(b, 'b')
    updateInput()
  }
  if (updateOperation(opname, arg1, arg2, arg3)) {
    compute(exp)
  }
}
window.loadTestCase = loadTestCase;

// preload images
(function () {
  const roots = [
    'draw_point',
    'draw_line',
    'draw_polygon',
    'pan',
    'move_feature'
  ]
  const onImages = []
  const offImages = []
  for (let i = 0; i < roots.length; ++i) {
    onImages[i] = new Image()
    onImages[i].src = './theme/default/img/' + roots[i] + '_on.png'
    offImages[i] = new Image()
    offImages[i].src = './theme/default/img/' + roots[i] + '_on.png'
  }
})()
