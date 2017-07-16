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
  var queryString = "?$q=" + userInput + "&boro=" + userBorough + "&$where=grade%20IS%20NOT%20NULL%20&$order=camis DESC, grade_date DESC"; //!+ "&$$app_token=" + appToken

  $.getJSON(baseURL + queryString, function(data) {

    console.log(data);
    var arraySize = data.length;
    violationDataFilter();

    if (arraySize == 0) {
      console.log("Please check your spelling.");
    }

    function violationDataFilter  (){
      for (var i = 0; i < arraySize; i++){
        var restaurantName = data[i].dba;
        var restaurantId = data[i].camis;
        var grade = data[i].grade;
        var gradeDate = data[i].grade_date;
        var gradeDateParsed = Date.parse(gradeDate);
        var violationDescription = data[i].violation_description;
        var address = (data[i].building + " " + data[i].street + " " + data[i].boro + " " + data[i].zipcode);

        if (i == 0) {
          var latestGradeDate = gradeDate;
          console.log(i + " " + restaurantName);
          console.log(restaurantId);
          console.log(grade);
          console.log(gradeDate);
          console.log(gradeDateParsed);
          console.log(address);
          console.log(violationDescription);
        };

        if (i !== 0) {
          var previousRestaurantId = data[i - 1].camis;
          var previousGradeDate = data[i - 1].grade_date;
          var previousGradeDateParsed = Date.parse(previousGradeDate);
          if (restaurantId == previousRestaurantId && gradeDate == latestGradeDate) {
            console.log(violationDescription);
          } else if (restaurantId != previousRestaurantId){
            latestGradeDate = gradeDate;
            console.log(i + " " + restaurantName);
            console.log(restaurantId);
            console.log(grade);
            console.log(gradeDate);
            console.log(gradeDateParsed);
            console.log(address);
            console.log(violationDescription); 
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