(function ( $j ) {
    //Declare no-conflict
    $j = jQuery.noConflict();
    //Strict mode
    'use strict';
    $j(document).ready(function(){
        initialize();
    });  
    
     var defaults = {

        //Events
        startSearchOn: 'click',
        openInfoWindowOn: 'click',        

        //Selectors
        defaultContainerID: 'map',
        markersSourceClass: '.dealer',
        centralMarkerClass: '.central',
        addressInputId: 'address',
        mapSettingsDataAttr:'map-config',
        bindSearchFeatureTo: 'submit',

        //Map Default Settings
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
    
    function initialize(){
        $j('div[data-' + defaults.mapSettingsDataAttr + ']').each(function(){            
            $j(this).GoogleMapPlugin();
        });
    }; 
    //Plugin Definition
    $j.fn.GoogleMapPlugin = function(){
        var self = this;
        //Retrive Data
        var options = $j(this).data(defaults.mapSettingsDataAttr);
        //Container ID
        options['onContainer'] = $j(this).attr('id');  
        //Info Window Open event
        options['openInfoWindowOn'] = $j.fn.GoogleMapPlugin.prototype.obtainOnClickEvent();
        //Start Search On event
        options['startSearchOn'] = $j.fn.GoogleMapPlugin.prototype.obtainOnClickEvent();
        //Detect User Position from Browser
        
        $j.fn.GoogleMapPlugin.prototype.retriveUserPosition(options, self, function(){
            //Compose Settings Object
            var mapOptions = $j.extend({}, defaults, options);
            //Start jQuery Plugin Chain
            $j(this).GoogleMapPlugin.searchFeatureUI(mapOptions, $j(self)).createMap(mapOptions);
        });
    };
    
    //Insert Search Field
    $j.fn.GoogleMapPlugin.searchFeatureUI = function(mapOptions, element){
        if(mapOptions.searchFeature){
            $j(element).parent().before(
                '<div class="form-group">\n\
                    <label for="' + mapOptions.bindSearchFeatureTo + '">Address</label>\n\
                    <input type="text" class="form-control" id="address">\n\
                    <input class="btn btn-default" type="submit" id="' + mapOptions.bindSearchFeatureTo + '" value="Submit">\n\
                </div>');
        }
        return this;
    };
    
    $j.fn.GoogleMapPlugin.createMap = function(options){
        //Apply GoogleMap on source element
        this.korbanekMap = new KorbanekMap(options);        
        this.korbanekMap.embedMap();        
        this.korbanekMap.mapResize(this.korbanekMap.map);
        //Define default markers set
        if (this.korbanekMap.config.showAll){
            this.korbanekMap.config.defaultMarkerSet = this.korbanekMap.markerSet;
        }else{
            this.korbanekMap.config.defaultMarkerSet = this.korbanekMap.centralMarker;
        }
        //Put markers on the map
        this.korbanekMap.setupMarkersOnMap(this.korbanekMap.config.defaultMarkerSet, this.korbanekMap.map);
        
        return this;
    };
    
    $j.fn.GoogleMapPlugin.prototype.obtainOnClickEvent = function(){        
        var event = navigator.userAgent.match(/iphone|ipad/gi)
                ? "touchstart" 
                : "click";
        return event;
    };   
    
    $j.fn.GoogleMapPlugin.prototype.detectUserPosition = function(callback, navigatorOptions){   
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
        
    $j.fn.GoogleMapPlugin.prototype.retriveUserPosition = function(options, self, callback){
        this.detectUserPosition(function(pos){
            if(pos){
                options['mapZoom'] = 9;
                options['mapPosition'] = pos;
            }
            callback(self);
        }, defaults.navigatorOptions);        
    };   
    
    function Map(config){
        this.config = config;
    };

    Map.prototype.embedMap = function (){    
        var mapCenter = new google.maps.LatLng(this.config.mapPosition);
        this.map = new google.maps.Map(document.getElementById(this.config.onContainer), this.config.mapOptions);            
        this.map.setCenter(mapCenter);
        this.map.setZoom(this.config.mapZoom);
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

    Map.prototype.mapResize = function(map){
        google.maps.event.addDomListener(window, "resize", function() {
            var center = map.getCenter();
            google.maps.event.trigger(map, "resize");
            map.setCenter(center); 
        });
    };

    function KorbanekMap(config){
        Map.call(this, config);
        var self = this;
        this.map;
        this.googleOperator = new GoogleOprator();
        this.nearestPionts = [];
        //Create markers set
        this.centralSource = this.setDestinationCollection(this.config.centralMarkerClass);
        this.destinationSet = this.setDestinationCollection(this.config.markersSourceClass);
        this.centralMarker = this.createMarkers(this.config.centralMarkerIcon, this.centralSource);
        this.markerSet = this.createMarkers(this.config.centralMarkerIcon, this.destinationSet);
        //Setum Search feature
        if (this.config.searchFeature){
            this.setupSearchFeature(self);
        }
    };

    KorbanekMap.prototype = Object.create(Map.prototype);
    KorbanekMap.prototype.constructor = KorbanekMap;
    
    KorbanekMap.prototype.setDestinationCollection = function(from){
        var destinations = new Array();
        $j(from).each(function(){
            var position = new google.maps.LatLng({lat: $j(this).data('lat'), lng: $j(this).data('lng')});
            destinations.push(position);
        });
        return destinations;
    };
    
    KorbanekMap.prototype.parseHTMLToContent = function(lat, lng){
        var selector = '[data-lat="' + lat + '"][data-lng="' + lng + '"]';
        var content;
        content = $j(selector).html();
        return content;
    };
    
    KorbanekMap.prototype.createMarkers = function(icon, sourceSet){
        var self = this;
        var markers = Array();
        for(var i = 0; i < sourceSet.length; i++){
            var marker = Map.prototype.putMarker(icon, sourceSet[i], null);                
            var infoWindow = this.googleOperator.setInfoWindow(this.parseHTMLToContent(marker.getPosition().lat(), marker.getPosition().lng()));            
            this.googleOperator.setInfoWindowEvent(self, marker, this.config.openInfoWindowOn, infoWindow);
            markers.push(marker);                
        };
        return markers;
    };  
    
    KorbanekMap.prototype.setupMarkersOnMap = function(markerSet, map){
    for (var i = 0; i < markerSet.length; i++){
            markerSet[i].setMap(map);
        };
    };
       
    KorbanekMap.prototype.clearMarkers = function(){
        this.setupMarkersOnMap(this.config.defaultMarkerSet, null);
    };
    
    KorbanekMap.prototype.setupSearchFeature = function(self){
        console.log(self);
        document.getElementById(this.config.bindSearchFeatureTo).addEventListener(this.config.startSearchOn, function(){              
            self.googleOperator.calculateDistance(
                self.googleOperator.distanceService,
                self.googleOperator.getOriginAddress(self.config.addressInputId),
                self.destinationSet,
                self,
                function(self, to, from){
                    self.clearMarkers();
                    self.config.defaultMarkerSet = [];
                    self.combineOriginDestinationMarkers(self, to, from);
                });
        });
    };
        
    KorbanekMap.prototype.combineOriginDestinationMarkers = function(self, to, from){
        //self.clearMarkers();            
        var marker = Map.prototype.putMarker(self.config.centralMarkerIcon, to, self.map);            
        var infoWindow = self.googleOperator.setInfoWindow(self.parseHTMLToContent(to.lat(), to.lng()));            
        self.googleOperator.setInfoWindowEvent(self, marker, self.config.openInfoWindowOn, infoWindow);
        self.config.defaultMarkerSet.push(marker);
        self.googleOperator.geocodeAddress(from, function(latlng){
            self.config.defaultMarkerSet.push(Map.prototype.putMarker(self.config.centralMarkerIcon, latlng, null));
            self.googleOperator.setBounds(self);
        });
    };
    
    function GoogleOprator(){
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

    GoogleOprator.prototype.calculateDistance = function(distanceMatrixService, origin, destinationSet, self, callback){
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
                callback(self, nearestAddress, from);
            }
           });
    };

    GoogleOprator.prototype.getOriginAddress = function(from){
        var address = document.getElementById(from).value;
        return address;
    };

    GoogleOprator.prototype.setBounds = function(korbanekMap){
        var bounds = new google.maps.LatLngBounds();
        for(var i = 0; i < korbanekMap.config.defaultMarkerSet.length; i++) {
            bounds.extend(korbanekMap.config.defaultMarkerSet[i].getPosition());                        
        }
        korbanekMap.map.setCenter(bounds.getCenter());            
        korbanekMap.map.fitBounds(bounds);
        korbanekMap.map.setZoom(korbanekMap.map.getZoom() - 1); 
    };

    GoogleOprator.prototype.setInfoWindowEvent = function(self, marker, event, infoWindow){            
        marker.addListener(event, function(){   
            infoWindow.open(self.map, marker);
        });
    };

    GoogleOprator.prototype.setInfoWindow = function(content){
        var infoWindow = new google.maps.InfoWindow({
            content: content
        });
        return infoWindow;
    };
}( jQuery ));