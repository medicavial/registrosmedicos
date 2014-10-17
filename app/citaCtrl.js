app.controller('citaCtrl', function($scope, $http, busqueda) {

	$scope.inicio = function(){

		$scope.contador = '';

		$scope.autorizacion = {
			folio:'',
			autorizacion:''

		}
		$scope.buscaautorizaciones();
		$scope.buscaconfirmaciones();
		$scope.buscaresultados();
		$scope.buscaobservaciones();
		$scope.buscaconcluidos();



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

	$scope.buscaobservaciones = function(){

		busqueda.observacion().success(function (data){
            
		    $scope.contadorob = data.contadorob;
			$scope.observacion = data.observacion;
		});

	}

	$scope.buscaresultados = function(){

		busqueda.result().success(function (data){
            
		    $scope.contadorres = data.contadorres;
			$scope.resultado = data.resultado;
		});

	}

	$scope.buscaconcluidos = function(){

		busqueda.concluido().success(function (data){
            
		    $scope.contadorconcluido = data.contadorconcluido;
			$scope.concluido = data.concluido;
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

	$scope.buscarResultados = function(){

		console.log($scope.autorizacion);
		//console.log($scope.folio);
		$http({
			url:'api/api.php?funcion=buscarResultados',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.resultado
		}).success( function (data){
			console.log(data);
			$scope.resultados = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}

	$scope.buscarObservacion = function(){

		console.log($scope.autorizacion);
		//console.log($scope.folio);
		$http({
			url:'api/api.php?funcion=buscarObservacion',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.resultado
		}).success( function (data){
			console.log(data);
			$scope.resultados = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}

	$scope.buscarConcluidos = function(){

		console.log($scope.autorizacion);
		//console.log($scope.folio);
		$http({
			url:'api/api.php?funcion=buscarConcluidos',
			method:'POST', 
			contentType: 'application/json', 
			dataType: "json", 
			data:$scope.resultado
		}).success( function (data){
			console.log(data);
			$scope.resultados = data;

		}).error( function (data){

			alert('Ocurrio un error de conexion intente nuevamente si persiste el problema comunicate al area de sistemas');

		});
	}




});