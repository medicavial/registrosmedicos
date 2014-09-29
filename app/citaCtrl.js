app.controller('citaCtrl', function($scope, $http, busqueda) {

	$scope.inicio = function(){

		$scope.autorizacion = {
			folio:'',
			autorizacion:''

		}

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
			
			$scope.autorizaciones = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}




});