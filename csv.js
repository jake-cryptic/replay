var CSVParse = function(options){
	
	this.headers = options.headers || [];
	this.parsed = [];
	this.keyed = [];
	this.numrows = 0;
	this.numcols = 0;
	
	this.parseString = function(str){
		var lines = str.split("\n");
		
		this.parsed = lines.map(function(e){
			return e.split(",");
		});
		
		this.keyed = this.parsed.map(function(e){
			var obj = {};
			for (var i = 0;i<e.length;i++){
				obj[this.headers[i]] = e[i];
			}
			return obj;
		},{headers:this.headers});
		
		this.numrows = lines.length;
		this.numcols = this.parsed[0].length || 0;
	};
	
	this.returnLines = function(cb){
		cb(this.keyed);
	};
	
};