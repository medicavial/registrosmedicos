app.controller('concluidosCtrl', function($scope, $http, busqueda, $rootScope, $routeParams, $filter, $location) {

	$scope.inicio = function(){

		$scope.titulo = 'Agendar';
		//console.log($routeParams.autorizacion);
		$scope.detalleAut();
		$scope.mensaje ='';
		$scope.edicion = true;
		//$scope.autorizacion=$routeParams.autorizacion;

		$scope.datos= {

            autorizacion : '',
	    	proveedor :'',
	    	costo : '',
	    	cita:'',
	    	notas : '',
	    	referencia : '',
	    	fechacita : '',
	    	horacita : '',
	    	paciente : '',
	    	proveedor :'',
	    	observacion: '',
	    	observacioncor: '',
	    	preexistencia: '',
	    	archivo: ''
    	}


	}	


	$scope.detalleAut = function(){


		busqueda.detalleconcluido($routeParams.autorizacion).success(function (data){

			console.log(data);

			$scope.datos = {

				autorizacion:data.clave,
				proveedor:data.proveedor,
				costo:data.costo,
				cita:data.tipo,
				notas:data.observacion,
				referencia:data.inforeferencia,
				fechacita:data.fecha,
				horacita:data.hora,
				paciente:data.paciente,
				proveedor:data.conproveedor,
				observacion:data.resobservacion,
				observacioncor:data.observacioncoor,
				preexistencia:data.preexistencia

			}

			$scope.autorizacion = data.clave;
			$scope.archivo = data.archivo;

		});

	}

});