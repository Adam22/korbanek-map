(function ( $j ) {
    $j = jQuery.noConflict();  
    $j(document).ready(function(){
        KorbanekMap.prototype = Object.create(Map.prototype, {
            constructor: KorbanekMap 
        });
        google.maps.event.addDomListener(window, "load", initialize);
    });  
    
    function initialize(){
        $j('div[data-' + $j.fn.googleMapPlugin.defaults.mapSettingsDataAttr + ']').each(function(){
            var options = $j(this).data($j.fn.googleMapPlugin.defaults.mapSettingsDataAttr);
            options['onContainer'] = $j(this).attr('id');
            $j(this).searchFeatureUI(options).googleMapPlugin(options);
        });
    };
    
    $j.fn.searchFeatureUI = function(options){
        if(options.searchFeature){            
            $j(this).parent().before('<div class="form-group">\n\
                                        <label for="submit">Address</label>\n\
                                        <input type="text" class="form-control" id="address">\n\
                                        <input class="btn btn-default" type="submit" id="submit" value="Submit">\n\
                                      </div>');
        }
        return this;
    };
    
    $j.fn.googleMapPlugin = function(options){
        var mapOptions = $j.extend({}, $j.fn.googleMapPlugin.defaults, options);       
        $j.fn.googleMapPlugin.createGoogleMap(mapOptions);
        return this;
    };
    
    $j.fn.googleMapPlugin.defaults = {
        
        //Events
        
        //Selectors
        defaultContainerID: 'map',
        markerSourceClass: '.dealer',
        centralMarkerClass: '.central',
        addressInputID: 'address',
        mapSettingsDataAttr:'map-config',
        
        //Map Settings
        showAll: false,
        mapZoom: 7,
        searchFeature: false,       
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

    $j.fn.googleMapPlugin.createGoogleMap = function(options){  
        this.korbnekMap = new KorbanekMap(options);
        var self = this;
        this
        this.korbanekMap.setupStartingLatLng(function(pos){
            if(pos){
                self.korbanekMap.config.mapZoom = 9;
                self.korbanekMap.config.mapPosition = pos;            
            }
            self.korbanekMap.drawMap(self.korbanekMap.config);            
            self.korbanekMap.setupMarkersOnMap(self.korbanekMap.markerSet, self.korbanekMap.map);            
            
        });
        if(this.korbanekMap.config.searchFeature){
            //this.setSearchFeature(self);
        }
    };
    function Map(config){
        this.config = config;
    };

    Map.prototype = {
        constructor: Map,
        drawMap: function (options){    
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
        this.destinationSet = this.setDestinationSource(config.sourceClass);
        this.markerSet = this.createMarkers(config.centralMarker, this.destinationSet, null);
    };
}( jQuery ));