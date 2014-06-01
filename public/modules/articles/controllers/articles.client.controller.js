'use strict';

angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles','$http','Users',
	function($scope, $stateParams, $location, Authentication, Articles, $http, Users) {
		$scope.authentication = Authentication;
        $scope.membersSelected = [];
        $scope.membersToShowSelected = [];


        var updateMembers = function(){
            $scope.article.members =  [$scope.article.members.shift()];
            $scope.users.some(function(user){
                return $scope.membersToShowSelected.forEach(function(selMember){
                        if(user._id === selMember._id){
                            $scope.article.members.push(user);
                        }
                });
            });

        };

		$scope.create = function() {
			var article = new Articles({
				title: this.title,
				content: this.content,
                members: [$scope.authentication.user]
			});
			article.$save(function(response) {
				$location.path('articles/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

			this.title = '';
			this.content = '';
		};

		$scope.remove = function(article) {
			if (article) {
				article.$remove();

				for (var i in $scope.articles) {
					if ($scope.articles[i] === article) {
						$scope.articles.splice(i, 1);
					}
				}
			} else {
				$scope.article.$remove(function() {
					$location.path('/list');
				});
			}
		};

		$scope.update = function() {
            updateMembers();
			var article = $scope.article;

			article.$update(function() {
				$location.path('articles/' + article._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.find = function() {
			$scope.articles = Articles.query();
            $scope.users = Users.query();
		};

		$scope.findOne = function() {
			$scope.article = Articles.get({
				articleId: $stateParams.articleId
            },
                function (article){
                    $scope.users = Users.query(function (data){
                            function amISelected(id){
                              return  article.members.some(function(member){
                                    if(member._id === id){
                                        return true;
                                    }
                                });
                            }
                            $scope.membersSelected.length = 0;
                            data.forEach(function (user){
                                if(user._id === $scope.article.user._id){
                                    return;
                                }
                                var listItem =  { displayName: user.displayName, goodAt: user.goodAt,  _id:user._id, selected: amISelected(user._id) };
                                $scope.membersSelected.push(listItem);
                            });
                }
            );


            });
            function refresh(){
                angular.element(document.querySelector('.multiSelect button')).triggerHandler('click');

            }
            setTimeout(refresh, 200);

		};

        $scope.filterMeOut = function(user)
        {
            // Do some tests

            if(user._id === $scope.authentication.user._id)
            {
                return false; // this will be listed in the results
            }

            return true; // otherwise it won't be within the results
        };


    }
]);