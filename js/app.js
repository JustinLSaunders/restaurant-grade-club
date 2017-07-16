String.prototype.replaceAll = function(str1, str2, ignore){
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};

$("button").on("click", function() {
  var resultsContainer = document.getElementById("results-container");

  function clearOldItems(parentElem, childElem){
    var oldResults = document.getElementById(childElem);
    if (oldResults != null) {
      var oldChild = document.getElementById(childElem);
      resultsContainer.removeChild(oldChild)
    };
  };

  clearOldItems(resultsContainer, "returned-info");

  $('#loader').toggle();
  var internalData = [];
  var userInput = $("input").val();
  var userBorough = $("#borough").val();
  var baseURL = "https://data.cityofnewyork.us/resource/xx67-kt59.json";
  var appToken = "CkMdPHTRlkUB2u1ixJnSUW3Ve";
  var queryString = "?$q=" + userInput + "&boro=" + userBorough + "&$where=grade%20IS%20NOT%20NULL%20&$order=camis DESC, grade_date DESC";
    //  + "&$$app_token=" + appToken

  $.getJSON(baseURL + queryString, function(data) {

    console.log(data);
    var arraySize = data.length;

    if (arraySize == 0) {
      var returnedInfo = $('<div>').attr({'id': 'returned-info'});

      // var errorDisplay = $('<p class="error-message">').text("I couldn't find that restaurant. Please double-check your spelling.");

      $('#results-container').append(returnedInfo);
      $('#returned-info').append('<p class="error-message">' + "I COULDN'T FIND THAT RESTAURANT<br>PLEASE DOUBLE-CHECK THE NAME</p>");
    };

    dataFilter();

    function dataFilter  (){
      for (var i = 0; i < arraySize; i++){
        var returnedInfo = $('<div>').attr({'id': 'returned-info'});
        var infoDisplay = $('<div>').attr({'class': 'info-display row', 'id': 'info-display' + i});
        var certificateDisplay = $('<div>').attr({'class': 'certificate-display col-xs-2 col-sm-2', 'id': 'certificate-display' + i});
        var detailsContainer = $('<div>').attr({'class': 'details-container col-xs-10 col-sm-10', 'id': 'details-container' + i});
        var dbaDisplay = $('<div>').attr({'class': 'dba-display col-xs-12', 'id': 'dba-display' + i});
        var addressDisplay = $('<div>').attr({'class': 'address-display col-xs-12', 'id': 'address-display' + i})
        var violationInfo = $('<p>').attr({'id': 'violation' + i});

        var restaurantName = data[i].dba;
        var DOMDba = $('<h2>').text(restaurantName);
        var restaurantId = data[i].camis;
        var violationsDisplay = $('<div>').attr({'class': 'violations-display col-xs-12', 'id': 'violations-display' + restaurantId});
        var grade = data[i].grade;
        var DOMCert = $('<img class="certificate">').attr('src', './img/' + grade + '.png');
        var gradeDate = data[i].grade_date;
        var gradeDateParsed = Date.parse(gradeDate);
        var violationDescription = data[i].violation_description;

        // $('.element span').each(function() {
        //   console.log($(this).text());
        //   var text = $(this).text().replace(' Âº', 'Âº');
        //   $(this).text(text);
        // });

        if (violationDescription != null){
          violationDescription = violationDescription.replaceAll(" Âº", "Âº");
          violationDescription = violationDescription.replaceAll("Âº ", "Âº");
          violationDescription = violationDescription.replaceAll("Âº", "°");
          violationDescription = violationDescription.replaceAll("", "'");
        } else {
          violationDescription = "Woah! No violations!"
        };

        var address = (data[i].building + " " + data[i].street + " " + data[i].boro + " " + data[i].zipcode);
        var DOMAddress = $('<p>').text(address);

        if (i == 0) {
          var latestGradeDate = gradeDate;
          $('#results-container').append(returnedInfo);
          $('#returned-info').append(infoDisplay);
          $('#info-display' + i).append(certificateDisplay)
          $('#certificate-display' + i).append(DOMCert);
          $('#info-display' + i).append(detailsContainer);
          $('#details-container' + i).append(dbaDisplay);
          $('#dba-display' + i).append(DOMDba);
          $('#details-container' + i).append(addressDisplay);
          $('#address-display' + i).append(DOMAddress);
          $('#details-container' + i).append(violationsDisplay);
          $('#violations-display' + restaurantId).append(violationInfo);
          $('#violation' + i).text(violationDescription);
        };

        if (i !== 0) {
          var previousRestaurantId = data[i - 1].camis;
          var previousGradeDate = data[i - 1].grade_date;
          var previousGradeDateParsed = Date.parse(previousGradeDate);
          var previous
          if (restaurantId == previousRestaurantId && gradeDate == latestGradeDate) {
              $('#violations-display' + restaurantId).append(violationInfo);
              $('#violation' + i).text(violationDescription);
          } else if (restaurantId != previousRestaurantId){
            latestGradeDate = gradeDate;
            $('#returned-info').append(infoDisplay);
            $('#info-display' + i).append(certificateDisplay)
            $('#certificate-display' + i).append(DOMCert);
            $('#info-display' + i).append(detailsContainer);
            $('#details-container' + i).append(dbaDisplay);
            $('#dba-display' + i).append(DOMDba);
            $('#details-container' + i).append(addressDisplay);
            $('#address-display' + i).append(DOMAddress);
            $('#details-container' + i).append(violationsDisplay);
            $('#violations-display' + restaurantId).append(violationInfo);
            $('#violation' + i).text(violationDescription);
          }
        }
      }
    }
    $('#loader').toggle();
  });
});



// <div id="info-display row">
//   <div class="certificate-display col-xs-1 col-sm-2">
//     <img src="./img/a.png">
//   </div>
//   <div  class="details-container col-xs-11 col-sm-10">
//     <div class="dba-display col-xs-12">
//       <h2>La La's Diner</h2>
//     </div>
//     <div class="address-display col-xs-12">
//       <p>4017 BROADWAY QUEENS 11103</p>
//     </div>
//     <div class="violations-display col-xs-12">
//       <p>Tobacco use, eating, or drinking from open container in food preparation, food storage or dishwashing area observed.</p>
//       <p>Food not protected from potential source of contamination during storage, preparation, transportation, display or service.</p>
//     </div>
//   </div>
// </div>