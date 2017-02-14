//THIS IS tutorials.js FOR MODULE 4/LEAFLET LAB FOR GEOG575 SPRING 2017.//
//AUTHOR: AAIVERSON
//CONTAINS: LEAFLET BASIC TUTORIAL (http://leafletjs.com/examples/quick-start/)(see also http://leafletjs.com/examples.html  AND  http://leafletjs.com/reference.html) AND USING GEOJSON WITH LEAFLET (http://leafletjs.com/examples/geojson/)
//DATE: 1.6.17
//REQUIREMENTS: Copy your boilerplate web directory and rename the copy leaflet-lab. Add the latest versions of jQuery and Leaflet to the directory's lib folder, and add a link to it in the index.html file. Complete the Leaflet Quick Start Guide and Using GeoJSON with Leaflet tutorials. Save the scripts from these tutorials in a file called tutorials.js, within your leaflet-lab/js folder. Add comments describing the purpose of each Leaflet method in the tutorials.


//initialize function called when the script loads
function initialize(){

	//LEAFLET BASICS TUTORIAL FOLLOWS.................//
	//Let’s create a map of the center of London with pretty Mapbox Streets tiles. First we’ll initialize the map and set its view to our chosen geographical coordinates and a zoom level (see var mymap below).
	//By default (as we didn’t pass any options when creating the map instance), all mouse and touch interactions on the map are enabled, and it has zoom and attribution controls.
	//Note that setView call also returns the map object — most Leaflet methods act like this when they don’t return an explicit value, which allows convenient jQuery-like method chaining.
	

	var mymap = L.map('mapid').setView([51.505, -0.09], 13);
	
	//Next we’ll add a tile layer to add to our map, in this case it’s a Mapbox Streets tile layer. Creating a tile layer usually involves setting the URL template for the tile images (get yours at Mapbox), the attribution text and the maximum zoom level of the layer:
	L.tileLayer('https://api.mapbox.com/styles/v1/aai3/ciypzrn44000y2rptm8kxjuyo/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWFpMyIsImEiOiJjaXNodXV0MDMwMDdoMnpsc3h5eHpsNW1oIn0.Cgw3sUtk9HXvNEYbnu2NeA', {
    	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    	maxZoom: 18,
    	id: 'mapbox://styles/aai3/ciypzrn44000y2rptm8kxjuyo',
    	accessToken: 'pk.eyJ1IjoiYWFpMyIsImEiOiJjaXNodXV0MDMwMDdoMnpsc3h5eHpsNW1oIn0.Cgw3sUtk9HXvNEYbnu2NeA'
	}).addTo(mymap); //Adds the layer to the map. It can be chained onto a method creating a new layer (such as L.tileLayer()), or called on a variable to which the new layer is assigned

	//Besides tile layers, you can easily add other things to your map, including markers, polylines, polygons, circles, and popups. Let’s add a marker:
	var marker = L.marker([51.5, -0.09]).addTo(mymap);

	//Adding a circle is the same (except for specifying the radius in meters as a second argument), but lets you control how it looks by passing options as the last argument when creating the object:
	var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
	}).addTo(mymap);

	//Adding a polygon is as easy:
	var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
	]).addTo(mymap);

	//Popups are usually used when you want to attach some information to a particular object on a map. Leaflet has a very handy shortcut for this... Try clicking on our objects. The bindPopup method attaches a popup with the specified HTML content to your marker so the popup appears when you click on the object, and the openPopup method (for markers only) immediately opens the attached popup.
	marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
	circle.bindPopup("I am a circle.");
	polygon.bindPopup("I am a polygon.");

	//You can also use popups as layers (when you need something more than attaching a popup to an object). Here we use openOn instead of addTo because it handles automatic closing of a previously opened popup when opening a new one which is good for usability:
	var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);

    //Dealing with events...Every time something happens in Leaflet, e.g. user clicks on a marker or map zoom changes, the corresponding object sends an event which you can subscribe to with a function. It allows you to react to user interaction (but doesn't react to clicking on things created above?! ASK CARL/ROB):
    function onMapClick(e) {
    	alert("You clicked the map at " + e.latlng);
	}

	mymap.on('click', onMapClick); //Note that the .on() method works the same way as jQuery's .on() method discussed in Module 2, Lesson 3, but has a wider range of events available to it.

	//Each object has its own set of events — see documentation for details. The first argument of the listener function is an event object — it contains useful information about the event that happened. For example, map click event object (e in the example above) has latlng property which is a location at which the click occured.

	//Let’s improve our example by using a popup instead of an alert: (DOES THIS OVERRIDE ABOVE ALERT? SEEMS SO...ASK CARL/ROB)

	//Try clicking on the map and you will see the coordinates in a popup.

	var popup = L.popup();

	function onMapClick(e) {
    	popup
        	.setLatLng(e.latlng)
        	.setContent("You clicked the map at " + e.latlng.toString())
        	.openOn(mymap);
	}

	mymap.on('click', onMapClick); 

	//Now you’ve learned Leaflet basics and can start building map apps straight away! Don’t forget to take a look at the detailed documentation or other examples.

	//USING GEOJSON W/ LEAFLET TUTORIAL FOLLOWS.........//
	//GeoJSON is becoming a very popular data format among many GIS technologies and services — it's simple, lightweight, straightforward, and Leaflet is quite good at handling it. In this example, you'll learn how to create and interact with map vectors created from GeoJSON objects.

	//About GeoJSON

	//According to http://geojson.org: GeoJSON is a format for encoding a variety of geographic data structures. A GeoJSON object may represent a geometry, a feature, or a collection of features. GeoJSON supports the following geometry types: Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, and GeometryCollection. Features in GeoJSON contain a geometry object and additional properties, and a feature collection represents a list of features.

	//Leaflet supports all of the GeoJSON types above, but Features and FeatureCollections work best as they allow you to describe features with a set of properties. We can even use these properties to style our Leaflet vectors. Here's an example of a simple GeoJSON feature:

	var geojsonFeature = {
    	"type": "Feature",
    	"properties": {
        	"name": "Coors Field",
        	"amenity": "Baseball Stadium",
        	"popupContent": "This is where the Rockies play!"
    	},
    	"geometry": {
        	"type": "Point",
        	"coordinates": [-104.99404, 39.75621]
    	}
    };

    //The GeoJSON layer

	//GeoJSON objects are added to the map through a GeoJSON layer. To create it and add it to a map, we can use the following code:
	L.geoJSON(geojsonFeature).addTo(mymap);

	//GeoJSON objects may also be passed as an array of valid GeoJSON objects:
	var myLines = [{
	    "type": "LineString",
	    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
	}, {
	    "type": "LineString",
	    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
	}];

	//Alternatively, we could create an empty GeoJSON layer and assign it to a variable so that we can add more features to it later:
	var myLayer = L.geoJSON().addTo(mymap);
	myLayer.addData(geojsonFeature);

	//Options: STYLE
	//The style option can be used to style features two different ways. First, we can pass a simple object that styles all paths (polylines and polygons) the same way:
	var myLines = [{
	    "type": "LineString",
	    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
	}, {
	    "type": "LineString",
	    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
	}];

	var myStyle = {
	    "color": "#ff7800",
	    "weight": 5,
	    "opacity": 0.65
	};

	L.geoJSON(myLines, {
	    style: myStyle
	}).addTo(mymap);

	//Alternatively, we can pass a function that styles individual features based on their properties. In the example below we check the "party" property and style our polygons accordingly:
	var states = [{
	    "type": "Feature",
	    "properties": {"party": "Republican"},
	    "geometry": {
	        "type": "Polygon",
	        "coordinates": [[
	            [-104.05, 48.99],
	            [-97.22,  48.98],
	            [-96.58,  45.94],
	            [-104.03, 45.94],
	            [-104.05, 48.99]
	        ]]
	    }
	}, {
	    "type": "Feature",
	    "properties": {"party": "Democrat"},
	    "geometry": {
	        "type": "Polygon",
	        "coordinates": [[
	            [-109.05, 41.00],
	            [-102.06, 40.99],
	            [-102.03, 36.99],
	            [-109.04, 36.99],
	            [-109.05, 41.00]
	        ]]
	    }
	}];

	L.geoJSON(states, {
	    style: function(feature) {
	        switch (feature.properties.party) {
	            case 'Republican': return {color: "#ff0000"};
	            case 'Democrat':   return {color: "#0000ff"};
	        }
	    }
	}).addTo(mymap);

	//Options: pointToLayer
	//Points are handled differently than polylines and polygons. By default simple markers are drawn for GeoJSON Points. We can alter this by passing a pointToLayer function in a GeoJSON options object when creating the GeoJSON layer. This function is passed a LatLng and should return an instance of ILayer, in this case likely a Marker or CircleMarker. We could also set the style property in this example — Leaflet is smart enough to apply styles to GeoJSON points if you create a vector layer like circle inside the pointToLayer function.

	//Here we're using the pointToLayer option to create a CircleMarker:
	var geojsonMarkerOptions = {
	    radius: 8,
	    fillColor: "#ff7800",
	    color: "#000",
	    weight: 1,
	    opacity: 1,
	    fillOpacity: 0.8
	};

	//adding feature circle marker to map
	L.geoJSON(someGeojsonFeature, {
	    pointToLayer: function (feature, latlng) {
	        return L.circleMarker(latlng, geojsonMarkerOptions);
	    }
	}).addTo(mymap);

	//Options: onEachFeature
	//The onEachFeature option is a function that gets called on each feature before adding it to a GeoJSON layer. A common reason to use this option is to attach a popup to features when they are clicked:
	function onEachFeature(feature, layer) {
	    // does this feature have a property named popupContent? If so, bindPopup
	    if (feature.properties && feature.properties.popupContent) {
	        layer.bindPopup(feature.properties.popupContent);
	    }
	}
	//creating feautre variable and outlining properties and geometry 
	var geojsonFeature = {
	    "type": "Feature",
	    "properties": {
	        "name": "Coors Field",
	        "amenity": "Baseball Stadium",
	        "popupContent": "This is where the Rockies play!"
	    },
	    "geometry": {
	        "type": "Point",
	        "coordinates": [-104.99404, 39.75621]
	    }
	};
	//adding feature to map 
	L.geoJSON(geojsonFeature, {
	    onEachFeature: onEachFeature
	}).addTo(mymap);

	//Options: Filter
	//The filter option can be used to control the visibility of GeoJSON features. To accomplish this we pass a function as the filter option. This function gets called for each feature in your GeoJSON layer, and gets passed the feature and the layer. You can then utilise the values in the feature's properties to control the visibility by returning true or false.

	//In the example below "Busch Field" will not be shown on the map:
	var someFeatures = [{
	    "type": "Feature",
	    "properties": {
	        "name": "Coors Field",
	        "show_on_map": true
	    },
	    "geometry": {
	        "type": "Point",
	        "coordinates": [-104.99404, 39.75621]
	    }
	}, {
	    "type": "Feature",
	    "properties": {
	        "name": "Busch Field",
	        "show_on_map": false //Note false prevents it from populating on the map
	    },
	    "geometry": {
	        "type": "Point",
	        "coordinates": [-104.98404, 39.74621]
	    }
	}];
	//adding features (with 'true') to the map
	L.geoJSON(someFeatures, {
	    filter: function(feature, layer) {
	        return feature.properties.show_on_map;
	    }
	}).addTo(mymap);


};

//call the initialize function when the document has loaded
$(document).ready(initialize);