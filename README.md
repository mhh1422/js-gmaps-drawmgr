# js-gmaps-drawmgr
A Google Maps JavaScript Drawing Manager library to make drawing objects, saving, and reloading them easy.

# Origin
This is originally a blog post by Mac Craven in which he demonstrated how to deal with Google Maps Drawing Manager APIs.
This is the blog post:
http://expertsoftwareengineer.com/how-to-save-overlay-shapes-with-v3-google-maps-api-using-googles-drawing-manager/
And here is the original code:
http://expertsoftwareengineer.com/includes/google-maps/shape-save-demo-code.php

 2015-04-01:
 * Made the class more untied with UI.
 * Now use drawMgr.clear(), drawMgr.delete(), drawMgr.disable(), drawMgr.enable(), and drawMgr.enabled() instead of passing UI objects.
 * Pass map object instead of passing maps container.