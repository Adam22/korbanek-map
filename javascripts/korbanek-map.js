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
                    navigatorOptions: {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    },                
                    
                    mapZoom: 8,
                    mobileZoom: 12,
                },
                                
//Geocoder Variables
		geocoder: null,
                bounds: null,
		address: null,
                markerSet: [],
                destinationSet: [],                                  
// Distance Matrix variables
                distanceService: null,

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
                    markerSet = [];
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

                createMarkerGrid: function(from, map){
                    $j(from).each(function(){
                        var markerPosition = new google.maps.LatLng({lat: $j(this).data('lat'), lng: $j(this).data('lng')});
                        korbanekMap.destinationSet.push($j(this).find('.address').text());
                        korbanekMap.markerSet.push(korbanekMap.putMarker(markerPosition, map));
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
                            korbanekMap.removeMarkers(korbanekMap.markerSet);
                            korbanekMap.markerSet = [];
                            korbanekMap.setNearestMarker(nearestAddress, from);
                        }
                    });
                },
                
                setNearestMarker: function(nearestAddress, from){                        
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
                    this.map.setCenter(bounds.getCenter());                    
                    this.map.fitBounds(bounds);
                    this.map.setZoom(korbanekMap.map.getZoom()-1); 
                },
                
                createMap: function(position, zoom) {
                    var mapLatlng = new google.maps.LatLng(position);                    
                    var mapOptions = {
                        zoom: zoom,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        scrollwheel: false,
                        center: mapLatlng,
                        disableDefaultUI: true
                    };
                    this.map = new google.maps.Map(document.getElementById("map"),mapOptions);
                    google.maps.event.addDomListener(window, "resize", function() {
                        korbanekMap.map.setCenter(mapLatlng);
                    });
                },

                setupMap: function(position){
                    this.geocoder = new google.maps.Geocoder();
                    this.distanceService = new google.maps.DistanceMatrixService();
                    if (position){
                        if(screen.width > 769){
                            this.createMap(position, this.defaultConfig.mapZoom);
                            this.createMarkerGrid('.dealer', this.map);
                        }else{
                            this.createMap(position, this.defaultConfig.mobileZoom);
                            this.createMarkerGrid('.dealer', null)
                            this.calculateDistance(this.distanceService, new google.maps.LatLng(position), this.destinationSet);                            
                        }
                    }else{
                        this.createMap(this.defaultConfig.mapPosition, this.defaultConfig.mapZoom);
                    }
                    document.getElementById('submit').addEventListener('click', function(){
                        korbanekMap.calculateDistance(korbanekMap.distanceService, korbanekMap.getOrigin(), korbanekMap.destinationSet);
                    });
                    document.getElementById('reset-map').addEventListener('click', function(){
                        korbanekMap.removeMarkers(korbanekMap.markerSet);
                        korbanekMap.markerSet = [];
                        korbanekMap.destinationSet = [];
                        korbanekMap.createMarkerGrid('.dealer', korbanekMap.map)
                        korbanekMap.map.setCenter(7);
                    });                    
                },
                                
                setupStartingLatLng: function(){                          
                    if (navigator.geolocation){
                        navigator.geolocation.getCurrentPosition(function(position){
                            var pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            }
                            korbanekMap.setupMap(pos)                            
                        }, function(err){
                            console.warn('ERROR(' + err.code + '): ' + err.message);
                            korbanekMap.setupMap();
                        }, korbanekMap.defaultConfig.navigatorOptions);                                                
                    }
                },
                      
		initialize: function(){
                    this.setupStartingLatLng();                    
		},                                                
	},        
	google.maps.event.addDomListener(window, "load", korbanekMap.initialize());
});