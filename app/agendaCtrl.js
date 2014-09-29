app.controller('agendaCtrl', function($scope, $http) {
    
    $scope.inicio = function(){

    	$scope.datos= {

	    	aum_clave : '',
	    	proveedor :'',
	    	costo : '',
	    	fecharegistro :FechaAct,
	    	horacita :hora,
	    	notas : '',
	    	referencia : '',
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
		        $scope.aum_clave = data.aum_clave;
		        
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
		        $scope.aum_clave = data.aum_clave;
		        
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