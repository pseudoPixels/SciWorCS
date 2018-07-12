$(document).ready(function(){


    $("#noise_removal").click(function(){
        $("#panel_noise_removal").show();

    });


    $("#run_noise_removal").click(function(){
        var imageURL = $("#id_img_url").val();
        imageURL = "/get_image/rgblink/"+imageURL;
         //ajax call to the api
        $.ajax({
            type: "GET",
            url: imageURL,
            success: function(option){
                    //alert(option);
                   $("#img_api_output").attr('src', 'static/images/test_rgb_grayCLOUD.png');
                }
        });

    });


    //user gives input image in the input field.
    //copy the url and display
     $("#id_btn_input_img_url").click(function(){
        var imageURL = $("#id_img_url").val();
        $("#id_input_image").attr('src', imageURL);

    });












});
