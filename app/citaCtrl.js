app.controller('citaCtrl', function($scope, $http, busqueda) {

	$scope.inicio = function(){

		$scope.contador = '';

		$scope.autorizacion = {
			folio:'',
			autorizacion:''

		}
		$scope.buscaautorizaciones();
		$scope.buscaconfirmaciones();



	}

	$scope.buscaautorizaciones = function(){

		busqueda.autoriza().success(function (data){
			console.log(data);
			//$scope.autoriza = data;
			$scope.contador = data.contador;
			$scope.autoriza = data.autoriza;

		});

	}

	$scope.buscaconfirmaciones = function(){

		busqueda.confirma().success(function (data){
            
		    $scope.contadorcita = data.contadorcita;
			$scope.confirma = data.confirma;
		});

	}

	$scope.buscarAutorizacion = function(){

		console.log($scope.autorizacion);
		//console.log($scope.folio);
		$http({
			url:'api/api.php?funcion=buscarAutorizacion',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.autorizacion
		}).success( function (data){

			console.log(data);

			$scope.autoriza = data;


		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}

	$scope.buscarConfirmados = function(){

		console.log($scope.autorizacion);
		//console.log($scope.folio);
		$http({
			url:'api/api.php?funcion=buscarConfirmados',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.confirma
		}).success( function (data){
			console.log(data);
			$scope.confirmaciones = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}




});