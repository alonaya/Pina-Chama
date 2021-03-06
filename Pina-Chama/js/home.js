var userInfo = {
	userId:'',
	fullName:'',
	email:'',
	userType:''
};

var state = '';

var myApp = angular.module('myApp', ['ngRoute']);

myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {
	$("#homeHeader").hide();
	$("#homeHeader").prop('style').visibility = 'hidden';
	
	var signinCallback = function(authResult) {
		if (authResult['status']['signed_in']) {
			// Update the app to reflect a signed in user
			// Hide the sign-in button now that the user is authorized, for example:
			if (authResult['status']['method'] == 'PROMPT') {
				gapi.client.load('plus','v1', function(){
					var request = gapi.client.plus.people.get({
						'userId': 'me'
					});

					request.execute(function(resp) {
						state = 'signin';
						userInfo.email = resp.emails[0].value;
						userInfo.userId = resp.id;
						document.cookie = "user_id="+resp.id;
						
						$.ajax({
							url:'/',
							type:'GET',
							dataType:'text',
							data:{email:userInfo.email},
							success:function(data, status, xhr) {
								if(state === 'signin'){
									$http.put('/register/' + userInfo.userId, userInfo).success(function(response) {
										if(response === null){
											swal({
												title: 'לא ניתן להתחבר',
												text:
													'המשתמש אינו רשום במערכת, יש להירשם תחילה',
												showCloseButton: true
											});
											//swal("לא ניתן להתחבר", "המשתמש אינו רשום במערכת, יש להירשם תחילה:\n", "error");
										}else{
											userInfo.fullName = response.firstName + ' ' + response.lastName;
											redirection(response.userType);
										}
									});
								}
							},
							error:function(xhr, status, error) {
								swal({
									title: "שגיאה!",
									text: "משהו השתבש!",
									type: "error",
									confirmButtonText: "אישור"
								});
								console.error(xhr, status, error);
							}
						});
					});
				});
			}
		} else {
			// Update the app to reflect a signed out user
			// Possible error values:
			//   "user_signed_out" - User is signed-out
			//   "access_denied" - User denied access to your app
			//   "immediate_failed" - Could not automatically log in the user
			console.log('Sign-in state: ' + authResult['error']);
		}
	};
	
	var signupCallback = function(authResult) {
		if (authResult['status']['signed_in']) {
			// Update the app to reflect a signed in user
			// Hide the sign-in button now that the user is authorized, for example:
			if (authResult['status']['method'] == 'PROMPT') {
				gapi.client.load('plus','v1', function(){
					var request = gapi.client.plus.people.get({
						'userId': 'me'
					});

					request.execute(function(resp) {
						state = 'signup';
						userInfo.email = resp.emails[0].value;
						userInfo.userId = resp.id;
						document.cookie = "user_id="+resp.id;
						
						$.ajax({
							url:'/',
							type:'GET',
							dataType:'text',
							data:{email:userInfo.email},
							success:function(data, status, xhr) {
								if(state === 'signup'){
									$http.put('/register/' + userInfo.userId + '/' + userInfo.email, userInfo).success(function(response) {
										if(response === null){
											window.location.replace("#/register");
										}else{
											swal({
												title: 'לא ניתן להירשם',
												text:
													'אתה כבר רשום עם המשתמש הזה עם השם:\n' +
													response.firstName + ' ' + response.lastName,
												showCloseButton: true
											});
											//swal("לא ניתן להירשם", "אתה כבר רשום עם המשתמש הזה עם השם:\n" + response.firstName + " " + response.lastName, "error");
										}
									});
								}
							},
							error:function(xhr, status, error) {
								swal({
									title: "שגיאה!",
									text: "משהו השתבש!",
									type: "error",
									confirmButtonText: "אישור"
								});
								console.error(xhr, status, error);
							}
						});
					});
				});
			}
		} else {
			// Update the app to reflect a signed out user
			// Possible error values:
			//   "user_signed_out" - User is signed-out
			//   "access_denied" - User denied access to your app
			//   "immediate_failed" - Could not automatically log in the user
			console.log('Sign-in state: ' + authResult['error']);
		}
	};
	
	var additionalParamsSignIn = {
		'callback': signinCallback
	};
	
	var additionalParamsSignUp = {
		'callback': signupCallback
	};
	
	$scope.register = function() {
		gapi.auth.signIn(additionalParamsSignUp);
	};
	
	$scope.signIn = function() {
		gapi.auth.signIn(additionalParamsSignIn);
	};
}]);﻿


myApp.controller('footerContreoller', ['$scope', '$http', function($scope, $http) {
	$scope.signOut = function() {
		document.location.href = "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://pina-chama.azurewebsites.net/";
	};
}]);﻿

