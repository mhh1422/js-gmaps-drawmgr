# js-gmaps-drawmgr
A Google Maps JavaScript Drawing Manager library to make drawing objects, saving, and reloading them easy.

## Origin
This is originally a blog post by Mac Craven in which he demonstrated how to deal with Google Maps Drawing Manager APIs.
This is the [blog post] and the [original code]:

[blog post]: http://expertsoftwareengineer.com/how-to-save-overlay-shapes-with-v3-google-maps-api-using-googles-drawing-manager/
[original code]: http://expertsoftwareengineer.com/includes/google-maps/shape-save-demo-code.php

## How to Use
1. Include the Google maps apis with drawings library  
   ```<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?v=3.exp&libraries=drawing&sensor=false"></script>```
1. Include the library  
   ```<script type="text/javascript" src="gmaps-drawmgr.min.js"></script>```
1. Create a Google maps object.  
   ```html
                var center = new google.maps.LatLng(42.3583, -71.0603);

                var mapOptions = {
                    zoom: 10,
                    center: center,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true,
                    zoomControl: true
                };

                var map = new google.maps.Map(document.getElementById("map"), mapOptions);
   ```
1. Call the library initiator passing the map object, and optionally the options and handlers.  
   ```html
                var shapesMap = new drawMgr(map, {
                    drawingModes: [google.maps.drawing.OverlayType.CIRCLE, google.maps.drawing.OverlayType.RECTANGLE, google.maps.drawing.OverlayType.POLYGON],
                    position: google.maps.ControlPosition.TOP_CENTER,
                    enabled: false,
                });
   ```
1. Call the different drawMgr methods

## Methods
All the following methods can be called in the drawMgr object context: i.e. drawMgr.enabled()
* drawMgr.enable() to enable the draw manager.
* drawMgr.disable() to disable the draw manager.
* drawMgr.enabled() to check if the draw manager is enabled or disabled.
* drawMgr.save() to save the shapes to the handler method.
* drawMgr.load() to load the shapes from the handler method.
* drawMgr.clear() to remove all shapes.
* drawMgr.delete() to delete the currently selected shape.
* drawMgr.getJSON() to get the JSON representation of the drawing manager

## Examples
*to be added soon*. For now, check the [test file](./tests/test.html) in the repo.

## Modifications
### 2015-04-01:
 * Made the class more untied with UI.
 * Now use drawMgr.clear(), drawMgr.delete(), drawMgr.disable(), drawMgr.enable(), and drawMgr.enabled() instead of passing UI objects.
 * Pass map object instead of passing maps container.
 * Adding the public methods: delete, clear, load, save, enable, disable, enabled, and getJSON