
$(document).ready(function() {

	$("#search-bar").on("keydown", function(e) {
		if(e.keyCode == 13) {
			getSearchResult();
		}
	});


	$("#clear-search").on("click",function(e){
		clearSearchResult();
	});

	function clearSearchResult() {
		$.ajax({
			url: "http://localhost:8081/clear",
			type: "DELETE",
			success: function(res) {
				$("#results").empty();
			}
		});
	}

	function getSearchResult() {
		var searchTerm = document.getElementById("search-bar").value;

		$.ajax({
			url: "http://localhost:8081/scrape?" + searchTerm,
			type: "GET",
			success: function(results) {
				var str = '';
				for (var i=0; i<results.length; i++) {
					var res = results[i];
					str += '<div>'
							+'<a href="'+res.link+'">'+res.name+'</a>'
							+'<p>'+ res.source +'</p>'
							+'</div>';
				}
				$('#results').html(str);
			}
		});
	}
})