myApp.controller('registerCotroller', ['$scope', '$http', function($scope, $http) {
	$scope.user = {
		userType:'manager',
		email:userInfo.email
	};
	
	$scope.required = {
		firstName: true,
		lastName: true,
		id: true,
		addCity: true,
		addStreet: true,
		addApartment: true,
		phoneNumber: true,
		dateOfBirth: true,
		email: true,
		validationKey: true
	};
	
	$scope.submitForm = function() {
		// check to make sure the form is completely valid
		if ($scope.userForm.$valid) {
			var key = {
				value: $(".keyManager").val()
			};
			
			$http.post('/registerKey', key).success(function(response) {
				if((!$scope.required.validationKey) || (response === "Approved")){
					$scope.addUser();
				}else{
					swal({
						title: 'לא ניתן להירשם',
						text:
							'קוד אימות אינו תקין, אנא נסה שנית\n',
						showCloseButton: true
					});
				}
			});
		}
	};
	
	var chooseUserType = function() {
		switch($("#UserType").val()){
			case 'manager':
				$("#lblId").show();
				$("#id").show();
				$scope.required.id = true;
				$("#data8").hide();
				$("#data9").show();
				$("#Comments").prop("placeholder", "");
				$("#data10").show();
				$("#data11").hide();
				$scope.required.validationKey = true;
				break;
			case 'baker':
				$("#lblId").hide();
				$("#id").hide();
				$scope.required.id = false;
				$("#data8").show();
				$("#data9").show();
				$("#Comments").prop("placeholder", "במידה והינך מתנדב קבוע נא לציין את תאריך ההתנדבות.");
				$("#data10").hide();
				$("#data11").hide();
				$scope.required.validationKey = false;
				break;
			case 'bakery':
				$("#lblId").show();
				$("#id").show();
				$scope.required.id = true;
				$("#data8").show();
				$("#data9").show();
				$("#Comments").prop("placeholder", "נא למלא בשדה זה את תפקידך בקבוצת האפיה.");
				$("#data10").hide();
				$("#data11").hide();
				$scope.required.validationKey = false;
				break;
			case 'volunteer':
				$("#lblId").show();
				$("#id").show();
				$scope.required.id = true;
				$("#data8").show();
				$("#data9").show();
				$("#data10").hide();
				$("#data11").hide();
				$scope.required.validationKey = false;
				break;
			case 'guest':
				$("#lblId").hide();
				$("#id").hide();
				$scope.required.id = false;
				$("#data8").hide();
				$("#data9").show();
				$("#Comments").prop("placeholder", "נא למלא בשדה זה:\nמהיכן הקבוצה, איש קשר\\מדריך, מס' משתתפים, גילאים ומטרת הביקור.");
				$("#data10").hide();
				$("#data11").show();
				$scope.required.validationKey = false;
				break;
		}
	};
	
	chooseUserType();
	$("#UserType").change(chooseUserType);
	
	$scope.addUser = function() {
		$scope.user.googleId = userInfo.userId;
		
		$http.post('/register', $scope.user).success(function(response) {
			swal({
				title: "נרשמת בהצלחה!",
				text: "נרשמת בהצלחה לאתר, גלישה מהנה",
				type: "success",
				showCancelButton: false,
				confirmButtonColor: "#19D119",
				confirmButtonText: "המשך",
				closeOnConfirm: false,
				html: false
			}, function(){
				userInfo.fullName = $scope.user.firstName + ' ' + $scope.user.lastName;
				redirection($scope.user.userType);
			});
		});
	};
}]);﻿

myApp.controller('aboutCotroller', ['$scope', '$http', function($scope, $http) {
	$("#homeHeader").show();
	$("#homeHeader").prop('style').visibility = 'visible';
}]);

myApp.controller('contactUsCotroller', ['$scope', '$http', function($scope, $http) {
	$("#homeHeader").show();
	$("#homeHeader").prop('style').visibility = 'visible';
}]);

myApp.controller('QandACotroller', ['$scope', '$http', function($scope, $http) {
	$("#homeHeader").show();
	$("#homeHeader").prop('style').visibility = 'visible';
}]);

myApp.config(function ($routeProvider) {
	$routeProvider
		.when('/register', {
		templateUrl: 'register.html',
		controller: 'registerCotroller',
		controllerAs:'register'
	})
		.when('/main', {
		templateUrl: 'mainHome.html',
		controller: 'AppCtrl',
		controllerAs: 'AppCtrl'
	})
		.when('/contactUs', {
		templateUrl: 'contactUs.html',
		controller: 'contactUsCotroller',
		controllerAs:'contactUs'
	})
		.when('/about', {
		templateUrl: 'about.html',
		controller: 'aboutCotroller',
		controllerAs:'about'
	})
		.when('/QuestionsAnswers', {
		templateUrl: 'general/QuestionsAnswers.html',
		controller: 'QandACotroller',
		controllerAs:'QandA'
	})
		.otherwise({
		redirectTo: '/main'
	});

});

//check the user info and direct to the right page(managers/bakers/volunteer...)
function redirection(userType){
	var path = '/';
	
	switch(userType){
		case "manager":
			path += 'managers/managers.html';
			break;
		case "baker":
			path += 'bakers/bakers.html';
			break;
		case "bakery":
			path += 'bakery/bakery.html';
			break;
		case "volunteer":
			path += 'volunteers/volunteers.html';
			break;
		case "guest":
			path += 'guests/guests.html';
			break;
	}
	
	window.location.replace(path);
}