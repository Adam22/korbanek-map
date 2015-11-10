$j = jQuery.noConflict();
$j(document).ready(function(){

//Map Variables
	 korbanekMap = {
		myLatlng: [],
		mapLatlng: [],
		myZoom: null,
		marker: null,
		map: null,
		infowindow: null,
		contentString: null,
                
                

//Geocoder Variables
		geocoder: null,
                bounds: null,
		address: null,
                markerSet:
                    {
                        "central": 
                            {
                                name: "Korbanek Sp. z o.o.",
                                address: 'ul. Poznańska 159, 62-080 Tarnowo Podgórne',
                                latlng: null,
                                marker: null
                            },
                        "podgaje":
                            {
                                name: "MASZYNY ROLNICZE Nel Wójcik",
                                address: "Podgaje, ul. Pamięci Narodowej 2 64-965 Okonek",
                                latlng: null,
                                marker: null,
                            },
                        "mroczen":
                            {
                                name: "Agropol Marek i Dariusz Jarych Spółka Jawn",
                                address: "Mroczeń 1, 63-611 Mroczeń",
                                latlng: null,
                                marker: null,
                            },
                        "wierzchowiska":
                            {
                                name: "MASZYNY ROLNICZE Mariusz Zdunek",
                                address: "Wierzchowiska Drugie 81A, 21-050 Piaski",
                                latlng: null,
                                marker: null,
                            },
                        "swiete":
                            {
                                name: "Misztela Robert",
                                address: "Święte 22A, 73-110 Stargard Szczeciński",
                                latlng: null,                                
                                marker: null,
                            },
                        "paslek":
                            {
                                name: "„KRUSZEWSKI” Kruszewski Roman",
                                address: "ul. Westerplatte 58, 14-400 Pasłęk",
                                latlng: null,
                                marker: null,
                            },
                        "pokrzydowo":
                            {
                                name: "„KRUSZEWSKI” Kruszewski Roman",
                                address: "Pokrzydowo 184, 87-312 Pokrzydowo",
                                latlng: null,
                                marker: null,
                            },
                        "golaczow":
                            {
                                name: "KACHNIARZ Sp.j.",
                                address: "Gołaczów 37, 59-225 Chojnów",
                                latlng: null,                                
                                marker: null,
                            },
                        "gojcow":
                            {
                                name: "Firma Handl.-Usł. „Agro-Serwis” Mariusz Nowakowsk",
                                address: "Gojców 26, 27-500 Opatów",
                                latlng: null,
                                marker: null,
                            },
                        "bransk":
                            {
                                name: "ROLMAX” Maksymiuk Wojciech",
                                address: "ul. Armii Krajowej 4B, 17-120 Brańsk",
                                latlng: null,                                
                                marker: null,
                            },
                        "kraniewo":
                            {
                                name: "Wójcik & Grabowski Sp. z o.o.",
                                address: "ul. Makowska 48, 06-425 Karniewo",
                                latlng: null,                                
                                marker: null,
                            },
                        "zapalow":
                            {
                                name: "Firma Usł.-Handl. Drobny Sławomi",
                                address: "Zapałów 170, 37-544 Zapałów",
                                latlng: null,                               
                                marker: null,
                            },
                        "lomza":
                            {
                                name: "Rogowski Robert Maszyny Rolnicze",
                                address: "ul. Magazynowa 7, 18-400 Łomża  ",
                                latlng: null,
                                marker: null,
                            },
                        "goniadz":
                            {
                                name: "VOLTRANS Sp. Jawna Usługi Handl.-Transp. Uścinowicz Piotr, Horczak Adam",
                                address: "ul. Wojska Polskiego 70, 19-110 Goniądz",
                                latlng: null,
                                marker: null,
                            },
                        "lipiny":
                            {
                                name: "AGRO LIPINY Zdzisław Sołdon",
                                address: "Lipiny 66, 92-701 Łódź",
                                latlng: null,
                                marker: null,
                            },
//                        "skrzyszow":
//                            {
//                                name: "Firma Usł.-Handl. „W. Marek” Wiesław Marek",
//                                address: "Skrzyszów 518, 33-156 Skrzyszów",
//                                latlng: null,                                
//                                marker: null,
//                            },
//
//                        "swibie":
//                            {
//                                name: "„ROL DAM-SERWIS” Damian Świeży",
//                                address: "Świbie, ul. Sportowa 35, 44-187 Wielowieś",
//                                latlng: null,
//                                marker: null,
//                            },
//                        "janikowo":
//                            {
//                                name: "AGRO-CLASSIC Sławomir Giża Spółka Jawna",
//                                address: "ul. Wędkarska 2, 88-160 Janikowo",
//                                latlng: null,                                
//                                marker: null,
//                            },
//                        "goldap":
//                            {
//                                name: "ROL-MASZ Serwis Naprawa Grzegorz Brzozowski",
//                                address: "ul. Warszawska 8a, 19-500 Gołdap",
//                                latlng: null,
//                                marker: null,
//                            },
                    },                
                
// Distance Matrix variables

                distanceService: null,
                stack: [],
                centralMarkerImg:{
                    url: 'images/marker-central.png',
                    size: new google.maps.Size(19,31),
                    origin: new google.maps.Point(0,0),
                    anchor: new google.maps.Point(9,31),
                },
                
                iterateMarkerSet: function(markerSet){                    
                    for (var property in markerSet){
                        if(markerSet.hasOwnProperty(property)){
                            korbanekMap.geocodeAddress(markerSet[property].address, function(latlng){
                                markerSet[property].marker = korbanekMap.putMarker(latlng, korbanekMap.map);
                                markerSet[property].latlng = markerSet[property].marker.getPosition().toString()
                                console.log(markerSet[property].marker.getPosition().toString());
                            });                            
                            
                        }
                    }
                },
                
                populateLatLng: function(){
                    $j('dealer').each(function(){
                        //$j(this).data('latlng', )
                    });
                },
                
                createMarkerGrid: function(){},
                
                geocodeInputAddress: function(callback) {
                    this.address = document.getElementById('address').value;                    
                    this.geocodeAddress(this.address, callback);
		},
                latlngm: null,
                geocodeAddress: function(address, callback) {
                    //console.log(address);
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
                
                createMap: function(position) {
                    this.mapLatlng = new google.maps.LatLng(position);
                    this.myZoom = 6;
                    var mapOptions = {
                        zoom: this.myZoom,
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
                        icon: this.centralMarkerImg,
                        animation: google.maps.Animation.DROP,
                        position: position,
                        title: 'korbanek-map'
                    });
                },

		initialize: function() {
                    this.createMap({lat: 52.265472, lng: 19.305168});
                    this.geocoder = new google.maps.Geocoder();
                    document.getElementById('submit').addEventListener('click', function(){
                            korbanekMap.geocodeInputAddress(function(latlng){
                                korbanekMap.putMarker(latlng, korbanekMap.map);                                
                            });
                    });
                    this.iterateMarkerSet(this.markerSet);
		},                                                
	},        
	google.maps.event.addDomListener(window, "load", korbanekMap.initialize());

});