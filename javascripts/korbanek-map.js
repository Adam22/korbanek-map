(function ( $j ) {
    $j = jQuery.noConflict();  
    $j(document).ready(function(){
        initialize();
    });  
    
    function initialize(){
        $j('div[data-' + $j.fn.googleMapPlugin.defaults.mapSettingsDataAttr + ']').each(function(){
            var options = $j(this).data($j.fn.googleMapPlugin.defaults.mapSettingsDataAttr);
            options['onContainer'] = $j(this).attr('id');  
            $j(this).googleMapPlugin(options);
        });
    };   
        
    $j.fn.parseHTMLContent = function(lat, lng){
        var selector = '[data-lat="' + lat + '"][data-lng="' + lng + '"]';
        var content;
        content = $j(selector).html();
        return content;
    };
    
    $j.fn.obtainOnClickEvent = function(){
        var event = navigator.userAgent.match(/iphone|ipad/gi)
                ? "touchstart" 
                : "click";
        return event;
    };
    
    $j.fn.googleMapPlugin = function(options){        
        var mapOptions = $j.extend({}, $j.fn.googleMapPlugin.defaults, options);        
        $j(this).googleMapPlugin.searchFeatureUI(mapOptions, $j(this)).createMap(mapOptions).setDefaultMarkersSet().drawMap();
        return this;
    };

    $j.fn.googleMapPlugin.defaults = {
        
        //Events
        startSearchOn: 'click',
        openInfoWindowOn: 'click',
        initializePluginOn: 'load',
        
        //Selectors
        defaultContainerID: 'map',
        markersSourceClass: '.dealer',
        centralMarkerClass: '.central',
        addressInputId: 'address',
        mapSettingsDataAttr:'map-config',
        bindSearchFeatureTo: 'submit',
        
        //Map Settings
        detectUserPosition: true,
        showAll: false,
        mapZoom: 7,
        searchFeature: false,
        defaultMarkerSet: [],
        centralMarkerIcon: {
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
        },
        
        //Navigatot Settings
        navigatorOptions:{
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
        }
    };
    $j.fn.googleMapPlugin.searchFeatureUI = function(options, element){
        if(options.searchFeature){
            $j(element).parent().before('<div class="form-group">\n\
                                            <label for="' + $j.fn.googleMapPlugin.defaults.bindSearchFeatureTo + '">Address</label>\n\
                                            <input type="text" class="form-control" id="address">\n\
                                            <input class="btn btn-default" type="submit" id="' + $j.fn.googleMapPlugin.defaults.bindSearchFeatureTo + '" value="Submit">\n\
                                        </div>');
        }
        return this;
    };
    $j.fn.googleMapPlugin.createMap = function(options){
        this.korbanekMap = new KorbanekMap(options);
        this.googleOperator = new GoogleOprator();
        var self = this;
        if(this.korbanekMap.config.searchFeature){           
            this.korbanekMap.setSearchFeature(self);
        }
        return this;
    };
    
    $j.fn.googleMapPlugin.drawMap = function(){
        var self = this;
        if(this.korbanekMap.config.detectUserPosition){
            $j.fn.googleMapPlugin.detectUserPosition(self);
        }else{
            $j.fn.googleMapPlugin.applyGooleMap(self);
        }
        return this;
    };
    $j.fn.googleMapPlugin.detectUserPosition = function(self){
        this.korbanekMap.setupStartingLatLng(function(pos){
            if(pos){
                self.korbanekMap.config.mapZoom = 9;
                self.korbanekMap.config.mapPosition = pos;
            }
            $j.fn.googleMapPlugin.applyGooleMap(self);
        }, this.korbanekMap.config.navigatorOptions);
        return this; 
    };
    $j.fn.googleMapPlugin.applyGooleMap = function(self){
        self.korbanekMap.embedMap(self.korbanekMap.config);
        self.korbanekMap.setupMarkersOnMap(self.korbanekMap.config.defaultMarkerSet, self.korbanekMap.map);
    };
    $j.fn.googleMapPlugin.setDefaultMarkersSet = function(){
        if(this.korbanekMap.config.showAll){
           this.korbanekMap.config.defaultMarkerSet = this.korbanekMap.markerSet;
        }else{
           this.korbanekMap.config.defaultMarkerSet = this.korbanekMap.centralMarker;
        }
        return this;
    };
    
    function Map(config){
        this.config = config;
    };

    Map.prototype = {
        constructor: Map,
        embedMap: function (options){    
            var mapCenter = new google.maps.LatLng(options.mapPosition);
            this.map = new google.maps.Map(document.getElementById(options.onContainer), options.mapOptions);            
            this.map.setCenter(mapCenter);
            this.map.setZoom(options.mapZoom);
        },

        putMarker:  function(icon, position, map){
            return new google.maps.Marker({
              map: map,
              icon: icon,
              animation: google.maps.Animation.DROP,
              position: position,
              title: 'korbanek-map'
          });
        },

        setupStartingLatLng: function(callback, navigatorOptions){   
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
        }
    };
    
    function KorbanekMap(config){
        Map.call(this, config);
        this.map;
        this.nearestPionts = [];        
        this.setDestinationSource = function(from){
            var destinations = new Array();
            $j(from).each(function(){
                var position = new google.maps.LatLng({lat: $j(this).data('lat'), lng: $j(this).data('lng')});
                destinations.push(position);
            });
            return destinations;
        };
        this.createMarkers = function(icon, sourceSet, map){
            var markers = Array();
            for(var i = 0; i < sourceSet.length; i++){
                markers.push(Map.prototype.putMarker(icon, sourceSet[i], map));
            };
            return markers;
        };
        this.setupMarkersOnMap = function(markerSet, map){
            for (var i = 0; i < markerSet.length; i++){
                markerSet[i].setMap(map);
            };
        };
        this.setSearchFeature = function(self){
            document.getElementById(self.korbanekMap.config.bindSearchFeatureTo).addEventListener(self.korbanekMap.config.startSearchOn, function(){
                self.korbanekMap.setupMarkersOnMap(self.korbanekMap.markerSet, null);
                self.korbanekMap.markerSet = [];                
                self.googleOperator.calculateDistance(self.googleOperator.distanceService, 
                    self.googleOperator.getOrigin(self.korbanekMap.config.addressInputId), 
                    self.korbanekMap.destinationSet, function(to, from){
                            var marker = Map.prototype.putMarker(self.korbanekMap.config.centralMarkerIcon, to, self.korbanekMap.map);
                            marker.addListener($j.fn.googleMapPlugin.defaults.openInfoWindowOn, function(){
                               self.googleOperator.setInfoWindow($j.fn.parseHTMLContent(to.lat(), to.lng()));                               
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
        this.centralSource = this.setDestinationSource(config.centralMarkerClass);
        this.destinationSet = this.setDestinationSource(config.markersSourceClass);
        this.centralMarker = this.createMarkers(config.centralMarkerIcon, this.centralSource, null);
        this.markerSet = this.createMarkers(config.centralMarkerIcon, this.destinationSet, null);
    };
    
    KorbanekMap.prototype = Object.create(Map.prototype, {
        constructor: KorbanekMap
    });
    
    function GoogleOprator(){
        this.address;
        this.infoWindow;
        this.geocoder = new google.maps.Geocoder();
        this.distanceService = new google.maps.DistanceMatrixService();
        this.bounds = new google.maps.LatLngBounds();
    };

    GoogleOprator.prototype = {
        constructor: GoogleOprator,
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

        calculateDistance: function(distanceMatrixService, origin, destinationSet, callback){
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
        },

        getOrigin: function(from){
            this.address = document.getElementById(from).value;
            return this.address;
        },

        setBounds: function(korbanekMap){
            var bounds = new google.maps.LatLngBounds();
            for(var i = 0; i < korbanekMap.markerSet.length; i++) {
                bounds.extend(korbanekMap.markerSet[i].getPosition());                        
            }
            korbanekMap.map.setCenter(bounds.getCenter());            
            korbanekMap.map.fitBounds(bounds);
            korbanekMap.map.setZoom(korbanekMap.map.getZoom() - 1); 
        },

        setInfoWindow: function(content){
            this.infoWindow = new google.maps.InfoWindow({
                content: content
            });    
        }
    };    
}( jQuery ));