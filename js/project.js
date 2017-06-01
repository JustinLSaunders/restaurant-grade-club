function replaceText(open, replacement, span) {
  var str = document.getElementById(span).innerHTML; 
  var res = str.replace(open, replacement);
  document.getElementById(span).innerHTML = res;
};

$("button").on("click", function() {
  var userInput = $("input").val();
  var userBoro = $("#boro").val();

  $.getJSON("https://data.cityofnewyork.us/resource/9w7m-hzhe.json?$q=" + userInput + "&boro=" + userBoro, function(data) {

    var withGrades = _.filter(data, function(restaurant) {
      return restaurant["grade"];
    });

    var dateSorted = _.sortBy(withGrades, function(restaurant) {
      return new Date(restaurant["grade_date"])
    });

    console.log(dateSorted);

    var lastSortedIndex = dateSorted.length - 1;

    console.log(lastSortedIndex);

    $("span#dba-name").text(dateSorted[lastSortedIndex]["dba"]);

    $("span#violations").text(dateSorted[lastSortedIndex]["violation_description"]);

    $("img.certificate").attr("src", "./img/" + dateSorted[lastSortedIndex]["grade"] + ".png");

    $("img.certificate").attr("alt", "NYC Sanitation Grade " + dateSorted[lastSortedIndex]["grade"]);

    window.onload = replaceText("Âº", "°", "violations");
    window.onload = replaceText("", "'", "violations");
    // document.createElement(“tagtype”)
    // document.createTextNode(“this is my text content”) 

  });
});