var csvParser = new CSVParse({
	headers:["lat","lng","alt","mcc","mnc","lac","cid","rsrp","rat","subrat","freq","pci"]
});
var fr = new FileReader();

var INVALID = 2147483647;

var curr = {
	// File info
	loaded:false,
	size:0,
	rows:0,
	name:"",
	
	// Time points
	timeStart:0,
	timeEnd:0,
	timeCurr:0,
	
	// User params
	speed:1,
	
};

var ctrl = {
	
	buildControls:function(){
		$("#status").empty();
		
		$("#status").append(
			$("<div/>",{"class":"side_sect","id":"fileinfo_sect"}).append(
				$("<h2/>").text("File Info"),
				$("<table/>").append(
					$("<tbody/>",{"id":"fileinfo_tbl"})
				)
			),
			$("<div/>",{"class":"side_sect","id":"userctrl_sect"}).append(
				
			),
			$("<div/>",{"class":"side_sect","id":"posinfo_sect"}).append(
				$("<table/>").append(
					$("<tbody/>",{"id":"posinfo_tbl"})
				)
			)
		);
	},
	
	updateFileInfo:function(){
		$("#fileinfo_tbl").empty().append(
			$("<tr/>").append(
				$("<td/>").text("File Name"),
				$("<td/>").text(curr.name)
			),
			$("<tr/>").append(
				$("<td/>").text("File Size"),
				$("<td/>").text(curr.size)
			),
			$("<tr/>").append(
				$("<td/>").text("File Valid"),
				$("<td/>").text(curr.loaded)
			),
			$("<tr/>").append(
				$("<td/>").text("Row Count"),
				$("<td/>").text(curr.rows)
			)
		);
	}
	
};

var map = {
	base:null,
	markers:[],
	moveTimeout:null,
	
	getUserLocation:function(){
		if(!navigator.geolocation) {
			console.error("Browser does not support Geolocation API");
			return;
		}

		// Use users location
		navigator.geolocation.getCurrentPosition(function(position) {
			console.log(position);
			map.moveMapTo(position.coords.latitude,position.coords.longitude);
		},function(){
			console.error("Couldn't locate you.");
		});
	},
	
	getBounds:function(){
		var neCoords = map.base.getBounds().getNorthEast(),
			swCoords = map.base.getBounds().getSouthWest();

		return {
			"ne_lat":neCoords.lat,
			"ne_lon":neCoords.lng,
			"sw_lat":swCoords.lat,
			"sw_lon":swCoords.lng
		};
	},
	
	moveMapTo:function(lat,lon){
		var center = new google.maps.LatLng(lat, lon);
		map.base.panTo(center);
	},

	addMarker:function(lat,lon){
		var marker = new google.maps.Marker({
			map: map.base,
			draggable: true,
			animation: google.maps.Animation.DROP,
			position: {lat: lat, lng: lon}
		});

		marker.addListener("click",function(a){
			console.log(a);
		});

		map.markers.push(marker);
	},

	updateMarkersMap:function(to){
		for (var i = 0; i < map.markers.length; i++ ) {
			map.markers[i].setMap(to);
		}
	},

	removeMarkers:function(){
		map.updateMarkersMap(null);
		map.markers.length = 0;
		map.markers = new Array();
	},
	
	mapListeners:function(){
		map.base.addListener("bounds_changed",function(){
			if (map.moveTimeout) clearTimeout(map.moveTimeout);

			map.moveTimeout = setTimeout(map.getDataPoints,500);
		});

		map.base.addListener("dragend",function(evt){
			console.log(evt);
		});
	},
	
	getDataPoints:function(){
		map.removeMarkers();
	},

	gMapsStart:function(){
		map.base = new google.maps.Map($("#map")[0], {
			center: {lat:51.50853, lng: -0.12574},
			zoom: 8,
			zoomControlOptions: {
				position: google.maps.ControlPosition.RIGHT_CENTER
			},
			fullscreenControlOptions: {
				position: google.maps.ControlPosition.RIGHT
			},
			scaleControl: true,
			//gestureHandling:"cooperative"
		});

		map.mapListeners();
		map.getUserLocation();
	}
};

var cmData = function(data){
	curr.rows = csvParser.numrows;
	ctrl.updateFileInfo();
	
	console.log(data);
};

var fileEvents = function(){
	fr.addEventListener('load', function(evt){
		curr.loaded = true;
		
		csvParser.parseString(evt.target.result);
		csvParser.returnLines(cmData);
	});

	$("#import")[0].addEventListener("change", function(){
		if (!this.files || !this.files[0]) return;
		ctrl.buildControls();
		
		var importFile = this.files[0];
		curr.size = importFile.size;
		curr.name = importFile.name;
		ctrl.updateFileInfo();
		
		fr.readAsBinaryString(importFile);
	});
};

fileEvents();