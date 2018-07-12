$(document).ready(function () {
    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });


//==========================================================================
//============= NOISE REMOVAL STARTS ==============================================
//==========================================================================

//source code in pre tag... toggle show/hide
$(".code_show_hide").live('click', function () {
    $(this).siblings('.pre_highlighted_code').children(".highlighted_code").toggle(1000);
});

$(".documentation_show_hide").live('click', function () {
    $(this).siblings('.documentation').toggle(300);
});

$(".settings_show_hide").live('click', function () {
    $(this).siblings('.settings').toggle(300);
});

$(".btn_edit_code").live('click',function () {
    $(this).siblings('.edit_code').toggle(1000);
});

$(".setting_param").live('change',function () {
    //alert("you changed my value");
    //var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
    //alert(prev_code);
    //$(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val(prev_code + "\n" + $(this).val());
    $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val('');
    $(this).siblings(".setting_param").each(function () {
        //alert($(this).val());
        var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
        $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val(prev_code + "\n" + $(this).val());
    });
    var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
    $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val(prev_code + "\n" + $(this).val());
});

$("#run_pipeline").click(function () {
    $("#pr_status").html("Running Pipeline...");

    var sourceCode = '' 
    $('textarea').each(
        function () {
            //alert($(this).val());
            sourceCode = sourceCode + $(this).val();
        }
    );

    //encode the source code for any special characters like '+' , '/' etc
    sourceCode = encodeURIComponent(String(sourceCode));

    //alert(sourceCode);

    //send the code for running in pythoncom
    $.ajax({
        type: "POST",
        cache: false,
        url: "/pythoncom/",
        data: 'textarea_source_code=' + sourceCode,
        success: function (option) {
            alert(option);
            $("#pr_status").html("Pipeline Completed Running Successfully.");
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
            $("#pr_status").html("Pipeline Running Failed!!!");
        }

    });




});


