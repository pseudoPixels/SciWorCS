$(document).ready(function(){










$(document).on("click", ".vizPlugin" ,function(){
    var vizPluginName = $(this).attr("id"); //'biodatacleaning';
    //alert(vizPluginName);

    //addNewVizTool(1, vizPluginName);




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

                var tool_documentation = $xml_tool_definition.find("toolDocumentation");
                tool_documentation = tool_documentation.html();

                var $toolInput = $xml_tool_definition.find("toolInput");

                var $toolOutput = $xml_tool_definition.find("toolOutput");


                alert(toolOutput);

             },
             error: function (xhr, status, error) {
                    alert(xhr.responseText);
             }

        });//end of ajax


}

























});