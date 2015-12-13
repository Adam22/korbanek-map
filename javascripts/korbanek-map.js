(function ( $jM ) {
    if(!Object.create){
        Object.create = function(o){
            function F(){};
            F.prototype = o;
            return new F();
        };
    }
    
    $jM = jQuery.noConflict();
    $jM(document).ready(function(){                 
        google.maps.event.addDomListener(window, "load", init);    
    });  

    function init(){
        $jM('div[data-map-config]').each(function(){
            var options = $jM(this).data('map-config');
            options['onContainer'] = $jM(this).attr('id');
            $jM(this).searchFeatureUI(options).createGoogleMap(options);
        });
    };

    $jM.fn.createGoogleMap = function(options){
        console.log(options);
        var mapOptions = $jM.extend({}, $jM.fn.createGoogleMap.defaults, options);
        var app = new MapApplication(mapOptions);
        return this;
    };

    $jM.fn.createGoogleMap.defaults = {
        onContainer: 'map',
        sourceClass: '.dealer',
        mapZoom: 7,
        searchFeature: false,
        addressInputID: 'address',
        centralMarker: {
            url: 'images/marker-central.png',
            size: new google.maps.Size(19,31),
            origin: new google.maps.Point(0,0),
            anchor: new google.maps.Point(9,31)
        },
        mapPosition: {
            lat: 52.265472, 
            lng: 19.305168
        },
        mapOptions: {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false,
            disableDefaultUI: true
        }                    
    };
    
    $jM.fn.searchFeatureUI = function(options){
        if(options.searchFeature){
            console.log(this);
            $jM(this).parent().before('<div class="form-group">\n\
                                        <label for="submit">Address</label>\n\
                                        <input type="text" class="form-control" id="address">\n\
                                        <input class="btn btn-default" type="submit" id="submit" value="Submit">\n\
                                      </div>');
        }
        return this;
    };

    function MapApplication(config){            
        this.korbanekMap = new KorbanekMap(config);
        this.googleOperator = new GoogleOprator();    

        var self = this;

        this.korbanekMap.setupStartingLatLng(function(pos){
            if(pos){
                self.korbanekMap.config.mapZoom = 9;
                self.korbanekMap.config.mapPosition = pos;            
            }
            self.korbanekMap.drawMap(self.korbanekMap.config);            
            self.korbanekMap.setupMarkersOnMap(self.korbanekMap.markerSet, self.korbanekMap.map);            
            
        });
        if(this.korbanekMap.config.searchFeature){
            this.setSearchFeature(self);
        }
    };

    MapApplication.prototype.setSearchFeature = function(self){
        document.getElementById('submit').addEventListener('click', function(){
            self.korbanekMap.setupMarkersOnMap(self.korbanekMap.markerSet, null);
            self.korbanekMap.markerSet = [];
            self.googleOperator.calculateDistance(self.googleOperator.distanceService, 
                self.googleOperator.getOrigin(self.korbanekMap.config.addressInputID), 
                self.korbanekMap.destinationSet, function(to, from){
                        var marker = Map.prototype.putMarker(self.korbanekMap.config.centralMarker, to, self.korbanekMap.map);
                        marker.addListener('click', function(){
                           self.googleOperator.setInfoWindow(self.parseHTMLContent(to.lat(), to.lng()));
                           self.googleOperator.infoWindow.open(self.korbanekMap.map, marker);
                        });
                        self.korbanekMap.markerSet.push(marker); 
                        self.googleOperator.geocodeAddress(from, function(latlng){
                           self.korbanekMap.markerSet.push(Map.prototype.putMarker(self.korbanekMap.config.centralMarker, latlng, null));
                           self.googleOperator.setBounds(self.korbanekMap);
                        });
                    }
                );       
        });
    };

    MapApplication.prototype.parseHTMLContent = function(lat, lng){
        var selector = '[data-lat="' + lat + '"][data-lng="' + lng + '"]';
        var content;                    
        content = $jM(selector).html();                    
        return content;
    };

    function Map(config){
        this.config = config;
    };

    Map.prototype.drawMap = function (options){    
        var mapCenter = new google.maps.LatLng(options.mapPosition);
        this.map = new google.maps.Map(document.getElementById(options.onContainer), options.mapOptions);
        google.maps.event.trigger(map,'resize');
        this.map.setCenter(mapCenter);
        this.map.setZoom(options.mapZoom);
    };

    Map.prototype.putMarker = function(icon, position, map){
        return new google.maps.Marker({
          map: map,
          icon: icon,
          animation: google.maps.Animation.DROP,
          position: position,
          title: 'korbanek-map'
      });
    };

    Map.prototype.setupStartingLatLng = function (callback){   
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                if (typeof callback !== 'function') {
                    callback = false;
                }
                else{                            
                    callback(pos);
                }
            }, function(err){
                console.warn('ERROR(' + err.code + '): ' + err.message);
                callback();
            }, navigatorOptions);                                                
        }
    };

    function KorbanekMap(config){
        Map.call(this, config);
        this.map;
        this.nearestPionts = [];
        this.destinationSet = KorbanekMap.prototype.setDestinationSource(config.sourceClass);
        this.markerSet = KorbanekMap.prototype.createMarkers(config.centralMarker, this.destinationSet, null);
    };

    KorbanekMap.prototype = Object.create(Map.prototype);
    KorbanekMap.prototype.constructor = KorbanekMap;

    KorbanekMap.prototype.setDestinationSource = function(from){
        var destinations = new Array();
        $jM(from).each(function(){
            var position = new google.maps.LatLng({lat: $jM(this).data('lat'), lng: $jM(this).data('lng')});
            destinations.push(position);
        });
        return destinations;
    };
    KorbanekMap.prototype.createMarkers = function(icon, sourceSet, map){
        var markers = Array();
        for(var i = 0; i < sourceSet.length; i++){
            markers.push(Map.prototype.putMarker(icon, sourceSet[i], map));
        }
        return markers;
    };
    KorbanekMap.prototype.setupMarkersOnMap = function(markerSet, map){
        for (var i = 0; i < markerSet.length; i++){
            markerSet[i].setMap(map);
        }
    };

    function GoogleOprator(){
        this.address;
        this.infoWindow;
        this.geocoder = new google.maps.Geocoder();
        this.distanceService = new google.maps.DistanceMatrixService();
        this.bounds = new google.maps.LatLngBounds();
    };

    GoogleOprator.prototype.geocodeAddress = function(address, callback){
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
    };

    GoogleOprator.prototype.calculateDistance = function(distanceMatrixService, origin, destinationSet, callback){
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
                var from;
                for (var i = 0; i < origins.length; i++) {
                    var results = response.rows[i].elements;
                        from = origins[i];
                        for (var j = 0; j < results.length; j++) {                        
                            var element = results[j];                                    
                            if (minDistance > element.distance.value){                            
                                minDistance = element.distance.value;
                                nearestAddress =  destinationSet[j];
                            }
                        }
                }
                callback(nearestAddress, from);
            }       
           });
    };

    GoogleOprator.prototype.getOrigin = function(from){
        this.address = document.getElementById(from).value;
        return this.address;
    };

    GoogleOprator.prototype.setBounds = function(korbanekMap){
        var bounds = new google.maps.LatLngBounds();
        for(var i = 0; i < korbanekMap.markerSet.length; i++) {
            bounds.extend(korbanekMap.markerSet[i].getPosition());                        
        }
        korbanekMap.map.setCenter(bounds.getCenter());
        google.maps.event.trigger(korbanekMap.map,'resize');
        korbanekMap.map.fitBounds(bounds);
        korbanekMap.map.setZoom(korbanekMap.map.getZoom() - 1); 
    };

    GoogleOprator.prototype.setInfoWindow = function(content){
        this.infoWindow = new google.maps.InfoWindow({
            content: content
        });    
    };

    navigatorOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
}( jQuery ));