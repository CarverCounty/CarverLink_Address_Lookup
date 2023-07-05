function readDataFile(){
	console.log("readDataFile");	
	var file = new XMLHttpRequest();
    file.onreadystatechange = function() {
      if (file.readyState === 4) { // Makes sure the document is ready to parse
        if (file.status === 200) { // Makes sure it's found the file
          var text = file.responseText;
		  var addressList = procesDataFile(text);
		  populateControls(addressList);
		  return addressList;
        }
      }	
    }
	file.open("GET", "data/addy_20230622.csv", true);
	file.send()
}

 
function procesDataFile(inText){
	console.log("procesDataFile");
	var rows = inText.split(/\n/);
	//var items = []
	var tmpAddressList = [];
	var tmpAddressDict = {}
	
	addressDict = {} //This is a dictionary of addresses with all other info
	var step=false;
	
	var dirList = new Array("north","south","east","west","northeast","southeast","northwest","southwest","n","s","e","w","ne","nw","se","sw");
		
		for (var rowIndex = 0; rowIndex < rows.length; ++rowIndex){ 
			var iRow = rows[rowIndex];
			var siteAddress =  iRow.split(",")[0]
			var iCity = iRow.split(",")[1]
			var thisAddy = siteAddress+", "+iCity;
			if (thisAddy.includes("undefined")){
				continue;
			}
			var showDBG = (thisAddy=="304 4th Street Northeast, Mayer");
			
			var thisX = iRow.split(",")[3]
			var thisY = iRow.split(",")[2]
			var thisZone = iRow.split(",")[4]
			
			tmpAddressList.push(thisAddy);
			addressDict[thisAddy] = {"x":thisX, "y":thisY, "zone":thisZone};
			var tempDict
			for (var dirIndex = 0; dirIndex < dirList.length; ++dirIndex){
				var iDir = " "+dirList[dirIndex].toLowerCase()+",";

				if ((siteAddress.toLowerCase()+",").includes(iDir)){
					var iSiteAddress =iRow.split(",")[0];
					var iWordArray = iSiteAddress.split(" ");
					var newAddy = iWordArray[0];
					var newAbrevAddy = iWordArray[0];
					
					if (iSiteAddress.split(" ")[1] == "1/2"){
						newAddy+=" 1/2 "+ iWordArray[iWordArray.length - 1];
						newAbrevAddy += " 1/2 "+iWordArray[iWordArray.length - 1].toLowerCase().replace("northeast","NE").replace("northwest","NW").replace("southeast","SE").replace("southwest","SW").replace("north","N").replace("west","W").replace("east","E").replace("south","S");
						for (var wordIndex = 2; wordIndex < iWordArray.length - 1; ++wordIndex){
							newAddy += " " +iWordArray[wordIndex];
							newAbrevAddy += " " +iWordArray[wordIndex];
						}       
					} else {
						for (var wordIndex = 1; wordIndex < iRow.split(" ").length - 1; ++wordIndex){
							if (wordIndex==1){
							   newAddy += " " + iWordArray[iWordArray.length - 1]+" "+iWordArray[1];
							   newAbrevAddy += " "+iWordArray[iWordArray.length - 1].toLowerCase().replace("northeast","NE").replace("northwest","NW").replace("southeast","SE").replace("southwest","SW").replace("north","N").replace("west","W").replace("east","E").replace("south","S")+" "+iWordArray[1];
							} else {
							   newAddy += " " +iWordArray[wordIndex];
							   newAbrevAddy += " " +iWordArray[wordIndex];
							}
						}
					}
						
						

					var newSiteAddress = newAddy+", "+ iCity;
					var newAbrevSiteAddress = newAbrevAddy+", "+ iCity;
					
											if (showDBG){
							console.log(thisAddy);
							console.log(newSiteAddress);
							console.log(newAbrevSiteAddress);
						}
						
					addressDict[newAddy] = {"x":thisX, "y":thisY, "zone":thisZone};
					addressDict[newSiteAddress] = {"x":thisX, "y":thisY, "zone":thisZone};
					addressDict[newAbrevSiteAddress] = {"x":thisX, "y":thisY, "zone":thisZone};
					tmpAddressList.push(newSiteAddress);
					tmpAddressList.push(newAbrevSiteAddress);
				}
			}
		}
	
	var addressList = [];
	tmpAddressList.sort();
	for (var dirIndex = 0; dirIndex < tmpAddressList.length; ++dirIndex){
		var thisAddy = tmpAddressList[dirIndex];
		addressList.push({name:thisAddy, id:thisAddy});
	}
	return addressList;
}

