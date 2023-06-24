let API = 'http://localhost:3000/';

let app = angular.module('asmpc04788', ['ngRoute']);

app.config(function ($routeProvider) {
  $routeProvider
    .when('/home', {
      templateUrl: 'view/home/home.html',
      controller: 'listCourse'
    })
    .when('/Sign-in', {
      templateUrl: 'view/dangnhap/Sign-in.html',
      controller: 'signin'
    })
    .when('/Sign-up', {
      templateUrl: 'view/dangky/Sign-up.html',
      controller: 'signup'
    })
    .when('/changePass/:id', {
      templateUrl: 'view/edit-matkhau/changePass.html',
      controller: 'changePass'
    })
    .when('/khoa-hoc', {
      templateUrl: 'view/khoahoc/khoa-hoc.html',
      controller: 'listCourse'
    })
    .when('/quiz/:id/:name', {
      templateUrl: 'view/quiz/quiz.html',
      controller: 'quizController'
    })
    .when('/profile/:id', {
      templateUrl: 'view/TT-Nguoidung/profile.html',
      controller: 'Profile'
    })
    .when('/edit-profile/:id', {
      templateUrl: 'view/TT-Nguoidung/edit-profile.html',
      controller: 'Profile'
    })
    .otherwise('/home', {
      redirectTo: 'view/home/home.html'
    })
});


//  danh sách khoá học 
app.controller('listCourse', function ($scope, $rootScope, $http) {
  $rootScope.title = "Sarah";
  $http({
    method: 'GET',
    url: API + 'subjects'
  }).then(function successCallback(response) {
    $scope.subjects = response.data;
  }, function errorCallback(response) {
    console.log(response.data);
  });
});

// câu hỏi quiz 
app.controller("quizController", function ($scope, $http, $routeParams, quizFactory) {

  $http.get(API + 'quizs/' + $routeParams.id).then(function (res) { //lấy id của khóa học ra nè
    quizFactory.questions = res.data;
  })
});

// bài quizz
app.directive('quizfpoly', function (quizFactory, $routeParams, $timeout, $rootScope, $http) {
  return {
    restrict: 'AE',
    scope: {},
    templateUrl: 'view/quiz/template-quiz.html',
    link: function (scope, elem, attrs) {

      scope.name = $routeParams.name;

      scope.start = function () {
        quizFactory.getQuestions().then(function () {
          scope.subjectName = $routeParams.name;
          scope.id = 1;
          scope.quizOver = false;
          scope.inProgess = true;
          scope.getQuestion();
          scope.startTime();
        })
      };
      scope.startTime = function () {
        scope.counter = 100; // set thời gian làm bài nè
        $timeout(scope.onTimeOut, 1000);
      }

      scope.onTimeOut = function () {
        scope.counter--; //biết để đếm ngược
        scope.TimeOut = $timeout(scope.onTimeOut, 1000); // set tốc độ đếm thời gian nè
        if (scope.counter == -1) {
          $timeout.cancel(scope.TimeOut);
          scope.quizOver = true;
          alert('Bạn đã hết thời gian làm bài')
        }
      }
      scope.reset = function () {
        scope.score = 0;
        scope.inProgess = false;
      };

      scope.getQuestion = function () {
        var quiz = quizFactory.getQuestion(scope.id);

        if (quiz) {
          scope.question = quiz.Text;
          scope.options = quiz.Answers;
          scope.answer = quiz.AnswerId;
          scope.answerMode = true;
        }
        else {
          scope.quizOver = true;
        }

      }
      scope.checkAnswer = function () {
        if (!$('input[name = answer]:checked').length) {
          alert("Vui lòng chọn đáp án")
          return;
        };

        var ans = $('input[name = answer]:checked').val();
        if (ans == scope.answer) {
          scope.score++;
          scope.correctAns = true;
        }
        else {
          scope.correctAns = false;
        }
        scope.answerMode = false;
      }

      scope.nextQuestion = function () {
        scope.id++;
        scope.getQuestion();
      }
      scope.reset();

      scope.saveQuiz = function () {
        alert("Lưu kết quả thành công")
      }
    }
  }
});

// facotry bài quiz
app.factory('quizFactory', function ($http, $routeParams) {
  return {
    getQuestions: function () {
      return $http.get(API + 'quizs/' + $routeParams.id).then(function (res) {
        questions = res.data;
      })
    },
    getQuestion: function (id) {
      var randomItem = questions.data[Math.floor(Math.random() * questions.data.length)];
      var count = questions.data.length;
      if (count > 11) {
        count = 11;
      }
      if (id < count) {
        return randomItem;
      }
      else {
        return false;
      }
    }
  }
});

//Đồng hồ 
app.filter('Timer', function ($filter) {
  return function (number) {
    var minutes = Math.round((number - 30) / 60);
    var remainingSeconds = number % 60;
    if (remainingSeconds < 10) {
      remainingSeconds = "0" + remainingSeconds;
    }
    var timer = (minutes = (minutes < 10) ? "0" + minutes : minutes) + ":" + remainingSeconds;
    return timer;
  }
});
// factory Đăng nhập đăng ký

