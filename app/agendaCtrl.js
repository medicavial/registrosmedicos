app.controller('agendaCtrl', function($scope, $http) {
    
    $scope.inicio = function(){

    	$scope.datos= {

	    	aum_clave : '',
	    	proveedor :'',
	    	costo : '',
	    	fecharegistro :'',
	    	notas : '',
	    	referencia : ''
    	}
    	
    }

     $scope.agenda = function(){

        console.log($scope.datos);

        $scope.mensaje = '';
        $('#boton').button('loading');

        $http({
            url:'api/api.php?funcion=agenda',
            method:'POST', 
            contentType: 'application/json', 
            dataType: "json", 
            data: $scope.datos
        }).success( function (data){

            $scope.mensaje = data.respuesta;
            $('#boton').button('reset');
            
        }).error( function (xhr,status,data){

            $('#boton').button('reset');
            alert('Error');

        });
       
    }


    
});