function populateControls(inDataList){
       dojo.require("dojo.parser");
       dojo.require("dijit.form.ComboBox");
       dojo.require("dojo.store.Memory");
       // dojo.require("dojox.validate._base");
       dojo.require("dijit.form.Form");
	   dojo.require("dijit.form.FilteringSelect");
	
       var myBox, myForm, mainStore, altStore, test;
       test = false;

       dojo.ready(function(){
		   console.log("BUILD");
           buildForm();	
       });


       function buildForm(){
		       var stateStore2 = new dojo.store.Memory({
        data: inDataList
    });
	
    dojo.ready(function(){
        var filteringSelect = new dijit.form.FilteringSelect({
            id: "stateSelect",
            name: "state",
            value: "",
            store: stateStore2,
            searchAttr: "name",
			placeholder:"Enter an Address"
        }, "stateSelect");
		

		   filteringSelect.on("KeyPress", function(){
			   console.log("KeyPress");
           });

		filteringSelect.validator = function() {
			this.set("invalidMessage","Thissss is not done");
			return true;
		   if(this.value.indexOf("Hidden")>-1) {
			 this.set("invalidMessage",this.value+" is not allowed!");
			 return false;
		   }
		   return true;
		}
		   
		   
		document.querySelector("#stateSelect").focus();
		    filteringSelect.on("Change", function(){
			   console.log("Change");
			   console.log(dojo.byId("stateSelect").value);
			   document.getElementById("map").classList.remove('hide');
			   document.getElementById("map").classList.add('show');
			   var t = addressDict[dojo.byId("stateSelect").value];
			   console.log(t);
			   theX = t["x"]
			   theY = t["y"]
			   theZone = t["zone"]
			   map.panTo({lng:theX, lat:theY});


			   var carverIcon = L.icon({
    iconUrl: 'img/CCMarker.png',

    iconSize:     [40, 60], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

document.querySelector("#gg").innerHTML = dojo.byId("stateSelect").value;
document.querySelector("#messy").innerHTML = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Arcu non odio euismod lacinia at quis risus. Ac tortor dignissim convallis aenean et tortor at risus. Purus semper eget duis at tellus at urna condimentum. Justo laoreet sit amet cursus sit. Dictum fusce ut placerat orci nulla pellentesque. Volutpat blandit aliquam etiam erat. Amet nisl suscipit adipiscing bibendum est ultricies integer quis. In nulla posuere sollicitudin aliquam ultrices sagittis orci. Quam quisque id diam vel quam elementum pulvinar. Adipiscing vitae proin sagittis nisl rhoncus mattis rhoncus urna. Euismod lacinia at quis risus. Mattis nunc sed blandit libero volutpat sed cras. Nulla pharetra diam sit amet nisl suscipit adipiscing bibendum est. Fringilla ut morbi tincidunt augue interdum velit. Eleifend donec pretium vulputate sapien nec sagittis aliquam. Eu volutpat odio facilisis mauris sit.";
document.querySelector("#serviceAlert").setAttribute("open",true)
z = L.marker([theY, theX], {icon: carverIcon})
z.addTo(map);
           });
    });
	   }
  };
 

readDataFile();	

