//THIS IS main.js FOR LEAFLET LAB (module 4) FOR GEOG575 SPRING 2017.//
//AUTHOR: AAIVERSON
//CONTAINS: LEAFLET LAB
//DATE: 1.7.17


//REPLACE FOLLOWING WITH LEAFLET DATA//////

//initialize function called when the script loads to instantiate Leaflet map
function initialize(){

	//creating map
	var mymap = L.map('mapid').setView([20, 0], 2);
	
	//add OSM base tilelayer
	L.tileLayer('https://api.mapbox.com/styles/v1/aai3/ciypzrn44000y2rptm8kxjuyo/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWFpMyIsImEiOiJjaXNodXV0MDMwMDdoMnpsc3h5eHpsNW1oIn0.Cgw3sUtk9HXvNEYbnu2NeA', {
    	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    	maxZoom: 18,
    	id: 'mapbox://styles/aai3/ciypzrn44000y2rptm8kxjuyo',
    	accessToken: 'pk.eyJ1IjoiYWFpMyIsImEiOiJjaXNodXV0MDMwMDdoMnpsc3h5eHpsNW1oIn0.Cgw3sUtk9HXvNEYbnu2NeA'
	}).addTo(mymap); //Adds the layer to the map.

	//call getData function
	getData(mymap);

};

//function to retrieve the data and place it on the map
function getData(mymap){
    //load the Child Under 5 Mortality Data for the Leaflet Lab
    $.ajax("data/Mortality.geojson", {
        dataType: "json",
        success: function(response){

            //create marker options (circles instead of point icon)
            var geojsonMarkerOptions = {
	            radius: 8,
	            fillColor: "#ff000",
	            color: "#000",
	            weight: 1,
	            opacity: 1,
	            fillOpacity: 0.8
        	};
            
            //create a Leaflet GeoJSON layer and add it to the map showing circle markers created using pointToLayer
            L.geoJson(response, {
            	pointToLayer: function (feature, latlng){
                	return L.circleMarker(latlng, geojsonMarkerOptions);
        		}
    
    		}).addTo(mymap);
    	}
    });
};

//call the initialize function when the document has loaded
$(document).ready(initialize);