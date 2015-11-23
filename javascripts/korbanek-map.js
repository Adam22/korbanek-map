$j = jQuery.noConflict();
$j(document).ready(function(){

//Map Variables
	 korbanekMap = {
		map: null,
                mapType: {
                    CLEAR: 'CLEAR',
                    ALL: 'ALL',
                    CENTRAL: 'CENTRAL',
                },
                
                defaultConfig: {
                    centralMarker:{
                        url: 'images/marker-central.png',
                        size: new google.maps.Size(19,31),
                        origin: new google.maps.Point(0,0),
                        anchor: new google.maps.Point(9,31),
                    },
                    mapPosition: {
                        lat: 52.265472, 
                        lng: 19.305168
                    },                  
                    mapZoom: 8,
                },                   
//Geocoder Variables
		geocoder: null,
                bounds: null,
		address: null,
                markerSet: [],
                destinationSet: [],                                  
// Distance Matrix variables
                distanceService: null,
                
                setupMap: function(position){
                    korbanekMap.geocoder = new google.maps.Geocoder();
                    korbanekMap.distanceService = new google.maps.DistanceMatrixService();
                    if (position){
                        if(screen.width > 769){
                            korbanekMap.createMap(position);
                            korbanekMap.createMarkerGridForType(korbanekMap.mapType.ALL);
                        }else{
                            korbanekMap.createMap(position);
                            korbanekMap.calculateDistance(korbanekMap.distanceService, position, korbanekMap.destinationSet);                            
                        }
                    }else{
                        korbanekMap.createMap(korbanekMap.defaultConfig.mapPosition);
                    }
                    korbanekMap.createMarkerGridForType(korbanekMap.mapType.ALL);
                    document.getElementById('submit').addEventListener('click', function(){
                        korbanekMap.calculateDistance(korbanekMap.distanceService, korbanekMap.getOrigin(), korbanekMap.destinationSet);
                    });
                    document.getElementById('reset-map').addEventListener('click', function(){
                        korbanekMap.removeMarkers(korbanekMap.markerSet);
                        korbanekMap.createMarkerGridForType(korbanekMap.mapType.ALL);
                    });                    
                },
                
                setupStartingLatLng: function(){                    
                    if (Modernizr.geolocation && navigator.geolocation){
                        navigator.geolocation.getCurrentPosition(function (position) {
                            var pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            }
                            korbanekMap.setupMap(pos)
                        });                                                
                    } else {
                        korbanekMap.setupMap();
                    }          
                },
                
                openInfowWIndow: function(marker, lat, lng){
                    var content = this.parseDataFromHTML('.dealer', lat, lng);
                    this.infoWindow = new google.maps.InfoWindow({
                        content: content
                    });
                    this.infoWindow.open(korbanekMap.map, marker)
                },
                
                parseDataFromHTML: function(from, lat, lng){
                    var selector = from+'[data-lat="' + lat + '"][data-lng="' + lng + '"]';
                    var content;                    
                    content = $j(selector).text();                    
                    return content;
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
                        if (status == google.maps.DistanceMatrixStatus.OK) {
                            var origins = response.originAddresses;
                            var destinations = response.destinationAddresses;
                            var minDistance = Infinity;
                            var nearestAddress;
                            var from;
                            for (var i = 0; i < origins.length; i++) {
                                var results = response.rows[i].elements;
                                    for (var j = 0; j < results.length; j++) {
                                        var element = results[j];                                    
                                        from = origins[i];
                                        var to = destinations[j];
                                        if (minDistance > element.distance.value){
                                            minDistance = element.distance.value;
                                            nearestAddress = to;
                                        }
                                    }
                            }
                            korbanekMap.setNearestMarker(nearestAddress, from);
                        }
                    });
                },
                
                setNearestMarker: function(nearestAddress, from){
                        korbanekMap.removeMarkers(korbanekMap.markerSet);
                        korbanekMap.markerSet = [];
                        var marker;
                        korbanekMap.geocodeAddress(nearestAddress, function(latlng){
                            marker = korbanekMap.putMarker(latlng, korbanekMap.map);
                            marker.addListener('click', function(){
                                korbanekMap.openInfowWIndow(marker, marker.getPosition().lat().toString(), marker.getPosition().lng().toString());
                            });
                            korbanekMap.markerSet.push(marker);
                            marker = null;
                        });
                        korbanekMap.geocodeAddress(from, function(latlng){
                            marker = korbanekMap.putMarker(latlng, null);
                            korbanekMap.markerSet.push(marker);
                            korbanekMap.setBounds(korbanekMap.markerSet);
                        });
                },
                
                setBounds: function(markerSet){
                    var bounds = new google.maps.LatLngBounds();
                    for(var i = 0; i < markerSet.length; i++) {
                        bounds.extend(markerSet[i].getPosition());
                        console.log(markerSet[i].getPosition().toString());
                    }
                    korbanekMap.map.setCenter(bounds.getCenter());                    
                    korbanekMap.map.fitBounds(bounds);
                    korbanekMap.map.setZoom(korbanekMap.map.getZoom()-1); 
                },
                
                createMap: function(position) {
                    this.mapLatlng = new google.maps.LatLng(position);                    
                    var mapOptions = {
                        zoom: korbanekMap.defaultConfig.mapZoom,
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
                        icon: this.defaultConfig.centralMarker,
                        animation: google.maps.Animation.DROP,
                        position: position,
                        title: 'korbanek-map'
                    });
                },
                
                removeMarkers: function(markerSet){
                    for (var i = 0; i < markerSet.length; i++){
                        markerSet[i].setMap(null);
                    }
                },
                
                createMarkerGridForType: function(mapType){
                    switch (mapType){
                        case 'ALL':
                            this.createMarkerGrid('.dealer');
                            break;
                        case 'CENTRAL':
                            this.createMarkerGrid('.central');
                            break;
                        case 'CLEAR':
                            break;
                    };
                },
                
		initialize: function(){
                    this.setupStartingLatLng();                    
		},                                                
	},        
	google.maps.event.addDomListener(window, "load", korbanekMap.initialize());
});