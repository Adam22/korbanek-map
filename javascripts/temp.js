/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$j = jQuery.noConflict();
$j(document).ready(function(){
            
             temp = {

                countDistance: function(){
                    this.distanceService = new google.maps.DistanceServiceMatrix;
                    this.distanceService.getDistanceMatrix({
                        origins: [origin1, origin2],
                        destinations: [destinationA, destinationB],
                        travelMode: google.maps.TravelMode.DRIVING,
                        unitSystem: google.maps.UnitSystem.METRIC,
                        avoidHighways: false,
                        avoidTolls: false
                    },function(response,status) {
                        if (status !== google.maps.DistanceMatrixStatus.OK) {
                          alert('Error was: ' + status);
                        } else {
                          originList = response.originAddresses;
                          var destinationList = response.destinationAddresses;
                          var outputDiv = document.getElementById('output');
                          outputDiv.innerHTML = 'aaaaaaaa';
                      }                    
                    });
                },
                
                		openInfoWindow: function(marker){
//			this.contentString = '<p>Content</p>';

			this.infowindow = new google.maps.InfoWindow({
				content: this.contentString
			});

			this.marker.addListener('click', function() {
				korbanekMap.infowindow.open(korbanekMap.map, korbanekMap.marker);
			});

			//this.infowindow.setPosition(position);
			window.setTimeout(function(){
				korbanekMap.infowindow.open(korbanekMap.map, korbanekMap.marker);	
			}, 2000);
			//this.infowindow.open(this.map, this.marker);
		},
            }
});
