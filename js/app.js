String.prototype.replaceAll = function(str1, str2, ignore){
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};

$("#user-input").keyup(function(event){
    if(event.keyCode == 13){
      this.blur();
      $("#search-btn").click();
    }
});

$("#search-btn").on("click", function() {
  queryDoh(0);

});
function queryDoh(offset){
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
  var NYCToken = "CkMdPHTRlkUB2u1ixJnSUW3Ve";
  var queryString = "?$where=dba like '%25" + userInput + "%25'";
  //var queryString = "?$$app_token=" + NYCToken + "&$q=" + userInput + "&boro=" + userBorough + "&$where=grade%20IS%20NOT%20NULL%20&$order=camis DESC, grade_date DESC";
  var testQueryString = "?$where=dba like '%25" + userInput + "%25'&$select=camis,MAX(inspection_date)&$group=camis&$limit=10&$offset=0";

  $.getJSON(baseURL + testQueryString, function(data) {
    console.log(data);
    var refinedQueryString = "?&camis='" + data[0].camis + "'&inspection_date='" + data[0].MAX_inspection_date + "'";
      $.getJSON(baseURL + refinedQueryString, function(result){
        $(result).each(function(){
          console.log(this.violation_description);
        });
        console.log(result);
      });
  });

  if (userBorough !== ""){
      queryString = queryString + "&boro=" + userBorough;
  }
  var sortParams = "&$order=dba ASC, inspection_date DESC";
  queryString = queryString + sortParams;

  //https://data.cityofnewyork.us/resource/43nn-pn8j.json?$where=dba%20like%20%27%BURGER%25%27&$select=camis,MAX(inspection_date)&$group=camis
  //https://data.cityofnewyork.us/resource/43nn-pn8j.json?$where=dba%20like%20%27%SANFORD%25%27%26inspection_date=2018-08-23T00:00:00.000

  // For future Google Maps integration
  // var googleQuery = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=" + googleAPIKey;

  // var googleAPIKey = "AIzaSyCkT_MpiCk_-b4rn_gNGplZsc8gUKawVaM";
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