$("#save_pipeline").click(function () {
    var pipelineName = $("#save_pipeline_name").val();

    //alert(pipelineName);

    var sourceCode = ''
    $('textarea').each(
        function () {
            //alert($(this).val());
            sourceCode = sourceCode + $(this).val();
        }
    );

    //encode the source code for any special characters like '+' , '/' etc
    sourceCode = encodeURIComponent(String(sourceCode));


    //alert(sourceCode);

    $.ajax({
        type: "POST",
        cache: false,
        url: "/save_pipeline/",
        data: 'textarea_source_code=' + sourceCode + '&pipelineName='+pipelineName,
        success: function (option) {
            alert('Piepline Saved Successfully...');
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });




});

$(".design_pipeline_menu").click(function () {
    alert($(this).attr('title'));
});

$("#design_pipelines_menu_rgb2gray_id").click(function () {
    var module_name = ''
    var documentation = ''
    var moduleSourceCode_settings = ''
    var moduleSourceCode_main = ''
    var moduleSourceCode_html = ''

    $.ajax({
        type: "POST",
        cache: false,
        url: "/get_module_details",
        data: 'p_module_key=' + 'rgb2gray',
        success: function (option) {
            
            module_name = option.module_name
            documentation = option.documentation
            moduleSourceCode_settings = option.moduleSourceCode_settings
            moduleSourceCode_main = option.moduleSourceCode_main
            moduleSourceCode_html = option.moduleSourceCode_html
            user_role = option.user_role

            user_role_based_edit = ''
            if (user_role == 'image_researcher') {
                user_role_based_edit = '| <a style="font-size:12px;color:#000000;" href="#" class="btn_edit_code"> Edit </a> | <a style="font-size:12px;color:#000000;" href="#" > Contact Author </a>';
            }




            //append new module to the pipeline...
            $("#img_processing_screen").append(
                '<div style="background-color:#FFFFFF;width:100%">' +

            '<!-- Documentation -->' +
            '<div style="margin:10px;font-size:17px;color:#000000;">' +
              ' ' + module_name + '<hr/>' +
               ' Documentation: <a style="font-size:12px;color:#000000;" href="#" class="documentation_show_hide">(Show/Hide)</a>' +
                '<div class="documentation" style="background-color:#888888;display:none;font-size:14px;">' + documentation +'</div>' +
            '</div>' +


            '<!-- Settings -->' +
            '<div style="margin:10px;font-size:17px;color:#000000;">' +
             '   Settings: <a style="font-size:12px;color:#000000;" href="#" class="settings_show_hide">(Show/Hide)</a>' +
             '   <div class="settings" style="background-color:#888888;display:none;font-size:14px;">' + moduleSourceCode_html + '</div>' +
            '</div>' +


            '<div style="margin:10px;font-size:17px;color:#000000;" class="setting_section">' +
            '    Source Code: <a style="font-size:12px;color:#000000;" href="#" class="code_show_hide">(Show/Hide)</a>'+ user_role_based_edit +

             '   <div class="edit_code" style="background-color:#888888;display:none;font-size:14px;">' +
              '          <textarea rows=7 cols=180 class="code_settings">' + moduleSourceCode_settings + '</textarea>' +
               '         <p style="color:#000000;">Main Implementation: </p>' +
                '        <textarea rows=10 cols=180>' + moduleSourceCode_main + '</textarea>' +
                '</div>' +

               ' <pre style="background-color:#333333;width:100%;" class="pre_highlighted_code">' + '<code class="python highlighted_code" style="display:none;">' + moduleSourceCode_settings + 
               ' ' +
            moduleSourceCode_main + '</code></pre>' +

           ' </div>' +

            '</div>'


        );//end of append


            $('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
            });


        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });//end of ajax





});






    //bio test starts
$("#design_pipelines_menu_biodatacleaning_id").click(function () {
    var module_name = ''
    var documentation = ''
    var moduleSourceCode_settings = ''
    var moduleSourceCode_main = ''
    var moduleSourceCode_html = ''

    $.ajax({
        type: "POST",
        cache: false,
        url: "/get_module_details",
        data: 'p_module_key=' + 'biodatacleaning',
        success: function (option) {

            module_name = option.module_name
            documentation = option.documentation
            moduleSourceCode_settings = option.moduleSourceCode_settings
            moduleSourceCode_main = option.moduleSourceCode_main
            moduleSourceCode_html = option.moduleSourceCode_html
            user_role = option.user_role

            user_role_based_edit = ''
            if (user_role == 'image_researcher') {
                user_role_based_edit = '| <a style="font-size:12px;color:#000000;" href="#" class="btn_edit_code"> Edit </a> | <a style="font-size:12px;color:#000000;" href="#" > Contact Author </a>';
            }




            //append new module to the pipeline...
            $("#img_processing_screen").append(
                '<div style="background-color:#FFFFFF;width:100%">' +

            '<!-- Documentation -->' +
            '<div style="margin:10px;font-size:17px;color:#000000;">' +
              ' ' + module_name + '<hr/>' +
               ' Documentation: <a style="font-size:12px;color:#000000;" href="#" class="documentation_show_hide">(Show/Hide)</a>' +
                '<div class="documentation" style="background-color:#888888;display:none;font-size:14px;">' + documentation + '</div>' +
            '</div>' +


            '<!-- Settings -->' +
            '<div style="margin:10px;font-size:17px;color:#000000;">' +
             '   Settings: <a style="font-size:12px;color:#000000;" href="#" class="settings_show_hide">(Show/Hide)</a>' +
             '   <div class="settings" style="background-color:#888888;display:none;font-size:14px;">' + moduleSourceCode_html + '</div>' +
            '</div>' +


            '<div style="margin:10px;font-size:17px;color:#000000;" class="setting_section">' +
            '    Source Code: <a style="font-size:12px;color:#000000;" href="#" class="code_show_hide">(Show/Hide)</a>' + user_role_based_edit +

             '   <div class="edit_code" style="background-color:#888888;display:none;font-size:14px;">' +
              '          <textarea rows=7 cols=180 class="code_settings">' + moduleSourceCode_settings + '</textarea>' +
               '         <p style="color:#000000;">Main Implementation: </p>' +
                '        <textarea rows=10 cols=180>' + moduleSourceCode_main + '</textarea>' +
                '</div>' +

               ' <pre style="background-color:#333333;width:100%;" class="pre_highlighted_code">' + '<code class="python highlighted_code" style="display:none;">' + moduleSourceCode_settings +
               ' ' +
            moduleSourceCode_main + '</code></pre>' +

           ' </div>' +

            '</div>'


        );//end of append


            $('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
            });


        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });//end of ajax





});



$("#design_pipelines_menu_biocalc_id").click(function () {
    var module_name = ''
    var documentation = ''
    var moduleSourceCode_settings = ''
    var moduleSourceCode_main = ''
    var moduleSourceCode_html = ''

    $.ajax({
        type: "POST",
        cache: false,
        url: "/get_module_details",
        data: 'p_module_key=' + 'biocalc',
        success: function (option) {

            module_name = option.module_name
            documentation = option.documentation
            moduleSourceCode_settings = option.moduleSourceCode_settings
            moduleSourceCode_main = option.moduleSourceCode_main
            moduleSourceCode_html = option.moduleSourceCode_html
            user_role = option.user_role

            user_role_based_edit = ''
            if (user_role == 'image_researcher') {
                user_role_based_edit = '| <a style="font-size:12px;color:#000000;" href="#" class="btn_edit_code"> Edit </a>';
            }




            //append new module to the pipeline...
            $("#img_processing_screen").append(
                '<div style="background-color:#FFFFFF;width:100%">' +

            '<!-- Documentation -->' +
            '<div style="margin:10px;font-size:17px;color:#000000;">' +
              ' ' + module_name + '<hr/>' +
               ' Documentation: <a style="font-size:12px;color:#000000;" href="#" class="documentation_show_hide">(Show/Hide)</a>' +
                '<div class="documentation" style="background-color:#888888;display:none;font-size:14px;">' + documentation + '</div>' +
            '</div>' +


            '<!-- Settings -->' +
            '<div style="margin:10px;font-size:17px;color:#000000;">' +
             '   Settings: <a style="font-size:12px;color:#000000;" href="#" class="settings_show_hide">(Show/Hide)</a>' +
             '   <div class="settings" style="background-color:#888888;display:none;font-size:14px;">' + moduleSourceCode_html + '</div>' +
            '</div>' +


            '<div style="margin:10px;font-size:17px;color:#000000;" class="setting_section">' +
            '    Source Code: <a style="font-size:12px;color:#000000;" href="#" class="code_show_hide">(Show/Hide)</a>' + user_role_based_edit +

             '   <div class="edit_code" style="background-color:#888888;display:none;font-size:14px;">' +
              '          <textarea rows=7 cols=180 class="code_settings">' + moduleSourceCode_settings + '</textarea>' +
               '         <p style="color:#000000;">Main Implementation: </p>' +
                '        <textarea rows=10 cols=180>' + moduleSourceCode_main + '</textarea>' +
                '</div>' +

               ' <pre style="background-color:#333333;width:100%;" class="pre_highlighted_code">' + '<code class="python highlighted_code" style="display:none;">' + moduleSourceCode_settings +
               ' ' +
            moduleSourceCode_main + '</code></pre>' +

           ' </div>' +

            '</div>'


        );//end of append


            $('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
            });


        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });//end of ajax





});






    //bio test ends







//Signup
$('#signup_btn').click(function () {
    //alert("Looks like you want to create an account...");
    $.ajax({
        type: "POST",
        cache: false,
        url: "/p2irc_signup/",
        data: $("#signup_form").serialize(),
        success: function (option) {
            alert('Account Created Successfully...');
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
        }

    });
});

});