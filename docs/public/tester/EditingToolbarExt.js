/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control/Panel.js
 * @requires OpenLayers/Control/Navigation.js
 * @requires OpenLayers/Control/DrawFeature.js
 * @requires OpenLayers/Handler/Point.js
 * @requires OpenLayers/Handler/Path.js
 * @requires OpenLayers/Handler/Polygon.js
 */

/**
 * Class: OpenLayers.Control.EditingToolbar 
 *
 * Inherits from:
 *  - <OpenLayers.Control.Panel>
 */
OpenLayers.Control.EditingToolbarExt = OpenLayers.Class(
  OpenLayers.Control.Panel, {

    /**
     * Constructor: OpenLayers.Control.EditingToolbar
     * Create an editing toolbar for a given layer. 
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} 
     * options - {Object} 
     */
    initialize: function(layer, options) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
        
        this.addControls(
          [ new OpenLayers.Control.ZoomBox({'displayClass': 'olControlZoomBox'}), new OpenLayers.Control.Navigation() ]
        );  
        var controls = [
          new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.Point, {'displayClass': 'olControlDrawFeaturePoint'}),
          new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.Path, {'displayClass': 'olControlDrawFeaturePath'}),
          new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.Polygon, {'displayClass': 'olControlDrawFeaturePolygon'}),
          new OpenLayers.Control.ModifyFeature(layer, {'displayClass': 'olControlModifyFeature'})
        ];
        for (var i=0, len=controls.length; i<len-1; i++) {
            controls[i].featureAdded = function(feature) {
                debugger
                feature.state = OpenLayers.State.INSERT;
                var strtype = getInputType();
                setFeatureType(feature, strtype);
                setFeatureStyle(feature, strtype);
                if (strtype == "a") {
                    if (window.featureA) {
                        destroyFeatures(layer, window.featureA);
                    }
                    window.featureA = feature;
                } else if (strtype == "b") {
                    if (window.featureB) {
                        destroyFeatures(layer, window.featureB);
                    }
                    window.featureB = feature;
                }
                updateInput();
            };
        }
        controls[controls.length-1].onModificationStart = function(feature) {
            var strtype = getFeatureType(feature);
            setInputType(strtype);
            updateInput();
            layer.redraw(); // for vertex marker
        };
        controls[controls.length-1].onModification = function(feature) {
            updateInput();
        };
        controls[controls.length-1].onModificationEnd = function(feature) {
            updateInput();
        };
        this.addControls(controls);
    },

    /**
     * Method: draw
     * calls the default draw, and then activates mouse defaults.
     *
     * Returns:
     * {DOMElement}
     */
    draw: function() {
        var div = OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
        this.activateControl(this.controls[1]);
        return div;
    },

    CLASS_NAME: "OpenLayers.Control.EditingToolbar"
});    
