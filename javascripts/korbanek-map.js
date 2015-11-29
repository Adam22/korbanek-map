$j = jQuery.noConflict();
$j(document).ready(function(){

    var map;
    var destinationSet;
    var markerSet;
    var DefaultConfig = function(){
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
        this.navigatorOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };                

        this.mapZoom = 8,
        this.mobileZoom = 12,
        this.mapOptions = {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false,
            disableDefaultUI: true
        };
    };

    
    var config = new DefaultConfig();    
    google.maps.event.addDomListener(window, "load", KorbanekMap(config.mapOptions, config.mapPosition, config.mapZoom));  


  

function KorbanekMap(options, position, zoom){    
    var self = this;
    var mapCenter = new google.maps.LatLng(position);
    this.map = new google.maps.Map(document.getElementById('map'), options.mapOptions);
    this.map.setCenter(mapCenter);
    this.map.setZoom(zoom);
};
});