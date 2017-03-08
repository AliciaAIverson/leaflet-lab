//THIS IS main.js FOR LEAFLET LAB (Module 5B) FOR GEOG575 SPRING 2017.//
//AUTHOR: AAIVERSON
//CONTAINS: LEAFLET LAB
//DATE: 2.28.17
////GOAL: Implement Operators that support your map, by first experimenting by adding the Retrieve (popup) operator and a Sequence operator with a slider for the user interface. Also, implement a fifth operator that is logical for the map. 
//NOTE: Change: Implemented (poorly formatted) 5th Operator

//////////////////////////begin code//////////////////////////

//initialize function called when the script loads to instantiate Leaflet map
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
    getFemaleData(mymap);
    // essentially also calls getMaleData(mymap); because nested

};

//Dynamically calculating each circle marker radius for proportional symbol display...area relative to attribute value...
//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 2.5; //but what does this imply as far as user perception/understanding, if the scalFactor is larger?
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

// //function to convert markers to circle markers
// function pointToLayer(feature, latlng, attributes){
//     //Step 4: Assign the current attribute based on the first index of the attributes array
//     // var attribute = attributes[0];

//     //create marker options
//     var optionsFemale = {
//         fillColor: "#ff000",
//         color: "#000",
//         weight: 1,
//         opacity: 1,
//         fillOpacity: 0.1
//     };

//     //create circle marker layer
//     //return the circle marker to the L.geoJson pointToLayer option
//     return L.circleMarker(latlng, options);
// };
//function to convert markers to circle markers for Female attributes
function pointToLayerFemale(feature, latlng, attributesFemale){

    //create marker options
    var optionsFemale = {
        fillColor: "#990000",
        color: "#990000",
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.75
    };

    //create circle marker layer
    //return the circle marker to the L.geoJson pointToLayer option
    var femaleMarker = L.circleMarker(latlng, optionsFemale);
    return femaleMarker;

    //return L.circleMarker(latlng, options);
};
//function to convert markers to circle markers for Male attributes
function pointToLayerMale(feature, latlng, attributesMale){

    //create marker options
    var optionsMale = {
        fillColor: "#231F20",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0
    };

    //create circle marker layer
    //return the circle marker to the L.geoJson pointToLayer option
    var maleMarker = L.circleMarker(latlng, optionsMale);
    return maleMarker;
    //return L.circleMarker(latlng, options);
};

//Add circle markers for point features to the map
function createPropSymbols(responseFemale, responseMale, mymap, attributesFemale, attributesMale){
    

    //create 2 Leaflet GeoJSON layers by gender and add them to the map
    
    var femaleLayer = L.geoJson(responseFemale, {
        pointToLayer: function(feature, latlng){
            return pointToLayerFemale(feature, latlng, attributesFemale);
        }
    }).addTo(mymap);
    
    var maleLayer = L.geoJson(responseMale, {
        pointToLayer: function(feature, latlng){
            return pointToLayerMale(feature, latlng, attributesMale);
        }
    }).addTo(mymap);

//Create layers control for overlay
//Define variables. Create object w/2 layers and assign to l.control layers. Assign as just overlays. baseMaps is null (not toggling tilesets). 

var baseMaps = null;

var overlayMaps = {
    "Female Under-5 Mortality": femaleLayer,
    "Male Under-5 Mortality": maleLayer
};
    L.control.layers(baseMaps, overlayMaps).addTo(mymap);


    updatePropSymbols (mymap, attributesFemale[0]);
};


