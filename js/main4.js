function initialize(){

    //setting variables to implement panning constraint
    var southWest = L.latLng(-90, -180),
    northEast = L.latLng(90, 180),
    bounds = L.latLngBounds(southWest, northEast);

	//create map
	//var mymap = L.map('mapid').setView([20, 0], 2);
    var mymap = L.map('mapid', {
        center: [20,0],
        zoom: 2,
        maxBounds: bounds,
        maxBoundsViscosity: 0.7
    });

	//add OSM base tilelayer
	L.tileLayer('https://api.mapbox.com/styles/v1/aai3/ciypzrn44000y2rptm8kxjuyo/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWFpMyIsImEiOiJjaXNodXV0MDMwMDdoMnpsc3h5eHpsNW1oIn0.Cgw3sUtk9HXvNEYbnu2NeA', {
    	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    	maxZoom: 18,
    	id: 'mapbox://styles/aai3/ciypzrn44000y2rptm8kxjuyo',
    	accessToken: 'pk.eyJ1IjoiYWFpMyIsImEiOiJjaXNodXV0MDMwMDdoMnpsc3h5eHpsNW1oIn0.Cgw3sUtk9HXvNEYbnu2NeA'
	}).addTo(mymap); //Adds the layer to the map.

	//call getData function
	//getData(mymap);
    //getFemaleData(mymap);
    // essentially also calls getMaleData(mymap); because nested
    createLegend(mymap);
};

//Example 2.7 line 1...function to create the legend
function createLegend(mymap, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (mymap) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="180px" height="180px">';

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    mymap.addControl(new LegendControl());

    updateLegend(mymap, attributes[0]);
};

//call the initialize function when the document has loaded
$(document).ready(initialize);