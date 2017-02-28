//THIS IS main.js FOR LEAFLET LAB (Module 5B) FOR GEOG575 SPRING 2017.//
//AUTHOR: AAIVERSON
//CONTAINS: LEAFLET LAB
//DATE: 2.28.17
////GOAL: Implement Operators that support your map, by first experimenting by adding the Retrieve (popup) operator and a Sequence operator with a slider for the user interface. Also, implement a fifth operator that is logical for the map. 
//NOTE: MISSING 5TH OPERATOR!

//////Detailed Psuedo-Code for SEQUENCE operator//////////////
//GOAL: Allow the user to sequence through the attributes and resymbolize the map 
//   according to each attribute
//STEPS:
//1. Create slider widget
//2. Create skip buttons
//3. Create an array of the sequential attributes to keep track of their order
//4. Assign the current attribute based on the index of the attributes array
//5. Listen for user input via affordances
//6. For a forward step through the sequence, increment the attributes array index; 
//   for a reverse step, decrement the attributes array index
//7. At either end of the sequence, return to the opposite end of the seqence on the next step
//   (wrap around)
//8. Update the slider position based on the new index
//9. Reassign the current attribute based on the new attributes array index
//10. Resize proportional symbols according to each feature's value for the new attribute


//////////////////////////begin code//////////////////////////

//initialize function called when the script loads to instantiate Leaflet map
function initialize(){

	//create map
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

//Dynamically calculating each circle marker radius for proportional symbol display...area relative to attribute value...
//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 2; //but what does this imply as far as user perception/understanding, if the scalFactor is larger?
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Step 4: Assign the current attribute based on the first index of the attributes array
    // var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#ff000",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.1
    };

    //create circle marker layer
    //return the circle marker to the L.geoJson pointToLayer option
    return L.circleMarker(latlng, options);
};


//Add circle markers for point features to the map
function createPropSymbols(data, mymap, attributes){
    
    console.log(attributes)
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(mymap);

    updatePropSymbols (mymap, attributes[0]);
};


//Step 1: Create new sequence controls
function createSequenceControls(mymap, attributes){
    
    //add skip buttons
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    //replace button content with images
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');

    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    //set slider attributes
    $('.range-slider').attr({
        max: 9, //10 slider positions 
        min: 0, //index o' first attribute 
        value: 0, //start at first att in sequence
        step: 1 //slider's value inc/decremented by 1
    });

    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 14 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 14 : index;
        };

        //Step 8: update slider based on above new index
        $('.range-slider').val(index);
        //Step 9: Reassign the current attribute based on the new attributes array index
        updatePropSymbols(mymap, attributes[index])
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
        updatePropSymbols(mymap, attributes[index])
    });

    

};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;
            console.log(props[attribute]);

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

//Import GeoJSON data and call functions to execute with data
function getData(mymap){
    //load the data
    $.ajax("data/Mortality_Edits1.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            var attributes = processData(response);
            //call function to create proportional symbols
            createPropSymbols(response, mymap, attributes);
            //call function to create an HTML range slider
            createSequenceControls(mymap, attributes);
        }
    });
};



//call the initialize function when the document has loaded
$(document).ready(initialize);
