/***
 Copyright 2013 Mac Craven
 
 Modified by Muhannad Shelleh:
 
 2015-04-01:
 * Made the class more untied with UI.
 * Now use drawMgr.clear(), drawMgr.delete(), drawMgr.disable(), drawMgr.enable(), and drawMgr.enabled() instead of passing UI objects.
 * Pass map object instead of passing maps container.
 
 GNU Licence
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 
 */

/**
 * 
 * @param {google.maps} _map
 * @param {map} _options can contain {string} position, {array} drawingModes, and {boolean} enabled
 * @param {function|"cookie"} _saveHandler
 * @param {function|"cookie"} _loadHandler
 * @param {function} _consoleHandler
 * @returns {undefined}
 */
function drawMgr(_map, _options, _saveHandler, _loadHandler, _consoleHandler) {

    // state
    var _selection = null;
    var _drawingManager = null;
    var _newShapeNextId = 0;
    var _shapes = [];

    // types
    var RECTANGLE = google.maps.drawing.OverlayType.RECTANGLE;
    var CIRCLE = google.maps.drawing.OverlayType.CIRCLE;
    var POLYGON = google.maps.drawing.OverlayType.POLYGON;
    var POLYLINE = google.maps.drawing.OverlayType.POLYLINE;
    var MARKER = google.maps.drawing.OverlayType.MARKER;

    function typeDesc(type) {
        switch (type) {
            case RECTANGLE:
                return "rectangle";

            case CIRCLE:
                return "circle";

            case POLYGON:
                return "polygon";

            case POLYLINE:
                return "polyline";

            case MARKER:
                return "marker";

            case null:
                return "null";

            default:
                return "UNKNOWN GOOGLE MAPS OVERLAY TYPE";
        }
    }

    // json reading

    function jsonReadPath(jsonPath) {
        var path = new google.maps.MVCArray();

        for (var i = 0; i < jsonPath.path.length; i++) {
            var latlng = new google.maps.LatLng(jsonPath.path[i].lat, jsonPath.path[i].lng);
            path.push(latlng);
        }

        return path;
    }

    function jsonReadRectangle(jsonRectangle) {
        var jr = jsonRectangle;
        var southWest = new google.maps.LatLng(
                jr.bounds.southWest.lat,
                jr.bounds.southWest.lng);
        var northEast = new google.maps.LatLng(
                jr.bounds.northEast.lat,
                jr.bounds.northEast.lng);
        var bounds = new google.maps.LatLngBounds(southWest, northEast);

        var rectangleOptions = {
            bounds: bounds,
            editable: false,
            fillColor: jr.color,
            map: _map
        };

        var rectangle = new google.maps.Rectangle(rectangleOptions);

        return rectangle;
    }

    function jsonReadCircle(jsonCircle) {
        var jc = jsonCircle;

        var center = new google.maps.LatLng(
                jc.center.lat,
                jc.center.lng);

        var circleOptions = {
            center: center,
            radius: parseFloat(jc.radius),
            editable: false,
            fillColor: jc.color,
            map: _map
        };

        var circle = new google.maps.Circle(circleOptions);

        return circle;
    }

    function jsonReadPolyline(jsonPolyline) {
        var path = jsonReadPath(jsonPolyline);

        var polylineOptions = {
            path: path,
            editable: false,
            strokeColor: jsonPolyline.color,
            map: _map
        };

        var polyline = new google.maps.Polyline(polylineOptions);

        return polyline;
    }

    function jsonReadPolygon(jsonPolygon) {
        var paths = new google.maps.MVCArray();

        for (var i = 0; i < jsonPolygon.paths.length; i++) {
            var path = jsonReadPath(jsonPolygon.paths[i]);
            paths.push(path);
        }

        var polygonOptions = {
            paths: paths,
            editable: false,
            fillColor: jsonPolygon.color,
            map: _map
        };

        var polygon = new google.maps.Polygon(polygonOptions);

        return polygon;
    }

    function jsonRead(jsonObject) {

        for (i = 0; i < jsonObject.shapes.length; i++)
        {
            switch (jsonObject.shapes[i].type) {
                case RECTANGLE:
                    var rectangle = jsonReadRectangle(jsonObject.shapes[i]);
                    newShapeSetProperties(rectangle, RECTANGLE);
                    newShapeAddListeners(rectangle);
                    shapesAdd(rectangle);
                    break;

                case CIRCLE:
                    var circle = jsonReadCircle(jsonObject.shapes[i]);
                    newShapeSetProperties(circle, CIRCLE);
                    newShapeAddListeners(circle);
                    shapesAdd(circle);
                    break;

                case POLYLINE:
                    var polyline = jsonReadPolyline(jsonObject.shapes[i]);
                    newShapeSetProperties(polyline, POLYLINE);
                    newShapeAddListeners(polyline);
                    shapesAdd(polyline);
                    break;

                case POLYGON:
                    var polygon = jsonReadPolygon(jsonObject.shapes[i]);
                    newShapeSetProperties(polygon, POLYGON);
                    newShapeAddListeners(polygon);
                    shapesAdd(polygon);
                    break;
            }
        }
    }

    // json writing

    function comma(i) {
        return (i > 0) ? ',' : '';
    }

    function jsonMakeLatLng(latlng) {
        var buf = '"lat":"' + latlng.lat() + '","lng":"' + latlng.lng() + '"';
        return buf;
    }

    function jsonMakeBounds(bounds) {
        var buf = '"bounds":{"northEast":{' + jsonMakeLatLng(bounds.getNorthEast()) + '},"southWest":{' + jsonMakeLatLng(bounds.getSouthWest()) + '}}';
        return buf;
    }

    function jsonMakeType(type) {
        var buf = '"type":"' + typeDesc(type) + '"';
        return buf;
    }

    function jsonMakeColor(color) {
        var buf = '"color":"' + color + '"';
        return buf;
    }

    function jsonMakeCenter(center) {
        var buf = '"center":{' + jsonMakeLatLng(center) + '}';
        return buf;
    }

    function jsonMakeRadius(radius) {
        var buf = '"radius":"' + radius + '"';
        return buf;
    }

    function jsonMakePath(path) {
        var n = path.getLength();

        var buf = '"path":[';
        for (var i = 0; i < n; i++) {
            var latlng = path.getAt(i);
            buf += comma(i) + '{' + jsonMakeLatLng(latlng) + '}';
        }
        buf += ']';
        return buf;
    }

    function jsonMakePaths(paths) {
        var n = paths.getLength();
        var buf = '"paths":[';
        for (var i = 0; i < n; i++) {
            var path = paths.getAt(i);
            buf += comma(i) + '{' + jsonMakePath(path) + '}';
        }
        buf += ']';
        return buf;
    }

    function jsonMakeRectangle(rectangle) {
        var buf = jsonMakeType(RECTANGLE) + ',' + jsonMakeColor(rectangle.fillColor) + ',' + jsonMakeBounds(rectangle.bounds);
        return buf;
    }

    function jsonMakeCircle(circle) {
        var buf = jsonMakeType(CIRCLE) + ',' + jsonMakeColor(circle.fillColor) + ',' + jsonMakeCenter(circle.center) + ',' + jsonMakeRadius(circle.radius);
        return buf;
    }

    function jsonMakePolyline(polyline) {
        var buf = jsonMakeType(POLYLINE) + ',' + jsonMakeColor(polyline.strokeColor) + ',' + jsonMakePath(polyline.getPath());
        return buf;
    }

    function jsonMakePolygon(polygon) {
        var buf = jsonMakeType(POLYGON) + ',' + jsonMakeColor(polygon.fillColor) + ',' + jsonMakePaths(polygon.getPaths());
        return buf;
    }

    function jsonMake() {
        var buf = '{"shapes":[';
        for (i = 0; i < _shapes.length; i++) {
            switch (_shapes[i].type) {
                case RECTANGLE:
                    buf += comma(i) + '{' + jsonMakeRectangle(_shapes[i]) + '}';
                    break;
                case CIRCLE:
                    buf += comma(i) + '{' + jsonMakeCircle(_shapes[i]) + '}';
                    break;
                case POLYLINE:
                    buf += comma(i) + '{' + jsonMakePolyline(_shapes[i]) + '}';
                    break;
                case POLYGON:
                    buf += comma(i) + '{' + jsonMakePolygon(_shapes[i]) + '}';
                    break;
            }
        }
        buf += ']}';

        return buf;
    }

    // storage

    function shapesAdd(shape) {
        _shapes.push(shape);
    }

    function shapesDelete(shape) {
        var found = false;
        for (var i = 0; i < _shapes.length && !found; i++) {
            if (_shapes[i] === shape) {
                _shapes.splice(i, 1);
                found = true;
            }
        }
    }

    function shapesHideAll() {
        for (var i = 0; i < _shapes.length; i++) {
            _shapes[i].setMap(null);
        }
    }

    function shapesDeleteAll() {
        print(_shapes.length + " shapes deleted\n");
        _shapes.splice(0, _shapes.length);
    }

    function shapesSave() {
        var shapes = jsonMake();

        if (_saveHandler && typeof _saveHandler == 'function') {
            _saveHandler(shapes);
        } else if (_saveHandler && typeof _saveHandler == 'string' && _saveHandler == 'cookie') {
            saveToCookie(shapes);
        } else {
            console.warn('No handler to save shapes', shapes);
        }
    }

    function saveToCookie(shapes) {
        var expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate + 365);

        var value = escape(shapes) + "; expires=" + expirationDate.toUTCString();
        document.cookie = "shapes=" + value;
    }

    function shapesLoad() {

        var shapes = null;
        var startLength = _shapes.length;

        if (_loadHandler && typeof _loadHandler == 'function') {
            shapes = _loadHandler();
        } else if (_loadHandler && typeof _loadHandler == 'string' && _loadHandler == 'cookie') {
            shapes = loadFromCookie();
        } else {
            console.warn('No handler to load shapes');
        }

        if (shapes) {
            jsonRead(shapes);
        }

        var n_loaded = _shapes.length - startLength;
        print(n_loaded + " shapes loaded\n");
    }

    function loadFromCookie() {

        var shapes = null;

        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var key = cookies[i].substr(0, cookies[i].indexOf("="));
            key = key.replace("/^\s+|\s+$/g", "");

            if (key == "shapes") {
                var value = cookies[i].substr(cookies[i].indexOf("=") + 1);
                shapes = unescape(value);

                break;
            }
        }

        return eval("(" + shapes + ")");
    }

    // printing

    function print(string) {
        if (_consoleHandler === false) {
            return;
        } else if (_consoleHandler && typeof _consoleHandler == 'function') {
            _consoleHandler(string);
        } else {
            console.log(string);
        }
    }

    function printDrawingMode(drawingManager) {
        print("drawing mode set to " + typeDesc(drawingManager.getDrawingMode()) + "\n");
    }

    function getDrawingMode() {
        return _drawingManager.getDrawingMode();
    }

    // selection

    function selectionPrint() {
        if (_selection == null) {
            print("selection cleared\n");
        } else {
            print(_selection.appId + ": selected\n");
        }
    }

    function selectionIsSet() {
        return _selection != null;
    }

    function selectionSet(newSelection) {
        if (newSelection == _selection) {
            return;
        }

        if (_selection != null) {
            _selection.setEditable(false);
            _selection = null;
        }

        if (newSelection != null && newSelection.type !== 'marker') {
            _selection = newSelection;
            _selection.setEditable(drawMgrEnabled());
        }

        selectionPrint();
    }

    function selectionClear() {
        selectionSet(null);
    }

    function selectionDelete() {
        if (_selection != null) {
            _selection.setMap(null);
            selectionClear();
        }
    }

    // new shape integration

    function newShapeAddPathListeners(shape, path) {
        google.maps.event.addListener(path, 'insert_at', function () {
            onShapeEdited(shape);
        });
        google.maps.event.addListener(path, 'remove_at', function () {
            onShapeEdited(shape);
        });
        google.maps.event.addListener(path, 'set_at', function () {
            onShapeEdited(shape);
        });
    }

    function newShapeAddListeners(shape) {
        google.maps.event.addListener(shape, 'click', function () {
            onShapeClicked(shape);
        });

        switch (shape.type) {
            case RECTANGLE:
                google.maps.event.addListener(shape, 'bounds_changed', function () {
                    onShapeEdited(shape);
                });
                break;

            case CIRCLE:
                google.maps.event.addListener(shape, 'center_changed', function () {
                    onShapeEdited(shape);
                });
                google.maps.event.addListener(shape, 'radius_changed', function () {
                    onShapeEdited(shape);
                });
                break;

            case POLYLINE:
                var path = shape.getPath();
                newShapeAddPathListeners(shape, path);
                break;

            case POLYGON:
                var paths = shape.getPaths();

                var n = paths.getLength();
                for (var i = 0; i < n; i++) {
                    var path = paths.getAt(i);
                    newShapeAddPathListeners(shape, path);
                }
                break;
        }
    }

    function newShapeSetProperties(shape, type) {
        shape.type = type;
        shape.appId = _newShapeNextId;
        _newShapeNextId++;
    }

    // map creation

    function setMap(map) {
        google.maps.event.addListener(map, 'click', onMapClicked);
        return map;
    }

    // drawing manager creation

    function drawingManagerCreate(map, options) {

        options = options && typeof options == 'object' ? options : {};

        // create drawing manager

        var drawingModes = getOption(options, 'drawingModes', new Array(RECTANGLE, CIRCLE, POLYGON, POLYLINE));
        var position = getOption(options, 'position', google.maps.ControlPosition.TOP_CENTER);

        var drawingControlOptions = {
            drawingModes: drawingModes,
            position: position
        };

        var polyOptions = {
            editable: true
        };

        drawingManagerOptions = {
            drawingMode: null,
            drawingControlOptions: drawingControlOptions,
            markerOptions: {draggable: true},
            polylineOptions: {editable: true},
            rectangleOptions: polyOptions,
            circleOptions: polyOptions,
            polygonOptions: polyOptions,
            map: map
        };

        drawingManager = new google.maps.drawing.DrawingManager(drawingManagerOptions);

        // tie events to map

        google.maps.event.addListener(drawingManager, 'overlaycomplete', onNewShape);
        google.maps.event.addListener(drawingManager, 'drawingmode_changed', onDrawingModeChanged);

        // print initial drawing mode, selection
        printDrawingMode(drawingManager);
        selectionPrint();

        return drawingManager;
    }

    // event capture

    function onNewShape(event) {
        var shape = event.overlay;

        newShapeSetProperties(shape, event.type);
        newShapeAddListeners(shape);
        shapesAdd(shape);
        shapesSave();
        selectionSet(shape);

        print("new " + typeDesc(event.type) + " created (id = "
                + shape.appId + ")\n");
    }

    function onShapeEdited(shape) {
        print(shape.appId + ": shape edited\n");
        shapesSave();
    }

    function onShapeClicked(shape) {
        print(shape.appId + ": shape clicked\n");
        selectionSet(shape);
    }

    function onMapClicked() {
        print("map clicked\n");
        selectionClear();
    }

    function onDelete() {
        print("delete button clicked\n");

        if (selectionIsSet()) {
            shapesDelete(_selection);
            shapesSave();
            selectionDelete();
        }
    }

    function onClear() {
        print("clear button clicked\n");

        selectionClear();
        shapesHideAll();
        shapesDeleteAll();
        shapesSave();
    }

    function onDrawingModeChanged() {
        _options && _options.hasOwnProperty('onModeChanged') && _options.onModeChanged(getDrawingMode());
        printDrawingMode(drawingManager);
        selectionClear();
    }

    function onCreate() {
        _drawingManager = drawingManagerCreate(_map, _options);


        google.maps.event.addListener(_map, 'click', onMapClicked);

        //public methods
        drawMgr.clear = onClear;
        drawMgr.delete = onDelete;
        drawMgr.disable = disableDrawMgr;
        drawMgr.enable = enableDrawMgr;
        drawMgr.enabled = drawMgrEnabled;
        drawMgr.getJSON = jsonMake;
        drawMgr.save = shapesSave;
        drawMgr.load = load;
        drawMgr.mode = getDrawingMode;
        drawMgr.manager = _drawingManager;

        shapesLoad();

        var enabled = getOption(_options, 'enabled', true);
        if (!enabled) {
            disableDrawMgr();
        }
    }

    function getOption(options, option, defaultValue) {
        return options.hasOwnProperty(option) ? options[option] : defaultValue;
    }

    function disableDrawMgr() {
        _drawingManager.setMap(null);
        selectionClear();
        _drawingManager.setDrawingMode(null);
    }

    function enableDrawMgr() {
        _drawingManager.setMap(_map);
    }

    function drawMgrEnabled() {
        return _drawingManager.getMap() !== null;
    }

    // initialization
    onCreate();

    function load() {
        shapesHideAll();
        shapesLoad();
    }
}