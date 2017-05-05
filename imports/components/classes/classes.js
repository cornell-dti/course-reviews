import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Classes } from '../../api/classes.js';
import { Reviews } from '../../api/classes.js';
import gauges from 'angularjs-gauge';
import template from './classes.html';
 
class ClassCtrl {
  constructor($scope) {
    $scope.viewModel(this);

    //hold currently clicked class for the data on the side view 
    this.selectedClass = {};
    this.isClassSelected = false;

    //hold data inputed by user in the add review form
    this.newReview = {
      text: null,
      diff: null,
      quality: null,
      medGrade: null,
      atten: null
    }

    //holds search query
    this.query = "";

    this.isHome = true;

    //gauge options https://ashish-chopra.github.io/angular-gauge/
    this.qual = 0;
    this.diff =0;
    this.grade = "-";

    //when the query variable changes, update the list of classes returned by the database
    this.subscribe('classes', () => [this.getReactively('query')]);

    //when a new class is selected, update the reviews that are returned by the database and update the gauges
    this.subscribe('reviews', () => [(this.getReactively('selectedClass'))._id, 1], {
      //callback function, should only run once the reveiws collection updates, BUT ISNT 
      //seems to be combining the previously clicked class's reviews into the collection
      onReady: function() {
        console.log("class is: ", this.selectedClass);
        if (this.isClassSelected == true) { //will later need to check that the side window is open
          //create initial variables
          var countGrade = 0;
          var countDiff = 0;
          var countQual = 0;
          var count = 0;

          //table to translate grades from numerical value
          var gradeTranslation = ["C-", "C", "C+", "B-", "B", "B-", "A-", "A", "A+"];

          //get all current reviews, which will now have only this class's reviews because of the subscribe.
          var allReviews = Reviews.find({});
          console.log(allReviews.fetch()); 
          console.log("len is " + allReviews.fetch().length)
          if (allReviews.fetch().length != 0) {
            console.log("exist")
            allReviews.forEach(function(review) {
              count++;
              countGrade = countGrade + Number(review["grade"]);
              countDiff = countDiff + review["difficulty"];
              countQual = countQual + review["quality"];
            });

            this.qual = (countQual/count).toFixed(1);
            this.diff = (countDiff/count).toFixed(1);
            this.grade = gradeTranslation[Math.floor(countGrade/count) - 1];
          } else {
            console.log("first else");
            this.qual = 0;
            this.diff = 0;
            this.grade = "-";
          }
        } else {
          console.log("second else");
            this.qual = 0;
            this.diff = 0;
            this.grade = "-";
        } 
      } 
    })

    this.helpers({
      classes() {
        return Classes.find({}, {limit: 20});
      },
      reviews() {
        return Reviews.find({});
      }        
    });
  }
  // Insert a new review to the collection. NO SECURITY
  addReview(review, classId) {
    console.log(review);
    console.log(classId);
    if (review.text != null && review.diff != null && review.quality != null && review.medGrade != null && classId != undefined && classId != null) {
      Reviews.insert({
        text: review.text,
        difficulty: review.diff,
        quality: review.quality,
        class: classId,
        grade: review.medGrade,
        date: new Date(),
        visible: 0
      });

      //clear the review 
      this.newReview = {
        text: null,
        diff: null,
        quality: null,
        medGrade: null,
        atten: null
      }
    }
  }

  diffColor(value) {
    var col = ["#53B227","#53B227", "#A0D53F", "#FF9E00", "#E64458"]
    return {'background-color': col[value -1 ]};
  }

  qualColor(value) {
    var col = ["#E64458", "#E64458", "#FF9E00", "#A0D53F", "#53B227"]
    return {'background-color': col[value -1 ]};
  }
}
 
export default angular.module('classes', [
  angularMeteor
])
  .component('classes', {
    templateUrl: 'imports/components/classes/classes.html',
    controller: ['$scope', ClassCtrl]
  });