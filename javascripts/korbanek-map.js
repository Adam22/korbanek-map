(function ( $j ) {
    $j = jQuery.noConflict();
    $j.fn.defaults = {
        
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
    
    $j(document).ready(function(){                 
        google.maps.event.addDomListener(window, "load", initialize);
    });  
    
    function initialize(){
        $j('div[data-' + $j.fn.defaults.mapSettingsDataAttr + ']').each(function(){
            var options = $j(this).data($j.fn.defaults.mapSettingsDataAttr);
            options['onContainer'] = $j(this).attr('id');
            $j(this).searchFeatureUI(options).createGoogleMap(options);
        });
    };
        $j.fn.createGoogleMap = function(options){
        console.log(options);
        var mapOptions = $j.extend({}, $j.fn.defaults, options);
        var app = new MapApplication(mapOptions);
        return this;
    };
    
    $j.fn.searchFeatureUI = function(options){
        if(options.searchFeature){
            console.log(this);
            $j(this).parent().before('<div class="form-group">\n\
                                        <label for="submit">Address</label>\n\
                                        <input type="text" class="form-control" id="address">\n\
                                        <input class="btn btn-default" type="submit" id="submit" value="Submit">\n\
                                      </div>');
        }
        return this;
    };
    
    function MapApplication(config){
        this.korbanekMap = new KorbanekMap(config);
        var self = this;
        this.setupStartingLatLng(function(pos){
            if(pos){
                self.korbanekMap.config.mapZoom = 9;
                self.korbanekMap.config.mapPosition = pos;            
            }
            self.drawMap(self.korbanekMap.config, self.korbanekMap.map);      
            console.log(self.korbanekMap.map);
            self.korbanekMap.setupMarkersOnMap(self.korbanekMap.markerSet, self.korbanekMap.map);            
            
        }, this.korbanekMap.config.navigatorOptions);
        if(this.korbanekMap.config.searchFeature){
            this.setSearchFeature(self);
        }
    };
    
    MapApplication.prototype = {
        setSearchFeature: function(self){

        },
        
        parseHTMLContent: function(lat, lng){

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
        },
        
        drawMap: function (options, map){    
            var mapCenter = new google.maps.LatLng(options.mapPosition);
            map = new google.maps.Map(document.getElementById(options.onContainer), options.mapOptions);                        
            map.setCenter(mapCenter);
            map.setZoom(options.mapZoom);
            return map;            
        }
    }; 
    
    function KorbanekMap(config){
        this.config = config;
        this.map;
        this.nearestPionts = [];
        this.destinationSet = this.setDestinationSource(this.config.markerSourceClass);
        this.markerSet = this.createMarkers(this.config.centralMarkerIcon, this.destinationSet, null);
    };
    
    KorbanekMap.prototype = {
        putMarker:  function(icon, position, map){
            return new google.maps.Marker({
              map: map,
              icon: icon,
              animation: google.maps.Animation.DROP,
              position: position,
              title: 'korbanek-map'
          });
        },
        setDestinationSource: function(from){
            var destinations = new Array();
            $j(from).each(function(){
                var position = new google.maps.LatLng({lat: $j(this).data('lat'), lng: $j(this).data('lng')});
                destinations.push(position);
            });
            return destinations;
        },
        createMarkers: function(icon, sourceSet, map){
            var markers = Array();
            for(var i = 0; i < sourceSet.length; i++){                
                markers.push(this.putMarker(icon, sourceSet[i], map));
            }
            return markers;
        },
        setupMarkersOnMap: function(markerSet, map){
            for (var i = 0; i < markerSet.length; i++){
                markerSet[i].setMap(map);
            }
        }
    };    
}( jQuery ));