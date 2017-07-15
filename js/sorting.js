String.prototype.replaceAll = function(str1, str2, ignore){
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

$("button").on("click", function() {
  $('#loader').toggle();
  var internalData = [];
  var userInput = $("input").val();
  var userBoro = $("#boro").val();
  var baseURL = "https://data.cityofnewyork.us/resource/xx67-kt59.json";
  var appToken = "CkMdPHTRlkUB2u1ixJnSUW3Ve";
  var queryString = "?$q=" + userInput + "&boro=" + userBoro + "&$where=grade%20IS%20NOT%20NULL%20&$order=camis DESC, grade_date DESC" + "&$$app_token=" + appToken;


  $.getJSON(baseURL + queryString, function(data) {

    console.log(data);
    console.log(data.length);
    var arraySize = data.length;


    violationDataFilter();

    function violationDataFilter (){
      for (var i = 0; i < arraySize; i++){

        var currentIndex = i;
        var restaurantName = data[i].dba;
        var restaurantId = data[i].camis;
        var grade = data[i].grade;
        var gradeDate = data[i].grade_date;
        var gradeDateParsed = Date.parse(gradeDate);
        var violationDescription = data[i].violation_description;
        var address = (data[i].building + " " + data[i].street + " " + data[i].boro + " " + data[i].zipcode);

        if (i == 0) {
          var latestGradeDate = gradeDate;
          console.log(currentIndex + " " + restaurantName);
          console.log(restaurantId);
          console.log(grade);
          console.log(gradeDate);
          console.log(gradeDateParsed);
          console.log(address);
          console.log(violationDescription);
        };

        if (i !== 0) {
          var previousIndex = i - 1;
          var previousRestaurantId = data[i - 1].camis;
          var previousGradeDate = data[i - 1].grade_date;
          var previousGradeDateParsed = Date.parse(previousGradeDate);
          if (restaurantId == previousRestaurantId && gradeDate == latestGradeDate) {
            console.log(violationDescription);
          } else if (restaurantId != previousRestaurantId){
            latestGradeDate = gradeDate;
            console.log(currentIndex + " " + restaurantName);
            console.log(restaurantId);
            console.log(grade);
            console.log(gradeDate);
            console.log(gradeDateParsed);
            console.log(address);
            console.log(violationDescription); 
          }
        };



        // else if (i > 0){
        //   var previousRestaurantId = data[i - 1].camis;
        //   var previousGradeDate = data[i - 1];

        //   if (restaurantId == previousRestaurantId && gradeDate == previousGradeDate){
        //     console.log(restaurantViolation);
        //     i++;
        //   } 

        //   else {
        //     i++;
        //   };
        // } 

        // else {
        //   i++;
        // };

        

        // for (var i = arraySize; i > 0;) {
        //     
        //     i--
        //   } else {
        //     console.log(restaurantName);
        //     console.log(restaurantId);
        //     console.log(gradeDate);
        //     console.log(address);
        //     console.log(violationDescription);
        //     break;
        //   };
        // };  

        // for (;i < arraySize; i--) {
        //   var previousRestaurantId = data[i - 1].camis;
        //   var previousGradeDate = data[i - 1];
        //   if ((i != 0) && (restaurantId == previousRestaurantId) && (gradeDate == previousGradeDate)) {
        //     console.log(violationDescription);
        //     i--;
        //   } else if ((i = 0) && (restaurantId == previousRestaurantId) && (gradeDate == previousGradeDate)) {
        //     console.log(violationDescription);
        //     break;
        //   }
        // };

        
        // if (i > 0){
        //   var nextRestaurantId = data[i - 1].camis;
        //   console.log(i + "ID: " + restaurantId);

        //   while (restaurantId == nextRestaurantId) {
        //    console.log(restaurantId.gradeDate);
        //    i--;
        //   }

        //   i--;



          // if (restaurantId == nextRestaurantId){
          //   console.log(i + "DATE: " + gradeDate);
          //   console.log(i + violationDescription);
          // }
          // i--;

          // var gradeDateParsed = Date.parse(data[i].grade_date);
          // var restaurantViolation = data[i].violation_description;
          

          // var latestGradeDate = data[0].grade_date;
          // var d = new Date(gradeDate);
          // var n = d.toDateString();


          // if (i > 0){
          //   var nextRestaurantId = data[i - 1].camis;
          //   var nextGradeDate = data[i - 1].grade_date;
          //   var nextGradeDateParsed = Date.parse(data[i - 1].grade_date);
            
          // } else if (i == 0){
          //   console.log(i + "ID: " + restaurantId);
          //   console.log(i + "DATE: " + gradeDate);
          //   console.log("End of line.");
          // }        


        // while (i < internalData[0].length -1){
        //   console.log(i + " " + gradeDate);
        //   console.log(i + " " + restaurantId);
        //   if (nextRestaurantId !== null){
        //     console.log("Next Up...");
        //     console.log(i + 1 + " " + nextGradeDate)
        //     console.log(i + 1 + " " + nextRestaurantId);
        //   } else {
        //     console.log("End of line.");
        //   }
        // }

        // if (checkDate == latestInspectionDate){
        //   var correctedViolationDescription = data[i].violation_description.replaceAll(" Âº", "Âº");
        //   correctedViolationDescription = correctedViolationDescription.replaceAll("Âº ", "Âº");
        //   correctedViolationDescription = correctedViolationDescription.replaceAll("Âº", "°");
        //   correctedViolationDescription = correctedViolationDescription.replaceAll("", "'");
        //   violationData.push(correctedViolationDescription);
        // }
      }
    }

  });
});