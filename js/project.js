String.prototype.replaceAll = function(str1, str2, ignore){
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

$("button").on("click", function() {
  var violationData = [];
  var userInput = $("input").val();
  var userBoro = $("#boro").val();
  var violationsContainer = document.getElementById("violations-display");
  var dbaContainer = document.getElementById("dba-container");
  var certContainer = document.getElementById("certificate-display");
  var baseURL = "https://data.cityofnewyork.us/resource/xx67-kt59.json";
  var queryString = "?$q=" + userInput + "&boro=" + userBoro + "&$where=grade%20IS%20NOT%20NULL%20&$order=grade_date";

  function oldItems(childElem, parentElem){
    var getOldItems = document.getElementById(childElem);
    if (getOldItems != null) {
      var oldChild = document.getElementById(childElem);
      parentElem.removeChild(oldChild)
    };
  };

  function newItems(parentElem, newElemType, idName){
    var newElem = document.createElement(newElemType);
    newElem.setAttribute("id", idName);
    parentElem.appendChild(newElem);
  };

  oldItems("dba-name", dbaContainer);
  oldItems("certificate", certContainer);
  oldItems("violations-list", violationsContainer);

  newItems(dbaContainer, "h2", "dba-name");
  newItems(certContainer, "img", "certificate");
  newItems(violationsContainer, "ul", "violations-list")

  // https://data.cityofnewyork.us/resource/xx67-kt59.json?$q" + userInput + "&boro=" + userBoro + "&$where=grade%20IS%20NOT%20NULL%20&$limit=5&$offset=20" //Consider how to use this for pagination (JS 20170614)

  $.getJSON(baseURL + queryString, function(data) {

    // The below two functions are old, using the underscore library. They can probably be removed soon (JS 20170614)

    // var withGrades = _.filter(data, function(restaurant) {
    //   return restaurant.grade;
    // });

    // var dateSorted = _.sortBy(data, function(restaurant) {
    //   return new Date(restaurant.grade_date)
    // });

    // console.log(data);

    var lastSortedIndex = data.length - 1;
    var latestInspectionDate = Date.parse(data[lastSortedIndex].grade_date);

    // console.log(lastSortedIndex);
    // console.log(latestInspectionDate);

    function violationsDataPush (){
      for (i = lastSortedIndex; i >= 0; i--){
        var checkDate = Date.parse(data[i].grade_date);
        if (checkDate == latestInspectionDate){
          var correctedViolationDescription = data[i].violation_description.replaceAll(" Âº", "Âº");
          correctedViolationDescription = correctedViolationDescription.replaceAll("Âº ", "Âº");
          correctedViolationDescription = correctedViolationDescription.replaceAll("Âº", "°");
          correctedViolationDescription = correctedViolationDescription.replaceAll("", "'");
          violationData.push(correctedViolationDescription);
        }
      };
    }
    violationsDataPush();
    // console.log(violationData);

    $("h2#dba-name").text(data[lastSortedIndex].dba);

    certContainer

    $("img#certificate").attr("src", "./img/" + data[lastSortedIndex].grade + ".png");

    if (data[lastSortedIndex].grade = "Z") {
      $("img#certificate").attr("alt", "NYC sanitation grade pending.");
    } else {$("img#certificate").attr("alt", "NYC Sanitation Grade " + data[lastSortedIndex].grade);};

    function violationsDislpay(){
      var loopEnd = violationData.length;
      for (i = 0; i < loopEnd; i++){
        var violationsList = document.getElementById("violations-list");
        var violationsItem = document.createElement("li");
        violationsItem.setAttribute("class", "violation");
        violationsList.appendChild(violationsItem);
        // console.log(violationData[i]);
        var violationText = document.createTextNode(violationData[i]);
        violationsItem.appendChild(violationText);
      }
    }

    violationsDislpay();

  });
});