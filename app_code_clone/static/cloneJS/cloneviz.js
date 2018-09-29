$(document).ready(function(){










$(document).on("click", ".vizPlugin" ,function(){
    var vizPluginName = $(this).attr("id"); //'biodatacleaning';
    //alert(vizPluginName);

    addNewVizTool(1, vizPluginName);



/*
      //append new module to the pipeline...
                $("#cloneVizPlugin").append(
                    '<div style="background-color:#DDD;width:100%;" class="module" id="module_id_'+ 'moduleID' +'">' +

                '<!-- Documentation -->' +
                '<div style="margin:10px;font-size:17px;color:#000000;">' +
                  ' ' + 'Clone Feature Distribution' + '<hr/>' +
                   ' Documentation: <a style="font-size:12px;color:#000000;" href="#" class="documentation_show_hide">(Show/Hide)</a>' +
                    '<div class="documentation" style="background-color:#DDDDDD;display:none;font-size:14px;">' + 'tool_documentation' + '</div>' +
                '</div>' +


                '<!-- Settings -->' +
                '<div style="margin:10px;font-size:17px;color:#000000;">' +
                 '   Settings: <a style="font-size:12px;color:#000000;" href="#" class="settings_show_hide">(Show/Hide)</a>' +
                '</div>' +

                '</div>'


            );//end of append

*/


});








//adds the module to the pipeline. moduleID is unique throughout the whole pipeline
//moduleName is the name of the module like: rgb2gray, medianFilter and so on
function addNewVizTool(moduleID, moduleName){

        var module_name = ''
        var documentation = ''
        var moduleSourceCode_settings = ''
        var moduleSourceCode_main = ''
        var moduleSourceCode_html = ''

        $.ajax({
            type: "POST",
            cache: false,
            url: "/get_viz_plugin_details",
            data: 'p_module_key=' + moduleName,
            success: function (option) {
                //alert("@ success");
                module_name = option.module_name
                documentation = option.documentation
                moduleSourceCode_settings = option.moduleSourceCode_settings
                moduleSourceCode_main = option.moduleSourceCode_main
                moduleSourceCode_html = option.moduleSourceCode_html


                //Parse the givn XML for tool definition
                var xmlDoc = $.parseXML( moduleSourceCode_html );
                var $xml_tool_definition = $(xmlDoc);

                //the tool configuration.
                //TODO: add the input port info.
                var tool_configs = $xml_tool_definition.find("toolConfigurations");
                tool_configs = tool_configs.html();


                var ioInformation = '';

                var $toolInput = $xml_tool_definition.find("toolInput");

                $toolInput.each(function(){

                    var label = $(this).find('label').text(),
                        dataFormat = $(this).find('dataFormat').text(),
                        referenceVariable = $(this).find('referenceVariable').text();

                        ioInformation +=  '<input type="text" class="setting_param module_input '+ referenceVariable + '" ' + ' size="45"/>';


                });


                var $toolOutput = $xml_tool_definition.find("toolOutput");

                $toolOutput.each(function(){

                    var label = $(this).find('label').text(),
                        dataFormat = $(this).find('dataFormat').text(),
                        referenceVariable = $(this).find('referenceVariable').text();

                    //var thisPortOutput = 'module_id_' + moduleID + '_' + referenceVariable+'.' + dataFormat;
                    //var thisPortOutputPath = referenceVariable + '="' + thisPortOutput + '"';

                    ioInformation += '<input type="text" class="setting_param module_output '+ referenceVariable + '" size="45"/>';


                });






                //append new module to the pipeline...
                $("#cloneVizPlugin").append(
                    '<div style="background-color:#EEE;width:100%;" class="module" id="module_id_'+ '0' +'">' +

                    '<!-- Documentation -->' +
                    '<div style="margin:10px;font-size:17px;color:#000000;">' +
                      ' ' + module_name +  ' (Module )'+ '<hr/>' +
                    '</div>' +


                    '<!-- Settings -->' +
                    '<div style="margin:10px;font-size:17px;color:#000000;">' +
                     '   Settings: <a style="font-size:12px;color:#000000;" href="#" class="settings_show_hide">(Show/Hide)</a>' +
                     '   <div class="settings" style="background-color:#DDDDDD;font-size:14px;">' + tool_configs + '<br/>' + ioInformation +
                            '<input type="hidden" class="setting_param " size="45" id="module_id_'+ '0' +'_output_destination" />' +
                        '</div>' +
                    '</div>' +


                    '<div style="margin:10px;font-size:17px;color:#000000;" class="setting_section">' +
                    '    <a style="display:none;font-size:12px;color:#000000;" href="#" class="code_show_hide">(Show/Hide)</a>' +

                     '   <div class="edit_code" style="background-color:#888888;font-size:14px;">' +
                      '          <textarea rows=7 cols=150 class="code_settings">' + moduleSourceCode_settings + '</textarea>' +
                       '         <p style="color:#000000;">Main Implementation: </p>' +
                        '        <textarea rows=10 cols=150>' + moduleSourceCode_main + '</textarea>' +
                        '</div>' +

                       ' <pre style="background-color:#333333;width:100%;" class="pre_highlighted_code">' + '<code class="python highlighted_code" >' + moduleSourceCode_settings +
                       ' ' +
                    moduleSourceCode_main + '</code></pre>' +

                   ' </div>' +

                    '</div>'


                );//end of append


                $("#module_id_"+ '0' + "_output_destination").val("output_destination = '/home/ubuntu/Webpage/app_collaborative_sci_workflow/workflow_outputs/test_workflow/Module_" + moduleID + "'").trigger('change');









             },
             error: function (xhr, status, error) {
                    alert(xhr.responseText);
             }

        });//end of ajax


}







$(document).on('change', ".setting_param" ,function () {//here
    //alert("you changed my value");
    //var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
    //alert(prev_code);
    //$(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val(prev_code + "\n" + $(this).val());
    $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val('');
    $(this).siblings(".setting_param").each(function () {
        //alert($(this).val());
        var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
        $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val("\n"+prev_code + "\n\n" + $(this).val());
    });
    var prev_code = $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val();
    $(this).parent().parent().siblings(".setting_section").children(".edit_code").find(".code_settings").val("\n"+prev_code + "\n\n" + $(this).val());



});

















});