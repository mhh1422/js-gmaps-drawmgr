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
1. Call the library initiator passing the map object, and optionally the options and handlers

## Examples
*to be done*

## Modifications
### 2015-04-01:
 * Made the class more untied with UI.
 * Now use drawMgr.clear(), drawMgr.delete(), drawMgr.disable(), drawMgr.enable(), and drawMgr.enabled() instead of passing UI objects.
 * Pass map object instead of passing maps container.