//Step 1: Create new sequence controls
//function createSequenceControls(mymap, attributes){
function createSequenceControlsFemale(mymap, attributesFemale){
    
    //add skip buttons
    $('#panelFemale').append('<button class="skip" id="reverseFemale">Reverse</button>');
    $('#panelFemale').append('<button class="skip" id="forwardFemale">Skip</button>');
    //replace button content with images
    $('#reverseFemale').html('<img src="img/reverse.png">');
    $('#forwardFemale').html('<img src="img/forward.png">');

    //create range input element (slider)
    $('#panelFemale').append('<input class="range-slider" type="range">');
    //set slider attributes
    $('.range-slider').attr({
        max: 4, //5 slider positions (0 index -> 5 = 4)
        min: 1, //index o' first attribute 
        value: 0, //start at first att in sequence
        step: 1 //slider's value inc/decremented by 1
    });

    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var indexFemale = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            indexFemale++;
            //Step 7: if past the last attribute, wrap around to first attribute
            indexFemale = indexFemale > 4 ? 0 : indexFemale;
        } else if ($(this).attr('id') == 'reverse'){
            indexFemale--;
            //Step 7: if past the first attribute, wrap around to last attribute
            indexFemale = indexFemale < 0 ? 4 : indexFemale;
        };

        //Step 8: update slider based on above new index
        $('.range-slider').val(indexFemale);
        //Step 9: Reassign the current attribute based on the new attributes array index
        updatePropSymbols(mymap, attributesFemale[indexFemale])
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var indexFemale = $(this).val();
        updatePropSymbols(mymap, attributesFemale[indexFemale])
    });
};

//Create male sequence controls
function createSequenceControlsMale(mymap, attributesMale){
    
    //add skip buttons
    $('#panelMale').append('<button class="skip" id="reverseMale">Reverse</button>');
    $('#panelMale').append('<button class="skip" id="forwardMale">Skip</button>');
    //replace button content with images
    $('#reverseMale').html('<img src="img/reverse.png">');
    $('#forwardMale').html('<img src="img/forward.png">');

    //create range input element (slider)
    $('#panelMale').append('<input class="range-slider" type="range">');
    //set slider attributes
    $('.range-slider').attr({
        max: 4, //5 slider positions (0 index -> 5 = 4)
        min: 1, //index o' first attribute 
        value: 0, //start at first att in sequence
        step: 1 //slider's value inc/decremented by 1
    });

    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var indexMale = $('.range-slider').val();
        

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            indexMale++;
            //Step 7: if past the last attribute, wrap around to first attribute
            indexMale = indexMale > 4 ? 0 : indexMale;
        } else if ($(this).attr('id') == 'reverse'){
            indexMale--;
            //Step 7: if past the first attribute, wrap around to last attribute
            indexMale = indexMale < 0 ? 4 : indexMale;
        };

        //Step 8: update slider based on above new index
        $('.range-slider').val(indexMale);
        //Step 9: Reassign the current attribute based on the new attributes array index
        updatePropSymbols(mymap, attributesMale[indexMale])
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var indexMale = $(this).val();
        updatePropSymbols(mymap, attributesMale[indexMale])
    });
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            //if no data exists (value of -9999), use $ isNAN to reassign value radius to 0
            if (isNaN(radius)){
                radius = 0;
            };

            layer.setRadius(radius);

            //add country to popup content string
            var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";

            //add formatted attribute to popup content string
            var gender = attribute.split("_")[1];
            var year = attribute.split("_")[0];
            popupContent += "<p><b>Deaths under 5 years of age for " + gender + "s "+ "in " + year + ":</b> " + props[attribute] + "</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        };
    });
};


//Step 3: build an attributes array from the data3. Create an array of the sequential attributes to keep track of their order.
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("20") > -1){
            attributes.push(attribute);
        };
    
    };
    //Assign the current attribute based on the index of the attributes array
    return attributes;
};

//Import GeoJSON data and call functions to execute with data AND nested data
function getFemaleData(mymap){
    //load the data
    $.ajax("data/Female_Child_Mortality.geojson", {
        dataType: "json",
        success: function(responseFemale){
            $.ajax("data/Male_Child_Mortality.geojson", {
                dataType: "json",
                success: function(responseMale){
                    //create an attributes array
                    var attributesFemale = processData(responseFemale);
                    var attributesMale = processData(responseMale);
                    //call function to create proportional symbols
                    createPropSymbols(responseFemale, responseMale, mymap, attributesFemale, attributesMale);
                    //call function to create an HTML range slider
                    createSequenceControlsFemale(mymap, attributesFemale);
                    createSequenceControlsMale(mymap, attributesMale);
                }
            });
        }
    });
};

//call the initialize function when the document has loaded
$(document).ready(initialize);
