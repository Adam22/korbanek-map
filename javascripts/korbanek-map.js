$j = jQuery.noConflict();
$j(document).ready(function(){

//Map Variables
	 korbanekMap = {
		myLatlng: [],
		mapLatlng: [],
		myZoom: null,
		marker: null,
		map: null,
		infowindow: null,
		contentString: null,
                mapType: {
                    CLEAR: 'CLEAR',
                    ALL: 'ALL',
                    CENTRAL: 'CENTRAL',
                },
                
//Geocoder Variables

		geocoder: null,
                bounds: null,
		address: null,
                markerSet: [],
                destinationSet: [],
                                   
// Distance Matrix variables

                distanceService: null,
                centralMarkerImg:{
                    url: 'images/marker-central.png',
                    size: new google.maps.Size(19,31),
                    origin: new google.maps.Point(0,0),
                    anchor: new google.maps.Point(9,31),
                },                             
                
                createMarkerGrid: function(from){
                    $j(from).each(function(){
                        var markerPosition = new google.maps.LatLng({lat: $j(this).data('lat'), lng: $j(this).data('lng')});
                        korbanekMap.destinationSet.push($j(this).find('.address').text());
                        korbanekMap.markerSet.push(korbanekMap.putMarker(markerPosition, korbanekMap.map));
                    });
                },
                               
                geocodeInputAddress: function(callback){
                    this.address = document.getElementById('address').value;                    
                    this.geocodeAddress(this.address, callback);
		},
                
                getOrigin: function(){
                    this.address = document.getElementById('address').value;
                    return this.address;
                },
                
                geocodeAddress: function(address, callback){
                    var latlng;
                    this.geocoder.geocode({'address':address},function(results, status){
                        if(status === google.maps.GeocoderStatus.OK){
                                latlng  = results[0].geometry.location;
                        }else{
                                alert("Geocode was not successful:" + status);
                        }
                        if (typeof callback !== 'function') {
                            callback = false;
                        }
                        else{                            
                        callback(latlng);
                        }
                    });                    
                },
                
                calculateDistance: function(distanceMatrixService, origin, destinationSet){
                    distanceMatrixService.getDistanceMatrix({
                        origins: [origin],
                        destinations: destinationSet,
                        travelMode: google.maps.TravelMode.DRIVING,
                        unitSystem: google.maps.UnitSystem.METRIC,
                        avoidHighways: false,
                        avoidTolls: false                        
                    }, function(response, status){
                        if (status === google.maps.DistanceMatrixStatus.OK) {
                            var origins = response.originAddresses;
                            var destinations = response.destinationAddresses;
                            var minDistance = Infinity;
                            var nearestAddress;
                            for (var i = 0; i < origins.length; i++) {
                              var results = response.rows[i].elements;
                              for (var j = 0; j < results.length; j++) {
                                var element = results[j];                                
                                var to = destinations[j];
                                if (minDistance > element.distance.value){
                                    minDistance = element.distance.value;
                                    nearestAddress = to;
                                }
                              }
                            }
                            console.log(nearestAddress);
                            //korbanekMap.removeMarkers(korbanekMap.markerSet);
                            //korbanekMap.markerSet.push(korbanekMap.putMarker());
                          }
                    });
                },
                
                createMap: function(position) {
                    this.mapLatlng = new google.maps.LatLng(position);
                    this.myZoom = 6;
                    var mapOptions = {
                        zoom: this.myZoom,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        scrollwheel: false,
                        center: this.mapLatlng,
                        disableDefaultUI: true
                    };
                    this.map = new google.maps.Map(document.getElementById("map"),mapOptions);
                    google.maps.event.addDomListener(window, "resize", function() {
                        korbanekMap.map.setCenter(korbanekMap.mapLatlng);
                    });
                },

                putMarker: function(position,map) {
                    return new google.maps.Marker({
                        map: map,
                        icon: this.centralMarkerImg,
                        animation: google.maps.Animation.DROP,
                        position: position,
                        title: 'korbanek-map'
                    });
                },
                
                removeMarkers: function(markerSet){
                    for (var i = 0; i < markerSet.length; i++){
                        markerSet[i].setMap(null);
                    }
                    markerSet = [];
                },
                
		initialize: function(mapType) {
                    this.createMap({lat: 52.265472, lng: 19.305168});
                    switch (mapType){
                        case 'ALL':
                            this.createMarkerGrid('.dealer');
                            break;
                        case 'CENTRAL':
                            this.createMarkerGrid('.central');
                            break;
                    }                   
                    this.geocoder = new google.maps.Geocoder();
                    this.distanceService = new google.maps.DistanceMatrixService();
                    document.getElementById('submit').addEventListener('click', function(){
                        korbanekMap.calculateDistance(korbanekMap.distanceService, korbanekMap.getOrigin(), korbanekMap.destinationSet);
                    });
                    
		},                                                
	},        
	google.maps.event.addDomListener(window, "load", korbanekMap.initialize(korbanekMap.mapType.ALL));
});