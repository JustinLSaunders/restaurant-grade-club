String.prototype.replaceAll = function(str1, str2, ignore){
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};

$("#user-input").keyup(function(event){
    if(event.keyCode == 13){
      this.blur();
      $("#search-btn").click();
    }
});

offsetValue = 0;
$("#search-btn").on("click", function() {
  offsetValue = 0;
  queryNycDoh(offsetValue);
  $('#results-container').toggle();
});
$("#next-btn").on("click", function() {
    offsetValue = offsetValue + 5;
    console.log("---------- next ----------" + offsetValue);
    queryNycDoh(offsetValue);
});
$("#previous-btn").on("click", function() {
    offsetValue = offsetValue - 5;
    console.log("---------- previous ----------" + offsetValue);
    queryNycDoh(offsetValue);
});
function queryNycDoh(offset){
  var listHtml = [];
  var resultsContainer = document.getElementById("results-container");

  function clearOldItems(parentElem, childElem){
      var oldResults = document.getElementById(childElem);
      if (oldResults != null) {
          var oldChild = document.getElementById(childElem);
          parentElem.removeChild(oldChild)
      }
  }

  clearOldItems(resultsContainer, "returned-info");

  $('#loading').toggle();

  var userInput = $("input").val().toUpperCase();
  var userBorough = $("#borough").val();
  var baseURL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json";
  var queryString = "?$where=dba like '%25" + userInput + "%25'";
  //var queryString = "?$$app_token=" + NYCToken + "&$q=" + userInput + "&boro=" + userBorough + "&$where=grade%20IS%20NOT%20NULL%20&$order=camis DESC, grade_date DESC";
  var testQueryString = "?$where=upper(dba) like '%25" + userInput + "%25'&$order=camis ASC &$select=camis,MAX(inspection_date)&$group=camis&$limit=5&$offset=" + offset;
  $.getJSON(baseURL + testQueryString, function(data, jqXHR) {
    console.log(data);
    $(data).each(function(){
        var refinedQueryString = "?&camis='" + this.camis + "'&inspection_date='" + this.MAX_inspection_date + "'&$order=camis ASC";
        $.getJSON(baseURL + refinedQueryString, function(result){
            console.log(result[0].grade);
            console.log(result[0].dba);
            console.log(result[0].camis);
            console.log(result[0].building + " " + result[0].street + ", " + result[0].boro + " " + result[0].zipcode);
            if (result[0].grade == undefined) {
                var certificateCard = "Z";
            } else { certificateCard = result[0].grade;}

            var grade = '<div class="certificate-display col-xs-2"><img class="certificate" src="./img/' + certificateCard + '.png"></div>';
            var name = "<h2>" + result[0].dba.replaceAll("/", " / ").replaceAll("Â¢", "¢") + "</h2>";
            var address = "<p>" + result[0].building + " " + result[0].street + ", " + result[0].boro + " " + result[0].zipcode + "</p>";
            $('#results-container').append('<div id="'+result[0].camis+ '" class="info-display row"></div>');
            $('#results-container > div:last-child').append(grade).append("<div class='details-container col-xs-10'></div>");
            $('#results-container > div:last-child > .details-container').append([name, address]).append("<ul>");

            $(result).each(function(){
                if (this.violation_description !== undefined){
                    violationClean = this.violation_description.replaceAll(" Âº", "Âº").replaceAll("Âº ", "Âº").replaceAll("Âº", "°").replaceAll("", "'").replaceAll("''''", "'")
                } else {violationClean = "No violation description listed"}
                var violation = "<li>" + violationClean + "</li>";
                $('#results-container > div:last-child > .details-container > ul').append(violation);
            });
        });
    });
    $('#loading').toggle();
    console.log(listHtml);
    $(listHtml).each(function(){
      console.log("listHtml " + this.rname);
    });
  });

  // if (userBorough !== ""){
  //     queryString = queryString + "&boro=" + userBorough;
  // }
  // var sortParams = "&$order=dba ASC, inspection_date DESC";
  // queryString = queryString + sortParams;

  //https://data.cityofnewyork.us/resource/43nn-pn8j.json?$where=dba%20like%20%27%BURGER%25%27&$select=camis,MAX(inspection_date)&$group=camis
  //https://data.cityofnewyork.us/resource/43nn-pn8j.json?$where=dba%20like%20%27%SANFORD%25%27%26inspection_date=2018-08-23T00:00:00.000

  // For future Google Maps integration
  // var googleQuery = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + googleAPIKey;


  // $.getJSON(baseURL + queryString, function(data) {
  //   console.log(data);
  //     var arraySize = data.length;
  //
  //     if ((arraySize == 0) || (userInput.includes(";")) || (userInput === "")) {
  //         var returnedInfo = $('<div>').attr({'id': 'returned-info'});
  //
  //         $('#results-container').append(returnedInfo);
  //
  //         $('#returned-info').append('<p class="error-message">' + "I COULDN'T FIND THAT RESTAURANT.<br>PLEASE DOUBLE-CHECK THE NAME OR BOROUGH.</p>");
  //     } else {dataFilter()}
  //
  //     function dataFilter() {
  //         for (var i = 0; i < arraySize; i++){
  //             var returnedInfo = $('<div>').attr({'id': 'returned-info'});
  //             var infoDisplay = $('<div>').attr({'class': 'info-display row', 'id': 'info-display' + i});
  //             var dbaDisplay = $('<div>').attr({'class': 'dba-display', 'id': 'dba-display' + i});
  //             var addressDisplay = $('<div>').attr({'class': 'address-display', 'id': 'address-display' + i});
  //             var certificateDisplay = $('<div>').attr({'class': 'certificate-display col-xs-2 col-xs-pull-10', 'id': 'certificate-display' + i});
  //             var detailsContainer = $('<div>').attr({'class': 'details-container col-xs-10 col-xs-push-2', 'id': 'details-container' + i});
  //             var violationInfo = $('<p>').attr({'id': 'violation' + i});
  //             var restaurantName = data[i].dba;
  //             restaurantName = restaurantName.replaceAll("/", " / ");
  //             restaurantName = restaurantName.replaceAll("Â¢", "¢");
  //             var DOMDba = $('<h2>').text(restaurantName);
  //             var restaurantId = data[i].camis;
  //             var violationsDisplay = $('<div>').attr({'class': 'violations-display', 'id': 'violations-display' + restaurantId});
  //             var grade = data[i].grade;
  //
  //             if ((grade === "Z") || (grade ===  "P")){
  //                 var altTag = "NYC Sanitation Grade Pending"
  //             } else {
  //                 var altTag = "NYC Sanitation Grade " + grade
  //             };
  //
  //             //var DOMCert = $('<img class="certificate">').attr({'src': './img/' + grade + '.png', 'alt': altTag});
  //             console.log("restaurant id = " + restaurantId);
  //             if (grade !== undefined) {
  //                 var DOMCert = '<img class="certificate" src="./img/' + grade + '.png" alt="' + altTag + '">';
  //             } else {
  //                 DOMCert = '<img class="certificate" src="./img/P.png" alt="Grade Pending">';
  //             }
  //             var inspectionDate = data[i].inspection_date;
  //             //var inspectionDateParsed = Date.parse(inspectionDate);
  //             var violationDescription = data[i].violation_description;
  //             var address = (data[i].building + " " + data[i].street + ", " + data[i].boro + " " + data[i].zipcode);
  //             var DOMAddress = $('<p>').text(address);
  //
  //             function DOMPaint(){
  //                 $('#returned-info').append(infoDisplay);
  //                 $('#info-display' + i).append(detailsContainer).append(certificateDisplay);
  //                 $('#details-container' + i).append(dbaDisplay).append(addressDisplay).append(violationsDisplay);
  //                 $('#dba-display' + i).append(DOMDba);
  //                 $('#address-display' + i).append(DOMAddress);
  //                 $('#certificate-display' + i).append(DOMCert);
  //                 $('#violations-display' + restaurantId).append(violationInfo);
  //                 $('#violation' + i).text(violationDescription);
  //             }
  //
  //             // DOH data has a lot of odd characters in their violation descriptions. This resolves those into client-readable characters.
  //             if (violationDescription != null){
  //                 violationDescription = violationDescription.replaceAll(" Âº", "Âº");
  //                 violationDescription = violationDescription.replaceAll("Âº ", "Âº");
  //                 violationDescription = violationDescription.replaceAll("Âº", "°");
  //                 violationDescription = violationDescription.replaceAll("", "'");
  //                 violationDescription = violationDescription.replaceAll("''''", "'");
  //             } else {
  //                 violationDescription = ""
  //             }
  //
  //             if (i == 0) {
  //                 var latestInspectionDate = inspectionDate;
  //                 $('#results-container').append(returnedInfo);
  //                 DOMPaint();
  //             }
  //
  //             if (i !== 0) {
  //                 var previousRestaurantId = data[i - 1].camis;
  //                 //var previousInspectionDate = data[i - 1].inspection_date;
  //                 //var previousGradeDateParsed = Date.parse(previousGradeDate);
  //                 if (restaurantId == previousRestaurantId && inspectionDate == latestInspectionDate) {
  //                     $('#violations-display' + restaurantId).append(violationInfo);
  //                     $('#violation' + i).text(violationDescription);
  //                 } else if (restaurantId != previousRestaurantId){
  //                     latestInspectionDate = inspectionDate;
  //                     DOMPaint();
  //                 }
  //             }
  //         }
  //     }
  //     $('#loading').toggle();
  // });
}