$j = jQuery.noConflict();
$j(document).ready(function(){
    var app = new MapApplication();   
    google.maps.event.addDomListener(window, "load", app);    
});  

function MapApplication(){            
    if(!Object.create){
        Object.create = function(o){
            function F(){};
            F.prototype = o;
            return new F();
        }
    }    
    this.korbanekMap = new KorbanekMap(new DefaultConfig('map', '.central'));
    var self = this;    
    this.korbanekMap.setupStartingLatLng(function(pos){
        self.korbanekMap.config.mapPosition = pos;
        self.korbanekMap.drawMap(self.korbanekMap.config);            
        self.korbanekMap.setupMarkersOnMap(self.korbanekMap.markerSet, self.korbanekMap.map);            
        self.korbanekMap.map.setZoom(10);
    });
    this.googleOperator = new GoogleOprator();
};

MapApplication.prototype.parseHTMLContent = function(from, lat, lng){
    var selector = from + '[data-lat="' + lat + '"][data-lng="' + lng + '"]';
    var content;                    
    content = $j(selector).text();                    
    return content;
};

function GoogleOprator(){
    this.address;
    this.gocoder = new google.maps.Geocoder();
    this.distanceService = new google.maps.DistanceMatrixService();
    this.bounds = new google.maps.LatLngBounds();
};

GoogleOprator.prototype.geocodeAddress = function(address, callback, nearestMarker){
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
        callback(latlng, nearestMarker);
        }
    });  
};

GoogleOprator.prototype.calculateDistance = function(distanceMatrixService, origin, destinationSet){
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
                        var to = destinationSet[j];
                        if (minDistance > element.distance.value){
                            minDistance = element.distance.value;
                            nearestAddress = to;
                        }
                    }
            }
        }
    });

};

GoogleOprator.prototype.getOrigin = function(){
    this.address = document.getElementById('address').value;
    return this.address;
};

GoogleOprator.prototype.setBounds = function(){
    var bounds = new google.maps.LatLngBounds();
    for(var i = 0; i < korbanekMap.markerSet.length; i++) {
        bounds.extend(korbanekMap.markerSet[i].getPosition());                        
    }
    korbanekMap.map.setCenter(bounds.getCenter());                    
    korbanekMap.map.fitBounds(bounds);
    korbanekMap.map.setZoom(korbanekMap.map.getZoom()-1); 
};

//GoogleOprator.prototype.openInfoWindow = function(){
//    console.log(lat +' '+ lng);
//    var content = korbanekMap.parseDataFromHTML('.dealer', lat, lng);
//    korbanekMap.infoWindow = new google.maps.InfoWindow({
//        content: content
//    });
//    korbanekMap.infoWindow.open(korbanekMap.map, marker)
//};

function Map(config){
    this.config = config;
};

Map.prototype.drawMap = function (options){    
    var mapCenter = new google.maps.LatLng(options.mapPosition);
    this.map = new google.maps.Map(document.getElementById(options.onContainer), options.mapOptions);
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
            }
            if (typeof callback !== 'function') {
                callback = false;
            }
            else{                            
                callback(pos);
            }
        }, function(err){
            console.warn('ERROR(' + err.code + '): ' + err.message);
;
        }, navigatorOptions);                                                
    }
};

function KorbanekMap(config){
    Map.call(this, config);
    this.map;
    this.destinationSet = KorbanekMap.prototype.setDestinationSource(config.sourceClass);
    this.markerSet = KorbanekMap.prototype.createMarkers(config.centralMarker, this.destinationSet, null);
};

KorbanekMap.prototype = Object.create(Map.prototype);
KorbanekMap.prototype.constructor = KorbanekMap;

KorbanekMap.prototype.setDestinationSource = function(from){
    var destinations = new Array();
    $j(from).each(function(){
        var position = new google.maps.LatLng({lat: $j(this).data('lat'), lng: $j(this).data('lng')});
        destinations.push(position)
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

function DefaultConfig(htmlTaret, htmlSource){        
       this.onContainer = htmlTaret;
       this.mapZoom = 7;
       this.mobileZoom = 12;
       this.sourceClass = htmlSource;

       this.centralMarker = {
           url: 'images/marker-central.png',
           size: new google.maps.Size(19,31),
           origin: new google.maps.Point(0,0),
           anchor: new google.maps.Point(9,31),
       };
       this.mapPosition = {
           lat: 52.265472, 
           lng: 19.305168
       };              

       this.mapOptions = {
           mapTypeId: google.maps.MapTypeId.ROADMAP,
           scrollwheel: false,
           disableDefaultUI: true
       };
};

navigatorOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};