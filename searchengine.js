var fs = require("fs");
var request = require("request");
var cheerio = require("cheerio");
var express = require("express");
var app = express();

var sites = {
	Google: {
		url: "http://www.google.com/search?q=",
		search: function(body) {
			var searchResults = [];
			var $ = cheerio.load(body);

			$("#search").find("a").each( function() {

				var a = $(this);

				var link = a.attr("href");
				var source = "Google";
				var name =  a.text();

				if(link && source && name) {

					if(link.charAt(0) == "/") link =  "http://www.google.com" + link;

					searchResults.push(new Query(link, name, source));
				}
			});

			return searchResults;
		}
	},
	Yahoo: {
		url: "http://search.yahoo.com/search;?q=",
		search: function(body) {
			var searchResults = [];
			var $ = cheerio.load(body);

			$("#web").find("a").each( function() {

				var a = $(this);

				var link = a.attr("href");
				var source = "Yahoo";
				var name = a.text();
				
				if(link && source && name) {
					if(link.charAt(0) == "/") link =  "http://search.yahoo.com" + link;
					searchResults.push(new Query(link, name, source));
				}
			})
			return searchResults;
		}
	},
	Bing: {
		url: "http://bing.com/?q=",
		search: function(body) {
			var searchResults = [];
			var $ = cheerio.load(body);

			$("#b_results").find("a").each(function() {

				var a = $(this);

				var link = a.attr("href");
				var source = "Bing";
				var name = a.text();

				if(link && source && name) {
					if(link.charAt(0) == "/") link =  "http://www.bing.com" + link;
					searchResults.push(new Query(link, name, source));
				}
			});

			return searchResults;
		}
	}
};


function QueryResults(sites, http) {
	if(arguments.length >= 2) this.http = http;

	this.sites = sites;
}
QueryResults.prototype = {
	http: undefined,
	sites: undefined,
	queries: [],
	getQueries: function() {
		return this.queries;
	},

	scrapeSite: function(site, query, callback) {
		var that = this;
		request(site.url + query, function(err, res, body) {
			if (!err) {
				var search = site.search(body);
				that.store(search);
				callback();
			}
		});
	},
	scrape: function(query, callback) {
		var that = this;

		var count = Object.keys(this.sites).length;
		function onFinish() {
			count--;
			if (count == 0) {
				callback(that.getQueries());
			}
		}

		for (var key in this.sites) {
			this.scrapeSite(this.sites[key], query, onFinish);
		}
	},
	store: function(data) {
		this.queries = this.queries.concat(data);
	},
	clear: function() {
		this.queries = [];	
	}
};
QueryResults.prototype.constructor = QueryResults;


function Query(link, name, source) {
	this.link = link;
	this.name = name;
	this.source = source;
}
Query.prototype = {
	link: undefined,
	name: undefined,
	source: undefined
};
Query.prototype.constructor = Query;


var Results = new QueryResults(sites, request);

app.use(express.static('client'));

app.get("/scrape", function(req, res) {

	Results.clear();

	var queryRequest = null;
	if(Object.keys(req.query)[0]) {
		queryRequest = Object.keys(req.query)[0].toString();

		Results.scrape(queryRequest, function(results) {
			res.send(results);
		});
	}
});

app.delete("/clear", function(req, res) {
	Results.clear();
	res.send("");
});

app.listen("8081");

//exports = module.exports = app;