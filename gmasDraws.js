var DRAWINGMGR = DRAWINGMGR || {};

DRAWINGMGR.create = function (map, options) {
    var drawMgr = new this.manager(map, options);
    return drawMgr;
};

DRAWINGMGR.manager = function (map, options) {

    var _map, _options;

    function createOptions(options) {
        var newOptions = {};
        for (index in DRAWINGMGR.defaults) {
            newOptions[index] = options.hasOwnProperty(index) ? options[index] : DRAWINGMGR.options[index];
        }
        return newOptions;
    }

    function init(map, options) {
        _map = map;
        _options = createOptions(options);
    }

    this.manager.getMap = function () {
        return _map;
    };

    this.manager.getOptions = function () {
        return _options;
    };

};

DRAWINGMGR.defaults = {
    strokeColor: '#FF0000',
    strokeOpacity: 0.5,
    backgroundColor: '#FFFFFF',
    backgroundOpacity: 0.9
};