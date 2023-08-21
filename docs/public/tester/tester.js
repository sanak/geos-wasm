// import initGeosJs from '../assets/geos.esm.js'
import initGeosJs from 'https://cdn.skypack.dev/geos-wasm'

export default function Tester (engine) {
  const self = this
  const OpenLayers = engine

  this.featureA = null
  this.featureB = null

  let map, wktfmt, layerInput, layerOutput
  let featureResult, featureExpected
  let result, expected
  let geos, xmlhttp, xmldom
  let reader, writer

  // Customize EditingToolbar
  OpenLayers.Control.EditingToolbarExt = OpenLayers.Class(OpenLayers.Control.Panel, {
    // Arrow function (=>) is not supported in ol2
    initialize: function (layer, options) {
      OpenLayers.Control.Panel.prototype.initialize.apply(this, [options])

      const zoomNavis = ([
        new OpenLayers.Control.ZoomBox(),
        new OpenLayers.Control.Navigation()
      ])
      const drawFeatures = [
        new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.Point, { displayClass: 'olControlDrawFeaturePoint' }),
        new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.Path, { displayClass: 'olControlDrawFeaturePath' }),
        new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.Polygon, { displayClass: 'olControlDrawFeaturePolygon' })
      ]
      for (let i = 0; i < drawFeatures.length; i++) {
        drawFeatures[i].featureAdded = function (feature) {
          const strtype = getInputType()
          setFeatureType(feature, strtype)
          setFeatureStyle(feature, strtype)
          if (strtype === 'a') {
            if (self.featureA) {
              destroyFeatures(layer, self.featureA)
            }
            self.featureA = feature
          } else if (strtype === 'b') {
            if (self.featureB) {
              destroyFeatures(layer, self.featureB)
            }
            self.featureB = feature
          }
          self.updateInput()
        }
      }
      const modifyFeature = new OpenLayers.Control.ModifyFeature(layer, { displayClass: 'olControlMoveFeature' })
      modifyFeature.onModificationStart = function (feature) {
        const strtype = getFeatureType(feature)
        setInputType(strtype)
        self.updateInput()
        layer.redraw() // for vertex marker
      }
      modifyFeature.onModification = function (feature) {
        self.updateInput()
      }
      modifyFeature.onModificationEnd = function (feature) {
        self.updateInput()
      }
      this.addControls(zoomNavis.concat(drawFeatures.concat([modifyFeature])))
    },

    draw: function () {
      const div = OpenLayers.Control.Panel.prototype.draw.apply(this, arguments)
      if (this.defaultControl === null) {
        this.defaultControl = this.controls[1]
      }
      return div
    },

    CLASS_NAME: 'OpenLayers.Control.EditingToolbar'
  })

  this.init = async () => {
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
    self.map = map // For debug
    wktfmt = new OpenLayers.Format.WKT({
      externalProjection: new OpenLayers.Projection('EPSG:4326')
    })
    const graphic = new OpenLayers.Layer.Image(
      'OpenLayers Image',
      './lib/ol2/img/blank.gif',
      new OpenLayers.Bounds(-100000, -100000, 100000, 100000), // TODO: initial scale ?
      new OpenLayers.Size(426, 426)
    )

    layerInput = new OpenLayers.Layer.Vector('Input Vector Layer', {
      styleMap: new OpenLayers.StyleMap({
        temporary: OpenLayers.Feature.Vector.style.default,
        default: OpenLayers.Feature.Vector.style.default,
        select: OpenLayers.Feature.Vector.style.select
      })
    })
    layerOutput = new OpenLayers.Layer.Vector('Output Vector Layer')

    map.addLayers([graphic, layerInput, layerOutput])
    map.addControl(new OpenLayers.Control.EditingToolbarExt(layerInput))

    map.zoomToExtent(new OpenLayers.Bounds(-10, -10, 416, 416))

    // init controls and variables
    result = ''
    expected = ''
    document.getElementById('radA').click()
    self.updateOperation('envelope')

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

  const toWkt = (feature) => {
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

  const fromWkt = (wkt) => {
    if (isEmpty(wkt)) {
      return null
    }
    // // remove 'GEOMETRYCOLLECTION('+')' for OpenLayers
    // const regexp = /GEOMETRYCOLLECTION\s*\(([\w,\s\(\)]+)\)/g
    // wkt = wkt.replace(regexp, '$1')
    const feature = wktfmt.read(wkt)
    return feature
  }

  const addFeatures = (layer, feature) => {
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

  const destroyFeatures = (layer, feature) => {
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

  const loadInput = (wkt, strtype) => {
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
        destroyFeatures(layerInput, self.featureA)
        self.featureA = feature
      } else if (strtype === 'b') {
        destroyFeatures(layerInput, self.featureB)
        self.featureB = feature
      }
    }
  }

  const loadOutput = () => {
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

  const isEmpty = (value) => {
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

  const getInputType = () => {
    if (document.getElementById('radA').checked) {
      return 'a'
    } else if (document.getElementById('radB').checked) {
      return 'b'
    }
    return 'a'
  }

  const setInputType = (strtype) => {
    if (strtype === 'a') {
      document.getElementById('radA').checked = true
    } else if (strtype === 'b') {
      document.getElementById('radB').checked = true
    }
  }

  const getOutputType = () => {
    if (document.getElementById('radResult').checked) {
      return 'result'
    } else if (document.getElementById('radExpected').checked) {
      return 'expected'
    }
    return 'result'
  }

  const setOutputType = (strtype) => {
    if (strtype === 'result') {
      document.getElementById('radResult').checked = true
    } else if (strtype === 'expected') {
      document.getElementById('radExpected').checked = true
    }
  }

  const setDefaultStyle = (strtype) => {
    if (strtype === 'a') {
      OpenLayers.Feature.Vector.style.default.strokeColor = '#2929fd'
      OpenLayers.Feature.Vector.style.default.fillColor = '#dfdfff'
    } else if (strtype === 'b') {
      OpenLayers.Feature.Vector.style.default.strokeColor = '#a52929'
      OpenLayers.Feature.Vector.style.default.fillColor = '#ffdfdf'
    }
  }

  const setFeatureStyle = (feature, strtype) => {
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

  const setFeatureType = (feature, strtype) => {
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

  const getFeatureType = (feature) => {
    if (isEmpty(feature)) {
      return
    }

    let strtype = ''
    if (feature.constructor !== Array) {
      strtype = feature.attributes.type
    } else if (feature.length > 0) {
      strtype = feature[0].attributes.type
    }
    return strtype
  }

  this.displayInputGeometries = (visibility) => {
    layerInput.setVisibility(visibility)
  }

  this.updateInput = () => {
    const strtype = getInputType()
    let wkt = ''
    if (strtype === 'a' && self.featureA) {
      wkt = toWkt(self.featureA)
    } else if (strtype === 'b' && self.featureB) {
      wkt = toWkt(self.featureB)
    }
    document.getElementById('txtInput').value = wkt
    setDefaultStyle(strtype)
  }

  this.updateOutput = () => {
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

  this.clearInput = (all) => {
    if ((getInputType() === 'a' || all) && self.featureA) {
      destroyFeatures(layerInput, self.featureA)
    }
    if ((getInputType() === 'b' || all) && self.featureB) {
      destroyFeatures(layerInput, self.featureB)
    }
    document.getElementById('txtInput').value = ''
  }

  this.clearOutput = () => {
    result = ''
    expected = ''
    destroyFeatures(layerOutput, featureResult)
    destroyFeatures(layerOutput, featureExpected)
    const txtOutput = document.getElementById('txtOutput')
    txtOutput.value = ''
    txtOutput.style.backgroundColor = '#ffffff'
  }

  const setArgument = (idx, label, value, disabled) => {
    const lblArg = document.getElementById('lblArg' + idx)
    const txtArg = document.getElementById('txtArg' + idx)
    lblArg.textContent = label // FireFox
    lblArg.innerText = label // IE
    txtArg.value = value
    txtArg.disabled = disabled
  }

  this.updateOperation = (opname, arg1, arg2, arg3, arg4, arg5, arg6) => {
    const selOperation = document.getElementById('selOperation')
    if (selOperation.selectedIndex >= 0 &&
        selOperation.selectedOptions[0].text.toLowerCase() !== opname.toLowerCase()) {
      const optsOperation = selOperation.options
      for (let i = 0; i < optsOperation.length; i++) {
        if (optsOperation[i].text.toLowerCase() === opname.toLowerCase()) {
          optsOperation[i].selected = true
          break
        }
      }
    }
    setArgument(1, 'Geometry', 'A', true)
    setArgument(2, '', '', true)
    setArgument(3, '', '', true)
    setArgument(4, '', '', true)
    setArgument(5, '', '', true)
    setArgument(6, '', '', true)
    switch (opname.toLowerCase()) {
      // simple unary
      case 'clone':
      case 'envelope':
      case 'linemerge':
      case 'normalize':
      case 'reverse':
      case 'makevalid':
      case 'boundary':
      case 'getcentroid':
      case 'convexhull':
      case 'pointonsurface':
      case 'minimumboundingcircle':
      case 'minimumwidth':
      case 'delaunaytriangulation':
      case 'constraineddelaunaytriangulation':
      case 'voronoidiagram':
      case 'buildarea':
      case 'unaryunion':
      case 'node':
      case 'coverageunion':
      case 'hasz':
      case 'isempty':
      case 'issimple':
      case 'isvalid':
      case 'area':
      case 'length':
        break
      // simple binary
      case 'nearestpoints':
      case 'difference':
      case 'intersection':
      case 'symdifference':
      case 'union':
      case 'clipbyrect':
      case 'contains':
      case 'coveredby':
      case 'covers':
      case 'crosses':
      case 'disjoint':
      case 'equals':
      case 'intersects':
      case 'overlaps':
      case 'touches':
      case 'within':
      case 'project':
      case 'distance':
      case 'frechetdistance':
      case 'hausdorffdistance':
        setArgument(2, 'Geometry', 'B', true)
        break
      case 'setprecision':
        setArgument(2, 'Precision', '0.1', false)
        setArgument(3, 'Flags', '2', false)
        break
      case 'buffer':
        setArgument(2, 'Width', '10', false)
        setArgument(3, 'Quadrant Segs', '8', false)
        break
      case 'bufferwithstyle':
        setArgument(2, 'Width', '10', false)
        setArgument(3, 'Quadrant Segs', '8', false)
        setArgument(4, 'End Cap Style', '1', false)
        setArgument(5, 'Join Style', '1', false)
        setArgument(6, 'Mitre Limit', '10', false)
        break
      case 'offsetcurve':
        setArgument(2, 'Width', '10', false)
        setArgument(3, 'Quadrant Segs', '8', false)
        setArgument(4, 'Join Style', '1', false)
        setArgument(5, 'Mitre Limit', '10', false)
        break
      case 'densify':
      case 'maximuminscribedcircle':
      case 'simplify':
      case 'topologypreservesimplify':
        setArgument(2, 'Tolerance', '10', false)
        break
      case 'largestemptycircle':
      case 'equalsexact':
        setArgument(2, 'Geometry', 'B', true)
        setArgument(3, 'Tolerance', '0.00001', false) // TODO: reasonable initial value
        break
      case 'relatepattern':
        setArgument(2, 'Geometry', 'B', true)
        setArgument(3, 'Pattern', 'FFFFFFFFF', false) // TODO: reasonable initial value
        break
      case 'relateboundarynoderule':
        setArgument(2, 'Geometry', 'B', true)
        setArgument(3, 'Boundary Node Rule', '1', false)
        break
      case 'interpolate':
        setArgument(2, 'Distance', '10', false)
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
    if (!isEmpty(arg4)) {
      document.getElementById('txtArg4').value = arg4
    }
    if (!isEmpty(arg5)) {
      document.getElementById('txtArg5').value = arg5
    }
    if (!isEmpty(arg6)) {
      document.getElementById('txtArg6').value = arg6
    }
    return true
  }

  this.compute = (exp) => {
    self.clearOutput()

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
    const opname = opts[opts.selectedIndex].text
    const fncname = opts[opts.selectedIndex].value

    if (isEmpty(self.featureA)) {
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
      geomA = geos.GEOSWKTReader_read(reader, toWkt(self.featureA))
    }

    switch (opname.toLowerCase()) {
      // simple unary (return geometry)
      case 'clone':
      case 'envelope':
      case 'linemerge':
      case 'normalize':
      case 'reverse':
      case 'makevalid':
      case 'boundary':
      case 'getcentroid':
      case 'convexhull':
      case 'pointonsurface':
      case 'minimumboundingcircle':
      case 'minimumwidth':
      case 'delaunaytriangulation':
      case 'constraineddelaunaytriangulation':
      case 'voronoidiagram':
      case 'buildarea':
      case 'unaryunion':
      case 'node':
      case 'coverageunion':
        if (!isEmpty(geos)) {
          geomResult = geos[fncname](geomA)
          result = geos.GEOSWKTWriter_write(writer, geomResult)
          if (!isEmpty(expected)) {
            expected = geos.GEOSWKTWriter_write(writer, geos.GEOSWKTReader_read(reader, expected))
          }
        }
        self.updateOutput()
        loadOutput()
        break
      // simple unary (return scalar (boolean))
      case 'hasz':
      case 'isempty':
      case 'issimple':
      case 'isvalid':
        if (!isEmpty(geos)) {
          result = geos[fncname](geomA)
          result = result.toString()
        }
        self.updateOutput()
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
        self.updateOutput()
        break
      // simple binary (return geometry)
      case 'nearestpoints':
      case 'difference':
      case 'intersection':
      case 'symdifference':
      case 'union':
      case 'clipbyrect':
        if (!isEmpty(geos)) {
          if (isEmpty(self.featureB)) {
            alert('"' + opname + '" operation needs Geometry B.')
            return
          }
          geomB = geos.GEOSWKTReader_read(reader, toWkt(self.featureB))
          geomResult = geos[fncname](geomA, geomB)
          result = geos.GEOSWKTWriter_write(writer, geomResult)
          if (!isEmpty(expected)) {
            expected = geos.GEOSWKTWriter_write(writer, geos.GEOSWKTReader_read(reader, expected))
          }
        }
        self.updateOutput()
        loadOutput()
        break
      // simple binary (return scalar (boolean))
      case 'contains':
      case 'coveredby':
      case 'covers':
      case 'crosses':
      case 'disjoint':
      case 'equals':
      case 'intersects':
      case 'overlaps':
      case 'touches':
      case 'within':
      case 'project':
        if (!isEmpty(geos)) {
          if (isEmpty(self.featureB)) {
            alert('"' + opname + '" operation needs Geometry B.')
            return
          }
          geomB = geos.GEOSWKTReader_read(reader, toWkt(self.featureB))
          result = geos[fncname](geomA, geomB)
          result = result.toString()
        }
        self.updateOutput()
        break
      // simple binary (return scalar (double))
      case 'distance':
      case 'frechetdistance':
      case 'hausdorffdistance':
        if (!isEmpty(geos)) {
          if (isEmpty(self.featureB)) {
            alert('"' + opname + '" operation needs Geometry B.')
            return
          }
          geomB = geos.GEOSWKTReader_read(reader, toWkt(self.featureB))
          const valuePtr = geos.Module._malloc(8)
          result = geos[fncname](geomA, geomB, valuePtr)
          const value = geos.Module.getValue(valuePtr, 'double')
          result = value.toString()
          geos.Module._free(valuePtr)
        }
        self.updateOutput()
        break
      // has arguments
      case 'setprecision':
        if (!isEmpty(geos)) {
          let precision = document.getElementById('txtArg2').value
          if (isNaN(precision)) {
            alert('Precision value must be number.')
            return
          }
          precision = parseFloat(precision)

          let flags = document.getElementById('txtArg3').value
          if (isNaN(flags)) {
            flags = 0
          } else {
            flags = parseInt(flags)
            if (flags < 0 || flags > 2) {
              alert('Flags value must be 0-2.')
              return
            }
          }

          geomResult = geos[fncname](geomA, precision, flags)
          result = geos.GEOSWKTWriter_write(writer, geomResult)
          if (!isEmpty(expected)) {
            expected = geos.GEOSWKTWriter_write(writer, geos.GEOSWKTReader_read(reader, expected))
          }
        }
        self.updateOutput()
        loadOutput()
        break
      case 'buffer':
        if (!isEmpty(geos)) {
          let width = document.getElementById('txtArg2').value
          if (isNaN(width)) {
            alert('Width value must be number.')
            return
          }
          width = parseFloat(width)

          let quadsegs = document.getElementById('txtArg3').value
          if (isNaN(quadsegs)) {
            alert('Quadrant Segs value must be number.')
            return
          }
          quadsegs = parseInt(quadsegs)

          geomResult = geos[fncname](geomA, width, quadsegs)
          result = geos.GEOSWKTWriter_write(writer, geomResult)
          if (!isEmpty(expected)) {
            expected = geos.GEOSWKTWriter_write(writer, geos.GEOSWKTReader_read(reader, expected))
          }
        }
        self.updateOutput()
        loadOutput()
        break
      case 'bufferwithstyle':
        if (!isEmpty(geos)) {
          let width = document.getElementById('txtArg2').value
          if (isNaN(width)) {
            alert('Width value must be number.')
            return
          }
          width = parseFloat(width)

          let quadsegs = document.getElementById('txtArg3').value
          if (isNaN(quadsegs)) {
            alert('Quadrant Segs value must be number.')
            return
          }
          quadsegs = parseInt(quadsegs)

          let endCapStyle = document.getElementById('txtArg4').value
          if (isNaN(endCapStyle)) {
            alert('End Cap Style value must be number (1-3).')
            return
          }
          endCapStyle = parseInt(endCapStyle)
          if (endCapStyle < 1 || endCapStyle > 3) {
            alert('End Cap Style value must be 1-3.')
            return
          }

          let joinStyle = document.getElementById('txtArg5').value
          if (isNaN(joinStyle)) {
            alert('Join Style value must be number (1-3).')
            return
          }
          joinStyle = parseInt(joinStyle)
          if (joinStyle < 1 || joinStyle > 3) {
            alert('Join Style value must be 1-3.')
            return
          }

          let mitreLimit = document.getElementById('txtArg6').value
          if (isNaN(mitreLimit)) {
            alert('Mitre Limit value must be number.')
            return
          }
          mitreLimit = parseFloat(mitreLimit)

          geomResult = geos[fncname](geomA, width, quadsegs, endCapStyle, joinStyle, mitreLimit)
          result = geos.GEOSWKTWriter_write(writer, geomResult)
          if (!isEmpty(expected)) {
            expected = geos.GEOSWKTWriter_write(writer, geos.GEOSWKTReader_read(reader, expected))
          }
        }
        self.updateOutput()
        loadOutput()
        break
      case 'offsetcurve':
        if (!isEmpty(geos)) {
          let width = document.getElementById('txtArg2').value
          if (isNaN(width)) {
            alert('Width value must be number.')
            return
          }
          width = parseFloat(width)

          let quadsegs = document.getElementById('txtArg3').value
          if (isNaN(quadsegs)) {
            alert('Quadrant Segs value must be number.')
            return
          }
          quadsegs = parseInt(quadsegs)

          let joinStyle = document.getElementById('txtArg4').value
          if (isNaN(joinStyle)) {
            alert('Join Style value must be number (1-3).')
            return
          }
          joinStyle = parseInt(joinStyle)
          if (joinStyle < 1 || joinStyle > 3) {
            alert('Join Style value must be 1-3.')
            return
          }

          let mitreLimit = document.getElementById('txtArg5').value
          if (isNaN(mitreLimit)) {
            alert('Mitre Limit value must be number.')
            return
          }
          mitreLimit = parseFloat(mitreLimit)

          geomResult = geos[fncname](geomA, width, quadsegs, joinStyle, mitreLimit)
          result = geos.GEOSWKTWriter_write(writer, geomResult)
          if (!isEmpty(expected)) {
            expected = geos.GEOSWKTWriter_write(writer, geos.GEOSWKTReader_read(reader, expected))
          }
        }
        self.updateOutput()
        loadOutput()
        break
      case 'densify':
      case 'maximuminscribedcircle':
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
        self.updateOutput()
        loadOutput()
        break
      case 'largestemptycircle':
      case 'equalsexact':
        if (!isEmpty(geos)) {
          let tolerance = document.getElementById('txtArg3').value
          if (isNaN(tolerance)) {
            alert('Tolerance value must be number.')
            return
          }
          tolerance = parseFloat(tolerance)

          if (isEmpty(self.featureB)) {
            alert('"' + opname + '" operation needs Geometry B.')
            return
          }
          geomB = geos.GEOSWKTReader_read(reader, toWkt(self.featureB))
          result = geos[fncname](geomA, geomB, tolerance)
          result = result.toString()
        }
        self.updateOutput()
        break
      case 'relatepattern':
        if (!isEmpty(geos)) {
          const pattern = document.getElementById('txtArg3').value
          if (isEmpty(self.featureB)) {
            alert('"' + opname + '" operation needs Geometry B.')
            return
          }
          geomB = geos.GEOSWKTReader_read(reader, toWkt(self.featureB))
          result = geos[fncname](geomA, geomB, pattern)
          result = result.toString()
        }
        self.updateOutput()
        break
      case 'relateboundarynoderule':
        if (!isEmpty(geos)) {
          let bnr = document.getElementById('txtArg3').value
          if (isNaN(bnr)) {
            alert('Boundary Node Rule value must be number (1-4).')
            return
          } else {
            bnr = parseInt(bnr)
            if (bnr < 1 || bnr > 4) {
              alert('Boundary Node Rule value must be number (1-4).')
              return
            }
          }
          if (isEmpty(self.featureB)) {
            alert('"' + opname + '" operation needs Geometry B.')
            return
          }
          geomB = geos.GEOSWKTReader_read(reader, toWkt(self.featureB))
          result = geos[fncname](geomA, geomB, bnr)
          result = result.toString()
        }
        self.updateOutput()
        break
      case 'interpolate':
        if (!isEmpty(geos)) {
          let distance = document.getElementById('txtArg2').value
          if (isNaN(distance)) {
            alert('Distance value must be number.')
            return
          }
          distance = parseFloat(distance)
          geomResult = geos[fncname](geomA, distance)
          result = geos.GEOSWKTWriter_write(writer, geomResult)
          if (!isEmpty(expected)) {
            expected = geos.GEOSWKTWriter_write(writer, geos.GEOSWKTReader_read(reader, expected))
          }
        }
        self.updateOutput()
        loadOutput()
        break
    }
  }

  this.addTestXmls = async (testXmlJsonPath) => {
    const res = await fetch(testXmlJsonPath)
    const testXmlJson = await res.json()
    const selTestXml = document.getElementById('selTestXml')
    const optDefault = document.createElement('option')
    optDefault.selected = true
    optDefault.text = ' --- Select Below ---'
    selTestXml.appendChild(optDefault)
    for (let i = 0; i < testXmlJson.length; i++) {
      const opt = document.createElement('option')
      opt.text = testXmlJson[i]
      opt.value = './tests/' + testXmlJson[i]
      selTestXml.appendChild(opt)
    }
  }

  this.loadTestXml = () => {
    const optsTestXml = document.getElementById('selTestXml').options
    const optsTestCase = document.getElementById('selTestCase').options

    optsTestCase.length = 1

    if (optsTestXml.selectedIndex === 0) {
      xmldom = null
      return
    }
    const filename = optsTestXml[optsTestXml.selectedIndex].value

    if (!isEmpty(xmlhttp)) {
      xmlhttp.open('get', filename, false)
      xmlhttp.send(null)
      xmldom = xmlhttp.responseXML
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

  this.loadTestCase = () => {
    self.clearInput(true)
    self.clearOutput()

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
    const arg4 = nodeOp.getAttribute('arg4')
    const arg5 = nodeOp.getAttribute('arg5')
    const arg6 = nodeOp.getAttribute('arg6')
    let exp = nodeOp.firstChild.data
    exp = exp.replace(/^\s+|\n|\s+$/g, '')
    switch (opname.toLowerCase()) {
      case 'copy':
        opname = 'clone'
        break
      case 'reduceprecision':
        opname = 'setPrecision'
        break
      case 'getboundary':
        opname = 'boundary'
        break
      case 'getinteriorpoint':
        opname = 'pointOnSurface'
        break
      case 'simplifydp':
        opname = 'simplify'
        break
      case 'simplifytp':
        opname = 'topologyPreserveSimplify'
        break
      case 'relate':
        opname = 'relatePattern'
        break
      case 'relatebnr':
        opname = 'relateBoundaryNodeRule'
        break
      case 'cliprect':
        opname = 'clipByRect'
        break
    }
    // console.log(`a:\t${a}\nb:\t${b}\nopname:\t${opname}\narg1:\t${arg1}\narg2:\t${arg2}\narg3:\t${arg3}\narg4:\t${arg4}\narg5:\t${arg5}\narg6:\t${arg6}\nexp:\t${exp}`)
    loadInput(a, 'a')
    self.updateInput()
    if (!isEmpty(b)) {
      loadInput(b, 'b')
      self.updateInput()
    }
    if (self.updateOperation(opname, arg1, arg2, arg3, arg4, arg5, arg6)) {
      self.compute(exp)
    }
  }
}
