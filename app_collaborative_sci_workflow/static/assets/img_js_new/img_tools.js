
$(document).ready(function () {
    

//=====================================================================================================
//img_tools_noiseRemoval --- STARTS ----
//=====================================================================================================

    //clicking execute btn: process the input image and display the output
    $("#img_tools_noiseRemoval_btn").click(function () {
        
        $.ajax({
            type: "POST",
            cache:false,
            url: "/img_tools/img_tools_noiseRemoval_process/",
            data: $("#img_tools_noiseRemoval_form").serialize(),
            success: function (option) {
                $('#img_tools_noiseRemoval_processed_img').attr('src', 'http://10.81.30.118/static/assets/img_outputs/output.png?'+new Date().getTime());
            },
            error: function (xhr, status, error) {
                alert(xhr.responseText);
            }

        });
    });

    //Image Select Dropdown: Display the selected input image from dropdown
    $("#img_tools_noiseRemoval_imgBucket_select").change(function () {
        $('#img_tools_noiseRemoval_inpImage_img').attr('src', $(this).val()+'?' + new Date().getTime());
    });


    //Clicking get api call button: show the required info to make remote api call...
    $("#img_tools_noiseRemoval_apiCall").click(function () {
        var filter_strength = $("#noiseRemoval_filter_strength_id").val();

        var data_api_call = "filter_strength=" + filter_strength;
        
        alert("curl --data " + data_api_call + " http://10.81.30.118/img_tools/img_tools_noiseRemoval_process/");
       
        
    });

    //Selecting this tool from left menu: make this papel visible and other panels invisible
    $("#img_tools_menu_noiseRemoval_id").click(function () {
        $(".img_tools_panel_class").hide();
        $("#img_tools_panel_noiseRemoval_id").show();

    });

//=====================================================================================================
//img_tools_noiseRemoval --- ENDS ----
//=====================================================================================================







//=====================================================================================================
//img_tools_rgb2gray --- STARTS ----
//=====================================================================================================

//clicking execute btn: process the input image and display the output
$("#img_tools_rgb2gray_btn").click(function () {

    $.ajax({
        type: "POST",
        cache: false,
        url: "/img_tools/img_tools_rgb2gray_process/",
        data: $("#img_tools_rgb2gray_form").serialize(),
        success: function (option) {
            $('#img_tools_rgb2gray_processed_img').attr('src', 'http://10.81.30.118/static/assets/img_outputs/output.png?' + new Date().getTime());
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });
});

//Image Select Dropdown: Display the selected input image from dropdown
$("#img_tools_rgb2gray_imgBucket_select").change(function () {
    $('#img_tools_rgb2gray_inpImage_img').attr('src', $(this).val() + '?' + new Date().getTime());
});


//Clicking get api call button: show the required info to make remote api call...
$("#img_tools_rgb2gray_apiCall").click(function () {
    

    alert("curl --data " + " http://10.81.30.118/img_tools/img_tools_rgb2gray_process/");


});

//Selecting this tool from left menu: make this papel visible and other panels invisible
$("#img_tools_menu_rgb2gray_id").click(function () {
    $(".img_tools_panel_class").hide();
    $("#img_tools_panel_rgb2gray_id").show();

});

//=====================================================================================================
//img_tools_rgb2gray --- ENDS ----
//=====================================================================================================









//=====================================================================================================
//img_tools_binThreshold --- STARTS ----
//=====================================================================================================

//clicking execute btn: process the input image and display the output
$("#img_tools_binThreshold_btn").click(function () {

$.ajax({
    type: "POST",
    cache: false,
    url: "/img_tools/img_tools_binThreshold_process/",
    data: $("#img_tools_binThreshold_form").serialize(),
    success: function (option) {
        $('#img_tools_binThreshold_processed_img').attr('src', 'http://10.81.30.118/static/assets/img_outputs/output.png?' + new Date().getTime());
    },
    error: function (xhr, status, error) {
        alert(xhr.responseText);
    }

});
});

//Image Select Dropdown: Display the selected input image from dropdown
$("#img_tools_binThreshold_imgBucket_select").change(function () {
    $('#img_tools_binThreshold_inpImage_img').attr('src', $(this).val() + '?' + new Date().getTime());
});


//Clicking get api call button: show the required info to make remote api call...
$("#img_tools_binThreshold_apiCall").click(function () {


    alert("curl --data " + " http://10.81.30.118/img_tools/img_tools_binThreshold_process/");


});

//Selecting this tool from left menu: make this papel visible and other panels invisible
$("#img_tools_menu_binThreshold_id").click(function () {
    $(".img_tools_panel_class").hide();
    $("#img_tools_panel_binThreshold_id").show();

});

//=====================================================================================================
//img_tools_binThreshold --- ENDS ----
//=====================================================================================================












//=====================================================================================================
//img_tools_rgb2hsv --- STARTS ----
//=====================================================================================================

//clicking execute btn: process the input image and display the output
$("#img_tools_rgb2hsv_btn").click(function () {

    $.ajax({
        type: "POST",
        cache: false,
        url: "/img_tools/img_tools_rgb2hsv_process/",
        data: $("#img_tools_rgb2hsv_form").serialize(),
        success: function (option) {
            $('#img_tools_rgb2hsv_processed_img').attr('src', 'http://10.81.30.118/static/assets/img_outputs/output.png?' + new Date().getTime());
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });
});

//Image Select Dropdown: Display the selected input image from dropdown
$("#img_tools_rgb2hsv_imgBucket_select").change(function () {
    $('#img_tools_rgb2hsv_inpImage_img').attr('src', $(this).val() + '?' + new Date().getTime());
});


//Clicking get api call button: show the required info to make remote api call...
$("#img_tools_rgb2hsv_apiCall").click(function () {


    alert("curl --data " + " http://10.81.30.118/img_tools/img_tools_binThreshold_process/");


});

//Selecting this tool from left menu: make this papel visible and other panels invisible
$("#img_tools_menu_rgb2hsv_id").click(function () {
    $(".img_tools_panel_class").hide();
    $("#img_tools_panel_rgb2hsv_id").show();

});

//=====================================================================================================
//img_tools_binThreshold --- ENDS ----
//=====================================================================================================













//=====================================================================================================
//img_tools_medianBlur --- STARTS ----
//=====================================================================================================

//clicking execute btn: process the input image and display the output
$("#img_tools_medianBlur_btn").click(function () {

    $.ajax({
        type: "POST",
        cache: false,
        url: "/img_tools/img_tools_medianBlur_process/",
        data: $("#img_tools_medianBlur_form").serialize(),
        success: function (option) {
            $('#img_tools_medianBlur_processed_img').attr('src', 'http://10.81.30.118/static/assets/img_outputs/output.png?' + new Date().getTime());
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });
});

//Image Select Dropdown: Display the selected input image from dropdown
$("#img_tools_medianBlur_imgBucket_select").change(function () {
    $('#img_tools_medianBlur_inpImage_img').attr('src', $(this).val() + '?' + new Date().getTime());
});


//Clicking get api call button: show the required info to make remote api call...
$("#img_tools_medianBlur_apiCall").click(function () {


    alert("curl --data " + " http://10.81.30.118/img_tools/img_tools_medianBlur_process/");


});

//Selecting this tool from left menu: make this papel visible and other panels invisible
$("#img_tools_menu_medianBlur_id").click(function () {
    $(".img_tools_panel_class").hide();
    $("#img_tools_panel_medianBlur_id").show();

});

//=====================================================================================================
//img_tools_medianBlur --- ENDS ----
//=====================================================================================================















//=====================================================================================================
//img_tools_rgb2lab --- STARTS ----
//=====================================================================================================

//clicking execute btn: process the input image and display the output
$("#img_tools_rgb2lab_btn").click(function () {

    $.ajax({
        type: "POST",
        cache: false,
        url: "/img_tools/img_tools_rgb2lab_process/",
        data: $("#img_tools_rgb2lab_form").serialize(),
        success: function (option) {
            $('#img_tools_rgb2lab_processed_img').attr('src', 'http://10.81.30.118/static/assets/img_outputs/output.png?' + new Date().getTime());
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });
});

//Image Select Dropdown: Display the selected input image from dropdown
$("#img_tools_rgb2lab_imgBucket_select").change(function () {
    $('#img_tools_rgb2lab_inpImage_img').attr('src', $(this).val() + '?' + new Date().getTime());
});


//Clicking get api call button: show the required info to make remote api call...
$("#img_tools_rgb2lab_apiCall").click(function () {


    alert("curl --data " + " http://10.81.30.118/img_tools/img_tools_rgb2lab_process/");


});

//Selecting this tool from left menu: make this papel visible and other panels invisible
$("#img_tools_menu_rgb2lab_id").click(function () {
    $(".img_tools_panel_class").hide();
    $("#img_tools_panel_rgb2lab_id").show();

});

//=====================================================================================================
//img_tools_medianBlur --- ENDS ----
//=====================================================================================================








//=====================================================================================================
//img_tools_bitwiseOr --- STARTS ----
//=====================================================================================================

//clicking execute btn: process the input image and display the output
$("#img_tools_bitwiseOr_btn").click(function () {

    $.ajax({
        type: "POST",
        cache: false,
        url: "/img_tools/img_tools_bitwiseOr_process/",
        data: $("#img_tools_bitwiseOr_form").serialize(),
        success: function (option) {
            $('#img_tools_bitwiseOr_processed_img').attr('src', 'http://10.81.30.118/static/assets/img_outputs/output.png?' + new Date().getTime());
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });
});

//Image Select Dropdown: Display the selected input image from dropdown
$("#img_tools_bitwiseOr_imgBucket_select").change(function () {
    $('#img_tools_bitwiseOr_inpImage_img').attr('src', $(this).val() + '?' + new Date().getTime());
});


//Clicking get api call button: show the required info to make remote api call...
$("#img_tools_bitwiseOr_apiCall").click(function () {


    alert("curl --data " + " http://10.81.30.118/img_tools/img_tools_rgb2lab_process/");


});

//Selecting this tool from left menu: make this papel visible and other panels invisible
$("#img_tools_menu_bitwiseOr_id").click(function () {
    $(".img_tools_panel_class").hide();
    $("#img_tools_panel_bitwiseOr_id").show();

});

//=====================================================================================================
//img_tools_bitwiseOr --- ENDS ----
//=====================================================================================================












//=====================================================================================================
//img_tools_imgMasking --- STARTS ----
//=====================================================================================================

//clicking execute btn: process the input image and display the output
$("#img_tools_imgMasking_btn").click(function () {

    $.ajax({
        type: "POST",
        cache: false,
        url: "/img_tools/img_tools_imgMasking_process/",
        data: $("#img_tools_imgMasking_form").serialize(),
        success: function (option) {
            $('#img_tools_imgMasking_processed_img').attr('src', 'http://10.81.30.118/static/assets/img_outputs/output.png?' + new Date().getTime());
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });
});

//Image Select Dropdown: Display the selected input image from dropdown
$("#img_tools_imgMasking_imgBucket_select").change(function () {
    $('#img_tools_imgMasking_inpImage_img').attr('src', $(this).val() + '?' + new Date().getTime());
});


//Clicking get api call button: show the required info to make remote api call...
$("#img_tools_imgMasking_apiCall").click(function () {


    alert("curl --data " + " http://10.81.30.118/img_tools/img_tools_imgMasking_process/");


});

    //Selecting this tool from left menu: make this papel visible and other panels invisible
$("#img_tools_menu_imgMasking_id").click(function () {
    $(".img_tools_panel_class").hide();
    $("#img_tools_panel_imgMasking_id").show();

});

//=====================================================================================================
//img_tools_imgMasking --- ENDS ----
//=====================================================================================================





//=====================================================================================================
//img_tools_analyzeObject --- STARTS ----
//=====================================================================================================

//clicking execute btn: process the input image and display the output
$("#img_tools_analyzeObject_btn").click(function () {

    $.ajax({
        type: "POST",
        cache: false,
        url: "/img_tools/img_tools_analyzeObject_process/",
        data: $("#img_tools_analyzeObject_form").serialize(),
        success: function (option) {
            $('#img_tools_analyzeObject_processed_img').attr('src', 'http://10.81.30.118/static/assets/img_outputs/output.png?' + new Date().getTime());
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });
});

//Image Select Dropdown: Display the selected input image from dropdown
$("#img_tools_analyzeObject_imgBucket_select").change(function () {
    $('#img_tools_analyzeObject_inpImage_img').attr('src', $(this).val() + '?' + new Date().getTime());
});


//Clicking get api call button: show the required info to make remote api call...
$("#img_tools_analyzeObject_apiCall").click(function () {


    alert("curl --data " + " http://10.81.30.118/img_tools/img_tools_analyzeObject_process/");


});

//Selecting this tool from left menu: make this papel visible and other panels invisible
$("#img_tools_menu_analyzeObject_id").click(function () {
    $(".img_tools_panel_class").hide();
    $("#img_tools_panel_analyzeObject_id").show();

});

//=====================================================================================================
//img_tools_analyzeObject --- ENDS ----
//=====================================================================================================











//====================================================================================================
//====================================================================================================
//====================================================================================================
//                                         PIPELINE DESIGN CODEs STARTS
//====================================================================================================
//====================================================================================================
//====================================================================================================











//=====================================================================================================
//design_pipelines_rgb2gray --- STARTS ----
//=====================================================================================================

//clicking execute btn: process the input image and display the output
$(".design_pipelines_rgb2gray_btn").live('click',function () {
    //alert($(this).siblings(".moduleName").val());
    var $thisButton = $(this);
    $thisButton.parent().parent().siblings(".centered").find("span").css('color', '#FF8C00');
    $thisButton.parent().parent().siblings(".centered").find("span").text('Status: Processing...');
    
    $.ajax({
        type: "POST",
        cache: false,
        url: "/img_tools/img_tools_rgb2gray_process/",
        data: $(this).siblings(".design_pipelines_rgb2gray_form").serialize(),
        success: function (option) {
            
            setTimeout(function () {
                $thisButton.parent().parent().siblings(".centered").find("span").css('color', '#00FF00');
                $thisButton.parent().parent().siblings(".centered").find("span").text('Status: Completed.');

            }, 2000);
           
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });
});


//Image Select Dropdown: Display the selected input image from dropdown
$(".streamSelector").live("change",function () {
    var colorHex = "#C0CDDC";
    var selectedValue = $(this).val();
    if (selectedValue == "static/assets/img_outputs/pipelines/stream1.png") colorHex = "#C0CDDC";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream2.png") colorHex = "#59A6A6";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream3.png") colorHex = "#A67359";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream4.png") colorHex = "#8C59A6";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream5.png") colorHex = "#666600";


    $(this).parent().parent().parent().css("background-color", colorHex);
});

//Selecting this tool from left menu: make this papel visible and other panels invisible
$("#design_pipelines_menu_rgb2gray_id").click(function () {
    $(".img_tools_panel_class").hide();
    
    $("#img_processing_screen").append('<div class ="row mt drg" > <!--CHANGE IN THIS LINE--> ' +
                                             ' <!--SERVER STATUS PANELS-->' +
                                               ' <div class ="col-md-4 col-sm-4 mb" style="height:200px;visibility:hidden;">' +
                                                        '  <div class ="white-panel pn donut-chart" style="visibility:hidden;">' +
                                                                '    <div class ="white-header">' +
                                                                        '<h5 style="color:#000000;font-weight:bold;">Input Image</h5>' +
                                                                        '<span style="color:#555555;font-weight:bold;">Select from your Image Bucket: </span>' +'    </div>' +
                                                                    ' <div class ="row">' +
                                                        '  <div class ="col-sm-6 col-xs-6 goleft">' +
                                                                '  <p style="color:#000000;font-weight:bold;"></p>' +
                                                        '  </div>' +
                                                '  </div>' +
                                                '  <div class ="centered">' +
                                                        ' <img  src="" width="100%" height="80%"><!--CHANGE IN THIS LINE-->' +
                                                '    </div>' +
                                            '   </div><! --/grey-panel-->' +
                                    '  </div><!-- /col-md-4-->' +






                                    '  <div class ="col-md-4 col-sm-4 mb">' +
                                                '<div class ="white-panel pn">' +
                                                        '<div class ="white-header" style="background-color:#C0CDDC;">' +
                                                                    ' <h5 style="color:#000000;font-weight:bold;" >RGB Channel to Grayscale </h5><!-- CHANGE IN THIS LINE -->' +
                                                                    '<span style="color:#000000;font-weight:bold;">' + 
                                                                   '<form action="" method="POST" class="design_pipelines_rgb2gray_form"> <!--CHANGE IN THIS LINE--> ' +
                                                                                    'Input Stream:' +
                                                                                    ' <select  class="moduleName" name="image_location">' +
                                                                                     '     <option value="static/assets/img_outputs/pipelines/stream1.png" selected>Pipeline Stream #1</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream2.png" >Pipeline Stream #2</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream3.png" >Pipeline Stream #3</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream4.png" >Pipeline Stream #4</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream5.png" >Pipeline Stream #5</option>' +
                                                                                      '    <option value="static/img/1.jpg" >Plant Leaf</option>' +
                                                                                      '    <option value="static/img/2.jpg">Plant Top Down View</option>' +
                                                                                      '    <option value="static/img/plant_sideview.png">Plant Side View</option>' +
                                                                                    '</select>' +
                                                                                    '<br/><br/>Output Stream:' +
                                                                                   ' <select  class="design_pipelines_rgb2gray_imgBucket_output_select streamSelector" name="img_output_location">' +
                                                                                     '     <option value="static/assets/img_outputs/pipelines/stream1.png" selected>Pipeline Stream #1</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream2.png" >Pipeline Stream #2</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream3.png" >Pipeline Stream #3</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream4.png" >Pipeline Stream #4</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream5.png" >Pipeline Stream #5</option>' +
                                                                                    ' <option value="static/assets/img_outputs/output.png">Old</option>' +
                                                                                    '</select><hr/>' +
                           
                                                                                    
                        
                                                                    '</form>' +
                                                                    '<br/>' +
                                                                    '<button type="button"   style="float:right;margin-right:20px;margin-top:10px;" class="design_pipelines_rgb2gray_btn">Run</button></span>' +
                                                            '</div>' + 
                                                            '<div class ="row">' + 
                                                                    '<div class ="col-sm-6 col-xs-6 goleft">' + 
                                                                            '   <p> </p>' + 
                                                                    '</div>' + 
                                                                    ' <div class ="col-sm-6 col-xs-6"></div>' + 
                                                            '</div>' + 
                                                            '<div class ="centered" > <!--CHANGE IN THIS LINE-->' + 
                                                                    '<span style="color:#000000;font-weight:bold;font-size:20px;margin-top:40px;">Status: Ready</span>'+
                                                            '</div>' + 
                                                     '</div>' + 

                                            '    </div><!-- /col-md-4 -->' + 









                                '  <div class ="col-md-4 mb" style="visibility:hidden;">' +
                                            '<div class ="white-panel pn">' +
                                                    '<div class ="white-header">' +
                                                        '<h5 style="color:#000000;font-weight:bold;">Processed Image</h5>' +
                                                    '</div>' +
                                                    ' <div class ="row">' +
                                                            '<div class ="col-sm-6 col-xs-6 goleft">' +
                                                                    '<p> </p>' +
                                                            '</div>' +
                                                                    '<div class ="col-sm-6 col-xs-6"></div>' +
                                                    '</div>' +
                                                    '<div class ="centered">' +
                                                            '<img src="" width="100%" height="80%" > <!--CHANGE IN THIS LINE-->' +
                                                    '</div>' +
                                            '</div>' +
                                        '</div><!-- /col-md-4 -->' +
                                        '<br/>' +
                                        '<!-- CHANGE IN THIS LINE -->' +
                                '</div><!-- /row-->'


                   );

    




                  

});

//=====================================================================================================
//design_pipelines_rgb2gray --- ENDS ----
//=====================================================================================================














//=====================================================================================================
//design_pipelines_binThreshold --- STARTS ----
//=====================================================================================================

//clicking execute btn: process the input image and display the output
$(".design_pipelines_binThreshold_btn").live('click', function () {         //<==========================CHANGE HERE
    //alert($(this).siblings(".moduleName").val());
    var $thisButton = $(this);
    $thisButton.parent().parent().siblings(".centered").find("span").css('color', '#FF8C00');
    $thisButton.parent().parent().siblings(".centered").find("span").text('Status: Processing...');

    $.ajax({
        type: "POST",
        cache: false,
        url: "/img_tools/img_tools_binThreshold_process/",
        data: $(this).siblings(".design_pipelines_binThreshold_form").serialize(),
        success: function (option) {

            setTimeout(function () {
                $thisButton.parent().parent().siblings(".centered").find("span").css('color', '#00FF00');
                $thisButton.parent().parent().siblings(".centered").find("span").text('Status: Completed.');

            }, 1000);

        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });
});


//Image Select Dropdown: Display the selected input image from dropdown
$(".streamSelector").live("change", function () {
    var colorHex = "#C0CDDC";
    var selectedValue = $(this).val();
    if (selectedValue == "static/assets/img_outputs/pipelines/stream1.png") colorHex = "#C0CDDC";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream2.png") colorHex = "#59A6A6";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream3.png") colorHex = "#A67359";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream4.png") colorHex = "#8C59A6";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream5.png") colorHex = "#666600";


    $(this).parent().parent().parent().css("background-color", colorHex);
});

    //Selecting this tool from left menu: make this papel visible and other panels invisible
$("#design_pipelines_menu_binThreshold_id").click(function () {                     //<====================CHANGE HERE
    $(".img_tools_panel_class").hide();

    $("#img_processing_screen").append('<div class ="row mt " > <!--CHANGE IN THIS LINE--> ' +
                                             ' <!--SERVER STATUS PANELS-->' +
                                               ' <div class ="col-md-4 col-sm-4 mb" style="height:200px;visibility:hidden;">' +
                                                        '  <div class ="white-panel pn donut-chart" style="visibility:hidden;">' +
                                                                '    <div class ="white-header">' +
                                                                        '<h5 style="color:#000000;font-weight:bold;">Input Image</h5>' +
                                                                        '<span style="color:#555555;font-weight:bold;">Select from your Image Bucket: </span>' + '    </div>' +
                                                                    ' <div class ="row">' +
                                                        '  <div class ="col-sm-6 col-xs-6 goleft">' +
                                                                '  <p style="color:#000000;font-weight:bold;"></p>' +
                                                        '  </div>' +
                                                '  </div>' +
                                                '  <div class ="centered">' +
                                                        ' <img  src="" width="100%" height="80%"><!--CHANGE IN THIS LINE-->' +
                                                '    </div>' +
                                            '   </div><! --/grey-panel-->' +
                                    '  </div><!-- /col-md-4-->' +






                                    '  <div class ="col-md-4 col-sm-4 mb">' +
                                                '<div class ="white-panel pn">' +
                                                        '<div class ="white-header" style="background-color:#C0CDDC;">' +
                                                                    ' <h5 style="color:#000000;font-weight:bold;" >Binary Thresholding </h5>                                             <!-- CHANGE IN THIS LINE -->' +
                                                                    '<span style="color:#000000;font-weight:bold;">' +
                                                                   '<form action="" method="POST" class="design_pipelines_binThreshold_form">                                             <!--CHANGE IN THIS LINE--> ' +
                                                                                    'Input Stream:' +
                                                                                    ' <select  class="moduleName" name="image_location">' +
                                                                                     '     <option value="static/assets/img_outputs/pipelines/stream1.png" selected>Pipeline Stream #1</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream2.png" >Pipeline Stream #2</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream3.png" >Pipeline Stream #3</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream4.png" >Pipeline Stream #4</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream5.png" >Pipeline Stream #5</option>' +
                                                                                      '    <option value="static/img/1.jpg" >Plant Leaf</option>' +
                                                                                      '    <option value="static/img/2.jpg">Plant Top Down View</option>' +
                                                                                      '    <option value="static/img/plant_sideview.png">Plant Side View</option>' +
                                                                                    '</select>' +
                                                                                    '<br/><br/>Output Stream:' +
                                                                                   ' <select  class="design_pipelines_binThreshold_imgBucket_output_select streamSelector" name="img_output_location">' +
                                                                                     '     <option value="static/assets/img_outputs/pipelines/stream1.png" selected>Pipeline Stream #1</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream2.png" >Pipeline Stream #2</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream3.png" >Pipeline Stream #3</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream4.png" >Pipeline Stream #4</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream5.png" >Pipeline Stream #5</option>' +
                                                                                    ' <option value="static/assets/img_outputs/output.png">Old</option>' +
                                                                                    '</select><hr/>' +

                                                                                   ' Threshold Value (int): <input id="binThreshold_threshold_value_id" type="text" size="10" value="85" name="threshold_value"/><br/>' +



                                                                    '</form>' +
                                                                    '<br/>' +
                                                                    '<button type="button"   style="float:right;margin-right:20px;margin-top:10px;" class="design_pipelines_binThreshold_btn">Run</button></span>       <!-- CHANGE IN THIS LINE -->' +
                                                            '</div>' +
                                                            '<div class ="row">' +
                                                                    '<div class ="col-sm-6 col-xs-6 goleft">' +
                                                                            '   <p> </p>' +
                                                                    '</div>' +
                                                                    ' <div class ="col-sm-6 col-xs-6"></div>' +
                                                            '</div>' +
                                                            '<div class ="centered" > <!--CHANGE IN THIS LINE-->' +
                                                                    '<span style="color:#000000;font-weight:bold;font-size:20px;margin-top:40px;">Status: Ready</span>' +
                                                            '</div>' +
                                                     '</div>' +

                                            '    </div><!-- /col-md-4 -->' +









                                '  <div class ="col-md-4 mb" style="visibility:hidden;">' +
                                            '<div class ="white-panel pn">' +
                                                    '<div class ="white-header">' +
                                                        '<h5 style="color:#000000;font-weight:bold;">Processed Image</h5>' +
                                                    '</div>' +
                                                    ' <div class ="row">' +
                                                            '<div class ="col-sm-6 col-xs-6 goleft">' +
                                                                    '<p> </p>' +
                                                            '</div>' +
                                                                    '<div class ="col-sm-6 col-xs-6"></div>' +
                                                    '</div>' +
                                                    '<div class ="centered">' +
                                                            '<img src="" width="100%" height="80%" > <!--CHANGE IN THIS LINE-->' +
                                                    '</div>' +
                                            '</div>' +
                                        '</div><!-- /col-md-4 -->' +
                                        '<br/>' +
                                        '<!-- CHANGE IN THIS LINE -->' +
                                '</div><!-- /row-->'


                   );








});

//=====================================================================================================
//design_pipelines_binThreshold --- ENDS ----
//=====================================================================================================











    //=====================================================================================================
    //design_pipelines_rgb2hsv --- STARTS ----
    //=====================================================================================================

    //clicking execute btn: process the input image and display the output
$(".design_pipelines_rgb2hsv_btn").live('click', function () {
    //alert($(this).siblings(".moduleName").val());
    var $thisButton = $(this);
    $thisButton.parent().parent().siblings(".centered").find("span").css('color', '#FF8C00');
    $thisButton.parent().parent().siblings(".centered").find("span").text('Status: Processing...');

    $.ajax({
        type: "POST",
        cache: false,
        url: "/img_tools/img_tools_rgb2hsv_process/",
        data: $(this).siblings(".design_pipelines_rgb2hsv_form").serialize(),
        success: function (option) {

            setTimeout(function () {
                $thisButton.parent().parent().siblings(".centered").find("span").css('color', '#00FF00');
                $thisButton.parent().parent().siblings(".centered").find("span").text('Status: Completed.');

            }, 1000);

        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });
});


    //Image Select Dropdown: Display the selected input image from dropdown
$(".streamSelector").live("change", function () {
    var colorHex = "#C0CDDC";
    var selectedValue = $(this).val();
    if (selectedValue == "static/assets/img_outputs/pipelines/stream1.png") colorHex = "#C0CDDC";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream2.png") colorHex = "#59A6A6";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream3.png") colorHex = "#A67359";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream4.png") colorHex = "#8C59A6";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream5.png") colorHex = "#666600";


    $(this).parent().parent().parent().css("background-color", colorHex);
});


    //TEMPORARY OUTPUT FOR PIPELINE -- EDIT NEEDED
$("#temp_pipeline_output_select").live("change", function () {
   // alert($(this).val());
    $('#temp_pipeline_output_img').attr('src', $("#temp_pipeline_output_select").val()+'?' + new Date().getTime());
});

    //Selecting this tool from left menu: make this papel visible and other panels invisible
$("#design_pipelines_menu_rgb2hsv_id").click(function () {
    $(".img_tools_panel_class").hide();

    $("#img_processing_screen").append('<div class ="row mt " > <!--CHANGE IN THIS LINE--> ' +
                                             ' <!--SERVER STATUS PANELS-->' +
                                               ' <div class ="col-md-4 col-sm-4 mb" style="height:200px;">' +
                                                        '  <div class ="white-panel pn donut-chart" >' +
                                                                '    <div class ="white-header">' +
                                                                        '<h5 style="color:#000000;font-weight:bold;">Image Output</h5>' +
                                                                        '<span style="color:#555555;font-weight:bold;">Select to see Stream outputs: </span>' + '    </div>' +
                                                                    ' <div class ="row">' +
                                                        '  <div class ="col-sm-6 col-xs-6 goleft">' +
                                                                '  <p style="color:#000000;font-weight:bold;">' +
                                                                ' <select  id="temp_pipeline_output_select" >' +
                                                                                     '     <option value="static/assets/img_outputs/pipelines/stream1.png" selected>Pipeline Stream #1</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream2.png" >Pipeline Stream #2</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream3.png" >Pipeline Stream #3</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream4.png" >Pipeline Stream #4</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream5.png" >Pipeline Stream #5</option>' +
                                                                                      '    <option value="static/img/1.jpg" >Plant Leaf</option>' +
                                                                                      '    <option value="static/img/2.jpg">Plant Top Down View</option>' +
                                                                                      '    <option value="static/img/plant_sideview.png">Plant Side View</option>' +
                                                                                    '</select>' +
                                                                ' </p>' +
                                                        '  </div>' +
                                                '  </div>' +
                                                '  <div class ="centered">' +
                                                        ' <img  id="temp_pipeline_output_img" src="" width="100%" height="80%"><!--CHANGE IN THIS LINE-->' +
                                                '    </div>' +
                                            '   </div><! --/grey-panel-->' +
                                    '  </div><!-- /col-md-4-->' +






                                    '  <div class ="col-md-4 col-sm-4 mb">' +
                                                '<div class ="white-panel pn">' +
                                                        '<div class ="white-header" style="background-color:#C0CDDC;">' +
                                                                    ' <h5 style="color:#000000;font-weight:bold;" >RGB to HSV Channel </h5><!-- CHANGE IN THIS LINE -->' +
                                                                    '<span style="color:#000000;font-weight:bold;">' +
                                                                   '<form action="" method="POST" class="design_pipelines_rgb2hsv_form"> <!--CHANGE IN THIS LINE--> ' +
                                                                                    'Input Stream:' +
                                                                                    ' <select  class="moduleName" name="image_location">' +
                                                                                     '     <option value="static/assets/img_outputs/pipelines/stream1.png" selected>Pipeline Stream #1</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream2.png" >Pipeline Stream #2</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream3.png" >Pipeline Stream #3</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream4.png" >Pipeline Stream #4</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream5.png" >Pipeline Stream #5</option>' +
                                                                                      '    <option value="static/img/1.jpg" >Plant Leaf</option>' +
                                                                                      '    <option value="static/img/2.jpg">Plant Top Down View</option>' +
                                                                                      '    <option value="static/img/plant_sideview.png">Plant Side View</option>' +
                                                                                    '</select>' +
                                                                                    '<br/><br/>Output Stream:' +
                                                                                   ' <select  class="design_pipelines_rgb2hsv_imgBucket_output_select streamSelector" name="img_output_location">' +
                                                                                     '     <option value="static/assets/img_outputs/pipelines/stream1.png" selected>Pipeline Stream #1</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream2.png" >Pipeline Stream #2</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream3.png" >Pipeline Stream #3</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream4.png" >Pipeline Stream #4</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream5.png" >Pipeline Stream #5</option>' +
                                                                                    ' <option value="static/assets/img_outputs/output.png">Old</option>' +
                                                                                    '</select><hr/>' +

                                                                                   ' Select Channel to Extract:  ' +

                                                                                   ' <select  name="hsv_channel">' +
                                                                                   '         <option value="h" selected>Hue</option>' +
                                                                                     '       <option value="s" >Saturation</option>' +
                                                                                      '      <option value="v" >Value</option>' +
                                                                                    '</select>' +



                                                                    '</form>' +
                                                                    '<br/>' +
                                                                    '<button type="button"   style="float:right;margin-right:20px;margin-top:10px;" class="design_pipelines_rgb2hsv_btn">Run</button></span>' +
                                                            '</div>' +
                                                            '<div class ="row">' +
                                                                    '<div class ="col-sm-6 col-xs-6 goleft">' +
                                                                            '   <p> </p>' +
                                                                    '</div>' +
                                                                    ' <div class ="col-sm-6 col-xs-6"></div>' +
                                                            '</div>' +
                                                            '<div class ="centered" > <!--CHANGE IN THIS LINE-->' +
                                                                    '<span style="color:#000000;font-weight:bold;font-size:20px;margin-top:40px;">Status: Ready</span>' +
                                                            '</div>' +
                                                     '</div>' +

                                            '    </div><!-- /col-md-4 -->' +









                                '  <div class ="col-md-4 mb" style="visibility:hidden;">' +
                                            '<div class ="white-panel pn">' +
                                                    '<div class ="white-header">' +
                                                        '<h5 style="color:#000000;font-weight:bold;">Processed Image</h5>' +
                                                    '</div>' +
                                                    ' <div class ="row">' +
                                                            '<div class ="col-sm-6 col-xs-6 goleft">' +
                                                                    '<p> </p>' +
                                                            '</div>' +
                                                                    '<div class ="col-sm-6 col-xs-6"></div>' +
                                                    '</div>' +
                                                    '<div class ="centered">' +
                                                            '<img src="" width="100%" height="80%" > <!--CHANGE IN THIS LINE-->' +
                                                    '</div>' +
                                            '</div>' +
                                        '</div><!-- /col-md-4 -->' +
                                        '<br/>' +
                                        '<!-- CHANGE IN THIS LINE -->' +
                                '</div><!-- /row-->'


                   );








});

    //=====================================================================================================
    //design_pipelines_rgb2hsv --- ENDS ----
    //=====================================================================================================




















//=====================================================================================================
//design_pipelines_imgMasking --- STARTS ----
//=====================================================================================================

//clicking execute btn: process the input image and display the output
$(".design_pipelines_imgMasking_btn").live('click', function () {         //<==========================CHANGE HERE
    //alert($(this).siblings(".moduleName").val());
    var $thisButton = $(this);
    $thisButton.parent().parent().siblings(".centered").find("span").css('color', '#FF8C00');
    $thisButton.parent().parent().siblings(".centered").find("span").text('Status: Processing...');

    $.ajax({
        type: "POST",
        cache: false,
        url: "/img_tools/img_tools_imgMasking_process/",                  //<==========================CHANGE HERE
        data: $(this).siblings(".design_pipelines_imgMasking_form").serialize(),   //<==========================CHANGE HERE
        success: function (option) {

            setTimeout(function () {
                $thisButton.parent().parent().siblings(".centered").find("span").css('color', '#00FF00');
                $thisButton.parent().parent().siblings(".centered").find("span").text('Status: Completed.');

            }, 1000);

        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });
});


    //Image Select Dropdown: Display the selected input image from dropdown
$(".streamSelector").live("change", function () {
    var colorHex = "#C0CDDC";
    var selectedValue = $(this).val();
    if (selectedValue == "static/assets/img_outputs/pipelines/stream1.png") colorHex = "#C0CDDC";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream2.png") colorHex = "#59A6A6";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream3.png") colorHex = "#A67359";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream4.png") colorHex = "#8C59A6";
    else if (selectedValue == "static/assets/img_outputs/pipelines/stream5.png") colorHex = "#666600";


    $(this).parent().parent().parent().css("background-color", colorHex);
});

    //Selecting this tool from left menu: make this papel visible and other panels invisible
$("#design_pipelines_menu_imgMasking_id").click(function () {                     //<====================CHANGE HERE
    $(".img_tools_panel_class").hide();

    $("#img_processing_screen").append('<div class ="row mt " > <!--CHANGE IN THIS LINE--> ' +
                                             ' <!--SERVER STATUS PANELS-->' +
                                               ' <div class ="col-md-4 col-sm-4 mb" style="height:200px;visibility:hidden;">' +
                                                        '  <div class ="white-panel pn donut-chart" style="visibility:hidden;">' +
                                                                '    <div class ="white-header">' +
                                                                        '<h5 style="color:#000000;font-weight:bold;">Input Image</h5>' +
                                                                        '<span style="color:#555555;font-weight:bold;">Select from your Image Bucket: </span>' + '    </div>' +
                                                                    ' <div class ="row">' +
                                                        '  <div class ="col-sm-6 col-xs-6 goleft">' +
                                                                '  <p style="color:#000000;font-weight:bold;"></p>' +
                                                        '  </div>' +
                                                '  </div>' +
                                                '  <div class ="centered">' +
                                                        ' <img  src="" width="100%" height="80%"><!--CHANGE IN THIS LINE-->' +
                                                '    </div>' +
                                            '   </div><! --/grey-panel-->' +
                                    '  </div><!-- /col-md-4-->' +






                                    '  <div class ="col-md-4 col-sm-4 mb">' +
                                                '<div class ="white-panel pn">' +
                                                        '<div class ="white-header" style="background-color:#C0CDDC;">' +
                                                                    ' <h5 style="color:#000000;font-weight:bold;" >Image Masking</h5>                                             <!-- CHANGE IN THIS LINE -->' +
                                                                    '<span style="color:#000000;font-weight:bold;">' +
                                                                   '<form action="" method="POST" class="design_pipelines_imgMasking_form">                                             <!--CHANGE IN THIS LINE--> ' +
                                                                                    'Input Stream:' +
                                                                                    ' <select  class="moduleName" name="image_location">' +
                                                                                     '     <option value="static/assets/img_outputs/pipelines/stream1.png" selected>Pipeline Stream #1</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream2.png" >Pipeline Stream #2</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream3.png" >Pipeline Stream #3</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream4.png" >Pipeline Stream #4</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream5.png" >Pipeline Stream #5</option>' +
                                                                                      '    <option value="static/img/1.jpg" >Plant Leaf</option>' +
                                                                                      '    <option value="static/img/2.jpg">Plant Top Down View</option>' +
                                                                                      '    <option value="static/img/plant_sideview.png">Plant Side View</option>' +
                                                                                    '</select>' +
                                                                                    '<br/>Output Stream:' +
                                                                                   ' <select  class="design_pipelines_imgMasking_imgBucket_output_select streamSelector" name="img_output_location">' +
                                                                                     '     <option value="static/assets/img_outputs/pipelines/stream1.png" selected>Pipeline Stream #1</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream2.png" >Pipeline Stream #2</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream3.png" >Pipeline Stream #3</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream4.png" >Pipeline Stream #4</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream5.png" >Pipeline Stream #5</option>' +
                                                                                    ' <option value="static/assets/img_outputs/output.png">Old</option>' +
                                                                                    '</select><hr/>' +

                                                                                  'Masking Image:' +

                                                                                  '  <select  name="mask_img">' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream1.png" selected>Pipeline Stream #1</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream2.png" >Pipeline Stream #2</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream3.png" >Pipeline Stream #3</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream4.png" >Pipeline Stream #4</option>' +
                                                                                    '     <option value="static/assets/img_outputs/pipelines/stream5.png" >Pipeline Stream #5</option>' +
                                                                                      '    <option value="static/img/1.jpg" >Plant Leaf</option>' +
                                                                                      '    <option value="static/img/2.jpg">Plant Top Down View</option>' +
                                                                                      '    <option value="static/img/plant_sideview.png">Plant Side View</option>' +
                                                                                   ' </select><br/>' +

                                                                                  ' Select Mask Color:  ' +

                                                                                   ' <select  name="mask_color"><!-- CHANGE IN THIS LINE -->' +
                                                                                    '      <option value="white" selected>White Masking</option>' +
                                                                                     '     <option value="black" >Black Masking</option>' +
                            
                                                                                   ' </select>' +



                                                                    '</form>' +
                                                                    '<br/>' +
                                                                    '<button type="button"   style="float:right;margin-right:20px;margin-top:10px;" class="design_pipelines_imgMasking_btn">Run</button></span>       <!-- CHANGE IN THIS LINE -->' +
                                                            '</div>' +
                                                            '<div class ="row">' +
                                                                    '<div class ="col-sm-6 col-xs-6 goleft">' +
                                                                            '   <p> </p>' +
                                                                    '</div>' +
                                                                    ' <div class ="col-sm-6 col-xs-6"></div>' +
                                                            '</div>' +
                                                            '<div class ="centered" > <!--CHANGE IN THIS LINE-->' +
                                                                    '<span style="color:#000000;font-weight:bold;font-size:20px;margin-top:40px;">Status: Ready</span>' +
                                                            '</div>' +
                                                     '</div>' +

                                            '    </div><!-- /col-md-4 -->' +









                                '  <div class ="col-md-4 mb" style="visibility:hidden;">' +
                                            '<div class ="white-panel pn">' +
                                                    '<div class ="white-header">' +
                                                        '<h5 style="color:#000000;font-weight:bold;">Processed Image</h5>' +
                                                    '</div>' +
                                                    ' <div class ="row">' +
                                                            '<div class ="col-sm-6 col-xs-6 goleft">' +
                                                                    '<p> </p>' +
                                                            '</div>' +
                                                                    '<div class ="col-sm-6 col-xs-6"></div>' +
                                                    '</div>' +
                                                    '<div class ="centered">' +
                                                            '<img src="" width="100%" height="80%" > <!--CHANGE IN THIS LINE-->' +
                                                    '</div>' +
                                            '</div>' +
                                        '</div><!-- /col-md-4 -->' +
                                        '<br/>' +
                                        '<!-- CHANGE IN THIS LINE -->' +
                                '</div><!-- /row-->'


                   );








});

//=====================================================================================================
//design_pipelines_imgMasking --- ENDS ----
//=====================================================================================================






});


