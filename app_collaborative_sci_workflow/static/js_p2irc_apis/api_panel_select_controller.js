$(document).ready(function(){


    $("#rgb_2_gray").click(function () {
        $(".api_panels").hide();
        $("#panel_rgb_2_gray").show();
	
    });

    $("#noise_removal").click(function () {
        $(".api_panels").hide();
        $("#panel_noise_removal").show();

    });



    //online python
    $("#run_onlinepython").click(function () {
        //var source_code = $("#code_onlinepython").val();
        
        //py_com = "/pythoncom/?

      $.ajax({
            type: "POST",
            cache:false,
            url: "/pythoncom",
            data: $("#source_code_form").serialize(),
            success: function (option) {

                $("#output_onlinepython").text(option);
                $('#img_outputs').html('<img height="50%" width="50%" src="static/p2irc_output_img/pipeline_out_1.jpg?' + new Date().getTime() + '">');
            },
            error: function (xhr, status, error) {
                alert(xhr.responseText);
            }

        });


      
        
      



    });








    $("#run_rgb_2_gray").click(function () {
        
        var imageURL = $("#id_img_url").val();
        imageURL = "/get_image/rgb2gray/?img_loc=" + imageURL;
	    
        $.ajax({
            type: "GET",
            url: imageURL,
            success: function(option){
                    
                   $("#img_api_output").attr('src', 'static/img/gray.png');
            },
	        error: function(xhr, status, error) {
  			    alert(xhr.responseText);
		    }

        });

    });






    $("#run_noise_removal").click(function () {

        var imageURL = $("#id_img_url").val();
        imageURL = "/get_image/noise_removal/?img_loc=" + imageURL;

        $.ajax({
            type: "GET",
            url: imageURL,
            success: function (option) {

                $("#img_api_output").attr('src', 'static/img/gray.png');
            },
            error: function (xhr, status, error) {
                alert(xhr.responseText);
            }

        });

    });


















    //user gives input image in the input field.
    //copy the url and display
     $("#id_btn_input_img_url").click(function(){
        var imageURL = $("#id_img_url").val();
        $("#id_input_image").attr('src', imageURL);

    });






    //pipeline js
     $("#code_rgb_2_gray").click(function () {


         $('#code_onlinepython').val($('#code_onlinepython').val() + "\nimg = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)\n");
            
            
     });


     $("#code_load_data").click(function () {


         $('#code_onlinepython').val($('#code_onlinepython').val() + "\nimport numpy as np\nimport cv2\n\n"
             + "img = cv2.imread('static/img/input.png')\n\n"
             );

     });


     $("#code_noise_removal").click(function () {


         $('#code_onlinepython').val($('#code_onlinepython').val()  + "\nimg = cv2.fastNlMeansDenoisingColored(img,None,10,10,7,21)\n");


     });


     $("#code_write_output").click(function () {


         $('#code_onlinepython').val($('#code_onlinepython').val() + "\ncv2.imwrite('static/p2irc_output_img/pipeline_out_1.jpg', img)\n");


     });




});
