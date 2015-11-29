$j = jQuery.noConflict();
$j(document).ready(function(){

    var map;
    var destinationSet;
    var markerSet;
    function DefaultConfig(){        
        this.onContainer = 'map';
        this.mapZoom = 8;
        this.mobileZoom = 12;

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

        this.mapOptions = {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false,
            disableDefaultUI: true
        };
    };          

    function initialize(){        ;
        if(!Object.create){
            Object.create = function(o){
                function F(){};
                F.prototype = o;
                return new F();
            }
        }
        KorbanekMap.prototype = Object.create(Map.prototype);
        KorbanekMap.prototype.constructor = KorbanekMap;
        var config = new DefaultConfig();
        var map = new KorbanekMap(config);
        map.drawMap(map.config);
        var destinationSet;
        var markerSet;       
    }; 

    function Map(config){
        this.config = config;
    };

    Map.prototype.drawMap = function (options){
        var _this = this;                      
        var mapCenter = new google.maps.LatLng(options.mapPosition);
        this.map = new google.maps.Map(document.getElementById('map'), options.mapOptions);
        this.map.setCenter(mapCenter);
        this.map.setZoom(options.mapZoom);
        };

    Map.prototype.putMarker = function(){};

    function KorbanekMap(config){
        Map.call(this, config);        
    };
    google.maps.event.addDomListener(window, "load", initialize);
});