var csvParser = new CSVParse({
	headers:["lat","lon","alt","mcc","mnc","lac","cid","rsrp","rat","subrat","freq","pci"]
});
var fr = new FileReader();

var INVALID = 2147483647;
var fileData = [];
var lastUpdate = {
	mcc:null,
	mnc:null,
	rat:null,
	freq:null,
	cid:null,
	bts:null,
	pci:null,
	rsrq:null,
	lat:null,
	lon:null
};

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
	point:0
};

var roundNum = function(n,dp){
	var exp = Math.pow(10,dp);
	return Math.round(parseFloat(n)*exp)/exp;
};

var playRound = function(){
	var point = fileData[curr.point];
	if (point === undefined) clearInterval(ctrl.playing);

	var update = {
		mcc:null,
		mnc:null,
		rat:null,
		freq:null,
		cid:null,
		bts:null,
		pci:null,
		rsrq:null,
		lat:null,
		lon:null
	};
	console.log(point);

	if (parseInt(point.mcc) !== INVALID) update.mcc = parseInt(point.mcc);
	if (parseInt(point.mnc) !== INVALID) update.mnc = parseInt(point.mnc);
	if (parseInt(point.freq) !== INVALID) update.freq = parseInt(point.freq);
	if (parseInt(point.cid) !== INVALID) update.cid = parseInt(point.cid);
	if (parseInt(point.pci) !== INVALID) update.pci = parseInt(point.pci);

	update.rat = point.rat + " / " + point.subrat;

	if (point.lat !== INVALID) update.lat = point.lat;
	if (point.lon !== INVALID) update.lon = point.lon;

	// Update sidebar
	ctrl.updatePosInfo(update);

	// Update map
	map.moveMapTo(roundNum(update.lat,3),roundNum(update.lon,3));
	map.addDataPoint(roundNum(update.lat,5),roundNum(update.lon,5),parseInt(point.rsrp));

	lastUpdate = update;
	curr.point++;
};

var getColourForRsrp = function(rsrp){
	var col = "3cff00";
	if (rsrp < -60) col = "32d400";
	if (rsrp < -70) col = "67d400";
	if (rsrp < -80) col = "9dd400";
	if (rsrp < -90) col = "bdd400";
	if (rsrp < -100) col = "d4c100";
	if (rsrp < -110) col = "d46000";
	if (rsrp < -120) col = "d42000";
	if (rsrp < -130) col = "fb0000";

	return "#" + col;
};

var ctrl = {

	playing:null,

	play:function(){
		ctrl.playing = setInterval(playRound,30);
		map.zoomMap(14);
	},
	pause:function(){
		clearInterval(ctrl.playing);
	},
	
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
				$("<button/>").text("Play").on("click enter",ctrl.play),
				$("<button/>").text("Pause").on("click enter",ctrl.pause),
				$("<br />"),
				$("<select/>").append(
					$("<option/>",{"value":1}).text("0.25x Speed"),
					$("<option/>",{"value":2}).text("0.5x Speed"),
					$("<option/>",{"value":4}).text("1x Speed"),
					$("<option/>",{"value":6}).text("1.25x Speed"),
					$("<option/>",{"value":7}).text("1.5x Speed"),
					$("<option/>",{"value":8}).text("2x Speed"),
				)
			),
			$("<div/>",{"class":"side_sect","id":"posinfo_sect"}).append(
				$("<h2/>").text("Cell Info"),
				$("<table/>").append(
					$("<tbody/>",{"id":"posinfo_tbl"}).append(
						$("<tr/>").append(
							$("<td/>").text("RSRP"),
							$("<td/>").append(
								$("<progress/>",{
									"min":-135,
									"max":-45,
									"value":0,
									"id":"cell_rsrp"
								})
							)
						),
						$("<tr/>").append(
							$("<td/>").text("MCC"),
							$("<td/>",{"id":"cell_mcc"}).text("000")
						),
						$("<tr/>").append(
							$("<td/>").text("MNC"),
							$("<td/>",{"id":"cell_mnc"}).text("000")
						),
						$("<tr/>").append(
							$("<td/>").text("RAT"),
							$("<td/>",{"id":"cell_rat"}).text("Unspecified")
						),
						$("<tr/>").append(
							$("<td/>").text("[E/U]ARFCN"),
							$("<td/>",{"id":"cell_freq"}).text("?")
						),
						$("<tr/>").append(
							$("<td/>").text("Cell ID"),
							$("<td/>",{"id":"cell_cid"}).text("?")
						),
						$("<tr/>").append(
							$("<td/>").text("Node ID / Sector ID"),
							$("<td/>",{"id":"cell_bts"}).text("?")
						),
						$("<tr/>").append(
							$("<td/>").text("PCI"),
							$("<td/>",{"id":"cell_pci"}).text("000")
						)
					)
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
	},

	updatePosInfo:function(data){
		if (data.mcc !== null) $("#cell_mcc").text(data.mcc);
		if (data.mnc !== null) $("#cell_mnc").text(data.mnc);
		if (data.rat !== null) $("#cell_rat").text(data.rat);
		if (data.freq !== null) $("#cell_freq").text(data.freq);
		if (data.cid !== null) $("#cell_cid").text(data.cid);
		if (data.bts !== null) $("#cell_bts").text(data.bts);
		if (data.pci !== null) $("#cell_pci").text(data.pci);

		if (data.rsrp !== null) $("#cell_rsrp").val(data.rsrp);
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
		console.log(lat,lon);
		var center = new google.maps.LatLng(lat, lon);
		map.base.panTo(center);
	},

	zoomMap:function(level){
		map.base.setZoom(level);
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

	addDataPoint:function(lat,lon,rsrp){
		var cityCircle = new google.maps.Circle({
			strokeColor:getColourForRsrp(rsrp),
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#FF0000',
			fillOpacity: 0.35,
			map: map.base,
			center: {
				lat:parseFloat(lat),
				lng:parseFloat(lon)
			},
			radius: 4
		});
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
	fileData = data;
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