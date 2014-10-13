app.controller('agendaCtrl', function($scope, $http, $location) {
    
    $scope.inicio = function(){

    	$scope.datos= {

            autorizacion : autorizacion,
	    	proveedor :'',
	    	costo : '',
	    	cita:'',
	    	notas : '',
	    	referencia : '',
	    	fechacita :FechaAct,
	    	horacita :hora,
	    	paciente :'',
	    	proveedor1 :''
    	}
    	
    }

     $scope.agenda = function(){

        console.log($scope.datos);

    try{

			$scope.mensaje ='';

			$http({

		        url:'api/api.php?funcion=agenda',
		        method:'POST', 
		        contentType: "application/json; charset=utf-8", 
		        dataType: "json", 
		        data:$scope.datos
		       

		    }).success(function (data){

		         console.log(data);
		        $scope.mensaje = data.respuesta;
		        $scope.alerta = 'alert-success';
		        $scope.autorizacion = data.autorizacion;
		        $location.path("/seguimiento");
		        
		        //console.log(data);
		    }).error( function (xhr,status,data){

		        $scope.mensaje ='Error';
		        $scope.alerta = 'alert-danger';

		    });

		}catch(err){

			alert(err);
		}
}

 $scope.confirmar = function(){

        console.log($scope.datos);

    try{

			$scope.mensaje ='';

			$http({

		        url:'api/api.php?funcion=confirmar',
		        method:'POST', 
		        contentType: "application/json; charset=utf-8", 
		        dataType: "json", 
		        data:$scope.datos
		       

		    }).success(function (data){

		         console.log(data);
		        $scope.mensaje = data.respuesta;
		        $scope.alerta = 'alert-success';
		        $scope.autorizacion = data.autorizacion;
		        $location.path("/cita");

		        
		        //console.log(data);
		    }).error( function (xhr,status,data){

		        $scope.mensaje ='Error';
		        $scope.alerta = 'alert-danger';

		    });

		}catch(err){

			alert(err);
		}
}
});