//THIS IS main.js FOR LEAFLET LAB (Module 5) FOR GEOG575 SPRING 2017.//
//AUTHOR: AAIVERSON
//CONTAINS: LEAFLET LAB
//DATE: 2.14.17
////GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:
//1. Create the Leaflet map--done (in createMap())--[done in module 4]
//2. Import GeoJSON data--done (in getData())--[done in module 4]
//3. Add circle markers for point features to the map--done (in AJAX callback)--[done in module 4]
//4. Determine which attribute to visualize with proportional symbols
//5. For each feature, determine its value for the selected attribute
//6. Give each feature's circle marker a radius based on its attribute value

//NOTE: This also includes Pop-up Retrieve Operator.//////

//////////////////////////begin code//////////////////////////

//initialize function called when the script loads to instantiate Leaflet map
function initialize(){

	//Step 1: creating map
	var mymap = L.map('mapid').setView([20, 0], 2);

	//add OSM base tilelayer
	L.tileLayer('https://api.mapbox.com/styles/v1/aai3/ciypzrn44000y2rptm8kxjuyo/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWFpMyIsImEiOiJjaXNodXV0MDMwMDdoMnpsc3h5eHpsNW1oIn0.Cgw3sUtk9HXvNEYbnu2NeA', {
    	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    	maxZoom: 18,
    	id: 'mapbox://styles/aai3/ciypzrn44000y2rptm8kxjuyo',
    	accessToken: 'pk.eyJ1IjoiYWFpMyIsImEiOiJjaXNodXV0MDMwMDdoMnpsc3h5eHpsNW1oIn0.Cgw3sUtk9HXvNEYbnu2NeA'
	}).addTo(mymap); //Adds the layer to the map.

	//Step 2: call getData function
	getData(mymap);

};

//Dynamically calculating each circle marker radius for proportional symbol display...area relative to attribute value...
//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 1; //but what does this imply as far as user perception/understanding, if the scalFactor is larger?
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//////Following code includes creating proportional symbols for attribute display and Popup operator//////////////////
//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "2000_Female";

    //create marker options
    var options = {
        fillColor: "#ff000",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>Country:</b> " + feature.properties.Country + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};


//Add circle markers for point features to the map
function createPropSymbols(data, mymap){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(mymap);
};

/*

/////The following is the code implemented for Module 4A, but because I continued onto add the Popup Operator, the code was changed and added below. This remains here to show how I moved through the module and successfully completed part 4A./////

//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, mymap){

		//Step 4: Determine which attribute to visualize with proportional symbols
    var attribute = "2000_Male";

		//create marker options
    var geojsonMarkerOptions = {
        //radius: 8,
        fillColor: "#ff000",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.5
    };

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
					//Step 5: For each feature, determine its value for the selected attribute
					//using $ Number method to force-type any string values to numbers for the radius option (required data type is number)
					var attValue = Number(feature.properties[attribute]);

					//examine the attribute value to check that it is correct
					//console.log(feature.properties, attValue);

					//Step 6: Give each feature's circle marker a radius based on its attribute value
          geojsonMarkerOptions.radius = calcPropRadius(attValue);

					//create circle markers
					return L.circleMarker(latlng, geojsonMarkerOptions);
			}
    }).addTo(mymap);
}; */

//Step 2: Import GeoJSON data
function getData(mymap){
    //load the data
    $.ajax("data/Mortality_Edits1.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, mymap);
        }
    });
};


//call the initialize function when the document has loaded
$(document).ready(initialize);
