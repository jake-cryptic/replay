<!DOCTYPE html>
<html lang="en">

	<head>

		<title>Replay</title>

		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta http-equiv="content-language" content="en" />
		<meta content="#1a1a1a" name="theme-color" />

		<!-- Enable PWA ability on iOS -->
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
		<meta name="apple-mobile-web-app-title" content="Replay Tool" />
		
		<!-- Styles -->
		<link rel="stylesheet" media="all" type="text/css" href="style.css" />

	</head>
	<body>
	
		<div id="controls">
			<input type="file" id="import" />
		</div>
		<div id="output">
			<div id="map"></div>
			<div id="status">Please load a file.</div>
		</div>
		
		<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBoEA1bC_26XOLzDUpPq-QvuPUZSFXYczE&callback=map.gMapsStart" async defer></script>
		<script type="text/javascript" src="jquery-3.4.1.min.js"></script>
		<script type="text/javascript" src="csv.js"></script>
		<script type="text/javascript" src="app.js"></script>

	</body>

</html>