app.factory('userService', function ($http) {

  const baseUrl = API + 'student';

  return {

    signup: function (user) {

      return $http.post(baseUrl, user).then(function (response) {
        return response.data;
      });

    },

    signin: function (auth) {
      // http://localhost:3000/student/?username=teonv&passwor=iloveyou

      return $http.get(baseUrl + '/?user=' + auth.user + '&password=' + auth.pass)
        .then(function (response) {
          if (response.data.length > 0) {
            localStorage.setItem('Info', JSON.stringify(response.data));
          } else {
            throw new Error('không tồn tại');
          }

        });

    },

    checkUserExits: function (user) {

      return $http.get(baseUrl + '/?user=' + user)
        .then(function (response) {
          var user = response.data;
          return user.length > 0;
        })
        .catch(function (error) {
          console.log('lỗi này là ' + error);
        });

    }

  }

});

// đăng kí
app.controller('signup', function ($scope, userService) {

  $scope.signup = function () {

    let datauser = {
      id: Math.floor() + 1,
      user: $scope.user,
      password: $scope.password,
      fullname: $scope.fullname,
      phone: $scope.phone,
      gender: $scope.gender,
      date: $scope.birthday,
      email: $scope.email
    }


    userService.checkUserExits(datauser.user).then(function (exits) {

      if (exits) {
        alert('user này đã được đăng ký!')
      } else {
        userService.signup(datauser)
          .then(function (response) {
            alert('Chúc mừng bạn đã đăng ký thành công')
          })
          .catch(function (error) {
            alert('false: ' + error);
          });
      }

    })

  }

});

// đăng nhập
app.controller('signin', function ($scope, $rootScope, $http, userService) {

  $scope.signin = function () {

    let auth = {
      user: $scope.username,
      pass: $scope.password
    };

    userService.signin(auth)
      .then(function (response) {
        location.href = '#!/home'
        location.reload();
      })
      .catch(function (error) {
        alert('Bạn Sai Tên Đăng Hoặc Mật Khẩu')
      });

  }

  var Info = localStorage.getItem('Info');

  if (Info) {
    var user = JSON.parse(Info);
    $rootScope.ttUser = user[0];
    $rootScope.ttUser.date = new Date(user[0].date);
  }

  // đăng xuất
  $scope.logOut = function () {
    localStorage.removeItem('Info');
    window.location.href = '#!/home'
    location.reload();

  }


});
// thông tin profile
app.controller('Profile', function ($scope, $http, $routeParams) {

  $http({
    method: 'GET',
    url: API + 'student/' + $routeParams.id,
    data: $scope.quiz
  }).then(function successCallback(response) {
    $scope.quiz = response.data;
    $scope.quiz.date = new Date($scope.quiz.date);
  }, function errorCallback(response) {
    console.log(response.data);
  });

  $scope.saveProfile = function () {

    $http({
      method: 'PUT',
      url: API + 'student/' + $routeParams.id,
      data: $scope.quiz
    }).then(function successCallback(response) {
      $scope.quiz = response.data;
    }, function errorCallback(response) {
      console.log(response.data);
    });
  }

});
// đổi pass
app.controller('changePass', function ($scope, $rootScope, $http, $routeParams) {

  $http.get(API + 'student/?user=' + $rootScope.ttUser.user).then(function (response) {
    $scope.student = response.data;

    $scope.changePass = function () {

      let oldPass = $scope.oldPass;
      let newPass = $scope.newPass;
      let cofirmPass = $scope.cofirmPass;

      if ($scope.student[0].password == oldPass) {

        if ($scope.student[0].password == newPass) {

          alert("Mật khẩu mới không được trùng với mật khẩu cũ !")
          return;
        }

        if (newPass != cofirmPass) {
          $
          alert("Mật khẩu không trùng khớp !")

          return;
        }

        if (newPass == cofirmPass && $scope.student[0].password != newPass) {

          if (confirm('Bạn có chắc muốn đđo mk khôkhng ')) {
            var data = {
              id: $rootScope.ttUser.id,
              user: $rootScope.ttUser.user,
              email: $rootScope.ttUser.email,
              fullname: $rootScope.ttUser.fullname,
              password: newPass,
              phone: $rootScope.ttUser.phone,
              gender: $rootScope.ttUser.gender,
              date: $rootScope.ttUser.date
            }

            $http({
              method: 'PUT',
              url: API + 'student/' + $routeParams.id,
              data: data
            }).then(function successCallback(response) {

              if (response.data) {
                alert('Đổi Mật Khẩu Thành Công')

                localStorage.removeItem('userInfo');
                window.location.href = '#!/home'
                location.reload();
              }

              // alert('Đổi mật khẩu thành công, vui lòng đăng nhập lại !')

            }, function errorCallback(error) {
              console.log('lỗi này là ' + error);
            });
          }


        }

      } else {
        alert("Mật khẩu không trùng khớp !");
      }

    };

  });

});