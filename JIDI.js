// ==UserScript==
// @name       Jellyneo ItemDatabase Injector JIDI
// @author     d0ub7
// @match      http://www.neopets.com/safetydeposit.phtml*
// @match      http://www.neopets.com/market.phtml?*type=your*
// @match      http://www.neopets.com/market_your.phtml*
// @match      http://www.neopets.com/inventory.phtml*
// @match      http://www.neopets.com/closet.phtml*
// @match      http://www.neopets.com/objects.phtml?type=shop*
// @match      http://www.neopets.com/market.phtml?type=wizard&string=*
// @match      http://www.neopets.com/auctions.phtml?*auction_id=*
// ==/UserScript==


br = "<br>";
var url = "http://items.jellyneo.net/index.php?go=show_items&name=%s&name_type=exact&desc=&cat=0&specialcat=0&status=0&rarity=0&sortby=name&numitems=10";

jQuery.fn.justtext = function() {
    return $(this).clone().children().remove().end().text();
};


function highlight(itemWorth, itemCost, element) {  // set minimum profit / highlight colors here
	var profit = itemWorth - itemCost;
		if (itemCost !== 0  &&  profit > 1000) { 
			var color = "#ffd";
			if (profit > 5000) {
			color = "#66FF33";
				if (profit > 15000) {
				color = "#0000FF";
					if (profit > 30000) {
					color = "#9900FF";
						if (profit > 100000) {
						color = "#f38";
							if (profit > 500000) {
							color = "#FF9900"
						}              
					}
				}
			}
		}
		element.parent().css("background-color", color); 
	}
}

function getWorth(itemName, element, order, itemCost) {
    // Retreives worth of item from JellyNeo Item Database
    // order: 0 before; 1 after
    // itemCost: 0 if not used
	if (itemName !== "") {
        itemName = encodeURIComponent(itemName);
		var theUrl = url.replace("%s", itemName);
		$.ajax({
			url: theUrl,
			dataType: 'text',
			success: function(data) {
				var elements = $("<div>").html(data)[0].getElementsByTagName("a");
				for(var i = 0; i < elements.length; i++) {
					var theText = elements[i].firstChild.nodeValue;
					if (theText !== null && typeof theText === 'string' && !isNaN(+theText.charAt(0)) && theText.indexOf("NP") > -1) {
						var itemWorth = theText.match(/([0-9,\,]*) NP/)[1].replace(/,/g, '');
                        if(document.URL.indexOf("objects.phtml?type=shop") != -1) {
                            highlight(itemWorth, itemCost, element);                        
                        }else{
                            theText = theText.bold();
						    if (order === 0) {element.before(theText + br);}
						    else {element.after(br + theText);}
                        }

					}
				}
			}
		});
	}
}

// Inventory
if(document.URL.indexOf("inventory") != -1) {
    $("img[src*='/items/']").each(function(k,v) {
        var itemName = $(v).parent().parent().justtext();
		getWorth(itemName, $(v).parent(), 1, 0);
    });
}

// Main Shops
if(document.URL.indexOf("objects.phtml?type=shop") != -1) {
    var counter = 1;
    var itemCost, itemName;
    $("img[src*='/items/']").parent().parent().find("b").andSelf().each(function(k,v) {
        itemName = $(v).justtext();
        if(counter%2 !== 0) { // line is  cost
            itemCost = itemName.match(/Cost: ([0-9,\,]*)/)[1].replace(/,/g, '');
        }
        else {         // line is name
            getWorth(itemName, $(v), 0, itemCost); 
        }
        counter = counter+1;
        
	});
}	

// SDB & Closet
if(document.URL.indexOf("safetydeposit") != -1 || document.URL.indexOf("closet") != -1) {
    $("img[src*='/items/']").each(function(k,v) {
        var itemName = $(v).parent().parent().find("td").eq(1).find("b").eq(0).justtext();
		getWorth(itemName, $(v), 1, 0);
    });
}

// Auctions
if(document.URL.indexOf("auction_id") != -1) {
    var nameb = $("b:contains('owned by')");
    var itemName = nameb.html();
    itemName = itemName.substr(0, itemName.indexOf(" (own")); // remove "owned by..."
    getWorth(itemName, nameb, 0, 0);
}
